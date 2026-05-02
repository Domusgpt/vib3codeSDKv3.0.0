import { Vec4 } from '../../src/math/Vec4.js';
import { stereographicToHypersphere, hopfFibration, projectToHypersphere } from '../../src/geometry/warp/HypersphereCore.js';

function warpHypersphereCoreFast(geometry, options = {}) {
    const {
        method = 'radial',
        radius = 1,
        blend = 1,
        scale = 1,
        twist = 1,
        target = null
    } = options;

    const vertices = geometry.vertices;
    const warpedVertices = target || new Array(vertices.length);
    if (warpedVertices.length > vertices.length) warpedVertices.length = vertices.length;

    const temp = new Vec4();

    for (let i = 0; i < vertices.length; i++) {
        const v = vertices[i];
        const result = warpedVertices[i] || (warpedVertices[i] = new Vec4());
        v.scale(scale, result);

        if (method === 'stereographic') {
            stereographicToHypersphere(result, radius, result);
        } else if (method === 'hopf') {
            const r = result.length();
            if (r < 0.0001) {
                result.set(0, 0, 0, radius);
            } else {
                const theta = Math.acos(result.z / r);
                const phi = Math.atan2(result.y, result.x);
                const psi = result.w * twist + phi * 0.5;
                hopfFibration(theta, phi, psi, radius, result);
            }
        } else {
            // Radial (default)
            projectToHypersphere(result, radius, temp);
            result.lerp(temp, blend, result);
        }
    }

    return {
        ...geometry,
        name: `${geometry.name}_hypersphere`,
        vertices: warpedVertices,
        vertexCount: warpedVertices.length,
        coreType: 'hypersphere',
        warpMethod: method,
        warpRadius: radius
    };
}

const ITERATIONS = 1000;
const VERTEX_COUNT = 1000;
const vertices = Array.from({ length: VERTEX_COUNT }, () => new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));
const geometry = { vertices, name: 'test' };
const target = Array.from({ length: VERTEX_COUNT }, () => new Vec4());

let start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    warpHypersphereCoreFast(geometry, { method: 'radial', target });
}
let end = performance.now();
console.log(`warpHypersphereCoreFast (radial): ${(end - start).toFixed(2)}ms`);

start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    warpHypersphereCoreFast(geometry, { method: 'stereographic', target });
}
end = performance.now();
console.log(`warpHypersphereCoreFast (stereographic): ${(end - start).toFixed(2)}ms`);

start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    warpHypersphereCoreFast(geometry, { method: 'hopf', target });
}
end = performance.now();
console.log(`warpHypersphereCoreFast (hopf): ${(end - start).toFixed(2)}ms`);
