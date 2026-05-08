import Mat4x4 from '../../src/math/Mat4x4.js';
import Vec4 from '../../src/math/Vec4.js';

const iterations = 10000;
const arraySize = 1000;
const vectors = Array.from({ length: arraySize }, () => Vec4.random());
const matrix = Mat4x4.rotationXY(Math.PI / 4);

// Simulate the optimization
Mat4x4.prototype.multiplyVec4ArrayOptimized = function(vectors, target = null) {
    if (!target) {
        // Fallback to map if no target provided to preserve backward compatibility but still allocate
        // but let's actually just allocate here
        return vectors.map(v => this.multiplyVec4(v));
    }

    const count = vectors.length;
    for (let i = 0; i < count; i++) {
        if (target[i]) {
            this.multiplyVec4(vectors[i], target[i]);
        } else {
            target[i] = this.multiplyVec4(vectors[i]);
        }
    }
    if (target.length > count) target.length = count;
    return target;
};

// Target pre-allocated
const target = Array.from({ length: arraySize }, () => new Vec4());

// Warmup
for (let i = 0; i < 100; i++) {
    matrix.multiplyVec4ArrayOptimized(vectors, target);
}

const start = performance.now();
for (let i = 0; i < iterations; i++) {
    matrix.multiplyVec4ArrayOptimized(vectors, target);
}
const end = performance.now();

console.log(`Optimized multiplyVec4Array: ${(end - start).toFixed(2)}ms`);
