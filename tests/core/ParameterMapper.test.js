import { describe, it, expect, beforeEach } from 'vitest';
import { ParameterMapper } from '../../src/core/ParameterMapper.js';

describe('ParameterMapper', () => {
    let mapper;

    beforeEach(() => {
        mapper = new ParameterMapper();
    });

    describe('constructor', () => {
        it('has mappings for all three systems', () => {
            expect(mapper.mappings).toHaveProperty('vib34d');
            expect(mapper.mappings).toHaveProperty('holographic');
            expect(mapper.mappings).toHaveProperty('polychora');
        });

        it('has a unified schema', () => {
            expect(Object.keys(mapper.unifiedSchema).length).toBeGreaterThan(10);
        });

        it('schema entries have min, max, default, type', () => {
            for (const [key, schema] of Object.entries(mapper.unifiedSchema)) {
                expect(schema).toHaveProperty('min');
                expect(schema).toHaveProperty('max');
                expect(schema).toHaveProperty('default');
                expect(schema).toHaveProperty('type');
            }
        });
    });

    describe('toUnified', () => {
        it('maps vib34d params to unified format', () => {
            const params = { geometry: 5, gridDensity: 20 };
            const unified = mapper.toUnified(params, 'vib34d');
            expect(unified.geometryType).toBe(5);
            expect(unified.density).toBe(20);
        });

        it('fills defaults for missing params', () => {
            const unified = mapper.toUnified({}, 'vib34d');
            expect(unified.speed).toBe(1.0);
            expect(unified.hue).toBe(200);
        });

        it('handles null/invalid input', () => {
            expect(mapper.toUnified(null, 'vib34d')).toEqual({});
            expect(mapper.toUnified('string', 'vib34d')).toEqual({});
        });

        it('handles unknown system gracefully', () => {
            const result = mapper.toUnified({ speed: 2 }, 'unknown');
            expect(result.speed).toBe(2);
        });
    });

    describe('fromUnified', () => {
        it('maps unified params to vib34d format', () => {
            const unified = { geometryType: 3, density: 15, speed: 1.5 };
            const params = mapper.fromUnified(unified, 'vib34d');
            expect(params.geometry).toBe(3);
            expect(params.gridDensity).toBe(15);
        });

        it('handles null input', () => {
            expect(mapper.fromUnified(null, 'vib34d')).toEqual({});
        });
    });

    describe('validate', () => {
        it('validates correct parameters', () => {
            const result = mapper.validate({ speed: 1.5, hue: 180 });
            expect(result.errors).toHaveLength(0);
            expect(result.params.speed).toBe(1.5);
            expect(result.params.hue).toBe(180);
        });

        it('clamps out-of-range values', () => {
            const result = mapper.validate({ speed: 100 });
            expect(result.params.speed).toBe(3.0);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('flags unknown parameters', () => {
            const result = mapper.validate({ unknownParam: 5 });
            expect(result.errors.some(e => e.includes('Unknown parameter'))).toBe(true);
        });

        it('rounds integer types', () => {
            const result = mapper.validate({ geometryType: 2.7 });
            expect(result.params.geometryType).toBe(3);
        });

        it('handles NaN values', () => {
            const result = mapper.validate({ speed: NaN });
            expect(result.params.speed).toBe(1.0); // default
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });

    describe('merge', () => {
        it('merges multiple param sets', () => {
            const merged = mapper.merge(
                { speed: 1, hue: 100 },
                { hue: 200, chaos: 0.5 }
            );
            expect(merged.speed).toBe(1);
            expect(merged.hue).toBe(200); // overwritten
            expect(merged.chaos).toBe(0.5);
        });

        it('ignores null/undefined values', () => {
            const merged = mapper.merge(
                { speed: 1 },
                { speed: undefined, hue: null }
            );
            expect(merged.speed).toBe(1);
            expect(merged).not.toHaveProperty('hue');
        });
    });

    describe('getDefaults', () => {
        it('returns defaults for vib34d system', () => {
            const defaults = mapper.getDefaults('vib34d');
            expect(defaults).toHaveProperty('speed');
            expect(defaults).toHaveProperty('hue');
        });

        it('returns defaults for holographic system', () => {
            const defaults = mapper.getDefaults('holographic');
            expect(defaults).toHaveProperty('speed');
            expect(defaults).toHaveProperty('saturation');
        });
    });

    describe('getRanges', () => {
        it('returns parameter ranges for system', () => {
            const ranges = mapper.getRanges('vib34d');
            expect(ranges).toHaveProperty('speed');
            expect(ranges.speed.min).toBe(0.1);
            expect(ranges.speed.max).toBe(3.0);
        });
    });

    describe('crossPollinate', () => {
        it('blends parameters between systems', () => {
            const source = { speed: 2.0, hue: 300 };
            const result = mapper.crossPollinate(source, 'vib34d', 'holographic', 0.5);
            expect(typeof result.speed).toBe('number');
        });

        it('full influence replaces defaults', () => {
            const source = { speed: 2.0 };
            const result = mapper.crossPollinate(source, 'vib34d', 'holographic', 1.0);
            expect(result.speed).toBeCloseTo(2.0);
        });

        it('zero influence keeps defaults', () => {
            const source = { speed: 2.0 };
            const result = mapper.crossPollinate(source, 'vib34d', 'holographic', 0);
            const defaults = mapper.getDefaults('holographic');
            expect(result.speed).toBeCloseTo(defaults.speed);
        });
    });
});
