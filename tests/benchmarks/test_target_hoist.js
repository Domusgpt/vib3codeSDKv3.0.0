import { Vec4 } from '../../src/math/Vec4.js';
import { getPentatopeVertices, getPentatopeCells } from '../../src/geometry/warp/HypertetraCore.js';

function warpToCellsFastFast(vertices, size = 1, cellInfluence = 0.7, target = null) {
    const pentatopeVerts = getPentatopeVertices(size);
    const cells = getPentatopeCells();

    // Precompute cell centers!
    const cellCenters = cells.map(cellIndices => {
        const cv = cellIndices.map(i => pentatopeVerts[i]);
        return new Vec4(
            (cv[0].x + cv[1].x + cv[2].x + cv[3].x) / 4,
            (cv[0].y + cv[1].y + cv[2].y + cv[3].y) / 4,
            (cv[0].z + cv[1].z + cv[2].z + cv[3].z) / 4,
            (cv[0].w + cv[1].w + cv[2].w + cv[3].w) / 4
        );
    });

    const result = target || new Array(vertices.length);
    if (result.length > vertices.length) result.length = vertices.length;

    const toCenterDir = new Vec4();
    const adjustment = new Vec4();

    for (let i = 0; i < vertices.length; i++) {
        const v = vertices[i];
        let nearestDist = Infinity;
        let nearestCell = 0;

        for (let c = 0; c < cells.length; c++) {
            const dist = v.distanceTo(cellCenters[c]);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestCell = c;
            }
        }

        const center = cellCenters[nearestCell];
        center.sub(v, toCenterDir).normalize(toCenterDir);
        const distToCenter = v.distanceTo(center);
        const targetDist = size * 0.5;

        if (distToCenter > targetDist) {
            toCenterDir.scale((distToCenter - targetDist) * cellInfluence, adjustment);
            const resVec = result[i] || (result[i] = new Vec4());
            v.add(adjustment, resVec);
        } else {
            const resVec = result[i] || (result[i] = new Vec4());
            resVec.copy(v);
        }
    }
    return result;
}

const ITERATIONS = 1000;
const VERTEX_COUNT = 1000;
const vertices = Array.from({ length: VERTEX_COUNT }, () => new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));
const target = Array.from({ length: VERTEX_COUNT }, () => new Vec4());

let start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    warpToCellsFastFast(vertices, 1, 0.7, target);
}
let end = performance.now();
console.log(`warpToCellsFastFast: ${(end - start).toFixed(2)}ms`);
