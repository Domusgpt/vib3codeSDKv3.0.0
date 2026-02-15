
## 2026-02-14 - Matrix Multiplication Bottleneck
**Learning:** The `Mat4x4.multiplyInPlace` method was deceptively inefficient, allocating a new `Mat4x4` instance and `Float32Array` on every call despite being labeled "in-place". This caused significant GC pressure in render loops.
**Action:** When optimizing math libraries, always verify "in-place" methods are truly allocation-free. Unrolling 4x4 matrix multiplication loops in JS provides massive (~12x) speedups by avoiding loop overhead and enabling better JIT optimization.

## 2026-02-14 - Rotor4D Optimization
**Learning:** The `Rotor4D.rotate(v)` method was creating a temporary 4x4 matrix (16 floats) for every vertex rotation. Optimized this to use the direct sandwich product formula, eliminating all allocations. Also added `multiplyInPlace` to allow allocation-free rotor composition.
**Action:** When working with Geometric Algebra in JS, avoid converting to matrices unless necessary. Direct component-wise formulas are faster and allocation-free.
