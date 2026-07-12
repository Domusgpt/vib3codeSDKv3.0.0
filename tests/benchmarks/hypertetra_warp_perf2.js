import { Vec4 } from '../../src/math/Vec4.js';
import { warpToCells, getPentatopeVertices, getPentatopeCells } from '../../src/geometry/warp/HypertetraCore.js';

const numVertices = 1000;
const vertices = [];
for (let i = 0; i < numVertices; i++) {
    vertices.push(new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));
}

let startCells = performance.now();
for (let i = 0; i < 100; i++) {
    warpToCells(vertices, 1, 0.7);
}
let endCells = performance.now();
console.log(`Original warpToCells: ${endCells - startCells} ms`);

function optimizedWarpToCells(vertices, size = 1, cellInfluence = 0.7) {
    const pentatopeVerts = getPentatopeVertices(size);
    const cells = getPentatopeCells();

    // Precompute cell centers to hoist invariant calculations
    const cellCenters = new Array(cells.length);
    for (let c = 0; c < cells.length; c++) {
        const c0 = pentatopeVerts[cells[c][0]];
        const c1 = pentatopeVerts[cells[c][1]];
        const c2 = pentatopeVerts[cells[c][2]];
        const c3 = pentatopeVerts[cells[c][3]];
        cellCenters[c] = new Vec4(
            (c0.x + c1.x + c2.x + c3.x) / 4,
            (c0.y + c1.y + c2.y + c3.y) / 4,
            (c0.z + c1.z + c2.z + c3.z) / 4,
            (c0.w + c1.w + c2.w + c3.w) / 4
        );
    }

    const targetDist = size * 0.5;
    const result = new Array(vertices.length);

    for (let i = 0; i < vertices.length; i++) {
        const v = vertices[i];
        let nearestDistSq = Infinity;
        let nearestCellIdx = 0;

        for (let c = 0; c < cells.length; c++) {
            const distSq = v.distanceToSquared(cellCenters[c]);
            if (distSq < nearestDistSq) {
                nearestDistSq = distSq;
                nearestCellIdx = c;
            }
        }

        const center = cellCenters[nearestCellIdx];
        const distToCenter = Math.sqrt(nearestDistSq);

        if (distToCenter > targetDist) {
            const adjustmentMag = (distToCenter - targetDist) * cellInfluence;
            if (distToCenter > 0.0001) {
                const scale = adjustmentMag / distToCenter;
                result[i] = new Vec4(
                    v.x + (center.x - v.x) * scale,
                    v.y + (center.y - v.y) * scale,
                    v.z + (center.z - v.z) * scale,
                    v.w + (center.w - v.w) * scale
                );
            } else {
                result[i] = v;
            }
        } else {
            result[i] = v;
        }
    }
    return result;
}

startCells = performance.now();
for (let i = 0; i < 100; i++) {
    optimizedWarpToCells(vertices, 1, 0.7);
}
endCells = performance.now();
console.log(`Optimized warpToCells: ${endCells - startCells} ms`);
