# VIB3+ SDK — Comprehensive Agent Handoff

**Copy this entire document as the initial prompt when starting a new session focused on SDK development.**

Last updated: 2026-02-13

---

## 1. What VIB3+ Actually Is

VIB3+ is a **programmable 4D visualization SDK** — a JavaScript library that renders interactive, audio-reactive visualizations of four-dimensional geometry in real-time on the web.

The core idea: objects in four spatial dimensions (X, Y, Z, W) are mathematically rotated using six independent rotation planes, then projected down to 3D and rendered on-screen. This produces visual effects that are impossible to achieve with standard 3D graphics — objects that fold through themselves, invert, breathe, and transform in ways that feel alien and captivating.

It's not a toy or a demo. It's an SDK intended for production use — with framework adapters (React, Vue, Svelte), creative tools (color presets, post-processing, BPM-synced timelines), platform integrations (Figma, Three.js, TouchDesigner, OBS), advanced features (WebXR, MIDI, AI presets), and an agentic control layer (MCP server with 19 tools, CLI).

**Repository**: `Domusgpt/vib34d-xr-quaternion-sdk`
**Package**: `@vib3code/sdk` v2.0.3 (published on npm)
**Owner**: Clear Seas Solutions LLC / Paul Phillips (pallasite)
**License**: MIT (open-core — see `DOCS/LICENSING_TIERS.md` for commercial tier plans)
**Stack**: ES Modules, Vite, pnpm, Vitest, Playwright, C++ WASM (Emscripten)

### Why It Exists

Paul's vision: a **visual engine for the fourth dimension** that anyone can embed, control, and ship with. The differentiation vs. standard WebGL demos:

1. **Unified mathematical model** — Not one-off shader toys. A coherent 6D rotation system backed by Clifford algebra that works identically across WASM, GLSL, and WGSL.
2. **Multiple rendering aesthetics** — Three visual systems (Quantum, Faceted, Holographic) that share the same geometry/rotation math but produce completely different visual outputs.
3. **Production SDK structure** — Real npm package with 80+ export paths, TypeScript types, framework components, CI/CD, versioning, changelogs.
4. **Agent-first operability** — MCP server, CLI, telemetry. AI agents can create, tune, and operate visualizations programmatically.
5. **Breadth of integration** — Figma plugin, Three.js material, TouchDesigner export, OBS mode, WebXR, MIDI. It meets creators where they already work.

### Who Uses It

| Persona | What they care about |
|---|---|
| **Creative developers** | Shipping differentiated visual experiences — landing pages, dashboards, interactive art. They want stable APIs, fast iteration, framework adapters. |
| **Technical artists / VJs** | Driving visuals via presets, timelines, audio reactivity, and MIDI for live performance. They want rich control and real-time feedback. |
| **Product teams** | Embedding performant, controllable visualizations into production apps. They want clear lifecycle models, testability, long-term compatibility. |
| **AI/agent builders** | Automating scene generation, tuning, and operation. They want MCP tools, CLI, machine-readable schemas, guardrails. |
| **XR teams** | Extending 4D visuals into VR/AR. They want GPU-aware architecture, input abstraction, spatial rendering paths. |

---

## 2. The Three Visualization Systems — What They Actually Are

This is the heart of VIB3+. Each system takes the same 24 geometries and 6D rotation math but renders them with a fundamentally different aesthetic and technical approach. Understanding what makes each one visually distinct is critical for anyone working on the project.

### Quantum System (`src/quantum/`)

**Files**: `QuantumEngine.js` (system manager), `QuantumVisualizer.js` (WebGL renderer)

**Visual character**: Dense, complex, scientific. Think crystalline lattices, energy field interference patterns, particle grids pulsing with life. This is the system that looks most like looking through a microscope at something alien.

**Technical approach**: Single procedural fragment shader running entirely on the GPU. Every pixel is computed mathematically from the rotation state, geometry type, and time. No mesh geometry — it's all raymarching and distance field math in the shader. This makes it incredibly flexible but means the visual complexity is bounded by fragment shader performance.

**When you'd choose Quantum**: Abstract backgrounds, scientific visualizations, anything where visual density and complexity are assets. It's the most "impressive at first glance" system.

**Audio reactivity**: Bass drives density pulsing, mid drives color shift, high drives edge definition. All wired through shader uniforms.

### Faceted System (`src/faceted/`)

**File**: `FacetedSystem.js` (complete system — shader and rendering in one file)

**Visual character**: Clean, precise, geometric. Think kaleidoscopic symmetry, sacred geometry tiles, wireframe patterns with perfect edges. Where Quantum feels organic and noisy, Faceted feels designed and intentional.

**Technical approach**: Also a procedural fragment shader, but the geometry functions produce clean 2D patterns projected from 4D rotation rather than 3D volumetric effects. Uses HSL color pipeline with full hue + saturation control — this was a v2.0.0 fix (originally missing saturation).

**When you'd choose Faceted**: UI elements, design-forward applications, polished product surfaces, anywhere clarity and elegance matter more than visual density. Also the best system for demonstrating how 4D rotation works — the 2D patterns make the dimensional folding intuitive.

**Audio reactivity**: Bass modulates density, mid modulates morph factor, high shifts hue. Click intensity provides interaction feedback. All wired via shader uniforms (this was also a v2.0.0 fix — audio was originally unwired).

### Holographic System (`src/holograms/`)

**Files**: `RealHolographicSystem.js` (system manager, 652 LOC), `HolographicVisualizer.js` (per-layer renderer)

**IMPORTANT**: The class name is `RealHolographicSystem`. Not `HolographicSystem`. This trips people up constantly.

**Visual character**: Layered, atmospheric, immersive. Think holographic trading cards, glassmorphic interfaces, aurora-like effects with depth and transparency. This is the system that feels most like holding a physical holographic object.

**Technical approach**: The key differentiator — a **5-layer canvas stack** where each layer has its own `HolographicVisualizer` instance with independent parameters:

```
background-canvas  — Base layer, lowest opacity, sets the scene
shadow-canvas      — Depth/shadow effects, creates perceived volume
content-canvas     — Primary visual content, the main show
highlight-canvas   — Bright accents that pop above the content
accent-canvas      — Top layer effects, sparkle and shimmer
```

Each layer gets per-layer uniforms (`u_layerScale`, `u_layerOpacity`, `u_layerColor`, `u_densityMult`, `u_speedMult`) on top of the standard parameter set. The layers composite with CSS opacity to create the glassmorphic depth effect.

**Audio reactivity**: Native microphone input. Beat detection on bass, melody detection on mid/high. Per-layer reactivity multipliers — so bass can punch the background while melody sparkles the accent layer.

**When you'd choose Holographic**: Trading card effects, immersive backgrounds, music visualizers, anything where depth and atmosphere matter. It's the most "physical feeling" system.

### Polychora (NOT ACTIVE)

Planned fourth system for rendering true 4D polytopes (5-cell, tesseract as wireframe, 16-cell, 24-cell, 600-cell, 120-cell). Files are archived in `archive/polychora/`. The 1,065-line system stub exists but is **not production-ready, not enabled in UI, and should not be built against**. It's a future roadmap item.

---

## 3. Core Mathematical Architecture

### The 24 Geometry System

Every visualization system renders 24 geometry variants. The encoding is:

```
geometry_index = core_type * 8 + base_geometry
```

**8 base geometries** (index 0-7):
| Index | Name | What it looks like |
|---|---|---|
| 0 | Tetrahedron | Sharp, minimal — the simplest 3D solid extended to 4D |
| 1 | Hypercube | The iconic tesseract — a cube within a cube, 16 vertices, 32 edges |
| 2 | Sphere | Smooth, radial harmonics — a hypersphere projected down |
| 3 | Torus | Donut topology — continuous surface that wraps |
| 4 | Klein Bottle | Non-orientable — a surface that passes through itself (4D required!) |
| 5 | Fractal | Self-similar recursive subdivision — infinite detail at every scale |
| 6 | Wave | Sinusoidal interference — multiple waves interacting |
| 7 | Crystal | Octahedral lattice — geometric precision, sharp facets |

**3 core warps** that modify each base:
| Core | Index Range | What it does |
|---|---|---|
| Base (0) | 0-7 | Pure geometry, no warp |
| Hypersphere (1) | 8-15 | Wraps the geometry onto a 3-sphere (S3) using stereographic-like projection. Creates toroidal structures via Hopf fibration. |
| Hypertetrahedron (2) | 16-23 | Warps the geometry onto a pentatope (5-cell). Points cluster near pentatope vertices and edges, creating a tetrahedral skeleton. |

The warp functions live in `src/geometry/HypersphereCore.js` and `src/geometry/HypertetraCore.js`.

### The 6D Rotation System

This is mathematically the most important part of VIB3+. In 4D space, there are six independent rotation planes (not three like in 3D):

| Plane | Type | Intuitive effect |
|---|---|---|
| XY | 3D | Familiar rotation around Z axis |
| XZ | 3D | Familiar rotation around Y axis |
| YZ | 3D | Familiar rotation around X axis |
| XW | 4D | Rotates X into the fourth dimension — objects appear to stretch/compress in X |
| YW | 4D | Rotates Y into the fourth dimension |
| ZW | 4D | Rotates Z into the fourth dimension |

**Application order MATTERS**: XY, XZ, YZ, XW, YW, ZW. Rotation is not commutative in 4D. Changing the order produces different results. This is enforced in all three implementations:

1. **C++ WASM rotors** (`cpp/Rotor4D.cpp`): Uses Clifford algebra Cl(4,0). Mathematically exact. The "ground truth" implementation. An 8-component rotor (scalar + 6 bivectors + pseudoscalar) represents the rotation, applied via the sandwich product `v' = R * v * R_dagger`.

2. **GLSL matrices** (inline in visualizer `.js` files): GPU-accelerated, computed per-pixel in fragment shaders. Six 4x4 rotation matrices multiplied together. This is what actually renders on screen.

3. **WGSL matrices** (WebGPU path): Same math as GLSL but in WGSL syntax for the WebGPU backend.

All three must produce identical results. If they disagree, you have a bug.

### 4D to 3D Projection

After rotation, 4D points must be projected to 3D for display:

- **Perspective** (default): `P = xyz / (distance - w)`. The `dimension` parameter (3.0-4.5) controls the projection distance. Lower values = more dramatic distortion.
- **Stereographic**: `P = xyz / (1 - w)`. Conformal — preserves angles. Produces smoother deformations.
- **Orthographic**: `P = xyz`. Just drops W. Parallel projection — no foreshortening.

---

## 4. Development History & Arc

Understanding where the project has been is essential for knowing where it's going.

### Phase 1-3: Foundation (pre-2026)
The core engine was built: 3 visualization systems, 24 geometry encoding, 6D rotation with WASM + GLSL, MCP agent tools, CLI, telemetry. This was ~60K lines of working code.

### Phase A: Parity & Polish (v2.0.0)
Fixed critical gaps discovered in audit:
- Quantum system had no color control — added
- Faceted system was missing saturation control and audio reactivity — added `hsl2rgb()` pipeline + bass/mid/high uniforms
- `clickIntensity` was mapped to wrong uniform — fixed
- Inline shaders could drift from external files — created `shader-sync-verify.js` tool (937 lines)

### Phase B-D: Feature Expansion (v2.0.0)
Added four major capability layers:
- **Creative Tooling** (`src/creative/`): 22 color presets, 14 easing functions, 14 post-processing effects, BPM-synced parameter timeline
- **Platform Integrations** (`src/integrations/`): React/Vue/Svelte components, Figma plugin generator, Three.js ShaderMaterial, TouchDesigner GLSL export, OBS transparent mode
- **Advanced Features** (`src/advanced/`): WebXR 6DOF renderer, WebGPU compute shaders, MIDI controller with learn mode, AI preset generator, OffscreenCanvas worker
- **SpatialInputSystem** (`src/reactivity/SpatialInputSystem.js`): Universal spatial input with 8 sources and 6 profiles

### January 31, 2026: Master Plan Execution
Full 570-file codebase audit revealed:
- 14 broken package exports (quaternion, pose, sensors etc. referencing nonexistent files) — removed
- No LICENSE file — created MIT
- No CHANGELOG — created
- No TypeScript barrel — created `types/adaptive-sdk.d.ts`
- No CI publish workflow — created
- `npm run dev` alias missing — added
- Created landing page, CLI `init` command, React/Vanilla/Three.js examples, Storybook config, cross-browser Playwright, accessibility CSS, WASM build CI, OBS setup guide, CONTRIBUTING.md, SECURITY.md, ErrorReporter

**Result**: 43 action items across 6 execution phases, ~25 files created.

### February 6, 2026: Hygiene + MCP + Landing Page
Two-phase session:

**Phase A (Hygiene)**:
- `CanvasManager.js` completely rewritten (217 to 110 lines) — API contract was broken against VIB3Engine
- `HolographicRendererAdapter.js` import was broken — fixed
- `TradingCardManager.js` had broken import paths — fixed
- External shader files missing `u_breath` uniform — synced across 4 shader files
- Version strings unified to 2.0.1 across all 4 locations
- `ViewerInputHandler.js` renamed from `ReactivityManager` (the viewer one, not the reactivity one)
- Stale `package-lock.json` removed (240KB)

**Phase B (Infrastructure)**:
- FacetedSystem RendererContract compliance (added `init()`, `resize()`, `dispose()`)
- HolographicVisualizer breath desync bug fixed
- Real MCP server created (`stdio-server.js`, 230 lines) — JSON-RPC 2.0 over stdio
- Agent documentation packs created (Claude + OpenAI configs)
- Enhanced landing page (`index-v2.html`, 2100+ lines)
- Test count: 933/933 passing

### February 13, 2026: Site Refactor + Documentation Overhaul
- Separated landing page into `site/` directory
- Extracted 1,318 lines of inline CSS to `site/styles/main.css`
- Updated hero/messaging to emphasize C++ WASM core, WebGPU, TypeScript, MCP
- Created product strategy, roadmap, system inventory, documentation index
- Root `index.html` now redirects to `site/index.html`; SDK demo moved to `demo/index.html`
- Rewrote `CLAUDE.md` from raw technical dump to proper project brief
- Rewrote this handoff document from skeleton to comprehensive reference

---

## 5. Current State — Honest Assessment

### What Works Well
- **Core rendering pipeline**: All three systems render correctly. 24 geometries work. 6D rotation works.
- **Math foundation**: WASM rotors and JS fallback produce correct results. Projections are solid.
- **Test suite**: 933+ unit tests passing across 43 files. Math, render, geometry, scene, agent/telemetry all covered.
- **69 E2E tests**: Playwright browser tests running.
- **MCP server**: Real JSON-RPC 2.0 implementation with 19 tools and 4 documentation resources.
- **npm package**: Published and installable. 80+ export paths.
- **CI/CD**: 9 GitHub Actions workflows including auto-publish, WASM build, Pages deploy.
- **Shader sync tooling**: `shader-sync-verify.js` catches inline/external drift.

### What's Incomplete or Fragile
- **TypeScript types**: `types/adaptive-sdk.d.ts` is a basic barrel. Most v2.0 modules (creative, integrations, advanced, SpatialInput) have NO type definitions. IDE experience is poor for ~15,500 lines of new code.
- **WebGPU backend**: Scaffold exists (adapter, device, clear pass). Missing: pipeline creation, WGSL shader compilation, buffer binding, feature gating. WebGL is the tested path.
- **RendererContract compliance**: Not all systems fully implement the contract interface. FacetedSystem got `init()/resize()/dispose()` in Feb 2026 but compliance is inconsistent.
- **Test coverage for v2.0 modules**: 18 modules totaling ~15,500 lines have ZERO tests. Creative, integrations, advanced, SpatialInput, shader-sync-verify — all untested.
- **Polychora**: 1,065-line stub that's not production-ready. Decision needed: implement or remove.

### What's Aspirational (Described But Not Built)
- **Licensing/activation system**: Detailed tier/pricing/flow/schema defined in `DOCS/LICENSING_TIERS.md`. Zero implementation. No `LicenseManager`, `FeatureGate`, or server.
- **Figma Community publish**: Plugin code generator exists. Plugin is not published.
- **API documentation site**: No generated docs. JSDoc exists in source but no Docusaurus/TypeDoc pipeline.
- **Gallery web app**: Static gallery of HTML pages exists. No shareable permalinks, embed codes, or user-created presets.
- **Performance benchmarks as CI gates**: Benchmark runner exists. No threshold assertions. Benchmarks don't fail CI on regression.

---

## 6. Current Priorities (Q1-Q2 2026)

### Q1 2026 — Shipping Now
| Milestone | Status | What it means |
|---|---|---|
| Stabilize core rendering + lifecycle contracts | In Progress | Harden RendererContract, fix edge cases in system switching, ensure destroy/dispose paths are clean |
| MCP/agent integration hardening | In Progress | Make the 19 MCP tools robust, improve error handling, add validation |
| Eliminate export + packaging regressions | Done | Broken exports removed, package.json cleaned up |

### Q2 2026 — Next
| Milestone | Status | Blocked by |
|---|---|---|
| Advanced viz subsystem parity (WebGPU, XR) | Planned | WebGPU backend completion |
| Cross-platform SDK examples refresh | Planned | Framework adapter stabilization |
| Observability + telemetry baseline | Blocked | Telemetry pipeline architecture decisions |

### The Honest Priority Stack
1. **Test coverage for critical path** — VIB3Engine.js, CanvasManager.js, system switching, 6D rotation end-to-end
2. **TypeScript types** — The main entry point's types field works but most modules have no types
3. **WebGPU backend** — Scaffold to real pipeline. This is the performance differentiator.
4. **Landing page quality** — Currently functional but visually rigid (see `DOCS/HANDOFF_LANDING_PAGE.md` for the full breakdown)
5. **Test coverage for v2.0 modules** — 18 modules at 0%. Not blocking launch but blocking confidence.

See `DOCS/ROADMAP.md` for the full quarterly milestone plan with owner assignments and evidence links.

---

## 7. Architecture Details That Matter

### File Structure
```
/
├── src/                          # SDK source (~95K lines)
│   ├── core/                     # Engine orchestration
│   │   ├── VIB3Engine.js         # THE main file. System switching, params, canvas, spatial input.
│   │   ├── CanvasManager.js      # 5-layer canvas lifecycle (rewritten Feb 2026)
│   │   ├── Parameters.js         # Parameter definitions and validation
│   │   ├── ParameterMapper.js    # Maps abstract params to system-specific values
│   │   ├── UnifiedResourceManager.js  # GPU resource tracking + disposal
│   │   ├── ErrorReporter.js      # Opt-in error reporting (v2.0.1)
│   │   └── renderers/            # Per-system adapter classes
│   ├── quantum/                  # Quantum visualization system
│   ├── faceted/                  # Faceted visualization system
│   ├── holograms/                # Holographic visualization system
│   ├── geometry/                 # 24-geometry library + generators + warps
│   ├── math/                     # Vec4, Rotor4D, Mat4x4, Projection (JS fallback for WASM)
│   ├── render/                   # ShaderProgram, RenderState, WebGL/WebGPU backends
│   ├── scene/                    # Node4D, Scene4D, ResourceManager, MemoryPool
│   ├── reactivity/               # ReactivityManager + SpatialInputSystem
│   ├── creative/                 # ColorPresets, Transitions, PostProcessing, Timeline
│   ├── integrations/             # React, Vue, Svelte, Figma, Three.js, TouchDesigner, OBS
│   ├── advanced/                 # WebXR, WebGPU Compute, MIDI, AI Presets, OffscreenWorker
│   ├── agent/                    # MCP server, CLI, telemetry
│   ├── viewer/                   # ViewerPortal, GalleryUI, CardBending, audio reactivity
│   ├── export/                   # VIB3PackageExporter, TradingCardGenerator
│   ├── gallery/                  # GallerySystem (save/load states)
│   ├── wasm/                     # WasmLoader (optional C++ core)
│   ├── llm/                      # LLMParameterInterface (text-to-params)
│   ├── schemas/                  # JSON Schema validation
│   └── shaders/                  # External shader files (GLSL + WGSL)
├── cpp/                          # C++ WASM core (Rotor4D, Mat4x4, embind)
├── site/                         # Landing page (HTML + GSAP choreography)
├── demo/                         # SDK controls demo (moved from root)
├── docs/                         # Static gallery pages (GitHub Pages)
├── tools/                        # shader-sync-verify.js, CI scripts
├── tests/                        # Vitest unit tests + Playwright E2E
├── types/                        # TypeScript definitions
├── agent-config/                 # MCP config, Claude/OpenAI context packs
├── examples/                     # React, Vanilla, Three.js example apps
└── .storybook/                   # Storybook config
```

### The Shader System — Where the Rendering Actually Happens

This is where new developers get confused. The shaders exist in TWO places:

1. **Inline in visualizer `.js` files**: `QuantumVisualizer.js`, `FacetedSystem.js`, `HolographicVisualizer.js` all contain GLSL shader source as template literals. This is what actually runs.

2. **External files in `src/shaders/`**: GLSL and WGSL files that are supposed to mirror the inline versions. These exist for tooling, documentation, and future build pipeline integration.

**The drift problem**: When someone edits the inline shader and forgets to update the external file (or vice versa), they desync. This was a real bug (the `u_breath` uniform existed inline but not externally). The `shader-sync-verify.js` tool (937 lines) parses both, compares uniforms/fields, and reports differences. Always run `pnpm verify:shaders` after touching any shader code.

### The Canvas Architecture

Each visualization system gets five HTML `<canvas>` elements stacked via CSS:

```
background-canvas  (z-index lowest, lowest opacity)
shadow-canvas
content-canvas     (primary rendering happens here)
highlight-canvas
accent-canvas      (z-index highest)
```

Canvas IDs follow system-specific naming:
- Quantum: `quantum-background-canvas`, `quantum-shadow-canvas`, etc.
- Faceted: `background-canvas`, `shadow-canvas`, etc. (no prefix — historical quirk)
- Holographic: `holo-background-canvas`, `holo-shadow-canvas`, etc.

`CanvasManager.js` handles creation, sizing, and destruction. It was completely rewritten on Feb 6, 2026 because its API didn't match what VIB3Engine expected. The new version is 110 lines and provides `createSystemCanvases()`, `registerContext()`, and `destroy()`.

### The SpatialInputSystem

This is one of VIB3+'s most distinctive features. It decouples "card tilting" from physical device orientation, creating a universal spatial input layer:

**Input sources** (8): deviceTilt, mousePosition, gyroscope, gamepad, perspective, programmatic, audio, MIDI

**Built-in profiles** (6): cardTilt (default), wearablePerspective, gameAsset, vjAudioSpatial, uiElement, immersiveXR

**How it works**: Any input source feeds a normalized spatial state (pitch/yaw/roll/x/y/z/intensity/velocity). A profile defines how that state maps to visualization parameters. Per-axis lerp smoothing prevents jitter. "Dramatic mode" applies 8x amplification for live performance.

The system is integrated into VIB3Engine with 7 methods: `enableSpatialInput()`, `disableSpatialInput()`, `feedSpatialInput()`, `setSpatialSensitivity()`, `setSpatialDramaticMode()`, `getSpatialState()`, `setSpatialProfile()`.

### The MCP Agent Layer

The MCP server (`src/agent/mcp/stdio-server.js`) implements JSON-RPC 2.0 over stdio per the Model Context Protocol spec. It exposes:

- **19 tools** for controlling the engine: create visualizations, set rotation, change geometry, manage gallery, get state, randomize/reset, etc.
- **4 documentation resources**: CLAUDE.md, geometry summary, control reference, live state
- **Proper protocol handshake**: `initialize`/`initialized`, `tools/list`, `tools/call`, `resources/list`, `resources/read`, `ping`

The `vib3-mcp` binary in package.json makes it installable as an MCP server for Claude Desktop, Cursor, and other MCP clients. Agent config packs in `agent-config/` provide drop-in setup for Claude and OpenAI agents.

### The Creative Tooling Layer

Four systems in `src/creative/` that add production-quality creative control:

- **ColorPresetsSystem** (980 lines): 22 themed presets (Ocean, Lava, Neon, Monochrome, etc.) that set multiple parameters at once
- **TransitionAnimator** (683 lines): 14 easing functions (linear, easeInOutCubic, elastic, bounce, etc.) for smooth interpolation between states. Supports sequencing.
- **PostProcessingPipeline** (1,113 lines): 14 composable GPU effects (bloom, chromatic aberration, vignette, film grain, scanlines, etc.) with 7 preset chains (cinematic, retro, neon, etc.)
- **ParameterTimeline** (1,061 lines): Keyframe-based parameter animation with BPM sync. Drive any parameter on a musical timeline.

### The Breath System

A global organic breathing cycle from `VitalitySystem.js` — a 6-second cosine wave oscillating 0 to 1 to 0, modulating all three visualization systems via the `u_breath` uniform:

| System | Effect | Strength |
|---|---|---|
| Quantum | Lattice brightness pulse | +40% at full exhale |
| Faceted | Pattern intensity pulse | +30% at full exhale |
| Holographic | Projection expansion + glow + density | +20% / +10% / +40% |

A bug was found in Feb 2026 where HolographicVisualizer had its own independent breath cycle running out of sync with the centralized one. Fixed to use the centralized value with 0.0 default.

---

## 8. Gotchas, Traps, and Hard-Won Lessons

These are the things that waste hours if you don't know them:

1. **Use pnpm, not npm**. `pnpm-lock.yaml` is the canonical lockfile. Running `npm install` creates a `package-lock.json` that conflicts. The stale `package-lock.json` was already removed once (Feb 2026). Don't recreate it.

2. **`RealHolographicSystem`, not `HolographicSystem`**. The class was renamed during development. Old references and imports may still say `HolographicSystem`. The actual export is `RealHolographicSystem`.

3. **Version strings are in 4 places**. `package.json`, `VIB3Engine.exportState()`, `Parameters.exportConfiguration()`, and `ErrorReporter`. When bumping the version, update ALL FOUR. They were unified to 2.0.1 in Feb 2026 (previously VIB3Engine said 1.2.0 while package.json said 2.0.0).

4. **Two different ReactivityManagers**. `src/viewer/ViewerInputHandler.js` (renamed from ReactivityManager) handles viewer-level input (mouse, touch, tilt for the card-bending UI). `src/reactivity/ReactivityManager.js` is the SDK-level reactivity system. They are DIFFERENT files with different purposes. Don't confuse them.

5. **Inline shaders are the source of truth for rendering**. External shader files in `src/shaders/` are secondary. If they conflict, the inline version is what actually runs. But always keep them in sync — run `pnpm verify:shaders`.

6. **6D rotation order is XY, XZ, YZ, XW, YW, ZW**. This is hardcoded in WASM, GLSL, and WGSL. Changing the order in one implementation without changing the others will produce subtly wrong rotations that are very hard to debug.

7. **WASM is optional — JS fallback exists**. The math library in `src/math/` (Vec4, Rotor4D, Mat4x4, Projection) provides pure JS implementations of everything the C++ core does. If WASM fails to load (10-second timeout), the engine silently falls back. This is by design.

8. **WebGPU is optional — WebGL fallback exists**. `UnifiedRenderBridge` tries WebGPU first but falls back to WebGL. Currently WebGL is the well-tested path. WebGPU backend is a scaffold.

9. **The `u_breath` uniform**. This is a global organic breathing cycle from `VitalitySystem.js` — a 6-second cosine wave (0 to 1 to 0) that modulates all three systems. A bug was found in Feb 2026 where HolographicVisualizer had its own independent breath cycle that ran out of sync. Fixed to use centralized value with 0.0 default.

10. **Faceted canvas naming quirk**. Quantum uses `quantum-*-canvas`, Holographic uses `holo-*-canvas`, but Faceted uses unprefixed names (`background-canvas`, `content-canvas`, etc.). This is historical and affects DOM queries.

11. **The landing page is in `site/`, not root**. Root `index.html` is a redirect. The SDK demo is in `demo/index.html`. The landing page with GSAP choreography is `site/index.html` with JS in `site/js/`. Don't accidentally edit the wrong `index.html`.

12. **CanvasManager was rewritten**. If you see old code or references assuming the pre-Feb-2026 CanvasManager API (which was 217 lines with a different interface), it's stale. The current version is 110 lines with `createSystemCanvases()`, `registerContext()`, `destroy()`.

---

## 9. Documentation Map

| What you need | Where to find it |
|---|---|
| **Quick project onboarding** | `CLAUDE.md` — concise brief, start here |
| **Full architecture & module inventory** | `DOCS/SYSTEM_INVENTORY.md` — canonical technical reference |
| **Product strategy & personas** | `DOCS/PRODUCT_STRATEGY.md` |
| **Quarterly roadmap & milestones** | `DOCS/ROADMAP.md` |
| **Licensing tiers & commercial model** | `DOCS/LICENSING_TIERS.md` |
| **Master plan (comprehensive backlog)** | `DOCS/MASTER_PLAN_2026-01-31.md` — 43 items across 6 phases |
| **All parameter details & UI controls** | `DOCS/CONTROL_REFERENCE.md` |
| **Project setup from scratch** | `DOCS/PROJECT_SETUP.md` + `DOCS/ENV_SETUP.md` |
| **CI/CD & testing** | `DOCS/CI_TESTING.md` |
| **Renderer lifecycle & contracts** | `DOCS/RENDERER_LIFECYCLE.md` |
| **GPU resource disposal** | `DOCS/GPU_DISPOSAL_GUIDE.md` |
| **WebGPU backend status** | `DOCS/WEBGPU_STATUS.md` |
| **XR benchmarks** | `DOCS/XR_BENCHMARKS.md` |
| **Export formats** | `DOCS/EXPORT_FORMATS.md` |
| **Agent CLI onboarding** | `DOCS/CLI_ONBOARDING.md` |
| **Landing page handoff** | `DOCS/HANDOFF_LANDING_PAGE.md` — visual quality issues + GSAP patterns |
| **Site refactor details** | `DOCS/SITE_REFACTOR_PLAN.md` |
| **Full docs index + reading paths** | `DOCS/README.md` |
| **Dev session logs** | `DOCS/dev-tracks/` (Jan 31, Feb 6 2026) |

---

## 10. Commands

```bash
pnpm install                    # Install deps (NOT npm)
pnpm dev                        # Vite dev server (opens browser)
pnpm test                       # Vitest unit tests (933+ passing)
pnpm test:e2e                   # Playwright browser tests (69 passing)
pnpm test:all                   # Both
pnpm verify:shaders             # Check inline vs external shader sync
pnpm build:web                  # Production build
pnpm build:lib                  # UMD + ESM library build for CDN/npm
pnpm lint                       # ESLint
pnpm bench                      # Performance benchmarks
```

Build WASM core (requires Emscripten): `cd cpp && ./build.sh`

---

## 11. Session Workflow

1. Read `CLAUDE.md` for the concise brief
2. Read this document for full context
3. Read `DOCS/SYSTEM_INVENTORY.md` if you need the complete module map
4. Run `pnpm test` to verify baseline before making changes
5. Always run `pnpm test` after changes
6. If touching shaders, run `pnpm verify:shaders`
7. Commit with descriptive messages referencing what was changed and why
8. Check `DOCS/ROADMAP.md` for current milestone context

---

**VIB3+ SDK — Clear Seas Solutions LLC**
