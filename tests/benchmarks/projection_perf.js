import { Projection } from '../../src/math/Projection.js';
import { Vec4 } from '../../src/math/Vec4.js';

const iterations = 100000;
const vectors = Array.from({ length: iterations }, () => new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));
const target = new Array(iterations);
for(let i=0; i<iterations; i++) {
    target[i] = new Vec4();
}

console.log(`Running Projection benchmark with ${iterations} iterations...\n`);

console.log("--- perspectiveArray ---");
let start = performance.now();
Projection.perspectiveArray(vectors, 2.0);
console.log(`Allocation: ${(performance.now() - start).toFixed(2)}ms`);

start = performance.now();
Projection.perspectiveArray(vectors, 2.0, {}, target);
console.log(`With Target: ${(performance.now() - start).toFixed(2)}ms`);

console.log("\n--- stereographicArray ---");
start = performance.now();
Projection.stereographicArray(vectors);
console.log(`Allocation: ${(performance.now() - start).toFixed(2)}ms`);

start = performance.now();
Projection.stereographicArray(vectors, {}, target);
console.log(`With Target: ${(performance.now() - start).toFixed(2)}ms`);

console.log("\n--- orthographicArray ---");
start = performance.now();
Projection.orthographicArray(vectors);
console.log(`Allocation: ${(performance.now() - start).toFixed(2)}ms`);

start = performance.now();
Projection.orthographicArray(vectors, target);
console.log(`With Target: ${(performance.now() - start).toFixed(2)}ms`);
