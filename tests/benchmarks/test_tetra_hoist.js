import { Vec4 } from '../../src/math/Vec4.js';
import { getPentatopeVertices, toBarycentricCoords, fromBarycentricCoords } from '../../src/geometry/warp/HypertetraCore.js';

function warpTetrahedralFast(vertices, size = 1, blend = 1, target = null) {
    const pentatopeVerts = getPentatopeVertices(size);

    const result = target || new Array(vertices.length);
    if (result.length > vertices.length) result.length = vertices.length;

    for (let i = 0; i < vertices.length; i++) {
        const v = vertices[i];
        // Get barycentric coordinates
        const bary = toBarycentricCoords(v, pentatopeVerts);

        // Reconstruct from barycentric - this "snaps" toward pentatope structure
        const warped = fromBarycentricCoords(bary, pentatopeVerts);

        const resVec = result[i] || (result[i] = new Vec4());
        v.lerp(warped, blend, resVec);
    }
    return result;
}

const ITERATIONS = 1000;
const VERTEX_COUNT = 1000;
const vertices = Array.from({ length: VERTEX_COUNT }, () => new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));
const target = Array.from({ length: VERTEX_COUNT }, () => new Vec4());

let start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    warpTetrahedralFast(vertices, 1, 1, target);
}
let end = performance.now();
console.log(`warpTetrahedralFast: ${(end - start).toFixed(2)}ms`);
