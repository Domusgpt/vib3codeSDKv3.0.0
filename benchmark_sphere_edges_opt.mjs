
import { generateHypersphereFibonacci } from './src/geometry/generators/Sphere.js';

const density = 24;
const count = density * density * 4;
const radius = 1;
const threshold = radius * 0.4;

console.log(`Generating ${count} vertices...`);
const vertices = generateHypersphereFibonacci(radius, count);

// Original implementation
function generateEdgesOriginal(vertices, threshold) {
    const edges = [];
    for (let i = 0; i < vertices.length; i++) {
        for (let j = i + 1; j < vertices.length; j++) {
            const dist = vertices[i].distanceTo(vertices[j]);
            if (dist < threshold) {
                edges.push([i, j]);
            }
        }
    }
    return edges;
}

// Optimized implementation
function generateEdgesOptimized(vertices, threshold) {
    const edges = [];
    const thresholdSq = threshold * threshold;

    for (let i = 0; i < vertices.length; i++) {
        for (let j = i + 1; j < vertices.length; j++) {
            const distSq = vertices[i].distanceToSquared(vertices[j]);
            if (distSq < thresholdSq) {
                edges.push([i, j]);
            }
        }
    }
    return edges;
}

console.log('Running original...');
const startOrig = performance.now();
const edgesOrig = generateEdgesOriginal(vertices, threshold);
const endOrig = performance.now();
console.log(`Original took ${(endOrig - startOrig).toFixed(2)}ms`);

console.log('Running optimized...');
const startOpt = performance.now();
const edgesOpt = generateEdgesOptimized(vertices, threshold);
const endOpt = performance.now();
console.log(`Optimized took ${(endOpt - startOpt).toFixed(2)}ms`);

console.log(`Edges count: ${edgesOrig.length} (Original) vs ${edgesOpt.length} (Optimized)`);
if (edgesOrig.length !== edgesOpt.length) {
    console.error('Mismatch in edge count!');
}
