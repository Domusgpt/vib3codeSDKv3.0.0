/**
 * Hypertetrahedron Core Warp
 *
 * Warps base geometry onto a 4D hypertetrahedron (5-cell/pentatope).
 * Creates geometries 16-23 in the 24-variant encoding system.
 *
 * The 5-cell is the 4D analog of the tetrahedron, with 5 vertices,
 * 10 edges, 10 triangular faces, and 5 tetrahedral cells.
 */

import { Vec4 } from '../../math/Vec4.js';

/**
 * Generate the 5 vertices of a regular pentatope centered at origin
 * @param {number} size - Scale factor
 * @returns {Vec4[]} 5 vertices
 */
export function getPentatopeVertices(size = 1) {
    // Regular 5-cell with vertices on the 3-sphere
    const s = size;
    const a = 1 / Math.sqrt(10);
    const b = 1 / Math.sqrt(6);
    const c = 1 / Math.sqrt(3);
    const d = 1;

    return [
        new Vec4(s * 4 * a, 0, 0, 0),
        new Vec4(-s * a, s * 3 * b, 0, 0),
        new Vec4(-s * a, -s * b, s * 2 * c, 0),
        new Vec4(-s * a, -s * b, -s * c, s * d),
        new Vec4(-s * a, -s * b, -s * c, -s * d)
    ];
}

/**
 * Get the 10 edges of the pentatope
 * @returns {number[][]} Edge pairs
 */
export function getPentatopeEdges() {
    const edges = [];
    for (let i = 0; i < 5; i++) {
        for (let j = i + 1; j < 5; j++) {
            edges.push([i, j]);
        }
    }
    return edges;
}

/**
 * Get the 10 triangular faces of the pentatope
 * @returns {number[][]} Face vertex indices
 */
export function getPentatopeFaces() {
    const faces = [];
    for (let i = 0; i < 5; i++) {
        for (let j = i + 1; j < 5; j++) {
            for (let k = j + 1; k < 5; k++) {
                faces.push([i, j, k]);
            }
        }
    }
    return faces;
}

/**
 * Get the 5 tetrahedral cells of the pentatope
 * @returns {number[][]} Cell vertex indices
 */
export function getPentatopeCells() {
    const cells = [];
    for (let i = 0; i < 5; i++) {
        // Each cell is defined by excluding one vertex
        const cell = [];
        for (let j = 0; j < 5; j++) {
            if (j !== i) cell.push(j);
        }
        cells.push(cell);
    }
    return cells;
}

/**
 * Convert point to barycentric coordinates relative to pentatope
 * @param {Vec4} point - Point in 4D space
 * @param {Vec4[]} pentatopeVerts - The 5 pentatope vertices
 * @returns {number[]} 5 barycentric coordinates
 */
export function toBarycentricCoords(point, pentatopeVerts) {
    // Solve the system Ax = p where A is the 5 pentatope vertices
    // and x are the barycentric weights
    // Using least squares approximation

    const coords = [0, 0, 0, 0, 0];
    let totalDist = 0;

    for (let i = 0; i < 5; i++) {
        const dist = 1 / (point.distanceTo(pentatopeVerts[i]) + 0.0001);
        coords[i] = dist;
        totalDist += dist;
    }

    // Normalize
    for (let i = 0; i < 5; i++) {
        coords[i] /= totalDist;
    }

    return coords;
}

/**
 * Convert barycentric coordinates back to 4D point
 * @param {number[]} coords - 5 barycentric coordinates
 * @param {Vec4[]} pentatopeVerts - The 5 pentatope vertices
 * @returns {Vec4} Point in 4D space
 */
export function fromBarycentricCoords(coords, pentatopeVerts) {
    let x = 0, y = 0, z = 0, w = 0;

    for (let i = 0; i < 5; i++) {
        x += coords[i] * pentatopeVerts[i].x;
        y += coords[i] * pentatopeVerts[i].y;
        z += coords[i] * pentatopeVerts[i].z;
        w += coords[i] * pentatopeVerts[i].w;
    }

    return new Vec4(x, y, z, w);
}

/**
 * Project point onto pentatope surface (nearest face)
 * @param {Vec4} point - Input point
 * @param {Vec4[]} pentatopeVerts - Pentatope vertices
 * @param {number} scale - Scale factor
 * @returns {Vec4} Point on pentatope surface
 */
export function projectToPentatopeSurface(point, pentatopeVerts, scale = 1) {
    // Find the nearest face and project onto it
    const faces = getPentatopeFaces();
    let nearestDist = Infinity;
    let nearestPoint = point;

    for (const face of faces) {
        // Get face center
        const center = new Vec4(
            (pentatopeVerts[face[0]].x + pentatopeVerts[face[1]].x + pentatopeVerts[face[2]].x) / 3,
            (pentatopeVerts[face[0]].y + pentatopeVerts[face[1]].y + pentatopeVerts[face[2]].y) / 3,
            (pentatopeVerts[face[0]].z + pentatopeVerts[face[1]].z + pentatopeVerts[face[2]].z) / 3,
            (pentatopeVerts[face[0]].w + pentatopeVerts[face[1]].w + pentatopeVerts[face[2]].w) / 3
        );

        const dist = point.distanceTo(center);
        if (dist < nearestDist) {
            nearestDist = dist;
            // Project onto the face plane
            const faceNormal = computeFaceNormal(
                pentatopeVerts[face[0]],
                pentatopeVerts[face[1]],
                pentatopeVerts[face[2]]
            );
            const toPoint = point.sub(center);
            const projection = toPoint.sub(faceNormal.scale(toPoint.dot(faceNormal)));
            nearestPoint = center.add(projection);
        }
    }

    return nearestPoint.scale(scale);
}

/**
 * Compute face normal (in 4D, use cross product analog)
 * @param {Vec4} v0
 * @param {Vec4} v1
 * @param {Vec4} v2
 * @returns {Vec4} Normal vector
 */
function computeFaceNormal(v0, v1, v2) {
    const e1 = v1.sub(v0);
    const e2 = v2.sub(v0);

    // In 4D, use a simplified normal computation
    // Take the component orthogonal to both edges
    const n = new Vec4(
        e1.y * e2.z - e1.z * e2.y,
        e1.z * e2.x - e1.x * e2.z,
        e1.x * e2.y - e1.y * e2.x,
        e1.w * (e2.x + e2.y + e2.z) - e2.w * (e1.x + e1.y + e1.z)
    );

    return n.normalize();
}

/**
 * Warp geometry using tetrahedral interpolation
 * Points are mapped based on their proximity to pentatope vertices
 * @param {Vec4[]} vertices - Input vertices
 * @param {number} size - Pentatope size
 * @param {number} blend - Blend factor (0=original, 1=full warp)
 * @returns {Vec4[]} Warped vertices
 */
export function warpTetrahedral(vertices, size = 1, blend = 1) {
    const pentatopeVerts = getPentatopeVertices(size);

    return vertices.map(v => {
        // Get barycentric coordinates
        const bary = toBarycentricCoords(v, pentatopeVerts);

        // Reconstruct from barycentric - this "snaps" toward pentatope structure
        const warped = fromBarycentricCoords(bary, pentatopeVerts);

        return v.lerp(warped, blend);
    });
}

/**
 * Warp geometry by projecting onto pentatope edges
 * Creates wire-frame like structures
 * @param {Vec4[]} vertices - Input vertices
 * @param {number} size - Pentatope size
 * @param {number} snap - How strongly to snap to edges
 * @returns {Vec4[]} Warped vertices
 */
export function warpToEdges(vertices, size = 1, snap = 0.5) {
    const pentatopeVerts = getPentatopeVertices(size);
    const edges = getPentatopeEdges();

    // Hoist edge vector calculations outside the loop
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

/**
 * Warp geometry to lie on pentatope cells (tetrahedral cells)
 * @param {Vec4[]} vertices - Input vertices
 * @param {number} size - Pentatope size
 * @param {number} cellInfluence - How much cells pull points (0-1)
 * @returns {Vec4[]} Warped vertices
 */
export function warpToCells(vertices, size = 1, cellInfluence = 0.7) {
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

/**
 * Main hypertetrahedron core warp function
 * Wraps base geometry in a 4D pentatope structure
 *
 * @param {object} geometry - Base geometry with vertices and edges
 * @param {object} options - Warp options
 * @param {string} options.method - 'tetrahedral', 'edges', 'cells', 'surface'
 * @param {number} options.size - Pentatope size (default 1)
 * @param {number} options.blend - Blend factor (default 1)
 * @param {number} options.snap - Edge snap strength (default 0.5)
 * @returns {object} Warped geometry
 */
export function warpHypertetraCore(geometry, options = {}) {
    const {
        method = 'tetrahedral',
        size = 1,
        blend = 1,
        snap = 0.5
    } = options;

    let warpedVertices;
    const pentatopeVerts = getPentatopeVertices(size);

    switch (method) {
        case 'edges':
            warpedVertices = warpToEdges(geometry.vertices, size, snap);
            break;

        case 'cells':
            warpedVertices = warpToCells(geometry.vertices, size, blend);
            break;

        case 'surface':
            warpedVertices = geometry.vertices.map(v =>
                projectToPentatopeSurface(v, pentatopeVerts, size)
            );
            break;

        case 'tetrahedral':
        default:
            warpedVertices = warpTetrahedral(geometry.vertices, size, blend);
            break;
    }

    return {
        ...geometry,
        name: `${geometry.name}_hypertetra`,
        vertices: warpedVertices,
        vertexCount: warpedVertices.length,
        coreType: 'hypertetrahedron',
        warpMethod: method,
        pentatopeSize: size
    };
}

/**
 * Get a complete pentatope geometry (for reference/debugging)
 * @param {number} size - Scale factor
 * @returns {object} Pentatope geometry
 */
export function generatePentatope(size = 1) {
    return {
        name: 'pentatope',
        vertices: getPentatopeVertices(size),
        edges: getPentatopeEdges(),
        faces: getPentatopeFaces(),
        cells: getPentatopeCells(),
        vertexCount: 5,
        edgeCount: 10,
        faceCount: 10,
        cellCount: 5
    };
}

export default warpHypertetraCore;
