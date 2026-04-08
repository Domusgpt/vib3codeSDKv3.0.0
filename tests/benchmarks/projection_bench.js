import { Vec4 } from '../../src/math/Vec4.js';
import { Projection } from '../../src/math/Projection.js';

const vectors = Array.from({length: 10000}, () => new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));
const targetStereo = Array.from({length: 10000}, () => new Vec4());
const targetOrtho = Array.from({length: 10000}, () => new Vec4());

console.time('stereographicArray (map)');
for(let i=0; i<100; i++) {
    Projection.stereographicArray(vectors);
}
console.timeEnd('stereographicArray (map)');

console.time('stereographicArray (target)');
for(let i=0; i<100; i++) {
    Projection.stereographicArray(vectors, {}, targetStereo);
}
console.timeEnd('stereographicArray (target)');

console.time('orthographicArray (map)');
for(let i=0; i<100; i++) {
    Projection.orthographicArray(vectors);
}
console.timeEnd('orthographicArray (map)');

console.time('orthographicArray (target)');
for(let i=0; i<100; i++) {
    Projection.orthographicArray(vectors, targetOrtho);
}
console.timeEnd('orthographicArray (target)');
