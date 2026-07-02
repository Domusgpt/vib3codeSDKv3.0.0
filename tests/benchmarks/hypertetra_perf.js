import { warpHypertetraCore, generatePentatope } from '../../src/geometry/warp/HypertetraCore.js';
import { Vec4 } from '../../src/math/Vec4.js';

// Create a dummy geometry with a decent number of vertices
const vertices = [];
for(let i=0; i<1000; i++) {
    vertices.push(new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));
}
const geometry = { name: 'test', vertices, vertexCount: vertices.length };

const iters = 100;
const start = performance.now();
for(let i=0; i<iters; i++) {
    warpHypertetraCore(geometry, { method: 'cells', size: 1, blend: 0.8 });
}
const end = performance.now();
console.log(`Original warpToCells: ${end - start} ms`);
