
import { generateHypersphereFibonacci, generateHypersphereEdges } from './src/geometry/generators/Sphere.js';

const density = 24;
const count = density * density * 4;
const radius = 1;

console.log(`Generating ${count} vertices...`);

const startGen = performance.now();
const vertices = generateHypersphereFibonacci(radius, count);
const endGen = performance.now();
console.log(`Vertex generation took ${(endGen - startGen).toFixed(2)}ms`);

const startEdges = performance.now();
const edges = generateHypersphereEdges(vertices, radius * 0.4);
const endEdges = performance.now();
console.log(`Edge generation took ${(endEdges - startEdges).toFixed(2)}ms`);
console.log(`Edge count: ${edges.length}`);
