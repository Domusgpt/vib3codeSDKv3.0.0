# VIB3+ Engine — Project Overview (2026-01-12)

## Executive Summary
VIB3+ is a 4D visualization engine evolving into an agentic-native SDK. It unifies a WebGL rendering core, a canonical 4D scene graph, and an automation/telemetry toolchain that supports deterministic exports, cross-platform bindings, and AI-friendly CLI workflows. The refactor roadmap targets a single-source-of-truth math layer (JS + WASM), shared scene/renderer contracts, and an observable export pipeline.

## Core Architecture
### Runtime Layers
1. **Unified Engine Layer** (`src/core/UnifiedEngine.js`)
   - Orchestrates rendering systems under a single WebGL context.
   - Owns the canonical `Scene4D` graph and provides node helpers.

2. **Scene Graph** (`src/scene/*`)
   - `Scene4D` manages root nodes, traversal, updates, and queries.
   - `Node4D` provides transforms, hierarchy, and traversal helpers.
   - `ResourceManager` tracks lifetime and disposal.

3. **Math & Geometry**
   - **Math**: `src/math/*` for rotors, matrices, vectors, projections.
   - **Geometry**: `src/geometry/*` for generators and warp kernels.

4. **Rendering Systems**
   - Systems share a unified context via `UnifiedCanvasManager` and `UnifiedResourceManager`.
   - Polychora and visualization systems are migrating to Scene4D alignment.

5. **Agentic Layer** (`src/agent/*`)
   - MCP tools, telemetry, and CLI with schema validation.
   - Structured responses and error schemas for agent reliability.

6. **Cross-Platform**
   - WASM loader (`src/wasm/*`) for C++ math core.
   - Flutter bindings under `flutter/` for mobile integrations.

## Key Subsystems (Where to Look)
- **Unified engine**: `src/core/UnifiedEngine.js`
- **Scene graph**: `src/scene/Scene4D.js`, `src/scene/Node4D.js`
- **Math**: `src/math/Rotor4D.js`, `Mat4x4.js`, `Projection.js`, `Vec4.js`
- **Schemas**: `src/schemas/*.schema.json`, `src/schemas/index.js`
- **CLI**: `src/cli/index.js`, `tools/cli/agent-cli.js`
- **Telemetry**: `src/agent/telemetry/*`, `tools/telemetry/*`
- **Exports**: `tools/telemetry/manifestPipeline.js`, `tools/export/formats.js`

## Tooling & Environment
### Required Tools
- **Node** 18+ (verified: 20.19.5)
- **pnpm** 9+ (verified: 9.4.0)
- **Playwright** (via `npx --yes playwright --version`)
- **CMake** (verified: 3.28.3)
- **Emscripten** (`emcc`) for WASM builds (missing in this environment)

### Recommended Commands
```bash
pnpm install
pnpm test
node tools/cli/agent-cli.js --help
```

## Build & Run
### Demo (Web)
```bash
python -m http.server 8000
# then open http://127.0.0.1:8000/demo/index.html
```
Use Playwright to capture screenshots after visual changes.

### WASM (C++ Core)
- C++ source under `cpp/` with CMake build definitions.
- WASM loader in `src/wasm/WasmLoader.js`.
- Install Emscripten before attempting builds (`emcc --version`).

## Agentic CLI & Telemetry
- The CLI provides JSON output for automation.
- Telemetry spans are emitted around key operations.
- Schemas ensure agent-safe inputs/outputs (`src/schemas/index.js`).

## Deterministic Exports
- Manifests and exports use deterministic hashing for cacheability.
- Preview generation paths live in `js/core/telemetry-director.js` and `tools/telemetry/`.

## Documentation Index
- `DOCS/CLI_ONBOARDING.md` — CLI onboarding and knowledge checks.
- `DOCS/TELEMETRY_EXPORTS.md` — manifest fields + preview generation.
- `DOCS/EXPORT_FORMATS.md` — export formats and golden snapshots.
- `DOCS/GPU_DISPOSAL_GUIDE.md` — disposal lifecycle guidance.
- `DOCS/STRATEGIC_BLUEPRINT_2026-01-07.md` — long-term roadmap.

## Known Gaps / Risks
- **Emscripten not installed**: WASM builds are blocked until `emcc` is available.
- **Scene graph migration incomplete**: Systems still contain legacy state handling.
- **Test coverage**: Some unit suites are present but not consistently run each session.

## Refactor Priorities (Short-Term)
1. Complete Phase 2 convergence: route systems through Scene4D.
2. Wire WASM core with JS fallback and add smoke tests.
3. Bind CLI commands to real engine mutations and telemetry spans.
4. Add CI-friendly test runners and deterministic snapshot gates.

## Contribution Standards
- Add session log entries with timestamp + line-referenced change notes.
- Prefer small, traceable changes with deterministic outputs.
- Capture screenshots when visual output changes.
