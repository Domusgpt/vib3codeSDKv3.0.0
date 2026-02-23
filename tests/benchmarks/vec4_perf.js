
import { Vec4 } from '../../src/math/Vec4.js';

const ITERATIONS = 5000000;

function runBenchmark() {
    console.log(`Running benchmark with ${ITERATIONS} iterations...`);

    const v1 = new Vec4(1, 2, 3, 4);
    const v2 = new Vec4(5, 6, 7, 8);
    const target = new Vec4();

    // 1. Benchmark projectOrthographic
    console.log('\n--- projectOrthographic ---');

    // Allocation
    let start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        const res = v1.projectOrthographic();
    }
    let end = performance.now();
    const timeAlloc = end - start;
    console.log(`Allocation: ${timeAlloc.toFixed(2)}ms`);

    // With Target
    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        v1.projectOrthographic(target);
    }
    end = performance.now();
    const timeTarget = end - start;
    console.log(`With Target: ${timeTarget.toFixed(2)}ms`);


    // 2. Benchmark distanceTo
    console.log('\n--- distanceTo ---');

    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        const d = v1.distanceTo(v2);
    }
    end = performance.now();
    const timeDistance = end - start;
    console.log(`distanceTo: ${timeDistance.toFixed(2)}ms`);

    // 3. Benchmark distanceToSquared
    console.log('\n--- distanceToSquared ---');

    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        const d = v1.distanceToSquared(v2);
    }
    end = performance.now();
    const timeDistanceSq = end - start;
    console.log(`distanceToSquared: ${timeDistanceSq.toFixed(2)}ms`);

    return {
        timeAlloc,
        timeTarget,
        timeDistance,
        timeDistanceSq
    };
}

runBenchmark();
