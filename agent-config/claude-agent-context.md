# VIB3+ SDK — Agent Context Pack (Claude)

> Precompiled context for Claude Code, Claude Desktop, and Claude API agents.
> Version: 2.0.3 | Systems: 3 | Geometries: 24 | Rotation planes: 6 | MCP Tools: 31

## Core Concepts (5 facts)

1. **3 active systems**: `quantum` (complex lattice), `faceted` (clean geometry), `holographic` (5-layer audio-reactive). Polychora is TBD.
2. **24 geometries**: `index = coreType * 8 + baseGeometry`. Cores: base(0), hypersphere(1), hypertetrahedron(2). Bases: tetrahedron, hypercube, sphere, torus, klein_bottle, fractal, wave, crystal.
3. **6D rotation**: XY, XZ, YZ (3D) + XW, YW, ZW (4D hyperspace). Range: -6.28 to 6.28 radians. Order: XY then XZ then YZ then XW then YW then ZW.
4. **5 canvas layers** per system: background, shadow, content, highlight, accent.
5. **Vitality System**: Global breath cycle (6s period, 0-1 sine wave) modulating all systems.

## MCP Tool Workflows

**Basic flow** (6 steps):
```
1. get_sdk_context          → Understand the system
2. create_4d_visualization  → Create with system + geometry
3. set_rotation             → Set 6D rotation angles
4. set_visual_parameters    → Tune hue, speed, chaos, intensity
5. apply_behavior_preset    → Apply preset (ambient/reactive/immersive)
6. export_package           → Export as portable package
```

**Power flow** (design → animate → feedback):
```
1. design_from_description  → "serene ocean deep" → auto-mapped params
2. batch_set_parameters     → Apply everything atomically
3. describe_visual_state    → "See" result as text description
4. create_timeline          → Design keyframe animation
5. control_timeline         → Play/pause/seek the animation
6. capture_screenshot       → Get actual pixel feedback (browser only)
```

**Choreography flow** (multi-scene performance):
```
1. create_choreography      → Define scenes with systems, transitions, timelines
2. play_choreography        → Load and play the full performance
3. describe_visual_state    → Monitor what's happening
```

## Parameter Quick Reference

| Parameter | Range | Default | What it does |
|-----------|-------|---------|-------------|
| geometry | 0-23 | 0 | Geometry variant |
| rot4dXY..ZW | -6.28..6.28 | 0 | 6D rotation (radians) |
| hue | 0-360 | 200 | Color hue |
| saturation | 0-1 | 0.8 | Color saturation |
| intensity | 0-1 | 0.5 | Brightness |
| speed | 0.1-3.0 | 1.0 | Animation speed |
| chaos | 0-1 | 0 | Randomness/turbulence |
| morphFactor | 0-2 | 0 | Shape interpolation |
| gridDensity | 4-100 | 10 | Pattern density |
| dimension | 3.0-4.5 | 3.8 | 4D projection distance |

## Behavior Presets

| Preset | Speed | Chaos | Audio | Tilt | Best for |
|--------|-------|-------|-------|------|----------|
| ambient | 0.3 | 0.1 | off | gentle | Backgrounds |
| reactive | 1.0 | 0.3 | on (1.5x) | off | Music viz |
| immersive | 0.8 | - | on | dramatic | XR/mobile |
| energetic | 2.5 | 0.8 | on (2.0x) | dramatic | High energy |
| calm | 0.2 | 0.05 | off | gentle | Meditation |
| cinematic | 0.5 | 0.2 | off | off | Video/recording |

## Examples

**Create a hypersphere torus with warm colors:**
```json
{"tool": "create_4d_visualization", "args": {"system": "quantum", "geometry_index": 11}}
{"tool": "set_rotation", "args": {"XW": 0.5, "YW": 0.3, "ZW": 0.8}}
{"tool": "set_visual_parameters", "args": {"hue": 30, "speed": 0.6, "intensity": 0.8, "chaos": 0.15}}
```
Geometry 11 = hypersphere(1) * 8 + torus(3) = index 11.

**Design from natural language:**
```json
{"tool": "design_from_description", "args": {"description": "serene ocean deep organic", "apply": true}}
```

**Batch everything atomically:**
```json
{"tool": "batch_set_parameters", "args": {"system": "holographic", "geometry": 14, "rotation": {"XW": 1.0, "ZW": 0.5}, "visual": {"hue": 280, "chaos": 0.3, "speed": 0.8}, "preset": "cinematic"}}
```

**Animated timeline with BPM sync:**
```json
{"tool": "create_timeline", "args": {"duration_ms": 8000, "bpm": 120, "loop_mode": "loop", "tracks": {"hue": [{"time": 0, "value": 0}, {"time": 4000, "value": 180, "easing": "easeInOut"}, {"time": 8000, "value": 360}], "rot4dXW": [{"time": 0, "value": 0}, {"time": 8000, "value": 6.28, "easing": "linear"}]}}}
{"tool": "control_timeline", "args": {"timeline_id": "<id>", "action": "play"}}
```

## Creative Quality Framework (Gold Standard v3)

Every VIB3+ visualization should exhibit **three simultaneous parameter modes**:

### Mode 1: Continuous Mapping
Parameters are functions of input state, evaluated every frame — not transitions.
- Audio bands → visual params (bass→density, mid→chaos, high→speed)
- Touch/tilt/scroll → rotation, dimension, morph
- Use EMA smoothing: `alpha = 1 - Math.exp(-dt / tau)` (never setTimeout)

### Mode 2: Event Choreography
Discrete events trigger Attack/Sustain/Release sequences:
- Tap → chaos spike (0→0.9→0.1 over 500ms)
- System switch → opacity crossfade (1200ms)
- Beat detection → intensity flash

### Mode 3: Ambient Drift
Parameters breathe without input:
- Heartbeat: `morphFactor += 0.15 * sin(t / 4)`, `intensity += 0.08 * sin(t / 2)`
- Frozen drift: prime-number periods (7s, 11s, 13s) prevent mechanical loops

### Design-Analyze-Enhance Loop
1. **Design** — Plan your parameter timeline and input mappings
2. **Analyze** — Is 4D rotation visible? Do events feel distinct? Is audio reactivity noticeable?
3. **Enhance** — Layer the three modes. Find emergent combinations

### Per-System Personality
| System | gridDensity | speed | chaos | Character |
|--------|------------|-------|-------|-----------|
| Faceted | 15-35 | 0.3-0.8 | 0.0-0.15 | Clean, precise |
| Quantum | 25-60 | 0.5-1.5 | 0.1-0.4 | Dense, crystalline |
| Holographic | 20-50 | 0.4-1.2 | 0.05-0.3 | Atmospheric, layered |

**Full reference**: `examples/dogfood/GOLD_STANDARD.md` (Gold Standard v3)
**Annotated example**: `examples/codex/synesthesia/` (golden reference implementation)
**Codex gallery**: `examples/codex/` (multiple reference implementations)

## Aesthetic Vocabulary (for design_from_description)

**Emotions**: serene, calm, peaceful, energetic, chaotic, mysterious, joyful, melancholic, angry, dreamy
**Styles**: minimal, intricate, organic, geometric, abstract, crystalline, glitchy, cinematic
**Colors**: ocean, fire, ice, neon, sunset, forest, galaxy, cyberpunk, monochrome, warm, cool
**Motion**: slow, fast, flowing, pulsing, breathing, spinning, hypnotic, turbulent, frozen
**Depth**: deep, flat, immersive, distant, close
**Geometry**: spherical, cubic, toroidal, fractal, wavy, crystal, simplex, twisted
