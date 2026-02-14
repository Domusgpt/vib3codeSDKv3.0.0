import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ChoreographyPlayer } from '../../src/creative/ChoreographyPlayer.js';

// ── Mock engine factory ──
function createMockEngine() {
    const engine = {
        parameters: {},
        currentSystemName: 'quantum',
        setParameter: vi.fn(function (name, value) {
            engine.parameters[name] = value;
        }),
        getParameter: vi.fn(function (name) {
            return engine.parameters[name] ?? 0;
        }),
        switchSystem: vi.fn(async function (system) {
            engine.currentSystemName = system;
        }),
        getCurrentSystem: vi.fn(function () {
            return engine.currentSystemName;
        })
    };
    return engine;
}

// ── Minimal choreography spec ──
function createBasicSpec() {
    return {
        id: 'test_choreo',
        name: 'Test Choreography',
        duration_ms: 10000,
        bpm: 120,
        scenes: [
            {
                time_start: 0,
                time_end: 5000,
                system: 'quantum',
                geometry: 11,
                transition_in: { type: 'cut', duration: 0 },
                tracks: {
                    hue: [
                        { time: 0, value: 0, easing: 'linear' },
                        { time: 5000, value: 180, easing: 'easeInOut' }
                    ]
                },
                color_preset: 'Ocean',
                post_processing: []
            },
            {
                time_start: 5000,
                time_end: 10000,
                system: 'holographic',
                geometry: 5,
                transition_in: { type: 'crossfade', duration: 1000 },
                tracks: {
                    chaos: [
                        { time: 0, value: 0.1 },
                        { time: 5000, value: 0.8 }
                    ]
                },
                color_preset: 'Galaxy',
                post_processing: ['bloom']
            }
        ]
    };
}

describe('ChoreographyPlayer', () => {
    let player;
    let engine;

    beforeEach(() => {
        engine = createMockEngine();
        player = new ChoreographyPlayer(engine);
    });

    afterEach(async () => {
        // Wait for any pending async _enterScene calls
        await new Promise(r => setTimeout(r, 30));
        if (player) player.destroy();
    });

    describe('constructor', () => {
        it('requires an engine', () => {
            expect(() => new ChoreographyPlayer(null)).toThrow('requires a VIB3Engine');
        });

        it('initializes with default state', () => {
            expect(player.playing).toBe(false);
            expect(player.currentTime).toBe(0);
            expect(player.activeSceneIndex).toBe(-1);
            expect(player.spec).toBeNull();
            expect(player.playbackSpeed).toBe(1.0);
            expect(player.loopMode).toBe('once');
        });

        it('accepts optional callbacks', () => {
            const onScene = vi.fn();
            const onComplete = vi.fn();
            const onTick = vi.fn();
            const p = new ChoreographyPlayer(engine, {
                onSceneChange: onScene,
                onComplete: onComplete,
                onTick: onTick
            });
            expect(p._onSceneChange).toBe(onScene);
            expect(p._onComplete).toBe(onComplete);
            expect(p._onTick).toBe(onTick);
            p.destroy();
        });
    });

    describe('load', () => {
        it('loads a valid choreography spec', () => {
            const spec = createBasicSpec();
            const result = player.load(spec);
            expect(result).toBe(true);
            expect(player.spec).not.toBeNull();
            expect(player.spec.id).toBe('test_choreo');
            expect(player.spec.scene_count).toBe(2);
            expect(player.spec.duration_ms).toBe(10000);
        });

        it('rejects invalid specs', () => {
            expect(player.load(null)).toBe(false);
            expect(player.load({})).toBe(false);
            expect(player.load({ scenes: [] })).toBe(false);
        });

        it('sorts scenes by start time', () => {
            const spec = createBasicSpec();
            // Swap scene order
            const temp = spec.scenes[0];
            spec.scenes[0] = spec.scenes[1];
            spec.scenes[1] = temp;

            player.load(spec);
            expect(player.spec.scenes[0].time_start).toBe(0);
            expect(player.spec.scenes[1].time_start).toBe(5000);
        });

        it('generates ID if not provided', () => {
            const spec = createBasicSpec();
            delete spec.id;
            player.load(spec);
            expect(player.spec.id).toMatch(/^choreo_/);
        });

        it('infers duration from scene end times if not provided', () => {
            const spec = createBasicSpec();
            delete spec.duration_ms;
            player.load(spec);
            expect(player.spec.duration_ms).toBe(10000);
        });

        it('resets playback state on load', () => {
            player.load(createBasicSpec());
            player.currentTime = 5000;
            player.activeSceneIndex = 1;

            player.load(createBasicSpec());
            expect(player.currentTime).toBe(0);
            expect(player.activeSceneIndex).toBe(-1);
        });

        it('fills in defaults for scene properties', () => {
            const spec = {
                duration_ms: 5000,
                scenes: [{ time_start: 0, time_end: 5000, system: 'quantum' }]
            };
            player.load(spec);
            const scene = player.spec.scenes[0];
            expect(scene.geometry).toBe(0);
            expect(scene.transition_in).toEqual({ type: 'cut', duration: 0 });
            expect(scene.tracks).toEqual({});
            expect(scene.color_preset).toBeNull();
            expect(scene.post_processing).toEqual([]);
        });
    });

    describe('getState', () => {
        it('returns empty state when no spec loaded', () => {
            const state = player.getState();
            expect(state.playing).toBe(false);
            expect(state.duration).toBe(0);
            expect(state.activeScene).toBeNull();
            expect(state.sceneCount).toBe(0);
        });

        it('returns populated state after load', () => {
            player.load(createBasicSpec());
            const state = player.getState();
            expect(state.playing).toBe(false);
            expect(state.duration).toBe(10000);
            expect(state.sceneCount).toBe(2);
            expect(state.progress).toBe(0);
            expect(state.playbackSpeed).toBe(1.0);
        });
    });

    describe('seek', () => {
        it('seeks to an absolute time', () => {
            player.load(createBasicSpec());
            player.seek(3000);
            expect(player.currentTime).toBe(3000);
        });

        it('clamps to valid range', () => {
            player.load(createBasicSpec());
            player.seek(-100);
            expect(player.currentTime).toBe(0);
            player.seek(99999);
            expect(player.currentTime).toBe(10000);
        });

        it('triggers scene evaluation on seek', () => {
            player.load(createBasicSpec());
            player.seek(6000);
            // Should be in scene 2 (holographic, index 1)
            expect(player.activeSceneIndex).toBe(1);
            expect(engine.switchSystem).toHaveBeenCalledWith('holographic');
        });

        it('does nothing without a spec', () => {
            player.seek(5000);
            expect(player.currentTime).toBe(0);
        });
    });

    describe('seekToPercent', () => {
        it('seeks to a percentage of total duration', () => {
            player.load(createBasicSpec());
            player.seekToPercent(0.5);
            expect(player.currentTime).toBe(5000);
        });

        it('clamps percent to 0-1', () => {
            player.load(createBasicSpec());
            player.seekToPercent(-0.5);
            expect(player.currentTime).toBe(0);
            player.seekToPercent(2.0);
            expect(player.currentTime).toBe(10000);
        });
    });

    describe('scene transitions', () => {
        it('switches system when entering a new scene', () => {
            player.load(createBasicSpec());
            player.seek(6000);
            expect(engine.switchSystem).toHaveBeenCalledWith('holographic');
        });

        it('sets geometry when entering a scene', () => {
            player.load(createBasicSpec());
            player.seek(100);
            expect(engine.setParameter).toHaveBeenCalledWith('geometry', 11);
        });

        it('applies color preset when entering a scene', () => {
            player.load(createBasicSpec());
            player.seek(100);
            // Ocean preset: hue=200, saturation=0.8, intensity=0.6
            expect(engine.setParameter).toHaveBeenCalledWith('hue', 200);
            expect(engine.setParameter).toHaveBeenCalledWith('saturation', 0.8);
            expect(engine.setParameter).toHaveBeenCalledWith('intensity', 0.6);
        });

        it('fires onSceneChange callback', async () => {
            const onScene = vi.fn();
            player.destroy();
            player = new ChoreographyPlayer(engine, { onSceneChange: onScene });
            player.load(createBasicSpec());
            player.seek(100);
            // _enterScene is async — wait for it to complete
            await new Promise(r => setTimeout(r, 20));
            expect(onScene).toHaveBeenCalledWith(0, expect.objectContaining({
                system: 'quantum',
                geometry: 11
            }));
        });

        it('does not re-enter same scene on multiple seeks within same scene', () => {
            player.load(createBasicSpec());
            player.seek(100);
            engine.switchSystem.mockClear();
            engine.setParameter.mockClear();

            player.seek(2000);
            // Should NOT switch system again (already in scene 0)
            expect(engine.switchSystem).not.toHaveBeenCalled();
        });
    });

    describe('stop', () => {
        it('resets to beginning', () => {
            player.load(createBasicSpec());
            player.seek(5000);
            player.stop();
            expect(player.currentTime).toBe(0);
            expect(player.activeSceneIndex).toBe(-1);
            expect(player.playing).toBe(false);
        });
    });

    describe('destroy', () => {
        it('cleans up resources', async () => {
            player.load(createBasicSpec());
            player.seek(100);
            // Wait for async _enterScene to complete before destroy
            await new Promise(r => setTimeout(r, 20));
            player.destroy();
            expect(player.spec).toBeNull();
            expect(player.playing).toBe(false);
        });

        it('is safe to call multiple times', () => {
            player.destroy();
            expect(() => player.destroy()).not.toThrow();
        });
    });

    describe('COLOR_PRESET_MAP', () => {
        it('contains all 22 presets', () => {
            const presets = Object.keys(ChoreographyPlayer.COLOR_PRESET_MAP);
            expect(presets.length).toBe(22);
        });

        it('each preset has hue, saturation, intensity', () => {
            for (const [name, preset] of Object.entries(ChoreographyPlayer.COLOR_PRESET_MAP)) {
                expect(preset).toHaveProperty('hue');
                expect(preset).toHaveProperty('saturation');
                expect(preset).toHaveProperty('intensity');
                expect(typeof preset.hue).toBe('number');
                expect(typeof preset.saturation).toBe('number');
                expect(typeof preset.intensity).toBe('number');
            }
        });

        it('includes expected presets', () => {
            expect(ChoreographyPlayer.COLOR_PRESET_MAP).toHaveProperty('Ocean');
            expect(ChoreographyPlayer.COLOR_PRESET_MAP).toHaveProperty('Neon');
            expect(ChoreographyPlayer.COLOR_PRESET_MAP).toHaveProperty('Cyberpunk');
            expect(ChoreographyPlayer.COLOR_PRESET_MAP).toHaveProperty('Vaporwave');
        });
    });
});
