
import { generateSphere } from './src/geometry/generators/Sphere.js';

const start = performance.now();
const sphere = generateSphere(1, 24); // density 24 -> ~2300 vertices
const end = performance.now();

console.log(`generateSphere(1, 24) took ${(end - start).toFixed(2)}ms`);
console.log(`Vertex count: ${sphere.vertices.length}`);
console.log(`Edge count: ${sphere.edges.length}`);
