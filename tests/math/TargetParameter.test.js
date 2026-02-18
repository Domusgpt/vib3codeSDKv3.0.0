
import { describe, it, expect } from 'vitest';
import { Mat4x4 } from '../../src/math/Mat4x4.js';
import { Vec4 } from '../../src/math/Vec4.js';

describe('Mat4x4 Optimization Features', () => {
    describe('Target Parameter Support', () => {
        it('multiply uses target', () => {
            const m1 = Mat4x4.identity();
            const m2 = Mat4x4.identity();
            const target = new Mat4x4();
            const result = m1.multiply(m2, target);
            expect(result).toBe(target);
            expect(result.isIdentity()).toBe(true);
        });

        it('multiply handles aliasing correctly', () => {
            const m1 = Mat4x4.identity().scale(2); // Uniform scale 2
            const result = m1.multiply(m1, m1); // Square in place
            expect(result).toBe(m1);
            expect(result.data[0]).toBe(4); // 2 * 2 = 4
        });

        it('multiplyVec4 uses target', () => {
            const m = Mat4x4.identity();
            const v = new Vec4(1, 2, 3, 4);
            const target = new Vec4();
            const result = m.multiplyVec4(v, target);
            expect(result).toBe(target);
            expect(result.equals(v)).toBe(true);
        });

        it('multiplyVec4 handles aliasing correctly', () => {
            const m = Mat4x4.uniformScale(2);
            const v = new Vec4(1, 2, 3, 4);
            const result = m.multiplyVec4(v, v);
            expect(result).toBe(v);
            expect(result.x).toBe(2);
            expect(result.y).toBe(4);
            expect(result.z).toBe(6);
            expect(result.w).toBe(8);
        });

        it('inverse uses target', () => {
            const m = Mat4x4.identity();
            const target = new Mat4x4();
            const result = m.inverse(target);
            expect(result).toBe(target);
            expect(result.isIdentity()).toBe(true);
        });
    });

    describe('Cached Constants', () => {
        it('Mat4x4.IDENTITY is cached and frozen', () => {
            const id1 = Mat4x4.IDENTITY;
            const id2 = Mat4x4.IDENTITY;
            expect(id1).toBe(id2);
            expect(Object.isFrozen(id1)).toBe(true);
            // Cannot guarantee typed array freezing across envs
        });

        it('Mat4x4.ZERO is cached and frozen', () => {
            const z1 = Mat4x4.ZERO;
            const z2 = Mat4x4.ZERO;
            expect(z1).toBe(z2);
            expect(Object.isFrozen(z1)).toBe(true);
        });
    });
});

describe('Vec4 Optimization Features', () => {
    describe('Target Parameter Support', () => {
        it('add uses target', () => {
            const v1 = new Vec4(1, 1, 1, 1);
            const v2 = new Vec4(2, 2, 2, 2);
            const target = new Vec4();
            const result = v1.add(v2, target);
            expect(result).toBe(target);
            expect(result.x).toBe(3);
        });

        it('normalize uses target', () => {
            const v = new Vec4(2, 0, 0, 0);
            const target = new Vec4();
            const result = v.normalize(target);
            expect(result).toBe(target);
            expect(result.x).toBe(1);
        });
    });
});
