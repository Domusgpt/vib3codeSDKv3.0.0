/**
 * LatticePhysics - Function-Based Collision Detection
 *
 * Provides a physics engine for "Lattice Worlds" where geometry is defined
 * by mathematical density functions (SDFs, fractals).
 *
 * @experimental
 */
export class LatticePhysics {
    constructor() {
        this.gravity = 9.8; // m/s²
        this.friction = 0.95; // Velocity decay per step
        this.densityThreshold = 0.8; // Collision threshold (0-1)
    }

    /**
     * Update physics for all entities in the universe.
     * @param {Map<string, object>} entities
     * @param {number} dt
     */
    update(entities, dt) {
        entities.forEach(entity => {
            if (entity.physics && entity.active) {
                this.updateEntity(entity, dt);
            }
        });
    }

    /**
     * Update a single entity's physics state.
     * @param {object} entity
     * @param {number} dt
     */
    updateEntity(entity, dt) {
        const { pos, vel, acc } = entity.physics;

        // Apply forces (Gravity)
        // In this abstract world, gravity pulls "down" in Y
        acc.y -= this.gravity * dt;

        // Integrate Velocity (Euler)
        vel.x += acc.x * dt;
        vel.y += acc.y * dt;
        vel.z += acc.z * dt;

        // Reset acceleration (forces are transient)
        acc.x = 0; acc.y = 0; acc.z = 0;

        // Collision Check (Projected Position)
        const nextX = pos.x + vel.x * dt;
        const nextY = pos.y + vel.y * dt;
        const nextZ = pos.z + vel.z * dt;

        // Sample density at next position
        const density = this.getDensityAt(nextX, nextY, nextZ);

        if (density > this.densityThreshold) {
            // Collision!
            // Simple response: Stop velocity component and push out
            // A real engine would calculate surface normal from gradient

            // Simplified: Just stop movement and bounce slightly
            vel.x *= -0.5;
            vel.y *= -0.5;
            vel.z *= -0.5;

            // Don't update position into solid
        } else {
            // Move freely
            pos.x = nextX;
            pos.y = nextY;
            pos.z = nextZ;
        }

        // Apply Friction (Air/Ether drag)
        vel.x *= this.friction;
        vel.y *= this.friction;
        vel.z *= this.friction;
    }

    /**
     * Sample the "world density" at a given point.
     * This mimics the shader's generation logic (e.g., fractal noise).
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {number} Density 0.0 to 1.0
     */
    getDensityAt(x, y, z) {
        // Mock function: simple floor plane at y = -2
        if (y < -2) return 1.0;

        // Mock function: occasional "floating islands" based on sine waves
        // simulating the VIB3 lattice structure
        const noise = (Math.sin(x * 0.5) + Math.cos(z * 0.5)) * 0.5 + 0.5;
        if (y > 0 && y < 1 && noise > 0.8) return 1.0;

        return 0.0;
    }
}
