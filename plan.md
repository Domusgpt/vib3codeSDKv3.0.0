# Plan: Address Codebase Criticism — Shader Duplication, Interface Inconsistency, Architecture Gaps

This plan addresses the issues identified in the codebase audit, organized by priority and dependency order.

---

## Phase 1: Quick Wins (bugs + low-risk fixes)

### 1.1 Fix QuantumVisualizer canvasId bug
**Files**: `src/quantum/QuantumVisualizer.js`
**What**: Lines 37, 39, 47, 62, 65, 70 reference `canvasId` (undefined) instead of `canvasIdOrElement` (the actual constructor parameter). All error messages and debug logs print `undefined`.
**Fix**: Store `this.canvasId = typeof canvasIdOrElement === 'string' ? canvasIdOrElement : canvasIdOrElement?.id || 'unknown';` in the constructor and use `this.canvasId` in all log/error messages.
**Risk**: None — only affects debug output.

### 1.2 Fix hue inconsistency across systems
**Files**: `src/faceted/FacetedSystem.js`, `src/quantum/QuantumVisualizer.js`, `src/holograms/HolographicVisualizer.js`
**What**: Three completely different hue pipelines:
- Faceted: raw 0-360 → `u_hue` float, divides by 360 **in the shader** (line 278)
- Quantum: normalizes in JS `(hue % 360) / 360.0` → `u_hue` float 0-1
- Holographic: converts to RGB in JS via HSL→RGB → `u_color` vec3

**Fix**: Standardize on the Faceted approach (raw 0-360 to shader, shader normalizes). This is the simplest — the shader already handles it. Change Quantum to pass raw 0-360 and divide in shader. For Holographic, this is harder because the shader expects RGB — defer to Phase 2 (parameter unification).

### 1.3 Honest geometry count in docs/comments
**Files**: `CLAUDE.md`, marketing-facing docs
**What**: "24 geometries" is 7 distinct lattice functions × 3 warps (base/hypersphere/hypertetra). Geometries 0 and 1 (tetrahedron/hypercube) produce identical output. True count: ~21 visually distinguishable configurations.
**Fix**: Update docs to say "24 geometry variants (8 base shapes × 3 4D warp modes)" and add a note that tetrahedron and hypercube lattices currently produce similar output. No code change needed unless we want to differentiate the tetrahedron lattice.

---

## Phase 2: Shader Module System (the big one)

### 2.1 Build a shader preprocessor / composition layer
**Files**: New file `src/render/ShaderComposer.js`
**What**: External shader files already exist in `src/shaders/common/` (rotation4d.glsl, rotation4d.wgsl, geometry24.glsl, geometry24.wgsl) but NO system actually uses them. There is no `#include` or composition mechanism.
**Approach**:
- Create `ShaderComposer` that takes a shader source string, finds `#include "common/rotation4d.glsl"` directives, and replaces them with the file contents at build time (or at load time via ShaderLoader).
- Keep it simple: string replacement of `#include` patterns, no recursive includes, no macros. Just concatenation.
- This works for both GLSL (`#include`) and WGSL (custom `// @include` directive).

### 2.2 Extract shared shader code into common modules
**What**: Currently duplicated across 3-4 inline copies totaling ~375 lines:
- 6D rotation matrices: 132 lines across 4 copies (3 GLSL + 1 WGSL)
- warpHypersphereCore: 51 lines across 3 copies
- warpHypertetraCore: 81 lines across 3 copies
- applyCoreWarp: 46 lines across 3 copies
- project4Dto3D: 15 lines across 3 copies

**Fix**:
1. Add warp functions to `src/shaders/common/geometry24.glsl` and `.wgsl` (they're currently missing)
2. Add `project4Dto3D` to `src/shaders/common/rotation4d.glsl/wgsl` if not already there
3. Replace inline duplications in FacetedSystem.js, QuantumVisualizer.js, HolographicVisualizer.js with `#include` directives
4. The WGSL copies in FacetedSystem.js inline shader get the same treatment

**Dependency**: Requires 2.1 (ShaderComposer) first.

### 2.3 Update shader-sync-verify to validate shared code
**Files**: `tools/shader-sync-verify.js`
**What**: Currently only validates uniform declarations. Extend to:
- Verify that no inline shader contains rotation matrices (they should come from includes)
- Verify WGSL struct layouts match `packVIB3Uniforms()`
- Flag any function that exists in multiple shader files

---

## Phase 3: Parameter Interface Unification

### 3.1 Standardize uniform names across all systems
**What**: Holographic uses different names from Faceted/Quantum:
| Global param | Faceted | Quantum | Holographic |
|---|---|---|---|
| gridDensity | `u_gridDensity` | `u_gridDensity` | `u_density` |
| morphFactor | `u_morphFactor` | `u_morphFactor` | `u_morph` |
| geometry | `u_geometry` | `u_geometry` | `u_geometryType` |
| hue | `u_hue` (0-360) | `u_hue` (0-1) | `u_color` (vec3) |

**Fix**: Rename Holographic uniforms in the shader to match the Faceted/Quantum convention (`u_gridDensity`, `u_morphFactor`, `u_geometry`, `u_hue`). This eliminates the `mapParameterName()` translation layer entirely. The Holographic shader's hue handling changes to match Faceted (raw 0-360, normalize in shader).

**Risk**: Moderate — touching the Holographic shader's color pipeline. Needs careful visual testing.

### 3.2 Remove mapParameterName() translation layer
**Files**: `src/holograms/HolographicVisualizer.js`
**What**: Once uniforms are standardized (3.1), the `mapParameterName()` method and its call sites become dead code.
**Dependency**: Requires 3.1.

---

## Phase 4: Architecture Improvements

### 4.1 Ship curated parameter presets
**Files**: New `src/creative/GeometryPresets.js` or extend `ColorPresetsSystem.js`
**What**: No geometric presets exist. A new user sees `geometry: 0, morphFactor: 1.0, gridDensity: 15` and has no idea what looks good.
**Fix**: Ship 10-20 named parameter snapshots: geometry + rotation + visual params that demonstrate the system's range. Each preset = a frozen parameter object.
**Format**: Same pattern as `ColorPresetsSystem.js` (22 presets already exist).

### 4.2 WebGL context loss recovery
**Files**: `src/quantum/QuantumVisualizer.js`, `src/holograms/HolographicVisualizer.js`
**What**: Context loss handlers exist but recovery is fragile. QuantumVisualizer's recovery (line 67-69) calls `this.init()` which may fail silently. HolographicVisualizer's recovery (line 93-100) has a try/catch but swallows the error.
**Fix**: Add retry logic with exponential backoff (3 attempts), user-facing error callback, and graceful degradation to a static frame or error message.

### 4.3 Frame budget / adaptive quality
**What**: No frame time monitoring or adaptive quality. All systems run at max refresh rate.
**Fix**: Add a simple frame budget system: if frame time exceeds 16ms, scale down canvas resolution. If it drops below 8ms, scale back up. Cap at `devicePixelRatio * 2` (already exists as `Math.min(devicePixelRatio, 2)`). This is a few dozen lines, not a big system.

---

## Phase 5: Future Considerations (larger scope, lower priority)

These are noted from the criticism but are larger refactors that should be separate projects:

- **Real vertex-buffer geometry system**: Currently everything is fullscreen quad + procedural SDF in fragment shader. A vertex-buffer approach would enable wireframe rendering, per-vertex 4D rotation, and picking. This is a fundamental architecture change.
- **TypeScript types expansion**: Some types exist in `types/` already. Full coverage is incremental.
- **Performance profiling dashboard**: Beyond frame budget, a full profiler with per-shader timings and GPU memory tracking.

---

## Execution Order

```
Phase 1.1  canvasId bug fix           (~15 min, no dependencies)
Phase 1.2  hue normalization fix      (~30 min, Quantum only first)
Phase 1.3  docs geometry count        (~10 min, no dependencies)
Phase 2.1  ShaderComposer             (~2-3 hours, foundation for 2.2)
Phase 2.2  Extract shared shaders     (~2-3 hours, requires 2.1)
Phase 2.3  Update shader-sync-verify  (~1 hour, requires 2.2)
Phase 3.1  Uniform name unification   (~2 hours, can parallel with 2.x)
Phase 3.2  Remove translation layer   (~30 min, requires 3.1)
Phase 4.1  Geometry presets           (~1-2 hours, independent)
Phase 4.2  Context loss recovery      (~1 hour, independent)
Phase 4.3  Frame budget              (~1 hour, independent)
```

Phases 1.x can all be done immediately. Phase 2.x is the core work. Phase 3.x can run in parallel with Phase 2 or after it. Phase 4.x items are independent and can be done anytime.
