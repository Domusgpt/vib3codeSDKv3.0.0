/**
 * LayerGeometryMixer — Premium Module 3
 * Allow each of the 5 canvas layers to render a different geometry.
 * Works by injecting geometry overrides into the LayerRelationshipGraph.
 *
 * @module @vib3code/premium/LayerGeometryMixer
 */

const LAYER_NAMES = ['background', 'shadow', 'content', 'highlight', 'accent'];

export class LayerGeometryMixer {
    /**
     * @param {import('../core/VIB3Engine.js').VIB3Engine} engine
     */
    constructor(engine) {
        this._engine = engine;
        this._layerGeometries = new Map(); // layerName → geometry index
        this._layerOffsets = new Map();    // layerName → offset from keystone
        this._originalRelationships = new Map(); // layerName → original relationship fn
    }

    /**
     * Set an explicit geometry for a specific layer.
     * @param {string} layerName - One of: background, shadow, content, highlight, accent
     * @param {number} geometry - Geometry index 0-23
     */
    setLayerGeometry(layerName, geometry) {
        this._validateLayer(layerName);
        if (geometry < 0 || geometry > 23) {
            throw new Error(`Geometry must be 0-23, got: ${geometry}`);
        }
        this._layerGeometries.set(layerName, geometry);
        this._layerOffsets.delete(layerName);
        this._applyOverrides();
    }

    /**
     * Set a geometry offset from the keystone geometry for a layer.
     * @param {string} layerName
     * @param {number} offset - Offset to add to keystone geometry (wraps at 24)
     */
    setGeometryOffset(layerName, offset) {
        this._validateLayer(layerName);
        this._layerOffsets.set(layerName, offset);
        this._layerGeometries.delete(layerName);
        this._applyOverrides();
    }

    /**
     * Clear per-layer geometry for a layer (revert to keystone geometry).
     * @param {string} layerName
     */
    clearLayerGeometry(layerName) {
        this._validateLayer(layerName);
        this._layerGeometries.delete(layerName);
        this._layerOffsets.delete(layerName);
        this._applyOverrides();
    }

    /**
     * Clear all per-layer geometry overrides.
     */
    clearAll() {
        this._layerGeometries.clear();
        this._layerOffsets.clear();
        this._applyOverrides();
    }

    /**
     * Get current per-layer geometries.
     * @returns {object} Map of layerName → geometry index (or null if not overridden)
     */
    getLayerGeometries() {
        const currentGeometry = this._engine.getParameter('geometry') || 0;
        const result = {};
        for (const layer of LAYER_NAMES) {
            if (this._layerGeometries.has(layer)) {
                result[layer] = this._layerGeometries.get(layer);
            } else if (this._layerOffsets.has(layer)) {
                result[layer] = ((currentGeometry + this._layerOffsets.get(layer)) % 24 + 24) % 24;
            } else {
                result[layer] = currentGeometry;
            }
        }
        return result;
    }

    /**
     * Apply geometry overrides to the active system's layer relationship graph.
     * @private
     */
    _applyOverrides() {
        const system = this._engine.activeSystem;
        if (!system || !system.layerGraph) return;

        // Store overrides on the engine for systems that read them
        this._engine._layerGeometryOverrides = this.getLayerGeometries();

        // Force parameter update
        this._engine.updateCurrentSystemParameters();
    }

    _validateLayer(layerName) {
        if (!LAYER_NAMES.includes(layerName)) {
            throw new Error(`Invalid layer: ${layerName}. Must be one of: ${LAYER_NAMES.join(', ')}`);
        }
    }

    /**
     * Export state for serialization.
     * @returns {object}
     */
    exportState() {
        return {
            geometries: Object.fromEntries(this._layerGeometries),
            offsets: Object.fromEntries(this._layerOffsets)
        };
    }

    /**
     * Import state.
     * @param {object} state
     */
    importState(state) {
        if (state.geometries) {
            for (const [layer, geom] of Object.entries(state.geometries)) {
                if (LAYER_NAMES.includes(layer)) {
                    this._layerGeometries.set(layer, geom);
                }
            }
        }
        if (state.offsets) {
            for (const [layer, offset] of Object.entries(state.offsets)) {
                if (LAYER_NAMES.includes(layer)) {
                    this._layerOffsets.set(layer, offset);
                }
            }
        }
        this._applyOverrides();
    }

    destroy() {
        this._layerGeometries.clear();
        this._layerOffsets.clear();
        if (this._engine) {
            delete this._engine._layerGeometryOverrides;
        }
        this._engine = null;
    }
}
