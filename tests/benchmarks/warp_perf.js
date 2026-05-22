import { Vec4 } from '../../src/math/Vec4.js';
import { warpToCells, warpToEdges, warpTetrahedral } from '../../src/geometry/warp/HypertetraCore.js';

const ITERATIONS = 1000;
const vertices = Array.from({ length: 100 }, () => new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));

function runBenchmark() {
    console.log(`Running benchmark with ${ITERATIONS} iterations and ${vertices.length} vertices...`);

    let start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        warpToCells(vertices, 1, 0.7);
    }
    let end = performance.now();
    console.log(`warpToCells: ${(end - start).toFixed(2)}ms`);

    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        warpToEdges(vertices, 1, 0.5);
    }
    end = performance.now();
    console.log(`warpToEdges: ${(end - start).toFixed(2)}ms`);

    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        warpTetrahedral(vertices, 1, 1);
    }
    end = performance.now();
    console.log(`warpTetrahedral: ${(end - start).toFixed(2)}ms`);

}

runBenchmark();
