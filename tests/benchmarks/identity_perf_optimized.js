import { Mat4x4 } from '../../src/math/Mat4x4.js';
import { Rotor4D } from '../../src/math/Rotor4D.js';

const ITERATIONS = 10000000;

Mat4x4.IDENTITY = new Mat4x4();
Mat4x4.prototype.isIdentityOpt = function(epsilon = 1e-6) {
    return this.equals(Mat4x4.IDENTITY, epsilon);
}

Rotor4D.IDENTITY = new Rotor4D();
Rotor4D.prototype.isIdentityOpt = function(epsilon = 1e-6) {
    return this.equals(Rotor4D.IDENTITY, epsilon);
}

function runBenchmark() {
    console.log(`Running IDENTITY Optimized benchmark with ${ITERATIONS} iterations...`);

    const m = new Mat4x4();
    const r = new Rotor4D();

    console.log('\n--- Mat4x4.isIdentityOpt() ---');

    let start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        m.isIdentityOpt();
    }
    let end = performance.now();
    console.log(`Time: ${(end - start).toFixed(2)}ms`);


    console.log('\n--- Rotor4D.isIdentityOpt() ---');

    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        r.isIdentityOpt();
    }
    end = performance.now();
    console.log(`Time: ${(end - start).toFixed(2)}ms`);
}

runBenchmark();
