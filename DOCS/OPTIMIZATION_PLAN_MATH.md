# Optimization Plan: Math Library (Mat4x4 / Vec4)

**Status**: Active Investigation
**Goal**: Eliminate per-frame object allocations in critical render loops.

## Current State Analysis (Regression)
The current implementation of `src/math/Mat4x4.js` relies on naive object-oriented patterns that allocate new `Mat4x4` and `Float32Array` instances for every operation:

```javascript
// Current Implementation (Naive)
multiply(m) {
    // Allocates new Float32Array(16) implicitly
    // Allocates new Mat4x4 wrapper
    return new Mat4x4(out);
}
```

This creates significant Garbage Collection (GC) pressure, causing frame drops during complex animations (especially in multi-instance "Ultra" scenarios).

## Proposed Optimization Strategy

### Phase 1: Static Allocation-Free Methods (Immediate)
Refactor `Mat4x4` to support a "static-style" API where output buffers are reused. This mimics the high-performance `gl-matrix` library approach.

```javascript
// Proposed Implementation (Optimized)
static multiply(out, a, b) {
    const a00 = a.data[0], a01 = a.data[1], ...
    const b00 = b.data[0], b01 = b.data[1], ...

    out.data[0] = b00 * a00 + b01 * a04 + ...
    // ... unrolled loop ...
    return out;
}
```

**Actions:**
1.  Add `static multiply(out, a, b)` to `Mat4x4`.
2.  Add `static rotationXY(out, angle)`, `static rotationXW(out, angle)`, etc.
3.  Update render loops (e.g., `VIB3Engine.js`, `Renderer.js`) to use pre-allocated scratch matrices.

### Phase 2: Rotor4D Integration
Shift rotation logic from Matrices to Rotors (Geometric Algebra). Rotors interpolate smoother (slerp) and compose cheaper than 4x4 matrices.

**Actions:**
1.  Ensure `Rotor4D` is used for all object orientation accumulation.
2.  Only convert Rotor -> Matrix at the final step before uploading to the GPU uniform.

### Phase 3: WASM / SIMD (Future)
For "Ultra Tier" physics (Lattice Physics), JS math may bottleneck.
**Plan:** Port core 4D math (collision detection, raymarching) to AssemblyScript (WASM) to utilize SIMD instructions if available.

## Implementation Details

### `Mat4x4.js` Refactor
-   **Storage**: Keep `this.data` as `Float32Array(16)`.
-   **Static API**: All operations available as static functions taking `(out, ...args)`.
-   **Instance API**: Refactor to use static methods internally: `multiply(m) { return Mat4x4.multiply(new Mat4x4(), this, m); }` (for backward compat).

### Benchmarking
Compare `new Mat4x4().multiply(new Mat4x4())` vs `Mat4x4.multiply(scratch, a, b)` in a loop of 10,000 iterations.
Target: **0 allocations per frame** in the steady state.
