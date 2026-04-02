import { Projection } from '../../src/math/Projection.js';
import { Vec4 } from '../../src/math/Vec4.js';

const ITERATIONS = 10000;
const VECTORS_COUNT = 1000;

function runBenchmark() {
    console.log(`Running Projection orthographic benchmark with ${ITERATIONS} iterations of ${VECTORS_COUNT} vectors...`);

    const vectors = [];
    for (let i = 0; i < VECTORS_COUNT; i++) {
        vectors.push(new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));
    }

    // Allocate targets
    const targetVectors = Array.from({length: VECTORS_COUNT}, () => new Vec4());

    console.log('\n--- orthographicArray ---');

    // Baseline (Allocation)
    let start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        const res = Projection.orthographicArray(vectors);
    }
    let end = performance.now();
    const timeAlloc = end - start;
    console.log(`Allocation: ${timeAlloc.toFixed(2)}ms`);

    // With Target
    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        Projection.orthographicArray(vectors, targetVectors);
    }
    end = performance.now();
    const timeTarget = end - start;
    console.log(`With Target: ${timeTarget.toFixed(2)}ms`);

    console.log('\n--- stereographicArray ---');

    // Baseline (Allocation)
    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        const res = Projection.stereographicArray(vectors);
    }
    end = performance.now();
    const timeAllocStereo = end - start;
    console.log(`Allocation: ${timeAllocStereo.toFixed(2)}ms`);

    // With Target
    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        Projection.stereographicArray(vectors, {}, targetVectors);
    }
    end = performance.now();
    const timeTargetStereo = end - start;
    console.log(`With Target: ${timeTargetStereo.toFixed(2)}ms`);


    return {
        timeAlloc,
        timeTarget,
        timeAllocStereo,
        timeTargetStereo
    };
}

runBenchmark();
