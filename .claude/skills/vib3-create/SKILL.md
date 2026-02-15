---
name: vib3-create
description: VIB3+ creative production engine. Use when users want to generate game VFX, compose multi-scene performances, create AI-driven presets, build trading cards, design audio-reactive experiences, embed VIB3+ in Three.js games, use WebXR/VR, run evolutionary art, or do VJ multi-screen setups. Covers gaming pipelines, choreography, preset mutation, GPU particles, and export workflows.
---

# VIB3+ Creative Engine

Help users produce game VFX, compose performances, evolve presets, build cards, and design audio-reactive experiences.

## Gaming Workflows

### Boss Battle VFX

```
1. design_from_description("dark aggressive crystalline")
2. batch_set_parameters({
       system: "quantum", geometry: 21,  // hypertetra+fractal
       rotation: { XW: 0.5, ZW: 1.8 },
       visual: { hue: 0, chaos: 0.6, intensity: 0.8, gridDensity: 40 }
   })
3. create_timeline for continuous 4D rotation (rot4dXW 0→6.28 linear loop)
4. Map gameplay events:
       health%    → morphFactor (0=full, 2=death)
       damage hit → chaos spike (0→1→0 over 500ms via play_transition)
       phase      → switch_system + change_geometry
       victory    → play_transition to bright preset + bloom
5. Generate Three.js ShaderMaterial (see src/integrations/ThreeJsPackage.js)
```

### Procedural Skybox

```
1. switch_system("holographic")  // 5-layer depth
2. change_geometry(14)           // hypersphere+wave
3. set_visual_parameters({ gridDensity: 60, chaos: 0.02, speed: 0.2, hue: 220 })
4. apply_color_preset("Galaxy")
5. Generate Three.js ShaderMaterial → embed on inverted sphere in game scene
```

### Status Effect Presets

| Effect | System | Geometry | Hue | Chaos | Speed | Special |
|--------|--------|----------|-----|-------|-------|---------|
| Poison | quantum | 13 | 120 | 0.6 | 1.5 | morphFactor=1.2 |
| Freeze | faceted | 15 | 200 | 0.0 | 0.1 | gridDensity=80 |
| Fire | quantum | 5 | 15 | 0.8 | 2.5 | intensity=0.9 |
| Shield | holographic | 10 | 270 | 0.05 | 0.3 | dimension=3.2 |
| Haste | faceted | 6 | 60 | 0.3 | 3.0 | gridDensity=15 |
| Void | quantum | 20 | 280 | 0.9 | 0.5 | dimension=3.0 |

Each = one `batch_set_parameters` call.

### Collectible Card Generator

```
1. randomize_parameters()        // unique random state
2. describe_visual_state()       // → flavor text (mood, complexity, color family)
3. capture_screenshot({ width: 512, height: 512, layers: "composite" })
4. Export via TradingCardGenerator (artwork + flavor + params + rarity)
5. save_to_gallery(slot)
```

Batch: loop steps 1-5 for N unique cards.

---

## Performance Workflows

### Music Video Choreography

```javascript
create_choreography({
    name: "my-video", bpm: 120,
    scenes: [
        { name: "intro", start_ms: 0, duration_ms: 8000,
          system: "quantum", geometry: 2, color_preset: "Ocean",
          tracks: [{ parameter: "gridDensity",
            keyframes: [{ time: 0, value: 10 }, { time: 8000, value: 30 }] }] },
        { name: "verse", start_ms: 8000, duration_ms: 22000,
          system: "faceted", geometry: 1, color_preset: "Monochrome",
          behavior_preset: "calm" },
        { name: "chorus", start_ms: 30000, duration_ms: 20000,
          system: "holographic", geometry: 11, color_preset: "Neon",
          behavior_preset: "energetic",
          post_processing: ["bloom", "chromaticAberration"],
          audio: { bass: { target: "morphFactor", weight: 0.8 },
                   mid: { target: "rot4dXW", weight: 0.5 } } },
        { name: "bridge", start_ms: 50000, duration_ms: 15000,
          system: "quantum", geometry: 21, color_preset: "Cyberpunk",
          tracks: [{ parameter: "chaos",
            keyframes: [{ time: 0, value: 0 }, { time: 7500, value: 0.8 },
                        { time: 15000, value: 0 }] }] },
        { name: "outro", start_ms: 65000, duration_ms: 15000,
          system: "quantum", geometry: 2, color_preset: "Ocean",
          tracks: [{ parameter: "intensity",
            keyframes: [{ time: 0, value: 0.8 }, { time: 15000, value: 0 }] }] }
    ]
})
```

### VJ Live Set

```
1. Define 8 preset scenes (one per MIDI pad)
2. create_timeline per scene with BPM-synced keyframes
3. Audio bands: bass→morphFactor, mid→rot4dXW, high→gridDensity
4. MIDI CC mapping via MIDIController:
       Knobs 1-4 → hue, chaos, speed, dimension
       Fader → master intensity
5. OffscreenWorker for multi-screen (independent workers per output)
```

### Evolutionary Art

```
1. design_from_description("cosmic ethereal deep")  // seed preset
2. AIPresetGenerator.mutate(seed, mutationRate=0.1)  // 5 variants
3. Evaluate: batch_set_parameters → describe_visual_state for each
4. Select best 2 → AIPresetGenerator.crossbreed(a, b, blendFactor=0.5)
5. Repeat 2-4 for N generations
6. export_package() + trading card for winner
```

---

## Shader Architecture (Critical)

VIB3+ uses `fract()`-based lattice patterns, **NOT raymarched SDFs**.

```glsl
// CORRECT: fract()-based lattice
vec3 q = fract(p.xyz * gridSize) - 0.5;
if (geo < 1.0) return length(q) - 0.3;           // tetrahedron
else if (geo < 2.0) return max(abs(q.x), max(abs(q.y), abs(q.z))) - 0.3;  // hypercube

// CORRECT: perspective projection
float w = u_dimension / (u_dimension + p.w);
vec3 projected = p.xyz * w;
```

**Never** use SDF raymarching or camera ray origins — those are NOT the VIB3+ pattern.

Always read the source shader files before generating shader code:
- `src/quantum/QuantumVisualizer.js` — lattice geometry + 5-layer color
- `src/faceted/FacetedSystem.js` — clean 2D from 4D
- `src/holograms/HolographicVisualizer.js` — per-layer dynamic geometry

### 5-Layer Canvas Architecture

Each system renders through 5 CSS-composited canvases:

| Layer | Blend | Opacity | Purpose |
|-------|-------|---------|---------|
| background | normal | 0.4 | Base layer |
| shadow | multiply | 0.6 | Depth effects |
| content | normal | 1.0 | Primary visual |
| highlight | screen | 0.8 | Bright accents |
| accent | overlay | 0.3 | Top effects |

WebGL context budget: ~16 max. Plan accordingly (2 systems = 10 contexts).

### Single-Pass Composite (for demos)

All 5 layers in one fragment shader (1 context instead of 5):

```glsl
vec3 r = bg * bg_a;
r = mix(r, r * shadow, shadow_a);          // multiply
r = mix(r, content, content_a);            // normal
r = mix(r, 1.0-(1.0-r)*(1.0-hl), hl_a);   // screen
vec3 ov = mix(2.0*r*acc, 1.0-2.0*(1.0-r)*(1.0-acc), step(0.5, r));
r = mix(r, ov, acc_a);                     // overlay
```

---

## References

- `CLAUDE.md` — Full technical reference (C++ WASM core, uniforms, projections, all APIs)
- `DOCS/MULTIVIZ_CHOREOGRAPHY_PATTERNS.md` — Choreography composition patterns
- `DOCS/EXPORT_FORMATS.md` — Export format specs (VIB3Package, trading cards)
- `DOCS/GPU_DISPOSAL_GUIDE.md` — GPU resource cleanup, context management
- `src/agent/mcp/tools.js` — All MCP tool definitions with JSON schemas
- `src/advanced/AIPresetGenerator.js` — Mutation, crossbreeding, 130+ aesthetic keywords
- `src/advanced/WebGPUCompute.js` — 65K GPU particle system + audio FFT compute
- `src/integrations/ThreeJsPackage.js` — Three.js ShaderMaterial with 4D uniforms
- `src/advanced/WebXRRenderer.js` — WebXR VR/AR with 6DOF spatial mapping
- `src/advanced/MIDIController.js` — Web MIDI with learn mode and CC mapping
- `src/export/TradingCardGenerator.js` — Trading card export with artwork + metadata
