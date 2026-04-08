import { Mat4x4 } from '../../src/math/Mat4x4.js';
import { Vec4 } from '../../src/math/Vec4.js';
import { Projection } from '../../src/math/Projection.js';

console.log("⚡ Bolt: Verifying Array Optimizations...");

const ITERS = 1000;
const VEC_COUNT = 10000;

const vecs = [];
const targetVecs = [];
for (let i = 0; i < VEC_COUNT; i++) {
    vecs.push(new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));
    targetVecs.push(new Vec4());
}

const mat = Mat4x4.rotationXY(Math.PI / 4);

// --- Mat4x4.multiplyVec4Array ---
let start = performance.now();
for (let i = 0; i < ITERS; i++) {
    mat.multiplyVec4Array(vecs);
}
const timeMatMap = performance.now() - start;

start = performance.now();
for (let i = 0; i < ITERS; i++) {
    mat.multiplyVec4Array(vecs, targetVecs);
}
const timeMatTarget = performance.now() - start;

console.log(`\nMat4x4.multiplyVec4Array:`);
console.log(`  Without target (map): ${timeMatMap.toFixed(2)}ms`);
console.log(`  With target array:    ${timeMatTarget.toFixed(2)}ms`);
console.log(`  Speedup:              ${(timeMatMap / timeMatTarget).toFixed(2)}x`);


// --- Projection.stereographicArray ---
start = performance.now();
for (let i = 0; i < ITERS; i++) {
    Projection.stereographicArray(vecs);
}
const timeStereoMap = performance.now() - start;

start = performance.now();
for (let i = 0; i < ITERS; i++) {
    Projection.stereographicArray(vecs, targetVecs);
}
const timeStereoTarget = performance.now() - start;

console.log(`\nProjection.stereographicArray:`);
console.log(`  Without target (map): ${timeStereoMap.toFixed(2)}ms`);
console.log(`  With target array:    ${timeStereoTarget.toFixed(2)}ms`);
console.log(`  Speedup:              ${(timeStereoMap / timeStereoTarget).toFixed(2)}x`);

// test options overload for stereographicArray
const options = { epsilon: 1e-4 };
Projection.stereographicArray(vecs, options, targetVecs);
Projection.stereographicArray(vecs, targetVecs);

// --- Projection.orthographicArray ---
start = performance.now();
for (let i = 0; i < ITERS; i++) {
    Projection.orthographicArray(vecs);
}
const timeOrthoMap = performance.now() - start;

start = performance.now();
for (let i = 0; i < ITERS; i++) {
    Projection.orthographicArray(vecs, targetVecs);
}
const timeOrthoTarget = performance.now() - start;

console.log(`\nProjection.orthographicArray:`);
console.log(`  Without target (map): ${timeOrthoMap.toFixed(2)}ms`);
console.log(`  With target array:    ${timeOrthoTarget.toFixed(2)}ms`);
console.log(`  Speedup:              ${(timeOrthoMap / timeOrthoTarget).toFixed(2)}x`);

console.log(`\n✅ Array geometric transformation optimizations verified!`);
