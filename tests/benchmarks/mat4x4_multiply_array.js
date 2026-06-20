import { performance } from 'perf_hooks';
import Mat4x4 from '../../src/math/Mat4x4.js';
import Vec4 from '../../src/math/Vec4.js';

const mat = Mat4x4.identity();
const vectors = Array.from({ length: 1000 }, () => new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));

function benchmarkOriginal() {
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
        vectors.map(v => mat.multiplyVec4(v));
    }
    return performance.now() - start;
}

function benchmarkOptimizedWithoutTarget() {
    const start = performance.now();
    for (let j = 0; j < 10000; j++) {
        const len = vectors.length;
        const result = new Array(len);
        for (let i = 0; i < len; i++) {
            result[i] = mat.multiplyVec4(vectors[i]);
        }
    }
    return performance.now() - start;
}

const target = Array.from({ length: 1000 }, () => new Vec4());
function benchmarkOptimizedWithTarget() {
    const start = performance.now();
    for (let j = 0; j < 10000; j++) {
        const len = vectors.length;
        if (target.length > len) target.length = len;
        for (let i = 0; i < len; i++) {
            target[i] = mat.multiplyVec4(vectors[i], target[i]);
        }
    }
    return performance.now() - start;
}

console.log("Warming up...");
benchmarkOriginal();
benchmarkOptimizedWithoutTarget();
benchmarkOptimizedWithTarget();

console.log("Original (.map):", benchmarkOriginal().toFixed(2), "ms");
console.log("Optimized (for loop, no target):", benchmarkOptimizedWithoutTarget().toFixed(2), "ms");
console.log("Optimized (for loop, with target):", benchmarkOptimizedWithTarget().toFixed(2), "ms");
