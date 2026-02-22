
import { Vec4 } from '../src/math/Vec4.js';
import { describe, it, expect } from 'vitest';

describe('Vec4 Optimization', () => {
    it('projectOrthographic uses target vector if provided', () => {
        const v = new Vec4(1, 2, 3, 4);
        const target = new Vec4(0, 0, 0, 0);
        const result = v.projectOrthographic(target);

        expect(result).toBe(target);
        expect(result.x).toBe(1);
        expect(result.y).toBe(2);
        expect(result.z).toBe(3);
        expect(result.w).toBe(0);

        // Ensure original vector is untouched
        expect(v.w).toBe(4);
    });
});
