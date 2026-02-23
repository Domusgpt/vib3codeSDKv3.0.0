
import assert from 'assert';
import Mat4x4 from '../src/math/Mat4x4.js';

console.log('Verifying Mat4x4 optimizations...');

// 1. Identity Allocation Check
console.log('Test: Identity Matrix');
const m1 = Mat4x4.identity();
assert.strictEqual(m1.data[0], 1, 'm[0] should be 1');
assert.strictEqual(m1.data[5], 1, 'm[5] should be 1');
assert.strictEqual(m1.data[10], 1, 'm[10] should be 1');
assert.strictEqual(m1.data[15], 1, 'm[15] should be 1');
assert.strictEqual(m1.data[1], 0, 'm[1] should be 0');

// 2. Static Multiply (Zero Allocation Logic)
console.log('Test: Static Multiply');
const a = Mat4x4.identity();
const b = Mat4x4.identity();
const out = new Mat4x4();

// Fill b with translation (tx=10, ty=20, tz=30)
b.data[12] = 10;
b.data[13] = 20;
b.data[14] = 30;

Mat4x4.multiply(out, a, b);

// Verify result matches b (since a is identity)
assert.strictEqual(out.data[12], 10, 'Translation X should be 10');
assert.strictEqual(out.data[13], 20, 'Translation Y should be 20');
assert.strictEqual(out.data[14], 30, 'Translation Z should be 30');

// 3. Rotation Output
console.log('Test: Rotation XY Out');
const rotOut = new Mat4x4();
Mat4x4.rotationXYOut(rotOut, Math.PI / 2); // 90 degrees

// cos(90) = 0, sin(90) = 1
const epsilon = 1e-6;
assert(Math.abs(rotOut.data[0]) < epsilon, 'cos(90) ~ 0'); // c
assert(Math.abs(rotOut.data[4] + 1) < epsilon, '-sin(90) ~ -1'); // -s
assert(Math.abs(rotOut.data[1] - 1) < epsilon, 'sin(90) ~ 1'); // s
assert(Math.abs(rotOut.data[5]) < epsilon, 'cos(90) ~ 0'); // c

console.log('✅ Mat4x4 Optimizations Verified!');
