# CLAUDE.md — VIB3+ SDK Project Brief

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

VIB3+ has three active rendering systems. Each one takes the same 24 geometries and 6D rotation math but renders them with a completely different visual approach:

### Quantum (`src/quantum/`)
**The dense, complex one.** Renders quantum-inspired lattice patterns — think crystalline interference, energy fields, particle grids. Uses a single procedural fragment shader that generates complex visual structures entirely on the GPU. Best for abstract, high-density visualizations with a scientific/mathematical feel.

### Faceted (`src/faceted/`)
**The clean, geometric one.** Renders precise 2D geometric patterns projected from 4D rotation. Think kaleidoscopic symmetry, tiled sacred geometry, clean wireframe aesthetics. Uses HSL color with full hue + saturation control. Best for polished UI elements, design-forward applications, and situations where clarity matters more than complexity.

### Holographic (`src/holograms/`)
**The layered, atmospheric one.** Renders through a 5-layer glassmorphic canvas stack (background → shadow → content → highlight → accent), each with its own shader instance and opacity. Native microphone input for audio reactivity with beat/melody detection. Best for immersive holographic effects, live music visuals, and ambient backgrounds.

> **Polychora** is a planned fourth system for true 4D polytope rendering. It is archived and not production-ready — files live in `archive/polychora/`. Do not build against it.

---

## Core Concepts

### 24 Geometries
Every system renders 24 geometry variants, encoded as:
```
index = coreType * 8 + baseGeometry
```
- **8 base geometries** (0-7): Tetrahedron, Hypercube, Sphere, Torus, Klein Bottle, Fractal, Wave, Crystal
- **3 core warps** (0-2): Base (no warp), Hypersphere (S³ projection), Hypertetrahedron (pentatope warp)
- Total: 8 bases × 3 warps = 24 variants per system

### 6D Rotation
Objects exist in 4D space (X, Y, Z, W). Rotation happens in six independent planes:
- **3D planes**: XY, XZ, YZ — familiar 3D rotations
- **4D planes**: XW, YW, ZW — hyperspace rotations that reveal the fourth dimension

Application order is always XY → XZ → YZ → XW → YW → ZW. This is implemented three ways (WASM rotors, GLSL matrices, WGSL matrices) and all must agree.

### 5-Layer Canvas Architecture
Each system renders to five stacked canvases: background, shadow, content, highlight, accent. The Holographic system uses all five with per-layer shaders; Quantum and Faceted primarily use the content layer.

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
pnpm test             # Vitest unit tests
pnpm run test:e2e     # Playwright browser tests
pnpm run verify:shaders  # Check inline/external shader sync
```

Build WASM core (requires Emscripten): `cd cpp && ./build.sh`

---

## Current Priorities & Status

**Engine status**: Complete. 95,000+ lines across 570+ files. All three systems working.

**What's shipping now** (Q1 2026):
- Stabilizing core rendering + lifecycle contracts
- MCP/agent integration hardening
- Export + packaging regression fixes (done)

**What's next** (Q2 2026):
- Advanced visualization subsystem parity (WebGPU, XR)
- Cross-platform integration SDK examples refresh
- Observability + telemetry baseline

**Key gaps**:
- TypeScript types incomplete (many v2.0 modules missing `.d.ts`)
- WebGPU backend needs full shader pipeline
- Some systems don't fully implement RendererContract
- New modules (creative, integrations, advanced) need more test coverage

See `DOCS/ROADMAP.md` for the full quarterly plan and `DOCS/STATUS.md` for release metadata.

---

## Documentation Map

Don't dig through source code when there's already a doc for it. The `DOCS/` directory is well-organized:

| What you need | Where to find it |
|---|---|
| **Full architecture & module inventory** | `DOCS/SYSTEM_INVENTORY.md` — the canonical technical reference |
| **Product strategy & personas** | `DOCS/PRODUCT_STRATEGY.md` |
| **Quarterly roadmap & milestones** | `DOCS/ROADMAP.md` |
| **Licensing & commercial model** | `DOCS/LICENSING_TIERS.md` |
| **Master plan (what's done, what's not)** | `DOCS/MASTER_PLAN_2026-01-31.md` |
| **All parameter details & UI controls** | `DOCS/CONTROL_REFERENCE.md` |
| **Project setup from scratch** | `DOCS/PROJECT_SETUP.md` + `DOCS/ENV_SETUP.md` |
| **CI/CD & testing** | `DOCS/CI_TESTING.md` |
| **Renderer lifecycle & contracts** | `DOCS/RENDERER_LIFECYCLE.md` |
| **GPU resource disposal** | `DOCS/GPU_DISPOSAL_GUIDE.md` |
| **WebGPU backend status** | `DOCS/WEBGPU_STATUS.md` |
| **XR performance benchmarks** | `DOCS/XR_BENCHMARKS.md` |
| **Export formats (SVG, Lottie, etc.)** | `DOCS/EXPORT_FORMATS.md` |
| **Agent CLI onboarding** | `DOCS/CLI_ONBOARDING.md` |
| **Full docs index + reading paths** | `DOCS/README.md` |

Recent dev session logs live in `DOCS/dev-tracks/`. Archived docs in `DOCS/archive/`.

---

## Key Architecture Files

| File | Role |
|---|---|
| `src/core/VIB3Engine.js` | Main orchestrator — system switching, parameter management, canvas orchestration, spatial input |
| `src/core/CanvasManager.js` | Canvas lifecycle — `createSystemCanvases()` / `registerContext()` / `destroy()` |
| `src/core/Parameters.js` | Parameter definitions and validation |
| `src/quantum/QuantumEngine.js` | Quantum system manager |
| `src/faceted/FacetedSystem.js` | Faceted system (complete — shader + rendering in one file) |
| `src/holograms/RealHolographicSystem.js` | Holographic system manager (note: class is `RealHolographicSystem`, not `HolographicSystem`) |
| `src/holograms/HolographicVisualizer.js` | Per-layer holographic renderer |
| `src/agent/mcp/tools.js` | MCP tool definitions (12 tools) |
| `src/reactivity/SpatialInputSystem.js` | Universal spatial input (8 sources, 6 profiles) |
| `cpp/Rotor4D.cpp` | WASM 4D rotation math (Clifford algebra) |

---

## Common Gotchas

1. **pnpm, not npm** — `pnpm-lock.yaml` is the canonical lockfile. Using npm will create conflicts.
2. **`RealHolographicSystem`** — The actual class name. Don't look for `HolographicSystem`.
3. **Version strings in 4 places** — `package.json`, `VIB3Engine.exportState()`, `Parameters.exportConfiguration()`, `ErrorReporter`. Keep them in sync.
4. **Inline vs external shaders can drift** — Visualizer `.js` files contain inline GLSL. External shader files in `src/shaders/` can desync. Run `pnpm run verify:shaders` to check.
5. **6D rotation order matters** — Always XY → XZ → YZ → XW → YW → ZW. Changing order produces different results.
6. **ViewerInputHandler vs ReactivityManager** — `src/viewer/ViewerInputHandler.js` (renamed from ReactivityManager) is a *different file* from `src/reactivity/ReactivityManager.js`.
7. **WASM is optional** — Engine falls back to JS math if `.wasm` isn't available.
8. **WebGPU is optional** — Falls back to WebGL.

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

## MCP Agent Tools (12)

For AI agents controlling VIB3+ programmatically. Full definitions in `src/agent/mcp/tools.js`.

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

---

**VIB3+ SDK — Clear Seas Solutions LLC**
