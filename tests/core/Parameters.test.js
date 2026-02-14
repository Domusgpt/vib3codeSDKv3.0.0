import { describe, it, expect, beforeEach } from 'vitest';
import { ParameterManager } from '../../src/core/Parameters.js';

describe('ParameterManager', () => {
    let pm;

    beforeEach(() => {
        pm = new ParameterManager();
    });

    describe('initialization', () => {
        it('has default parameters', () => {
            expect(pm.params.variation).toBe(0);
            expect(pm.params.rot4dXY).toBe(0);
            expect(pm.params.rot4dXW).toBe(0);
            expect(pm.params.dimension).toBe(3.5);
            expect(pm.params.gridDensity).toBe(15);
            expect(pm.params.morphFactor).toBe(1.0);
            expect(pm.params.chaos).toBe(0.2);
            expect(pm.params.speed).toBe(1.0);
            expect(pm.params.hue).toBe(200);
            expect(pm.params.intensity).toBe(0.5);
            expect(pm.params.saturation).toBe(0.8);
            expect(pm.params.geometry).toBe(0);
        });

        it('has parameter definitions for all params', () => {
            const paramNames = Object.keys(pm.params);
            for (const name of paramNames) {
                expect(pm.parameterDefs).toHaveProperty(name);
            }
        });

        it('all definitions have min, max, step, type', () => {
            for (const [name, def] of Object.entries(pm.parameterDefs)) {
                expect(def).toHaveProperty('min');
                expect(def).toHaveProperty('max');
                expect(def).toHaveProperty('step');
                expect(def).toHaveProperty('type');
                expect(def.min).toBeLessThan(def.max);
            }
        });

        it('stores defaults as a separate copy', () => {
            pm.params.hue = 100;
            expect(pm.defaults.hue).toBe(200);
        });
    });

    describe('setParameter', () => {
        it('sets a valid parameter', () => {
            expect(pm.setParameter('hue', 120)).toBe(true);
            expect(pm.params.hue).toBe(120);
        });

        it('clamps to minimum', () => {
            pm.setParameter('chaos', -5);
            expect(pm.params.chaos).toBe(0);
        });

        it('clamps to maximum', () => {
            pm.setParameter('chaos', 10);
            expect(pm.params.chaos).toBe(1);
        });

        it('rounds integer types', () => {
            pm.setParameter('geometry', 5.7);
            expect(pm.params.geometry).toBe(6);

            pm.setParameter('hue', 123.4);
            expect(pm.params.hue).toBe(123);
        });

        it('keeps float types as decimals', () => {
            pm.setParameter('chaos', 0.55);
            expect(pm.params.chaos).toBe(0.55);
        });

        it('rejects NaN', () => {
            pm.setParameter('hue', 100);
            expect(pm.setParameter('hue', NaN)).toBe(false);
            expect(pm.params.hue).toBe(100);
        });

        it('rejects Infinity', () => {
            pm.setParameter('hue', 100);
            expect(pm.setParameter('hue', Infinity)).toBe(false);
            expect(pm.params.hue).toBe(100);
        });

        it('rejects -Infinity', () => {
            pm.setParameter('speed', 1);
            expect(pm.setParameter('speed', -Infinity)).toBe(false);
            expect(pm.params.speed).toBe(1);
        });

        it('coerces string numbers', () => {
            pm.setParameter('hue', '180');
            expect(pm.params.hue).toBe(180);
        });

        it('rejects unknown parameters', () => {
            expect(pm.setParameter('nonexistent', 5)).toBe(false);
        });
    });

    describe('getParameter / getAllParameters', () => {
        it('gets a specific parameter', () => {
            expect(pm.getParameter('hue')).toBe(200);
        });

        it('returns undefined for unknown param', () => {
            expect(pm.getParameter('fake')).toBeUndefined();
        });

        it('returns a copy of all parameters', () => {
            const all = pm.getAllParameters();
            all.hue = 999;
            expect(pm.params.hue).toBe(200);
        });
    });

    describe('setParameters', () => {
        it('sets multiple parameters at once', () => {
            pm.setParameters({ hue: 100, chaos: 0.5, speed: 2.0 });
            expect(pm.params.hue).toBe(100);
            expect(pm.params.chaos).toBe(0.5);
            expect(pm.params.speed).toBe(2.0);
        });

        it('ignores unknown keys', () => {
            pm.setParameters({ hue: 100, fake: 999 });
            expect(pm.params.hue).toBe(100);
            expect(pm.params).not.toHaveProperty('fake');
        });
    });

    describe('setGeometry', () => {
        it('sets geometry via shorthand', () => {
            pm.setGeometry(12);
            expect(pm.params.geometry).toBe(12);
        });

        it('clamps geometry to range', () => {
            pm.setGeometry(99);
            expect(pm.params.geometry).toBe(23);
        });
    });

    describe('randomizeAll', () => {
        it('changes parameters to random values', () => {
            const before = { ...pm.params };
            pm.randomizeAll();
            // Very unlikely all values stay the same
            const changed = Object.keys(before).some(k => before[k] !== pm.params[k]);
            expect(changed).toBe(true);
        });

        it('produces values in valid ranges', () => {
            for (let i = 0; i < 10; i++) {
                pm.randomizeAll();
                expect(pm.params.rot4dXY).toBeGreaterThanOrEqual(-6.28);
                expect(pm.params.rot4dXY).toBeLessThanOrEqual(6.28);
                expect(pm.params.dimension).toBeGreaterThanOrEqual(3.0);
                expect(pm.params.dimension).toBeLessThanOrEqual(4.5);
                expect(pm.params.chaos).toBeGreaterThanOrEqual(0);
                expect(pm.params.chaos).toBeLessThanOrEqual(1);
                expect(pm.params.speed).toBeGreaterThanOrEqual(0.1);
                expect(pm.params.speed).toBeLessThanOrEqual(3.0);
                expect(pm.params.hue).toBeGreaterThanOrEqual(0);
                expect(pm.params.hue).toBeLessThanOrEqual(360);
                expect(pm.params.geometry).toBeGreaterThanOrEqual(0);
                expect(pm.params.geometry).toBeLessThanOrEqual(23);
            }
        });
    });

    describe('resetToDefaults', () => {
        it('restores all default values', () => {
            pm.setParameters({ hue: 50, chaos: 0.9, geometry: 15 });
            pm.resetToDefaults();
            expect(pm.params.hue).toBe(200);
            expect(pm.params.chaos).toBe(0.2);
            expect(pm.params.geometry).toBe(0);
        });
    });

    describe('exportConfiguration / loadConfiguration', () => {
        it('exports with correct metadata', () => {
            const config = pm.exportConfiguration();
            expect(config.type).toBe('vib34d-integrated-config');
            expect(config.version).toBe('2.0.3');
            expect(config).toHaveProperty('timestamp');
            expect(config).toHaveProperty('name');
            expect(config.parameters).toMatchObject(pm.params);
        });

        it('roundtrips through export/load', () => {
            pm.setParameters({ hue: 42, chaos: 0.77, geometry: 10 });
            const config = pm.exportConfiguration();

            const pm2 = new ParameterManager();
            expect(pm2.loadConfiguration(config)).toBe(true);
            expect(pm2.params.hue).toBe(42);
            expect(pm2.params.chaos).toBeCloseTo(0.77);
            expect(pm2.params.geometry).toBe(10);
        });

        it('loads from flat parameters object', () => {
            expect(pm.loadConfiguration({ hue: 90, speed: 2 })).toBe(true);
            expect(pm.params.hue).toBe(90);
            expect(pm.params.speed).toBe(2);
        });

        it('rejects null/invalid config', () => {
            expect(pm.loadConfiguration(null)).toBe(false);
            expect(pm.loadConfiguration('string')).toBe(false);
        });
    });

    describe('validateConfiguration', () => {
        it('validates a correct config', () => {
            const config = pm.exportConfiguration();
            const result = pm.validateConfiguration(config);
            expect(result.valid).toBe(true);
        });

        it('rejects null', () => {
            const result = pm.validateConfiguration(null);
            expect(result.valid).toBe(false);
        });

        it('rejects wrong type', () => {
            const result = pm.validateConfiguration({ type: 'wrong', parameters: {} });
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Invalid configuration type');
        });

        it('rejects missing parameters', () => {
            const result = pm.validateConfiguration({ type: 'vib34d-integrated-config' });
            expect(result.valid).toBe(false);
        });

        it('rejects out-of-range values', () => {
            const config = {
                type: 'vib34d-integrated-config',
                parameters: { hue: 999 }
            };
            const result = pm.validateConfiguration(config);
            expect(result.valid).toBe(false);
        });
    });

    describe('generateVariationParameters', () => {
        it('generates parameters for default variations (< 30)', () => {
            const params = pm.generateVariationParameters(0);
            expect(params.geometry).toBe(0);
            expect(params).toHaveProperty('gridDensity');
            expect(params).toHaveProperty('morphFactor');
            expect(params).toHaveProperty('hue');
        });

        it('generates different params for different variations', () => {
            const p0 = pm.generateVariationParameters(0);
            const p5 = pm.generateVariationParameters(5);
            expect(p0).not.toEqual(p5);
        });

        it('returns current params for custom variations (>= 30)', () => {
            pm.setParameter('hue', 42);
            const params = pm.generateVariationParameters(50);
            expect(params.hue).toBe(42);
        });
    });

    describe('applyVariation', () => {
        it('applies variation and sets variation index', () => {
            pm.applyVariation(5);
            expect(pm.params.variation).toBe(5);
        });
    });

    describe('color conversion', () => {
        it('getColorHSV returns correct values', () => {
            pm.setParameter('hue', 120);
            const hsv = pm.getColorHSV();
            expect(hsv.h).toBe(120);
            expect(hsv.s).toBe(0.8);
            expect(hsv.v).toBe(0.9);
        });

        it('getColorRGB returns r/g/b values', () => {
            pm.setParameter('hue', 0); // Red
            const rgb = pm.getColorRGB();
            expect(rgb.r).toBeGreaterThan(200);
            expect(rgb.g).toBeLessThan(50);
            expect(rgb.b).toBeLessThan(50);
        });

        it('hsvToRgb converts known colors', () => {
            // Pure red: H=0, S=1, V=1
            const red = pm.hsvToRgb(0, 1, 1);
            expect(red).toEqual({ r: 255, g: 0, b: 0 });

            // Pure green: H=120, S=1, V=1
            const green = pm.hsvToRgb(120, 1, 1);
            expect(green).toEqual({ r: 0, g: 255, b: 0 });

            // Pure blue: H=240, S=1, V=1
            const blue = pm.hsvToRgb(240, 1, 1);
            expect(blue).toEqual({ r: 0, g: 0, b: 255 });

            // White: H=0, S=0, V=1
            const white = pm.hsvToRgb(0, 0, 1);
            expect(white).toEqual({ r: 255, g: 255, b: 255 });
        });
    });
});
