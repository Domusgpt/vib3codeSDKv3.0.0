/**
 * LayerRelationshipGraph — Keystone-driven inter-layer parameter system for VIB3+
 *
 * Instead of blasting identical parameters to all 5 layers with static multipliers,
 * this system designates one layer as the **keystone** (the driver) and derives
 * every other layer's parameters through configurable **relationship functions**.
 *
 * Each relationship function receives the keystone's resolved parameters and returns
 * the dependent layer's parameters. This allows layers to mirror, complement, chase,
 * harmonize with, or react to the keystone — producing actual inter-layer dynamics
 * instead of "same shader, different opacity."
 *
 * Supports per-layer shader assignment so layers aren't forced to run the same program.
 *
 * Usage:
 *   const graph = new LayerRelationshipGraph({ keystone: 'content' });
 *   graph.setRelationship('background', 'echo');      // attenuated follower
 *   graph.setRelationship('shadow', 'complement');     // color complement, density inverse
 *   graph.setRelationship('highlight', 'harmonic');    // 2x density, shifted hue
 *   graph.setRelationship('accent', 'reactive');       // amplifies delta from keystone
 *
 *   // Custom relationship
 *   graph.setRelationship('accent', (keystoneParams, time) => ({
 *       ...keystoneParams,
 *       hue: (keystoneParams.hue + 180) % 360,
 *       density: keystoneParams.density * 2.5,
 *       speed: keystoneParams.speed * 0.4,
 *   }));
 *
 *   // Per-layer shader
 *   graph.setLayerShader('accent', 'holographic-glitch');
 *
 *   // Resolve all layers for a frame
 *   const resolved = graph.resolveAll(keystoneParams, time);
 *   // => { background: {...}, shadow: {...}, content: keystoneParams, highlight: {...}, accent: {...} }
 */

/** @type {string[]} Standard layer order (back to front) */
const LAYER_ORDER = ['background', 'shadow', 'content', 'highlight', 'accent'];

// ============================================================================
// Preset Relationship Functions
// ============================================================================

/**
 * @typedef {function(Object, number): Object} RelationshipFn
 * Takes (keystoneParams, time) and returns derived layer params.
 */

/**
 * Echo — attenuated follower.
 * Same parameters as keystone but scaled down. The most basic relationship.
 * Background/shadow layers typically use this.
 *
 * @param {Object} config - Attenuation config
 * @param {number} [config.opacity=0.3] - Opacity multiplier
 * @param {number} [config.densityScale=0.5] - Density multiplier
 * @param {number} [config.speedScale=0.3] - Speed multiplier
 * @param {number} [config.intensityScale=0.4] - Intensity multiplier
 * @returns {RelationshipFn}
 */
function echo(config = {}) {
    const {
        opacity = 0.3,
        densityScale = 0.5,
        speedScale = 0.3,
        intensityScale = 0.4
    } = config;

    return (kp, _time) => ({
        ...kp,
        layerOpacity: (kp.layerOpacity || 1.0) * opacity,
        density: (kp.density || 1.0) * densityScale,
        speed: (kp.speed || 1.0) * speedScale,
        intensity: (kp.intensity || 0.5) * intensityScale
    });
}

/**
 * Mirror — inverts spatial parameters relative to keystone.
 * Rotation planes get negated, hue shifts 180°. Creates visual counterpoint.
 *
 * @param {Object} config
 * @param {number} [config.opacity=0.5]
 * @param {boolean} [config.invertRotation=true] - Negate 4D rotation angles
 * @param {number} [config.hueShift=180] - Degrees to shift hue
 * @returns {RelationshipFn}
 */
function mirror(config = {}) {
    const {
        opacity = 0.5,
        invertRotation = true,
        hueShift = 180
    } = config;

    return (kp, _time) => {
        const result = { ...kp, layerOpacity: (kp.layerOpacity || 1.0) * opacity };

        if (kp.hue !== undefined) {
            result.hue = (kp.hue + hueShift) % 360;
        }

        if (invertRotation) {
            if (kp.rot4dXW !== undefined) result.rot4dXW = -kp.rot4dXW;
            if (kp.rot4dYW !== undefined) result.rot4dYW = -kp.rot4dYW;
            if (kp.rot4dZW !== undefined) result.rot4dZW = -kp.rot4dZW;
        }

        return result;
    };
}

/**
 * Complement — color complement with inverted density curve.
 * Hue opposite, density inverts around midpoint, chaos complementary.
 * Good for shadow/background to create depth contrast.
 *
 * @param {Object} config
 * @param {number} [config.opacity=0.4]
 * @param {number} [config.densityPivot=1.0] - Density value to invert around
 * @param {number} [config.chaosInvert=true] - Invert chaos (high → low, low → high)
 * @returns {RelationshipFn}
 */
function complement(config = {}) {
    const {
        opacity = 0.4,
        densityPivot = 1.0,
        chaosInvert = true
    } = config;

    return (kp, _time) => {
        const result = { ...kp, layerOpacity: (kp.layerOpacity || 1.0) * opacity };

        if (kp.hue !== undefined) {
            result.hue = (kp.hue + 180) % 360;
        }

        if (kp.density !== undefined) {
            // Invert around pivot: if keystone density is 0.3, complement is 1.7
            result.density = Math.max(0.1, densityPivot * 2 - kp.density);
        }

        if (chaosInvert && kp.chaos !== undefined) {
            result.chaos = Math.max(0, 1.0 - kp.chaos);
        }

        return result;
    };
}

/**
 * Harmonic — musical harmonic relationships.
 * Density at integer multiples (2x, 3x), hue shifted by golden angle (~137.5°).
 * Speed at fractional ratios. Creates visual "chords."
 *
 * @param {Object} config
 * @param {number} [config.opacity=0.5]
 * @param {number} [config.densityHarmonic=2] - Integer multiple for density
 * @param {number} [config.speedRatio=0.5] - Fractional speed ratio
 * @param {number} [config.hueAngle=137.508] - Golden angle for hue shift
 * @returns {RelationshipFn}
 */
function harmonic(config = {}) {
    const {
        opacity = 0.5,
        densityHarmonic = 2,
        speedRatio = 0.5,
        hueAngle = 137.508
    } = config;

    return (kp, _time) => {
        const result = { ...kp, layerOpacity: (kp.layerOpacity || 1.0) * opacity };

        if (kp.density !== undefined) {
            result.density = kp.density * densityHarmonic;
        }

        if (kp.speed !== undefined) {
            result.speed = kp.speed * speedRatio;
        }

        if (kp.hue !== undefined) {
            result.hue = (kp.hue + hueAngle) % 360;
        }

        return result;
    };
}

/**
 * Reactive — amplifies the delta from a baseline.
 * Tracks parameter changes over time and exaggerates them.
 * The more the keystone changes, the more reactive layers diverge.
 *
 * @param {Object} config
 * @param {number} [config.opacity=0.6]
 * @param {number} [config.gain=2.0] - How much to amplify deltas
 * @param {number} [config.decay=0.95] - How fast accumulated delta decays per frame
 * @returns {RelationshipFn}
 */
function reactive(config = {}) {
    const {
        opacity = 0.6,
        gain = 2.0,
        decay = 0.95
    } = config;

    let prevParams = null;
    let accumulatedDelta = {};

    return (kp, _time) => {
        const result = { ...kp, layerOpacity: (kp.layerOpacity || 1.0) * opacity };

        if (prevParams) {
            for (const key of Object.keys(kp)) {
                if (typeof kp[key] !== 'number') continue;
                const delta = kp[key] - (prevParams[key] || 0);
                accumulatedDelta[key] = ((accumulatedDelta[key] || 0) + delta * gain) * decay;
                result[key] = kp[key] + (accumulatedDelta[key] || 0);
            }
        }

        prevParams = { ...kp };
        return result;
    };
}

/**
 * Chase — follows the keystone with a time delay (lerp toward keystone each frame).
 * Creates a trailing/ghosting effect. Layers feel like they're "catching up."
 *
 * @param {Object} config
 * @param {number} [config.opacity=0.5]
 * @param {number} [config.lerpRate=0.1] - How fast to chase (0 = frozen, 1 = instant)
 * @returns {RelationshipFn}
 */
function chase(config = {}) {
    const {
        opacity = 0.5,
        lerpRate = 0.1
    } = config;

    let currentParams = null;

    return (kp, _time) => {
        if (!currentParams) {
            currentParams = { ...kp };
        }

        // Lerp each numeric parameter toward keystone
        for (const key of Object.keys(kp)) {
            if (typeof kp[key] !== 'number') continue;
            const current = currentParams[key] !== undefined ? currentParams[key] : kp[key];
            currentParams[key] = current + (kp[key] - current) * lerpRate;
        }

        return {
            ...currentParams,
            layerOpacity: (kp.layerOpacity || 1.0) * opacity
        };
    };
}

/**
 * Registry of preset relationship factories.
 * Each entry is a function that takes optional config and returns a RelationshipFn.
 */
const PRESET_REGISTRY = {
    echo,
    mirror,
    complement,
    harmonic,
    reactive,
    chase
};

// ============================================================================
// Default Layer Relationship Profiles
// ============================================================================

/**
 * Named profiles that configure the full 5-layer graph at once.
 * Each profile sets the keystone and relationships for all layers.
 */
const PROFILES = {
    /** Classic holographic — content drives, others echo/complement */
    holographic: {
        keystone: 'content',
        relationships: {
            background: { preset: 'echo', config: { opacity: 0.2, densityScale: 0.4, speedScale: 0.2, intensityScale: 0.3 } },
            shadow:     { preset: 'complement', config: { opacity: 0.4, densityPivot: 1.0 } },
            highlight:  { preset: 'harmonic', config: { opacity: 0.6, densityHarmonic: 1.5, speedRatio: 0.8, hueAngle: 60 } },
            accent:     { preset: 'reactive', config: { opacity: 0.3, gain: 2.5, decay: 0.92 } }
        }
    },

    /** Mirror mode — highlight mirrors keystone, accent chases */
    symmetry: {
        keystone: 'content',
        relationships: {
            background: { preset: 'echo', config: { opacity: 0.15, densityScale: 0.3, speedScale: 0.15 } },
            shadow:     { preset: 'mirror', config: { opacity: 0.35 } },
            highlight:  { preset: 'mirror', config: { opacity: 0.5, hueShift: 120 } },
            accent:     { preset: 'chase', config: { opacity: 0.4, lerpRate: 0.05 } }
        }
    },

    /** Harmonic chord — layers at musical intervals */
    chord: {
        keystone: 'content',
        relationships: {
            background: { preset: 'harmonic', config: { opacity: 0.2, densityHarmonic: 0.5, speedRatio: 0.25, hueAngle: 0 } },
            shadow:     { preset: 'harmonic', config: { opacity: 0.35, densityHarmonic: 1.5, speedRatio: 0.667, hueAngle: 137.508 } },
            highlight:  { preset: 'harmonic', config: { opacity: 0.55, densityHarmonic: 2, speedRatio: 0.5, hueAngle: 275.016 } },
            accent:     { preset: 'harmonic', config: { opacity: 0.3, densityHarmonic: 3, speedRatio: 0.333, hueAngle: 52.524 } }
        }
    },

    /** Reactive storm — all layers react to keystone changes */
    storm: {
        keystone: 'content',
        relationships: {
            background: { preset: 'reactive', config: { opacity: 0.25, gain: 1.5, decay: 0.98 } },
            shadow:     { preset: 'reactive', config: { opacity: 0.4, gain: 2.0, decay: 0.95 } },
            highlight:  { preset: 'reactive', config: { opacity: 0.6, gain: 3.0, decay: 0.90 } },
            accent:     { preset: 'reactive', config: { opacity: 0.35, gain: 4.0, decay: 0.88 } }
        }
    },

    /** Legacy — replicates the old static multiplier behavior exactly */
    legacy: {
        keystone: 'content',
        relationships: {
            background: { preset: 'echo', config: { opacity: 0.2, densityScale: 0.4, speedScale: 0.2, intensityScale: 0.4 } },
            shadow:     { preset: 'echo', config: { opacity: 0.4, densityScale: 0.8, speedScale: 0.3, intensityScale: 0.6 } },
            highlight:  { preset: 'echo', config: { opacity: 0.6, densityScale: 1.5, speedScale: 0.8, intensityScale: 0.8 } },
            accent:     { preset: 'echo', config: { opacity: 0.3, densityScale: 2.5, speedScale: 0.4, intensityScale: 0.5 } }
        }
    }
};

// ============================================================================
// LayerRelationshipGraph
// ============================================================================

export class LayerRelationshipGraph {
    /**
     * @param {Object} [config]
     * @param {string} [config.keystone='content'] - The driver layer
     * @param {string} [config.profile] - Named profile to load (holographic, symmetry, chord, storm, legacy)
     */
    constructor(config = {}) {
        /** @type {string} The keystone (driver) layer name */
        this._keystone = config.keystone || 'content';

        /** @type {Map<string, RelationshipFn>} layer name → resolved relationship function */
        this._relationships = new Map();

        /** @type {Map<string, string>} layer name → shader program name */
        this._layerShaders = new Map();

        /** @type {Map<string, {preset: string, config: Object}|null>} serializable config per layer */
        this._relationshipConfigs = new Map();

        /** @type {string|null} Currently active profile name */
        this._activeProfile = null;

        // Load profile if specified
        if (config.profile && PROFILES[config.profile]) {
            this.loadProfile(config.profile);
        }
    }

    // ========================================================================
    // Configuration
    // ========================================================================

    /**
     * Set the keystone (driver) layer.
     * @param {string} layerName - One of LAYER_ORDER
     */
    setKeystone(layerName) {
        if (!LAYER_ORDER.includes(layerName)) {
            throw new Error(`Invalid layer name: "${layerName}". Must be one of: ${LAYER_ORDER.join(', ')}`);
        }
        this._keystone = layerName;
        this._activeProfile = null;
    }

    /** @returns {string} Current keystone layer name */
    get keystone() {
        return this._keystone;
    }

    /**
     * Set the relationship for a dependent layer.
     *
     * @param {string} layerName - The dependent layer
     * @param {string|RelationshipFn|{preset: string, config?: Object}} relationship
     *   - String: preset name ('echo', 'mirror', 'complement', 'harmonic', 'reactive', 'chase')
     *   - Function: custom (keystoneParams, time) => layerParams
     *   - Object: { preset: 'name', config: {...} }
     */
    setRelationship(layerName, relationship) {
        if (!LAYER_ORDER.includes(layerName)) {
            throw new Error(`Invalid layer name: "${layerName}". Must be one of: ${LAYER_ORDER.join(', ')}`);
        }

        if (layerName === this._keystone) {
            throw new Error(`Cannot set relationship on keystone layer "${layerName}". Change the keystone first.`);
        }

        if (typeof relationship === 'function') {
            this._relationships.set(layerName, relationship);
            this._relationshipConfigs.set(layerName, null); // custom fn, not serializable
        } else if (typeof relationship === 'string') {
            const factory = PRESET_REGISTRY[relationship];
            if (!factory) {
                throw new Error(`Unknown relationship preset: "${relationship}". Available: ${Object.keys(PRESET_REGISTRY).join(', ')}`);
            }
            this._relationships.set(layerName, factory());
            this._relationshipConfigs.set(layerName, { preset: relationship, config: {} });
        } else if (relationship && typeof relationship === 'object' && relationship.preset) {
            const factory = PRESET_REGISTRY[relationship.preset];
            if (!factory) {
                throw new Error(`Unknown relationship preset: "${relationship.preset}". Available: ${Object.keys(PRESET_REGISTRY).join(', ')}`);
            }
            this._relationships.set(layerName, factory(relationship.config || {}));
            this._relationshipConfigs.set(layerName, { preset: relationship.preset, config: relationship.config || {} });
        } else {
            throw new Error('Relationship must be a preset name (string), a function, or { preset, config }.');
        }

        this._activeProfile = null;
    }

    /**
     * Set the shader program for a specific layer.
     * Layers without an explicit shader use the default (same as keystone).
     *
     * @param {string} layerName
     * @param {string} shaderName - Shader program name to use for this layer
     */
    setLayerShader(layerName, shaderName) {
        if (!LAYER_ORDER.includes(layerName)) {
            throw new Error(`Invalid layer name: "${layerName}".`);
        }
        this._layerShaders.set(layerName, shaderName);
    }

    /**
     * Get the shader name for a layer (null means use default).
     * @param {string} layerName
     * @returns {string|null}
     */
    getLayerShader(layerName) {
        return this._layerShaders.get(layerName) || null;
    }

    /**
     * Load a named profile, configuring the full graph at once.
     * @param {string} profileName - One of: holographic, symmetry, chord, storm, legacy
     */
    loadProfile(profileName) {
        const profile = PROFILES[profileName];
        if (!profile) {
            throw new Error(`Unknown profile: "${profileName}". Available: ${Object.keys(PROFILES).join(', ')}`);
        }

        this._keystone = profile.keystone || 'content';
        this._relationships.clear();
        this._relationshipConfigs.clear();

        for (const [layerName, rel] of Object.entries(profile.relationships)) {
            const factory = PRESET_REGISTRY[rel.preset];
            if (factory) {
                this._relationships.set(layerName, factory(rel.config || {}));
                this._relationshipConfigs.set(layerName, { preset: rel.preset, config: rel.config || {} });
            }
        }

        this._activeProfile = profileName;
    }

    /** @returns {string|null} Active profile name, or null if custom */
    get activeProfile() {
        return this._activeProfile;
    }

    /** @returns {string[]} Available profile names */
    static get profileNames() {
        return Object.keys(PROFILES);
    }

    /** @returns {string[]} Available preset relationship names */
    static get presetNames() {
        return Object.keys(PRESET_REGISTRY);
    }

    // ========================================================================
    // Resolution
    // ========================================================================

    /**
     * Resolve parameters for a single dependent layer.
     *
     * @param {Object} keystoneParams - The keystone layer's parameters
     * @param {string} layerName - The layer to resolve
     * @param {number} time - Current time (ms or frame count)
     * @returns {Object} Resolved parameters for the layer
     */
    resolve(keystoneParams, layerName, time) {
        if (layerName === this._keystone) {
            return { ...keystoneParams };
        }

        const fn = this._relationships.get(layerName);
        if (!fn) {
            // No relationship defined — passthrough keystone params unchanged
            return { ...keystoneParams };
        }

        return fn(keystoneParams, time);
    }

    /**
     * Resolve parameters for all layers at once.
     *
     * @param {Object} keystoneParams - The keystone layer's parameters
     * @param {number} time - Current time (ms or frame count)
     * @returns {Object<string, Object>} Map of layerName → resolved params
     */
    resolveAll(keystoneParams, time) {
        const resolved = {};
        for (const layerName of LAYER_ORDER) {
            resolved[layerName] = this.resolve(keystoneParams, layerName, time);
        }
        return resolved;
    }

    // ========================================================================
    // Serialization
    // ========================================================================

    /**
     * Export the graph configuration for saving (gallery, presets).
     * Custom functions are exported as null (not serializable).
     *
     * @returns {Object} Serializable graph configuration
     */
    exportConfig() {
        const relationships = {};
        for (const [layerName, config] of this._relationshipConfigs) {
            relationships[layerName] = config; // null for custom fns
        }

        const shaders = {};
        for (const [layerName, shaderName] of this._layerShaders) {
            shaders[layerName] = shaderName;
        }

        return {
            keystone: this._keystone,
            profile: this._activeProfile,
            relationships,
            shaders
        };
    }

    /**
     * Import a graph configuration (from gallery, presets).
     *
     * @param {Object} config - Previously exported config
     */
    importConfig(config) {
        if (!config) return;

        if (config.profile && PROFILES[config.profile]) {
            this.loadProfile(config.profile);
        } else {
            this._keystone = config.keystone || 'content';
            this._relationships.clear();
            this._relationshipConfigs.clear();

            if (config.relationships) {
                for (const [layerName, rel] of Object.entries(config.relationships)) {
                    if (rel && rel.preset) {
                        this.setRelationship(layerName, rel);
                    }
                }
            }
        }

        // Restore shader assignments
        this._layerShaders.clear();
        if (config.shaders) {
            for (const [layerName, shaderName] of Object.entries(config.shaders)) {
                this._layerShaders.set(layerName, shaderName);
            }
        }
    }
}

// ============================================================================
// Exports
// ============================================================================

export { LAYER_ORDER, PROFILES, PRESET_REGISTRY };
export { echo, mirror, complement, harmonic, reactive, chase };
export default LayerRelationshipGraph;
