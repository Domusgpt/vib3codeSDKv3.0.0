/**
 * VIB3Actor - A VIB3+ Entity with Personality
 *
 * Wraps a VIB3Engine instance with emotional state and expression logic.
 * Actors can "emote" (transition parameters based on mood) and "speak"
 * (modulate geometry).
 *
 * @experimental
 */
import { TransitionAnimator } from '../creative/TransitionAnimator.js';

export class VIB3Actor {
    /**
     * @param {VIB3Engine} engine - The VIB3 engine instance
     * @param {string|object} profile - Personality profile name or object
     */
    constructor(engine, profile = 'neutral') {
        this.engine = engine;
        this.id = `actor_${Math.random().toString(36).substr(2, 9)}`;
        this.active = true;

        // Emotional State (-1.0 to 1.0)
        this.emotion = {
            valence: 0, // Positive/Negative
            arousal: 0  // High/Low Energy
        };

        // Animation system
        this.animator = new TransitionAnimator(
            (k, v) => this.engine.setParameter(k, v),
            (k) => this.engine.getParameter(k)
        );

        // Load profile
        this.profile = typeof profile === 'string' ? this._getProfile(profile) : profile;

        // Apply base state
        this.reset();
    }

    /**
     * Update loop called by Orchestrator.
     * @param {number} time - Total elapsed simulation time
     * @param {number} dt - Delta time in seconds
     */
    update(time, dt) {
        if (!this.active) return;

        // Idle behavior (breathing)
        // Sync morphFactor to universe time
        const breath = Math.sin(time * 2.0) * 0.1; // 2.0 rad/s

        // Apply breath modulation on top of base profile
        // Note: This is a simple additive modulation.
        // A real system would blend this with active transitions.
        const currentMorph = this.engine.getParameter('morphFactor') || 1.0;
        // Only modulate if not transitioning heavily
        if (!this.animator.isAnimating()) {
             // Gentle idle sway
             this.engine.setParameter('morphFactor', 1.0 + breath);
        }
    }

    /**
     * Express an emotion.
     * @param {string} emotionName - e.g., 'joy', 'anger', 'fear', 'sadness'
     * @param {number} intensity - 0.0 to 1.0
     * @param {number} duration - Transition duration in ms
     */
    emote(emotionName, intensity = 1.0, duration = 1000) {
        const mapping = this.profile.emotions[emotionName];
        if (!mapping) {
            console.warn(`VIB3Actor: Unknown emotion '${emotionName}' for profile '${this.profile.name}'`);
            return;
        }

        const targetParams = {};
        for (const [param, baseVal] of Object.entries(mapping)) {
            // Lerp between current/neutral and target based on intensity
            // Simplified: just setting target value scaled by intensity logic could go here
            // For now, we just use the mapped value directly as the "100% intensity" target
            targetParams[param] = baseVal;
        }

        // Apply global intensity modifiers
        if (targetParams.intensity) targetParams.intensity *= intensity;
        if (targetParams.speed) targetParams.speed *= intensity;

        this.animator.transition(targetParams, duration, 'easeOut');

        // Update internal state (simplified)
        this.emotion.lastEmote = emotionName;
    }

    /**
     * Reset to neutral state.
     */
    reset(duration = 1000) {
        this.animator.transition(this.profile.base, duration, 'easeInOut');
    }

    /**
     * Get a predefined personality profile.
     * @param {string} name
     */
    _getProfile(name) {
        const profiles = {
            neutral: {
                name: 'neutral',
                base: { hue: 200, saturation: 0.5, intensity: 0.5, chaos: 0, speed: 1.0, gridDensity: 20 },
                emotions: {
                    joy: { hue: 50, saturation: 1.0, intensity: 0.8, speed: 2.0, chaos: 0.2 },
                    anger: { hue: 0, saturation: 1.0, intensity: 0.9, speed: 3.0, chaos: 0.8 },
                    sadness: { hue: 240, saturation: 0.2, intensity: 0.3, speed: 0.2, chaos: 0 },
                    fear: { hue: 280, saturation: 0.8, intensity: 0.6, speed: 2.5, chaos: 0.9, gridDensity: 50 }
                }
            },
            heroic: {
                name: 'heroic',
                base: { hue: 210, saturation: 0.8, intensity: 0.7, chaos: 0.1, speed: 1.0, gridDensity: 15 },
                emotions: {
                    joy: { hue: 50, saturation: 1.0, intensity: 1.0, speed: 1.5, morphFactor: 1.2 },
                    anger: { hue: 20, saturation: 1.0, intensity: 1.0, speed: 2.5, chaos: 0.5 },
                    determination: { hue: 220, saturation: 0.9, intensity: 0.9, speed: 1.2, gridDensity: 10 }
                }
            },
            glitch: {
                name: 'glitch',
                base: { hue: 120, saturation: 0.0, intensity: 0.4, chaos: 0.5, speed: 2.0, gridDensity: 40 },
                emotions: {
                    panic: { hue: 0, saturation: 0, intensity: 0.9, speed: 5.0, chaos: 1.0, rot4dXW: 1.5 },
                    calm: { hue: 120, saturation: 0.5, intensity: 0.4, speed: 0.5, chaos: 0.2 }
                }
            }
        };
        return profiles[name] || profiles.neutral;
    }
}
