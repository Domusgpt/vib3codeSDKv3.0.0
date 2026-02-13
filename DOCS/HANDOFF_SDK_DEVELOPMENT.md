# VIB3+ SDK Development Handoff Prompt

**Copy this entire document as the initial prompt when starting a new session focused on SDK development and testing.**

---

## Context

You are continuing development on **VIB3+ (`@vib3code/sdk` v2.0.3)**, a 4D visualization SDK published on npm. The SDK provides three rendering systems (Quantum, Faceted, Holographic), 24 geometry variants via a `coreType * 8 + baseGeometry` encoding, and 6D rotation (XY/XZ/YZ + XW/YW/ZW planes) using Clifford algebra rotors.

**Repository:** `Domusgpt/vib34d-xr-quaternion-sdk`
**Stack:** ES Modules, Vite, pnpm, Vitest (933 tests passing), Playwright (69 E2E tests), C++ WASM (Emscripten), TypeScript definitions
**Owner:** Clear Seas Solutions LLC / Paul Phillips

## Architecture (Read CLAUDE.md for Full Reference)

```
src/
├── core/           VIB3Engine.js (orchestrator), CanvasManager.js (5-layer lifecycle), Parameters.js
├── quantum/        QuantumEngine.js + QuantumVisualizer.js (WebGL fragment shader)
├── faceted/        FacetedSystem.js (WebGL fragment shader, HSL color + audio)
├── holograms/      RealHolographicSystem.js + HolographicVisualizer.js (5-layer glassmorphic)
├── geometry/       GeometryLibrary, 8 generators, HypersphereCore + HypertetraCore warps
├── math/           Vec4, Rotor4D, Mat4x4, Projection (JS fallback for WASM)
├── render/         ShaderProgram, RenderState, WebGLBackend, WebGPUBackend (partial)
├── scene/          Node4D, Scene4D, ResourceManager, MemoryPool
├── reactivity/     ReactivityManager, SpatialInputSystem (8 input sources, 6 profiles)
├── creative/       ColorPresetsSystem (22), TransitionAnimator (14 easings), PostProcessingPipeline (14 FX), ParameterTimeline (BPM sync)
├── integrations/   React/Vue/Svelte components, Figma plugin, Three.js, TouchDesigner, OBS
├── advanced/       WebXR (6DOF), WebGPU compute, MIDI controller, AI presets, OffscreenWorker
├── agent/mcp/      JSON-RPC 2.0 MCP server (19 tools, 4 resources), stdio-server.js
├── viewer/         ViewerPortal, GalleryUI, CardBending, TradingCardExporter, AudioReactivity
├── wasm/           WasmLoader (optional C++ core via Emscripten)
├── gallery/        GallerySystem (save/load/share states)
├── export/         VIB3PackageExporter, TradingCardGenerator
├── llm/            LLMParameterInterface (text-to-params)
└── schemas/        JSON Schema validation (parameters, tool-response, error)
```

## Current State & What Works

- **Core engine fully functional** — 3 active systems, 24 geometries, 6D rotation, parameter management
- **MCP agentic control working** — Real JSON-RPC 2.0 server, `vib3-mcp` binary, 19 tools
- **933 unit tests passing** — Math 100%, Render 100%, Geometry 100%, Scene 100%, Agent/Telemetry good
- **69 E2E tests passing** — Playwright browser tests
- **Published to npm** — `@vib3code/sdk@2.0.3`
- **CI/CD** — 9 GitHub Actions workflows, auto-publish on tag, Pages deploy
- **Shader sync verified** — Inline and external shaders match (run `pnpm verify:shaders`)

## Priority Development Areas

### 1. Test Coverage Gaps (HIGH PRIORITY)
These modules have 0% test coverage — focus on integration tests:
- `VIB3Engine.js` — Main orchestrator, most critical path
- `CanvasManager.js` — 5-layer canvas lifecycle
- `src/viewer/` module — GalleryUI, ViewerInputHandler, TradingCardExporter
- `src/gallery/GallerySystem.js`

Run tests: `pnpm test` (unit) | `pnpm test:e2e` (browser)

### 2. WebGPU Backend Completion (MEDIUM PRIORITY)
- **File:** `src/render/backends/WebGPUBackend.js`
- **Status:** Scaffold done (adapter/device/clear pass). Missing: pipeline creation, vertex/fragment shader compilation (WGSL), buffer binding, feature gating
- **Reference:** `DOCS/WEBGPU_STATUS.md`
- WebGL fallback is robust — WebGPU is enhancement, not blocker

### 3. Polychora System (LOW — Intentionally Deferred)
- **File:** `src/polychora/PolychoraSystem.js` — 78-line stub
- **Decision needed:** Implement proper 4D polytope rendering (120-cell, 600-cell, etc.) or remove stub entirely
- Currently disabled in UI and marked TBD everywhere

### 4. TypeScript Definitions Enhancement
- Current definitions in `types/adaptive-sdk.d.ts` are basic
- Expand to cover all exported modules for better IDE support
- Consider auto-generation from JSDoc

### 5. API Documentation Site
- No generated docs site exists yet
- Consider Docusaurus or TypeDoc pipeline
- All code has decent JSDoc comments already

## Key Gotchas (Save Yourself Time)

1. **HolographicSystem vs RealHolographicSystem** — The actual class is `RealHolographicSystem`. The old name was a refactoring leftover.
2. **Version strings live in 4 places** — `package.json`, `VIB3Engine.exportState()`, `Parameters.exportConfiguration()`, `ErrorReporter`. Update all when bumping version.
3. **Inline shaders can desync from external files** — Always run `pnpm verify:shaders` after touching shaders.
4. **`src/viewer/ViewerInputHandler.js`** (renamed from ReactivityManager) is DIFFERENT from `src/reactivity/ReactivityManager.js`. Don't confuse them.
5. **Use pnpm, not npm** — `pnpm-lock.yaml` is canonical.
6. **Landing page moved to `site/`** — Root `index.html` is now a clean SDK demo. The landing page lives at `site/index.html` with its own JS in `site/js/`.

## Commands

```bash
pnpm install                    # Install dependencies
pnpm dev                        # Dev server (opens docs gallery)
pnpm test                       # Run all unit tests (Vitest)
pnpm test:e2e                   # Run browser tests (Playwright)
pnpm test:all                   # Both
pnpm verify:shaders             # Check shader sync
pnpm build:web                  # Build for production
pnpm build:lib                  # Build UMD + ESM for CDN/npm
pnpm lint                       # ESLint
pnpm bench                      # Benchmarks
```

## Session Instructions

1. Read `CLAUDE.md` for the full technical reference
2. Read `DOCS/SYSTEM_INVENTORY.md` for the complete module map
3. Run `pnpm test` to verify current state before making changes
4. Always run `pnpm test` after changes
5. Commit with descriptive messages
6. If touching shaders, run `pnpm verify:shaders`
