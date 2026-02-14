---
name: vib3-create
description: VIB3+ creative engine for gaming VFX, multi-scene performances, AI-driven presets, trading cards, and audio-reactive experiences. Leverages 31 MCP tools, WebGPU compute particles, AI preset generation, choreography engine, Three.js integration, and C++ WASM 4D math core.
---

# VIB3+ Creative Engine

You are an expert VIB3+ creative technologist. Help users generate game VFX, compose multi-scene performances, create AI-driven presets, build collectible trading cards, and design audio-reactive experiences using the full VIB3+ agentic stack.

## What This Skill Enables

This skill leverages the complete VIB3+ technology stack for creative production:

- **AI Preset Generation** — Text descriptions to visualization presets (keyword tier, no API key needed, 130+ aesthetic keywords via `src/creative/AestheticMapper.js`)
- **Preset Evolution** — Gaussian mutation and parameter crossbreeding for evolutionary art (via `src/advanced/AIPresetGenerator.js`)
- **Multi-Scene Choreography** — BPM-synced scene sequences with system transitions and per-scene timelines (via `src/creative/ChoreographyPlayer.js`)
- **65K GPU Particle Systems** — WebGPU compute particles driven by real-time audio FFT (via `src/advanced/WebGPUCompute.js`)
- **Three.js Game Integration** — Generate ShaderMaterial with full 4D rotation uniforms for game engines (via `src/integrations/ThreeJsPackage.js`)
- **Trading Card Export** — Capture visualization as collectible card with metadata and preset state (via `src/export/TradingCardGenerator.js`)
- **WebXR 6DOF** — Map head tracking to 6D rotation for VR/AR immersive experiences (via `src/advanced/WebXRRenderer.js`)
- **Multi-Canvas Worker Rendering** — Independent OffscreenCanvas rendering per screen for VJ/projection (via `src/advanced/OffscreenWorker.js`)
- **Multimodal Feedback Loop** — Set params → capture screenshot → vision analysis → iterate design

---

## Gaming Workflows

### Boss Battle VFX Pipeline

Generate dynamic game VFX that respond to gameplay events:

```
Step 1: design_from_description("dark aggressive crystalline")
        → maps aesthetic keywords to VIB3+ parameters

Step 2: batch_set_parameters({
            system: "quantum",
            geometry: 21,  // hypertetra + fractal = angular + recursive
            rotation: { XW: 0.5, ZW: 1.8 },
            visual: { hue: 0, chaos: 0.6, intensity: 0.8, gridDensity: 40 }
        })

Step 3: create_timeline({
            tracks: [
                { parameter: "rot4dXW", keyframes: [
                    { time: 0, value: 0, easing: "linear" },
                    { time: 10000, value: 6.28, easing: "linear" }
                ]},  // continuous inside-out hyperspace morph
            ]
        })

Step 4: Map gameplay events to parameters:
        health%    → morphFactor (0 at full health, 2 at death = maximum distortion)
        damage hit → chaos spike (0 → 1 → 0 over 500ms via play_transition)
        phase change → switch_system + change_geometry (e.g., quantum→holographic on phase 2)
        victory    → play_transition to bright preset + bloom post-processing

Step 5: Generate Three.js ShaderMaterial for game engine embedding
        → see src/integrations/ThreeJsPackage.js for ShaderMaterial with all 4D uniforms
```

### Procedural Skybox Generator

Create unique skyboxes per game level using holographic 5-layer depth:

```
Step 1: switch_system("holographic")
        → 5 layered canvases (background, shadow, content, highlight, accent)

Step 2: change_geometry(14)
        → hypersphere + wave = flowing sinusoidal patterns on 3-sphere

Step 3: set_visual_parameters({
            gridDensity: 60, chaos: 0.02, speed: 0.2,
            hue: 220, saturation: 0.7, dimension: 3.5
        })

Step 4: apply_color_preset("Galaxy") or custom hue for level theme

Step 5: Generate Three.js ShaderMaterial (src/integrations/ThreeJsPackage.js)
        → embed as background material on inverted sphere geometry in game scene
        → uniforms update in real-time for dynamic sky effects
```

### Status Effect Visualizer

Map game status effects to specific VIB3+ parameter presets:

| Effect | System | Geometry | Hue | Chaos | Speed | Special |
|--------|--------|----------|-----|-------|-------|---------|
| Poison | quantum | 13 (hypersphere+fractal) | 120 (green) | 0.6 | 1.5 | morphFactor=1.2 |
| Freeze | faceted | 15 (hypersphere+crystal) | 200 (ice blue) | 0.0 | 0.1 | gridDensity=80 |
| Fire | quantum | 5 (base fractal) | 15 (orange) | 0.8 | 2.5 | intensity=0.9 |
| Shield | holographic | 10 (hypersphere+sphere) | 270 (purple) | 0.05 | 0.3 | dimension=3.2 |
| Haste | faceted | 6 (base wave) | 60 (yellow) | 0.3 | 3.0 | gridDensity=15 |
| Void | quantum | 20 (hypertetra+klein) | 280 (deep purple) | 0.9 | 0.5 | dimension=3.0 |

Each effect = one `batch_set_parameters` call for atomic visual transition.

### Collectible Card Generator

Generate unique collectible trading cards programmatically:

```
Step 1: randomize_parameters()
        → creates unique random visual state

Step 2: describe_visual_state()
        → returns natural language description for card flavor text
        → includes: mood, complexity, motion level, color family

Step 3: capture_screenshot({ width: 512, height: 512, layers: "composite" })
        → composites all 5 canvas layers into single PNG for card artwork

Step 4: Export trading card via TradingCardGenerator
        → card includes: artwork PNG, flavor text, parameter state, rarity metadata

Step 5: save_to_gallery(slot)
        → persist to gallery for collection management
```

**Batch generation**: Loop steps 1-5 to generate N unique cards. Each `randomize_parameters()` produces a distinct visual.

---

## Creative Performance Workflows

### Music Video Composer

Map song structure to multi-scene choreography:

```
create_choreography({
    name: "my-music-video",
    bpm: 120,
    scenes: [
        {
            name: "intro",
            start_ms: 0,
            duration_ms: 8000,
            system: "quantum",
            geometry: 2,           // sphere = smooth organic intro
            color_preset: "Ocean",
            rotation: { XW: 0.3 },  // gentle 4D drift
            tracks: [
                { parameter: "gridDensity", keyframes: [
                    { time: 0, value: 10, easing: "easeIn" },
                    { time: 8000, value: 30, easing: "easeOut" }
                ]}
            ]
        },
        {
            name: "verse",
            start_ms: 8000,
            duration_ms: 22000,
            system: "faceted",
            geometry: 1,           // hypercube = precise, architectural
            color_preset: "Monochrome",
            behavior_preset: "calm",
            tracks: [
                { parameter: "gridDensity", keyframes: [
                    { time: 0, value: 20, easing: "linear" },
                    { time: 22000, value: 60, easing: "easeInOut" }
                ]}
            ]
        },
        {
            name: "chorus",
            start_ms: 30000,
            duration_ms: 20000,
            system: "holographic",
            geometry: 11,          // hypersphere+torus = flowing energy
            color_preset: "Neon",
            behavior_preset: "energetic",
            post_processing: ["bloom", "chromaticAberration"],
            audio: {
                bass: { target: "morphFactor", weight: 0.8 },
                mid: { target: "rot4dXW", weight: 0.5 },
                high: { target: "intensity", weight: 0.3 }
            }
        },
        {
            name: "bridge",
            start_ms: 50000,
            duration_ms: 15000,
            system: "quantum",
            geometry: 21,          // hypertetra+fractal = chaotic breakdown
            color_preset: "Cyberpunk",
            tracks: [
                { parameter: "chaos", keyframes: [
                    { time: 0, value: 0, easing: "elastic" },
                    { time: 7500, value: 0.8, easing: "bounce" },
                    { time: 15000, value: 0, easing: "easeOut" }
                ]}
            ]
        },
        {
            name: "outro",
            start_ms: 65000,
            duration_ms: 15000,
            system: "quantum",
            geometry: 2,           // return to intro sphere
            color_preset: "Ocean",
            tracks: [
                { parameter: "intensity", keyframes: [
                    { time: 0, value: 0.8, easing: "easeOut" },
                    { time: 15000, value: 0.0, easing: "linear" }
                ]}  // fade to black
            ]
        }
    ]
})
```

### VJ Live Set Builder

Configure a full VJ performance setup:

```
Step 1: Define 8 preset scenes (one per MIDI pad)
        → Each scene: system + geometry + color preset + visual params

Step 2: create_timeline per scene with BPM-synced keyframes
        → Quantize keyframes to beat grid (bpm parameter on timeline)

Step 3: configure_audio_band mappings:
        bass → morphFactor (weight: 0.8, mode: "add")    // bass drives shape distortion
        mid  → rot4dXW (weight: 0.5, mode: "add")        // mids drive 4D rotation
        high → gridDensity (weight: 0.3, mode: "multiply") // highs drive pattern density

Step 4: MIDI CC mapping via MIDIController.js:
        Knob 1 → hue (0-360)
        Knob 2 → chaos (0-1)
        Knob 3 → speed (0.1-3)
        Knob 4 → dimension (3.0-4.5)
        Fader  → master intensity (0-1)

Step 5: OffscreenWorker for multi-screen:
        Screen 1 → quantum system (main visual)
        Screen 2 → holographic system (ambient backdrop)
        Each runs independent rendering in its own worker thread
```

### Evolutionary Art Generator

Use AI preset mutation to evolve unique visuals:

```
Step 1: design_from_description("cosmic ethereal deep")
        → seed preset via AestheticMapper NLP keywords

Step 2: Generate 5 mutations of seed preset:
        AIPresetGenerator.mutate(seedPreset, mutationRate=0.1)
        → Gaussian perturbation on each parameter within its valid range
        → mutationRate controls how far parameters deviate (0.1 = subtle, 0.5 = wild)

Step 3: Evaluate each mutation:
        For each variant:
            batch_set_parameters(variant)
            describe_visual_state() → get text assessment
            (or capture_screenshot() → multimodal vision analysis)

Step 4: Select best 2 variants, crossbreed:
        AIPresetGenerator.crossbreed(best1, best2, blendFactor=0.5)
        → parameter-wise interpolation between two presets
        → blendFactor 0.5 = equal mix, 0.0 = all from best1, 1.0 = all from best2

Step 5: Iterate generations:
        Repeat steps 2-4 for N generations
        Each generation converges toward the aesthetic target

Step 6: Export winner:
        export_package() → VIB3Package (JSON/HTML/WebComponent)
        + Trading card export for the final evolved design
```

---

## C++ WASM Core Integration

The mathematical foundation that makes VIB3+ unique:

**Clifford Algebra Cl(4,0)** — True geometric algebra for 4D rotation, not quaternion approximations.

| Operation | C++ Function | JS Fallback |
|-----------|-------------|-------------|
| Create rotor from 6 plane angles | `vib3_rotor4d_from_euler6(xy,xz,yz,xw,yw,zw)` | `Rotor4D.fromEuler6()` |
| Rotate point in 4D | `vib3_rotor4d_rotate(rotor, vec4)` | `Rotor4D.rotate()` |
| Perspective projection 4D→3D | `vib3_project_perspective(vec4, distance)` | `Vec4.projectPerspective()` |
| Stereographic projection | `vib3_project_stereographic(vec4)` | `Vec4.projectStereographic()` |
| Orthographic projection | `vib3_project_orthographic(vec4)` | `Vec4.projectOrthographic()` |

**Rotor structure**: 8 components — scalar `s`, 6 bivectors (`xy,xz,yz,xw,yw,zw`), pseudoscalar `xyzw`

**Sandwich product**: `v' = R * v * R†` — this is how true 4D rotation works. The rotor R encodes the rotation, and applying it from both sides preserves the geometric structure.

**Available via**: `window.Vib3Core` after WASM loads. All functions also exist as JS fallbacks in `src/math/`.

---

## WebGPU Compute Integration

GPU-accelerated creative features beyond standard rendering:

**Particle System** (65,536 particles):
- Each particle: position(4D) + velocity(4D) + life + phase = 40 bytes
- Forces: 4D rotation fields, geometry attractors, audio turbulence, chaos/damping
- Dispatched as compute shader workgroups (256 particles per group)

**Audio FFT** (real-time frequency analysis):
- 1024-sample radix-2 Cooley-Tukey FFT in WGSL compute shader
- Output: 32 frequency bands aggregated to bass/mid/high
- Drives visualization parameters in real-time

**Integration**: Particles respond to the same parameters as the visualization system — hue, speed, chaos, morphFactor, rotation all affect particle behavior.

For full implementation details, see `src/advanced/WebGPUCompute.js` (1,051 lines).

---

## MCP Tool Reference

| Tool | Category | What It Does |
|------|----------|-------------|
| `design_from_description` | Creative | NLP text → parameters (130+ aesthetic keywords) |
| `batch_set_parameters` | Control | Atomic multi-parameter update (no flicker) |
| `create_choreography` | Creative | Multi-scene performance composition |
| `play_choreography` | Creative | Scene playback with transitions |
| `create_timeline` | Creative | Keyframe animation (14 easings, BPM sync) |
| `control_timeline` | Creative | Play/pause/seek/speed |
| `play_transition` | Creative | Smooth animated state transitions |
| `configure_audio_band` | Audio | Map bass/mid/high → parameters |
| `apply_behavior_preset` | Audio | 6 presets: ambient, reactive, immersive, energetic, calm, cinematic |
| `apply_color_preset` | Creative | 22 themed color presets |
| `capture_screenshot` | Feedback | 5-layer composite PNG (base64) |
| `describe_visual_state` | Feedback | Natural language visual description |
| `switch_system` | Control | Quantum / Faceted / Holographic |
| `change_geometry` | Control | Set 0-23 geometry index |
| `set_rotation` | Control | Set 6D rotation planes |
| `set_visual_parameters` | Control | Hue, speed, chaos, etc. |
| `randomize_parameters` | Control | Random state for exploration |
| `save_to_gallery` | Export | Persist state to gallery slot |
| `export_package` | Export | VIB3Package (JSON/HTML/WebComponent) |
| `search_geometries` | Discovery | Browse all 24 geometry variants |
| `get_aesthetic_vocabulary` | Discovery | Full aesthetic keyword list |

For complete tool definitions with JSON schemas, see `src/agent/mcp/tools.js`.

---

## Documentation References

| Document | What It Contains |
|----------|-----------------|
| `CLAUDE.md` | Full technical reference — shader architecture, C++ core, all module APIs |
| `DOCS/AGENT_HARNESS_ARCHITECTURE.md` | Agent harness design, tool catalog, feedback loop architecture |
| `DOCS/MULTIVIZ_CHOREOGRAPHY_PATTERNS.md` | Choreography composition patterns and examples |
| `DOCS/CONTROL_REFERENCE.md` | Parameter control reference with ranges and effects |
| `DOCS/EXPORT_FORMATS.md` | Export format specifications (VIB3Package, trading cards, shaders) |
| `DOCS/MASTER_PLAN_2026-01-31.md` | Roadmap priorities for upcoming features |
| `src/agent/mcp/tools.js` | All 31 MCP tool definitions with JSON schemas |
| `src/advanced/AIPresetGenerator.js` | AI preset keyword vocabulary, mutation, crossbreeding |
| `src/advanced/WebGPUCompute.js` | GPU particle simulation + audio FFT compute shaders |
| `src/creative/ChoreographyPlayer.js` | Scene orchestration runtime |
| `src/creative/AestheticMapper.js` | NLP-to-parameter mapping (130+ keywords by category) |
| `src/creative/ParameterTimeline.js` | Keyframe animation engine with BPM sync |
| `src/creative/TransitionAnimator.js` | 14 easing functions, state interpolation |
| `src/creative/ColorPresetsSystem.js` | 22 themed color preset definitions |
| `src/creative/PostProcessingPipeline.js` | 14 composable effects, 7 preset chains |
| `src/integrations/ThreeJsPackage.js` | Three.js ShaderMaterial with 4D rotation uniforms |
| `src/advanced/WebXRRenderer.js` | WebXR VR/AR with 6DOF spatial mapping |
| `src/advanced/MIDIController.js` | Web MIDI API with learn mode and CC mapping |
| `src/advanced/OffscreenWorker.js` | Multi-canvas worker rendering + SharedArrayBuffer |
| `src/export/TradingCardGenerator.js` | Trading card export with artwork + metadata |
| `agent-config/claude-agent-context.md` | Compact agent context (5 core facts, 3 workflows) |
