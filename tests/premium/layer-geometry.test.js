/**
 * Tests for LayerGeometryMixer — Premium Module 3
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LayerGeometryMixer } from '../../src/premium/LayerGeometryMixer.js';

function createMockEngine() {
    return {
        _layerGeometryOverrides: null,
        activeSystem: {
            name: 'holographic',
            layerGraph: { setRelationship: vi.fn() }
        },
        getParameter: vi.fn((name) => {
            if (name === 'geometry') return 5;
            return 0;
        }),
        updateCurrentSystemParameters: vi.fn(),
    };
}

describe('LayerGeometryMixer', () => {
    let engine;
    let mixer;

    beforeEach(() => {
        engine = createMockEngine();
        mixer = new LayerGeometryMixer(engine);
    });

    describe('construction', () => {
        it('starts with no geometry overrides', () => {
            const geoms = mixer.getLayerGeometries();
            // All layers should match current geometry (5)
            expect(geoms.background).toBe(5);
            expect(geoms.shadow).toBe(5);
            expect(geoms.content).toBe(5);
            expect(geoms.highlight).toBe(5);
            expect(geoms.accent).toBe(5);
        });
    });

    describe('setLayerGeometry', () => {
        it('sets explicit geometry for a layer', () => {
            mixer.setLayerGeometry('background', 10);
            const geoms = mixer.getLayerGeometries();
            expect(geoms.background).toBe(10);
            expect(geoms.content).toBe(5); // Others unchanged
        });

        it('throws on invalid layer name', () => {
            expect(() => mixer.setLayerGeometry('invalid', 5)).toThrow(/Invalid layer/);
        });

        it('throws on geometry out of range', () => {
            expect(() => mixer.setLayerGeometry('background', 24)).toThrow();
            expect(() => mixer.setLayerGeometry('background', -1)).toThrow();
        });

        it('clears any offset for that layer', () => {
            mixer.setGeometryOffset('background', 3);
            mixer.setLayerGeometry('background', 10);
            const geoms = mixer.getLayerGeometries();
            expect(geoms.background).toBe(10); // Explicit, not offset
        });

        it('pushes overrides to engine', () => {
            mixer.setLayerGeometry('background', 10);
            expect(engine.updateCurrentSystemParameters).toHaveBeenCalled();
            expect(engine._layerGeometryOverrides).toBeDefined();
            expect(engine._layerGeometryOverrides.background).toBe(10);
        });
    });

    describe('setGeometryOffset', () => {
        it('sets an offset from keystone geometry', () => {
            mixer.setGeometryOffset('shadow', 3);
            const geoms = mixer.getLayerGeometries();
            expect(geoms.shadow).toBe(8); // 5 + 3
        });

        it('wraps at 24', () => {
            mixer.setGeometryOffset('shadow', 20);
            const geoms = mixer.getLayerGeometries();
            expect(geoms.shadow).toBe(1); // (5 + 20) % 24 = 1
        });

        it('handles negative offsets', () => {
            mixer.setGeometryOffset('shadow', -3);
            const geoms = mixer.getLayerGeometries();
            expect(geoms.shadow).toBe(2); // (5 - 3 + 24) % 24 = 2
        });

        it('clears any explicit geometry for that layer', () => {
            mixer.setLayerGeometry('shadow', 10);
            mixer.setGeometryOffset('shadow', 2);
            const geoms = mixer.getLayerGeometries();
            expect(geoms.shadow).toBe(7); // offset, not explicit
        });

        it('throws on invalid layer name', () => {
            expect(() => mixer.setGeometryOffset('invalid', 3)).toThrow(/Invalid layer/);
        });
    });

    describe('clearLayerGeometry', () => {
        it('reverts a layer to keystone geometry', () => {
            mixer.setLayerGeometry('highlight', 15);
            mixer.clearLayerGeometry('highlight');
            const geoms = mixer.getLayerGeometries();
            expect(geoms.highlight).toBe(5); // Back to keystone
        });

        it('clears both explicit and offset', () => {
            mixer.setGeometryOffset('accent', 4);
            mixer.clearLayerGeometry('accent');
            const geoms = mixer.getLayerGeometries();
            expect(geoms.accent).toBe(5);
        });

        it('throws on invalid layer name', () => {
            expect(() => mixer.clearLayerGeometry('invalid')).toThrow(/Invalid layer/);
        });
    });

    describe('clearAll', () => {
        it('clears all layer overrides', () => {
            mixer.setLayerGeometry('background', 10);
            mixer.setLayerGeometry('shadow', 15);
            mixer.setGeometryOffset('accent', 3);
            mixer.clearAll();
            const geoms = mixer.getLayerGeometries();
            for (const layer of ['background', 'shadow', 'content', 'highlight', 'accent']) {
                expect(geoms[layer]).toBe(5);
            }
        });
    });

    describe('exportState / importState', () => {
        it('round-trips state', () => {
            mixer.setLayerGeometry('background', 10);
            mixer.setGeometryOffset('accent', 3);
            const state = mixer.exportState();

            const mixer2 = new LayerGeometryMixer(engine);
            mixer2.importState(state);

            const geoms = mixer2.getLayerGeometries();
            expect(geoms.background).toBe(10);
            expect(geoms.accent).toBe(8); // 5 + 3
        });

        it('ignores invalid layers on import', () => {
            mixer.importState({
                geometries: { invalid: 10 },
                offsets: { alsoInvalid: 3 }
            });
            // Should not throw, should have no overrides
        });
    });

    describe('destroy', () => {
        it('cleans up engine reference', () => {
            mixer.setLayerGeometry('background', 10);
            mixer.destroy();
            expect(engine._layerGeometryOverrides).toBeUndefined();
        });
    });
});
