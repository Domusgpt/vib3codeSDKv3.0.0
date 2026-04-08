import { Vec4 } from '../../src/math/Vec4.js';
import { Mat4x4 } from '../../src/math/Mat4x4.js';
import { Projection } from '../../src/math/Projection.js';

// Setup
const count = 10000;
const vectors = Array.from({length: count}, () => new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));
const mat = Mat4x4.rotationXY(Math.PI / 4);
const target = Array.from({length: count}, () => new Vec4());

// Test unoptimized fallback (no target)
let start = performance.now();
for (let i = 0; i < 100; i++) {
    mat.multiplyVec4Array(vectors);
}
const matTimeMap = performance.now() - start;

// Test optimized
start = performance.now();
for (let i = 0; i < 100; i++) {
    mat.multiplyVec4Array(vectors, target);
}
const matTimeOpt = performance.now() - start;

console.log(`Mat4x4 map() (fallback): ${matTimeMap.toFixed(2)}ms`);
console.log(`Mat4x4 loop (target): ${matTimeOpt.toFixed(2)}ms`);

// Projection
start = performance.now();
for (let i = 0; i < 100; i++) {
    Projection.stereographicArray(vectors, {});
}
const projTimeMap = performance.now() - start;

start = performance.now();
for (let i = 0; i < 100; i++) {
    Projection.stereographicArray(vectors, {}, target);
}
const projTimeOpt = performance.now() - start;

console.log(`Projection map() (fallback): ${projTimeMap.toFixed(2)}ms`);
console.log(`Projection loop (target): ${projTimeOpt.toFixed(2)}ms`);

// Orthographic
start = performance.now();
for (let i = 0; i < 100; i++) {
    Projection.orthographicArray(vectors);
}
const orthoTimeMap = performance.now() - start;

start = performance.now();
for (let i = 0; i < 100; i++) {
    Projection.orthographicArray(vectors, target);
}
const orthoTimeOpt = performance.now() - start;

console.log(`Orthographic map() (fallback): ${orthoTimeMap.toFixed(2)}ms`);
console.log(`Orthographic loop (target): ${orthoTimeOpt.toFixed(2)}ms`);

// Assert correctness
const resFallback = mat.multiplyVec4Array(vectors);
const resOpt = mat.multiplyVec4Array(vectors, target);

let passed = true;
for (let i = 0; i < Math.min(10, count); i++) {
    if (Math.abs(resFallback[i].x - resOpt[i].x) > 1e-6) {
        passed = false;
        console.error(`Mismatch at ${i}: expected ${resFallback[i].x}, got ${resOpt[i].x}`);
    }
}
if (passed) console.log("Correctness check passed.");

// Test overloaded stereographic options
const overOpt = Projection.stereographicArray(vectors, target);
if (overOpt === target) console.log("Overloaded options check passed.");
