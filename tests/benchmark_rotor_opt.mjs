
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

// Simulation of proposed optimization:
// Pre-compute matrix once, then loop over raw array
const startOpt = performance.now();
const resultOpt = new Float32Array(COUNT * 4);

// Pre-compute matrix coefficients (inlined from toMatrix)
// Normalize first for numerical stability
const n = rotor.norm();
const invN = n > 1e-10 ? 1 / n : 1;

const s = rotor.s * invN;
const xy = rotor.xy * invN;
const xz = rotor.xz * invN;
const yz = rotor.yz * invN;
const xw = rotor.xw * invN;
const yw = rotor.yw * invN;
const zw = rotor.zw * invN;
const xyzw = rotor.xyzw * invN;

// Squared terms
const s2 = s * s;
const xy2 = xy * xy;
const xz2 = xz * xz;
const yz2 = yz * yz;
const xw2 = xw * xw;
const yw2 = yw * yw;
const zw2 = zw * zw;
const xyzw2 = xyzw * xyzw;

// Cross terms
const sxy = 2 * s * xy;
const sxz = 2 * s * xz;
const syz = 2 * s * yz;
const sxw = 2 * s * xw;
const syw = 2 * s * yw;
const szw = 2 * s * zw;

const xzyz = 2 * xz * yz;
const xyyz = 2 * xy * yz;
const xyxz = 2 * xy * xz;
const xyxw = 2 * xy * xw;
const xyyw = 2 * xy * yw;

const xzxw = 2 * xz * xw;
const xzyw = 2 * xz * yw;
const xzzw = 2 * xz * zw;

const yzxw = 2 * yz * xw;
const yzyw = 2 * yz * yw;
const yzzw = 2 * yz * zw;

const xwyw = 2 * xw * yw;
const xwzw = 2 * xw * zw;
const ywzw = 2 * yw * zw;

const xyxyzw = 2 * xy * xyzw;
const xzxyzw = 2 * xz * xyzw;
const yzxyzw = 2 * yz * xyzw;
const xwxyzw = 2 * xw * xyzw;
const ywxyzw = 2 * yw * xyzw;
const zwxyzw = 2 * zw * xyzw;

// Column 0
const m0  = s2 - xy2 - xz2 + yz2 - xw2 + yw2 + zw2 - xyzw2;
const m1  = sxy + xzyz + xwyw - zwxyzw;
const m2  = sxz - xyyz + xwzw + ywxyzw;
const m3  = sxw - xyyw - xzzw - yzxyzw;
// Column 1
const m4  = -sxy + xzyz + xwyw + zwxyzw;
const m5  = s2 - xy2 + xz2 - yz2 + xw2 - yw2 + zw2 - xyzw2;
const m6  = syz + xyxz + ywzw - xwxyzw;
const m7  = syw + xyxw - yzzw + xzxyzw;
// Column 2
const m8  = -sxz - xyyz + xwzw - ywxyzw;
const m9  = -syz + xyxz + ywzw + xwxyzw;
const m10 = s2 + xy2 - xz2 - yz2 + xw2 + yw2 - zw2 - xyzw2;
const m11 = szw + xzxw + yzyw - xyxyzw;
// Column 3
const m12 = -sxw - xyyw - xzzw + yzxyzw;
const m13 = -syw + xyxw - yzzw - xzxyzw;
const m14 = -szw + xzxw + yzyw + xyxyzw;
const m15 = s2 + xy2 + xz2 + yz2 - xw2 - yw2 - zw2 - xyzw2;

for (let i = 0; i < COUNT; i++) {
    const idx = i * 4;
    const x = packed[idx];
    const y = packed[idx+1];
    const z = packed[idx+2];
    const w = packed[idx+3];

    resultOpt[idx]   = m0 * x + m4 * y + m8  * z + m12 * w;
    resultOpt[idx+1] = m1 * x + m5 * y + m9  * z + m13 * w;
    resultOpt[idx+2] = m2 * x + m6 * y + m10 * z + m14 * w;
    resultOpt[idx+3] = m3 * x + m7 * y + m11 * z + m15 * w;
}

const endOpt = performance.now();
const durationOpt = endOpt - startOpt;

console.log(`Optimized (pre-calc matrix + array loop): ${durationOpt.toFixed(2)}ms`);
console.log(`Speedup: ${(durationBase / durationOpt).toFixed(2)}x`);

// Check correctness
const eps = 1e-5;
for (let i = 0; i < 10; i++) { // check first few
   if (Math.abs(resultBase[i] - resultOpt[i]) > eps) {
       console.error(`Mismatch at index ${i}: Base=${resultBase[i]}, Opt=${resultOpt[i]}`);
   }
}
