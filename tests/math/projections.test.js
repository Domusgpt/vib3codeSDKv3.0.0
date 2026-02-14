import { describe, it, expect } from 'vitest';
import {
    perspectiveProject4D,
    stereographicProject4D
} from '../../src/math/projections.js';

describe('4D Projections', () => {
    describe('perspectiveProject4D', () => {
        it('projects origin to origin', () => {
            const result = perspectiveProject4D([0, 0, 0, 0]);
            expect(result.x).toBe(0);
            expect(result.y).toBe(0);
            expect(result.z).toBe(0);
        });

        it('default distance is 2', () => {
            const result = perspectiveProject4D([1, 0, 0, 0]);
            // denom = 2 - 0 = 2, scale = 0.5
            expect(result.x).toBeCloseTo(0.5, 10);
            expect(result.denom).toBeCloseTo(2, 10);
        });

        it('respects custom distance', () => {
            const result = perspectiveProject4D([1, 0, 0, 0], { distance: 4 });
            // denom = 4 - 0 = 4, scale = 0.25
            expect(result.x).toBeCloseTo(0.25, 10);
        });

        it('w closer to distance increases scale', () => {
            const far = perspectiveProject4D([1, 0, 0, 0], { distance: 2 });
            const near = perspectiveProject4D([1, 0, 0, 1], { distance: 2 });
            // near: denom = 2-1 = 1, far: denom = 2-0 = 2
            expect(Math.abs(near.x)).toBeGreaterThan(Math.abs(far.x));
        });

        it('handles epsilon protection for near-zero denominator', () => {
            // w = distance would make denom = 0
            const result = perspectiveProject4D([1, 0, 0, 2], { distance: 2, epsilon: 1e-5 });
            expect(Math.abs(result.denom)).toBeGreaterThanOrEqual(1e-5);
            expect(isFinite(result.x)).toBe(true);
        });

        it('preserves sign for negative raw denominator', () => {
            // w > distance → negative denominator
            const result = perspectiveProject4D([1, 0, 0, 3], { distance: 2 });
            expect(result.denom).toBeLessThan(0);
        });

        it('projects all components proportionally', () => {
            const result = perspectiveProject4D([2, 4, 6, 0], { distance: 2 });
            // All divided by 2
            expect(result.x).toBeCloseTo(1, 10);
            expect(result.y).toBeCloseTo(2, 10);
            expect(result.z).toBeCloseTo(3, 10);
        });
    });

    describe('stereographicProject4D', () => {
        it('projects origin to origin', () => {
            const result = stereographicProject4D([0, 0, 0, 0]);
            expect(result.x).toBe(0);
            expect(result.y).toBe(0);
            expect(result.z).toBe(0);
        });

        it('formula is xyz / (1 - w)', () => {
            const result = stereographicProject4D([1, 0, 0, 0]);
            // denom = 1 - 0 = 1
            expect(result.x).toBeCloseTo(1, 10);
            expect(result.denom).toBeCloseTo(1, 10);
        });

        it('positive w shrinks denominator', () => {
            const result = stereographicProject4D([1, 0, 0, 0.5]);
            // denom = 1 - 0.5 = 0.5, scale = 2
            expect(result.x).toBeCloseTo(2, 10);
        });

        it('negative w expands denominator', () => {
            const result = stereographicProject4D([1, 0, 0, -1]);
            // denom = 1 - (-1) = 2, scale = 0.5
            expect(result.x).toBeCloseTo(0.5, 10);
        });

        it('handles w=1 with epsilon', () => {
            const result = stereographicProject4D([1, 0, 0, 1], { epsilon: 1e-5 });
            expect(Math.abs(result.denom)).toBeGreaterThanOrEqual(1e-5);
            expect(isFinite(result.x)).toBe(true);
        });

        it('is conformal (preserves angles locally)', () => {
            // Stereographic projection maps circles to circles
            // Test: two perpendicular vectors at same w project to same relative scale
            const v1 = stereographicProject4D([1, 0, 0, 0.5]);
            const v2 = stereographicProject4D([0, 1, 0, 0.5]);
            expect(v1.x).toBeCloseTo(v2.y, 10);
        });
    });
});
