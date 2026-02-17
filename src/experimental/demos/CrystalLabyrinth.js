/**
 * CrystalLabyrinth.js - Vertical Slice Demo
 *
 * Implements the full "Ultra" stack:
 * - VIB3Universe (Multi-instance)
 * - VIB3Orchestrator (Game Loop)
 * - VIB3Compositor (Visuals)
 * - LatticePhysics (4D Collision)
 * - PlayerController4D (Input)
 * - LiveDirector (AI Pacing)
 *
 * @experimental
 */
import { VIB3Universe } from '../VIB3Universe.js';
import { GameLoop } from '../GameLoop.js';
import { LatticePhysics } from '../LatticePhysics.js';
import { PlayerController4D } from '../PlayerController4D.js';
import { LiveDirector } from '../LiveDirector.js';

class CrystalLabyrinthGame {
    constructor() {
        this.universe = new VIB3Universe('vib3-universe');
        this.physics = new LatticePhysics();
        this.director = new LiveDirector(this.universe);

        // Game State
        this.score = 0;
        this.health = 100;
        this.isPlaying = false;

        // Entities
        this.player = null; // The "Camera"
        this.crystals = [];
        this.shadows = [];

        // UI
        this.ui = {
            score: document.getElementById('score'),
            health: document.getElementById('health'),
            overlay: document.getElementById('overlay'),
            startBtn: document.getElementById('start-btn')
        };

        // Bind input
        this.controller = new PlayerController4D(document.body, {
            setParameter: (k, v) => this.updatePlayerView(k, v)
        });

        // Setup Loop
        this.loop = new GameLoop(
            (dt) => this.update(dt),
            (alpha) => this.render(alpha)
        );

        this.init();
    }

    async init() {
        // Create the "World" (Background Layer)
        // A deep, slow-moving Holographic system representing the void
        const world = await this.universe.spawnActor({
            personality: 'neutral',
            system: 'holographic',
            geometry: 11, // Hypersphere
            layer: { zIndex: 0, opacity: 0.4 }
        });

        // Setup UI listeners
        this.ui.startBtn.addEventListener('click', () => this.start());
    }

    start() {
        this.isPlaying = true;
        this.ui.overlay.classList.add('hidden');

        // Start Systems
        this.universe.start();
        this.loop.start();
        this.director.start();

        // Spawn Level
        this.spawnLevel();
    }

    async spawnLevel() {
        // Spawn 5 Crystals (Pickups)
        for (let i = 0; i < 5; i++) {
            const crystal = await this.universe.spawnActor({
                personality: 'heroic', // Bright, positive
                system: 'faceted',
                geometry: 7, // Crystal
                layer: { zIndex: 10, blendMode: 'screen', opacity: 0.9 }
            });

            // Random position in 4D space (mock)
            crystal.physics = {
                pos: {
                    x: (Math.random() - 0.5) * 20,
                    y: (Math.random() - 0.5) * 5,
                    z: (Math.random() - 0.5) * 20
                },
                vel: { x: 0, y: 0, z: 0 },
                acc: { x: 0, y: 0, z: 0 }
            };

            this.crystals.push(crystal);
        }

        // Spawn 3 Shadows (Enemies)
        for (let i = 0; i < 3; i++) {
            const shadow = await this.universe.spawnActor({
                personality: 'glitch', // Chaotic, negative
                system: 'quantum',
                geometry: 16, // Spiky
                layer: { zIndex: 5, blendMode: 'multiply', opacity: 0.7 }
            });

            shadow.physics = {
                pos: { x: 0, y: 0, z: -30 }, // Start far away
                vel: { x: 0, y: 0, z: 0 },
                acc: { x: 0, y: 0, z: 0 }
            };

            this.shadows.push(shadow);
        }
    }

    /**
     * Physics Update (Fixed Timestep)
     */
    update(dt) {
        if (!this.isPlaying) return;

        // 1. Update Player Controls
        this.controller.update(dt);

        // 2. Update Physics World
        // Sync player controller state to physics engine?
        // For now, controller handles movement directly.

        // 3. AI Logic (Shadows hunt player)
        this.shadows.forEach(shadow => {
            // Move towards player (0,0,0 relative to camera)
            // In a real engine, we'd have absolute coordinates.
            // Here, we simulate relative motion by updating parameters

            // Mock: Oscillate shadow intensity based on "proximity"
            shadow.emote('panic', 0.5);
        });

        // 4. Check Collisions (Mock)
        // If player is close to a crystal -> Collect
        if (Math.random() < 0.005 && this.crystals.length > 0) {
            this.collectCrystal(this.crystals.pop());
        }
    }

    /**
     * Render Update (Variable Timestep)
     */
    render(alpha) {
        // Visual interpolation could happen here
    }

    updatePlayerView(key, value) {
        // Broadcast player view changes to the World actor
        // This makes the world rotate around the player
        const world = this.universe.actors.get(this.universe.orchestrator.entities.keys().next().value);
        if (world && world.engine) {
            world.engine.setParameter(key, value);
        }
    }

    collectCrystal(actor) {
        this.score++;
        this.ui.score.innerText = this.score;

        // FX
        actor.emote('joy', 1.0, 500);
        setTimeout(() => {
            this.universe.despawnActor(actor.id);
        }, 500);

        if (this.score >= 5) {
            this.win();
        }
    }

    win() {
        this.isPlaying = false;
        this.ui.overlay.innerHTML = `
            <h1 style="color: #0f0; text-shadow: 0 0 20px #0f0;">SECTOR STABILIZED</h1>
            <p>The lattice is secure.</p>
            <button onclick="location.reload()">Re-enter</button>
        `;
        this.ui.overlay.classList.remove('hidden');
        this.loop.stop();
    }
}

// Start Game
new CrystalLabyrinthGame();
