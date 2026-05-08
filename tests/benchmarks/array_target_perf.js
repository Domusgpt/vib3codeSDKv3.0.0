import Mat4x4 from '../../src/math/Mat4x4.js';
import Projection from '../../src/math/Projection.js';
import Vec4 from '../../src/math/Vec4.js';

const iterations = 5000;
const arraySize = 1000;
const vectors = Array.from({ length: arraySize }, () => Vec4.random());
const matrix = Mat4x4.rotationXY(Math.PI / 4);

// Target pre-allocated
const target = Array.from({ length: arraySize }, () => new Vec4());

function runBenchmark(name, fn) {
    // Warmup
    for (let i = 0; i < 100; i++) {
        fn();
    }

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    const end = performance.now();

    console.log(`${name}: ${(end - start).toFixed(2)}ms`);
}

console.log('--- Mat4x4.multiplyVec4Array ---');
runBenchmark('Without target (Allocation/map)', () => matrix.multiplyVec4Array(vectors));
runBenchmark('With target (Zero-allocation/loop)', () => matrix.multiplyVec4Array(vectors, target));

console.log('\n--- Projection.stereographicArray ---');
runBenchmark('Without target (Allocation/map)', () => Projection.stereographicArray(vectors));
runBenchmark('With target (Zero-allocation/loop)', () => Projection.stereographicArray(vectors, {}, target));

console.log('\n--- Projection.orthographicArray ---');
runBenchmark('Without target (Allocation/map)', () => Projection.orthographicArray(vectors));
runBenchmark('With target (Zero-allocation/loop)', () => Projection.orthographicArray(vectors, target));
