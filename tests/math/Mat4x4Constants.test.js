
import { describe, it, expect } from 'vitest';
import { Mat4x4 } from '../../src/math/Mat4x4.js';

describe('Mat4x4 Optimization Features', () => {
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

    describe('In-Place Rotations', () => {
         // Basic smoke test to ensure new methods are present and work
         it('rotateXY exists and modifies matrix', () => {
            const m = Mat4x4.identity();
            const original = m.clone();
            m.rotateXY(Math.PI / 4);
            expect(m.equals(original)).toBe(false);
         });
    });
});
