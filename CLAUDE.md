# CLAUDE.md — VIB3+ SDK Project Brief

**Last updated**: 2026-02-18 (session: `claude/setup-vib3-sdk-NFEzp`)

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

## C++ WASM Core (`cpp/`)

The mathematical foundation using Clifford algebra Cl(4,0).

### Key Files

| File | Purpose |
|------|---------|
| `cpp/include/vib3_ffi.h` | C Foreign Function Interface header |
| `cpp/src/vib3_ffi.cpp` | C FFI implementation |
| `cpp/math/Rotor4D.hpp/cpp` | 4D rotation via geometric algebra |
| `cpp/math/Mat4x4.hpp/cpp` | Traditional 4x4 matrix operations |
| `cpp/math/Vec4.hpp/cpp` | 4-component vector operations |
| `cpp/math/Projection.hpp/cpp` | 4D→3D projection functions |
| `cpp/geometry/` | 8 base geometry generators + WarpFunctions |
| `cpp/bindings/embind.cpp` | JavaScript bindings via Emscripten |
| `cpp/tests/` | Unit tests (Rotor4D, Mat4x4, Vec4, Projection, Geometry) |
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

## Rendering Quick Start (CRITICAL — Read Before Building Any Demo)

**Every VIB3+ visualization requires exactly two things to get pixels on screen:**

### 1. A container div with position + dimensions

```html
<!-- CORRECT: positioned, sized, canvases will fill this -->
<div id="vib3-container" style="position:relative; width:100vw; height:100vh;"></div>

<!-- WRONG: no position, no size — canvases escape the container, zero-size rendering -->
<div id="vib3-container"></div>
```

**Why**: `CanvasManager` creates 5 child canvases with `position: absolute`. Without `position: relative` on the parent, they position relative to `<body>` and stack invisibly. Without explicit dimensions, the container collapses to 0×0 and all canvases render at zero size.

`CanvasManager` now auto-fixes `position: static` → `position: relative` and logs a warning, but **you should always set it explicitly**.

### 2. Engine init with the container ID

```javascript
import { VIB3Engine } from './src/core/VIB3Engine.js';

const engine = new VIB3Engine({ system: 'quantum' });
const ok = await engine.initialize('vib3-container');
// ok === false means something is broken — check console for specific error
```

**That's it.** The engine creates canvases, compiles shaders, starts the render loop. You don't create `<canvas>` elements yourself — `CanvasManager` handles it.

### What NOT to do

```javascript
// WRONG: don't create canvas elements manually
// CanvasManager creates them with the right IDs, sizing, and z-order

// WRONG: don't import premium at top level if you want fallback rendering
import { enablePremium } from './src/premium/index.js'; // if this throws, nothing renders
// CORRECT: dynamic import with try/catch
try {
    const { enablePremium } = await import('./src/premium/index.js');
    premium = enablePremium(engine, { licenseKey: 'key', features: ['all'] });
} catch (e) {
    console.warn('Premium unavailable:', e.message);
    // visualization still works without premium
}

// WRONG: calling premium methods without checking they exist
premium.shaderSurface.setParameters({...}); // crashes if shaderSurface failed to init
// CORRECT: optional chaining
premium?.shaderSurface?.setParameters({...});
```

### Canvas ID Convention

Each system prefixes the 5 layer IDs differently:

| System | Canvas IDs |
|--------|-----------|
| Faceted | `background-canvas`, `shadow-canvas`, `content-canvas`, `highlight-canvas`, `accent-canvas` |
| Quantum | `quantum-background-canvas`, `quantum-shadow-canvas`, etc. |
| Holographic | `holo-background-canvas`, `holo-shadow-canvas`, etc. |

You don't need to know these unless you're doing advanced per-layer work — `VIB3Engine` handles it all.

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
- Architecture fixes: QuantumVisualizer canvasId bug, Holographic uniform standardization (Feb 16)
- Shader consistency: rotateXZ sign convention aligned across all shader sources (Feb 16)
- Quantum layer detection: fixed 3/5 broken layers (role-intensity values mismatched) (Feb 16)
- Holographic cleanup: removed mapParameterName() translation layer (Feb 16)
- Tetrahedron lattice differentiation using tetrahedral symmetry planes (Feb 16)
- ShaderLoader include resolution system for shader composition (Feb 16)
- Documentation: SYSTEM_INVENTORY and MASTER_PLAN tool/test counts updated (Feb 16)

### Warp Functions (`src/geometry/warp/`)
**What's shipping next** (Q1-Q2 2026):
- npm publish automation
- Framework example apps (React, Vue, Svelte working source)
- CDN/UMD distribution for `<script>` tag usage
- WebGPU as primary renderer

**Key gaps**:
- WebGPU backend architecturally complete but needs end-to-end validation
- Inline shader duplication (~240 lines rotation/warp) could be further consolidated via ShaderLib

See `DOCS/ROADMAP.md` for the full quarterly plan and `DOCS/STATUS.md` for release metadata.

---

## Documentation Map

Don't dig through source code when there's already a doc for it. The `DOCS/` directory is well-organized:

| What you need | Where to find it |
|---|---|
| **Gold Standard v3 (creative vocabulary)** | `examples/dogfood/GOLD_STANDARD.md` — Motion vocabulary (14 motions), coordination grammar (7 patterns), composition framework (6 bridges), 3-mode parameter model, EMA smoothing |
| **Codex (reference implementations)** | `examples/codex/` — Multiple annotated VIB3+ examples showing different creative approaches |
| **Full architecture & module inventory** | `DOCS/SYSTEM_INVENTORY.md` — canonical reference (stale: says 12 tools, it's 31) |
| **Full architecture & module inventory** | `DOCS/SYSTEM_INVENTORY.md` — canonical reference (tool count updated to 36, Feb 16) |
| **Product strategy & personas** | `DOCS/PRODUCT_STRATEGY.md` |
| **Quarterly roadmap & milestones** | `DOCS/ROADMAP.md` |
| **Licensing & commercial model** | `DOCS/LICENSING_TIERS.md` |
| **Master plan (what's done, what's not)** | `DOCS/MASTER_PLAN_2026-01-31.md` (tool/test counts updated Feb 16) |
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

## MCP Agentic Control (`src/agent/mcp/`)

**32 tools** defined in `src/agent/mcp/tools.js`, handled by `MCPServer.js`.
**stdio transport**: `src/agent/mcp/stdio-server.js` — production-ready JSON-RPC 2.0 MCP server.

### Tool Categories

```javascript
// System control (directly call VIB3Engine methods)
batch_set_parameters(params)   // Atomic multi-parameter update
set_rotation(xy, xz, yz, xw, yw, zw)  // 6D rotation
set_visual_parameters(hue, chaos, speed, ...)  // Visual tuning
switch_system(system)          // Quantum / Faceted / Holographic
change_geometry(index)         // 0-23 geometry variants
get_state()                    // Full engine state snapshot
randomize_parameters()         // Random parameter generation
reset_parameters()             // Reset to defaults

// Creative (instantiate creative modules from MCPServer, NOT VIB3Engine)
design_from_description(text)   // NLP → parameters via AestheticMapper
apply_color_preset(preset)      // Delegates to ColorPresetsSystem (with transitions)
play_transition(sequence)       // Executes via TransitionAnimator when engine available
create_timeline(tracks)         // Stores for ParameterTimeline playback
control_timeline(id, action)    // Play/pause/stop/seek stored timelines
create_choreography(scenes)     // Multi-scene composition
play_choreography(id)           // Delegates to ChoreographyPlayer
set_post_processing(effects)    // Browser-only; returns load_code in Node context

// Gallery (in-memory session-scoped persistence)
save_to_gallery(slot)           // Captures engine.exportState() → Map
load_from_gallery(slot)         // Restores via engine.importState()

// Feedback
describe_visual_state()         // Text description of current visual
capture_screenshot()            // Base64 PNG composite (browser-only)

// Discovery
get_sdk_context()               // Onboarding documentation
get_aesthetic_vocabulary()       // 130+ style keywords from AestheticMapper
search_geometries(query)        // Geometry metadata lookup
get_parameter_schema()          // JSON Schema for all parameters

// Export
export_package(format)          // VIB3Package generation
```

### Architecture Note

Creative modules (ColorPresetsSystem, TransitionAnimator, PostProcessingPipeline,
ParameterTimeline, ChoreographyPlayer, AestheticMapper) are **instantiated lazily by
MCPServer**, not by VIB3Engine. MCPServer creates them on first use with parameter
callbacks pointing to the engine. This means:
- They work through MCP tool calls
- They work through direct instantiation in user code
- They are NOT available as `engine.colorPresets` etc. (use MCP or instantiate directly)

### Programmatic Usage

```javascript
// Via MCP protocol
const result = await mcpClient.callTool('batch_set_parameters', {
    system: 'quantum',
    geometry: 16,   // Hypertetrahedron + Tetrahedron
    hue: 280,
    chaos: 0.4
});

// Via direct module instantiation
import { ColorPresetsSystem } from './src/creative/ColorPresetsSystem.js';
const colors = new ColorPresetsSystem((name, value) => engine.setParameter(name, value));
colors.applyPreset('Cyberpunk Neon', true, 800);
```

---

## Project Structure

```
Vib3-CORE-Documented01-/
├── cpp/                          # C++ WASM core
│   ├── include/vib3_ffi.h       # FFI header
│   ├── src/vib3_ffi.cpp         # FFI implementation
│   ├── math/                    # Rotor4D, Mat4x4, Vec4, Projection
│   ├── geometry/                # 8 base generators + WarpFunctions
│   ├── bindings/embind.cpp      # JS bindings via Emscripten
│   ├── tests/                   # C++ unit tests
│   ├── CMakeLists.txt           # Build configuration
│   └── build.sh                 # Build script
│
├── src/
│   ├── core/                    # Engine core
│   │   ├── VIB3Engine.js        # Main VIB3+ engine (+ SpatialInputSystem integration)
│   │   ├── CanvasManager.js     # Canvas lifecycle
│   │   ├── ParameterMapper.js   # Parameter mapping
│   │   ├── Parameters.js        # Parameter definitions
│   │   └── UnifiedResourceManager.js  # Resource management
│   │
│   ├── quantum/                 # Quantum system
│   │   ├── QuantumEngine.js
│   │   └── QuantumVisualizer.js
│   │
│   ├── faceted/                 # Faceted system (with audio + saturation)
│   │   └── FacetedSystem.js
│   │
│   ├── holograms/               # Holographic system
│   │   ├── RealHolographicSystem.js
│   │   └── HolographicVisualizer.js
│   │
│   ├── geometry/                # Geometry library
│   │   ├── GeometryLibrary.js
│   │   ├── GeometryFactory.js
│   │   ├── generators/          # 8 base geometry generators
│   │   ├── warp/
│   │   │   ├── HypersphereCore.js
│   │   │   └── HypertetraCore.js
│   │   └── buffers/
│   │       └── BufferBuilder.js
│   │
│   ├── render/                  # Render backends
│   │   ├── ShaderProgram.js
│   │   └── backends/
│   │       ├── WebGLBackend.js
│   │       └── WebGPUBackend.js
│   │
│   ├── reactivity/              # Reactivity & spatial input
│   │   ├── ReactivityConfig.js
│   │   ├── ReactivityManager.js
│   │   └── SpatialInputSystem.js  # Universal spatial input (current release series)
│   │
│   ├── creative/                # Creative tooling (current release series)
│   │   ├── ColorPresetsSystem.js  # 22 themed color presets
│   │   ├── TransitionAnimator.js  # 14 easing functions, sequencing
│   │   ├── PostProcessingPipeline.js  # 14 effects, 7 preset chains
│   │   └── ParameterTimeline.js   # Keyframe animation with BPM sync
│   │
│   ├── integrations/            # Platform integrations (current release series)
│   │   ├── frameworks/
│   │   │   ├── Vib3React.js     # React component + useVib3() hook
│   │   │   ├── Vib3Vue.js       # Vue 3 component + composable
│   │   │   └── Vib3Svelte.js    # Svelte component + store
│   │   ├── FigmaPlugin.js       # Figma plugin manifest + code
│   │   ├── ThreeJsPackage.js    # Three.js ShaderMaterial
│   │   ├── TouchDesignerExport.js  # GLSL TOP export
│   │   └── OBSMode.js           # Transparent background + browser source
│   │
│   ├── advanced/                # Advanced features (current release series)
│   │   ├── WebXRRenderer.js     # WebXR VR/AR with 6DOF
│   │   ├── WebGPUCompute.js     # WGSL particle + FFT compute
│   │   ├── MIDIController.js    # Web MIDI with learn mode
│   │   ├── AIPresetGenerator.js # Text-to-preset + mutation
│   │   └── OffscreenWorker.js   # Worker rendering + SharedArrayBuffer
│   │
│   ├── export/                  # Export system
│   │   ├── VIB3PackageExporter.js
│   │   └── TradingCardGenerator.js
│   │
│   └── agent/mcp/               # MCP agentic interface
│       ├── MCPServer.js
│       └── tools.js
│
├── tools/                        # Tooling
│   └── shader-sync-verify.js    # Shader sync verification (current release series)
│
├── js/                          # UI layer
│   ├── core/app.js
│   ├── controls/
│   └── gallery/
│
├── examples/
│   ├── codex/                   # Reference implementations (Gold Standard v3)
│   │   ├── index.html           # Codex gallery page
│   │   ├── synesthesia/         # Audio-reactive ambient (golden reference)
│   │   └── README.md            # How to add codex entries
│   └── dogfood/                 # Dogfood analysis + Gold Standard
│       └── GOLD_STANDARD.md     # Creative vocabulary v3
│
├── tests/                       # Test suite
│   ├── sdk-browser.spec.js
│   └── e2e/
│
└── index.html                   # Main entry point
```
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
10. **36 MCP tools, not 12** — DOCS/SYSTEM_INVENTORY.md updated to 36 (Feb 16). Canonical source is `src/agent/mcp/tools.js`.
11. **Layer relationships default to 'holographic' profile** — The `legacy` profile replicates the old static multiplier behavior if you need it.
12. **`initialize()` checks `switchSystem()` return** — As of Feb 15, `VIB3Engine.initialize()` returns `false` if the initial system fails to create. Check the return value.
13. **Hue 0-360 (JS/API) vs 0-1 (GLSL)** — The JS API and MCP tools use hue 0-360. Shaders use hue 0-1 internally. Convert at the boundary: `u_hue = hue / 360.0`. Never pass 0-360 directly to a shader uniform.
14. **4D rotation in synesthesia is audio-driven** — The reference synesthesia implementation has non-zero 4D base velocities but also modulates XW/YW/ZW through audio bands. If building without audio, ensure 4D axes still have non-zero rotation velocity or the 4th dimension won't be visible.
15. **Gold Standard v3 defines 3 parameter modes** — Continuous Mapping (parameters as functions of input state), Event Choreography (discrete triggers with attack/sustain/release), and Ambient Drift (breathing/heartbeat on idle). All three should be present in any VIB3+ creative implementation. See `examples/dogfood/GOLD_STANDARD.md`.
16. **EMA smoothing is the universal primitive** — Use `alpha = 1 - Math.exp(-dt / tau)` for all parameter transitions. Never use `setTimeout` for visual parameter changes. Reference tau values: speed 0.08s, chaos 0.12s, density 0.15s, morph 0.10s, hue 0.25s.
17. **Container div MUST have `position: relative` and non-zero size** — CanvasManager creates 5 `position: absolute` child canvases. Without a positioned parent with dimensions, canvases are invisible. The SDK now auto-fixes `position: static` and logs warnings, but always set it explicitly: `<div id="vib3-container" style="position:relative; width:100vw; height:100vh;">`. See "Rendering Quick Start" section above.
18. **Never top-level import premium if you want fallback rendering** — Use `await import()` inside a try/catch. A broken premium import at the top of a file kills the entire script before the engine even initializes. Premium modules also init with individual try/catch now, so one broken module won't take down the other 7.
19. **Use optional chaining on premium module calls** — `premium?.shaderSurface?.setParameters()`. Individual premium modules can fail to construct (e.g. missing DOM, unsupported API). They'll be `undefined` on the premium context — calling methods directly will throw.
20. **Mobile: set `preferWebGPU: false`** — WebGPU probe can hang or fail on mobile browsers. Use `new VIB3Engine({ system: 'quantum', preferWebGPU: false })` for mobile-first demos. The engine falls back to WebGL automatically, but the probe itself can delay init.
21. **Touch controls: `touch-action: none` on body** — VIB3+ demos should prevent browser default gestures (pull-to-refresh, back-swipe, pinch-zoom). Set `touch-action: none; overscroll-behavior: none; -webkit-user-select: none;` on `body`.

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

## Gold Standard v3 & Codex (Feb 16, 2026)

**Branch**: `claude/clause-code-skill-0PV33`

### The Three Parameter Modes

Every VIB3+ visualization should exhibit three simultaneous parameter behaviors:

1. **Continuous Mapping (Mode 1)** — Parameters are functions of input state, evaluated every frame. Audio bands → visual params, touch position → rotation, tilt → dimension. Not transitions — living mappings.
2. **Event Choreography (Mode 2)** — Discrete events trigger Attack/Sustain/Release sequences. Tap → chaos burst, system switch → drain/flood, beat detection → intensity flash.
3. **Ambient Drift (Mode 3)** — Parameters breathe and drift without input. Heartbeat: `morphFactor += 0.15 * sin(t / 4)`, `intensity += 0.08 * sin(t / 2)`. Prime-number periods prevent mechanical feel.

### Per-System Creative Personality

| System | gridDensity | speed | chaos | dimension | Character |
|--------|------------|-------|-------|-----------|-----------|
| Faceted | 15-35 | 0.3-0.8 | 0.0-0.15 | 3.6-4.0 | Clean, precise, geometric |
| Quantum | 25-60 | 0.5-1.5 | 0.1-0.4 | 3.2-3.8 | Dense, crystalline, mathematical |
| Holographic | 20-50 | 0.4-1.2 | 0.05-0.3 | 3.4-4.2 | Atmospheric, layered, ethereal |

### Design-Analyze-Enhance Loop

Agents building VIB3+ experiences should follow this workflow:
1. **Design** — After absorbing the Gold Standard vocabulary, plan parameter timeline and mappings for your platform
2. **Analyze** — Self-evaluate: Is 4D rotation visible? Do events feel distinct from ambient? Is audio reactivity noticeable?
3. **Enhance** — Find emergent combinations: What if audio onset triggers a burst while heartbeat is running? Layer the three modes together

### Reference

- Gold Standard v3: `examples/dogfood/GOLD_STANDARD.md`
- Codex gallery: `examples/codex/`
- Synesthesia (golden reference): `examples/codex/synesthesia/`
## Recent Session Work (Feb 16, 2026)

**Branch**: `claude/vib3-sdk-handoff-p00R8`
**Dev track**: `DOCS/dev-tracks/DEV_TRACK_SESSION_2026-02-16.md`

### What was built/fixed
1. **Quantum layer detection bug** — 3 of 5 canvas layers were broken (shader float comparisons used wrong values). Fixed with epsilon comparison and aligned values to JS ROLE_INTENSITIES constant.
2. **Holographic uniform standardization** — Renamed `u_density`→`u_gridDensity`, `u_morph`→`u_morphFactor`, `u_geometryType`→`u_geometry` in shader, JS lookups, and variantParams. Removed `mapParameterName()` translation layer.
3. **Tetrahedron lattice differentiation** — Geometry 0 (tetrahedron) now uses tetrahedral symmetry planes instead of the same lattice as geometry 1 (hypercube). Applied to GLSL, WGSL, and external shader files.
4. **rotateXZ sign convention** — External shader files (ShaderLib, rotation4d.glsl/wgsl, WebGPUBackend, WebGPURenderer.ts) had opposite sign convention from inline code. Aligned all to match working inline convention.
5. **Shader include infrastructure** — Added `resolveIncludes()` and `loadAndResolve()` to ShaderLoader. Added warp functions to external geometry24.glsl/wgsl.
6. **QuantumVisualizer canvasId fix** — 6 references to undefined `canvasId` variable replaced with `this._canvasLabel`.
7. **WebGPU WGSL uniform alignment** — Fixed vec3→3×f32 in all WGSL struct definitions to match `packVIB3Uniforms()` layout.
8. **Documentation updates** — SYSTEM_INVENTORY tool count 12→36, MASTER_PLAN tool/test counts updated, CLAUDE.md refreshed.

---

**VIB3+ SDK — Clear Seas Solutions LLC**
