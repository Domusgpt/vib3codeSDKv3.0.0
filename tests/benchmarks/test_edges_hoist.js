import { Vec4 } from '../../src/math/Vec4.js';
import { getPentatopeVertices, getPentatopeEdges } from '../../src/geometry/warp/HypertetraCore.js';

function warpToEdgesFast(vertices, size = 1, snap = 0.5, target = null) {
    const pentatopeVerts = getPentatopeVertices(size);
    const edges = getPentatopeEdges();

    // Precompute edge vectors and lengths
    const edgeData = edges.map(([i, j]) => {
        const start = pentatopeVerts[i];
        const end = pentatopeVerts[j];
        const vec = end.sub(start);
        const lenSq = vec.lengthSquared();
        return { start, vec, lenSq };
    });

    const result = target || new Array(vertices.length);
    if (result.length > vertices.length) result.length = vertices.length;

    const toV = new Vec4();
    const projection = new Vec4();

    for (let i = 0; i < vertices.length; i++) {
        const v = vertices[i];
        let nearestDistSq = Infinity;
        let nearestPoint = new Vec4();

        for (let e = 0; e < edgeData.length; e++) {
            const edge = edgeData[e];

            // Project v onto edge
            v.sub(edge.start, toV);
            let t = toV.dot(edge.vec) / edge.lenSq;
            t = Math.max(0, Math.min(1, t));

            edge.vec.scale(t, projection);
            edge.start.add(projection, projection);

            const distSq = v.distanceToSquared(projection);

            if (distSq < nearestDistSq) {
                nearestDistSq = distSq;
                nearestPoint.copy(projection);
            }
        }

        const resVec = result[i] || (result[i] = new Vec4());
        v.lerp(nearestPoint, snap, resVec);
    }
    return result;
}

const ITERATIONS = 1000;
const VERTEX_COUNT = 1000;
const vertices = Array.from({ length: VERTEX_COUNT }, () => new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));
const target = Array.from({ length: VERTEX_COUNT }, () => new Vec4());

let start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    warpToEdgesFast(vertices, 1, 0.5, target);
}
let end = performance.now();
console.log(`warpToEdgesFast: ${(end - start).toFixed(2)}ms`);
