/**
 * ShaderParameterSurface — Premium Module 1
 * Exposes hardcoded shader values as controllable parameters.
 * Intercepts uniform setting to inject premium shader parameters.
 *
 * @module @vib3code/premium/ShaderParameterSurface
 */

const SHADER_PARAM_SCHEMA = {
    projectionType: { type: 'integer', min: 0, max: 2, default: 0, description: 'Projection mode: 0=perspective, 1=stereographic, 2=orthographic' },
    uvScale: { type: 'number', min: 1.0, max: 8.0, default: 3.0, description: 'UV space zoom scale' },
    lineThickness: { type: 'number', min: 0.005, max: 0.15, default: 0.03, description: 'Wireframe line thickness' },
    noiseFrequency: { type: 'array', length: 3, min: 1, max: 50, default: [7, 11, 13], description: 'Chaos noise frequency triple' },
    breathStrength: { type: 'number', min: 0, max: 1, default: 0.3, description: 'Breath modulation strength' },
    autoRotationSpeed: { type: 'array', length: 6, min: 0, max: 0.5, default: [0.1, 0.12, 0.08, 0.2, 0.15, 0.25], description: 'Auto-rotation speeds [XY,XZ,YZ,XW,YW,ZW]' },
    particleSize: { type: 'number', min: 0.02, max: 0.5, default: 0.2, description: 'Quantum particle dot size' },
    layerAlpha: { type: 'object', default: { background: 0.6, shadow: 0.4, content: 1.0, highlight: 0.8, accent: 0.3 }, description: 'Per-layer alpha' }
};

export class ShaderParameterSurface {
    /**
     * @param {import('../core/VIB3Engine.js').VIB3Engine} engine
     */
    constructor(engine) {
        this._engine = engine;
        this._params = {};
        this._unsubscribe = null;

        // Initialize defaults
        for (const [key, schema] of Object.entries(SHADER_PARAM_SCHEMA)) {
            this._params[key] = Array.isArray(schema.default) ? [...schema.default]
                : typeof schema.default === 'object' ? { ...schema.default }
                : schema.default;
        }
    }

    /**
     * Set a single shader parameter.
     * @param {string} name
     * @param {number|number[]|object} value
     */
    setParameter(name, value) {
        const schema = SHADER_PARAM_SCHEMA[name];
        if (!schema) {
            throw new Error(`Unknown shader parameter: ${name}`);
        }
        this._validate(name, value, schema);
        this._params[name] = value;
        this._pushToEngine();
    }

    /**
     * Get a shader parameter value.
     * @param {string} name
     * @returns {number|number[]|object}
     */
    getParameter(name) {
        const val = this._params[name];
        if (val === undefined) throw new Error(`Unknown shader parameter: ${name}`);
        if (Array.isArray(val)) return [...val];
        if (typeof val === 'object' && val !== null) return { ...val };
        return val;
    }

    /**
     * Batch-set multiple shader parameters.
     * @param {object} params
     */
    setParameters(params) {
        for (const [key, value] of Object.entries(params)) {
            const schema = SHADER_PARAM_SCHEMA[key];
            if (schema) {
                this._validate(key, value, schema);
                this._params[key] = value;
            }
        }
        this._pushToEngine();
    }

    /**
     * Reset all shader parameters to defaults.
     */
    reset() {
        for (const [key, schema] of Object.entries(SHADER_PARAM_SCHEMA)) {
            this._params[key] = Array.isArray(schema.default) ? [...schema.default]
                : typeof schema.default === 'object' ? { ...schema.default }
                : schema.default;
        }
        this._pushToEngine();
    }

    /**
     * Get the JSON Schema for all shader parameters.
     * @returns {object}
     */
    getParameterSchema() {
        const properties = {};
        for (const [key, schema] of Object.entries(SHADER_PARAM_SCHEMA)) {
            if (schema.type === 'array') {
                properties[key] = {
                    type: 'array',
                    items: { type: 'number', minimum: schema.min, maximum: schema.max },
                    minItems: schema.length,
                    maxItems: schema.length,
                    description: schema.description
                };
            } else if (schema.type === 'object') {
                properties[key] = { type: 'object', description: schema.description };
            } else {
                properties[key] = {
                    type: schema.type,
                    minimum: schema.min,
                    maximum: schema.max,
                    description: schema.description
                };
            }
        }
        return { type: 'object', properties };
    }

    /**
     * Get all current parameter values.
     * @returns {object}
     */
    getAllParameters() {
        const result = {};
        for (const [key, val] of Object.entries(this._params)) {
            result[key] = Array.isArray(val) ? [...val]
                : typeof val === 'object' && val !== null ? { ...val }
                : val;
        }
        return result;
    }

    /** Push shader parameters to the engine as extended uniform hints */
    _pushToEngine() {
        if (!this._engine || !this._engine.activeSystem) return;

        // Store shader surface params on the engine for systems to read
        this._engine._shaderSurfaceParams = { ...this._params };

        // Force parameter update to propagate
        this._engine.updateCurrentSystemParameters();
    }

    /** Validate a parameter value against its schema */
    _validate(name, value, schema) {
        if (schema.type === 'number' || schema.type === 'integer') {
            if (typeof value !== 'number' || !Number.isFinite(value)) {
                throw new Error(`${name} must be a finite number`);
            }
            if (value < schema.min || value > schema.max) {
                throw new Error(`${name} must be between ${schema.min} and ${schema.max}`);
            }
        } else if (schema.type === 'array') {
            if (!Array.isArray(value) || value.length !== schema.length) {
                throw new Error(`${name} must be an array of length ${schema.length}`);
            }
            for (const v of value) {
                if (typeof v !== 'number' || v < schema.min || v > schema.max) {
                    throw new Error(`${name} array values must be between ${schema.min} and ${schema.max}`);
                }
            }
        } else if (schema.type === 'object') {
            if (typeof value !== 'object' || value === null || Array.isArray(value)) {
                throw new Error(`${name} must be an object`);
            }
        }
    }

    destroy() {
        if (this._unsubscribe) {
            this._unsubscribe();
            this._unsubscribe = null;
        }
        if (this._engine) {
            delete this._engine._shaderSurfaceParams;
        }
        this._engine = null;
    }
}
