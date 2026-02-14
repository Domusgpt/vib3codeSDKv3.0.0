/**
 * GlyphWarVisualizer.js - VIB3+ Visual Integration for GLYPH_WAR
 *
 * Maps game state (idle, dueling, sudden death, victory) to VIB3+ holographic
 * layer parameters, transitions, post-processing, and a 10-second sudden-death
 * timeline. Chromatic aberration is the primary tension signal.
 *
 * Designed via /vib3-design skill — Artifact Mode.
 *
 * @module games/glyph-war/GlyphWarVisualizer
 * @version 1.0.0
 */

import { TransitionAnimator } from '../../creative/TransitionAnimator.js';
import { ParameterTimeline } from '../../creative/ParameterTimeline.js';
import { PostProcessingPipeline } from '../../creative/PostProcessingPipeline.js';
import { ColorPresetsSystem } from '../../creative/ColorPresetsSystem.js';
import { ChoreographyPlayer } from '../../creative/ChoreographyPlayer.js';

// ─────────────────────────────────────────────────────────────────────────────
// Visual State Presets (designed via /vib3-design Workflow 2)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 4 game states mapped to VIB3+ parameter snapshots.
 *
 * Each state targets the holographic system with a specific geometry,
 * color preset, post-FX chain, and tuned parameters. Geometry choices:
 *   - Idle: 3 (torus) — smooth, waiting
 *   - Dueling: 11 (hypersphere+torus) — flowing, organic tension
 *   - SuddenDeath: 17 (hypertetra+hypercube) — aggressive, angular
 *   - Victory: 8 (hypersphere+tetra) — expansive, resolved
 */
export const GAME_STATES = {
    idle: {
        system: 'holographic',
        geometry: 3,
        colorPreset: 'Monochrome',
        postFxChain: 'Clean',
        params: {
            hue: 0,
            saturation: 0.0,
            intensity: 0.3,
            speed: 0.3,
            chaos: 0.0,
            morphFactor: 0.0,
            gridDensity: 12,
            dimension: 4.2,
            rot4dXY: 0,
            rot4dXZ: 0,
            rot4dYZ: 0,
            rot4dXW: 0,
            rot4dYW: 0,
            rot4dZW: 0
        }
    },

    dueling: {
        system: 'holographic',
        geometry: 11,
        colorPreset: 'Cyberpunk',
        postFxChain: 'Holographic',
        params: {
            hue: 280,
            saturation: 0.9,
            intensity: 0.6,
            speed: 1.0,
            chaos: 0.15,
            morphFactor: 0.3,
            gridDensity: 24,
            dimension: 3.8,
            rot4dXY: 0,
            rot4dXZ: 0.3,
            rot4dYZ: 0,
            rot4dXW: 0.8,
            rot4dYW: 0.5,
            rot4dZW: 1.2
        }
    },

    suddenDeath: {
        system: 'holographic',
        geometry: 17,
        colorPreset: 'Neon',
        postFxChain: 'Glitch Art',
        params: {
            hue: 300,
            saturation: 1.0,
            intensity: 0.9,
            speed: 2.5,
            chaos: 0.7,
            morphFactor: 1.4,
            gridDensity: 60,
            dimension: 3.2,
            rot4dXY: 0,
            rot4dXZ: 0.5,
            rot4dYZ: 0.3,
            rot4dXW: 2.0,
            rot4dYW: 1.5,
            rot4dZW: 2.8
        }
    },

    victory: {
        system: 'holographic',
        geometry: 8,
        colorPreset: 'Aurora',
        postFxChain: 'Cinematic',
        params: {
            hue: 140,
            saturation: 0.7,
            intensity: 0.8,
            speed: 0.6,
            chaos: 0.0,
            morphFactor: 0.1,
            gridDensity: 8,
            dimension: 4.0,
            rot4dXY: 0,
            rot4dXZ: 0,
            rot4dYZ: 0,
            rot4dXW: 0.3,
            rot4dYW: 0.2,
            rot4dZW: 0.4
        }
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Transition Definitions (designed via /vib3-design Workflow 4)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Transitions between game states.
 * Key: `${fromState}:${toState}`
 */
export const TRANSITIONS = {
    'idle:dueling': { duration: 800, easing: 'easeOut' },
    'dueling:suddenDeath': { duration: 300, easing: 'elastic' },
    'suddenDeath:victory': { duration: 1200, easing: 'backOut' },
    'dueling:victory': { duration: 1200, easing: 'backOut' },
    'victory:idle': { duration: 1000, easing: 'easeInOut' },
    'idle:idle': { duration: 500, easing: 'easeInOut' }
};

// ─────────────────────────────────────────────────────────────────────────────
// Sudden Death Timeline (designed via /vib3-design Workflow 3)
// 10-second escalation from tense → screen-tearing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ParameterTimeline spec for the 10-second sudden death countdown.
 * Chromatic aberration is driven externally (see TensionMapper).
 */
export const SUDDEN_DEATH_TIMELINE = {
    duration: 10000,
    loopMode: 'once',
    tracks: {
        hue: {
            keyframes: [
                { time: 0, value: 200, easing: 'linear' },
                { time: 3000, value: 320, easing: 'easeIn' },
                { time: 7000, value: 0, easing: 'exponential' },
                { time: 9000, value: 0, easing: 'elastic' },
                { time: 10000, value: 0, easing: 'linear' }
            ]
        },
        chaos: {
            keyframes: [
                { time: 0, value: 0.3, easing: 'linear' },
                { time: 3000, value: 0.5, easing: 'easeIn' },
                { time: 7000, value: 0.8, easing: 'expoOut' },
                { time: 9000, value: 1.0, easing: 'elastic' },
                { time: 10000, value: 1.0, easing: 'linear' }
            ]
        },
        speed: {
            keyframes: [
                { time: 0, value: 1.5, easing: 'linear' },
                { time: 3000, value: 2.0, easing: 'easeIn' },
                { time: 7000, value: 2.8, easing: 'expoOut' },
                { time: 9000, value: 3.0, easing: 'elastic' },
                { time: 10000, value: 3.0, easing: 'linear' }
            ]
        },
        gridDensity: {
            keyframes: [
                { time: 0, value: 30, easing: 'linear' },
                { time: 3000, value: 45, easing: 'easeIn' },
                { time: 7000, value: 70, easing: 'expoOut' },
                { time: 9000, value: 100, easing: 'elastic' },
                { time: 10000, value: 100, easing: 'linear' }
            ]
        },
        rot4dXW: {
            keyframes: [
                { time: 0, value: 2.0, easing: 'linear' },
                { time: 10000, value: 6.28, easing: 'linear' }
            ]
        },
        intensity: {
            keyframes: [
                { time: 0, value: 0.7, easing: 'linear' },
                { time: 7000, value: 0.9, easing: 'easeIn' },
                { time: 9500, value: 1.0, easing: 'elastic' },
                { time: 10000, value: 1.0, easing: 'linear' }
            ]
        }
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Parallax Layer Config (holographic 5-layer stack)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parallax multipliers per holographic layer.
 * Applied to spatial input (tilt/mouse) and 4D rotation deltas.
 * Factor 0.0 = screen-fixed, 1.0 = direct tracking, >1.0 = exaggerated.
 */
export const LAYER_PARALLAX = {
    'holo-background-canvas': {
        role: 'Deep void',
        parallax: 0.1,
        baseOpacity: 0.4,
        rotationCounterFactor: -0.3  // slow counter-rotation
    },
    'holo-shadow-canvas': {
        role: 'Interference mesh',
        parallax: 0.5,
        baseOpacity: 0.6,
        rotationCounterFactor: -0.15
    },
    'holo-content-canvas': {
        role: 'Letter refraction plane',
        parallax: 1.0,
        baseOpacity: 1.0,
        rotationCounterFactor: 0
    },
    'holo-highlight-canvas': {
        role: 'Contested letter glow',
        parallax: 1.5,
        baseOpacity: 0.0,  // only visible during conflicts
        rotationCounterFactor: 0
    },
    'holo-accent-canvas': {
        role: 'HUD bezel + CA',
        parallax: 0.0,  // screen-fixed
        baseOpacity: 0.8,
        rotationCounterFactor: 0
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Tension → Chromatic Aberration Mapper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute chromatic aberration intensity from game tension signals.
 *
 * CA is the primary visual metaphor for "system stress":
 *   - Base: 0.02 (subtle glass refraction)
 *   - +0.15 per contested letter (both players want it)
 *   - During sudden death: inversely maps timer to CA (1s left = 2.0)
 *
 * @param {Object} tension - Tension state
 * @param {number} tension.contestedLetters - Count of letters both players want
 * @param {boolean} tension.suddenDeath - Whether sudden death is active
 * @param {number} tension.secondsLeft - Seconds remaining in sudden death (0-10)
 * @returns {number} Chromatic aberration strength (0.02 - ~2.5)
 */
export function computeChromaticAberration(tension) {
    const BASE_CA = 0.02;
    const PER_CONFLICT = 0.15;
    const MAX_CONFLICT_CA = 0.6;

    let ca = BASE_CA;

    // Contested letter tension
    const conflictCA = Math.min(
        (tension.contestedLetters || 0) * PER_CONFLICT,
        MAX_CONFLICT_CA
    );
    ca += conflictCA;

    // Sudden death timer mapping
    if (tension.suddenDeath && typeof tension.secondsLeft === 'number') {
        const timerPercent = Math.max(0, Math.min(1, tension.secondsLeft / 10));
        const timerCA = (1 - timerPercent) * 2.0;
        ca += timerCA;
    }

    return ca;
}

// ─────────────────────────────────────────────────────────────────────────────
// Game Event → VIB3 Parameter Reactive Bindings
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps discrete game events to VIB3+ parameter impulses.
 * Each binding returns a partial param object for TransitionAnimator.
 */
export const EVENT_BINDINGS = {
    /**
     * Player grabs a letter from the pile.
     * Each held letter shifts deeper into 4D hyperspace.
     * @param {number} totalHeld - Total letters held by this player
     */
    letterGrabbed(totalHeld) {
        return {
            params: { rot4dXW: 0.8 + totalHeld * 0.1 },
            duration: 200,
            easing: 'easeOut'
        };
    },

    /**
     * Both players want the same letter (tether/conflict).
     * Highlight layer pulses, CA spikes.
     * @param {number} contestCount - Number of contested letters
     */
    letterConflict(contestCount) {
        return {
            params: {
                intensity: 0.6 + contestCount * 0.05
            },
            duration: 150,
            easing: 'elastic'
        };
    },

    /**
     * Player is rapidly placing letters (flow state).
     * Speed increases, shadow layer thickens.
     * @param {number} wordLength - Current word length
     */
    wordGrowing(wordLength) {
        const speedBoost = Math.min(wordLength * 0.15, 1.0);
        return {
            params: {
                speed: 1.0 + speedBoost
            },
            duration: 300,
            easing: 'easeOut'
        };
    },

    /**
     * Player dissolves their word — letters scatter back to pool.
     * VHS glitch: geometry snaps to points, scanline tear.
     */
    dissolve() {
        return {
            params: {
                morphFactor: 2.0,
                chaos: 0.9,
                speed: 3.0
            },
            duration: 200,
            easing: 'linear',
            // Caller should schedule a snapback after 200ms
            snapback: {
                params: { morphFactor: 0.3, chaos: 0.15, speed: 1.0 },
                duration: 400,
                easing: 'easeOut'
            }
        };
    },

    /**
     * ATTACK pressed — transition to sudden death.
     */
    attack() {
        return {
            params: GAME_STATES.suddenDeath.params,
            duration: 300,
            easing: 'elastic'
        };
    },

    /**
     * Round won — transition to victory.
     * @param {string} _winner - 'p1' or 'p2' (for future per-player effects)
     */
    victory(_winner) {
        return {
            params: {
                ...GAME_STATES.victory.params,
                intensity: 1.0  // bloom swell
            },
            duration: 1200,
            easing: 'backOut'
        };
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GlyphWarVisualizer Class
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Orchestrates all VIB3+ visual behavior for GLYPH_WAR.
 *
 * Lifecycle:
 *   1. Construct with a VIB3Engine instance
 *   2. Call init() to set up holographic system + post-processing
 *   3. Call setState() on game state transitions
 *   4. Call onGameEvent() for reactive per-frame bindings
 *   5. Call updateTension() each frame with current conflict/timer data
 *   6. Call destroy() on teardown
 *
 * @example
 * const viz = new GlyphWarVisualizer(engine, containerEl);
 * await viz.init();
 * viz.setState('idle');
 * // ... game starts ...
 * viz.setState('dueling');
 * viz.onGameEvent('letterGrabbed', 3);
 * viz.updateTension({ contestedLetters: 2, suddenDeath: false, secondsLeft: 10 });
 */
export class GlyphWarVisualizer {
    /**
     * @param {Object} engine - VIB3Engine instance
     * @param {HTMLElement} container - DOM container for post-processing target
     */
    constructor(engine, container) {
        if (!engine) throw new Error('GlyphWarVisualizer requires a VIB3Engine');

        /** @type {Object} */
        this.engine = engine;

        /** @type {HTMLElement} */
        this.container = container;

        /** @type {string} Current game state name */
        this.currentState = 'idle';

        /** @type {TransitionAnimator} */
        this.animator = new TransitionAnimator(
            (name, value) => this.engine.setParameter(name, value),
            (name) => this.engine.getParameter?.(name) ?? 0
        );

        /** @type {ParameterTimeline|null} Sudden death timeline */
        this.deathTimeline = null;

        /** @type {PostProcessingPipeline|null} */
        this.postFx = null;

        /** @type {ColorPresetsSystem|null} */
        this.colors = null;

        /** @type {number} Current chromatic aberration value */
        this._currentCA = 0.02;

        /** @type {number|null} rAF ID for tension updates */
        this._tensionFrameId = null;
    }

    /**
     * Initialize: switch to holographic system, set up creative tooling.
     */
    async init() {
        // Switch to holographic system
        if (this.engine.switchSystem) {
            await this.engine.switchSystem('holographic');
        }

        // Set up color presets
        this.colors = new ColorPresetsSystem(
            (name, value) => this.engine.setParameter(name, value)
        );

        // Set up post-processing pipeline
        if (this.container) {
            this.postFx = new PostProcessingPipeline(this.container);
        }

        // Apply idle state
        this.setState('idle');
    }

    /**
     * Transition to a new game state.
     *
     * @param {'idle'|'dueling'|'suddenDeath'|'victory'} stateName
     */
    setState(stateName) {
        const state = GAME_STATES[stateName];
        if (!state) {
            console.warn(`GlyphWarVisualizer: Unknown state "${stateName}"`);
            return;
        }

        const transitionKey = `${this.currentState}:${stateName}`;
        const transition = TRANSITIONS[transitionKey] || { duration: 500, easing: 'easeInOut' };

        // Stop any running sudden death timeline
        if (stateName !== 'suddenDeath' && this.deathTimeline) {
            this.deathTimeline.stop();
            this.deathTimeline = null;
        }

        // Set geometry immediately (not interpolatable)
        this.engine.setParameter('geometry', state.geometry);

        // Apply color preset
        if (this.colors && state.colorPreset) {
            this.colors.applyPreset(state.colorPreset);
        }

        // Apply post-processing chain
        if (this.postFx && state.postFxChain) {
            this.postFx.loadPresetChain(state.postFxChain);
            this.postFx.apply();
        }

        // Smooth transition of continuous parameters
        this.animator.cancelAll();
        this.animator.transition(
            state.params,
            transition.duration,
            transition.easing
        );

        // Start sudden death timeline if entering that state
        if (stateName === 'suddenDeath') {
            this._startSuddenDeathTimeline();
        }

        this.currentState = stateName;
    }

    /**
     * Handle a discrete game event with a reactive visual impulse.
     *
     * @param {string} eventName - Key from EVENT_BINDINGS
     * @param {...*} args - Arguments forwarded to the binding function
     */
    onGameEvent(eventName, ...args) {
        const binding = EVENT_BINDINGS[eventName];
        if (!binding) return;

        const impulse = binding(...args);
        if (!impulse) return;

        this.animator.transition(
            impulse.params,
            impulse.duration,
            impulse.easing
        );

        // Handle snapback (e.g., dissolve glitch then recover)
        if (impulse.snapback) {
            setTimeout(() => {
                this.animator.transition(
                    impulse.snapback.params,
                    impulse.snapback.duration,
                    impulse.snapback.easing
                );
            }, impulse.duration);
        }
    }

    /**
     * Update tension-reactive visuals (call each frame or on state change).
     *
     * @param {Object} tension
     * @param {number} tension.contestedLetters
     * @param {boolean} tension.suddenDeath
     * @param {number} tension.secondsLeft
     */
    updateTension(tension) {
        this._currentCA = computeChromaticAberration(tension);

        // Apply CA to post-processing pipeline
        if (this.postFx) {
            this.postFx.addEffect('chromaticAberration', {
                strength: this._currentCA
            });
            this.postFx.apply();
        }

        // Highlight layer opacity tracks conflict count
        // (In a full impl this would target the specific holo-highlight canvas)
        const highlightOpacity = Math.min(0.3 + (tension.contestedLetters || 0) * 0.15, 1.0);
        this.engine.setParameter('intensity',
            GAME_STATES[this.currentState]?.params?.intensity ?? 0.5 +
            highlightOpacity * 0.2
        );
    }

    /**
     * Get current chromatic aberration value (for UI sync).
     * @returns {number}
     */
    getChromaticAberration() {
        return this._currentCA;
    }

    /**
     * Clean up all resources.
     */
    destroy() {
        this.animator.cancelAll();
        if (this.deathTimeline) {
            this.deathTimeline.stop();
            this.deathTimeline = null;
        }
        if (this.postFx) {
            this.postFx.clearAll?.();
        }
        if (this._tensionFrameId) {
            cancelAnimationFrame(this._tensionFrameId);
        }
    }

    // ─── Internal ────────────────────────────────────────────────────────────

    /**
     * Build and start the 10-second sudden death ParameterTimeline.
     * @private
     */
    _startSuddenDeathTimeline() {
        this.deathTimeline = new ParameterTimeline(
            (name, value) => this.engine.setParameter(name, value)
        );

        this.deathTimeline.setDuration(SUDDEN_DEATH_TIMELINE.duration);
        this.deathTimeline.setLoopMode(SUDDEN_DEATH_TIMELINE.loopMode);

        for (const [param, track] of Object.entries(SUDDEN_DEATH_TIMELINE.tracks)) {
            this.deathTimeline.addTrack(param);
            for (const kf of track.keyframes) {
                this.deathTimeline.addKeyframe(param, kf.time, kf.value, kf.easing);
            }
        }

        this.deathTimeline.play();
    }
}
