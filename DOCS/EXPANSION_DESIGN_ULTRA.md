# VIB3+ Ultra — The Emergent Media Engine

**Purpose**: This document defines the **Ultra Tier** expansion for VIB3+. While the Premium Tier (`EXPANSION_DESIGN.md`) focuses on professional visualization tools, the Ultra Tier transforms the SDK into a **full-stack emergent media engine** capable of powering 4D video games, generative cartoons, and multi-user hallucinations.

**Status**: Vision Document / Technical Specification.
**Dependencies**: Requires `@vib3code/sdk` (core) and `@vib3code/premium` (for fine-grained control).

---

## I. Architecture: The VIB3 Universe

The core shift is from **Single Instance** to **Orchestrated Universe**.

### The Concept
Instead of "a canvas on a page," we treat the browser window as a **Universe** containing multiple **Entities** (VIB3 instances). These entities share a clock, a physics lattice, and a narrative context.

### The `VIB3Orchestrator`
A new singleton that manages the lifecycle and coordination of all VIB3 instances.

```javascript
class VIB3Orchestrator {
    constructor() {
        this.entities = new Map(); // id -> VIB3Entity
        this.clock = new MasterClock({ bpm: 120 }); // Shared beat sync
        this.physics = new LatticePhysicsEngine(); // 4D collision detection
        this.link = new VIB3Link(); // WebRTC multi-user sync
    }

    // Spawn a new entity (actor, prop, or environment)
    spawn(type, config) { ... }

    // Global tick loop
    tick(deltaTime) {
        this.physics.update(this.entities, deltaTime);
        this.entities.forEach(e => e.update(deltaTime));
        this.link.sync(this.entities);
    }
}
```

---

## II. HyperNarrative: Animating Stories & Cartoons

VIB3+ can tell stories. Characters are not mesh rigs but **VIB3 Actors** — distinct visualization instances with "souls" (parameter personalities) that express emotion through math.

### 1. The `VIB3Actor`
Wraps a `VIB3Engine` instance with identity, role, and emotional state.

```javascript
class VIB3Actor {
    constructor(engine, personalityProfile) {
        this.engine = engine;
        this.profile = personalityProfile; // e.g., 'AnxiousGlitch', 'StoicCrystal'
        this.emotion = { valence: 0, arousal: 0 }; // -1 to 1
        this.voice = new AudioEmitter(); // Spatial audio source
    }

    // Express an emotion (modulates parameters based on profile)
    emote(emotionName, intensity) {
        const params = this.profile.mapEmotion(emotionName, intensity);
        this.engine.transition(params, 500, 'easeOut');
    }

    // "Speak" with audio-reactive mouth modulation
    speak(audioBuffer) {
        this.voice.play(audioBuffer);
        this.voice.onAnalysis((amplitude) => {
            // Modulate geometry to simulate speech/expression
            this.engine.setParameter('morphFactor', 0.5 + amplitude * 1.5);
            this.engine.setParameter('intensity', 0.6 + amplitude * 0.4);
        });
    }
}
```

### 2. The Script Format (`.vib3script`)
A JSON-based screenplay format that controls actors, cameras, and environment.

```json
{
  "title": "The Geometric Encounter",
  "bpm": 110,
  "cast": {
    "Hero": { "system": "faceted", "geometry": 0, "profile": "heroic" },
    "Villain": { "system": "quantum", "geometry": 16, "profile": "chaotic" }
  },
  "sequence": [
    {
      "time": "0:00",
      "action": "camera_cut",
      "target": "Hero",
      "shot": "close_up" // Adjusts zoom/projection
    },
    {
      "time": "0:02",
      "actor": "Hero",
      "action": "speak",
      "text": "Why do you disturb the lattice?",
      "audio": "hero_line_1.mp3",
      "emotion": "stern"
    },
    {
      "time": "0:05",
      "actor": "Villain",
      "action": "emote",
      "emotion": "rage",
      "intensity": 0.8 // Triggers red hue, high chaos, spike geometry
    }
  ]
}
```

### 3. LipSync & Performance
Use `WebAudioAPI` analysis on dialogue tracks to drive `morphFactor` (mouth opening) and `intensity` (energy).
- **Consonants (High Freq)**: Trigger `chaos` spikes (sharp edges).
- **Vowels (Mid Freq)**: Trigger `morphFactor` swells (round shapes).
- **Volume**: Drives `gridDensity` (louder = larger/closer).

---

## III. HyperGame: FPV Gameplay Engine

Transform VIB3+ from a passive visualizer into an active **4D Game Engine**.

### 1. 4D Player Controller (`FPVController`)
Maps WASD + Mouse to 6D motion, allowing navigation *through* the hyperspace lattice.

- **W/S**: Move forward/back in Z (depth).
- **A/D**: Strafe in X.
- **Space/Shift**: Move in Y (up/down).
- **Q/E**: Rotate in XW plane (portal strafe).
- **Mouse**: Rotate XY (look left/right) and YZ (look up/down).

```javascript
// Inside game loop
if (input.forward) {
    // Move "camera" through 4D noise space
    // We don't move geometry; we offset the noise coordinate system!
    uniforms.u_noiseOffset.z += speed * dt;
}
if (input.portalLeft) {
    // Rotate the entire world in 4D
    uniforms.u_rot4dXW += rotationSpeed * dt;
}
```

### 2. Lattice Physics (`LatticeCollider`)
Collision detection is not mesh-based (too expensive/abstract). It is **Function-Based**.
Since VIB3+ geometries are defined by math functions (SDFs or lattice grids), we check the player's coordinate against the active function.

```javascript
function checkCollision(playerPos, activeGeometry) {
    // Sample the density function at player position
    const density = getDensityAt(playerPos, activeGeometry);
    if (density > 0.8) {
        // Hit a "solid" part of the fractal/lattice
        return true;
    }
    return false;
}
```

### 3. Entity System
Game objects are lightweight VIB3 instances or simplified shader particles.
- **Projectiles**: Small `Quantum` instances (single particle geometry) moving in XYZW.
- **Pickups**: `Faceted` geometries (spinning crystals) that trigger events on collision.
- **Enemies**: `Holographic` instances that track player position.

### 4. Game State Manager
Tracks score, health, and inventory.
- **Health**: Low health = high `chromaticAberration` + desaturation + `glitch` effect.
- **Powerup**: Ingesting a "hypercube" powerup transitions the player's view to `HyperMode` (geometry 17, max color).

---

## IV. Emergent Media: AI & Multi-User Sync

The final frontier: VIB3+ experiences that are alive, shared, and intelligent.

### 1. VIB3Link (Multi-User Hallucination)
Uses WebRTC/WebSockets to synchronize the `VIB3Orchestrator` state across clients.
- **Shared Seed**: All clients start with same RNG seed.
- **Input Sync**: Player A's rotation is broadcast to Player B.
- **State Consensus**: "If Player A explodes the star, Player B sees it explode."

**Use Case**: A shared "VR" room (on flat screens) where users float in a 4D chatroom, represented by their `VIB3Actor` avatars.

### 2. The Live Director (AI Agent)
An autonomous agent (MCP-connected) that watches the "audience" (user input, webcam, mic) and adjusts the show.

- **Sentiment Analysis**: If audience audio is loud/happy -> increase `speed` and `saturation`.
- **Attention Tracking**: If user stops interacting -> trigger `FocusLock` or `Explosion` to regain attention.
- **Generative Scripting**: The AI writes the `.vib3script` in real-time based on a prompt ("Make it scary", "Make it romantic").

---

## V. New MCP Tools for Ultra Tier

To empower agents to build these experiences, we add the following tools:

### `spawn_actor`
Creates a `VIB3Actor` with a specific personality and role.
```json
{ "role": "protagonist", "personality": "glitch_witch", "system": "holographic" }
```

### `direct_scene`
Issues a high-level direction to the `LiveDirector`.
```json
{ "mood": "increasing_tension", "pacing": "frenetic", "focus_target": "villain" }
```

### `configure_game_rules`
Sets up the `HyperGame` mechanics.
```json
{ "physics": "lattice_heavy", "collision_damage": 10, "goal": "collect_shards" }
```

### `sync_session`
Initializes `VIB3Link` for a multi-user session.
```json
{ "room_id": "lobby_1", "max_users": 4, "sync_mode": "strict" }
```

---

*VIB3+ Ultra — The Future of Emergent Media*
*Draft v1.0 — Feb 16, 2026*
