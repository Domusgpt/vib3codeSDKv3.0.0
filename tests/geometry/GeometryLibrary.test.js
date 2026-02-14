import { describe, it, expect } from 'vitest';
import { GeometryLibrary } from '../../src/geometry/GeometryLibrary.js';

describe('GeometryLibrary', () => {
    describe('getGeometryNames', () => {
        it('returns 8 geometry names', () => {
            const names = GeometryLibrary.getGeometryNames();
            expect(names).toHaveLength(8);
        });

        it('starts with TETRAHEDRON and ends with CRYSTAL', () => {
            const names = GeometryLibrary.getGeometryNames();
            expect(names[0]).toBe('TETRAHEDRON');
            expect(names[7]).toBe('CRYSTAL');
        });

        it('includes all base geometries', () => {
            const names = GeometryLibrary.getGeometryNames();
            expect(names).toContain('HYPERCUBE');
            expect(names).toContain('SPHERE');
            expect(names).toContain('TORUS');
            expect(names).toContain('KLEIN BOTTLE');
            expect(names).toContain('FRACTAL');
            expect(names).toContain('WAVE');
        });
    });

    describe('getGeometryName', () => {
        it('returns correct name for each index', () => {
            expect(GeometryLibrary.getGeometryName(0)).toBe('TETRAHEDRON');
            expect(GeometryLibrary.getGeometryName(1)).toBe('HYPERCUBE');
            expect(GeometryLibrary.getGeometryName(4)).toBe('KLEIN BOTTLE');
            expect(GeometryLibrary.getGeometryName(7)).toBe('CRYSTAL');
        });

        it('returns UNKNOWN for out-of-range index', () => {
            expect(GeometryLibrary.getGeometryName(8)).toBe('UNKNOWN');
            expect(GeometryLibrary.getGeometryName(-1)).toBe('UNKNOWN');
            expect(GeometryLibrary.getGeometryName(100)).toBe('UNKNOWN');
        });
    });

    describe('getVariationParameters', () => {
        it('returns expected parameter keys', () => {
            const params = GeometryLibrary.getVariationParameters(0, 1);
            expect(params).toHaveProperty('gridDensity');
            expect(params).toHaveProperty('morphFactor');
            expect(params).toHaveProperty('chaos');
            expect(params).toHaveProperty('speed');
            expect(params).toHaveProperty('hue');
        });

        it('increases gridDensity with level', () => {
            const level0 = GeometryLibrary.getVariationParameters(1, 0);
            const level3 = GeometryLibrary.getVariationParameters(1, 3);
            expect(level3.gridDensity).toBeGreaterThan(level0.gridDensity);
        });

        it('increases morphFactor with level', () => {
            const level0 = GeometryLibrary.getVariationParameters(1, 0);
            const level3 = GeometryLibrary.getVariationParameters(1, 3);
            expect(level3.morphFactor).toBeGreaterThan(level0.morphFactor);
        });

        it('hue wraps within 360', () => {
            for (let type = 0; type < 8; type++) {
                for (let level = 0; level < 10; level++) {
                    const params = GeometryLibrary.getVariationParameters(type, level);
                    expect(params.hue).toBeGreaterThanOrEqual(0);
                    expect(params.hue).toBeLessThan(360);
                }
            }
        });

        it('applies tetrahedron-specific gridDensity boost', () => {
            const tetra = GeometryLibrary.getVariationParameters(0, 1);
            const base = 8 + (1 * 4); // base gridDensity at level 1
            expect(tetra.gridDensity).toBeCloseTo(base * 1.2, 5);
        });

        it('applies hypercube morphFactor reduction', () => {
            const cube = GeometryLibrary.getVariationParameters(1, 1);
            const baseMorph = 0.5 + (1 * 0.3);
            expect(cube.morphFactor).toBeCloseTo(baseMorph * 0.8, 5);
        });

        it('applies fractal chaos boost', () => {
            const fractal = GeometryLibrary.getVariationParameters(5, 2);
            const baseChaos = 2 * 0.15;
            expect(fractal.chaos).toBeCloseTo(baseChaos * 2.0, 5);
        });

        it('applies wave speed boost and chaos reduction', () => {
            const wave = GeometryLibrary.getVariationParameters(6, 1);
            const baseSpeed = 0.8 + (1 * 0.2);
            const baseChaos = 1 * 0.15;
            expect(wave.speed).toBeCloseTo(baseSpeed * 1.8, 5);
            expect(wave.chaos).toBeCloseTo(baseChaos * 0.5, 5);
        });

        it('applies crystal gridDensity boost and morphFactor reduction', () => {
            const crystal = GeometryLibrary.getVariationParameters(7, 1);
            const baseGrid = 8 + (1 * 4);
            const baseMorph = 0.5 + (1 * 0.3);
            expect(crystal.gridDensity).toBeCloseTo(baseGrid * 1.5, 5);
            expect(crystal.morphFactor).toBeCloseTo(baseMorph * 0.6, 5);
        });
    });
});
