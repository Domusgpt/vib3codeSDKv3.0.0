import { warpToCells, getPentatopeVertices, getPentatopeCells } from '../../src/geometry/warp/HypertetraCore.js';
import { Vec4 } from '../../src/math/Vec4.js';

const vertices = Array.from({ length: 1000 }, () => new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));
const size = 1;
const cellInfluence = 0.7;

const startOriginal = performance.now();
for (let i = 0; i < 100; i++) {
    warpToCells(vertices, size, cellInfluence);
}
const endOriginal = performance.now();
console.log(`Original: ${endOriginal - startOriginal} ms`);

// Optimized version
function optimizedWarpToCells(vertices, size = 1, cellInfluence = 0.7) {
    const pentatopeVerts = getPentatopeVertices(size);
    const cells = getPentatopeCells();

    // Precompute cell centers
    const cellCenters = [];
    for (let c = 0; c < cells.length; c++) {
        const c0 = pentatopeVerts[cells[c][0]];
        const c1 = pentatopeVerts[cells[c][1]];
        const c2 = pentatopeVerts[cells[c][2]];
        const c3 = pentatopeVerts[cells[c][3]];
        cellCenters.push(new Vec4(
            (c0.x + c1.x + c2.x + c3.x) / 4,
            (c0.y + c1.y + c2.y + c3.y) / 4,
            (c0.z + c1.z + c2.z + c3.z) / 4,
            (c0.w + c1.w + c2.w + c3.w) / 4
        ));
    }

    const result = new Array(vertices.length);
    for (let i = 0; i < vertices.length; i++) {
        const v = vertices[i];

        let nearestDistSq = Infinity;
        let nearestCellIdx = 0;

        for (let c = 0; c < cellCenters.length; c++) {
            const distSq = v.distanceToSquared(cellCenters[c]);
            if (distSq < nearestDistSq) {
                nearestDistSq = distSq;
                nearestCellIdx = c;
            }
        }

        const center = cellCenters[nearestCellIdx];
        const distToCenterSq = nearestDistSq;
        const targetDistSq = (size * 0.5) * (size * 0.5);

        if (distToCenterSq > targetDistSq) {
            const distToCenter = Math.sqrt(distToCenterSq);
            const targetDist = size * 0.5;

            // v + toCenterDir * ((distToCenter - targetDist) * cellInfluence)
            const factor = ((distToCenter - targetDist) * cellInfluence) / distToCenter;
            result[i] = new Vec4(
                v.x + (center.x - v.x) * factor,
                v.y + (center.y - v.y) * factor,
                v.z + (center.z - v.z) * factor,
                v.w + (center.w - v.w) * factor
            );
        } else {
            result[i] = v; // Or clone it? The original returns v directly if inside
        }
    }
    return result;
}

const startOpt = performance.now();
for (let i = 0; i < 100; i++) {
    optimizedWarpToCells(vertices, size, cellInfluence);
}
const endOpt = performance.now();
console.log(`Optimized: ${endOpt - startOpt} ms`);
