import { describe, it, expect, beforeEach } from 'vitest';
import { ParameterManager } from '../../src/core/Parameters.js';

describe('ParameterManager', () => {
    let parameterManager;

    beforeEach(() => {
        parameterManager = new ParameterManager();
    });

    describe('Initialization', () => {
        it('should initialize with default parameters', () => {
            const params = parameterManager.getAllParameters();
            expect(params.variation).toBe(0);
            expect(params.dimension).toBe(3.5);
            expect(params.hue).toBe(200);
            expect(params.geometry).toBe(0);
        });

        it('should have parameter definitions', () => {
            expect(parameterManager.parameterDefs).toBeDefined();
            expect(parameterManager.parameterDefs.hue).toEqual({ min: 0, max: 360, step: 1, type: 'int' });
        });
    });

    describe('setParameter', () => {
        it('should set valid parameter values', () => {
            const result = parameterManager.setParameter('hue', 150);
            expect(result).toBe(true);
            expect(parameterManager.getParameter('hue')).toBe(150);
        });

        it('should clamp values to valid range', () => {
            parameterManager.setParameter('hue', 400); // Max is 360
            expect(parameterManager.getParameter('hue')).toBe(360);

            parameterManager.setParameter('hue', -50); // Min is 0
            expect(parameterManager.getParameter('hue')).toBe(0);
        });

        it('should handle integer type conversion', () => {
            parameterManager.setParameter('hue', 150.7);
            expect(parameterManager.getParameter('hue')).toBe(151); // Rounded
        });

        it('should reject invalid numbers (NaN, Infinity)', () => {
            const result = parameterManager.setParameter('speed', NaN);
            expect(result).toBe(false);
            expect(parameterManager.getParameter('speed')).toBe(1.0); // Default
        });

        it('should reject unknown parameters', () => {
            const result = parameterManager.setParameter('nonExistent', 123);
            expect(result).toBe(false);
        });
    });

    describe('setParameters', () => {
        it('should set multiple parameters', () => {
            parameterManager.setParameters({
                hue: 100,
                speed: 2.5,
                chaos: 0.5
            });
            const params = parameterManager.getAllParameters();
            expect(params.hue).toBe(100);
            expect(params.speed).toBe(2.5);
            expect(params.chaos).toBe(0.5);
        });
    });

    describe('Parameter Operations', () => {
        it('should randomize all parameters within valid ranges', () => {
            parameterManager.randomizeAll();
            const params = parameterManager.getAllParameters();

            expect(params.hue).toBeGreaterThanOrEqual(0);
            expect(params.hue).toBeLessThanOrEqual(360);
            expect(params.speed).toBeGreaterThanOrEqual(0.1);
            expect(params.speed).toBeLessThanOrEqual(3);
        });

        it('should reset to defaults', () => {
            parameterManager.setParameter('hue', 100);
            parameterManager.resetToDefaults();
            expect(parameterManager.getParameter('hue')).toBe(200); // Default
        });
    });

    describe('Configuration Management', () => {
        it('should export configuration', () => {
            const config = parameterManager.exportConfiguration();
            expect(config.type).toBe('vib34d-integrated-config');
            expect(config.parameters).toBeDefined();
            expect(config.parameters.hue).toBe(200);
        });

        it('should load configuration', () => {
            const config = {
                type: 'vib34d-integrated-config',
                parameters: {
                    hue: 50,
                    speed: 0.5
                }
            };

            const result = parameterManager.loadConfiguration(config);
            expect(result).toBe(true);
            expect(parameterManager.getParameter('hue')).toBe(50);
            expect(parameterManager.getParameter('speed')).toBe(0.5);
        });

        it('should validate valid configuration', () => {
            const config = {
                type: 'vib34d-integrated-config',
                parameters: { hue: 200 }
            };
            const result = parameterManager.validateConfiguration(config);
            expect(result.valid).toBe(true);
        });

        it('should invalidate incorrect configuration type', () => {
            const config = {
                type: 'wrong-type',
                parameters: {}
            };
            const result = parameterManager.validateConfiguration(config);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Invalid configuration type');
        });

        it('should invalidate out of range values', () => {
            const config = {
                type: 'vib34d-integrated-config',
                parameters: { hue: 500 }
            };
            const result = parameterManager.validateConfiguration(config);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Invalid value');
        });
    });

    describe('Variation System', () => {
        it('should apply variations', () => {
            parameterManager.applyVariation(0);
            expect(parameterManager.getParameter('variation')).toBe(0);
            expect(parameterManager.getParameter('geometry')).toBeDefined();
        });

        it('should generate variation parameters', () => {
            const params = parameterManager.generateVariationParameters(0);
            expect(params.geometry).toBe(0);
            expect(params.gridDensity).toBe(8);
        });
    });

    describe('Color Utilities', () => {
        it('should convert HSV to RGB', () => {
            // Test pure red (Hue 0)
            parameterManager.setParameter('hue', 0);
            const rgb = parameterManager.getColorRGB();
            // h=0, s=0.8, v=0.9
            // c = 0.9 * 0.8 = 0.72
            // m = 0.9 - 0.72 = 0.18
            // r = (0.72 + 0.18) * 255 = 0.9 * 255 = 229.5 -> 230
            // g = 0.18 * 255 = 45.9 -> 46
            // b = 0.18 * 255 = 45.9 -> 46

            expect(rgb.r).toBeCloseTo(230, -1); // Allow small rounding diff
            expect(rgb.g).toBeCloseTo(46, -1);
            expect(rgb.b).toBeCloseTo(46, -1);
        });
    });
});
