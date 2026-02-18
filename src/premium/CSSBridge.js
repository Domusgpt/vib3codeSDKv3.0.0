/**
 * CSSBridge — Premium Module 5
 * Live bidirectional binding between VIB3+ parameters and CSS custom properties.
 * Engine state drives CSS vars; CSS animations can drive engine parameters.
 *
 * @module @vib3code/premium/CSSBridge
 */

/** Parameter ranges for normalization */
const PARAM_RANGES = {
    hue: { min: 0, max: 360 },
    saturation: { min: 0, max: 1 },
    intensity: { min: 0, max: 1 },
    chaos: { min: 0, max: 1 },
    speed: { min: 0.1, max: 3 },
    gridDensity: { min: 4, max: 100 },
    morphFactor: { min: 0, max: 2 },
    dimension: { min: 3.0, max: 4.5 },
    geometry: { min: 0, max: 23 },
    rot4dXY: { min: -6.28, max: 6.28 },
    rot4dXZ: { min: -6.28, max: 6.28 },
    rot4dYZ: { min: -6.28, max: 6.28 },
    rot4dXW: { min: -2, max: 2 },
    rot4dYW: { min: -2, max: 2 },
    rot4dZW: { min: -2, max: 2 },
};

const ALL_PARAMS = Object.keys(PARAM_RANGES);

export class CSSBridge {
    /**
     * @param {import('../core/VIB3Engine.js').VIB3Engine} engine
     */
    constructor(engine) {
        this._engine = engine;
        this._active = false;
        this._options = null;
        this._unsubscribe = null;
        this._rafId = null;
        this._lastInbound = {};
        this._lastOutboundTime = 0;
    }

    /**
     * Start the CSS bridge.
     * @param {object} [options]
     * @param {HTMLElement} [options.target=document.documentElement]
     * @param {string} [options.prefix='vib3']
     * @param {boolean} [options.outbound=true] - Engine → CSS
     * @param {boolean} [options.inbound=false] - CSS → Engine
     * @param {number} [options.throttle=16] - ms throttle (~60fps)
     * @param {string[]} [options.parameters] - Which params to bridge (default: all)
     * @param {string[]} [options.inboundParameters] - Which CSS vars to watch inbound
     * @param {boolean} [options.normalize=true] - Normalize to 0-1 for CSS
     */
    start(options = {}) {
        if (this._active) this.stop();

        this._options = {
            target: options.target || (typeof document !== 'undefined' ? document.documentElement : null),
            prefix: options.prefix || 'vib3',
            outbound: options.outbound !== false,
            inbound: options.inbound || false,
            throttle: options.throttle ?? 16,
            parameters: options.parameters || ALL_PARAMS,
            inboundParameters: options.inboundParameters || [],
            normalize: options.normalize !== false,
        };

        this._active = true;

        // Outbound: engine → CSS
        if (this._options.outbound) {
            this._unsubscribe = this._engine.onParameterChange((params) => {
                const now = Date.now();
                if (now - this._lastOutboundTime < this._options.throttle) return;
                this._lastOutboundTime = now;
                this._pushToCSS(params);
            });

            // Push initial state
            this._pushToCSS(this._engine.getAllParameters());
        }

        // Inbound: CSS → engine
        if (this._options.inbound && this._options.inboundParameters.length > 0) {
            this._startInboundPolling();
        }
    }

    /**
     * Stop the bridge.
     */
    stop() {
        this._active = false;
        if (this._unsubscribe) {
            this._unsubscribe();
            this._unsubscribe = null;
        }
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    }

    /**
     * Manually push a parameter value to CSS.
     * @param {string} name
     * @param {number} value
     */
    pushToCSS(name, value) {
        if (!this._options?.target) return;
        const cssName = `--${this._options.prefix}-${this._kebabCase(name)}`;
        if (this._options.normalize && PARAM_RANGES[name]) {
            const { min, max } = PARAM_RANGES[name];
            const normalized = (value - min) / (max - min);
            this._options.target.style.setProperty(cssName, normalized.toString());
            this._options.target.style.setProperty(`${cssName}-raw`, value.toString());
        } else {
            this._options.target.style.setProperty(cssName, value.toString());
        }
    }

    /**
     * Manually read a CSS custom property and push to engine.
     * @param {string} name
     * @returns {number}
     */
    pullFromCSS(name) {
        if (!this._options?.target) return 0;
        const cssName = `--${this._options.prefix}-input-${this._kebabCase(name)}`;
        const raw = getComputedStyle(this._options.target).getPropertyValue(cssName);
        const value = parseFloat(raw);
        if (!isNaN(value)) {
            const denormalized = this._denormalize(name, value);
            this._engine.setParameter(name, denormalized);
            return denormalized;
        }
        return 0;
    }

    /**
     * Check if the bridge is active.
     * @returns {boolean}
     */
    isActive() {
        return this._active;
    }

    /**
     * Get current bridge options.
     * @returns {object|null}
     */
    getOptions() {
        return this._options ? { ...this._options } : null;
    }

    /** Push all parameter values to CSS */
    _pushToCSS(params) {
        if (!this._options?.target) return;
        const target = this._options.target;
        const prefix = this._options.prefix;
        const normalize = this._options.normalize;

        for (const param of this._options.parameters) {
            const value = params[param];
            if (value === undefined || typeof value !== 'number') continue;

            const cssName = `--${prefix}-${this._kebabCase(param)}`;

            if (normalize && PARAM_RANGES[param]) {
                const { min, max } = PARAM_RANGES[param];
                const normalized = (value - min) / (max - min);
                target.style.setProperty(cssName, normalized.toString());
                target.style.setProperty(`${cssName}-raw`, value.toString());
            } else {
                target.style.setProperty(cssName, value.toString());
            }
        }
    }

    /** Poll CSS custom properties for inbound values */
    _startInboundPolling() {
        const poll = () => {
            if (!this._active || !this._options?.target) return;

            for (const param of this._options.inboundParameters) {
                const cssName = `--${this._options.prefix}-input-${this._kebabCase(param)}`;
                const raw = getComputedStyle(this._options.target).getPropertyValue(cssName);
                const value = parseFloat(raw);
                if (!isNaN(value) && value !== this._lastInbound[param]) {
                    this._lastInbound[param] = value;
                    const denormalized = this._denormalize(param, value);
                    this._engine.setParameter(param, denormalized);
                }
            }

            this._rafId = requestAnimationFrame(poll);
        };
        this._rafId = requestAnimationFrame(poll);
    }

    /** Convert camelCase to kebab-case */
    _kebabCase(str) {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
            .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
            .toLowerCase();
    }

    /** Denormalize a 0-1 value back to the parameter's original range */
    _denormalize(name, value) {
        const range = PARAM_RANGES[name];
        if (range) {
            return range.min + value * (range.max - range.min);
        }
        return value;
    }

    destroy() {
        this.stop();
        this._engine = null;
        this._options = null;
        this._lastInbound = {};
    }
}
