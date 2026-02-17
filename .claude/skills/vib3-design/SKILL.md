---
name: vib3-design
description: VIB3+ visualization design and navigation. Use when creating 4D visualizations, designing presets, choreographing animations, configuring audio-reactive visuals, or answering "how do I make it look like X" questions. Integrates with VIB3+ MCP server for real-time control.
---

# VIB3+ Design & Navigation

Help users create, choreograph, and export 4D visualizations.

## Gold Standard v3 — Creative Foundation

Before designing, absorb the creative vocabulary in `examples/dogfood/GOLD_STANDARD.md` — motion vocabulary (14 motions), coordination grammar (7 patterns), composition framework, and 3-mode parameter model — and study the flagship reference at `examples/codex/synesthesia/`.

### Three Parameter Modes (Every Design Must Have All Three)

1. **Continuous Mapping** — Parameters respond to input state every frame (audio→density, touch→rotation, tilt→dimension). Use EMA smoothing: `alpha = 1 - Math.exp(-dt / tau)`. Reference tau: speed 0.08s, chaos 0.12s, density 0.15s, hue 0.25s.

2. **Event Choreography** — Discrete events trigger Attack/Sustain/Release envelopes. Tap = chaos burst. System switch = crossfade. Beat detection = intensity flash. Design timing asymmetry (approach faster than retreat).

3. **Ambient Drift** — Parameters breathe without input. Heartbeat: morph + intensity sine waves. Use prime-number periods (7s, 11s, 13s) to prevent mechanical feel.

### Design-Analyze-Enhance Loop
1. **Design** — Plan mappings and timeline for your platform
2. **Analyze** — Is 4D rotation visible? Do events feel distinct? Is audio reactivity noticeable?
3. **Enhance** — Layer the three modes. Find emergent combinations

---

## Workflow

### 1. Detect Mode

- **Live Mode**: MCP server connected — use tool calls directly
- **Artifact Mode**: No MCP — generate JSON configs or JS snippets to apply manually

### 2. Choose System

| System | Character | Best For |
|--------|-----------|----------|
| `quantum` | Complex lattice, procedural math | Intricate, alien, mathematical |
| `faceted` | Clean 2D geometry from 4D | Precise, geometric, minimalist |
| `holographic` | 5-layer glassmorphic depth | Rich, layered, ethereal |

### 3. Select Geometry

**Encoding**: `index = core_type × 8 + base_geometry`

| Base (0-7) | 0 tetra | 1 hypercube | 2 sphere | 3 torus | 4 klein | 5 fractal | 6 wave | 7 crystal |
|------------|---------|-------------|----------|---------|---------|-----------|--------|-----------|
| **Base** | 0-7 | Pure geometry, no warp |
| **Hypersphere** | 8-15 | S³ projection, Hopf fibration (flowing, organic) |
| **Hypertetra** | 16-23 | 5-cell pentatope warp (angular, crystalline) |

Examples: `11` = hypersphere+torus, `21` = hypertetra+fractal, `1` = tesseract

### 4. Set 6D Rotation

| Plane | Type | Visual Effect |
|-------|------|---------------|
| XY | 3D | Spin around Z axis |
| XZ | 3D | Tumble around Y axis |
| YZ | 3D | Roll around X axis |
| XW | 4D | Inside-out hyperspace morph |
| YW | 4D | Vertical hyperspace shift |
| ZW | 4D | Depth-plane hyperspace warp |

**Order** (critical): XY → XZ → YZ → XW → YW → ZW

### 5. Tune Parameters

| Parameter | Range | Effect |
|-----------|-------|--------|
| hue | 0-360 | Color hue (HSL) |
| saturation | 0-1 | Color saturation |
| intensity | 0-1 | Brightness |
| speed | 0.1-3 | Animation speed |
| chaos | 0-1 | Randomness/turbulence |
| gridDensity | 4-100 | Pattern density (high=intricate, low=bold) |
| morphFactor | 0-2 | Shape interpolation |
| dimension | 3.0-4.5 | 4D projection distance (low=dramatic, high=flat) |

### 6. Apply Color & Post-Processing

**22 Presets**: Ocean, Lava, Neon, Monochrome, Sunset, Aurora, Cyberpunk, Forest, Desert, Galaxy, Ice, Fire, Toxic, Royal, Pastel, Retro, Midnight, Tropical, Ethereal, Volcanic, Holographic, Vaporwave

**14 Effects**: bloom, chromaticAberration, vignette, filmGrain, scanlines, pixelate, blur, sharpen, colorGrade, noise, distort, glitch, rgbShift, feedback

### 7. Verify & Iterate

- `describe_visual_state` → text description of current visual
- `capture_screenshot` → 5-layer composite PNG for multimodal analysis

---

## MCP Tool Workflows

### Natural Language Design
```
design_from_description("serene ocean deep organic")
describe_visual_state()  // verify
batch_set_parameters({...adjustments...})  // refine
```

### Atomic Parameter Update
```
batch_set_parameters({
    system: "quantum", geometry: 11,
    rotation: { XW: 0.8, YW: 0.5, ZW: 1.2 },
    visual: { hue: 200, saturation: 0.9, speed: 0.5, chaos: 0.1 }
})
```

### Timeline Animation
```
create_timeline({
    tracks: [
      { parameter: "rot4dXW", keyframes: [
        { time: 0, value: 0, easing: "easeInOut" },
        { time: 5000, value: 6.28, easing: "linear" }
      ]}
    ], bpm: 120
})
control_timeline({ action: "play" })
```

### Multi-Scene Choreography
```
create_choreography({
    name: "my-set", scenes: [
        { start: 0, duration: 15000, system: "quantum", geometry: 2, preset: "Ocean" },
        { start: 15000, duration: 20000, system: "faceted", geometry: 11, preset: "Neon" },
        { start: 35000, duration: 25000, system: "holographic", geometry: 21, preset: "Cyberpunk" }
    ]
})
```

### Audio-Reactive
```
configure_audio_band({ band: "bass", target: "morphFactor", weight: 0.8, mode: "add" })
configure_audio_band({ band: "mid", target: "rot4dXW", weight: 0.5, mode: "add" })
configure_audio_band({ band: "high", target: "gridDensity", weight: 0.3, mode: "multiply" })
```

---

## Quick Response Guide

| User Says | Action |
|-----------|--------|
| "Make it more [adjective]" | `design_from_description` or map adjective to params |
| "Animate between X and Y" | `play_transition` with easing and duration |
| "Create a sequence" | `create_choreography` |
| "React to music" | `configure_audio_band` |
| "Save/export this" | `save_to_gallery` or `export_package` |
| "Show geometry N" | `change_geometry(N)` — N/8=core, N%8=base |
| "Rotate in 4D" | `set_rotation` with XW/YW/ZW planes |

## Design Principles

1. **4D rotations (XW/YW/ZW)** create effects impossible in 3D — use liberally
2. **gridDensity** controls perceived distance — 60-100=intricate/far, 4-10=bold/close
3. **dimension** is the 4D lens — 3.0=dramatic fish-eye, 4.5=flat
4. **Chaos + speed** create life — even calm designs benefit from chaos 0.02, speed 0.3
5. **Batch is better** — always use `batch_set_parameters` to prevent flicker

---

## References

For deep dives, read these codebase files:

- `CLAUDE.md` — Full technical reference (architecture, uniforms, C++ core, projections)
- `DOCS/CONTROL_REFERENCE.md` — Complete parameter documentation
- `DOCS/MULTIVIZ_CHOREOGRAPHY_PATTERNS.md` — Choreography composition patterns
- `src/agent/mcp/tools.js` — All MCP tool definitions with JSON schemas
- `src/creative/AestheticMapper.js` — 130+ NLP aesthetic keywords
- `src/creative/ColorPresetsSystem.js` — 22 color preset definitions
- `src/creative/PostProcessingPipeline.js` — 14 effects, 7 preset chains
