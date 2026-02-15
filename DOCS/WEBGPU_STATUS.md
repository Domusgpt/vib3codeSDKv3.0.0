# WebGPU Backend Status

**Last updated**: 2026-02-15

> Previous version archived at `DOCS/archive/WEBGPU_STATUS_2026-02-15_STALE.md`.

## Current State: Functional but Not Validated End-to-End

The WebGPU backend is **architecturally complete** — real device init, shader compilation, pipeline creation, uniform buffers, render passes. It is not a stub. However, no end-to-end browser validation has confirmed correct pixel output through the WebGPU path.

## What Is Implemented

| Component | Status | File |
|-----------|--------|------|
| Device/adapter/context init | Done | `src/render/backends/WebGPUBackend.js` (1410 lines) |
| Canvas configuration + resize | Done | WebGPUBackend.js |
| WGSL shader module compilation | Done | WebGPUBackend.js `compileShader()` |
| Fullscreen quad pipeline | Done | WebGPUBackend.js `createFullscreenPipeline()` |
| Custom geometry pipeline | Done | WebGPUBackend.js `createPipeline()` |
| Uniform buffer management | Done | WebGPUBackend.js `createCustomUniformBuffer()` / `updateCustomUniforms()` |
| Fullscreen quad rendering | Done | WebGPUBackend.js `renderFullscreenQuad()` |
| Geometry rendering | Done | WebGPUBackend.js `renderGeometry()` / `renderWithPipeline()` |
| Manual render pass control | Done | WebGPUBackend.js `beginRenderPass()` / `endRenderPass()` |
| Vertex/index buffer creation | Done | WebGPUBackend.js |
| Texture + sampler creation | Done | WebGPUBackend.js |
| Resource cleanup | Done | WebGPUBackend.js `dispose()` |
| WebGL/WebGPU bridge abstraction | Done | `src/render/UnifiedRenderBridge.js` |
| Uniform packing (JS → GPU) | Done | `packVIB3Uniforms()` in UnifiedRenderBridge.js |
| FacetedSystem WebGPU path | Done | `src/faceted/FacetedSystem.js` `initWithBridge()` |

## WGSL Shader Files

All seven WGSL files are real, substantive shaders (not stubs):

| File | Lines | Content |
|------|-------|---------|
| `src/shaders/common/fullscreen.vert.wgsl` | 18 | Fullscreen triangle vertex shader |
| `src/shaders/common/uniforms.wgsl` | 49 | Canonical VIB3Uniforms struct definition |
| `src/shaders/common/rotation4d.wgsl` | 87 | All six 4D rotation matrices + projection |
| `src/shaders/common/geometry24.wgsl` | 55 | All 24 geometry SDFs |
| `src/shaders/faceted/faceted.frag.wgsl` | 206 | Complete faceted fragment shader |
| `src/shaders/quantum/quantum.frag.wgsl` | 362 | Complete quantum fragment shader |
| `src/shaders/holographic/holographic.frag.wgsl` | 255 | Complete holographic fragment shader |

## Canonical Uniform Struct Layout

All WGSL uniform structs **must** match `packVIB3Uniforms()` in `UnifiedRenderBridge.js`. The canonical layout uses only `f32` scalars and one `vec2<f32>` to avoid WGSL alignment surprises:

```wgsl
struct VIB3Uniforms {
    time: f32,              // index 0
    _pad0: f32,             // index 1
    resolution: vec2<f32>,  // index 2-3
    geometry: f32,          // index 4
    rot4dXY: f32,           // index 5
    rot4dXZ: f32,           // index 6
    rot4dYZ: f32,           // index 7
    rot4dXW: f32,           // index 8
    rot4dYW: f32,           // index 9
    rot4dZW: f32,           // index 10
    dimension: f32,         // index 11
    gridDensity: f32,       // index 12
    morphFactor: f32,       // index 13
    chaos: f32,             // index 14
    speed: f32,             // index 15
    hue: f32,               // index 16
    intensity: f32,         // index 17
    saturation: f32,        // index 18
    mouseIntensity: f32,    // index 19
    clickIntensity: f32,    // index 20
    bass: f32,              // index 21
    mid: f32,               // index 22
    high: f32,              // index 23
    layerScale: f32,        // index 24
    layerOpacity: f32,      // index 25
    _pad1: f32,             // index 26
    layerColorR: f32,       // index 27
    layerColorG: f32,       // index 28
    layerColorB: f32,       // index 29
    densityMult: f32,       // index 30
    speedMult: f32,         // index 31
    breath: f32,            // index 32
};
```

**Rule**: Do NOT use `vec3<f32>` for layerColor — it triggers 16-byte alignment padding that breaks the flat Float32Array packing. Always use three separate f32 fields.

## System Integration

| System | WebGPU Path | Notes |
|--------|-------------|-------|
| **Faceted** | Single-canvas via UnifiedRenderBridge | Inline WGSL matches canonical layout. Only system with a complete WebGPU path wired in the demo page. |
| **Quantum** | Multi-canvas via MultiCanvasBridge | Requires 5 separate canvas DOM elements. Falls back to WebGL on `docs/webgpu-live.html` (single canvas). |
| **Holographic** | Multi-canvas via MultiCanvasBridge | Same 5-canvas requirement. Falls back to WebGL on demo page. |

## Remaining Work

1. **End-to-end browser validation** — Run FacetedSystem through WebGPU in a Chrome/Edge browser with WebGPU enabled and confirm correct visual output matches WebGL.
2. **Quantum/Holographic single-canvas path** — Either provide a single-canvas WebGPU fallback or create a demo page with the required 5-canvas DOM structure.
3. **Automated smoke test** — A Playwright test (with WebGPU-capable browser) that initializes the bridge, renders one frame, and confirms no errors.
4. **Shader sync verification** — Extend `tools/shader-sync-verify.js` to also verify WGSL struct layouts match `packVIB3Uniforms()`.

## Demo Page

`docs/webgpu-live.html` — Tries WebGPU for FacetedSystem, always WebGL for Quantum/Holographic. Shows green "WEBGPU" or yellow "WEBGL" badge.

## Testing

WebGPU cannot be validated in headless CI without GPU support. Strategy:
- CI: Run WebGL tests + shader lint + struct layout checks
- Manual: Smoke test in Chrome/Edge with `chrome://flags/#enable-unsafe-webgpu`

## File Locations

- Backend: `src/render/backends/WebGPUBackend.js`
- Bridge: `src/render/UnifiedRenderBridge.js`
- Packing: `packVIB3Uniforms()` in UnifiedRenderBridge.js
- WGSL shaders: `src/shaders/`
- Demo: `docs/webgpu-live.html`
