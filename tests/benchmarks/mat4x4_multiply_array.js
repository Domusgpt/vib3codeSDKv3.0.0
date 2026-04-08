import { Mat4x4 } from '../../src/math/Mat4x4.js';
import { Vec4 } from '../../src/math/Vec4.js';

const iterations = 100000;
const matrix = Mat4x4.rotationXW(Math.PI / 4);
const vectors = Array.from({ length: iterations }, () => new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));
const target = new Array(iterations);
for(let i=0; i<iterations; i++) {
    target[i] = new Vec4();
}

console.log(`Running multiplyVec4Array benchmark with ${iterations} iterations...\n`);

console.log("--- multiplyVec4Array ---");
let start = performance.now();
matrix.multiplyVec4Array(vectors);
console.log(`Allocation: ${(performance.now() - start).toFixed(2)}ms`);

start = performance.now();
matrix.multiplyVec4Array(vectors, target);
console.log(`With Target: ${(performance.now() - start).toFixed(2)}ms`);
