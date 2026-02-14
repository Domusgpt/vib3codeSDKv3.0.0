---
name: vib3-dev
description: VIB3+ SDK development and expansion. Use when extending the engine, adding geometries, developing shaders, creating MCP tools, writing tests, or modifying the rendering pipeline.
---

# VIB3+ Development & Expansion

You are an expert VIB3+ SDK developer. Help extend, refactor, test, and build new features for the VIB3+ 4D visualization engine.

## Development Workflow

Follow these steps for every development task:

### Step 1: Read Relevant Documentation

Before writing any code, read the relevant docs:
- `CLAUDE.md` — Full technical reference (architecture, shader system, C++ core, uniforms)
- Module-specific docs in `DOCS/` (see Documentation References below)
- Existing source code in the target module directory

### Step 2: Analyze Existing Patterns

Find the nearest similar module and study its patterns:
- Constructor options pattern: `new Module(options = {})`
- Callback pattern for updates: `(paramName, value) => void`
- ES Modules throughout (`import`/`export`)
- JSDoc annotations on all public APIs
- No hidden globals beyond `window.Vib3Core`

### Step 3: Plan Implementation

Identify ALL files that need modification. VIB3+ is highly interconnected:
- Shader changes require GLSL + WGSL variants + inline shader sync
- New parameters require MCP tool schema updates + agent-config updates
- New systems require engine registration + keyboard shortcut + MCP enum update

### Step 4: Implement

Follow module conventions. Key patterns:
- ES Modules, JSDoc, constructor options
- Stateless-safe modules (no hidden globals)
- Standard uniform names (u_time, u_resolution, u_geometry, u_rot4d*, etc.)

### Step 5: Shader Sync (if applicable)

If you modified any shaders:
- Add both GLSL and WGSL variants
- Ensure inline shaders in visualizer JS files match external shader files
- Run shader verification: `npm run verify:shaders`
- **Critical**: 6D rotation order is always XY → XZ → YZ → XW → YW → ZW

### Step 6: Write Tests

- Unit tests in `tests/<module>/` (Vitest + happy-dom)
- E2E tests in `tests/e2e/` if user-visible behavior changes (Playwright)
- Run full suite: `npm test`

### Step 7: Update MCP Tool Schemas (if applicable)

If agent-accessible parameters changed:
- Update tool definitions in `src/agent/mcp/tools.js`
- Update handlers in `src/agent/mcp/MCPServer.js`
- Update agent context packs in `agent-config/`

### Step 8: Update Documentation (if applicable)

- Update `CLAUDE.md` if architecture changed
- Update relevant `DOCS/*.md` files
- Update `DOCS/STATUS.md` if release status affected

---

## Architecture Overview

```
Application Layer (index.html, js/core/app.js)
    ↓
VIB3Engine (src/core/VIB3Engine.js) — unified coordinator
    ├→ QuantumEngine (src/quantum/QuantumEngine.js)
    ├→ FacetedSystem (src/faceted/FacetedSystem.js)
    └→ RealHolographicSystem (src/holograms/RealHolographicSystem.js)
    ↓
ReactivityManager + SpatialInputSystem (src/reactivity/)
    ↓
Render Pipeline (src/render/)
    ├→ WebGLBackend (src/render/backends/WebGLBackend.js)
    └→ WebGPUBackend (src/render/backends/WebGPUBackend.js)
    ↓
ShaderProgram (GLSL/WGSL)
    ↓
Math Layer (src/math/) — JS Rotor4D, Mat4x4, Vec4
    ↓
C++ WASM Core (cpp/) — Clifford algebra Cl(4,0)
```

For full architecture details including shader system, uniform definitions, projection math, and C++ types, read `CLAUDE.md`.

---

## Development Checklists

### New Geometry

- [ ] Create generator in `src/geometry/generators/`
- [ ] Register in `src/geometry/GeometryFactory.js`
- [ ] Add metadata in `src/geometry/GeometryLibrary.js`
- [ ] Add GLSL pattern in `src/shaders/common/geometry24.glsl`
- [ ] Add WGSL equivalent in `src/shaders/common/geometry24.wgsl`
- [ ] Update inline shaders in QuantumVisualizer.js, FacetedSystem.js, HolographicVisualizer.js
- [ ] Add C++ generator in `cpp/` if WASM-accelerated variant needed
- [ ] Update tests in `tests/geometry/`
- [ ] Run `npm run verify:shaders`

**Warning**: Adding a 9th base geometry shifts all hypersphere (9-17) and hypertetra (18-26) indices. This is a breaking change — update ALL index references.

### New Shader

- [ ] Create both `.glsl` and `.wgsl` variants
- [ ] Use standard uniform names (u_time, u_resolution, u_geometry, u_rot4d*, etc.)
- [ ] Implement 6D rotation: `rotateXY(xy) * rotateXZ(xz) * rotateYZ(yz) * rotateXW(xw) * rotateYW(yw) * rotateZW(zw)`
- [ ] Implement 4D→3D projection (perspective, stereographic, or orthographic)
- [ ] Sync inline shaders with external files
- [ ] Run `npm run verify:shaders`

### New MCP Tool

- [ ] Add tool definition in `src/agent/mcp/tools.js` (name, description, inputSchema)
- [ ] Add case in `MCPServer.handleToolCall()` in `src/agent/mcp/MCPServer.js`
- [ ] Implement handler method on MCPServer class
- [ ] Update agent context in `agent-config/claude-agent-context.md`
- [ ] Update agent context in `agent-config/openai-agent-context.md`
- [ ] Add tests in `tests/agent/`

### New Visualization System

1. Create `src/newsystem/` directory
2. Implement renderer following `src/core/RendererContracts.js`
3. Create renderer adapter in `src/core/renderers/`
4. Register in `VIB3Engine.js` `switchSystem()` method
5. Add GLSL + WGSL shaders in `src/shaders/newsystem/`
6. Add keyboard shortcut (next available number key)
7. Update MCP `switch_system` tool enum in `src/agent/mcp/tools.js`
8. Add unit tests in `tests/newsystem/`
9. Update `CLAUDE.md` architecture docs

### New Platform Integration

- [ ] Follow component pattern (see `src/integrations/frameworks/Vib3React.js` as reference)
- [ ] Implement lifecycle management (init, update, destroy)
- [ ] Map VIB3+ parameters to integration-specific props/attributes
- [ ] Handle cleanup and GPU resource disposal (see `DOCS/GPU_DISPOSAL_GUIDE.md`)

---

## Testing Commands

```bash
npm test              # Unit tests (Vitest + happy-dom)
npm run test:e2e      # E2E browser tests (Playwright)
npm run verify:shaders # Shader sync verification (GLSL/WGSL inline vs external)
npm run lint          # ESLint
npm run bench         # Performance benchmarks
npm run dev           # Vite dev server for manual testing
```

---

## Key Technical Rules

1. **6D rotation order matters**: Always XY → XZ → YZ → XW → YW → ZW
2. **WASM is optional**: All C++ functions have JS fallbacks in `src/math/`
3. **WebGPU is optional**: Falls back to WebGL if unavailable
4. **3 active systems only**: Quantum, Faceted, Holographic (Polychora is TBD placeholder)
5. **Shader sync is enforced**: Pre-commit hook runs `npm run verify:shaders` on `.glsl`/`.wgsl` changes
6. **Column-major matrices**: C++ Mat4x4 uses `float m[16]` in column-major order
7. **Rotor normalization**: Rotors must be normalized after composition to avoid drift

---

## Documentation References

For complete details beyond this skill, read these files:

| Document | What It Contains |
|----------|-----------------|
| `CLAUDE.md` | Full technical reference — architecture, shader system, C++ core, WebGPU backend, all module APIs, parameter ranges |
| `DOCS/CI_TESTING.md` | Testing infrastructure, CI configuration, test patterns |
| `DOCS/GPU_DISPOSAL_GUIDE.md` | GPU resource cleanup patterns, memory management |
| `DOCS/RENDERER_LIFECYCLE.md` | Rendering pipeline lifecycle, frame loop, state management |
| `DOCS/WEBGPU_STATUS.md` | WebGPU implementation status, feature support matrix |
| `DOCS/REPO_MANIFEST.md` | Complete project structure with file descriptions |
| `DOCS/STATUS.md` | Current release status and active features |
| `DOCS/MASTER_PLAN_2026-01-31.md` | Roadmap priorities (HIGH/MEDIUM/LOW) |
| `DOCS/ENV_SETUP.md` | Development environment setup guide |
| `DOCS/AGENT_HARNESS_ARCHITECTURE.md` | Agent harness design, MCP tool catalog, feedback loop |
| `src/agent/mcp/tools.js` | All 31 MCP tool definitions with JSON schemas |
| `tools/shader-sync-verify.js` | 937-line shader sync verification tool source |
