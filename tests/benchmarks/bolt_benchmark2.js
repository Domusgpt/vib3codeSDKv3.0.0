import { performance } from 'perf_hooks';
import { Vec4 } from '../../src/math/Vec4.js';
import { Mat4x4 } from '../../src/math/Mat4x4.js';
import { Projection } from '../../src/math/Projection.js';

const ITERATIONS = 10000;
const VECTORS_COUNT = 100;

const vectors = Array.from({ length: VECTORS_COUNT }, () => new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));
const matrix = Mat4x4.rotationXY(Math.PI / 4);

// Warmup
for (let i = 0; i < 100; i++) {
    matrix.multiplyVec4Array(vectors);
}

const start1 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    matrix.multiplyVec4Array(vectors);
}
const end1 = performance.now();
console.log(`multiplyVec4Array (No target): ${(end1 - start1).toFixed(2)}ms`);


const targetArray = Array.from({ length: VECTORS_COUNT }, () => new Vec4());

// Warmup
for (let i = 0; i < 100; i++) {
    matrix.multiplyVec4Array(vectors, targetArray);
}

const start2 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    matrix.multiplyVec4Array(vectors, targetArray);
}
const end2 = performance.now();
console.log(`multiplyVec4Array (With target): ${(end2 - start2).toFixed(2)}ms`);

// Test orthographicArray
const start3 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    Projection.orthographicArray(vectors);
}
const end3 = performance.now();
console.log(`orthographicArray (No target): ${(end3 - start3).toFixed(2)}ms`);

const start4 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    Projection.orthographicArray(vectors, targetArray);
}
const end4 = performance.now();
console.log(`orthographicArray (With target): ${(end4 - start4).toFixed(2)}ms`);

// Test stereographicArray
const start5 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    Projection.stereographicArray(vectors, { radius: 2 });
}
const end5 = performance.now();
console.log(`stereographicArray (No target): ${(end5 - start5).toFixed(2)}ms`);

const start6 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    Projection.stereographicArray(vectors, { radius: 2 }, targetArray);
}
const end6 = performance.now();
console.log(`stereographicArray (With target): ${(end6 - start6).toFixed(2)}ms`);
