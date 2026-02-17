/**
 * LiveDirector - Autonomous Creative Agent
 *
 * An AI agent that analyzes user input ("Audience Reaction") and adjusts the
 * VIB3Universe in real-time to maintain engagement, flow, and narrative tension.
 *
 * @experimental
 */
export class LiveDirector {
    constructor(universe) {
        this.universe = universe;
        this.active = false;

        // Audience State
        this.audience = {
            energy: 0.5, // 0.0 (Bored) -> 1.0 (Excited)
            attention: 0.8, // 0.0 (Distracted) -> 1.0 (Focused)
            sentiment: 0.0, // -1.0 (Negative) -> 1.0 (Positive)
        };

        // Directing State
        this.pacing = 'build'; // 'intro', 'build', 'climax', 'resolve'
        this.lastActionTime = 0;
        this.decisionInterval = 2000; // ms

        // Bind methods
        this.update = this.update.bind(this);
    }

    /**
     * Start the director loop.
     */
    start() {
        if (this.active) return;
        this.active = true;
        this.lastActionTime = performance.now();
        requestAnimationFrame(this.update);
        console.log('LiveDirector: Started directing.');
    }

    /**
     * Stop the director loop.
     */
    stop() {
        this.active = false;
        console.log('LiveDirector: Stopped directing.');
    }

    /**
     * Feed audience input signal.
     * @param {string} type - 'audio', 'video', 'input'
     * @param {object} data - Analysis data
     */
    feedInput(type, data) {
        if (type === 'audio') {
            // Loud audio = high energy
            this.audience.energy = Math.min(1.0, this.audience.energy + data.volume * 0.1);
        } else if (type === 'input') {
            // Interaction = high attention
            this.audience.attention = Math.min(1.0, this.audience.attention + 0.05);
        }

        // Decay logic runs in update loop
    }

    /**
     * Main decision loop.
     * @param {number} timestamp
     */
    update(timestamp) {
        if (!this.active) return;

        const dt = (timestamp - this.lastActionTime);

        // Decay audience metrics over time
        this.audience.energy = Math.max(0, this.audience.energy - 0.001);
        this.audience.attention = Math.max(0, this.audience.attention - 0.0005);

        // Make a directing decision periodically
        if (dt > this.decisionInterval) {
            this.makeDecision();
            this.lastActionTime = timestamp;
        }

        requestAnimationFrame(this.update);
    }

    /**
     * The "Brain" of the Director.
     * Decides what to change based on current state.
     */
    makeDecision() {
        const { energy, attention } = this.audience;

        console.log(`LiveDirector: Audience state - Energy: ${energy.toFixed(2)}, Attention: ${attention.toFixed(2)}`);

        // Strategy: Maintain a "Sine Wave" of tension
        // If energy is too low, spike it. If too high, calm it down.

        if (attention < 0.3) {
            // Lost attention -> TRIGGER EVENT
            this.triggerEvent('focus_snap');
        } else if (energy < 0.2) {
            // Boring -> INCREASE INTENSITY
            this.adjustGlobalParams({ speed: 1.5, chaos: 0.4 });
        } else if (energy > 0.8) {
            // Too frantic -> CALM DOWN
            this.adjustGlobalParams({ speed: 0.5, chaos: 0.1 });
        } else {
            // Just right -> DO NOTHING or subtle shift
            // Maybe drift hue slightly?
        }
    }

    /**
     * Execute a parameter adjustment across all actors.
     * @param {object} params
     */
    adjustGlobalParams(params) {
        console.log('LiveDirector: Adjusting global parameters', params);
        this.universe.actors.forEach(actor => {
            if (actor.animator) {
                actor.animator.transition(params, 2000, 'easeInOut');
            }
        });
    }

    /**
     * Trigger a specific scripted event.
     * @param {string} eventName
     */
    triggerEvent(eventName) {
        console.log(`LiveDirector: Triggering event '${eventName}'`);
        // Example: Flash screen, spawn particle burst, etc.
        if (eventName === 'focus_snap') {
             // Quick snap zoom / flash
             this.adjustGlobalParams({ intensity: 1.0, speed: 0.0 });
             setTimeout(() => {
                 this.adjustGlobalParams({ intensity: 0.5, speed: 1.0 });
             }, 200);
        }
    }
}
