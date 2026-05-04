import { performance } from 'perf_hooks';
import { Vec4 } from '../../src/math/Vec4.js';
import { Mat4x4 } from '../../src/math/Mat4x4.js';

const ITERATIONS = 10000;
const VECTORS_COUNT = 100;

const vectors = Array.from({ length: VECTORS_COUNT }, () => new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));
const matrix = Mat4x4.rotationXY(Math.PI / 4);

// Warmup
for (let i = 0; i < 100; i++) {
    matrix.multiplyVec4Array(vectors);
}

const start1 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    matrix.multiplyVec4Array(vectors);
}
const end1 = performance.now();
console.log(`Original multiplyVec4Array: ${(end1 - start1).toFixed(2)}ms`);

// Mock new implementation
Mat4x4.prototype.multiplyVec4ArrayOptimized = function(vectors, target = null) {
    if (!target) {
        return vectors.map(v => this.multiplyVec4(v));
    }
    const count = vectors.length;
    for (let i = 0; i < count; i++) {
        const out = target[i];
        if (out) {
            this.multiplyVec4(vectors[i], out);
        } else {
            target[i] = this.multiplyVec4(vectors[i]);
        }
    }
    if (target.length > count) target.length = count;
    return target;
};

const targetArray = Array.from({ length: VECTORS_COUNT }, () => new Vec4());

// Warmup
for (let i = 0; i < 100; i++) {
    matrix.multiplyVec4ArrayOptimized(vectors, targetArray);
}

const start2 = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    matrix.multiplyVec4ArrayOptimized(vectors, targetArray);
}
const end2 = performance.now();
console.log(`Optimized multiplyVec4Array with target: ${(end2 - start2).toFixed(2)}ms`);
