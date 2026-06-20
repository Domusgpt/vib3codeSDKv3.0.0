import { performance } from 'perf_hooks';
import Rotor4D from '../../src/math/Rotor4D.js';

const r1 = Rotor4D.identity();
const r2 = Rotor4D.identity();
r2.xy = 0.5;

function benchmarkOriginal() {
    const start = performance.now();
    let count = 0;
    for (let i = 0; i < 1000000; i++) {
        if (r1.isIdentity()) count++;
        if (r2.isIdentity()) count++;
    }
    return performance.now() - start;
}

// Memory: "To avoid garbage collection pressure during hot checks like isIdentity() in Mat4x4 and Rotor4D, bypass allocating new instances (which Mat4x4.identity() does) by comparing the internal .data array directly against identity values, or by implementing a cached, frozen static IDENTITY property."
// Wait, for Rotor4D it's different logic, we need to check properties. Let's see optimized logic
function optimizedIsIdentity(r, epsilon = 1e-6) {
    if (Math.abs(r.xy) > epsilon || Math.abs(r.xz) > epsilon || Math.abs(r.yz) > epsilon ||
        Math.abs(r.xw) > epsilon || Math.abs(r.yw) > epsilon || Math.abs(r.zw) > epsilon ||
        Math.abs(r.xyzw) > epsilon) {
        return false;
    }
    return Math.abs(r.s - 1) <= epsilon || Math.abs(r.s + 1) <= epsilon;
}

function benchmarkOptimized() {
    const start = performance.now();
    let count = 0;
    for (let i = 0; i < 1000000; i++) {
        if (optimizedIsIdentity(r1)) count++;
        if (optimizedIsIdentity(r2)) count++;
    }
    return performance.now() - start;
}

console.log("Warming up...");
benchmarkOriginal();
benchmarkOptimized();

console.log("Original:", benchmarkOriginal().toFixed(2), "ms");
console.log("Optimized:", benchmarkOptimized().toFixed(2), "ms");
