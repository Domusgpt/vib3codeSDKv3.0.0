/**
 * Tests for ChoreographyExtensions — Premium Module 6
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChoreographyExtensions } from '../../src/premium/ChoreographyExtensions.js';

function createMockEngine() {
    return {
        activeSystem: {
            loadRelationshipProfile: vi.fn(),
            layerGraph: {
                setRelationship: vi.fn()
            }
        },
        setParameter: vi.fn(),
        setParameters: vi.fn(),
    };
}

function createMockPremium() {
    return {
        events: {
            clearSceneTriggers: vi.fn(),
            addSceneTrigger: vi.fn(),
        },
        rotationLock: {
            unlockAll: vi.fn(),
            lockAxis: vi.fn(),
        },
        layerGeometry: {
            setLayerGeometry: vi.fn(),
        },
    };
}

function createMockPlayer() {
    return {
        onSceneChange: null,
        _simulateSceneChange(index, scene) {
            if (this.onSceneChange) this.onSceneChange(index, scene);
        }
    };
}

describe('ChoreographyExtensions', () => {
    let engine;
    let premium;
    let ext;

    beforeEach(() => {
        engine = createMockEngine();
        premium = createMockPremium();
        ext = new ChoreographyExtensions(engine, premium);
    });

    describe('createExtendedChoreography', () => {
        it('validates a basic choreography spec', () => {
            const spec = {
                name: 'test',
                scenes: [
                    { system: 'quantum', geometry: 5, duration: 2000 }
                ]
            };
            const result = ext.createExtendedChoreography(spec);
            expect(result).toBe(spec);
        });

        it('validates premium fields', () => {
            const spec = {
                scenes: [
                    {
                        system: 'quantum',
                        duration: 2000,
                        layer_profile: 'storm',
                        layer_overrides: { background: { type: 'echo' } },
                        triggers: [{ source: 'parameter.chaos', condition: 'exceeds', threshold: 0.5, action: { type: 'set_parameters' } }],
                        rotation_locks: { rot4dXY: 0.0 },
                        layer_geometries: { background: 10 }
                    }
                ]
            };
            expect(() => ext.createExtendedChoreography(spec)).not.toThrow();
        });

        it('throws on missing scenes', () => {
            expect(() => ext.createExtendedChoreography({})).toThrow(/scenes array/);
            expect(() => ext.createExtendedChoreography({ scenes: 'not array' })).toThrow(/scenes array/);
        });

        it('throws on non-string layer_profile', () => {
            expect(() => ext.createExtendedChoreography({
                scenes: [{ layer_profile: 123 }]
            })).toThrow(/layer_profile must be a string/);
        });

        it('throws on non-object layer_overrides', () => {
            expect(() => ext.createExtendedChoreography({
                scenes: [{ layer_overrides: 'string' }]
            })).toThrow(/layer_overrides must be an object/);
        });

        it('throws on invalid layer in layer_overrides', () => {
            expect(() => ext.createExtendedChoreography({
                scenes: [{ layer_overrides: { invalid_layer: {} } }]
            })).toThrow(/invalid layer/);
        });

        it('throws on non-array triggers', () => {
            expect(() => ext.createExtendedChoreography({
                scenes: [{ triggers: 'string' }]
            })).toThrow(/triggers must be an array/);
        });

        it('throws on non-object rotation_locks', () => {
            expect(() => ext.createExtendedChoreography({
                scenes: [{ rotation_locks: 'string' }]
            })).toThrow(/rotation_locks must be an object/);
        });
    });

    describe('attachToPlayer', () => {
        it('wraps onSceneChange callback', () => {
            const player = createMockPlayer();
            const originalCb = vi.fn();
            player.onSceneChange = originalCb;

            ext.attachToPlayer(player);

            player._simulateSceneChange(0, { system: 'quantum' });
            expect(originalCb).toHaveBeenCalledWith(0, { system: 'quantum' });
        });

        it('applies layer_profile on scene change', () => {
            const player = createMockPlayer();
            ext.attachToPlayer(player);

            player._simulateSceneChange(0, {
                system: 'quantum',
                layer_profile: 'storm'
            });

            expect(engine.activeSystem.loadRelationshipProfile).toHaveBeenCalledWith('storm');
        });

        it('applies layer_overrides on scene change', () => {
            const player = createMockPlayer();
            ext.attachToPlayer(player);

            player._simulateSceneChange(0, {
                layer_overrides: {
                    background: { type: 'echo', config: { densityScale: 0.5 } }
                }
            });

            expect(engine.activeSystem.layerGraph.setRelationship).toHaveBeenCalledWith(
                'background', 'echo', { densityScale: 0.5 }
            );
        });

        it('registers scene triggers on scene change', () => {
            const player = createMockPlayer();
            ext.attachToPlayer(player);

            const trigger = {
                source: 'parameter.chaos',
                condition: 'exceeds',
                threshold: 0.5,
                action: { type: 'set_parameters', value: {} }
            };

            player._simulateSceneChange(0, {
                triggers: [trigger]
            });

            expect(premium.events.clearSceneTriggers).toHaveBeenCalled();
            expect(premium.events.addSceneTrigger).toHaveBeenCalledWith(
                'scene_0_trigger_0', trigger
            );
        });

        it('applies rotation_locks on scene change', () => {
            const player = createMockPlayer();
            ext.attachToPlayer(player);

            player._simulateSceneChange(0, {
                rotation_locks: { rot4dXY: 0.0, rot4dXZ: 1.0 }
            });

            expect(premium.rotationLock.unlockAll).toHaveBeenCalled();
            expect(premium.rotationLock.lockAxis).toHaveBeenCalledWith('rot4dXY', 0.0);
            expect(premium.rotationLock.lockAxis).toHaveBeenCalledWith('rot4dXZ', 1.0);
        });

        it('applies layer_geometries on scene change', () => {
            const player = createMockPlayer();
            ext.attachToPlayer(player);

            player._simulateSceneChange(0, {
                layer_geometries: { background: 10, accent: 15 }
            });

            expect(premium.layerGeometry.setLayerGeometry).toHaveBeenCalledWith('background', 10);
            expect(premium.layerGeometry.setLayerGeometry).toHaveBeenCalledWith('accent', 15);
        });
    });

    describe('destroy', () => {
        it('restores original onSceneChange callback', () => {
            const player = createMockPlayer();
            const originalCb = vi.fn();
            player.onSceneChange = originalCb;

            ext.attachToPlayer(player);
            ext.destroy();

            expect(player.onSceneChange).toBe(originalCb);
        });
    });
});
