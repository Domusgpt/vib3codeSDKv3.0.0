import { performance } from 'perf_hooks';
import Mat4x4 from '../../src/math/Mat4x4.js';

const mat = Mat4x4.identity();
const mat2 = Mat4x4.identity();
mat2.data[5] = 2; // not identity

function benchmarkOriginal() {
    const start = performance.now();
    let count = 0;
    for (let i = 0; i < 1000000; i++) {
        if (mat.isIdentity()) count++;
        if (mat2.isIdentity()) count++;
    }
    return performance.now() - start;
}

// simulate optimized version
function optimizedIsIdentity(m, epsilon = 1e-6) {
    const d = m.data;
    if (Math.abs(d[0] - 1) > epsilon || Math.abs(d[5] - 1) > epsilon || Math.abs(d[10] - 1) > epsilon || Math.abs(d[15] - 1) > epsilon) return false;
    if (Math.abs(d[1]) > epsilon || Math.abs(d[2]) > epsilon || Math.abs(d[3]) > epsilon || Math.abs(d[4]) > epsilon ||
        Math.abs(d[6]) > epsilon || Math.abs(d[7]) > epsilon || Math.abs(d[8]) > epsilon || Math.abs(d[9]) > epsilon ||
        Math.abs(d[11]) > epsilon || Math.abs(d[12]) > epsilon || Math.abs(d[13]) > epsilon || Math.abs(d[14]) > epsilon) return false;
    return true;
}

function benchmarkOptimized() {
    const start = performance.now();
    let count = 0;
    for (let i = 0; i < 1000000; i++) {
        if (optimizedIsIdentity(mat)) count++;
        if (optimizedIsIdentity(mat2)) count++;
    }
    return performance.now() - start;
}

console.log("Warming up...");
benchmarkOriginal();
benchmarkOptimized();

console.log("Original (allocates new Mat4x4):", benchmarkOriginal().toFixed(2), "ms");
console.log("Optimized (no allocation):", benchmarkOptimized().toFixed(2), "ms");
