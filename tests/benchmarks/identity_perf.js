import { Mat4x4 } from '../../src/math/Mat4x4.js';
import { Rotor4D } from '../../src/math/Rotor4D.js';

const ITERATIONS = 10000000;

function runBenchmark() {
    console.log(`Running IDENTITY benchmark with ${ITERATIONS} iterations...`);

    const m = new Mat4x4();
    const r = new Rotor4D();

    console.log('\n--- Mat4x4.isIdentity() ---');

    let start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        m.isIdentity();
    }
    let end = performance.now();
    console.log(`Time: ${(end - start).toFixed(2)}ms`);


    console.log('\n--- Rotor4D.isIdentity() ---');

    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        r.isIdentity();
    }
    end = performance.now();
    console.log(`Time: ${(end - start).toFixed(2)}ms`);
}

runBenchmark();
