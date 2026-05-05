import { Mat4x4 } from '../../src/math/Mat4x4.js';
import { Vec4 } from '../../src/math/Vec4.js';

const ITERATIONS = 1000;
const ARRAY_SIZE = 10000;

function runBenchmark() {
    console.log(`Running Mat4x4.multiplyVec4Array benchmark with ${ITERATIONS} iterations of array size ${ARRAY_SIZE}...`);

    const mat = Mat4x4.identity();
    const vecs = Array.from({ length: ARRAY_SIZE }, () => new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));
    const target = Array.from({ length: ARRAY_SIZE }, () => new Vec4());

    console.log('\n--- multiplyVec4Array ---');

    let start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        mat.multiplyVec4Array(vecs);
    }
    let end = performance.now();
    const timeNoTarget = end - start;
    console.log(`No Target (new Array allocation): ${timeNoTarget.toFixed(2)}ms`);

    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        mat.multiplyVec4Array(vecs, target);
    }
    end = performance.now();
    const timeTarget = end - start;
    console.log(`With Target (zero allocation): ${timeTarget.toFixed(2)}ms`);
}

runBenchmark();
