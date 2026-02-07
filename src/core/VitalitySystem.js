/**
 * VitalitySystem.js
 * Manages the "breath of life" for the VIB3+ Engine.
 * Generates a global rhythmic breath cycle (Exhale/Evoke) that modulates
 * all visualization systems for a unified, organic feel.
 */
export class VitalitySystem {
    constructor() {
        this.time = 0;
        this.breath = 0;
        this.cycleDuration = 6000; // 6 seconds per breath
        this.isRunning = false;
    }

    start() {
        this.isRunning = true;
        this.startTime = Date.now();
    }

    stop() {
        this.isRunning = false;
    }

    /**
     * Update the breath cycle.
     * Returns a normalized 0-1 value representing the breath phase.
     * 0 = Empty, 1 = Full
     * Uses a sine wave for smooth organic motion.
     */
    update(deltaTime) {
        if (!this.isRunning) return 0;

        const now = Date.now();
        const elapsed = now - this.startTime;

        // 0 to 2PI over cycleDuration
        const phase = (elapsed % this.cycleDuration) / this.cycleDuration;
        const angle = phase * Math.PI * 2;

        // Smooth sine wave: -1 to 1 -> 0 to 1
        // We use -cos to start at 0 (empty), go to 1 (full), back to 0
        this.breath = (1.0 - Math.cos(angle)) * 0.5;

        // Add a small "pause" at the top and bottom for realism?
        // For now, pure sine is hypnotic enough.

        return this.breath;
    }

    getBreath() {
        return this.breath;
    }
}
