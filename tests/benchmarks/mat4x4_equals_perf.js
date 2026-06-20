import { performance } from 'perf_hooks';
import Mat4x4 from '../../src/math/Mat4x4.js';

const mat1 = Mat4x4.identity();
const mat2 = Mat4x4.identity();
mat2.data[15] = 2; // differs at the end

function benchmarkOriginal() {
    const start = performance.now();
    let count = 0;
    for (let i = 0; i < 1000000; i++) {
        if (mat1.equals(mat2)) count++;
        if (mat1.equals(mat1)) count++;
    }
    return performance.now() - start;
}

function optimizedEquals(m1, m2, epsilon = 1e-6) {
    const a = m1.data;
    const b = m2.data;
    if (Math.abs(a[0] - b[0]) > epsilon || Math.abs(a[1] - b[1]) > epsilon ||
        Math.abs(a[2] - b[2]) > epsilon || Math.abs(a[3] - b[3]) > epsilon ||
        Math.abs(a[4] - b[4]) > epsilon || Math.abs(a[5] - b[5]) > epsilon ||
        Math.abs(a[6] - b[6]) > epsilon || Math.abs(a[7] - b[7]) > epsilon ||
        Math.abs(a[8] - b[8]) > epsilon || Math.abs(a[9] - b[9]) > epsilon ||
        Math.abs(a[10] - b[10]) > epsilon || Math.abs(a[11] - b[11]) > epsilon ||
        Math.abs(a[12] - b[12]) > epsilon || Math.abs(a[13] - b[13]) > epsilon ||
        Math.abs(a[14] - b[14]) > epsilon || Math.abs(a[15] - b[15]) > epsilon) {
        return false;
    }
    return true;
}

function benchmarkOptimized() {
    const start = performance.now();
    let count = 0;
    for (let i = 0; i < 1000000; i++) {
        if (optimizedEquals(mat1, mat2)) count++;
        if (optimizedEquals(mat1, mat1)) count++;
    }
    return performance.now() - start;
}

console.log("Warming up...");
benchmarkOriginal();
benchmarkOptimized();

console.log("Original (for loop):", benchmarkOriginal().toFixed(2), "ms");
console.log("Optimized (unrolled):", benchmarkOptimized().toFixed(2), "ms");
