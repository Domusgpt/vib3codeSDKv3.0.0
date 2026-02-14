# VIB3+ Development Reference

## Primary architecture docs
- `CLAUDE.md`
- `DOCS/SYSTEM_INVENTORY.md`
- `DOCS/RENDERER_LIFECYCLE.md`
- `DOCS/GPU_DISPOSAL_GUIDE.md`
- `DOCS/CI_TESTING.md`
- `DOCS/WEBGPU_STATUS.md`

## High-value source modules
- `src/core/VIB3Engine.js`
- `src/core/CanvasManager.js`
- `src/core/Parameters.js`
- `src/quantum/QuantumEngine.js`
- `src/faceted/FacetedSystem.js`
- `src/holograms/RealHolographicSystem.js`
- `src/agent/mcp/tools.js`

## Test focus map
- `tests/core/` for contracts and error/lifecycle behavior
- `tests/render/` for command/backend/render state correctness
- `tests/agent/` for telemetry, CLI, stream behavior
- `tests/e2e/` for browser-level integration and exports

## Invariants to preserve
- Rotation application order: XY → XZ → YZ → XW → YW → ZW
- Optional fallback behavior (WASM and WebGPU)
- Consistent version surfaces where exposed publicly
