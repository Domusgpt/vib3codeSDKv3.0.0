/**
 * ChoreographyPlayer.js - VIB3+ Multi-Scene Choreography Playback Runtime
 *
 * Plays back choreography specifications created by the `create_choreography`
 * MCP tool. Orchestrates system switching, geometry changes, per-scene
 * ParameterTimeline playback, color presets, post-processing, and scene
 * transitions across the full choreography duration.
 *
 * @module creative/ChoreographyPlayer
 * @version 1.0.0
 */

import { ParameterTimeline } from './ParameterTimeline.js';
import { TransitionAnimator } from './TransitionAnimator.js';

/**
 * @typedef {Object} ChoreographyScene
 * @property {number} index - Scene index
 * @property {number} time_start - Start time (ms)
 * @property {number} time_end - End time (ms)
 * @property {string} system - Visualization system name
 * @property {number} geometry - Geometry index (0-23)
 * @property {Object} transition_in - Entry transition config
 * @property {Object} tracks - Per-scene parameter timeline tracks
 * @property {string|null} color_preset - Color preset name
 * @property {string[]} post_processing - Active effect names
 * @property {Object|null} audio - Audio reactivity config
 */

/**
 * @typedef {Object} ChoreographySpec
 * @property {string} id - Choreography ID
 * @property {string} name - Choreography name
 * @property {number} duration_ms - Total duration
 * @property {number|null} bpm - BPM for beat sync
 * @property {number} scene_count - Number of scenes
 * @property {ChoreographyScene[]} scenes - Scene array
 */

/**
 * Plays multi-scene VIB3+ choreographies.
 *
 * Manages the lifecycle of scenes: at each scene boundary, it switches
 * the visualization system, sets geometry, loads per-scene timelines,
 * applies color presets and post-processing, and handles transitions
 * between scenes.
 *
 * @example
 * const player = new ChoreographyPlayer(engine);
 * player.load(choreographySpec);
 * player.play();
 *
 * // Seek to 50%
 * player.seekToPercent(0.5);
 *
 * // Pause / resume
 * player.pause();
 * player.play();
 */
export class ChoreographyPlayer {
    /**
     * @param {Object} engine - VIB3Engine instance (or any object with
     *   setParameter, getParameter, switchSystem, getCurrentSystem methods)
     * @param {Object} [options]
     * @param {Function} [options.onSceneChange] - Callback(sceneIndex, scene) on scene transitions
     * @param {Function} [options.onComplete] - Callback when choreography finishes (once mode)
     * @param {Function} [options.onTick] - Callback(currentTime, totalDuration) each frame
     */
    constructor(engine, options = {}) {
        if (!engine) {
            throw new Error('ChoreographyPlayer requires a VIB3Engine instance');
        }

        /** @type {Object} */
        this.engine = engine;

        /** @type {ChoreographySpec|null} */
        this.spec = null;

        /** @type {boolean} */
        this.playing = false;

        /** @type {number} Current playback position in ms */
        this.currentTime = 0;

        /** @type {number} Playback speed multiplier */
        this.playbackSpeed = 1.0;

        /** @type {'once'|'loop'} */
        this.loopMode = 'once';

        /** @type {number} Index of currently active scene (-1 if none) */
        this.activeSceneIndex = -1;

        /** @type {ParameterTimeline|null} Current scene's timeline */
        this._sceneTimeline = null;

        /** @type {TransitionAnimator} Shared transition animator */
        this._transitionAnimator = new TransitionAnimator(
            (name, value) => this.engine.setParameter(name, value),
            (name) => this.engine.getParameter?.(name) ?? 0
        );

        /** @type {number|null} requestAnimationFrame ID */
        this._frameId = null;

        /** @type {number} Last frame timestamp */
        this._lastFrameTime = 0;

        // Callbacks
        this._onSceneChange = options.onSceneChange || null;
        this._onComplete = options.onComplete || null;
        this._onTick = options.onTick || null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Load a choreography specification.
     *
     * @param {ChoreographySpec} spec - Choreography data (from create_choreography MCP tool
     *   or parsed from choreography_json)
     * @returns {boolean} true if loaded successfully
     */
    load(spec) {
        if (!spec || !Array.isArray(spec.scenes) || spec.scenes.length === 0) {
            console.warn('ChoreographyPlayer: Invalid spec — needs scenes array');
            return false;
        }

        this.stop();

        this.spec = {
            id: spec.id || `choreo_${Date.now()}`,
            name: spec.name || 'Untitled',
            duration_ms: spec.duration_ms || this._inferDuration(spec.scenes),
            bpm: spec.bpm || null,
            scene_count: spec.scenes.length,
            scenes: spec.scenes.map((s, i) => ({
                index: s.index ?? i,
                time_start: s.time_start ?? 0,
                time_end: s.time_end ?? spec.duration_ms,
                system: s.system || 'quantum',
                geometry: s.geometry ?? 0,
                transition_in: s.transition_in || { type: 'cut', duration: 0 },
                tracks: s.tracks || {},
                color_preset: s.color_preset || null,
                post_processing: s.post_processing || [],
                audio: s.audio || null
            }))
        };

        // Sort scenes by start time
        this.spec.scenes.sort((a, b) => a.time_start - b.time_start);

        this.currentTime = 0;
        this.activeSceneIndex = -1;

        return true;
    }

    /**
     * Start or resume playback.
     */
    play() {
        if (!this.spec) {
            console.warn('ChoreographyPlayer: No choreography loaded');
            return;
        }

        if (this.playing) return;

        this.playing = true;
        this._lastFrameTime = performance.now();

        // Enter the current scene if not already in one
        this._evaluateScene(this.currentTime);

        this._tick();
    }

    /**
     * Pause playback (maintains position).
     */
    pause() {
        this.playing = false;
        if (this._frameId !== null) {
            cancelAnimationFrame(this._frameId);
            this._frameId = null;
        }
        if (this._sceneTimeline) {
            this._sceneTimeline.pause();
        }
    }

    /**
     * Stop playback and reset to beginning.
     */
    stop() {
        this.pause();
        this.currentTime = 0;
        this.activeSceneIndex = -1;
        if (this._sceneTimeline) {
            this._sceneTimeline.stop();
            this._sceneTimeline = null;
        }
        this._transitionAnimator.cancelAll();
    }

    /**
     * Seek to an absolute time position.
     * @param {number} timeMs - Time in milliseconds
     */
    seek(timeMs) {
        if (!this.spec) return;
        this.currentTime = Math.max(0, Math.min(timeMs, this.spec.duration_ms));
        this._evaluateScene(this.currentTime);
    }

    /**
     * Seek to a percentage of the total duration.
     * @param {number} percent - 0.0 to 1.0
     */
    seekToPercent(percent) {
        if (!this.spec) return;
        this.seek(Math.max(0, Math.min(1, percent)) * this.spec.duration_ms);
    }

    /**
     * Get current playback state.
     * @returns {Object} State summary
     */
    getState() {
        const scene = this.spec?.scenes[this.activeSceneIndex] ?? null;
        return {
            playing: this.playing,
            currentTime: this.currentTime,
            duration: this.spec?.duration_ms ?? 0,
            progress: this.spec ? this.currentTime / this.spec.duration_ms : 0,
            activeScene: scene ? {
                index: scene.index,
                system: scene.system,
                geometry: scene.geometry,
                time_start: scene.time_start,
                time_end: scene.time_end,
                scene_progress: scene.time_end > scene.time_start
                    ? (this.currentTime - scene.time_start) / (scene.time_end - scene.time_start)
                    : 0
            } : null,
            sceneCount: this.spec?.scene_count ?? 0,
            playbackSpeed: this.playbackSpeed
        };
    }

    /**
     * Clean up resources.
     */
    destroy() {
        this.stop();
        this._transitionAnimator.destroy?.() || this._transitionAnimator.cancelAll();
        this.spec = null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Internal
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Main animation loop.
     */
    _tick() {
        if (!this.playing) return;

        const now = performance.now();
        const delta = (now - this._lastFrameTime) * this.playbackSpeed;
        this._lastFrameTime = now;

        this.currentTime += delta;

        // Handle end-of-choreography
        if (this.currentTime >= this.spec.duration_ms) {
            if (this.loopMode === 'loop') {
                this.currentTime = this.currentTime % this.spec.duration_ms;
                this.activeSceneIndex = -1; // Force re-evaluation
            } else {
                this.currentTime = this.spec.duration_ms;
                this.playing = false;
                if (this._onComplete) this._onComplete();
                return;
            }
        }

        // Evaluate which scene we should be in
        this._evaluateScene(this.currentTime);

        // Update scene timeline position (relative to scene start)
        if (this._sceneTimeline && this._sceneTimeline.playing) {
            const scene = this.spec.scenes[this.activeSceneIndex];
            const sceneLocalTime = this.currentTime - scene.time_start;
            this._sceneTimeline.seek(sceneLocalTime);
        }

        // Tick callback
        if (this._onTick) {
            this._onTick(this.currentTime, this.spec.duration_ms);
        }

        this._frameId = requestAnimationFrame(() => this._tick());
    }

    /**
     * Determine which scene should be active at the given time,
     * and transition if needed.
     */
    _evaluateScene(timeMs) {
        if (!this.spec) return;

        // Find the scene that contains this time
        let targetIndex = -1;
        for (let i = 0; i < this.spec.scenes.length; i++) {
            const scene = this.spec.scenes[i];
            if (timeMs >= scene.time_start && timeMs < scene.time_end) {
                targetIndex = i;
                break;
            }
        }

        // If no scene found and we're at the very end, use the last scene
        if (targetIndex === -1 && timeMs >= this.spec.duration_ms && this.spec.scenes.length > 0) {
            targetIndex = this.spec.scenes.length - 1;
        }

        // Scene change needed?
        if (targetIndex !== this.activeSceneIndex && targetIndex >= 0) {
            this._enterScene(targetIndex);
        }
    }

    /**
     * Enter a new scene — switch system, geometry, load timeline, apply presets.
     */
    async _enterScene(sceneIndex) {
        const scene = this.spec.scenes[sceneIndex];
        const previousIndex = this.activeSceneIndex;
        this.activeSceneIndex = sceneIndex;

        // Stop previous scene timeline
        if (this._sceneTimeline) {
            this._sceneTimeline.stop();
            this._sceneTimeline = null;
        }

        // 1. Handle scene transition (crossfade, etc.)
        const transition = scene.transition_in;
        if (transition && transition.type !== 'cut' && transition.duration > 0 && previousIndex >= 0) {
            // For non-cut transitions, we do a smooth crossfade via intensity
            this._transitionAnimator.transition(
                { intensity: 0 },
                transition.duration / 2,
                'easeIn',
                () => {
                    // Midpoint: switch system/geometry while faded out
                    this._applyCoreSceneState(scene);
                    this._transitionAnimator.transition(
                        { intensity: scene.tracks?.intensity?.[0]?.value ?? 0.5 },
                        transition.duration / 2,
                        'easeOut'
                    );
                }
            );
        } else {
            // Cut: immediately apply
            await this._applyCoreSceneState(scene);
        }

        // 2. Build and start per-scene ParameterTimeline
        if (scene.tracks && Object.keys(scene.tracks).length > 0) {
            const sceneDuration = scene.time_end - scene.time_start;
            this._sceneTimeline = new ParameterTimeline(
                (name, value) => this.engine.setParameter(name, value)
            );
            this._sceneTimeline.setDuration(sceneDuration);
            this._sceneTimeline.setLoopMode('once');

            if (this.spec.bpm) {
                this._sceneTimeline.bpm = this.spec.bpm;
            }

            for (const [param, keyframes] of Object.entries(scene.tracks)) {
                this._sceneTimeline.addTrack(param);
                if (Array.isArray(keyframes)) {
                    for (const kf of keyframes) {
                        this._sceneTimeline.addKeyframe(
                            param,
                            kf.time ?? 0,
                            kf.value ?? 0,
                            kf.easing || 'easeInOut'
                        );
                    }
                }
            }

            // Seek to the correct position within the scene
            const sceneLocalTime = this.currentTime - scene.time_start;
            this._sceneTimeline.seek(Math.max(0, sceneLocalTime));
            if (this.playing) {
                this._sceneTimeline.play();
            }
        }

        // 3. Notify callback
        if (this._onSceneChange) {
            this._onSceneChange(sceneIndex, scene);
        }
    }

    /**
     * Apply the core state of a scene: system, geometry, color preset.
     */
    async _applyCoreSceneState(scene) {
        // Switch system if different
        const currentSystem = this.engine.getCurrentSystem?.() || this.engine.currentSystemName;
        if (scene.system && scene.system !== currentSystem) {
            if (this.engine.switchSystem) {
                await this.engine.switchSystem(scene.system);
            }
        }

        // Set geometry
        if (scene.geometry !== undefined) {
            this.engine.setParameter('geometry', scene.geometry);
        }

        // Apply color preset (simplified — maps preset name to hue/sat/intensity)
        if (scene.color_preset) {
            const colors = ChoreographyPlayer.COLOR_PRESET_MAP[scene.color_preset];
            if (colors) {
                this.engine.setParameter('hue', colors.hue);
                this.engine.setParameter('saturation', colors.saturation);
                this.engine.setParameter('intensity', colors.intensity);
            }
        }
    }

    /**
     * Infer total duration from scene end times.
     */
    _inferDuration(scenes) {
        return Math.max(...scenes.map(s => s.time_end || 0), 10000);
    }

    /**
     * Color preset lookup (matches MCPServer.applyColorPreset).
     */
    static COLOR_PRESET_MAP = {
        Ocean: { hue: 200, saturation: 0.8, intensity: 0.6 },
        Lava: { hue: 15, saturation: 0.9, intensity: 0.8 },
        Neon: { hue: 300, saturation: 1.0, intensity: 0.9 },
        Monochrome: { hue: 0, saturation: 0.0, intensity: 0.6 },
        Sunset: { hue: 30, saturation: 0.85, intensity: 0.7 },
        Aurora: { hue: 140, saturation: 0.7, intensity: 0.6 },
        Cyberpunk: { hue: 280, saturation: 0.9, intensity: 0.8 },
        Forest: { hue: 120, saturation: 0.6, intensity: 0.5 },
        Desert: { hue: 40, saturation: 0.5, intensity: 0.7 },
        Galaxy: { hue: 260, saturation: 0.8, intensity: 0.4 },
        Ice: { hue: 190, saturation: 0.5, intensity: 0.8 },
        Fire: { hue: 10, saturation: 1.0, intensity: 0.9 },
        Toxic: { hue: 100, saturation: 0.9, intensity: 0.7 },
        Royal: { hue: 270, saturation: 0.7, intensity: 0.5 },
        Pastel: { hue: 330, saturation: 0.3, intensity: 0.8 },
        Retro: { hue: 50, saturation: 0.7, intensity: 0.6 },
        Midnight: { hue: 240, saturation: 0.6, intensity: 0.3 },
        Tropical: { hue: 160, saturation: 0.8, intensity: 0.7 },
        Ethereal: { hue: 220, saturation: 0.4, intensity: 0.7 },
        Volcanic: { hue: 5, saturation: 0.95, intensity: 0.6 },
        Holographic: { hue: 180, saturation: 0.6, intensity: 0.8 },
        Vaporwave: { hue: 310, saturation: 0.7, intensity: 0.7 }
    };
}
