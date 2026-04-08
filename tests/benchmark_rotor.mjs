
import { Rotor4D } from '../src/math/Rotor4D.js';
import { Vec4 } from '../src/math/Vec4.js';

const COUNT = 100_000;
const packed = new Float32Array(COUNT * 4);

// Initialize with random data
for (let i = 0; i < packed.length; i++) {
    packed[i] = Math.random() * 2 - 1;
}

const rotor = Rotor4D.fromPlaneAngle('XW', Math.PI / 4);

console.log(`Benchmarking rotation of ${COUNT} vectors...`);

// Baseline: Loop and rotate individually (mimicking current usage patterns if one were to loop)
const startBase = performance.now();
const resultBase = new Float32Array(COUNT * 4);
const tempV = new Vec4();
const tempOut = new Vec4();

for (let i = 0; i < COUNT; i++) {
    const idx = i * 4;
    tempV.set(packed[idx], packed[idx+1], packed[idx+2], packed[idx+3]);
    rotor.rotate(tempV, tempOut);
    resultBase[idx] = tempOut.x;
    resultBase[idx+1] = tempOut.y;
    resultBase[idx+2] = tempOut.z;
    resultBase[idx+3] = tempOut.w;
}
const endBase = performance.now();
const durationBase = endBase - startBase;

console.log(`Baseline (per-vertex rotate): ${durationBase.toFixed(2)}ms`);

// We expect the optimized version (simulated here) to be much faster
// because we lift the matrix calculation out of the loop.
