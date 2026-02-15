import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    GAME_STATES,
    TRANSITIONS,
    SUDDEN_DEATH_TIMELINE,
    LAYER_PARALLAX,
    EVENT_BINDINGS,
    computeChromaticAberration,
    GlyphWarVisualizer
} from '../../../src/games/glyph-war/GlyphWarVisualizer.js';

// ── Mock engine ──
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

// ── Mock container ──
function createMockContainer() {
    return document.createElement('div');
}

// ═════════════════════════════════════════════════════════════════════════════
// Game State Presets
// ═════════════════════════════════════════════════════════════════════════════

describe('GAME_STATES', () => {
    it('defines exactly 4 states', () => {
        expect(Object.keys(GAME_STATES)).toEqual(['idle', 'dueling', 'suddenDeath', 'victory']);
    });

    it('all states target the holographic system', () => {
        for (const state of Object.values(GAME_STATES)) {
            expect(state.system).toBe('holographic');
        }
    });

    it('each state has a unique geometry index 0-23', () => {
        const geos = Object.values(GAME_STATES).map(s => s.geometry);
        expect(new Set(geos).size).toBe(4);
        for (const g of geos) {
            expect(g).toBeGreaterThanOrEqual(0);
            expect(g).toBeLessThanOrEqual(23);
        }
    });

    it('each state has a color preset string', () => {
        for (const state of Object.values(GAME_STATES)) {
            expect(typeof state.colorPreset).toBe('string');
            expect(state.colorPreset.length).toBeGreaterThan(0);
        }
    });

    it('each state has a postFxChain string', () => {
        for (const state of Object.values(GAME_STATES)) {
            expect(typeof state.postFxChain).toBe('string');
        }
    });

    it('params are within VIB3+ valid ranges', () => {
        for (const [name, state] of Object.entries(GAME_STATES)) {
            const p = state.params;
            expect(p.speed, `${name}.speed`).toBeGreaterThanOrEqual(0.1);
            expect(p.speed, `${name}.speed`).toBeLessThanOrEqual(3.0);
            expect(p.chaos, `${name}.chaos`).toBeGreaterThanOrEqual(0);
            expect(p.chaos, `${name}.chaos`).toBeLessThanOrEqual(1.0);
            expect(p.intensity, `${name}.intensity`).toBeGreaterThanOrEqual(0);
            expect(p.intensity, `${name}.intensity`).toBeLessThanOrEqual(1.0);
            expect(p.gridDensity, `${name}.gridDensity`).toBeGreaterThanOrEqual(4);
            expect(p.gridDensity, `${name}.gridDensity`).toBeLessThanOrEqual(100);
            expect(p.dimension, `${name}.dimension`).toBeGreaterThanOrEqual(3.0);
            expect(p.dimension, `${name}.dimension`).toBeLessThanOrEqual(4.5);
        }
    });

    it('idle state is calm (low speed, zero chaos)', () => {
        expect(GAME_STATES.idle.params.speed).toBeLessThanOrEqual(0.5);
        expect(GAME_STATES.idle.params.chaos).toBe(0);
    });

    it('suddenDeath state is intense (high speed, high chaos)', () => {
        expect(GAME_STATES.suddenDeath.params.speed).toBeGreaterThanOrEqual(2.0);
        expect(GAME_STATES.suddenDeath.params.chaos).toBeGreaterThanOrEqual(0.5);
    });

    it('victory state is resolved (moderate speed, zero chaos)', () => {
        expect(GAME_STATES.victory.params.chaos).toBe(0);
        expect(GAME_STATES.victory.params.intensity).toBeGreaterThanOrEqual(0.7);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// Transitions
// ═════════════════════════════════════════════════════════════════════════════

describe('TRANSITIONS', () => {
    it('covers the main state transitions', () => {
        expect(TRANSITIONS['idle:dueling']).toBeDefined();
        expect(TRANSITIONS['dueling:suddenDeath']).toBeDefined();
        expect(TRANSITIONS['suddenDeath:victory']).toBeDefined();
        expect(TRANSITIONS['dueling:victory']).toBeDefined();
        expect(TRANSITIONS['victory:idle']).toBeDefined();
    });

    it('idle→dueling is medium duration with easeOut', () => {
        const t = TRANSITIONS['idle:dueling'];
        expect(t.duration).toBeGreaterThanOrEqual(500);
        expect(t.duration).toBeLessThanOrEqual(1500);
        expect(t.easing).toBe('easeOut');
    });

    it('dueling→suddenDeath is fast with elastic snap', () => {
        const t = TRANSITIONS['dueling:suddenDeath'];
        expect(t.duration).toBeLessThanOrEqual(500);
        expect(t.easing).toBe('elastic');
    });

    it('victory transitions are slow and smooth', () => {
        const t1 = TRANSITIONS['suddenDeath:victory'];
        const t2 = TRANSITIONS['dueling:victory'];
        expect(t1.duration).toBeGreaterThanOrEqual(1000);
        expect(t2.duration).toBeGreaterThanOrEqual(1000);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// Sudden Death Timeline
// ═════════════════════════════════════════════════════════════════════════════

describe('SUDDEN_DEATH_TIMELINE', () => {
    it('is exactly 10 seconds', () => {
        expect(SUDDEN_DEATH_TIMELINE.duration).toBe(10000);
    });

    it('does not loop', () => {
        expect(SUDDEN_DEATH_TIMELINE.loopMode).toBe('once');
    });

    it('has tracks for hue, chaos, speed, gridDensity, rot4dXW, intensity', () => {
        const tracks = Object.keys(SUDDEN_DEATH_TIMELINE.tracks);
        expect(tracks).toContain('hue');
        expect(tracks).toContain('chaos');
        expect(tracks).toContain('speed');
        expect(tracks).toContain('gridDensity');
        expect(tracks).toContain('rot4dXW');
        expect(tracks).toContain('intensity');
    });

    it('chaos escalates from low to 1.0', () => {
        const kfs = SUDDEN_DEATH_TIMELINE.tracks.chaos.keyframes;
        expect(kfs[0].value).toBeLessThan(0.5);
        expect(kfs[kfs.length - 1].value).toBe(1.0);
    });

    it('speed escalates to 3.0 (max)', () => {
        const kfs = SUDDEN_DEATH_TIMELINE.tracks.speed.keyframes;
        expect(kfs[kfs.length - 1].value).toBe(3.0);
    });

    it('gridDensity escalates to 100 (max)', () => {
        const kfs = SUDDEN_DEATH_TIMELINE.tracks.gridDensity.keyframes;
        expect(kfs[kfs.length - 1].value).toBe(100);
    });

    it('rot4dXW sweeps a full rotation (0 → 6.28)', () => {
        const kfs = SUDDEN_DEATH_TIMELINE.tracks.rot4dXW.keyframes;
        expect(kfs[kfs.length - 1].value).toBeCloseTo(6.28, 1);
    });

    it('all keyframes have time within 0-10000 range', () => {
        for (const [, track] of Object.entries(SUDDEN_DEATH_TIMELINE.tracks)) {
            for (const kf of track.keyframes) {
                expect(kf.time).toBeGreaterThanOrEqual(0);
                expect(kf.time).toBeLessThanOrEqual(10000);
            }
        }
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// Parallax Layer Config
// ═════════════════════════════════════════════════════════════════════════════

describe('LAYER_PARALLAX', () => {
    it('defines all 5 holographic layers', () => {
        expect(Object.keys(LAYER_PARALLAX)).toHaveLength(5);
        expect(LAYER_PARALLAX['holo-background-canvas']).toBeDefined();
        expect(LAYER_PARALLAX['holo-shadow-canvas']).toBeDefined();
        expect(LAYER_PARALLAX['holo-content-canvas']).toBeDefined();
        expect(LAYER_PARALLAX['holo-highlight-canvas']).toBeDefined();
        expect(LAYER_PARALLAX['holo-accent-canvas']).toBeDefined();
    });

    it('background has lowest parallax (0.1)', () => {
        expect(LAYER_PARALLAX['holo-background-canvas'].parallax).toBe(0.1);
    });

    it('content layer is 1:1 tracking', () => {
        expect(LAYER_PARALLAX['holo-content-canvas'].parallax).toBe(1.0);
    });

    it('accent layer is screen-fixed (parallax 0)', () => {
        expect(LAYER_PARALLAX['holo-accent-canvas'].parallax).toBe(0.0);
    });

    it('highlight layer starts invisible (opacity 0)', () => {
        expect(LAYER_PARALLAX['holo-highlight-canvas'].baseOpacity).toBe(0.0);
    });

    it('background counter-rotates (negative factor)', () => {
        expect(LAYER_PARALLAX['holo-background-canvas'].rotationCounterFactor).toBeLessThan(0);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// Chromatic Aberration Tension Mapping
// ═════════════════════════════════════════════════════════════════════════════

describe('computeChromaticAberration', () => {
    it('returns base CA (0.02) with no tension', () => {
        expect(computeChromaticAberration({
            contestedLetters: 0,
            suddenDeath: false,
            secondsLeft: 10
        })).toBeCloseTo(0.02, 2);
    });

    it('adds 0.15 per contested letter', () => {
        const ca1 = computeChromaticAberration({ contestedLetters: 1, suddenDeath: false, secondsLeft: 10 });
        const ca2 = computeChromaticAberration({ contestedLetters: 2, suddenDeath: false, secondsLeft: 10 });
        expect(ca2 - ca1).toBeCloseTo(0.15, 2);
    });

    it('caps conflict CA at 0.6', () => {
        const ca = computeChromaticAberration({ contestedLetters: 10, suddenDeath: false, secondsLeft: 10 });
        // Base (0.02) + capped conflict (0.6) = 0.62
        expect(ca).toBeCloseTo(0.62, 2);
    });

    it('maps sudden death timer inversely (10s left = no timer CA)', () => {
        const ca = computeChromaticAberration({ contestedLetters: 0, suddenDeath: true, secondsLeft: 10 });
        expect(ca).toBeCloseTo(0.02, 2);
    });

    it('at 1 second left, timer adds ~1.8 CA', () => {
        const ca = computeChromaticAberration({ contestedLetters: 0, suddenDeath: true, secondsLeft: 1 });
        // Base (0.02) + timer ((1 - 0.1) * 2.0 = 1.8)
        expect(ca).toBeCloseTo(1.82, 1);
    });

    it('at 0 seconds left, timer adds 2.0 CA (max)', () => {
        const ca = computeChromaticAberration({ contestedLetters: 0, suddenDeath: true, secondsLeft: 0 });
        expect(ca).toBeCloseTo(2.02, 1);
    });

    it('conflicts + timer stack', () => {
        const ca = computeChromaticAberration({ contestedLetters: 3, suddenDeath: true, secondsLeft: 2 });
        // Base (0.02) + conflict (3*0.15=0.45) + timer ((1-0.2)*2.0=1.6) = 2.07
        expect(ca).toBeCloseTo(2.07, 1);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// Event Bindings
// ═════════════════════════════════════════════════════════════════════════════

describe('EVENT_BINDINGS', () => {
    it('letterGrabbed returns rot4dXW shift based on held count', () => {
        const r1 = EVENT_BINDINGS.letterGrabbed(1);
        const r3 = EVENT_BINDINGS.letterGrabbed(3);
        expect(r1.params.rot4dXW).toBeLessThan(r3.params.rot4dXW);
        expect(r1.duration).toBeGreaterThan(0);
    });

    it('letterConflict returns intensity boost', () => {
        const r = EVENT_BINDINGS.letterConflict(2);
        expect(r.params.intensity).toBeGreaterThan(0.6);
        expect(r.easing).toBe('elastic');
    });

    it('wordGrowing speed boost scales with word length', () => {
        const r3 = EVENT_BINDINGS.wordGrowing(3);
        const r7 = EVENT_BINDINGS.wordGrowing(7);
        expect(r7.params.speed).toBeGreaterThan(r3.params.speed);
    });

    it('wordGrowing speed boost is capped', () => {
        const r20 = EVENT_BINDINGS.wordGrowing(20);
        expect(r20.params.speed).toBeLessThanOrEqual(2.0);
    });

    it('dissolve triggers high morphFactor + chaos with snapback', () => {
        const r = EVENT_BINDINGS.dissolve();
        expect(r.params.morphFactor).toBe(2.0);
        expect(r.params.chaos).toBeGreaterThanOrEqual(0.8);
        expect(r.snapback).toBeDefined();
        expect(r.snapback.params.morphFactor).toBeLessThan(1.0);
    });

    it('attack transitions to sudden death params', () => {
        const r = EVENT_BINDINGS.attack();
        expect(r.params.speed).toBe(GAME_STATES.suddenDeath.params.speed);
        expect(r.easing).toBe('elastic');
    });

    it('victory returns high intensity bloom', () => {
        const r = EVENT_BINDINGS.victory('p1');
        expect(r.params.intensity).toBe(1.0);
        expect(r.duration).toBeGreaterThanOrEqual(1000);
    });
});

// ═════════════════════════════════════════════════════════════════════════════
// GlyphWarVisualizer Class
// ═════════════════════════════════════════════════════════════════════════════

describe('GlyphWarVisualizer', () => {
    let engine;
    let container;
    let viz;

    beforeEach(() => {
        engine = createMockEngine();
        container = createMockContainer();
        viz = new GlyphWarVisualizer(engine, container);
    });

    it('throws without engine', () => {
        expect(() => new GlyphWarVisualizer(null)).toThrow();
    });

    it('starts in idle state', () => {
        expect(viz.currentState).toBe('idle');
    });

    describe('init()', () => {
        it('switches to holographic system', async () => {
            await viz.init();
            expect(engine.switchSystem).toHaveBeenCalledWith('holographic');
        });

        it('sets state to idle after init', async () => {
            await viz.init();
            expect(viz.currentState).toBe('idle');
        });

        it('sets geometry parameter', async () => {
            await viz.init();
            expect(engine.setParameter).toHaveBeenCalledWith('geometry', GAME_STATES.idle.geometry);
        });
    });

    describe('setState()', () => {
        it('updates currentState', async () => {
            await viz.init();
            viz.setState('dueling');
            expect(viz.currentState).toBe('dueling');
        });

        it('sets geometry on the engine', async () => {
            await viz.init();
            viz.setState('dueling');
            expect(engine.setParameter).toHaveBeenCalledWith('geometry', 11);
        });

        it('sets geometry for suddenDeath', async () => {
            await viz.init();
            viz.setState('suddenDeath');
            expect(engine.setParameter).toHaveBeenCalledWith('geometry', 17);
        });

        it('starts sudden death timeline when entering suddenDeath', async () => {
            await viz.init();
            viz.setState('suddenDeath');
            expect(viz.deathTimeline).not.toBeNull();
        });

        it('stops sudden death timeline when leaving suddenDeath', async () => {
            await viz.init();
            viz.setState('suddenDeath');
            expect(viz.deathTimeline).not.toBeNull();
            viz.setState('victory');
            expect(viz.deathTimeline).toBeNull();
        });

        it('warns on unknown state', async () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            await viz.init();
            viz.setState('nonexistent');
            expect(warnSpy).toHaveBeenCalled();
            warnSpy.mockRestore();
        });
    });

    describe('onGameEvent()', () => {
        it('handles letterGrabbed without error', async () => {
            await viz.init();
            expect(() => viz.onGameEvent('letterGrabbed', 3)).not.toThrow();
        });

        it('handles dissolve with snapback scheduling', async () => {
            vi.useFakeTimers();
            await viz.init();
            viz.onGameEvent('dissolve');
            // After dissolve duration, snapback should be scheduled
            vi.advanceTimersByTime(300);
            vi.useRealTimers();
        });

        it('ignores unknown events silently', async () => {
            await viz.init();
            expect(() => viz.onGameEvent('unknownEvent')).not.toThrow();
        });
    });

    describe('updateTension()', () => {
        it('computes and stores CA value', async () => {
            await viz.init();
            viz.updateTension({ contestedLetters: 2, suddenDeath: false, secondsLeft: 10 });
            expect(viz.getChromaticAberration()).toBeCloseTo(0.32, 1);
        });

        it('CA increases during sudden death as timer decreases', async () => {
            await viz.init();
            viz.updateTension({ contestedLetters: 0, suddenDeath: true, secondsLeft: 8 });
            const ca8 = viz.getChromaticAberration();
            viz.updateTension({ contestedLetters: 0, suddenDeath: true, secondsLeft: 2 });
            const ca2 = viz.getChromaticAberration();
            expect(ca2).toBeGreaterThan(ca8);
        });
    });

    describe('destroy()', () => {
        it('cleans up without error', async () => {
            await viz.init();
            viz.setState('suddenDeath');
            expect(() => viz.destroy()).not.toThrow();
            expect(viz.deathTimeline).toBeNull();
        });
    });
});
