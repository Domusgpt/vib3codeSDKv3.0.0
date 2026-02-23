
import { Mat4x4 } from '../../src/math/Mat4x4.js';

const ITERATIONS = 1000000;

function runBenchmark() {
    console.log(`Running Mat4x4 benchmark with ${ITERATIONS} iterations...`);

    const m1 = new Mat4x4([
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 17 // Slightly non-singular
    ]);
    const target = new Mat4x4();

    // 1. Benchmark inverse
    console.log('\n--- inverse ---');

    // Baseline (Allocation)
    let start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        const res = m1.inverse();
    }
    let end = performance.now();
    const timeAllocInv = end - start;
    console.log(`Allocation: ${timeAllocInv.toFixed(2)}ms`);

    // With Target
    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        m1.inverse(target);
    }
    end = performance.now();
    const timeTargetInv = end - start;
    console.log(`With Target: ${timeTargetInv.toFixed(2)}ms`);

    // 2. Benchmark transpose
    console.log('\n--- transpose ---');

    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        const t = m1.transpose();
    }
    end = performance.now();
    const timeAllocTrans = end - start;
    console.log(`Allocation: ${timeAllocTrans.toFixed(2)}ms`);

    // With Target
    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        m1.transpose(target);
    }
    end = performance.now();
    const timeTargetTrans = end - start;
    console.log(`With Target: ${timeTargetTrans.toFixed(2)}ms`);

    return {
        timeAllocInv,
        timeTargetInv,
        timeAllocTrans,
        timeTargetTrans
    };
}

runBenchmark();
