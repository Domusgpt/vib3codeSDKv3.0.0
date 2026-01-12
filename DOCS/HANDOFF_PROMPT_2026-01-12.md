# Handoff Prompt (2026-01-12)

Use this prompt to onboard the next agent quickly, with explicit context, priorities, and validation steps.

---

## Role & Goals
You are taking over the VIB3+ engine refactor. The mission is to converge legacy visualization systems onto the unified Scene4D/Node4D graph, wire the WASM/C++ math core, and harden the agentic CLI/telemetry pipeline. Prioritize correctness, deterministic outputs, and clear documentation that agents can follow.

## Current Architecture Snapshot
- **Runtime core**: `src/core/UnifiedEngine.js` orchestrates systems and now owns a shared `Scene4D` graph.
- **Scene graph**: `src/scene/*` (Scene4D, Node4D, ResourceManager, etc.) is the canonical graph.
- **Legacy adapter**: `src/core/SceneGraph.js` now wraps `Scene4D`/`Node4D` for compatibility.
- **Math**: `src/math/*` (Rotor4D, Mat4x4, Projection, Vec4) is authoritative JS math.
- **Agentic layer**: `src/agent/*` (MCP, telemetry, CLI) with schema validation under `src/schemas/*`.
- **Exports**: `tools/telemetry/manifestPipeline.js` + `tools/export/formats.js` provide deterministic manifest/export flows.
- **Cross-platform**: WASM loader in `src/wasm/*`; Flutter bindings under `flutter/`.

## What Was Just Completed
- Unified engine ticks the shared Scene4D graph each frame using delta time.
- SceneGraph now delegates to Scene4D/Node4D for traversal and node lookup.
- Environment tools verified (Node, pnpm, Playwright, CMake). Emscripten is missing.

## Highest Priority Next Steps
1. **Phase 2 Convergence**
   - Move system renderers to consume `Scene4D` nodes (avoid per-system ad-hoc scene state).
   - Update `EnhancedPolychoraSystem` to attach nodes to the shared scene graph.

2. **WASM/C++ Integration**
   - Install Emscripten (`emcc`) and wire `src/wasm/WasmLoader.js` as the primary math backend.
   - Provide a deterministic fallback to JS math when WASM is unavailable.

3. **Agentic CLI / Telemetry**
   - Ensure CLI commands mutate the real engine state and emit telemetry spans.
   - Verify schema validation for CLI inputs/outputs using `src/schemas/index.js`.

4. **Testing & Goldens**
   - Run `pnpm test` (Vitest). Update snapshot goldens only with explicit flags.
   - Add a minimal integration test for Scene4D tick behavior in the unified loop.

## Required Tooling Checks (per session)
- `node -v`
- `pnpm -v`
- `npx --yes playwright --version`
- `cmake --version`
- `emcc --version` (install Emscripten if missing)

## Demo & Screenshots
If you change any visual output or shader logic, capture a screenshot:
1. `python -m http.server 8000`
2. Playwright -> `demo/index.html`
3. Store under `artifacts/` with a date-stamped name

## Session Log Protocol
Append to `DOCS/SESSION_LOG_2026-01-07.md` with:
- UTC timestamp
- Summary bullets
- Code change list with file + line ranges + reason

## Quality Bar
- Keep APIs deterministic and audit-friendly.
- Prefer composable, minimal interfaces (Scene4D + renderer contracts) over ad-hoc state.
- Document all behavior changes in `DOCS/` with date-stamped files.
