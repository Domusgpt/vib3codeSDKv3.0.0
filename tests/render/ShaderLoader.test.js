import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShaderLoader } from '../../src/render/ShaderLoader.js';

describe('ShaderLoader', () => {
    let loader;

    beforeEach(() => {
        loader = new ShaderLoader({ basePath: '/shaders' });
    });

    describe('constructor', () => {
        it('uses default base path', () => {
            const l = new ShaderLoader();
            expect(l.basePath).toBe('src/shaders');
        });

        it('accepts custom base path', () => {
            expect(loader.basePath).toBe('/shaders');
        });

        it('starts with empty cache', () => {
            const stats = loader.getStats();
            expect(stats.cached).toBe(0);
            expect(stats.failed).toBe(0);
            expect(stats.pending).toBe(0);
        });
    });

    describe('load', () => {
        it('returns null for failed fetch', async () => {
            // In test environment, fetch is not available or will fail
            globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
            const result = await loader.load('test.glsl');
            expect(result).toBeNull();
        });

        it('caches successful loads', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                text: () => Promise.resolve('void main() {}')
            });

            const result1 = await loader.load('test.glsl');
            const result2 = await loader.load('test.glsl');
            expect(result1).toBe('void main() {}');
            expect(result2).toBe('void main() {}');
            // fetch should only be called once due to caching
            expect(globalThis.fetch).toHaveBeenCalledTimes(1);
        });

        it('returns null for known failures', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 404
            });
            await loader.load('missing.glsl');
            // Second call should return null without fetching
            const result = await loader.load('missing.glsl');
            expect(result).toBeNull();
        });

        it('handles HTTP errors', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 500
            });
            const result = await loader.load('error.glsl');
            expect(result).toBeNull();
            expect(loader.getStats().failed).toBe(1);
        });
    });

    describe('loadShaderPair', () => {
        it('loads GLSL+WGSL pair in parallel', async () => {
            globalThis.fetch = vi.fn().mockImplementation((url) => {
                if (url.endsWith('.glsl')) {
                    return Promise.resolve({ ok: true, text: () => Promise.resolve('glsl shader') });
                }
                if (url.endsWith('.wgsl')) {
                    return Promise.resolve({ ok: true, text: () => Promise.resolve('wgsl shader') });
                }
                return Promise.resolve({ ok: false, status: 404 });
            });

            const result = await loader.loadShaderPair('faceted', 'faceted/faceted.frag');
            expect(result.glslFragment).toBe('glsl shader');
            expect(result.wgslFragment).toBe('wgsl shader');
            expect(result.glslVertex).toBeDefined();
            expect(result.wgslVertex).toBeDefined();
        });

        it('uses fallback vertex shaders when external not found', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });

            const result = await loader.loadShaderPair('test', 'test/test.frag');
            // Vertex shaders should fall back to built-in
            expect(result.glslVertex).toContain('a_position');
            expect(result.wgslVertex).toContain('VertexOutput');
        });
    });

    describe('preloadSystem', () => {
        it('loads shaders for known systems', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                text: () => Promise.resolve('shader source')
            });

            const result = await loader.preloadSystem('quantum');
            expect(result).toHaveProperty('glslVertex');
            expect(result).toHaveProperty('glslFragment');
        });

        it('returns fallbacks for unknown system', async () => {
            const result = await loader.preloadSystem('nonexistent');
            expect(result.glslVertex).toContain('a_position');
            expect(result.glslFragment).toBeNull();
        });
    });

    describe('preloadAll', () => {
        it('loads all three systems', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                text: () => Promise.resolve('shader')
            });

            const results = await loader.preloadAll();
            expect(results.size).toBe(3);
            expect(results.has('quantum')).toBe(true);
            expect(results.has('faceted')).toBe(true);
            expect(results.has('holographic')).toBe(true);
        });
    });

    describe('clearCache', () => {
        it('clears cached and failed entries', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                text: () => Promise.resolve('src')
            });
            await loader.load('test.glsl');
            expect(loader.getStats().cached).toBe(1);
            loader.clearCache();
            expect(loader.getStats().cached).toBe(0);
            expect(loader.getStats().failed).toBe(0);
        });
    });
});
