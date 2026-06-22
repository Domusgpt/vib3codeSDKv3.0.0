
## 2026-02-14 - Matrix Multiplication Bottleneck
**Learning:** The `Mat4x4.multiplyInPlace` method was deceptively inefficient, allocating a new `Mat4x4` instance and `Float32Array` on every call despite being labeled "in-place". This caused significant GC pressure in render loops.
**Action:** When optimizing math libraries, always verify "in-place" methods are truly allocation-free. Unrolling 4x4 matrix multiplication loops in JS provides massive (~12x) speedups by avoiding loop overhead and enabling better JIT optimization.

## 2026-05-22 - Rotor4D Rotation Allocation
**Learning:** `Rotor4D.rotate(v)` was allocating a temporary `Float32Array` (via `toMatrix`) and a new `Vec4` on every call. In a high-frequency render loop, this creates substantial GC pressure.
**Action:** Inline the matrix math for hot geometric operations like rotation. Always inspect core math methods for hidden allocations (like temporary arrays) and add `target` parameters to support zero-allocation usage patterns.

## 2024-05-22 - [Optimizing Matrix Rotations]
**Learning:** Mat4x4.rotationFromAngles was creating excessive garbage by allocating new matrix objects for each rotation step (up to 11 per call). Implementing in-place rotation methods (rotateXY etc.) reduced this to 1 allocation and sped up the operation by ~3x.
**Action:** When implementing mathematical operations that are composed (like rotations), always provide in-place modification methods to avoid intermediate object allocation in hot paths.

## 2024-05-23 - [Zero-Allocation Math Ops]
**Learning:** Adding optional `target` parameters to core math functions (`Mat4x4.multiply`, `Vec4.add`, etc.) is a high-impact optimization that enables zero-allocation usage patterns in hot loops without breaking existing API compatibility.
**Action:** Always implement `target` support for vector/matrix operations. Ensure aliasing safety (e.g. `a.multiply(b, a)`) by caching input values in local variables before writing to the output buffer.

## 2024-05-24 - [Micro-Benchmarking Allocation vs In-Place]
**Learning:** In V8, tight loops with simple object allocation (like `new Vec4`) can be faster than in-place modification due to inline caching and fixed shape optimizations. However, this advantage disappears in long-running applications where GC pressure accumulates.
**Action:** Don't rely solely on micro-benchmarks for allocation optimizations. Prioritize zero-allocation patterns for their systemic benefit (reduced GC pauses) even if raw throughput in a tight loop appears slightly lower.

## 2024-05-25 - [Broken Fallback Performance]
**Learning:** The JS fallback for WASM modules (`WasmLoader.js`) was broken due to signature mismatches (passing arguments vs expected object) and incorrect imports (`JsProjection.perspectiveProject`), causing silent failures or crashes. Fixing this not only restored correctness but enabled performance optimizations via target reuse.
**Action:** Always verify fallback implementations with integration tests that mirror the primary API usage exactly. When optimizing a facade (like `UnifiedMath`), ensure the underlying implementation supports the optimized signature (e.g. `target` parameter).

## 2026-06-22 - Array Iteration Performance in Render Loops
**Learning:** In high-frequency code paths like the 60fps render loops in `QuantumEngine.js` and `RealHolographicSystem.js`, using `Array.prototype.forEach` introduces measurable overhead due to per-iteration closure allocation and callback execution. Benchmarks show that replacing `.forEach()` with a standard `for` loop caching the array length yields approximately a 20-25% execution speed improvement and eliminates entirely the garbage collection pressure associated with these recurring closures.
**Action:** Always prefer standard `for` loops (e.g., `for (let i = 0, len = arr.length; i < len; i++)`) over `.forEach()` when iterating over collections in hot paths such as requestAnimationFrame render loops, update loops, or geometry processing routines to minimize GC pauses and maximize FPS.
