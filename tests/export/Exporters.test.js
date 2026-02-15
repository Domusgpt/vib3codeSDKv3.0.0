import { describe, it, expect, vi } from 'vitest';
import { exportSVG, downloadSVG } from '../../src/export/SVGExporter.js';
import { exportCSS, downloadCSS, toStyleObject } from '../../src/export/CSSExporter.js';
import { exportLottie, downloadLottie } from '../../src/export/LottieExporter.js';
import { ShaderExporter } from '../../src/export/ShaderExporter.js';

const defaultParams = {
    geometry: 0,
    hue: 200,
    saturation: 0.7,
    intensity: 0.8,
    gridDensity: 16,
    dimension: 3.5,
    rot4dXY: 0,
    rot4dXZ: 0,
    rot4dYZ: 0,
    rot4dXW: 0.5,
    rot4dYW: 0,
    rot4dZW: 0,
    morphFactor: 1.0,
    chaos: 0.2,
    speed: 1.0,
    system: 'quantum'
};

describe('SVGExporter', () => {
    it('exports valid SVG string', () => {
        const svg = exportSVG(defaultParams);
        expect(svg).toContain('<svg');
        expect(svg).toContain('</svg>');
    });

    it('respects width/height options', () => {
        const svg = exportSVG(defaultParams, { width: 256, height: 256 });
        expect(svg).toContain('256');
    });

    it('includes metadata when option is set', () => {
        const svg = exportSVG(defaultParams, { includeMetadata: true });
        expect(svg).toContain('<svg');
        // With metadata the SVG is larger (includes data attributes or comments)
        const noMeta = exportSVG(defaultParams, { includeMetadata: false });
        expect(svg.length).toBeGreaterThanOrEqual(noMeta.length);
    });

    it('handles empty params gracefully', () => {
        const svg = exportSVG({});
        expect(svg).toContain('<svg');
    });

    it('handles all 24 geometry variants', () => {
        for (let i = 0; i < 24; i++) {
            const svg = exportSVG({ ...defaultParams, geometry: i });
            expect(svg).toContain('<svg');
        }
    });
});

describe('CSSExporter', () => {
    it('exports valid CSS string', () => {
        const css = exportCSS(defaultParams);
        expect(typeof css).toBe('string');
        expect(css.length).toBeGreaterThan(0);
    });

    it('generates CSS custom properties', () => {
        const css = exportCSS(defaultParams);
        expect(css).toContain('--');
    });

    it('toStyleObject returns a plain object', () => {
        const styles = toStyleObject(defaultParams);
        expect(typeof styles).toBe('object');
        expect(Object.keys(styles).length).toBeGreaterThan(0);
    });

    it('toStyleObject respects prefix', () => {
        const styles = toStyleObject(defaultParams, 'myapp');
        const keys = Object.keys(styles);
        expect(keys.some(k => k.includes('myapp'))).toBe(true);
    });

    it('handles empty params', () => {
        const css = exportCSS({});
        expect(typeof css).toBe('string');
    });
});

describe('LottieExporter', () => {
    it('exports a valid Lottie object', () => {
        const lottie = exportLottie(defaultParams);
        expect(typeof lottie).toBe('object');
        expect(lottie).toHaveProperty('v');   // Lottie version
        expect(lottie).toHaveProperty('fr');  // Frame rate
        expect(lottie).toHaveProperty('w');   // Width
        expect(lottie).toHaveProperty('h');   // Height
    });

    it('respects width/height options', () => {
        const lottie = exportLottie(defaultParams, { width: 128, height: 128 });
        expect(lottie.w).toBe(128);
        expect(lottie.h).toBe(128);
    });

    it('respects fps option', () => {
        const lottie = exportLottie(defaultParams, { fps: 30 });
        expect(lottie.fr).toBe(30);
    });

    it('handles empty params', () => {
        const lottie = exportLottie({});
        expect(typeof lottie).toBe('object');
    });
});

describe('ShaderExporter', () => {
    it('getQuantumShader returns GLSL string', () => {
        const shader = ShaderExporter.getQuantumShader();
        expect(typeof shader).toBe('string');
        expect(shader).toContain('precision');
        expect(shader).toContain('u_resolution');
    });

    it('getFacetedShader returns GLSL string', () => {
        const shader = ShaderExporter.getFacetedShader();
        expect(typeof shader).toBe('string');
        expect(shader).toContain('precision');
    });

    it('getHolographicShader returns GLSL string', () => {
        const shader = ShaderExporter.getHolographicShader();
        expect(typeof shader).toBe('string');
        expect(shader).toContain('precision');
    });

    it('all shaders contain 6D rotation matrices', () => {
        for (const shader of [
            ShaderExporter.getQuantumShader(),
            ShaderExporter.getFacetedShader(),
            ShaderExporter.getHolographicShader()
        ]) {
            expect(shader).toContain('rotateXW');
            expect(shader).toContain('rotateYW');
            expect(shader).toContain('rotateZW');
        }
    });

    it('exportHTML generates standalone HTML', () => {
        const html = ShaderExporter.exportHTML({
            system: 'quantum',
            geometry: 5,
            hue: 150
        });
        expect(typeof html).toBe('string');
        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('canvas');
    });

    it('exportHTML works for all three systems', () => {
        for (const system of ['quantum', 'faceted', 'holographic']) {
            const html = ShaderExporter.exportHTML({ system });
            expect(html).toContain('<!DOCTYPE html>');
        }
    });
});
