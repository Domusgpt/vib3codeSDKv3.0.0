import { describe, expect, it } from 'vitest';
import Projection from '../math/Projection.js';
import Vec4 from '../math/Vec4.js';

describe('Projection Class', () => {
    it('should project using perspective', () => {
        const v = new Vec4(1, 1, 1, 0);
        const p = Projection.perspective(v, 2);
        expect(p.x).toBeCloseTo(0.5);
        expect(p.y).toBeCloseTo(0.5);
        expect(p.z).toBeCloseTo(0.5);
        expect(p.w).toBe(0);
    });

    it('should support target vector in perspective', () => {
        const v = new Vec4(1, 1, 1, 0);
        const target = new Vec4();
        const result = Projection.perspective(v, 2, {}, target);
        expect(result).toBe(target);
        expect(target.x).toBeCloseTo(0.5);
    });

    it('should project array using perspectiveArray', () => {
        const vectors = [new Vec4(1, 1, 1, 0), new Vec4(2, 2, 2, 0)];
        const result = Projection.perspectiveArray(vectors, 2);
        expect(result.length).toBe(2);
        expect(result[0].x).toBeCloseTo(0.5);
        expect(result[1].x).toBeCloseTo(1.0);
    });

    it('should reuse target array in perspectiveArray', () => {
        const vectors = [new Vec4(1, 1, 1, 0)];
        const targetArray = [new Vec4()];
        const result = Projection.perspectiveArray(vectors, 2, {}, targetArray);
        expect(result).toBe(targetArray);
        expect(targetArray[0].x).toBeCloseTo(0.5);
    });
});
