
import { Mat4x4 } from '../src/math/Mat4x4.js';

console.log('--- Verifying Mat4x4 Fixes ---');

function assert(condition, message) {
    if (!condition) {
        console.error('FAIL:', message);
        process.exit(1);
    } else {
        console.log('PASS:', message);
    }
}

// 1. Verify object signature
const m1 = Mat4x4.rotationFromAngles({ xy: 0.1 });
assert(Math.abs(m1.data[0] - Math.cos(0.1)) < 1e-6, 'rotationFromAngles(obj) works');

// 2. Verify 6-arg signature (UnifiedMath style)
const m2 = Mat4x4.rotationFromAngles(0.1, 0, 0, 0, 0, 0);
assert(!m2.isIdentity(), 'rotationFromAngles(6 args) is NOT identity');
assert(Math.abs(m2.data[0] - Math.cos(0.1)) < 1e-6, 'rotationFromAngles(6 args) works');

// 3. Verify target reuse with object
const t1 = new Mat4x4();
const m3 = Mat4x4.rotationFromAngles({ xy: 0.1 }, t1);
assert(m3 === t1, 'rotationFromAngles(obj, target) reuses target');
assert(Math.abs(t1.data[0] - Math.cos(0.1)) < 1e-6, 'rotationFromAngles(obj, target) result correct');

// 4. Verify target reuse with 6 args
const t2 = new Mat4x4();
const m4 = Mat4x4.rotationFromAngles(0.1, 0, 0, 0, 0, 0, t2);
assert(m4 === t2, 'rotationFromAngles(6 args, target) reuses target');
assert(Math.abs(t2.data[0] - Math.cos(0.1)) < 1e-6, 'rotationFromAngles(6 args, target) result correct');

// 5. Verify static creator target reuse
const t3 = new Mat4x4();
// Fill with garbage to ensure it clears it
t3.data.fill(999);
const m5 = Mat4x4.rotationXY(0.1, t3);
assert(m5 === t3, 'rotationXY(angle, target) reuses target');
assert(Math.abs(t3.data[0] - Math.cos(0.1)) < 1e-6, 'rotationXY result correct');
assert(t3.data[2] === 0, 'rotationXY cleared garbage (index 2)');
assert(t3.data[12] === 0, 'rotationXY cleared garbage (index 12)');

// 6. Verify 6-arg signature with mixed args
const m6 = Mat4x4.rotationFromAngles(0.1, 0.2, 0, 0, 0, 0);
// Check if rotation matches combination
// rotationFromAngles implementation: result.rotateXY(xy).rotateXZ(xz)...
// Mat4x4.rotateXY is in-place and effectively post-multiplies by rotation matrix?
// Let's check rotateXY implementation:
// m[i] = a0*c + a1*s;
// This transforms columns. R_new = R_old * Rot.
// So order is: I * RotXY * RotXZ * ...
const ref = Mat4x4.rotationXY(0.1).multiplyInPlace(Mat4x4.rotationXZ(0.2));
assert(m6.equals(ref), 'rotationFromAngles matches composed rotations');

console.log('All tests passed!');
