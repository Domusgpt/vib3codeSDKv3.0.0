
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

// Baseline: Loop and rotate individually
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

// Actual rotateArray method
const startOpt = performance.now();
const resultOpt = rotor.rotateArray(packed);
const endOpt = performance.now();
const durationOpt = endOpt - startOpt;

console.log(`Optimized (rotateArray): ${durationOpt.toFixed(2)}ms`);
console.log(`Speedup: ${(durationBase / durationOpt).toFixed(2)}x`);

// Check correctness
const eps = 1e-5;
let mismatchCount = 0;
for (let i = 0; i < packed.length; i++) {
   if (Math.abs(resultBase[i] - resultOpt[i]) > eps) {
       mismatchCount++;
       if (mismatchCount <= 5) {
           console.error(`Mismatch at index ${i}: Base=${resultBase[i]}, Opt=${resultOpt[i]}`);
       }
   }
}

if (mismatchCount === 0) {
    console.log('✅ verification PASSED');
} else {
    console.log(`❌ verification FAILED with ${mismatchCount} mismatches`);
    process.exit(1);
}
