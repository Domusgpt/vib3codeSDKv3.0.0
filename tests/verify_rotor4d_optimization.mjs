import { Rotor4D } from '../src/math/Rotor4D.js';
import { Vec4 } from '../src/math/Vec4.js';

console.log("Testing rotateArray...");
const r = Rotor4D.fromEuler6({ xy: Math.PI / 2 }); // 90 degree rotation in XY

// Test 1: Evenly divisible by 4
const input1 = new Float32Array([1, 0, 0, 0,  0, 1, 0, 0]);
const output1 = r.rotateArray(input1);
const expected1 = new Float32Array([0, 1, 0, 0,  -1, 0, 0, 0]);

let passed1 = true;
for(let i=0; i<output1.length; i++) {
    if (Math.abs(output1[i] - expected1[i]) > 1e-5) passed1 = false;
}
console.log(`Test 1 (length=8): ${passed1 ? 'PASSED' : 'FAILED'}`);

// Test 2: Not evenly divisible by 4
const input2 = new Float32Array([1, 0, 0, 0,  0, 1, 0, 0,  99, 100]);
const output2 = r.rotateArray(input2);
const expected2 = new Float32Array([0, 1, 0, 0,  -1, 0, 0, 0,  99, 100]);

let passed2 = true;
for(let i=0; i<output2.length; i++) {
    if (Math.abs(output2[i] - expected2[i]) > 1e-5) passed2 = false;
}
console.log(`Test 2 (length=10): ${passed2 ? 'PASSED' : 'FAILED'}`);

// Benchmark
const count = 10000;
const largeInput = new Float32Array(count * 4);
for(let i=0; i<largeInput.length; i++) largeInput[i] = Math.random();

const startSlow = performance.now();
const slowOutput = new Float32Array(largeInput.length);
for(let i=0; i<count; i++) {
    const v = new Vec4(largeInput[i*4], largeInput[i*4+1], largeInput[i*4+2], largeInput[i*4+3]);
    const rotated = r.rotate(v);
    slowOutput[i*4] = rotated.x;
    slowOutput[i*4+1] = rotated.y;
    slowOutput[i*4+2] = rotated.z;
    slowOutput[i*4+3] = rotated.w;
}
const endSlow = performance.now();

const startFast = performance.now();
const fastOutput = r.rotateArray(largeInput);
const endFast = performance.now();

console.log(`Slow rotation: ${(endSlow - startSlow).toFixed(2)}ms`);
console.log(`Fast rotateArray: ${(endFast - startFast).toFixed(2)}ms`);
