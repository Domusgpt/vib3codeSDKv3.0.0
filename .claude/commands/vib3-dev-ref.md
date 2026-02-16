# VIB3+ Development & Expansion Skill

You are an expert VIB3+ SDK developer. You help extend, refactor, test, and build new features for the VIB3+ 4D visualization engine. You understand the full architecture from C++ WASM core through WebGL/WebGPU shaders to the JavaScript application layer, MCP protocol, and platform integrations.

---

## Gold Standard v3 & Codex Reference

When building creative features, examples, or extending the visualization pipeline, reference the Gold Standard:

- **Gold Standard v3**: `examples/dogfood/GOLD_STANDARD.md` — 3 parameter modes, EMA smoothing, composition vocabulary
- **Codex gallery**: `examples/codex/` — Annotated reference implementations
- **Synesthesia (golden reference)**: `examples/codex/synesthesia/` — All 3 modes, all 6 rotation axes, [WHY] annotations

Key patterns for SDK developers:
- EMA smoothing (`1 - Math.exp(-dt / tau)`) is the universal parameter transition primitive
- Hue is 0-360 in JS/API, 0-1 in shaders — convert at the boundary
- 4D rotation axes (XW/YW/ZW) need non-zero base velocity or the 4th dimension isn't visible
- Per-system personality: switching systems should change parameter ranges, not just shaders

---

## Architecture Overview

```
Application Layer (index.html, UI, Gallery)
    ↓
VIB3Engine (src/core/VIB3Engine.js) — unified coordinator
    ├→ QuantumEngine (src/quantum/)
    ├→ FacetedSystem (src/faceted/)
    └→ RealHolographicSystem (src/holograms/)
    ↓
ReactivityManager + SpatialInputSystem (src/reactivity/)
    ↓
UnifiedRenderBridge (src/render/)
    ├→ WebGLBackend (src/render/backends/WebGLBackend.js, 34KB)
    └→ WebGPUBackend (src/render/backends/WebGPUBackend.js, 43KB)
    ↓
ShaderProgram (GLSL/WGSL) + RenderCommand/CommandBuffer
    ↓
Scene4D → Node4D → MemoryPool (src/scene/)
    ↓
Math Layer (src/math/) — JS Rotor4D, Mat4x4, Vec4, Projection
    ↓
C++ WASM Core (cpp/) — Clifford algebra Cl(4,0)
```

---

## Development Areas

### 1. Geometry System (`src/geometry/`)

**Adding a new base geometry** (currently 8: tetrahedron, hypercube, sphere, torus, klein_bottle, fractal, wave, crystal):

Files to modify:
- `src/geometry/generators/` — Create `NewGeometry.js` following the pattern in existing generators
- `src/geometry/GeometryFactory.js` — Register the new generator
- `src/geometry/GeometryLibrary.js` — Add metadata entry
- `src/shaders/common/geometry24.glsl` — Add GLSL SDF/pattern for the new geometry index
- `src/shaders/common/geometry24.wgsl` — Add WGSL equivalent
- `src/quantum/QuantumVisualizer.js` — If the system has inline shader fragments, update them
- `src/faceted/FacetedSystem.js` — Same for faceted inline shaders
- `src/holograms/HolographicVisualizer.js` — Same for holographic inline shaders
- `cpp/geometry/` — Add C++ generator if WASM-accelerated variant needed

The geometry encoding formula `index = core_type * 8 + base_geometry` means adding a 9th base geometry would shift all hypersphere indices to 9-17 and hypertetra to 18-26. This is a **breaking change** — update all references to geometry indices.

**Adding a new core warp** (currently 3: base, hypersphere, hypertetrahedron):
- `src/geometry/warp/` — Create `NewWarpCore.js`
- Update the encoding formula to `core_type * 8 + base` with the new core_type value
- Update MCP tools input schema (`maximum: 31` if 4 cores × 8 bases)
- Update all geometry index references in shaders and tests

**Testing**: `tests/geometry/GeometryFactory.test.js`, `tests/geometry/generators.test.js`, `tests/geometry/warp.test.js`

### 2. Shader Development (`src/shaders/`)

**Shader file structure**:
```
src/shaders/
├── common/
│   ├── rotation4d.glsl/wgsl    — 6D rotation matrices
│   ├── geometry24.glsl/wgsl    — 24 geometry SDF/patterns
│   ├── uniforms.glsl/wgsl      — Standard uniform declarations
│   └── fullscreen.vert.glsl/wgsl — Fullscreen quad vertex shader
├── quantum/quantum.frag.glsl/wgsl
├── faceted/faceted.frag.glsl/wgsl
└── holographic/holographic.frag.glsl/wgsl
```

**Shader sync rule**: External shader files in `src/shaders/` must stay in sync with inline shaders embedded in visualizer JS files. Run `npm run verify:shaders` after any shader change. The verification tool is at `tools/shader-sync-verify.js` (937 lines).

**Standard uniforms all shaders receive**:
```glsl
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_geometry;       // 0-23
uniform float u_rot4dXY, u_rot4dXZ, u_rot4dYZ;  // 3D rotation
uniform float u_rot4dXW, u_rot4dYW, u_rot4dZW;  // 4D rotation
uniform float u_gridDensity, u_morphFactor, u_chaos;
uniform float u_speed, u_hue, u_intensity, u_saturation;
uniform float u_dimension;      // projection distance
uniform float u_mouseIntensity, u_clickIntensity;
uniform float u_bass, u_mid, u_high;  // audio bands
```

**6D rotation in GLSL** (rotation4d.glsl):
```glsl
mat4 rotate4D(float xy, float xz, float yz, float xw, float yw, float zw) {
    return rotateXY(xy) * rotateXZ(xz) * rotateYZ(yz) *
           rotateXW(xw) * rotateYW(yw) * rotateZW(zw);
}
```

**4D projection**:
```glsl
float projFactor = 1.0 / (u_dimension - position.w);
vec3 projected = position.xyz * projFactor;
```

**WebGPU WGSL differences**:
- Struct-based uniforms: `@group(0) @binding(0) var<uniform> uniforms: Uniforms;`
- Entry points: `@vertex fn main()` / `@fragment fn main()`
- Type syntax: `vec4<f32>`, `mat4x4<f32>`

### 3. Rendering Pipeline (`src/render/`)

**Key abstractions**:
- `UnifiedRenderBridge.js` — WebGL/WebGPU abstraction layer, tries WebGPU first, falls back to WebGL
- `ShaderProgram.js` — Compiles, caches, and manages shader programs
- `ShaderLoader.js` — Loads external .glsl/.wgsl files
- `RenderCommand.js` + `CommandBuffer.js` — GPU command abstraction
- `RenderState.js` — Tracks current GPU state to minimize state changes
- `RenderTarget.js` — Framebuffer/texture render targets
- `MultiCanvasBridge.js` — Coordinates the 5-layer canvas architecture

**Backend APIs**:
- `WebGLBackend.js` (34KB) — Full WebGL 2.0 renderer
- `WebGPUBackend.js` (43KB) — WebGPU renderer with compute shader support

**Testing**: `tests/render/` has 9 test files covering all render abstractions

### 4. C++ WASM Core (`cpp/`)

**Build**: `cd cpp && ./build.sh` (uses CMake + Emscripten)

**Architecture**:
```
cpp/
├── math/
│   ├── Rotor4D.hpp/cpp    — Clifford algebra Cl(4,0) sandwich product
│   ├── Mat4x4.hpp/cpp     — Column-major 4x4 matrices
│   ├── Vec4.hpp/cpp       — 4-component vectors
│   └── Projection.hpp/cpp — 4D→3D projections (perspective, stereographic, orthographic)
├── geometry/              — 8 C++ geometry generators + warp functions
├── vib3_ffi.cpp/h         — C Foreign Function Interface
├── bindings/embind.cpp    — Emscripten JavaScript bindings
├── tests/                 — 5 C++ unit test files
├── CMakeLists.txt
└── build.sh
```

**Key types**:
```cpp
struct Vib3Vec4 { float x, y, z, w; };
struct Vib3Rotor4D { float s, xy, xz, yz, xw, yw, zw, xyzw; };  // 8 components
struct Vib3Mat4x4 { float m[16]; };  // column-major
```

**Rotor rotation** (Clifford algebra sandwich product): `v' = R * v * R†`
```cpp
Vib3Vec4 vib3_rotor4d_rotate(Vib3Rotor4D r, Vib3Vec4 v);
Vib3Rotor4D vib3_rotor4d_from_euler6(float xy, xz, yz, xw, yw, zw);
```

**JS fallback**: All WASM functions have JS equivalents in `src/math/`. The engine gracefully falls back if WASM isn't available.

### 5. MCP Agent Tools (`src/agent/mcp/`)

**Current tools** (31): See `src/agent/mcp/tools.js` for full definitions.

**Adding a new MCP tool**:

1. Add tool definition to `src/agent/mcp/tools.js`:
```javascript
new_tool_name: {
    name: 'new_tool_name',
    description: 'What it does (be specific for LLM consumption)',
    inputSchema: {
        type: 'object',
        properties: { /* JSON Schema */ },
        required: ['required_fields']
    }
}
```

2. Add handler in `src/agent/mcp/MCPServer.js` inside `handleToolCall()`:
```javascript
case 'new_tool_name':
    result = await this.handleNewTool(args);
    break;
```

3. Implement the handler method on MCPServer class.

4. Update `agent-config/README.md` tool table and `agent-config/claude-agent-context.md`.

5. Add tests in `tests/agent/`.

**Telemetry**: All tool calls are instrumented via `src/agent/telemetry/`. Events flow through `TelemetryService` → `EventStream` → `TelemetryExporters`.

### 6. Creative Tooling (`src/creative/`)

| Module | Lines | Key API |
|--------|-------|---------|
| `ColorPresetsSystem.js` | 980 | `.applyPreset(name)`, `.getPresetNames()`, 22 presets |
| `TransitionAnimator.js` | 683 | `.transition(params, duration, easing)`, `.sequence(steps)` |
| `PostProcessingPipeline.js` | 1113 | `.addEffect(name, config)`, `.applyChain(presetName)`, 14 effects, 7 chains |
| `ParameterTimeline.js` | 1061 | `.addTrack(param)`, `.addKeyframe(track, time, value, easing)`, `.play()` |
| `ChoreographyPlayer.js` | 482 | `.load(spec)`, `.play()`, `.pause()`, `.stop()`, `.seek(ms)`, `.seekToPercent(pct)` |
| `AestheticMapper.js` | 629 | `.mapDescription(text)`, `.resolveToValues(text)`, `.getVocabulary()`, `.getVocabularyByCategory()` |

**Testing**: `tests/creative/` has 6 test files covering all creative modules.

### 7. Platform Integrations (`src/integrations/`)

| Module | Pattern |
|--------|---------|
| `Vib3React.js` | `<Vib3Canvas>` component + `useVib3()` hook |
| `Vib3Vue.js` | Vue 3 component + composable |
| `Vib3Svelte.js` | Svelte component + store |
| `FigmaPlugin.js` | Manifest + sandboxed code + UI |
| `ThreeJsPackage.js` | `THREE.ShaderMaterial` with 4D rotation uniforms |
| `TouchDesignerExport.js` | GLSL TOP export |
| `OBSMode.js` | Transparent BG + browser source mode |

**Testing**: `tests/integrations/` has 3 test files.

### 8. Advanced Features (`src/advanced/`)

| Module | Lines | Key Feature |
|--------|-------|-------------|
| `WebXRRenderer.js` | 680 | VR/AR with 6DOF spatial extraction |
| `WebGPUCompute.js` | 1051 | WGSL particle simulation + audio FFT compute shaders |
| `MIDIController.js` | 703 | Web MIDI API with learn mode and CC mapping |
| `AIPresetGenerator.js` | 777 | Text-to-preset via LLM + mutation/crossbreeding |
| `OffscreenWorker.js` | 1051 | OffscreenCanvas rendering + SharedArrayBuffer |

### 9. Export System (`src/export/`)

| Module | Purpose |
|--------|---------|
| `ExportManager.js` | Coordinates all export types |
| `VIB3PackageExporter.js` | Self-contained portable package |
| `TradingCardGenerator.js` (135KB) | Visual trading card generation |
| `ShaderExporter.js` (33KB) | GLSL/WGSL shader export |
| `SVGExporter.js` (15KB) | SVG vector export |
| `LottieExporter.js` | Lottie animation export |
| `CSSExporter.js` | CSS animation export |

### 10. Reactivity (`src/reactivity/`)

| Module | Purpose |
|--------|---------|
| `SpatialInputSystem.js` (61KB) | 8 input sources, 6 profiles, universal spatial mapping |
| `ReactivityManager.js` | Audio/tilt/interaction coordination |
| `ReactivityConfig.js` | Reactivity configuration schema |

**Input sources**: deviceTilt, mousePosition, gyroscope, gamepad, perspective, programmatic, audio, midi

**Profiles**: cardTilt, wearablePerspective, gameAsset, vjAudioSpatial, uiElement, immersiveXR

---

## Testing Infrastructure

**Unit tests** (Vitest + happy-dom): `npm test`
- Config: `vitest.config.js`
- Test files: `tests/` (41+ test files organized by module)
- Coverage: `@vitest/coverage-v8`

**E2E tests** (Playwright): `npm run test:e2e`
- Config: `playwright.config.js`
- 3 browsers: Chromium, Firefox, WebKit
- GPU support with SwiftShader fallback
- Video/trace/screenshot on failure
- Custom test server on port 3457

**Shader verification**: `npm run verify:shaders`
- Tool: `tools/shader-sync-verify.js` (937 lines)
- Verifies inline shaders match external .glsl/.wgsl files
- Parses GLSL uniforms and WGSL struct fields
- Color-coded console reports

**Writing new tests**:
- Unit: Create `tests/<module>/NewFeature.test.js` following existing patterns
- E2E: Add to `tests/e2e/` or create new spec files
- Use `happy-dom` for DOM mocking in unit tests
- Mock WebGL context with the patterns in `tests/render/WebGLBackend.test.js`

---

## Build & Tooling

**Package**: `@vib3code/sdk` v2.0.3 (ES Module, MIT License)

**Vite config** (`vite.config.js`):
- Dual mode: library (UMD/ESM) + web (pages/demo/gallery)
- Shader files treated as assets
- Multiple entry points

**70+ named exports** in package.json covering every module.

**NPM scripts**:
```
npm run dev          # Vite dev server
npm run build:web    # Build web app
npm run build:lib    # Build library (UMD/ESM)
npm test             # Unit tests (Vitest)
npm run test:e2e     # E2E tests (Playwright)
npm run verify:shaders  # Shader sync check
npm run lint         # ESLint
npm run bench        # Benchmarks
npm run storybook    # Component browser
```

---

## Development Patterns

### Adding a New Visualization System

1. Create system directory: `src/newsystem/`
2. Implement `NewSystem.js` following the renderer contract in `src/core/RendererContracts.js`
3. Create renderer adapter in `src/core/renderers/NewSystemRendererAdapter.js`
4. Register in `VIB3Engine.js` `switchSystem()` method
5. Add GLSL + WGSL shaders in `src/shaders/newsystem/`
6. Add keyboard shortcut (key 4)
7. Update MCP `switch_system` enum in `src/agent/mcp/tools.js`
8. Add tests in `tests/newsystem/`
9. Update `CLAUDE.md` documentation

### Adding a New MCP Resource

Resources are read-only data endpoints:
```javascript
// In MCPServer.js
resources: [
    { uri: 'vib3://new/resource', description: 'What it provides' }
]
```

### Extending the Scene Graph

`src/scene/` provides 4D-aware scene management:
- `Scene4D.js` — Root container
- `Node4D.js` — Spatial nodes with 4D transforms
- `ResourceManager.js` — Lifecycle management
- `MemoryPool.js` — Object pooling
- `Disposable.js` — Cleanup contract

### Module Conventions

- ES Modules throughout (`import`/`export`)
- JSDoc annotations for all public APIs
- Constructor options pattern: `new Module(options = {})`
- Callback pattern for parameter updates: `(paramName, value) => void`
- All modules are stateless-safe (no hidden global state beyond `window.Vib3Core` for WASM)

---

## Key Reference Files

| Purpose | File |
|---------|------|
| Full technical reference | `CLAUDE.md` |
| Release status | `DOCS/STATUS.md` |
| Repository structure | `DOCS/REPO_MANIFEST.md` |
| Master roadmap | `DOCS/MASTER_PLAN_2026-01-31.md` |
| Choreography patterns | `DOCS/MULTIVIZ_CHOREOGRAPHY_PATTERNS.md` |
| Control reference | `DOCS/CONTROL_REFERENCE.md` |
| CI/testing guide | `DOCS/CI_TESTING.md` |
| GPU disposal | `DOCS/GPU_DISPOSAL_GUIDE.md` |
| Renderer lifecycle | `DOCS/RENDERER_LIFECYCLE.md` |
| WebGPU status | `DOCS/WEBGPU_STATUS.md` |
| Environment setup | `DOCS/ENV_SETUP.md` |

---

## Roadmap Items (From MASTER_PLAN)

**HIGH priority unfinished work**:
- `vib3 init` CLI scaffolding command
- TypeScript types for v2.0.0 modules (many missing)
- npm publish automation
- Framework example apps (React, Vue, Svelte, Three.js, TouchDesigner)
- Hosted preset gallery with permalinks

**MEDIUM priority**:
- CDN/UMD distribution for `<script>` tag usage
- WebGPU as primary renderer (currently secondary)
- Performance benchmarks WebGL vs WebGPU
- Storybook stories for all components

**When expanding the system**, always:
1. Follow existing patterns in the nearest similar module
2. Add both GLSL and WGSL shader variants
3. Run `npm run verify:shaders` after shader changes
4. Write unit tests in `tests/<module>/`
5. Update MCP tool schemas if the change affects agent-accessible parameters
6. Update `CLAUDE.md` if architecture changes
