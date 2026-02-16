/**
 * VIB3Universe - High-Level Entry Point for VIB3+ Ultra
 *
 * Combines Orchestrator (Logic) and Compositor (Visuals) into a single API.
 * Manages the "World" where multiple VIB3+ instances coexist.
 *
 * @experimental
 */
import { VIB3Orchestrator } from './VIB3Orchestrator.js';
import { VIB3Compositor } from './VIB3Compositor.js';
import { VIB3Actor } from './VIB3Actor.js';
import { VIB3Engine } from '../core/VIB3Engine.js';

export class VIB3Universe {
    /**
     * @param {string} containerId - DOM ID for the universe container
     */
    constructor(containerId = 'vib3-universe') {
        this.orchestrator = new VIB3Orchestrator();
        this.compositor = new VIB3Compositor(containerId);
        this.actors = new Map(); // id -> VIB3Actor
    }

    /**
     * Start the universe simulation.
     */
    start() {
        this.orchestrator.start();
    }

    /**
     * Stop the universe simulation.
     */
    stop() {
        this.orchestrator.stop();
    }

    /**
     * Spawn a new actor into the universe.
     * @param {object} config
     * @param {string} config.personality - Actor personality profile
     * @param {string} config.system - Visualization system ('quantum', 'faceted', 'holographic')
     * @param {number} config.geometry - Initial geometry index
     * @param {object} config.layer - Layer options { zIndex, blendMode, opacity, position }
     * @returns {Promise<VIB3Actor>} The spawned actor
     */
    async spawnActor(config = {}) {
        const actorId = `actor_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        // 1. Create a container for this actor's engine
        const container = document.createElement('div');
        container.id = `container_${actorId}`;
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.pointerEvents = 'none'; // Default to pass-through events

        // 2. Add to compositor (visual layer)
        this.compositor.addInstance(actorId, container, config.layer || {});

        // 3. Initialize VIB3 Engine
        const engine = new VIB3Engine({
            system: config.system || 'holographic',
            preferWebGPU: true // Ultra tier defaults to high perf
        });

        // Initialize engine within the container
        // Note: VIB3Engine.initialize expects a container ID
        await engine.initialize(container.id);

        // Set initial state
        if (config.geometry !== undefined) {
            engine.setParameter('geometry', config.geometry);
        }

        // 4. Wrap in Actor (logic layer)
        const actor = new VIB3Actor(engine, config.personality || 'neutral');
        actor.id = actorId;

        // 5. Register with Orchestrator (simulation loop)
        this.orchestrator.entities.set(actorId, actor);
        this.actors.set(actorId, actor);

        console.log(`VIB3Universe: Spawned actor ${actorId}`);
        return actor;
    }

    /**
     * Remove an actor from the universe.
     * @param {string} actorId
     */
    despawnActor(actorId) {
        const actor = this.actors.get(actorId);
        if (actor) {
            // Remove from logic
            this.orchestrator.kill(actorId);

            // Cleanup engine
            if (actor.engine && actor.engine.destroy) {
                actor.engine.destroy();
            }

            // Remove from visuals
            this.compositor.removeInstance(actorId);
            this.actors.delete(actorId);

            console.log(`VIB3Universe: Despawned actor ${actorId}`);
        }
    }
}
