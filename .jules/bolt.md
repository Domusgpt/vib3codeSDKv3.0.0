
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
