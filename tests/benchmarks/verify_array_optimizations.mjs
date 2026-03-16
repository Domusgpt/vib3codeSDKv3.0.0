import Projection from '../../src/math/Projection.js';
import Vec4 from '../../src/math/Vec4.js';
import assert from 'assert';

function createVectors(count) {
    const vectors = [];
    for (let i = 0; i < count; i++) {
        vectors.push(new Vec4(Math.random(), Math.random(), Math.random(), Math.random() * 0.5));
    }
    return vectors;
}

const COUNT = 10000;
const ITERATIONS = 1000;
const vectors = createVectors(COUNT);

console.log(`Benchmarking stereographicArray and orthographicArray with ${COUNT} vectors for ${ITERATIONS} iterations...`);

let startStereoOrig = process.hrtime.bigint();
let lastResultStereoOrig;
for (let i = 0; i < ITERATIONS; i++) {
    lastResultStereoOrig = Projection.stereographicArray(vectors, {});
}
let endStereoOrig = process.hrtime.bigint();
console.log(`Original stereographicArray: ${Number(endStereoOrig - startStereoOrig) / 1000000} ms`);

const targetArray = new Array(COUNT);
for(let i=0; i<COUNT; i++) targetArray[i] = new Vec4();

let startStereoOpt = process.hrtime.bigint();
let lastResultStereoOpt;
for (let i = 0; i < ITERATIONS; i++) {
    lastResultStereoOpt = Projection.stereographicArray(vectors, {}, targetArray);
}
let endStereoOpt = process.hrtime.bigint();
console.log(`Optimized stereographicArray (with target): ${Number(endStereoOpt - startStereoOpt) / 1000000} ms`);

// Test overload: options not passed, only target array
let startStereoOptNoOpt = process.hrtime.bigint();
for (let i = 0; i < ITERATIONS; i++) {
    Projection.stereographicArray(vectors, targetArray);
}
let endStereoOptNoOpt = process.hrtime.bigint();
console.log(`Optimized stereographicArray (options omitted): ${Number(endStereoOptNoOpt - startStereoOptNoOpt) / 1000000} ms`);


// Correctness verification
for (let i=0; i<COUNT; i++) {
    assert(Math.abs(lastResultStereoOrig[i].x - lastResultStereoOpt[i].x) < 0.0001);
    assert(Math.abs(lastResultStereoOrig[i].y - lastResultStereoOpt[i].y) < 0.0001);
    assert(Math.abs(lastResultStereoOrig[i].z - lastResultStereoOpt[i].z) < 0.0001);
    assert(lastResultStereoOpt[i].w === 0);
}


let startOrthoOrig = process.hrtime.bigint();
let lastResultOrthoOrig;
for (let i = 0; i < ITERATIONS; i++) {
    lastResultOrthoOrig = Projection.orthographicArray(vectors);
}
let endOrthoOrig = process.hrtime.bigint();
console.log(`Original orthographicArray: ${Number(endOrthoOrig - startOrthoOrig) / 1000000} ms`);

let startOrthoOpt = process.hrtime.bigint();
let lastResultOrthoOpt;
for (let i = 0; i < ITERATIONS; i++) {
    lastResultOrthoOpt = Projection.orthographicArray(vectors, targetArray);
}
let endOrthoOpt = process.hrtime.bigint();
console.log(`Optimized orthographicArray (with target): ${Number(endOrthoOpt - startOrthoOpt) / 1000000} ms`);

// Correctness verification
for (let i=0; i<COUNT; i++) {
    assert(Math.abs(lastResultOrthoOrig[i].x - lastResultOrthoOpt[i].x) < 0.0001);
    assert(Math.abs(lastResultOrthoOrig[i].y - lastResultOrthoOpt[i].y) < 0.0001);
    assert(Math.abs(lastResultOrthoOrig[i].z - lastResultOrthoOpt[i].z) < 0.0001);
    assert(lastResultOrthoOpt[i].w === 0);
}

console.log('Correctness verifications passed!');
