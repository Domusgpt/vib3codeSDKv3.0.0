/**
 * VIB3Orchestrator - The Core of the VIB3 Universe
 *
 * Manages the lifecycle and coordination of multiple VIB3+ entities (visualizers).
 * Implements the "Universe" concept where multiple instances share a clock,
 * physics, and event bus.
 *
 * @experimental
 */
export class VIB3Orchestrator {
    constructor() {
        this.entities = new Map(); // id -> Entity
        this.nextEntityId = 1;

        // Master Clock
        this.time = 0;
        this.lastFrameTime = 0;
        this.paused = false;

        // Systems
        this.eventBus = new EventTarget();

        // Bind loop
        this.tick = this.tick.bind(this);
    }

    /**
     * Start the universe simulation loop.
     */
    start() {
        if (this.running) return;
        this.running = true;
        this.lastFrameTime = performance.now();
        requestAnimationFrame(this.tick);
        console.log('VIB3Orchestrator: Universe started.');
    }

    /**
     * Stop the universe simulation loop.
     */
    stop() {
        this.running = false;
        console.log('VIB3Orchestrator: Universe stopped.');
    }

    /**
     * Spawn a new VIB3 entity.
     * @param {string} type - 'actor', 'prop', 'environment'
     * @param {object} config - Configuration for the entity
     * @returns {string} Entity ID
     */
    spawn(type, config = {}) {
        const id = `vib3_entity_${this.nextEntityId++}`;

        // In a real implementation, this would instantiate VIB3Actor or VIB3Prop
        // For now, we store a mock object representing the entity state
        const entity = {
            id,
            type,
            config,
            position: config.position || { x: 0, y: 0, z: 0 },
            rotation: config.rotation || { x: 0, y: 0, z: 0, w: 0 }, // 4D rotation
            active: true,

            // Mock VIB3Engine interface
            engine: {
                setParameter: (k, v) => console.log(`[${id}] set ${k}=${v}`),
                getParameter: (k) => 0
            },

            update: (dt) => {
                // Default update logic
                // e.g., apply basic physics or script behavior
            }
        };

        this.entities.set(id, entity);
        this.emit('entitySpawned', { id, type });
        console.log(`VIB3Orchestrator: Spawned ${type} (${id})`);

        return id;
    }

    /**
     * Remove an entity from the universe.
     * @param {string} id
     */
    kill(id) {
        if (this.entities.has(id)) {
            const entity = this.entities.get(id);
            // Cleanup logic (e.g., destroy VIB3Engine instance)
            if (entity.destroy) entity.destroy();

            this.entities.delete(id);
            this.emit('entityDespawned', { id });
            console.log(`VIB3Orchestrator: Killed entity ${id}`);
        }
    }

    /**
     * The main simulation loop.
     * Prioritizes Physics -> Narrative -> Visuals.
     * @param {number} timestamp
     */
    tick(timestamp) {
        if (!this.running) return;

        const dt = (timestamp - this.lastFrameTime) / 1000;
        this.lastFrameTime = timestamp;
        this.time += dt;

        // 1. Physics / Logic Update
        this.entities.forEach(entity => {
            if (entity.active && entity.update) {
                entity.update(dt);
            }
        });

        // 2. Event Processing (Mock)
        // Check for collisions, triggers, etc.

        // 3. Visual Sync (Mock)
        // Ensure all entities are rendering the current frame

        requestAnimationFrame(this.tick);
    }

    /**
     * Emit a global universe event.
     * @param {string} name
     * @param {object} detail
     */
    emit(name, detail) {
        const event = new CustomEvent(name, { detail });
        this.eventBus.dispatchEvent(event);
    }

    /**
     * Listen for global universe events.
     * @param {string} name
     * @param {function} callback
     */
    on(name, callback) {
        this.eventBus.addEventListener(name, (e) => callback(e.detail));
    }
}
