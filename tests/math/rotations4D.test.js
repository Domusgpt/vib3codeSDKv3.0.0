import { describe, it, expect } from 'vitest';
import {
    ROTATION_PLANES,
    createRotationMatrix4D,
    identityMatrix4x4,
    multiplyMatrix4x4,
    transposeMatrix4x4,
    applyMatrix4x4,
    vectorLength4D,
    normalizeVector4D,
    normalizeRotationAngles,
    createRotationMatricesFromAngles,
    composeRotationMatrixFromAngles
} from '../../src/math/rotations.js';

describe('4D Rotation Utilities', () => {
    describe('ROTATION_PLANES', () => {
        it('has exactly 6 planes in canonical order', () => {
            expect(ROTATION_PLANES).toEqual(['XY', 'XZ', 'YZ', 'XW', 'YW', 'ZW']);
        });
    });

    describe('identityMatrix4x4', () => {
        it('returns a 16-element identity matrix', () => {
            const m = identityMatrix4x4();
            expect(m).toHaveLength(16);
            expect(m[0]).toBe(1);
            expect(m[5]).toBe(1);
            expect(m[10]).toBe(1);
            expect(m[15]).toBe(1);
            // Off-diagonal elements should be 0
            expect(m[1]).toBe(0);
            expect(m[4]).toBe(0);
        });
    });

    describe('createRotationMatrix4D', () => {
        it('identity for angle=0', () => {
            const m = createRotationMatrix4D('XY', 0);
            const identity = identityMatrix4x4();
            for (let i = 0; i < 16; i++) {
                expect(m[i]).toBeCloseTo(identity[i], 14);
            }
        });

        it('XY rotation by π/2 swaps X and Y', () => {
            const m = createRotationMatrix4D('XY', Math.PI / 2);
            const v = applyMatrix4x4(m, [1, 0, 0, 0]);
            // After 90° XY rotation, [1,0,0,0] → [0,1,0,0] approximately
            expect(v[0]).toBeCloseTo(0, 10);
            expect(v[1]).toBeCloseTo(1, 10);
            expect(v[2]).toBeCloseTo(0, 10);
            expect(v[3]).toBeCloseTo(0, 10);
        });

        it('XW rotation moves X into W', () => {
            const m = createRotationMatrix4D('XW', Math.PI / 2);
            const v = applyMatrix4x4(m, [1, 0, 0, 0]);
            expect(v[0]).toBeCloseTo(0, 10);
            expect(v[3]).toBeCloseTo(1, 10);
        });

        it('preserves vector length', () => {
            const m = createRotationMatrix4D('YZ', 1.23);
            const v = [1, 2, 3, 4];
            const rotated = applyMatrix4x4(m, v);
            expect(vectorLength4D(rotated)).toBeCloseTo(vectorLength4D(v), 10);
        });

        it('rotation by 2π returns to identity', () => {
            const m = createRotationMatrix4D('ZW', Math.PI * 2);
            const v = [1, 2, 3, 4];
            const result = applyMatrix4x4(m, v);
            for (let i = 0; i < 4; i++) {
                expect(result[i]).toBeCloseTo(v[i], 10);
            }
        });

        it('throws for invalid plane', () => {
            expect(() => createRotationMatrix4D('AB', 1)).toThrow('Invalid rotation plane');
        });

        it('accepts lowercase plane names', () => {
            const m = createRotationMatrix4D('xy', Math.PI / 4);
            expect(m).toHaveLength(16);
        });
    });

    describe('multiplyMatrix4x4', () => {
        it('identity * identity = identity', () => {
            const id = identityMatrix4x4();
            const result = multiplyMatrix4x4(id, id);
            for (let i = 0; i < 16; i++) {
                expect(result[i]).toBeCloseTo(id[i], 14);
            }
        });

        it('M * identity = M', () => {
            const m = createRotationMatrix4D('XY', 0.5);
            const id = identityMatrix4x4();
            const result = multiplyMatrix4x4(m, id);
            for (let i = 0; i < 16; i++) {
                expect(result[i]).toBeCloseTo(m[i], 14);
            }
        });

        it('R * R^T = identity for rotation matrices', () => {
            const r = createRotationMatrix4D('XZ', 1.0);
            const rt = transposeMatrix4x4(r);
            const result = multiplyMatrix4x4(r, rt);
            const id = identityMatrix4x4();
            for (let i = 0; i < 16; i++) {
                expect(result[i]).toBeCloseTo(id[i], 10);
            }
        });
    });

    describe('transposeMatrix4x4', () => {
        it('transposes correctly', () => {
            const m = [
                1, 2, 3, 4,
                5, 6, 7, 8,
                9, 10, 11, 12,
                13, 14, 15, 16
            ];
            const t = transposeMatrix4x4(m);
            // Row-major to column-major swaps
            expect(t[1]).toBe(m[4]);
            expect(t[4]).toBe(m[1]);
            expect(t[0]).toBe(m[0]); // diagonal unchanged
        });

        it('double transpose returns original', () => {
            const m = createRotationMatrix4D('YW', 0.7);
            const tt = transposeMatrix4x4(transposeMatrix4x4(m));
            for (let i = 0; i < 16; i++) {
                expect(tt[i]).toBeCloseTo(m[i], 14);
            }
        });
    });

    describe('applyMatrix4x4', () => {
        it('identity preserves vector', () => {
            const v = [1, 2, 3, 4];
            const result = applyMatrix4x4(identityMatrix4x4(), v);
            for (let i = 0; i < 4; i++) {
                expect(result[i]).toBe(v[i]);
            }
        });

        it('returns 4-element array', () => {
            const result = applyMatrix4x4(identityMatrix4x4(), [0, 0, 0, 0]);
            expect(result).toHaveLength(4);
        });
    });

    describe('vectorLength4D', () => {
        it('unit vectors have length 1', () => {
            expect(vectorLength4D([1, 0, 0, 0])).toBe(1);
            expect(vectorLength4D([0, 0, 0, 1])).toBe(1);
        });

        it('zero vector has length 0', () => {
            expect(vectorLength4D([0, 0, 0, 0])).toBe(0);
        });

        it('computes Euclidean norm', () => {
            expect(vectorLength4D([1, 1, 1, 1])).toBeCloseTo(2, 14);
            expect(vectorLength4D([3, 4, 0, 0])).toBeCloseTo(5, 14);
        });
    });

    describe('normalizeVector4D', () => {
        it('normalizes to unit length', () => {
            const n = normalizeVector4D([3, 4, 0, 0]);
            expect(vectorLength4D(n)).toBeCloseTo(1, 14);
            expect(n[0]).toBeCloseTo(0.6, 14);
            expect(n[1]).toBeCloseTo(0.8, 14);
        });

        it('returns zero for zero vector', () => {
            const n = normalizeVector4D([0, 0, 0, 0]);
            expect(n).toEqual([0, 0, 0, 0]);
        });

        it('preserves direction', () => {
            const v = [2, 4, 6, 8];
            const n = normalizeVector4D(v);
            // All ratios should be preserved
            const ratio = n[1] / n[0];
            expect(ratio).toBeCloseTo(2, 10);
        });
    });

    describe('normalizeRotationAngles', () => {
        it('fills missing planes with 0', () => {
            const result = normalizeRotationAngles({});
            for (const plane of ROTATION_PLANES) {
                expect(result[plane]).toBe(0);
            }
        });

        it('preserves provided angles', () => {
            const result = normalizeRotationAngles({ XY: 1.5, ZW: 2.0 });
            expect(result.XY).toBe(1.5);
            expect(result.ZW).toBe(2.0);
            expect(result.XZ).toBe(0);
        });

        it('accepts lowercase keys', () => {
            const result = normalizeRotationAngles({ xy: 1.0, xw: 2.0 });
            expect(result.XY).toBe(1.0);
            expect(result.XW).toBe(2.0);
        });

        it('ignores invalid plane keys', () => {
            const result = normalizeRotationAngles({ AB: 1.0, XY: 0.5 });
            expect(result.XY).toBe(0.5);
            expect(result).not.toHaveProperty('AB');
        });
    });

    describe('createRotationMatricesFromAngles', () => {
        it('returns matrices for all 6 planes', () => {
            const matrices = createRotationMatricesFromAngles({ XY: 0.5 });
            for (const plane of ROTATION_PLANES) {
                expect(matrices[plane]).toHaveLength(16);
            }
        });
    });

    describe('composeRotationMatrixFromAngles', () => {
        it('identity for zero angles', () => {
            const m = composeRotationMatrixFromAngles({});
            const id = identityMatrix4x4();
            for (let i = 0; i < 16; i++) {
                expect(m[i]).toBeCloseTo(id[i], 14);
            }
        });

        it('single plane matches individual rotation', () => {
            const composed = composeRotationMatrixFromAngles({ XY: 0.7 });
            const individual = createRotationMatrix4D('XY', 0.7);
            for (let i = 0; i < 16; i++) {
                expect(composed[i]).toBeCloseTo(individual[i], 14);
            }
        });

        it('preserves vector length under composition', () => {
            const m = composeRotationMatrixFromAngles({
                XY: 0.5, XZ: 0.3, YZ: 0.7,
                XW: 1.2, YW: 0.8, ZW: 0.4
            });
            const v = [1, 2, 3, 4];
            const result = applyMatrix4x4(m, v);
            expect(vectorLength4D(result)).toBeCloseTo(vectorLength4D(v), 8);
        });
    });
});
