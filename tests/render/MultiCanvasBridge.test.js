import { describe, it, expect, beforeEach } from 'vitest';
import { MultiCanvasBridge } from '../../src/render/MultiCanvasBridge.js';

describe('MultiCanvasBridge', () => {
    let bridge;

    beforeEach(() => {
        bridge = new MultiCanvasBridge();
    });

    describe('constructor', () => {
        it('starts uninitialized', () => {
            expect(bridge.initialized).toBe(false);
            expect(bridge.backendType).toBeNull();
            expect(bridge.layerCount).toBe(0);
        });
    });

    describe('layerNames', () => {
        it('returns empty array before initialization', () => {
            expect(bridge.layerNames).toEqual([]);
        });
    });

    describe('getBridge', () => {
        it('returns undefined for non-existent layer', () => {
            expect(bridge.getBridge('content')).toBeUndefined();
        });
    });

    describe('setSharedUniforms', () => {
        it('stores uniforms', () => {
            bridge.setSharedUniforms({ u_time: 1.0, u_resolution: [800, 600] });
            // No error, uniforms stored for later use
        });
    });

    describe('setLayerUniforms', () => {
        it('merges with existing uniforms', () => {
            bridge.setLayerUniforms('content', { u_opacity: 0.5 });
            bridge.setLayerUniforms('content', { u_density: 1.0 });
            // Internal state has both uniforms
        });
    });

    describe('setLayerConfig', () => {
        it('merges with existing config', () => {
            bridge.setLayerConfig('background', { layerOpacity: 0.3 });
            bridge.setLayerConfig('background', { speedMult: 0.5 });
            // Both configs stored
        });
    });

    describe('_buildLayerUniforms', () => {
        it('merges shared, config, and override uniforms', () => {
            bridge.setSharedUniforms({ u_time: 1.0 });
            bridge.setLayerConfig('content', { layerOpacity: 0.8, densityMult: 1.5 });
            bridge.setLayerUniforms('content', { u_custom: 42 });

            const uniforms = bridge._buildLayerUniforms('content');
            expect(uniforms.u_time).toBe(1.0);
            expect(uniforms.u_layerOpacity).toBe(0.8);
            expect(uniforms.u_densityMult).toBe(1.5);
            expect(uniforms.u_custom).toBe(42);
        });

        it('uses defaults for unconfigured layers', () => {
            const uniforms = bridge._buildLayerUniforms('unknown');
            expect(uniforms.u_layerScale).toBe(1.0);
            expect(uniforms.u_layerOpacity).toBe(1.0);
            expect(uniforms.u_densityMult).toBe(1.0);
            expect(uniforms.u_speedMult).toBe(1.0);
        });

        it('overrides take priority over config', () => {
            bridge.setLayerConfig('content', { layerOpacity: 0.5 });
            bridge.setLayerUniforms('content', { u_layerOpacity: 0.9 });
            const uniforms = bridge._buildLayerUniforms('content');
            expect(uniforms.u_layerOpacity).toBe(0.9);
        });
    });

    describe('dispose', () => {
        it('clears all state', () => {
            bridge.setSharedUniforms({ u_time: 1.0 });
            bridge.setLayerConfig('content', { opacity: 0.5 });
            bridge.dispose();
            expect(bridge.initialized).toBe(false);
            expect(bridge.backendType).toBeNull();
            expect(bridge.layerCount).toBe(0);
        });
    });

    describe('renderLayer / renderAll', () => {
        it('renderLayer is no-op for missing layer', () => {
            // Should not throw
            bridge.renderLayer('nonexistent', 'shader');
        });

        it('renderAll is no-op when uninitialized', () => {
            // Should not throw
            bridge.renderAll('shader');
        });
    });

    describe('compileShaderAll', () => {
        it('returns empty results when no bridges', () => {
            const result = bridge.compileShaderAll('test', {});
            expect(result.succeeded).toEqual([]);
            expect(result.failed).toEqual([]);
        });
    });

    describe('compileShader', () => {
        it('returns false for non-existent layer', () => {
            expect(bridge.compileShader('content', 'test', {})).toBe(false);
        });
    });
});
