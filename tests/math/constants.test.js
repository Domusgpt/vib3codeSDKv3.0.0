import { describe, it, expect } from 'vitest';
import {
    PI, TAU, HALF_PI, QUARTER_PI,
    DEG_TO_RAD, RAD_TO_DEG,
    EPSILON, EPSILON_NORMAL, EPSILON_EQUAL,
    PHI, PHI_INV,
    TESSERACT_VERTICES, TESSERACT_EDGES, TESSERACT_FACES, TESSERACT_CELLS,
    CELL24_VERTICES, CELL24_EDGES,
    CELL120_VERTICES, CELL600_VERTICES,
    PLANE_XY, PLANE_XZ, PLANE_YZ, PLANE_XW, PLANE_YW, PLANE_ZW,
    PLANE_NAMES,
    GEOMETRY_TETRAHEDRON, GEOMETRY_HYPERCUBE, GEOMETRY_CRYSTAL,
    CORE_BASE, CORE_HYPERSPHERE, CORE_HYPERTETRAHEDRON,
    encodeGeometry, decodeGeometry,
    toRadians, toDegrees,
    clamp, lerp, smoothstep, smootherstep
} from '../../src/math/constants.js';

describe('Math Constants', () => {
    describe('basic constants', () => {
        it('PI equals Math.PI', () => {
            expect(PI).toBe(Math.PI);
        });

        it('TAU is 2π', () => {
            expect(TAU).toBeCloseTo(Math.PI * 2, 15);
        });

        it('HALF_PI is π/2', () => {
            expect(HALF_PI).toBeCloseTo(Math.PI / 2, 15);
        });

        it('QUARTER_PI is π/4', () => {
            expect(QUARTER_PI).toBeCloseTo(Math.PI / 4, 15);
        });
    });

    describe('conversion factors', () => {
        it('DEG_TO_RAD * 180 = π', () => {
            expect(180 * DEG_TO_RAD).toBeCloseTo(Math.PI, 15);
        });

        it('RAD_TO_DEG * π = 180', () => {
            expect(Math.PI * RAD_TO_DEG).toBeCloseTo(180, 15);
        });

        it('DEG_TO_RAD and RAD_TO_DEG are inverses', () => {
            expect(DEG_TO_RAD * RAD_TO_DEG).toBeCloseTo(1, 15);
        });
    });

    describe('epsilon values', () => {
        it('EPSILON is very small', () => {
            expect(EPSILON).toBeLessThan(1e-9);
            expect(EPSILON).toBeGreaterThan(0);
        });

        it('EPSILON_NORMAL and EPSILON_EQUAL are 1e-6', () => {
            expect(EPSILON_NORMAL).toBe(1e-6);
            expect(EPSILON_EQUAL).toBe(1e-6);
        });
    });

    describe('golden ratio', () => {
        it('PHI ≈ 1.618', () => {
            expect(PHI).toBeCloseTo(1.618033988749895, 10);
        });

        it('PHI_INV ≈ 0.618', () => {
            expect(PHI_INV).toBeCloseTo(0.618033988749895, 10);
        });

        it('PHI * PHI_INV = 1', () => {
            expect(PHI * PHI_INV).toBeCloseTo(1, 14);
        });

        it('PHI satisfies φ² = φ + 1', () => {
            expect(PHI * PHI).toBeCloseTo(PHI + 1, 14);
        });
    });

    describe('4D polytope constants', () => {
        it('tesseract has correct topology', () => {
            expect(TESSERACT_VERTICES).toBe(16);
            expect(TESSERACT_EDGES).toBe(32);
            expect(TESSERACT_FACES).toBe(24);
            expect(TESSERACT_CELLS).toBe(8);
        });

        it('24-cell has 24 vertices', () => {
            expect(CELL24_VERTICES).toBe(24);
            expect(CELL24_EDGES).toBe(96);
        });

        it('120-cell has 600 vertices', () => {
            expect(CELL120_VERTICES).toBe(600);
        });

        it('600-cell has 120 vertices', () => {
            expect(CELL600_VERTICES).toBe(120);
        });
    });

    describe('rotation plane indices', () => {
        it('planes are numbered 0-5', () => {
            expect(PLANE_XY).toBe(0);
            expect(PLANE_XZ).toBe(1);
            expect(PLANE_YZ).toBe(2);
            expect(PLANE_XW).toBe(3);
            expect(PLANE_YW).toBe(4);
            expect(PLANE_ZW).toBe(5);
        });

        it('PLANE_NAMES has 6 entries matching indices', () => {
            expect(PLANE_NAMES).toHaveLength(6);
            expect(PLANE_NAMES[PLANE_XY]).toBe('XY');
            expect(PLANE_NAMES[PLANE_ZW]).toBe('ZW');
        });
    });

    describe('geometry encoding', () => {
        it('geometry type indices are 0-7', () => {
            expect(GEOMETRY_TETRAHEDRON).toBe(0);
            expect(GEOMETRY_HYPERCUBE).toBe(1);
            expect(GEOMETRY_CRYSTAL).toBe(7);
        });

        it('core type indices are 0-2', () => {
            expect(CORE_BASE).toBe(0);
            expect(CORE_HYPERSPHERE).toBe(1);
            expect(CORE_HYPERTETRAHEDRON).toBe(2);
        });

        it('encodeGeometry produces index = core*8 + base', () => {
            expect(encodeGeometry(0, 0)).toBe(0);
            expect(encodeGeometry(3, 0)).toBe(3);
            expect(encodeGeometry(0, 1)).toBe(8);
            expect(encodeGeometry(5, 2)).toBe(21);
        });

        it('decodeGeometry reverses encodeGeometry', () => {
            for (let core = 0; core < 3; core++) {
                for (let base = 0; base < 8; base++) {
                    const idx = encodeGeometry(base, core);
                    const decoded = decodeGeometry(idx);
                    expect(decoded.baseIndex).toBe(base);
                    expect(decoded.coreIndex).toBe(core);
                }
            }
        });

        it('all 24 geometries encode/decode correctly', () => {
            for (let i = 0; i < 24; i++) {
                const d = decodeGeometry(i);
                expect(encodeGeometry(d.baseIndex, d.coreIndex)).toBe(i);
            }
        });
    });

    describe('utility functions', () => {
        it('toRadians converts degrees', () => {
            expect(toRadians(0)).toBe(0);
            expect(toRadians(90)).toBeCloseTo(Math.PI / 2, 15);
            expect(toRadians(180)).toBeCloseTo(Math.PI, 15);
            expect(toRadians(360)).toBeCloseTo(Math.PI * 2, 15);
        });

        it('toDegrees converts radians', () => {
            expect(toDegrees(0)).toBe(0);
            expect(toDegrees(Math.PI)).toBeCloseTo(180, 10);
            expect(toDegrees(Math.PI * 2)).toBeCloseTo(360, 10);
        });

        it('toRadians and toDegrees are inverses', () => {
            expect(toDegrees(toRadians(45))).toBeCloseTo(45, 10);
            expect(toRadians(toDegrees(1.5))).toBeCloseTo(1.5, 10);
        });

        it('clamp keeps values in range', () => {
            expect(clamp(5, 0, 10)).toBe(5);
            expect(clamp(-1, 0, 10)).toBe(0);
            expect(clamp(15, 0, 10)).toBe(10);
            expect(clamp(0, 0, 0)).toBe(0);
        });

        it('lerp interpolates linearly', () => {
            expect(lerp(0, 10, 0)).toBe(0);
            expect(lerp(0, 10, 1)).toBe(10);
            expect(lerp(0, 10, 0.5)).toBe(5);
            expect(lerp(-5, 5, 0.5)).toBe(0);
        });

        it('smoothstep has correct boundary values', () => {
            expect(smoothstep(0)).toBe(0);
            expect(smoothstep(1)).toBe(1);
            expect(smoothstep(0.5)).toBe(0.5);
        });

        it('smootherstep has correct boundary values', () => {
            expect(smootherstep(0)).toBe(0);
            expect(smootherstep(1)).toBe(1);
            expect(smootherstep(0.5)).toBeCloseTo(0.5, 10);
        });

        it('smoothstep is monotonically increasing on [0,1]', () => {
            let prev = 0;
            for (let t = 0.1; t <= 1; t += 0.1) {
                const val = smoothstep(t);
                expect(val).toBeGreaterThanOrEqual(prev);
                prev = val;
            }
        });
    });
});
