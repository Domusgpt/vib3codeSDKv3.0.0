import { Vec4 } from '../../src/math/Vec4.js';
import { warpHypersphereCore, warpRadial, warpStereographic, warpHopf } from '../../src/geometry/warp/HypersphereCore.js';
import { warpHypertetraCore, warpTetrahedral, warpToEdges, warpToCells } from '../../src/geometry/warp/HypertetraCore.js';

const ITERATIONS = 1000;
const VERTEX_COUNT = 1000;

function runBenchmark() {
    console.log(`Running benchmark with ${ITERATIONS} iterations on ${VERTEX_COUNT} vertices...`);

    const vertices = Array.from({ length: VERTEX_COUNT }, () => new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));
    const target = Array.from({ length: VERTEX_COUNT }, () => new Vec4());

    // 1. Benchmark Hypersphere Radial
    console.log('\n--- Hypersphere Radial ---');

    let start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        warpRadial(vertices, 1, 1);
    }
    let end = performance.now();
    const radialAlloc = end - start;
    console.log(`warpRadial (Alloc): ${radialAlloc.toFixed(2)}ms`);

    // 2. Benchmark Hypersphere Stereographic
    console.log('\n--- Hypersphere Stereographic ---');

    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        warpStereographic(vertices, 1, 1);
    }
    end = performance.now();
    const stereoAlloc = end - start;
    console.log(`warpStereographic (Alloc): ${stereoAlloc.toFixed(2)}ms`);

    // 3. Benchmark Hypersphere Hopf
    console.log('\n--- Hypersphere Hopf ---');

    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        warpHopf(vertices, 1, 1);
    }
    end = performance.now();
    const hopfAlloc = end - start;
    console.log(`warpHopf (Alloc): ${hopfAlloc.toFixed(2)}ms`);

    // 4. Benchmark Hypertetra Tetrahedral
    console.log('\n--- Hypertetra Tetrahedral ---');

    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        warpTetrahedral(vertices, 1, 1);
    }
    end = performance.now();
    const tetraAlloc = end - start;
    console.log(`warpTetrahedral (Alloc): ${tetraAlloc.toFixed(2)}ms`);

    // 5. Benchmark Hypertetra To Edges
    console.log('\n--- Hypertetra To Edges ---');

    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        warpToEdges(vertices, 1, 0.5);
    }
    end = performance.now();
    const edgesAlloc = end - start;
    console.log(`warpToEdges (Alloc): ${edgesAlloc.toFixed(2)}ms`);

    // 6. Benchmark Hypertetra To Cells
    console.log('\n--- Hypertetra To Cells ---');

    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        warpToCells(vertices, 1, 0.7);
    }
    end = performance.now();
    const cellsAlloc = end - start;
    console.log(`warpToCells (Alloc): ${cellsAlloc.toFixed(2)}ms`);

}

runBenchmark();
