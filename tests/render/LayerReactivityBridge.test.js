/**
 * Tests for LayerReactivityBridge
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { LayerReactivityBridge, MODULATION_PROFILES } from '../../src/render/LayerReactivityBridge.js';
import { LayerRelationshipGraph } from '../../src/render/LayerRelationshipGraph.js';

describe('LayerReactivityBridge', () => {
    let graph;
    let bridge;

    beforeEach(() => {
        graph = new LayerRelationshipGraph({ profile: 'storm' }); // storm has reactive presets
        bridge = new LayerReactivityBridge(graph);
    });

    describe('constructor', () => {
        it('creates with a graph', () => {
            expect(bridge).toBeDefined();
            expect(bridge.isActive).toBe(false);
            expect(bridge.mappings).toHaveLength(0);
            expect(bridge.activeProfile).toBeNull();
        });
    });

    describe('addModulation', () => {
        it('adds a single modulation mapping', () => {
            bridge.addModulation('audio', 'bass', 'shadow', 'gain', {
                scale: 3.0, baseline: 2.0
            });
            expect(bridge.mappings).toHaveLength(1);
            expect(bridge.mappings[0].source).toBe('audio');
            expect(bridge.mappings[0].channel).toBe('bass');
            expect(bridge.mappings[0].layerName).toBe('shadow');
            expect(bridge.mappings[0].configKey).toBe('gain');
        });

        it('adds multiple mappings', () => {
            bridge.addModulation('audio', 'bass', 'shadow', 'gain', { scale: 1.0, baseline: 1.0 });
            bridge.addModulation('audio', 'mid', 'highlight', 'gain', { scale: 2.0, baseline: 2.0 });
            bridge.addModulation('tilt', 'gamma', 'accent', 'hueAngle', { scale: 5.0, baseline: 100 });
            expect(bridge.mappings).toHaveLength(3);
        });

        it('clears active profile when adding custom mapping', () => {
            bridge.loadModulationProfile('audioStorm');
            expect(bridge.activeProfile).toBe('audioStorm');

            bridge.addModulation('audio', 'bass', 'shadow', 'gain', { scale: 1.0, baseline: 1.0 });
            expect(bridge.activeProfile).toBeNull();
        });
    });

    describe('removeModulationsForLayer', () => {
        it('removes mappings for a specific layer', () => {
            bridge.addModulation('audio', 'bass', 'shadow', 'gain', { scale: 1.0, baseline: 1.0 });
            bridge.addModulation('audio', 'mid', 'shadow', 'opacity', { scale: 0.5, baseline: 0.3 });
            bridge.addModulation('audio', 'high', 'accent', 'gain', { scale: 2.0, baseline: 2.0 });
            expect(bridge.mappings).toHaveLength(3);

            const removed = bridge.removeModulationsForLayer('shadow');
            expect(removed).toBe(2);
            expect(bridge.mappings).toHaveLength(1);
            expect(bridge.mappings[0].layerName).toBe('accent');
        });

        it('returns 0 when no mappings match', () => {
            bridge.addModulation('audio', 'bass', 'shadow', 'gain', { scale: 1.0, baseline: 1.0 });
            const removed = bridge.removeModulationsForLayer('highlight');
            expect(removed).toBe(0);
        });
    });

    describe('clearModulations', () => {
        it('removes all mappings', () => {
            bridge.addModulation('audio', 'bass', 'shadow', 'gain', { scale: 1.0, baseline: 1.0 });
            bridge.addModulation('tilt', 'gamma', 'accent', 'hueAngle', { scale: 5.0, baseline: 100 });
            bridge.clearModulations();
            expect(bridge.mappings).toHaveLength(0);
        });
    });

    describe('loadModulationProfile', () => {
        it('loads audioStorm profile', () => {
            const loaded = bridge.loadModulationProfile('audioStorm');
            expect(loaded).toBe(true);
            expect(bridge.activeProfile).toBe('audioStorm');
            expect(bridge.mappings.length).toBe(MODULATION_PROFILES.audioStorm.length);
        });

        it('loads tiltHarmonic profile', () => {
            const loaded = bridge.loadModulationProfile('tiltHarmonic');
            expect(loaded).toBe(true);
            expect(bridge.activeProfile).toBe('tiltHarmonic');
        });

        it('loads mouseChase profile', () => {
            const loaded = bridge.loadModulationProfile('mouseChase');
            expect(loaded).toBe(true);
            expect(bridge.activeProfile).toBe('mouseChase');
        });

        it('loads audioPulse profile', () => {
            const loaded = bridge.loadModulationProfile('audioPulse');
            expect(loaded).toBe(true);
            expect(bridge.activeProfile).toBe('audioPulse');
        });

        it('loads fullReactive profile', () => {
            const loaded = bridge.loadModulationProfile('fullReactive');
            expect(loaded).toBe(true);
            expect(bridge.activeProfile).toBe('fullReactive');
        });

        it('returns false for unknown profile', () => {
            const loaded = bridge.loadModulationProfile('nonexistent');
            expect(loaded).toBe(false);
        });

        it('replaces existing mappings', () => {
            bridge.addModulation('audio', 'bass', 'shadow', 'gain', { scale: 1.0, baseline: 1.0 });
            bridge.loadModulationProfile('audioStorm');
            expect(bridge.mappings.length).toBe(MODULATION_PROFILES.audioStorm.length);
        });
    });

    describe('static profileNames', () => {
        it('lists all available profiles', () => {
            const names = LayerReactivityBridge.profileNames;
            expect(names).toContain('audioStorm');
            expect(names).toContain('tiltHarmonic');
            expect(names).toContain('mouseChase');
            expect(names).toContain('audioPulse');
            expect(names).toContain('fullReactive');
        });
    });

    describe('activate / deactivate', () => {
        it('toggles active state', () => {
            expect(bridge.isActive).toBe(false);
            bridge.activate();
            expect(bridge.isActive).toBe(true);
            bridge.deactivate();
            expect(bridge.isActive).toBe(false);
        });
    });

    describe('update', () => {
        it('returns empty when not active', () => {
            bridge.loadModulationProfile('audioStorm');
            const result = bridge.update({ audio: { bass: 1.0, mid: 0.5, high: 0.3 } });
            expect(result).toEqual({});
        });

        it('returns empty when no mappings', () => {
            bridge.activate();
            const result = bridge.update({ audio: { bass: 1.0 } });
            expect(result).toEqual({});
        });

        it('applies audio modulation to reactive gain', () => {
            bridge.loadModulationProfile('audioStorm');
            bridge.activate();

            const result = bridge.update({
                audio: { bass: 0.8, mid: 0.5, high: 0.3 }
            });

            // audioStorm maps bass → shadow gain, etc.
            expect(result.shadow).toBeDefined();
            expect(result.shadow.gain).toBeDefined();
            expect(result.shadow.gain).toBeGreaterThan(0);

            // Verify the graph was updated
            const config = graph.exportConfig();
            expect(config.relationships.shadow).toBeDefined();
        });

        it('applies add mode correctly', () => {
            bridge.addModulation('audio', 'bass', 'shadow', 'gain', {
                scale: 5.0, baseline: 2.0, min: 0, max: 20, mode: 'add'
            });
            bridge.activate();

            const result = bridge.update({ audio: { bass: 1.0 } });
            // baseline(2) + input(1.0) * scale(5) = 7.0
            expect(result.shadow.gain).toBe(7.0);
        });

        it('applies multiply mode correctly', () => {
            bridge.addModulation('audio', 'bass', 'shadow', 'gain', {
                scale: 2.0, baseline: 3.0, mode: 'multiply'
            });
            bridge.activate();

            const result = bridge.update({ audio: { bass: 0.5 } });
            // baseline(3) * (1 + input(0.5) * scale(2)) = 3 * 2 = 6.0
            expect(result.shadow.gain).toBe(6.0);
        });

        it('clamps values to min/max', () => {
            bridge.addModulation('audio', 'bass', 'shadow', 'gain', {
                scale: 100.0, baseline: 0, min: 0.5, max: 10.0, mode: 'add'
            });
            bridge.activate();

            const result = bridge.update({ audio: { bass: 1.0 } });
            // baseline(0) + input(1.0) * scale(100) = 100, clamped to max 10.0
            expect(result.shadow.gain).toBe(10.0);
        });

        it('ignores missing input sources', () => {
            bridge.addModulation('audio', 'bass', 'shadow', 'gain', { scale: 1.0, baseline: 1.0 });
            bridge.activate();

            const result = bridge.update({ tilt: { gamma: 15 } }); // no audio
            expect(result).toEqual({});
        });

        it('ignores missing channels', () => {
            bridge.addModulation('audio', 'bass', 'shadow', 'gain', { scale: 1.0, baseline: 1.0 });
            bridge.activate();

            const result = bridge.update({ audio: { mid: 0.5 } }); // no bass
            expect(result).toEqual({});
        });

        it('handles tilt modulation', () => {
            bridge.loadModulationProfile('tiltHarmonic');
            bridge.activate();

            // Need to use chord or harmonic profile on graph for harmonic config keys
            graph.loadProfile('chord');

            const result = bridge.update({
                tilt: { alpha: 10, beta: 20, gamma: 30 }
            });

            // tiltHarmonic maps gamma → shadow hueAngle, beta → highlight densityHarmonic
            expect(Object.keys(result).length).toBeGreaterThan(0);
        });

        it('handles mouse modulation', () => {
            bridge.loadModulationProfile('mouseChase');
            bridge.activate();

            // Need chase relationships for lerpRate tuning
            graph.loadProfile('symmetry'); // symmetry has chase on accent

            const result = bridge.update({
                mouse: { x: 0.8, y: 0.3 }
            });

            expect(Object.keys(result).length).toBeGreaterThan(0);
        });
    });

    describe('serialization', () => {
        it('exports and imports config', () => {
            bridge.loadModulationProfile('audioStorm');
            bridge.activate();

            const config = bridge.exportConfig();
            expect(config.profile).toBe('audioStorm');
            expect(config.mappings.length).toBe(MODULATION_PROFILES.audioStorm.length);
            expect(config.active).toBe(true);

            // Import into new bridge
            const graph2 = new LayerRelationshipGraph({ profile: 'storm' });
            const bridge2 = new LayerReactivityBridge(graph2);
            bridge2.importConfig(config);

            expect(bridge2.activeProfile).toBe('audioStorm');
            expect(bridge2.isActive).toBe(true);
            expect(bridge2.mappings.length).toBe(MODULATION_PROFILES.audioStorm.length);
        });

        it('exports custom mappings', () => {
            bridge.addModulation('audio', 'bass', 'shadow', 'gain', { scale: 3.0, baseline: 2.0 });
            bridge.addModulation('tilt', 'gamma', 'accent', 'hueAngle', { scale: 5.0, baseline: 100 });

            const config = bridge.exportConfig();
            expect(config.profile).toBeNull();
            expect(config.mappings).toHaveLength(2);
        });

        it('handles null config import', () => {
            bridge.importConfig(null); // should not throw
            expect(bridge.mappings).toHaveLength(0);
        });
    });

    describe('MODULATION_PROFILES', () => {
        it('audioStorm has correct structure', () => {
            const profile = MODULATION_PROFILES.audioStorm;
            expect(Array.isArray(profile)).toBe(true);
            for (const m of profile) {
                expect(m.source).toBeDefined();
                expect(m.channel).toBeDefined();
                expect(m.layerName).toBeDefined();
                expect(m.configKey).toBeDefined();
                expect(typeof m.scale).toBe('number');
                expect(typeof m.baseline).toBe('number');
            }
        });

        it('all profiles have valid structure', () => {
            for (const [name, profile] of Object.entries(MODULATION_PROFILES)) {
                expect(Array.isArray(profile)).toBe(true);
                expect(profile.length).toBeGreaterThan(0);
                for (const m of profile) {
                    expect(typeof m.source).toBe('string');
                    expect(typeof m.channel).toBe('string');
                    expect(typeof m.layerName).toBe('string');
                    expect(typeof m.configKey).toBe('string');
                }
            }
        });
    });
});
