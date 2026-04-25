import { Vec4 } from '../../src/math/Vec4.js';
import { Projection } from '../../src/math/Projection.js';

const ITERATIONS = 100000;
const VECTOR_COUNT = 1000;

function runBenchmark() {
    console.log(`Running array benchmark with ${ITERATIONS} iterations on array of size ${VECTOR_COUNT}...`);

    const vectors = Array.from({ length: VECTOR_COUNT }, (_, i) => new Vec4(i, i+1, i+2, i+3));
    const target = Array.from({ length: VECTOR_COUNT }, () => new Vec4());

    // 1. Benchmark orthographicArray
    console.log('\n--- orthographicArray ---');

    // Allocation
    let start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        const res = Projection.orthographicArray(vectors);
    }
    let end = performance.now();
    const timeOrthoAlloc = end - start;
    console.log(`Allocation: ${timeOrthoAlloc.toFixed(2)}ms`);

    // With Target
    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        Projection.orthographicArray(vectors, target);
    }
    end = performance.now();
    const timeOrthoTarget = end - start;
    console.log(`With Target: ${timeOrthoTarget.toFixed(2)}ms`);


    // 2. Benchmark stereographicArray
    console.log('\n--- stereographicArray ---');

    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        const res = Projection.stereographicArray(vectors);
    }
    end = performance.now();
    const timeStereoAlloc = end - start;
    console.log(`Allocation: ${timeStereoAlloc.toFixed(2)}ms`);

    // With Target
    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        Projection.stereographicArray(vectors, {}, target);
    }
    end = performance.now();
    const timeStereoTarget = end - start;
    console.log(`With Target: ${timeStereoTarget.toFixed(2)}ms`);

    return {
        timeOrthoAlloc,
        timeOrthoTarget,
        timeStereoAlloc,
        timeStereoTarget
    };
}

runBenchmark();
