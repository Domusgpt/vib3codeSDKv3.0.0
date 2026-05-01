import { Vec4 } from '../../src/math/Vec4.js';
import { Mat4x4 } from '../../src/math/Mat4x4.js';
import { Projection } from '../../src/math/Projection.js';

const ITERATIONS = 10000;
const ARR_SIZE = 100;

function runBenchmark() {
    console.log(`Running benchmark with ${ITERATIONS} iterations, array size ${ARR_SIZE}...`);

    const vectors = [];
    for(let i=0; i<ARR_SIZE; i++) vectors.push(new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));
    const target = [];
    const mat = Mat4x4.identity();

    // 1. Benchmark multiplyVec4Array
    console.log('\n--- multiplyVec4Array ---');

    // Allocation
    let start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        mat.multiplyVec4Array(vectors);
    }
    let end = performance.now();
    console.log(`Allocation: ${(end - start).toFixed(2)}ms`);

    // With Target
    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        mat.multiplyVec4Array(vectors, target);
    }
    end = performance.now();
    console.log(`With Target: ${(end - start).toFixed(2)}ms`);


    // 2. Benchmark stereographicArray
    console.log('\n--- stereographicArray ---');
    const target2 = [];
    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        Projection.stereographicArray(vectors);
    }
    end = performance.now();
    console.log(`Allocation: ${(end - start).toFixed(2)}ms`);

    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        Projection.stereographicArray(vectors, {}, target2);
    }
    end = performance.now();
    console.log(`With Target: ${(end - start).toFixed(2)}ms`);

}

runBenchmark();
