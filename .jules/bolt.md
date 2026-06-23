
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
## 2024-05-26 - [Render Loop Array Iteration Optimization]
**Learning:** In `src/quantum/QuantumEngine.js` and `src/holograms/RealHolographicSystem.js`, replacing `this.visualizers.forEach` iterations with standard, length-cached `for` loops in hot paths (like render loops) yields a ~25-35% iteration performance improvement while eliminating per-frame closure allocation, significantly reducing garbage collection pressure.
**Action:** When working in high-frequency loops (e.g. `renderFrame`, `updateParameters`, `updateInteraction`), always use standard `for` loops caching the array length.

## 2024-05-26 - [Object Key Iteration Optimization]
**Learning:** Benchmarks confirm that replacing `Object.keys(obj).forEach()` with `for...in` loops utilizing `Object.prototype.hasOwnProperty.call()` improves object property iteration performance by ~34% to 80% by eliminating intermediate array allocations and closure overhead.
**Action:** When iterating over objects in hot paths, avoid `Object.keys(obj).forEach()`. Instead, use `for (const key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { ... } }`.
