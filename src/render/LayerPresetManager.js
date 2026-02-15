/**
 * LayerPresetManager — Save, load, tune, and share layer relationship presets
 *
 * Works with LayerRelationshipGraph to persist custom layer configurations.
 * Users and agents can:
 *   - Save the current graph state as a named preset
 *   - Load presets by name
 *   - Tune individual relationship parameters at runtime
 *   - Import/export preset libraries as JSON
 *   - List available presets (built-in + user)
 *
 * Storage: localStorage by default, configurable via constructor.
 *
 * Usage:
 *   const presets = new LayerPresetManager(graph);
 *   presets.save('my-look');                          // save current graph
 *   presets.load('my-look');                          // restore to graph
 *   presets.tune('shadow', { opacity: 0.6, gain: 3 }); // tweak a layer
 *   const lib = presets.exportLibrary();              // full JSON export
 *   presets.importLibrary(lib);                       // bulk import
 */

import { LayerRelationshipGraph, PROFILES, PRESET_REGISTRY } from './LayerRelationshipGraph.js';

const STORAGE_KEY = 'vib3_layer_presets';

export class LayerPresetManager {
    /**
     * @param {LayerRelationshipGraph} graph - The live graph to save from / load into
     * @param {object} [options]
     * @param {Storage} [options.storage] - Storage backend (default: localStorage)
     * @param {string} [options.storageKey] - Key prefix for storage
     */
    constructor(graph, options = {}) {
        if (!(graph instanceof LayerRelationshipGraph)) {
            throw new Error('LayerPresetManager requires a LayerRelationshipGraph instance');
        }

        /** @type {LayerRelationshipGraph} */
        this._graph = graph;

        /** @type {Storage|null} */
        this._storage = options.storage !== undefined ? options.storage : this._getStorage();

        /** @type {string} */
        this._storageKey = options.storageKey || STORAGE_KEY;

        /** @type {Map<string, object>} In-memory preset cache */
        this._presets = new Map();

        // Load persisted presets into memory
        this._loadFromStorage();
    }

    /**
     * Get localStorage safely (returns null in non-browser / restricted environments).
     * @private
     * @returns {Storage|null}
     */
    _getStorage() {
        try {
            if (typeof localStorage !== 'undefined') {
                // Verify it works
                localStorage.setItem('__vib3_test', '1');
                localStorage.removeItem('__vib3_test');
                return localStorage;
            }
        } catch (_e) { /* restricted */ }
        return null;
    }

    /**
     * Load all presets from storage into the in-memory cache.
     * @private
     */
    _loadFromStorage() {
        if (!this._storage) return;

        try {
            const raw = this._storage.getItem(this._storageKey);
            if (raw) {
                const data = JSON.parse(raw);
                if (data && typeof data === 'object') {
                    for (const [name, preset] of Object.entries(data)) {
                        this._presets.set(name, preset);
                    }
                }
            }
        } catch (e) {
            console.warn('LayerPresetManager: failed to load presets from storage:', e.message);
        }
    }

    /**
     * Persist the in-memory preset cache to storage.
     * @private
     */
    _saveToStorage() {
        if (!this._storage) return;

        try {
            const data = {};
            for (const [name, preset] of this._presets) {
                data[name] = preset;
            }
            this._storage.setItem(this._storageKey, JSON.stringify(data));
        } catch (e) {
            console.warn('LayerPresetManager: failed to save presets to storage:', e.message);
        }
    }

    // ========================================================================
    // Save / Load
    // ========================================================================

    /**
     * Save the current graph state as a named preset.
     *
     * @param {string} name - Preset name (must not collide with built-in profile names)
     * @param {object} [metadata] - Optional metadata (description, author, tags)
     * @returns {object} The saved preset data
     */
    save(name, metadata = {}) {
        if (!name || typeof name !== 'string') {
            throw new Error('Preset name must be a non-empty string');
        }

        if (PROFILES[name]) {
            throw new Error(`Cannot overwrite built-in profile "${name}". Choose a different name.`);
        }

        const config = this._graph.exportConfig();
        const preset = {
            name,
            config,
            metadata: {
                ...metadata,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        };

        this._presets.set(name, preset);
        this._saveToStorage();

        return preset;
    }

    /**
     * Load a preset by name into the live graph.
     * Checks user presets first, then built-in profiles.
     *
     * @param {string} name - Preset or profile name
     * @returns {boolean} True if loaded successfully
     */
    load(name) {
        // User preset
        const preset = this._presets.get(name);
        if (preset && preset.config) {
            this._graph.importConfig(preset.config);
            return true;
        }

        // Built-in profile
        if (PROFILES[name]) {
            this._graph.loadProfile(name);
            return true;
        }

        return false;
    }

    /**
     * Delete a user preset.
     *
     * @param {string} name
     * @returns {boolean} True if deleted
     */
    delete(name) {
        if (PROFILES[name]) {
            throw new Error(`Cannot delete built-in profile "${name}".`);
        }

        const existed = this._presets.delete(name);
        if (existed) {
            this._saveToStorage();
        }
        return existed;
    }

    /**
     * Check if a preset exists (user or built-in).
     *
     * @param {string} name
     * @returns {boolean}
     */
    has(name) {
        return this._presets.has(name) || !!PROFILES[name];
    }

    /**
     * Get a preset's data without loading it.
     *
     * @param {string} name
     * @returns {object|null}
     */
    get(name) {
        return this._presets.get(name) || null;
    }

    // ========================================================================
    // List / Browse
    // ========================================================================

    /**
     * List all available presets (user + built-in).
     *
     * @returns {{ user: string[], builtIn: string[] }}
     */
    list() {
        return {
            user: Array.from(this._presets.keys()),
            builtIn: Object.keys(PROFILES)
        };
    }

    /**
     * List all preset names (user + built-in) as a flat array.
     *
     * @returns {string[]}
     */
    listAll() {
        return [
            ...Object.keys(PROFILES),
            ...Array.from(this._presets.keys())
        ];
    }

    /**
     * Get the count of user presets.
     *
     * @returns {number}
     */
    get count() {
        return this._presets.size;
    }

    // ========================================================================
    // Tune
    // ========================================================================

    /**
     * Tune (hot-patch) a layer's relationship config without replacing the full graph.
     * Re-instantiates the relationship function with updated config.
     *
     * @param {string} layerName - Layer to tune
     * @param {object} configOverrides - Config values to merge (e.g., { opacity: 0.6, gain: 3 })
     * @returns {boolean} True if tuned successfully
     */
    tune(layerName, configOverrides) {
        if (!configOverrides || typeof configOverrides !== 'object') return false;

        // Read current config for this layer from the graph
        const graphConfig = this._graph.exportConfig();
        const currentRel = graphConfig.relationships[layerName];

        if (!currentRel || !currentRel.preset) {
            // Can't tune a custom function or missing relationship
            return false;
        }

        const factory = PRESET_REGISTRY[currentRel.preset];
        if (!factory) return false;

        // Merge overrides into existing config
        const newConfig = { ...(currentRel.config || {}), ...configOverrides };

        // Re-set the relationship with updated config
        this._graph.setRelationship(layerName, {
            preset: currentRel.preset,
            config: newConfig
        });

        return true;
    }

    /**
     * Get the current tunable config for a layer.
     *
     * @param {string} layerName
     * @returns {object|null} The current { preset, config } or null
     */
    getLayerConfig(layerName) {
        const graphConfig = this._graph.exportConfig();
        return graphConfig.relationships[layerName] || null;
    }

    // ========================================================================
    // Import / Export
    // ========================================================================

    /**
     * Export all user presets as a JSON-serializable library.
     *
     * @returns {object} Library object with version and presets
     */
    exportLibrary() {
        const presets = {};
        for (const [name, preset] of this._presets) {
            presets[name] = preset;
        }

        return {
            version: '1.0',
            type: 'vib3_layer_presets',
            exportedAt: new Date().toISOString(),
            count: this._presets.size,
            presets
        };
    }

    /**
     * Import presets from a library object.
     * Does not overwrite existing presets unless `overwrite` is true.
     *
     * @param {object} library - Library object from exportLibrary()
     * @param {object} [options]
     * @param {boolean} [options.overwrite=false] - Overwrite existing presets
     * @returns {{ imported: number, skipped: number }}
     */
    importLibrary(library, options = {}) {
        const { overwrite = false } = options;

        if (!library || !library.presets || typeof library.presets !== 'object') {
            throw new Error('Invalid library format: missing presets object');
        }

        let imported = 0;
        let skipped = 0;

        for (const [name, preset] of Object.entries(library.presets)) {
            if (PROFILES[name]) {
                skipped++;
                continue; // Never overwrite built-in profiles
            }

            if (!overwrite && this._presets.has(name)) {
                skipped++;
                continue;
            }

            this._presets.set(name, preset);
            imported++;
        }

        if (imported > 0) {
            this._saveToStorage();
        }

        return { imported, skipped };
    }

    /**
     * Clear all user presets.
     */
    clear() {
        this._presets.clear();
        this._saveToStorage();
    }
}

export default LayerPresetManager;
