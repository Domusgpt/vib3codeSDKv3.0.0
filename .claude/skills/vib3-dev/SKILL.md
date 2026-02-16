---
name: vib3-dev
description: VIB3+ SDK development and expansion. Use when extending the engine, adding new geometries, developing shaders (GLSL/WGSL), creating MCP tools, writing tests, modifying the rendering pipeline, adding platform integrations, or working with the C++ WASM core.
---

# VIB3+ SDK Development

Help extend, refactor, test, and build new features for the VIB3+ 4D visualization engine.

## Gold Standard v3 & Codex Reference

When building creative features or examples, follow the Gold Standard v3 creative vocabulary:

- **Gold Standard v3**: `examples/dogfood/GOLD_STANDARD.md` — Defines 3 parameter modes (Continuous Mapping, Event Choreography, Ambient Drift), EMA smoothing as universal primitive, per-system personality, composition principles
- **Codex**: `examples/codex/` — Collection of annotated reference implementations showing different creative approaches
- **Synesthesia (golden reference)**: `examples/codex/synesthesia/` — Audio-reactive ambient with all 3 modes, all 6 rotation axes active, [WHY] annotations throughout

Key technical patterns from Gold Standard:
- EMA smoothing: `alpha = 1 - Math.exp(-dt / tau)` — never use setTimeout for visual parameter changes
- Hue convention: JS/API uses 0-360, shaders use 0-1. Convert at boundary: `u_hue = hue / 360.0`
- 4D rotation must have non-zero base velocity on XW/YW/ZW axes or the 4th dimension won't be visible
- Per-system personality: switching systems should change parameter ranges, not just shaders

---

## Development Workflow

### 1. Read Before Writing

- `CLAUDE.md` — Architecture, shader system, C++ core, uniforms, projections
- Module-specific docs in `DOCS/` (see References below)
- Existing source in the target module directory

### 2. Analyze Existing Patterns

- Constructor: `new Module(options = {})`
- Callbacks: `(paramName, value) => void`
- ES Modules throughout, JSDoc on public APIs
- No hidden globals beyond `window.Vib3Core`

### 3. Plan Changes

VIB3+ is highly interconnected — identify ALL affected files:
- Shader changes → GLSL + WGSL variants + inline shader sync
- New parameters → MCP tool schema + agent-config updates
- New systems → engine registration + keyboard shortcut + MCP enum

### 4. Implement → Test → Verify Shaders → Update Docs

---

## Architecture

```
index.html / js/core/app.js
    ↓
VIB3Engine (src/core/VIB3Engine.js)
    ├→ QuantumEngine (src/quantum/)
    ├→ FacetedSystem (src/faceted/)
    └→ RealHolographicSystem (src/holograms/)
    ↓
ReactivityManager + SpatialInputSystem (src/reactivity/)
    ↓
WebGLBackend / WebGPUBackend (src/render/backends/)
    ↓
ShaderProgram (GLSL/WGSL) → Math Layer (src/math/)
    ↓
C++ WASM Core (cpp/) — Clifford algebra Cl(4,0)
    ├→ cpp/math/       Rotor4D, Mat4x4, Vec4, Projection
    ├→ cpp/geometry/   8 generators + WarpFunctions
    ├→ cpp/bindings/   embind.cpp
    ├→ cpp/include/    vib3_ffi.h
    ├→ cpp/src/        vib3_ffi.cpp
    └→ cpp/tests/      Rotor4D_test, Mat4x4_test, etc.
```

Full details in `CLAUDE.md`.

---

## Checklists

### New Geometry

- [ ] Generator in `src/geometry/generators/`
- [ ] Register in `src/geometry/GeometryFactory.js`
- [ ] Metadata in `src/geometry/GeometryLibrary.js`
- [ ] GLSL in `src/shaders/common/geometry24.glsl`
- [ ] WGSL in `src/shaders/common/geometry24.wgsl`
- [ ] Update inline shaders in QuantumVisualizer.js, FacetedSystem.js, HolographicVisualizer.js
- [ ] C++ generator in `cpp/geometry/` if WASM-accelerated
- [ ] Tests in `tests/geometry/`
- [ ] `npm run verify:shaders`

**Warning**: A 9th base geometry shifts all hypersphere (9-17) and hypertetra (18-26) indices — breaking change.

### New Shader

- [ ] Both `.glsl` and `.wgsl` variants
- [ ] Standard uniforms (u_time, u_resolution, u_geometry, u_rot4d*, etc.)
- [ ] 6D rotation: `rotateXY * rotateXZ * rotateYZ * rotateXW * rotateYW * rotateZW`
- [ ] 4D→3D projection (perspective/stereographic/orthographic)
- [ ] Sync inline shaders with external files
- [ ] `npm run verify:shaders`

### New MCP Tool

- [ ] Definition in `src/agent/mcp/tools.js` (name, description, inputSchema)
- [ ] Handler in `src/agent/mcp/MCPServer.js` `handleToolCall()`
- [ ] Update `agent-config/claude-agent-context.md`
- [ ] Update `agent-config/openai-agent-context.md`
- [ ] Tests in `tests/agent/`

### New Visualization System

1. Create `src/newsystem/` directory
2. Renderer following `src/core/RendererContracts.js`
3. Adapter in `src/core/renderers/`
4. Register in `VIB3Engine.js` `switchSystem()`
5. GLSL + WGSL shaders in `src/shaders/newsystem/`
6. Keyboard shortcut (next number key)
7. MCP `switch_system` enum in tools.js
8. Tests + CLAUDE.md update

### New Platform Integration

- [ ] Follow `src/integrations/frameworks/Vib3React.js` pattern
- [ ] Lifecycle: init, update, destroy
- [ ] Map VIB3+ params to integration props
- [ ] GPU resource disposal (see `DOCS/GPU_DISPOSAL_GUIDE.md`)

---

## Commands

```bash
npm test              # Unit tests (Vitest + happy-dom)
npm run test:e2e      # E2E browser tests (Playwright)
npm run verify:shaders # Shader sync (GLSL/WGSL inline vs external)
npm run lint          # ESLint
npm run bench         # Performance benchmarks
npm run dev           # Vite dev server
cd cpp && ./build.sh  # Build WASM core
```

---

## Key Rules

1. **6D rotation order**: Always XY → XZ → YZ → XW → YW → ZW
2. **WASM optional**: JS fallbacks in `src/math/`
3. **WebGPU optional**: Falls back to WebGL
4. **3 active systems**: Quantum, Faceted, Holographic (Polychora is TBD)
5. **Shader sync enforced**: Pre-commit hook on `.glsl`/`.wgsl` changes
6. **Column-major**: C++ Mat4x4 = `float m[16]` column-major
7. **Rotor normalization**: Normalize after composition to prevent drift

---

## References

- `CLAUDE.md` — Full technical reference (architecture, C++ types, shader uniforms, projections)
- `DOCS/STATUS.md` — Current release status
- `DOCS/CI_TESTING.md` — Test infrastructure, CI config
- `DOCS/GPU_DISPOSAL_GUIDE.md` — GPU cleanup patterns
- `DOCS/RENDERER_LIFECYCLE.md` — Render pipeline lifecycle
- `DOCS/WEBGPU_STATUS.md` — WebGPU feature support matrix
- `DOCS/REPO_MANIFEST.md` — Complete project structure
- `DOCS/ENV_SETUP.md` — Dev environment setup
- `DOCS/AGENT_HARNESS_ARCHITECTURE.md` — MCP tool catalog, feedback loop
- `DOCS/MASTER_PLAN_2026-01-31.md` — Roadmap priorities
- `src/agent/mcp/tools.js` — MCP tool definitions with JSON schemas
- `tools/shader-sync-verify.js` — Shader sync verification tool
