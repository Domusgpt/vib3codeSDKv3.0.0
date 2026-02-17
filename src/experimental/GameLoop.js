/**
 * GameLoop - Fixed-Timestep Physics Loop
 *
 * Provides a robust game loop that decouples physics updates (fixed step)
 * from rendering (variable step). This is crucial for consistent physics
 * and smooth rendering across different device capabilities.
 *
 * @experimental
 */
export class GameLoop {
    /**
     * @param {function(number)} updateFn - Physics update (fixed dt)
     * @param {function(number)} renderFn - Render update (interpolated alpha)
     * @param {number} step - Physics step size in seconds (default 1/60)
     */
    constructor(updateFn, renderFn, step = 1 / 60) {
        this.updateFn = updateFn;
        this.renderFn = renderFn;
        this.step = step;
        this.dt = 0;
        this.last = 0;
        this.now = 0;
        this.accumulator = 0;
        this.running = false;
        this.rafId = null;

        // Bind loop
        this.frame = this.frame.bind(this);
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.last = performance.now();
        this.accumulator = 0;
        this.rafId = requestAnimationFrame(this.frame);
        console.log('GameLoop: Started.');
    }

    stop() {
        this.running = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        console.log('GameLoop: Stopped.');
    }

    frame(timestamp) {
        if (!this.running) return;

        this.now = timestamp;
        // Cap dt to avoid "spiral of death" on lag spikes (max 1s)
        this.dt = Math.min(1, (this.now - this.last) / 1000);
        this.last = this.now;

        this.accumulator += this.dt;

        // Consume accumulator in fixed steps
        while (this.accumulator >= this.step) {
            this.updateFn(this.step);
            this.accumulator -= this.step;
        }

        // Render with interpolation factor alpha
        // alpha = accumulator / step
        // Allows renderer to interpolate between previous and current physics state
        this.renderFn(this.accumulator / this.step);

        this.rafId = requestAnimationFrame(this.frame);
    }
}
