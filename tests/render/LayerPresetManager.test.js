/**
 * Tests for LayerPresetManager
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LayerPresetManager } from '../../src/render/LayerPresetManager.js';
import { LayerRelationshipGraph } from '../../src/render/LayerRelationshipGraph.js';

describe('LayerPresetManager', () => {
    let graph;
    let manager;

    // Mock localStorage
    const mockStorage = {
        _data: {},
        getItem(key) { return this._data[key] || null; },
        setItem(key, value) { this._data[key] = value; },
        removeItem(key) { delete this._data[key]; },
        clear() { this._data = {}; }
    };

    beforeEach(() => {
        mockStorage.clear();
        graph = new LayerRelationshipGraph({ profile: 'holographic' });
        manager = new LayerPresetManager(graph, { storage: mockStorage });
    });

    describe('constructor', () => {
        it('requires a LayerRelationshipGraph', () => {
            expect(() => new LayerPresetManager(null)).toThrow('requires a LayerRelationshipGraph');
            expect(() => new LayerPresetManager({})).toThrow('requires a LayerRelationshipGraph');
        });

        it('creates with valid graph', () => {
            const m = new LayerPresetManager(graph, { storage: mockStorage });
            expect(m).toBeDefined();
            expect(m.count).toBe(0);
        });

        it('loads presets from storage on construction', () => {
            // Pre-populate storage
            mockStorage.setItem('vib3_layer_presets', JSON.stringify({
                'test-preset': { name: 'test-preset', config: { keystone: 'content', relationships: {} } }
            }));

            const m = new LayerPresetManager(graph, { storage: mockStorage });
            expect(m.count).toBe(1);
            expect(m.has('test-preset')).toBe(true);
        });

        it('handles null storage gracefully', () => {
            const m = new LayerPresetManager(graph, { storage: null });
            expect(m).toBeDefined();
        });
    });

    describe('save', () => {
        it('saves current graph state', () => {
            const preset = manager.save('my-look');
            expect(preset.name).toBe('my-look');
            expect(preset.config).toBeDefined();
            expect(preset.config.keystone).toBe('content');
            expect(preset.metadata.createdAt).toBeDefined();
        });

        it('persists to storage', () => {
            manager.save('my-look');
            const stored = JSON.parse(mockStorage._data.vib3_layer_presets);
            expect(stored['my-look']).toBeDefined();
        });

        it('rejects empty name', () => {
            expect(() => manager.save('')).toThrow('non-empty string');
            expect(() => manager.save(null)).toThrow('non-empty string');
        });

        it('rejects built-in profile names', () => {
            expect(() => manager.save('holographic')).toThrow('Cannot overwrite built-in');
            expect(() => manager.save('legacy')).toThrow('Cannot overwrite built-in');
        });

        it('allows overwriting user presets', () => {
            manager.save('my-look', { description: 'v1' });
            const updated = manager.save('my-look', { description: 'v2' });
            expect(updated.metadata.description).toBe('v2');
            expect(manager.count).toBe(1);
        });
    });

    describe('load', () => {
        it('loads a user preset into the graph', () => {
            // Save with holographic profile
            manager.save('saved-holo');

            // Switch graph to a different profile
            graph.loadProfile('storm');
            expect(graph.activeProfile).toBe('storm');

            // Load the saved preset
            const loaded = manager.load('saved-holo');
            expect(loaded).toBe(true);
            expect(graph.activeProfile).toBe('holographic');
        });

        it('loads a built-in profile', () => {
            graph.loadProfile('storm');
            const loaded = manager.load('symmetry');
            expect(loaded).toBe(true);
            expect(graph.activeProfile).toBe('symmetry');
        });

        it('returns false for unknown preset', () => {
            expect(manager.load('nonexistent')).toBe(false);
        });
    });

    describe('delete', () => {
        it('deletes a user preset', () => {
            manager.save('temp');
            expect(manager.has('temp')).toBe(true);

            const deleted = manager.delete('temp');
            expect(deleted).toBe(true);
            expect(manager.has('temp')).toBe(false);
        });

        it('returns false for non-existent preset', () => {
            expect(manager.delete('nope')).toBe(false);
        });

        it('cannot delete built-in profiles', () => {
            expect(() => manager.delete('holographic')).toThrow('Cannot delete built-in');
        });
    });

    describe('list', () => {
        it('returns user and built-in presets', () => {
            manager.save('custom-1');
            manager.save('custom-2');

            const { user, builtIn } = manager.list();
            expect(user).toContain('custom-1');
            expect(user).toContain('custom-2');
            expect(builtIn).toContain('holographic');
            expect(builtIn).toContain('legacy');
        });

        it('listAll returns flat array', () => {
            manager.save('custom-1');
            const all = manager.listAll();
            expect(all).toContain('holographic');
            expect(all).toContain('custom-1');
        });
    });

    describe('tune', () => {
        it('tunes a layer relationship config', () => {
            // holographic profile has shadow with complement preset
            const tuned = manager.tune('shadow', { opacity: 0.8 });
            expect(tuned).toBe(true);

            // Verify the graph was updated
            const config = graph.exportConfig();
            expect(config.relationships.shadow.config.opacity).toBe(0.8);
        });

        it('preserves other config values when tuning', () => {
            const beforeConfig = graph.exportConfig().relationships.shadow;
            const originalDensityPivot = beforeConfig.config.densityPivot;

            manager.tune('shadow', { opacity: 0.9 });

            const afterConfig = graph.exportConfig().relationships.shadow;
            expect(afterConfig.config.densityPivot).toBe(originalDensityPivot);
            expect(afterConfig.config.opacity).toBe(0.9);
        });

        it('returns false for keystone layer', () => {
            // Content is the keystone, has no relationship config
            const tuned = manager.tune('content', { opacity: 0.5 });
            expect(tuned).toBe(false);
        });

        it('returns false for invalid input', () => {
            expect(manager.tune('shadow', null)).toBe(false);
            expect(manager.tune('shadow', 'invalid')).toBe(false);
        });
    });

    describe('getLayerConfig', () => {
        it('returns current config for a layer', () => {
            const config = manager.getLayerConfig('shadow');
            expect(config).toBeDefined();
            expect(config.preset).toBe('complement');
        });

        it('returns null for keystone layer', () => {
            const config = manager.getLayerConfig('content');
            expect(config).toBeNull();
        });
    });

    describe('import / export', () => {
        it('exports and imports a library', () => {
            manager.save('preset-a', { description: 'Alpha' });
            manager.save('preset-b', { description: 'Beta' });

            const lib = manager.exportLibrary();
            expect(lib.version).toBe('1.0');
            expect(lib.type).toBe('vib3_layer_presets');
            expect(lib.count).toBe(2);
            expect(lib.presets['preset-a']).toBeDefined();

            // Import into a fresh manager
            const graph2 = new LayerRelationshipGraph({ profile: 'holographic' });
            const manager2 = new LayerPresetManager(graph2, { storage: mockStorage });
            manager2.clear();

            const result = manager2.importLibrary(lib);
            expect(result.imported).toBe(2);
            expect(result.skipped).toBe(0);
            expect(manager2.has('preset-a')).toBe(true);
            expect(manager2.has('preset-b')).toBe(true);
        });

        it('does not overwrite existing presets by default', () => {
            manager.save('existing');
            const lib = manager.exportLibrary();

            const result = manager.importLibrary(lib);
            expect(result.imported).toBe(0);
            expect(result.skipped).toBe(1);
        });

        it('overwrites when requested', () => {
            manager.save('existing', { description: 'old' });
            const lib = manager.exportLibrary();
            lib.presets.existing.metadata.description = 'new';

            const result = manager.importLibrary(lib, { overwrite: true });
            expect(result.imported).toBe(1);
        });

        it('rejects invalid library format', () => {
            expect(() => manager.importLibrary(null)).toThrow('Invalid library format');
            expect(() => manager.importLibrary({})).toThrow('Invalid library format');
        });

        it('never overwrites built-in profile names', () => {
            const lib = {
                presets: {
                    holographic: { name: 'holographic', config: {} }
                }
            };
            const result = manager.importLibrary(lib);
            expect(result.skipped).toBe(1);
        });
    });

    describe('clear', () => {
        it('removes all user presets', () => {
            manager.save('a');
            manager.save('b');
            expect(manager.count).toBe(2);

            manager.clear();
            expect(manager.count).toBe(0);
        });
    });
});
