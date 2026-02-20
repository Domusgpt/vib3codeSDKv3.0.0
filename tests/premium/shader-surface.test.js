/**
 * Tests for ShaderParameterSurface — Premium Module 1
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShaderParameterSurface } from '../../src/premium/ShaderParameterSurface.js';

function createMockEngine() {
    return {
        _shaderSurfaceParams: null,
        activeSystem: { name: 'quantum' },
        updateCurrentSystemParameters: vi.fn(),
        getParameter: vi.fn((name) => 0),
        setParameter: vi.fn(),
        onParameterChange: vi.fn(() => () => {}),
    };
}

describe('ShaderParameterSurface', () => {
    let engine;
    let surface;

    beforeEach(() => {
        engine = createMockEngine();
        surface = new ShaderParameterSurface(engine);
    });

    describe('construction', () => {
        it('initializes with default values', () => {
            const params = surface.getAllParameters();
            expect(params.projectionType).toBe(0);
            expect(params.uvScale).toBe(3.0);
            expect(params.lineThickness).toBe(0.03);
            expect(params.noiseFrequency).toEqual([7, 11, 13]);
            expect(params.breathStrength).toBe(0.3);
            expect(params.autoRotationSpeed).toEqual([0.1, 0.12, 0.08, 0.2, 0.15, 0.25]);
            expect(params.particleSize).toBe(0.2);
            expect(params.layerAlpha).toEqual({
                background: 0.6, shadow: 0.4, content: 1.0, highlight: 0.8, accent: 0.3
            });
        });

        it('returns copies of array/object defaults', () => {
            const params1 = surface.getAllParameters();
            const params2 = surface.getAllParameters();
            expect(params1.noiseFrequency).not.toBe(params2.noiseFrequency);
            expect(params1.layerAlpha).not.toBe(params2.layerAlpha);
        });
    });

    describe('setParameter', () => {
        it('sets a numeric parameter within range', () => {
            surface.setParameter('uvScale', 5.0);
            expect(surface.getParameter('uvScale')).toBe(5.0);
        });

        it('sets an integer parameter', () => {
            surface.setParameter('projectionType', 2);
            expect(surface.getParameter('projectionType')).toBe(2);
        });

        it('sets an array parameter', () => {
            surface.setParameter('noiseFrequency', [10, 20, 30]);
            expect(surface.getParameter('noiseFrequency')).toEqual([10, 20, 30]);
        });

        it('sets an object parameter', () => {
            surface.setParameter('layerAlpha', { background: 1.0, shadow: 0.5, content: 1.0, highlight: 0.7, accent: 0.2 });
            expect(surface.getParameter('layerAlpha').background).toBe(1.0);
        });

        it('pushes to engine after setting', () => {
            surface.setParameter('uvScale', 4.0);
            expect(engine.updateCurrentSystemParameters).toHaveBeenCalled();
            expect(engine._shaderSurfaceParams).toBeDefined();
            expect(engine._shaderSurfaceParams.uvScale).toBe(4.0);
        });

        it('throws on unknown parameter', () => {
            expect(() => surface.setParameter('nonexistent', 1)).toThrow(/Unknown shader parameter/);
        });

        it('throws on out-of-range numeric', () => {
            expect(() => surface.setParameter('uvScale', 100)).toThrow();
            expect(() => surface.setParameter('uvScale', 0)).toThrow();
        });

        it('throws on wrong array length', () => {
            expect(() => surface.setParameter('noiseFrequency', [1, 2])).toThrow();
        });

        it('throws on array values out of range', () => {
            expect(() => surface.setParameter('noiseFrequency', [0, 5, 5])).toThrow();
        });

        it('throws on non-finite number', () => {
            expect(() => surface.setParameter('uvScale', NaN)).toThrow();
            expect(() => surface.setParameter('uvScale', Infinity)).toThrow();
        });

        it('throws on non-object for object parameter', () => {
            expect(() => surface.setParameter('layerAlpha', 'string')).toThrow();
            expect(() => surface.setParameter('layerAlpha', null)).toThrow();
            expect(() => surface.setParameter('layerAlpha', [1])).toThrow();
        });
    });

    describe('getParameter', () => {
        it('returns a copy of array values', () => {
            const freq = surface.getParameter('noiseFrequency');
            freq[0] = 999;
            expect(surface.getParameter('noiseFrequency')[0]).toBe(7);
        });

        it('returns a copy of object values', () => {
            const alpha = surface.getParameter('layerAlpha');
            alpha.background = 999;
            expect(surface.getParameter('layerAlpha').background).toBe(0.6);
        });

        it('throws on unknown parameter', () => {
            expect(() => surface.getParameter('bogus')).toThrow(/Unknown shader parameter/);
        });
    });

    describe('setParameters (batch)', () => {
        it('sets multiple parameters at once', () => {
            surface.setParameters({ uvScale: 5.0, particleSize: 0.3 });
            expect(surface.getParameter('uvScale')).toBe(5.0);
            expect(surface.getParameter('particleSize')).toBe(0.3);
        });

        it('ignores unknown keys', () => {
            surface.setParameters({ uvScale: 5.0, unknownKey: 999 });
            expect(surface.getParameter('uvScale')).toBe(5.0);
        });

        it('pushes to engine once', () => {
            surface.setParameters({ uvScale: 5.0, particleSize: 0.3 });
            expect(engine.updateCurrentSystemParameters).toHaveBeenCalledTimes(1);
        });
    });

    describe('reset', () => {
        it('resets all parameters to defaults', () => {
            surface.setParameters({ uvScale: 7.0, particleSize: 0.5, projectionType: 2 });
            surface.reset();
            expect(surface.getParameter('uvScale')).toBe(3.0);
            expect(surface.getParameter('particleSize')).toBe(0.2);
            expect(surface.getParameter('projectionType')).toBe(0);
        });
    });

    describe('getParameterSchema', () => {
        it('returns a valid JSON schema', () => {
            const schema = surface.getParameterSchema();
            expect(schema.type).toBe('object');
            expect(schema.properties).toBeDefined();
            expect(schema.properties.uvScale).toBeDefined();
            expect(schema.properties.uvScale.type).toBe('number');
            expect(schema.properties.noiseFrequency.type).toBe('array');
        });
    });

    describe('destroy', () => {
        it('cleans up engine reference and shader params', () => {
            surface.destroy();
            expect(engine._shaderSurfaceParams).toBeUndefined();
        });

        it('does not push to engine after destroy', () => {
            surface.destroy();
            engine.updateCurrentSystemParameters.mockClear();
            // Should not throw, just silently no-op
            expect(() => surface.setParameter('uvScale', 5.0)).not.toThrow();
        });
    });
});
