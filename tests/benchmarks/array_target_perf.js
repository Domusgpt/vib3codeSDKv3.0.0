import { Mat4x4 } from '../../src/math/Mat4x4.js';
import { Vec4 } from '../../src/math/Vec4.js';
import { Projection } from '../../src/math/Projection.js';

const vectors = Array.from({ length: 10000 }, () => Vec4.randomSigned());
const target = Array.from({ length: 10000 }, () => new Vec4());
const matrix = Mat4x4.rotationXY(Math.PI / 4);

console.time('multiplyVec4Array - map (allocation)');
for (let i = 0; i < 100; i++) {
    matrix.multiplyVec4Array(vectors);
}
console.timeEnd('multiplyVec4Array - map (allocation)');

console.time('multiplyVec4Array - target (no allocation)');
for (let i = 0; i < 100; i++) {
    matrix.multiplyVec4Array(vectors, target);
}
console.timeEnd('multiplyVec4Array - target (no allocation)');

console.time('stereographicArray - map (allocation)');
for (let i = 0; i < 100; i++) {
    Projection.stereographicArray(vectors);
}
console.timeEnd('stereographicArray - map (allocation)');

console.time('stereographicArray - target (no allocation)');
for (let i = 0; i < 100; i++) {
    Projection.stereographicArray(vectors, {}, target);
}
console.timeEnd('stereographicArray - target (no allocation)');


console.time('orthographicArray - map (allocation)');
for (let i = 0; i < 100; i++) {
    Projection.orthographicArray(vectors);
}
console.timeEnd('orthographicArray - map (allocation)');

console.time('orthographicArray - target (no allocation)');
for (let i = 0; i < 100; i++) {
    Projection.orthographicArray(vectors, target);
}
console.timeEnd('orthographicArray - target (no allocation)');
