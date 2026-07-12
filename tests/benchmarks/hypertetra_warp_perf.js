import { Vec4 } from '../../src/math/Vec4.js';
import { warpToCells, warpToEdges } from '../../src/geometry/warp/HypertetraCore.js';

// Setup mock vertices
const numVertices = 1000;
const vertices = [];
for (let i = 0; i < numVertices; i++) {
    vertices.push(new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));
}

const startCells = performance.now();
for (let i = 0; i < 100; i++) {
    warpToCells(vertices, 1, 0.7);
}
const endCells = performance.now();
console.log(`Original warpToCells: ${endCells - startCells} ms`);

const startEdges = performance.now();
for (let i = 0; i < 100; i++) {
    warpToEdges(vertices, 1, 0.5);
}
const endEdges = performance.now();
console.log(`Original warpToEdges: ${endEdges - startEdges} ms`);
