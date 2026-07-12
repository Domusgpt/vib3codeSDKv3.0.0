import { Vec4 } from '../../src/math/Vec4.js';
import { warpRadial, warpStereographic, warpHopf, warpHypersphereCore } from '../../src/geometry/warp/HypersphereCore.js';

const numVertices = 1000;
const vertices = [];
for (let i = 0; i < numVertices; i++) {
    vertices.push(new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));
}

const start = performance.now();
for (let i = 0; i < 100; i++) {
    warpRadial(vertices, 1, 1);
}
console.log(`Original warpRadial: ${performance.now() - start} ms`);
