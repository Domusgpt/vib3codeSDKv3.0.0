import Mat4x4 from '../../src/math/Mat4x4.js';
import Vec4 from '../../src/math/Vec4.js';

const iterations = 10000;
const arraySize = 1000;
const vectors = Array.from({ length: arraySize }, () => Vec4.random());
const matrix = Mat4x4.rotationXY(Math.PI / 4);

// Warmup
for (let i = 0; i < 100; i++) {
    matrix.multiplyVec4Array(vectors);
}

const start = performance.now();
for (let i = 0; i < iterations; i++) {
    matrix.multiplyVec4Array(vectors);
}
const end = performance.now();

console.log(`Original multiplyVec4Array: ${(end - start).toFixed(2)}ms`);
