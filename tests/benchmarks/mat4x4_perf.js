import { Mat4x4 } from '../../src/math/Mat4x4.js';
import { Vec4 } from '../../src/math/Vec4.js';

const ITERATIONS = 100000;
const VECTOR_COUNT = 1000;

function runBenchmark() {
    console.log(`Running Mat4x4 benchmark with ${ITERATIONS} iterations on array of size ${VECTOR_COUNT}...`);

    const mat = new Mat4x4();
    const vectors = Array.from({ length: VECTOR_COUNT }, (_, i) => new Vec4(i, i+1, i+2, i+3));
    const target = Array.from({ length: VECTOR_COUNT }, () => new Vec4());

    // 1. Benchmark multiplyVec4Array
    console.log('\n--- multiplyVec4Array ---');

    // Allocation
    let start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        const res = mat.multiplyVec4Array(vectors);
    }
    let end = performance.now();
    const timeAlloc = end - start;
    console.log(`Allocation: ${timeAlloc.toFixed(2)}ms`);

    // With Target
    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        mat.multiplyVec4Array(vectors, target);
    }
    end = performance.now();
    const timeTarget = end - start;
    console.log(`With Target: ${timeTarget.toFixed(2)}ms`);

    return {
        timeAlloc,
        timeTarget
    };
}

runBenchmark();
