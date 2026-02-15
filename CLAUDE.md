# CLAUDE.md — VIB3+ SDK Project Brief

**Last updated**: 2026-02-15 (session: `claude/vib3-sdk-handoff-p00R8`)

## What is VIB3+?

VIB3+ is a **programmable 4D visualization SDK** that renders interactive, audio-reactive geometric scenes in the browser. It lets creative developers, product teams, and AI agents create, control, and embed high-fidelity visualizations of four-dimensional geometry — projected into 3D and rendered on-screen in real time.

Think of it as a **visual engine for the fourth dimension**: you pick a geometry (tesseract, Klein bottle, fractal, torus, etc.), apply rotations across six independent planes (three spatial + three hyperspace), and the engine projects and renders the result through one of three distinct visual systems — each with its own aesthetic and rendering approach.

**Owner**: Clear Seas Solutions LLC (Paul Phillips)
**Package**: `@vib3code/sdk` v2.0.3
**License**: MIT (open-core model — see `DOCS/LICENSING_TIERS.md`)
**Stack**: ES Modules, Vite, pnpm, Vitest, Playwright, C++ WASM (Emscripten)

---

## Who is it for?

| Persona | What they do with VIB3+ |
|---|---|
| **Creative developers** | Ship differentiated visual experiences — landing pages, dashboards, interactive art |
| **Technical artists / VJs** | Drive visuals via presets, timelines, audio reactivity, and MIDI for live performance |
| **Product teams** | Embed performant, controllable visualizations into production apps |
| **AI/agent builders** | Automate scene generation, tuning, and operation via MCP tools and CLI |
| **XR teams** | Extend 4D visuals into VR/AR and spatial interfaces |

See `DOCS/PRODUCT_STRATEGY.md` for full persona definitions and success metrics.

---

## The Three Visualization Systems

VIB3+ has three active rendering systems. Each one takes the same 24 geometry variants and 6D rotation math but renders them with a completely different visual approach:

### Quantum (`src/quantum/`)
**The dense, complex one.** Renders quantum-inspired lattice patterns — think crystalline interference, energy fields, particle grids. Uses a single procedural fragment shader that generates complex visual structures entirely on the GPU. Best for abstract, high-density visualizations with a scientific/mathematical feel.

### Faceted (`src/faceted/`)
**The clean, geometric one.** Renders precise 2D geometric patterns projected from 4D rotation. Think kaleidoscopic symmetry, tiled sacred geometry, clean wireframe aesthetics. Uses HSL color with full hue + saturation control. Best for polished UI elements, design-forward applications, and situations where clarity matters more than complexity.

### Holographic (`src/holograms/`)
**The layered, atmospheric one.** Renders through a 5-layer glassmorphic canvas stack (background → shadow → content → highlight → accent), each with its own shader instance. Layer parameters are derived through a **LayerRelationshipGraph** where one keystone layer drives the others through configurable relationship functions. Native microphone input for audio reactivity with beat/melody detection. Best for immersive holographic effects, live music visuals, and ambient backgrounds.

> **Polychora** is a planned fourth system for true 4D polytope rendering. It is archived and not production-ready — files live in `archive/polychora/`. Do not build against it.

---

## Core Concepts

### 24 Geometry Variants
Every system renders 24 geometry variants — 8 base shapes × 3 4D warp modes:
```
index = coreType * 8 + baseGeometry
```
- **8 base shapes** (0-7): Tetrahedron, Hypercube, Sphere, Torus, Klein Bottle, Fractal, Wave, Crystal
- **3 warp modes** (0-2): Base (no warp), Hypersphere (S³ projection), Hypertetrahedron (pentatope warp)
- Total: 8 shapes × 3 warps = 24 variants per system

Each base shape uses a distinct lattice/SDF function. The warp modes apply continuous 4D deformations before projection, producing visually different results especially at higher morphFactor and dimension values.

### 6D Rotation
Objects exist in 4D space (X, Y, Z, W). Rotation happens in six independent planes:
- **3D planes**: XY, XZ, YZ — familiar 3D rotations
- **4D planes**: XW, YW, ZW — hyperspace rotations that reveal the fourth dimension

Application order is always XY → XZ → YZ → XW → YW → ZW. This is implemented three ways (WASM rotors, GLSL matrices, WGSL matrices) and all must agree.

### 5-Layer Canvas Architecture & Layer Relationships
Each system renders to five stacked canvases: background, shadow, content, highlight, accent.

The **LayerRelationshipGraph** (`src/render/LayerRelationshipGraph.js`) controls how layers relate to each other. One layer is the **keystone** (driver) and others derive their parameters through relationship functions:

| Relationship | What it does |
|---|---|
| `echo` | Attenuated follower — same params, scaled down |
| `mirror` | Inverts rotation planes, shifts hue 180° |
| `complement` | Color complement, density inverted around pivot |
| `harmonic` | Density at integer multiples, hue at golden angle intervals |
| `reactive` | Amplifies parameter deltas over time |
| `chase` | Lerps toward keystone with configurable delay |

**5 named profiles** configure the full graph: `holographic`, `symmetry`, `chord`, `storm`, `legacy` (replicates old static multiplier behavior).

Per-layer shader assignment is supported — layers don't have to run the same program.

### Projection
4D geometry is projected to 3D for display:
- **Perspective** (default): `xyz / (distance - w)` — most intuitive
- **Stereographic**: `xyz / (1 - w)` — conformal, preserves angles
- **Orthographic**: `xyz` — parallel, drops W

---

## Development Setup

```bash
pnpm install          # NOT npm — pnpm is canonical (pnpm-lock.yaml)
pnpm run dev          # Vite dev server with hot reload
pnpm test             # Vitest unit tests (1762 tests, 77 files)
pnpm run test:e2e     # Playwright browser tests
pnpm run verify:shaders  # Check inline/external shader sync
```

Build WASM core (requires Emscripten): `cd cpp && ./build.sh`

---

## Current Priorities & Status

**Engine status**: Complete. 95,000+ lines across 570+ files. All three systems working.

**Test health**: 1762 tests across 77 files, all passing (as of 2026-02-15).

**What's shipped (Q1 2026)**:
- npm published: `@vib3code/sdk@2.0.1` (Feb 3)
- Real MCP server: JSON-RPC 2.0 over stdio (Feb 6)
- Agent harness: ChoreographyPlayer, AestheticMapper, 36 MCP tools (Feb 13-15)
- RendererContract compliance across all 3 systems (Feb 6-15)
- TypeScript types: comprehensive coverage for 15+ modules (Feb 15)
- LayerRelationshipGraph: keystone-driven inter-layer parameter system (Feb 15)
- Codebase audit: fixed broken barrels, require() in ESM, missing exports (Feb 15)
- LayerPresetManager + LayerReactivityBridge for preset save/load/tune + input-driven modulation (Feb 15)
- 5 new MCP layer control tools: set_layer_profile, set_layer_relationship, etc. (Feb 15)
- Test expansion: 933 → 1762 tests (+89% increase, Feb 6-15)

**What's shipping next** (Q1-Q2 2026):
- npm publish automation
- Framework example apps (React, Vue, Svelte working source)
- CDN/UMD distribution for `<script>` tag usage
- WebGPU as primary renderer

**Key gaps**:
- WebGPU backend needs full shader pipeline
- Some DOCS/ files are stale (MASTER_PLAN, SYSTEM_INVENTORY — see below)

See `DOCS/ROADMAP.md` for the full quarterly plan and `DOCS/STATUS.md` for release metadata.

---

## Documentation Map

Don't dig through source code when there's already a doc for it. The `DOCS/` directory is well-organized:

| What you need | Where to find it |
|---|---|
| **Full architecture & module inventory** | `DOCS/SYSTEM_INVENTORY.md` — canonical reference (stale: says 12 tools, it's 31) |
| **Product strategy & personas** | `DOCS/PRODUCT_STRATEGY.md` |
| **Quarterly roadmap & milestones** | `DOCS/ROADMAP.md` |
| **Licensing & commercial model** | `DOCS/LICENSING_TIERS.md` |
| **Master plan (what's done, what's not)** | `DOCS/MASTER_PLAN_2026-01-31.md` (stale: pre-Feb completions) |
| **All parameter details & UI controls** | `DOCS/CONTROL_REFERENCE.md` |
| **Project setup from scratch** | `DOCS/PROJECT_SETUP.md` + `DOCS/ENV_SETUP.md` |
| **CI/CD & testing** | `DOCS/CI_TESTING.md` |
| **Renderer lifecycle & contracts** | `DOCS/RENDERER_LIFECYCLE.md` |
| **GPU resource disposal** | `DOCS/GPU_DISPOSAL_GUIDE.md` |
| **WebGPU backend status** | `DOCS/WEBGPU_STATUS.md` |
| **XR performance benchmarks** | `DOCS/XR_BENCHMARKS.md` |
| **Export formats (SVG, Lottie, etc.)** | `DOCS/EXPORT_FORMATS.md` |
| **Agent CLI onboarding** | `DOCS/CLI_ONBOARDING.md` |
| **Agent harness architecture** | `DOCS/AGENT_HARNESS_ARCHITECTURE.md` |
| **Full docs index + reading paths** | `DOCS/README.md` |

Recent dev session logs live in `DOCS/dev-tracks/`. **Always check dev-tracks for the latest session work before exploring code.**

---

## Key Architecture Files

### Core Engine
| File | Role |
|---|---|
| `src/core/VIB3Engine.js` | Main orchestrator — system switching, parameter management, canvas orchestration, spatial input. `options.system` for initial system, `createParameterCallback()`, `getBreath()`, `onParameterChange(cb)` convenience API. |
| `src/core/CanvasManager.js` | Canvas lifecycle — `createSystemCanvases()` / `registerContext()` / `destroy()` |
| `src/core/Parameters.js` | Parameter definitions, validation, `exportConfiguration()` (version string here) |
| `src/core/VitalitySystem.js` | 6-second sine-wave breath cycle for organic animation |
| `src/core/RendererContracts.js` | Abstract base: `init()`, `resize()`, `render()`, `setActive()`, `dispose()` |
| `src/core/ErrorReporter.js` | Error reporting (version string here) |
| `src/core/UnifiedResourceManager.js` | GPU resource lifecycle management |

### Visualization Systems
| File | Role |
|---|---|
| `src/quantum/QuantumEngine.js` | Quantum system manager |
| `src/faceted/FacetedSystem.js` | Faceted system (complete — shader + rendering in one file) |
| `src/holograms/RealHolographicSystem.js` | Holographic system manager. Class is `RealHolographicSystem`. Has `layerGraph`, `loadRelationshipProfile()`, `setKeystone()`, `setLayerRelationship()`. |
| `src/holograms/HolographicVisualizer.js` | Per-layer holographic renderer with `generateRoleParams(role)` |

### Layer Relationship System (NEW — Feb 15)
| File | Role |
|---|---|
| `src/render/LayerRelationshipGraph.js` | Keystone-driven inter-layer parameter system. 6 presets, 5 profiles, per-layer shader support, serializable. |
| `src/render/LayerPresetManager.js` | Save/load/tune/import/export user presets for layer relationships. localStorage persistence. |
| `src/render/LayerReactivityBridge.js` | Audio/tilt/mouse/input → layer relationship modulation. 5 profiles (audioStorm, tiltHarmonic, mouseChase, audioPulse, fullReactive). |
| `src/render/MultiCanvasBridge.js` | 5-layer rendering orchestrator. Integrates with LayerRelationshipGraph for per-layer parameter resolution. |
| `examples/layer-dynamics-demo.html` | Visual demo page for testing layer dynamics, profiles, tuning, and reactivity modulation. |

### Render Pipeline
| File | Role |
|---|---|
| `src/render/UnifiedRenderBridge.js` | WebGL/WebGPU abstraction — tries WebGPU first, falls back |
| `src/render/ShaderProgram.js` | Shader compilation, caching, uniform management |
| `src/render/ShaderLoader.js` | External .glsl/.wgsl file loading |
| `src/render/RenderState.js` | GPU state tracking to minimize state changes |
| `src/render/backends/WebGLBackend.js` | Full WebGL 2.0 renderer (34KB) |
| `src/render/backends/WebGPUBackend.js` | WebGPU renderer with compute support (43KB) |

### Agent / MCP
| File | Role |
|---|---|
| `src/agent/mcp/tools.js` | MCP tool definitions (**31 tools** — not 12) |
| `src/agent/mcp/MCPServer.js` | MCP server with tool handlers |
| `src/agent/mcp/stdio-server.js` | Real JSON-RPC 2.0 MCP server over stdio |
| `src/agent/cli/` | `AgentCLI`, `BatchExecutor` |
| `src/agent/telemetry/` | `TelemetryService`, exporters, event streaming |
| `agent-config/` | Agent documentation packs for Claude/OpenAI |

### Creative Tooling
| File | Role |
|---|---|
| `src/creative/ColorPresetsSystem.js` | 22 color presets, `applyPreset(name)` |
| `src/creative/TransitionAnimator.js` | Parameter transitions with easing |
| `src/creative/PostProcessingPipeline.js` | 14 post-processing effects, 7 preset chains |
| `src/creative/ParameterTimeline.js` | Keyframe animation system |
| `src/creative/ChoreographyPlayer.js` | Multi-scene orchestration and playback |
| `src/creative/AestheticMapper.js` | Natural language → VIB3+ parameters (60+ vocabulary words) |

### Reactivity
| File | Role |
|---|---|
| `src/reactivity/SpatialInputSystem.js` | Universal spatial input (8 sources, 6 profiles, 61KB) |
| `src/reactivity/ReactivityManager.js` | Audio/tilt/interaction coordination |
| `src/reactivity/ReactivityConfig.js` | Configuration schema and validation |

### Math / Geometry / Scene
| File | Role |
|---|---|
| `src/math/` | Vec4, Rotor4D, Mat4x4, Projection, constants |
| `src/geometry/` | 8 generators, 2 warp cores, GeometryFactory, BufferBuilder |
| `src/scene/` | Node4D, Scene4D, ResourceManager, MemoryPool, Disposable |
| `cpp/` | WASM core — Clifford algebra Cl(4,0), 4D rotation, projections |

---

## Common Gotchas

1. **pnpm, not npm** — `pnpm-lock.yaml` is the canonical lockfile. Using npm will create conflicts.
2. **`RealHolographicSystem`** — The actual class name. Don't look for `HolographicSystem`.
3. **Version strings in 4 places** — `package.json`, `VIB3Engine.exportState()`, `Parameters.exportConfiguration()`, `ErrorReporter`. All currently `2.0.3`. Keep them in sync.
4. **Inline vs external shaders can drift** — Visualizer `.js` files contain inline GLSL. External shader files in `src/shaders/` can desync. Run `pnpm run verify:shaders` to check.
5. **6D rotation order matters** — Always XY → XZ → YZ → XW → YW → ZW. Changing order produces different results.
6. **ViewerInputHandler vs ReactivityManager** — `src/viewer/ViewerInputHandler.js` (renamed from ReactivityManager) is a *different file* from `src/reactivity/ReactivityManager.js`.
7. **WASM is optional** — Engine falls back to JS math if `.wasm` isn't available.
8. **WebGPU is optional** — Falls back to WebGL.
9. **ESM only** — `"type": "module"` in package.json. Do NOT use `require()` — it will throw `ReferenceError`.
10. **36 MCP tools, not 12** — DOCS/SYSTEM_INVENTORY.md is stale. Check `src/agent/mcp/tools.js` for the real count.
11. **Layer relationships default to 'holographic' profile** — The `legacy` profile replicates the old static multiplier behavior if you need it.
12. **`initialize()` checks `switchSystem()` return** — As of Feb 15, `VIB3Engine.initialize()` returns `false` if the initial system fails to create. Check the return value.

---

## Quick Reference

### Parameter Ranges

| Parameter | Range | What it does |
|---|---|---|
| `geometry` | 0-23 | Which of the 24 geometry variants to render |
| `rot4dXY/XZ/YZ` | 0-2π | 3D rotation angles (radians) |
| `rot4dXW/YW/ZW` | 0-2π | 4D hyperspace rotation angles (radians) |
| `gridDensity` | 4-100 | Pattern density / complexity |
| `morphFactor` | 0-2 | Interpolation between geometry states |
| `chaos` | 0-1 | Randomness / noise amount |
| `speed` | 0.1-3 | Animation speed multiplier |
| `hue` | 0-360 | Base color hue |
| `saturation` | 0-1 | Color saturation |
| `intensity` | 0-1 | Brightness / glow |
| `dimension` | 3.0-4.5 | 4D→3D projection distance |

### Keyboard Shortcuts

| Key | Action |
|---|---|
| 1 / 2 / 3 | Switch to Faceted / Quantum / Holographic |
| Alt+1/2/3 | Core type: Base / Hypersphere / Hypertetra |
| A | Toggle audio reactivity |
| T | Toggle device tilt input |
| I | Toggle interactivity |
| F | Toggle fullscreen |
| Ctrl+S | Save to gallery |
| Ctrl+G | Open gallery |

---

## MCP Agent Tools (36)

For AI agents controlling VIB3+ programmatically. Full definitions in `src/agent/mcp/tools.js`.

### Core (14 original)
| Tool | What it does |
|---|---|
| `create_4d_visualization` | Create a new visualization scene |
| `set_rotation` | Set 6D rotation values |
| `set_visual_parameters` | Set any visual property |
| `switch_system` | Change between Quantum/Faceted/Holographic |
| `change_geometry` | Set geometry by index or base+core type |
| `get_state` | Read current engine state |
| `randomize_parameters` | Randomize everything |
| `reset_parameters` | Reset to defaults |
| `save_to_gallery` / `load_from_gallery` | Gallery persistence |
| `search_geometries` | Query available geometries |
| `get_parameter_schema` | Get parameter validation schema |
| `set_reactivity_config` / `get_reactivity_config` | Reactivity configuration |

### Phase 6.5 (+4)
| Tool | What it does |
|---|---|
| `configure_audio_band` | Configure audio frequency band mapping |
| `export_package` | Export self-contained VIB3+ package |
| `apply_behavior_preset` | Apply named behavior preset |
| `list_behavior_presets` | List available behavior presets |

### Phase 7 (+7)
| Tool | What it does |
|---|---|
| `describe_visual_state` | Natural language description of current state |
| `batch_set_parameters` | Set multiple parameters atomically |
| `create_timeline` | Create keyframe animation timeline |
| `play_transition` | Smooth parameter transition with easing |
| `apply_color_preset` | Apply named color preset |
| `set_post_processing` | Configure post-processing effects |
| `create_choreography` | Create multi-scene choreography |

### Phase 7.1 Harness (+5)
| Tool | What it does |
|---|---|
| `capture_screenshot` | Capture current visualization as image |
| `design_from_description` | Natural language → visualization via AestheticMapper |
| `get_aesthetic_vocabulary` | List available aesthetic vocabulary |
| `play_choreography` | Play choreography sequence |
| `control_timeline` | Play/pause/seek timeline |

### Phase 8 Layer Control (+5)
| Tool | What it does |
|---|---|
| `set_layer_profile` | Load a named layer relationship profile |
| `set_layer_relationship` | Set relationship type for a specific layer |
| `set_layer_keystone` | Change the keystone (driver) layer |
| `get_layer_config` | Get current layer relationship configuration |
| `tune_layer_relationship` | Hot-patch a layer's relationship config |

---

## Recent Session Work (Feb 15, 2026)

**Branch**: `claude/vib3-sdk-handoff-p00R8`
**Dev track**: `DOCS/dev-tracks/DEV_TRACK_SESSION_2026-02-15.md`

### What was built
1. **LayerRelationshipGraph** — Keystone-driven inter-layer parameter system replacing static multipliers
2. **LayerPresetManager** — Save/load/tune/import/export user presets for layer relationships
3. **LayerReactivityBridge** — Audio/tilt/mouse → layer relationship modulation with 5 profiles
4. **5 MCP layer tools** — `set_layer_profile`, `set_layer_relationship`, `set_layer_keystone`, `get_layer_config`, `tune_layer_relationship`
5. **Layer dynamics demo** — Visual demo page (`examples/layer-dynamics-demo.html`) for testing all layer dynamics
6. **Test expansion** — 1430 → 1762 tests (+332), covering geometry, math, render, scene, layer relationships, presets, reactivity
7. **TypeScript types** — Full coverage for 15+ modules including all new layer modules
8. **P0-P2 dogfood fixes** — `initialize()` failure handling, debug warnings, convenience API
9. **Codebase audit** — Fixed 7 broken barrel files, require() in ESM, missing exports

### What was fixed in the audit
| File | Problem |
|---|---|
| `src/math/index.js` | Top-level `await import()` — replaced with static imports |
| `src/render/index.js` | `require()` in ESM package — replaced with static import |
| `src/scene/index.js` | Same `require()` → ESM fix for `createSceneContext()` |
| `src/export/index.js` | 8 missing exports added (ShaderExporter, VIB3PackageExporter, etc.) |
| `src/reactivity/index.js` | `console.log()` side effect removed from barrel |
| `package.json` | Added `./creative`, `./export`, `./variations` entry points |
| `types/` | Fixed mismatched export names, missing barrel re-exports |

---

**VIB3+ SDK — Clear Seas Solutions LLC**
