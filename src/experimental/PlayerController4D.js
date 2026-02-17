/**
 * PlayerController4D - Navigation in Hyperspace
 *
 * Maps 2D/3D inputs (WASD, Mouse) into 4D motion vectors (X, Y, Z, W).
 * Handles movement, strafing, and "portal rotation" (XW/YW planes).
 *
 * @experimental
 */
export class PlayerController4D {
    /**
     * @param {HTMLElement} domElement - Element to listen for events on
     * @param {object} engine - VIB3Engine instance to drive
     */
    constructor(domElement, engine) {
        this.domElement = domElement;
        this.engine = engine;

        // Input State
        this.keys = {
            w: false, a: false, s: false, d: false,
            q: false, e: false, space: false, shift: false
        };

        this.mouse = {
            dx: 0, dy: 0,
            down: false
        };

        // Player Physics State
        this.velocity = { x: 0, y: 0, z: 0, w: 0 };
        this.rotation = { x: 0, y: 0 }; // Looking direction (Pitch/Yaw)
        this.portalRot = 0; // XW plane rotation

        // Config
        this.speed = 5.0;
        this.sensitivity = 0.002;
        this.damping = 0.9;

        // Bind events
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);

        this.setupListeners();
    }

    setupListeners() {
        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        this.domElement.addEventListener('mousemove', this.onMouseMove);
        this.domElement.addEventListener('mousedown', this.onMouseDown);
        this.domElement.addEventListener('mouseup', this.onMouseUp);
    }

    onKeyDown(e) {
        const k = e.key.toLowerCase();
        if (this.keys.hasOwnProperty(k)) this.keys[k] = true;
    }

    onKeyUp(e) {
        const k = e.key.toLowerCase();
        if (this.keys.hasOwnProperty(k)) this.keys[k] = false;
    }

    onMouseDown() { this.mouse.down = true; }
    onMouseUp() { this.mouse.down = false; }

    onMouseMove(e) {
        if (this.mouse.down) {
            this.mouse.dx += e.movementX;
            this.mouse.dy += e.movementY;
        }
    }

    /**
     * Update loop called by GameLoop.
     * @param {number} dt
     */
    update(dt) {
        // 1. Process Rotation (Mouse)
        this.rotation.y -= this.mouse.dx * this.sensitivity; // Yaw
        this.rotation.x -= this.mouse.dy * this.sensitivity; // Pitch

        // Clamp pitch to avoid flipping
        this.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.rotation.x));

        // Reset mouse delta (consumed)
        this.mouse.dx = 0;
        this.mouse.dy = 0;

        // 2. Process Movement (WASD)
        // Forward vector derived from Yaw
        const fwdX = Math.sin(this.rotation.y);
        const fwdZ = Math.cos(this.rotation.y);
        const rightX = Math.cos(this.rotation.y); // Perpendicular
        const rightZ = -Math.sin(this.rotation.y);

        const moveSpeed = this.speed * dt;

        if (this.keys.w) {
            this.velocity.x += fwdX * moveSpeed;
            this.velocity.z -= fwdZ * moveSpeed; // WebGL Z is negative forward
        }
        if (this.keys.s) {
            this.velocity.x -= fwdX * moveSpeed;
            this.velocity.z += fwdZ * moveSpeed;
        }
        if (this.keys.a) {
            this.velocity.x -= rightX * moveSpeed;
            this.velocity.z += rightZ * moveSpeed;
        }
        if (this.keys.d) {
            this.velocity.x += rightX * moveSpeed;
            this.velocity.z -= rightZ * moveSpeed;
        }

        // Vertical Movement (Space/Shift)
        if (this.keys.space) this.velocity.y += moveSpeed;
        if (this.keys.shift) this.velocity.y -= moveSpeed;

        // 4D Portal Rotation (Q/E)
        if (this.keys.q) this.portalRot -= moveSpeed;
        if (this.keys.e) this.portalRot += moveSpeed;

        // Apply Damping (Friction)
        this.velocity.x *= this.damping;
        this.velocity.y *= this.damping;
        this.velocity.z *= this.damping;

        // 3. Apply to VIB3Engine Parameters
        // Map 4D position to shader uniforms (e.g., u_noiseOffset or camera pos)
        // Here we map to rotation parameters as a proxy for camera movement

        // Visual feedback: Velocity tilts the view
        this.engine.setParameter('rot4dXY', this.rotation.y + this.velocity.x * 0.1);
        this.engine.setParameter('rot4dYZ', this.rotation.x + this.velocity.y * 0.1);

        // Portal rotation affects XW plane
        this.engine.setParameter('rot4dXW', this.portalRot);

        // "Moving forward" increases grid density/scale to simulate zooming through
        // In a real implementation, we'd update a u_cameraPosition uniform
    }

    destroy() {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
        this.domElement.removeEventListener('mousemove', this.onMouseMove);
        this.domElement.removeEventListener('mousedown', this.onMouseDown);
        this.domElement.removeEventListener('mouseup', this.onMouseUp);
    }
}
