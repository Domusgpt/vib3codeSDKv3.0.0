import { Vec4 } from '../../src/math/Vec4.js';
import { Mat4x4 } from '../../src/math/Mat4x4.js';
import { Projection } from '../../src/math/Projection.js';

function runBenchmark() {
    console.log('Running array operations benchmark...');

    const count = 100000;
    const vectors = new Array(count);
    for (let i = 0; i < count; i++) {
        vectors[i] = new Vec4(Math.random(), Math.random(), Math.random(), Math.random());
    }
    const mat = Mat4x4.identity();
    mat.setRow(0, new Vec4(2, 0, 0, 0));

    // Mat4x4
    let start = performance.now();
    mat.multiplyVec4Array(vectors);
    let end = performance.now();
    console.log(`Mat4x4 multiplyVec4Array (allocation): ${(end - start).toFixed(2)}ms`);

    const targetMat = new Array(count);
    start = performance.now();
    mat.multiplyVec4Array(vectors, targetMat);
    end = performance.now();
    console.log(`Mat4x4 multiplyVec4Array (with target): ${(end - start).toFixed(2)}ms`);

    // Projection
    start = performance.now();
    Projection.stereographicArray(vectors);
    end = performance.now();
    console.log(`Projection stereographicArray (allocation): ${(end - start).toFixed(2)}ms`);

    const targetProj = new Array(count);
    start = performance.now();
    Projection.stereographicArray(vectors, {}, targetProj);
    end = performance.now();
    console.log(`Projection stereographicArray (with target): ${(end - start).toFixed(2)}ms`);
}

runBenchmark();
