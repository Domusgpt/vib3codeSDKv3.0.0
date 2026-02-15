/**
 * LayerReactivityBridge — Connect audio/tilt/input reactivity to layer relationship modulation
 *
 * Instead of reactivity inputs only affecting the keystone parameters (which all layers see),
 * this bridge lets reactivity inputs *modulate the relationship configurations themselves*.
 *
 * For example:
 *   - Audio bass can increase the `gain` on reactive relationships (layers react more to beats)
 *   - Device tilt can shift the `hueAngle` on harmonic relationships (tilt changes color harmony)
 *   - Click intensity can spike the `lerpRate` on chase relationships (layers snap to attention)
 *
 * This creates a second level of dynamics: the relationships between layers change in real-time
 * based on user input, not just the parameters themselves.
 *
 * Usage:
 *   const bridge = new LayerReactivityBridge(graph, presetManager);
 *   bridge.addModulation('audio', 'bass', 'shadow', 'gain', { scale: 2.0, baseline: 1.5 });
 *   bridge.addModulation('tilt', 'gamma', 'highlight', 'hueAngle', { scale: 50, baseline: 137.508 });
 *   bridge.update({ audio: { bass: 0.8, mid: 0.3 }, tilt: { gamma: 15 } });
 *
 * Pre-built profiles:
 *   bridge.loadModulationProfile('audioStorm');
 *   bridge.loadModulationProfile('tiltHarmonic');
 */

import { PRESET_REGISTRY } from './LayerRelationshipGraph.js';

/**
 * @typedef {object} ModulationMapping
 * @property {string} source - Input source category ('audio', 'tilt', 'mouse', 'click', 'custom')
 * @property {string} channel - Input channel within source ('bass', 'mid', 'high', 'alpha', 'beta', 'gamma', 'x', 'y')
 * @property {string} layerName - Target layer to modulate
 * @property {string} configKey - Relationship config key to modulate ('opacity', 'gain', 'hueAngle', 'lerpRate', etc.)
 * @property {number} scale - How much the input affects the config value
 * @property {number} baseline - Default value when input is 0
 * @property {number} [min] - Clamp minimum
 * @property {number} [max] - Clamp maximum
 * @property {string} [mode='add'] - 'add' (baseline + input*scale) or 'multiply' (baseline * (1 + input*scale))
 */

/**
 * Pre-built modulation profiles that configure multiple mappings at once.
 */
const MODULATION_PROFILES = {
    /** Audio drives reactive gain and chase speed across all layers */
    audioStorm: [
        { source: 'audio', channel: 'bass', layerName: 'background', configKey: 'gain', scale: 3.0, baseline: 1.5, min: 0.5, max: 8.0, mode: 'add' },
        { source: 'audio', channel: 'bass', layerName: 'shadow', configKey: 'gain', scale: 4.0, baseline: 2.0, min: 0.5, max: 10.0, mode: 'add' },
        { source: 'audio', channel: 'mid', layerName: 'highlight', configKey: 'gain', scale: 3.0, baseline: 3.0, min: 1.0, max: 8.0, mode: 'add' },
        { source: 'audio', channel: 'high', layerName: 'accent', configKey: 'gain', scale: 5.0, baseline: 4.0, min: 1.0, max: 12.0, mode: 'add' },
        { source: 'audio', channel: 'bass', layerName: 'accent', configKey: 'opacity', scale: 0.4, baseline: 0.3, min: 0.1, max: 1.0, mode: 'add' }
    ],

    /** Tilt shifts harmonic hue angles and density ratios */
    tiltHarmonic: [
        { source: 'tilt', channel: 'gamma', layerName: 'shadow', configKey: 'hueAngle', scale: 3.0, baseline: 137.508, min: 0, max: 360, mode: 'add' },
        { source: 'tilt', channel: 'beta', layerName: 'highlight', configKey: 'densityHarmonic', scale: 0.05, baseline: 2.0, min: 0.5, max: 5.0, mode: 'add' },
        { source: 'tilt', channel: 'gamma', layerName: 'accent', configKey: 'hueAngle', scale: -2.0, baseline: 52.524, min: 0, max: 360, mode: 'add' },
        { source: 'tilt', channel: 'alpha', layerName: 'background', configKey: 'speedScale', scale: 0.01, baseline: 0.2, min: 0.05, max: 1.0, mode: 'add' }
    ],

    /** Mouse position drives chase lerp rate and echo density */
    mouseChase: [
        { source: 'mouse', channel: 'x', layerName: 'shadow', configKey: 'lerpRate', scale: 0.2, baseline: 0.05, min: 0.01, max: 0.5, mode: 'add' },
        { source: 'mouse', channel: 'y', layerName: 'accent', configKey: 'lerpRate', scale: 0.3, baseline: 0.1, min: 0.01, max: 0.8, mode: 'add' },
        { source: 'mouse', channel: 'x', layerName: 'highlight', configKey: 'densityScale', scale: 1.5, baseline: 1.0, min: 0.2, max: 3.0, mode: 'add' }
    ],

    /** Audio beats pulse layer opacities */
    audioPulse: [
        { source: 'audio', channel: 'bass', layerName: 'background', configKey: 'opacity', scale: 0.3, baseline: 0.2, min: 0.05, max: 0.8, mode: 'add' },
        { source: 'audio', channel: 'mid', layerName: 'shadow', configKey: 'opacity', scale: 0.3, baseline: 0.4, min: 0.1, max: 0.9, mode: 'add' },
        { source: 'audio', channel: 'high', layerName: 'highlight', configKey: 'opacity', scale: 0.3, baseline: 0.6, min: 0.2, max: 1.0, mode: 'add' },
        { source: 'audio', channel: 'bass', layerName: 'accent', configKey: 'opacity', scale: 0.5, baseline: 0.3, min: 0.1, max: 1.0, mode: 'add' }
    ],

    /** Combined: audio drives gains, tilt drives hue shifts */
    fullReactive: [
        // Audio → gain/opacity
        { source: 'audio', channel: 'bass', layerName: 'shadow', configKey: 'gain', scale: 3.0, baseline: 2.0, min: 0.5, max: 8.0, mode: 'add' },
        { source: 'audio', channel: 'mid', layerName: 'highlight', configKey: 'gain', scale: 2.5, baseline: 3.0, min: 1.0, max: 8.0, mode: 'add' },
        { source: 'audio', channel: 'high', layerName: 'accent', configKey: 'gain', scale: 4.0, baseline: 4.0, min: 1.0, max: 12.0, mode: 'add' },
        { source: 'audio', channel: 'bass', layerName: 'accent', configKey: 'opacity', scale: 0.4, baseline: 0.35, min: 0.1, max: 1.0, mode: 'add' },
        // Tilt → hue/speed
        { source: 'tilt', channel: 'gamma', layerName: 'shadow', configKey: 'hueAngle', scale: 2.0, baseline: 137.508, min: 0, max: 360, mode: 'add' },
        { source: 'tilt', channel: 'beta', layerName: 'highlight', configKey: 'speedRatio', scale: 0.02, baseline: 0.5, min: 0.1, max: 2.0, mode: 'add' },
        // Mouse → chase
        { source: 'mouse', channel: 'x', layerName: 'accent', configKey: 'lerpRate', scale: 0.2, baseline: 0.1, min: 0.01, max: 0.5, mode: 'add' }
    ]
};

export class LayerReactivityBridge {
    /**
     * @param {import('./LayerRelationshipGraph.js').LayerRelationshipGraph} graph - Live graph
     * @param {import('./LayerPresetManager.js').LayerPresetManager} [presetManager] - Optional preset manager for save/restore
     */
    constructor(graph, presetManager = null) {
        /** @type {import('./LayerRelationshipGraph.js').LayerRelationshipGraph} */
        this._graph = graph;

        /** @type {import('./LayerPresetManager.js').LayerPresetManager|null} */
        this._presetManager = presetManager;

        /** @type {ModulationMapping[]} Active modulation mappings */
        this._mappings = [];

        /** @type {string|null} Active modulation profile name */
        this._activeProfile = null;

        /** @type {boolean} Whether modulation is active */
        this._active = false;
    }

    // ========================================================================
    // Modulation Mappings
    // ========================================================================

    /**
     * Add a single modulation mapping.
     *
     * @param {string} source - Input source ('audio', 'tilt', 'mouse', 'click', 'custom')
     * @param {string} channel - Channel within source ('bass', 'mid', 'high', 'gamma', 'x', etc.)
     * @param {string} layerName - Target layer
     * @param {string} configKey - Relationship config key to modulate
     * @param {object} [options]
     * @param {number} [options.scale=1.0]
     * @param {number} [options.baseline=0]
     * @param {number} [options.min] - Clamp minimum
     * @param {number} [options.max] - Clamp maximum
     * @param {string} [options.mode='add'] - 'add' or 'multiply'
     */
    addModulation(source, channel, layerName, configKey, options = {}) {
        this._mappings.push({
            source,
            channel,
            layerName,
            configKey,
            scale: options.scale ?? 1.0,
            baseline: options.baseline ?? 0,
            min: options.min,
            max: options.max,
            mode: options.mode || 'add'
        });
        this._activeProfile = null;
    }

    /**
     * Remove all modulation mappings for a specific layer.
     *
     * @param {string} layerName
     * @returns {number} Number of mappings removed
     */
    removeModulationsForLayer(layerName) {
        const before = this._mappings.length;
        this._mappings = this._mappings.filter(m => m.layerName !== layerName);
        return before - this._mappings.length;
    }

    /**
     * Remove all modulation mappings.
     */
    clearModulations() {
        this._mappings = [];
        this._activeProfile = null;
    }

    /**
     * Load a pre-built modulation profile.
     *
     * @param {string} profileName - One of: audioStorm, tiltHarmonic, mouseChase, audioPulse, fullReactive
     * @returns {boolean} True if loaded
     */
    loadModulationProfile(profileName) {
        const profile = MODULATION_PROFILES[profileName];
        if (!profile) return false;

        this._mappings = profile.map(m => ({ ...m }));
        this._activeProfile = profileName;
        return true;
    }

    /**
     * Get available modulation profile names.
     *
     * @returns {string[]}
     */
    static get profileNames() {
        return Object.keys(MODULATION_PROFILES);
    }

    /**
     * Get the active modulation profile name.
     *
     * @returns {string|null}
     */
    get activeProfile() {
        return this._activeProfile;
    }

    /**
     * Get all current modulation mappings.
     *
     * @returns {ModulationMapping[]}
     */
    get mappings() {
        return [...this._mappings];
    }

    // ========================================================================
    // Activation
    // ========================================================================

    /**
     * Enable modulation processing.
     */
    activate() {
        this._active = true;
    }

    /**
     * Disable modulation processing.
     */
    deactivate() {
        this._active = false;
    }

    /**
     * Check if modulation is active.
     *
     * @returns {boolean}
     */
    get isActive() {
        return this._active;
    }

    // ========================================================================
    // Update (called each frame or on input change)
    // ========================================================================

    /**
     * Process input state and apply modulations to the layer relationship graph.
     *
     * Call this from the render loop or when input state changes.
     *
     * @param {object} inputState - Current input values
     * @param {object} [inputState.audio] - { bass, mid, high, energy }
     * @param {object} [inputState.tilt] - { alpha, beta, gamma }
     * @param {object} [inputState.mouse] - { x, y, velocityX, velocityY }
     * @param {object} [inputState.click] - { intensity }
     * @param {object} [inputState.custom] - Custom named channels
     * @returns {object} Map of layerName → applied config overrides
     */
    update(inputState) {
        if (!this._active || this._mappings.length === 0) return {};

        // Group mappings by layer to batch-apply
        const overridesByLayer = {};

        for (const mapping of this._mappings) {
            const sourceData = inputState[mapping.source];
            if (!sourceData) continue;

            const inputValue = sourceData[mapping.channel];
            if (inputValue === undefined || inputValue === null) continue;

            // Compute modulated value
            let value;
            if (mapping.mode === 'multiply') {
                value = mapping.baseline * (1 + inputValue * mapping.scale);
            } else {
                value = mapping.baseline + inputValue * mapping.scale;
            }

            // Clamp
            if (mapping.min !== undefined) value = Math.max(mapping.min, value);
            if (mapping.max !== undefined) value = Math.min(mapping.max, value);

            // Accumulate overrides per layer
            if (!overridesByLayer[mapping.layerName]) {
                overridesByLayer[mapping.layerName] = {};
            }
            overridesByLayer[mapping.layerName][mapping.configKey] = value;
        }

        // Apply overrides to the graph via tune
        for (const [layerName, overrides] of Object.entries(overridesByLayer)) {
            const graphConfig = this._graph.exportConfig();
            const currentRel = graphConfig.relationships[layerName];

            if (currentRel && currentRel.preset) {
                const factory = PRESET_REGISTRY[currentRel.preset];
                if (factory) {
                    const newConfig = { ...(currentRel.config || {}), ...overrides };
                    this._graph.setRelationship(layerName, {
                        preset: currentRel.preset,
                        config: newConfig
                    });
                }
            }
        }

        return overridesByLayer;
    }

    // ========================================================================
    // Serialization
    // ========================================================================

    /**
     * Export the current modulation configuration.
     *
     * @returns {object}
     */
    exportConfig() {
        return {
            profile: this._activeProfile,
            mappings: this._mappings.map(m => ({ ...m })),
            active: this._active
        };
    }

    /**
     * Import a modulation configuration.
     *
     * @param {object} config
     */
    importConfig(config) {
        if (!config) return;

        if (config.profile && MODULATION_PROFILES[config.profile]) {
            this.loadModulationProfile(config.profile);
        } else if (Array.isArray(config.mappings)) {
            this._mappings = config.mappings.map(m => ({ ...m }));
            this._activeProfile = null;
        }

        if (config.active !== undefined) {
            this._active = config.active;
        }
    }
}

export { MODULATION_PROFILES };
export default LayerReactivityBridge;
