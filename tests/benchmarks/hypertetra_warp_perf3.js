import { Vec4 } from '../../src/math/Vec4.js';
import { warpToEdges, getPentatopeVertices, getPentatopeEdges } from '../../src/geometry/warp/HypertetraCore.js';

const numVertices = 1000;
const vertices = [];
for (let i = 0; i < numVertices; i++) {
    vertices.push(new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));
}

let startEdges = performance.now();
for (let i = 0; i < 100; i++) {
    warpToEdges(vertices, 1, 0.5);
}
let endEdges = performance.now();
console.log(`Original warpToEdges: ${endEdges - startEdges} ms`);

function optimizedWarpToEdges(vertices, size = 1, snap = 0.5) {
    const pentatopeVerts = getPentatopeVertices(size);
    const edges = getPentatopeEdges();

    // Precalculate edge vectors and squared lengths
    const edgeData = new Array(edges.length);
    for (let e = 0; e < edges.length; e++) {
        const edgeStart = pentatopeVerts[edges[e][0]];
        const edgeEnd = pentatopeVerts[edges[e][1]];
        const edgeVec = edgeEnd.sub(edgeStart);
        edgeData[e] = {
            start: edgeStart,
            vec: edgeVec,
            lenSq: edgeVec.lengthSquared()
        };
    }

    const result = new Array(vertices.length);
    for (let i = 0; i < vertices.length; i++) {
        const v = vertices[i];
        let nearestDistSq = Infinity;
        let nearestPoint = v;

        for (let e = 0; e < edges.length; e++) {
            const data = edgeData[e];
            const edgeStart = data.start;

            // Inline vector sub
            const toVx = v.x - edgeStart.x;
            const toVy = v.y - edgeStart.y;
            const toVz = v.z - edgeStart.z;
            const toVw = v.w - edgeStart.w;

            // Inline dot product
            let t = (toVx * data.vec.x + toVy * data.vec.y + toVz * data.vec.z + toVw * data.vec.w) / data.lenSq;
            t = Math.max(0, Math.min(1, t));

            // Inline projection calculation
            const projX = edgeStart.x + data.vec.x * t;
            const projY = edgeStart.y + data.vec.y * t;
            const projZ = edgeStart.z + data.vec.z * t;
            const projW = edgeStart.w + data.vec.w * t;

            // Inline distance squared calculation
            const dx = v.x - projX;
            const dy = v.y - projY;
            const dz = v.z - projZ;
            const dw = v.w - projW;
            const distSq = dx * dx + dy * dy + dz * dz + dw * dw;

            if (distSq < nearestDistSq) {
                nearestDistSq = distSq;
                nearestPoint = new Vec4(projX, projY, projZ, projW);
            }
        }

        result[i] = v.lerp(nearestPoint, snap);
    }
    return result;
}

startEdges = performance.now();
for (let i = 0; i < 100; i++) {
    optimizedWarpToEdges(vertices, 1, 0.5);
}
endEdges = performance.now();
console.log(`Optimized warpToEdges: ${endEdges - startEdges} ms`);
