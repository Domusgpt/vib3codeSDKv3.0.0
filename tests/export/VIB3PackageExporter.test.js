import { describe, it, expect } from 'vitest';
import { VIB3PackageExporter, VIB3_PACKAGE_VERSION, createVIB3Package } from '../../src/export/VIB3PackageExporter.js';

const testParams = {
    geometry: 5,
    hue: 200,
    saturation: 0.8,
    intensity: 0.7,
    gridDensity: 20,
    dimension: 3.5,
    speed: 1.2,
    chaos: 0.3,
    morphFactor: 0.5
};

const testReactivity = {
    audio: { enabled: false },
    mouse: { enabled: true, sensitivity: 0.5 }
};

describe('VIB3PackageExporter', () => {
    it('creates a valid package', () => {
        const exporter = new VIB3PackageExporter();
        const pkg = exporter.createPackage(testParams, testReactivity);

        expect(pkg).toHaveProperty('id');
        expect(pkg).toHaveProperty('version', VIB3_PACKAGE_VERSION);
        expect(pkg).toHaveProperty('created');
        expect(pkg).toHaveProperty('visual');
        expect(pkg.visual).toHaveProperty('parameters');
        expect(pkg.visual.parameters).toMatchObject(testParams);
    });

    it('generates embed code', () => {
        const exporter = new VIB3PackageExporter();
        const pkg = exporter.createPackage(testParams, testReactivity);
        expect(typeof pkg.embed).toBe('object');
        expect(pkg.embed).toHaveProperty('html');
        expect(pkg.embed).toHaveProperty('css');
        expect(pkg.embed).toHaveProperty('js');
        expect(pkg.embed).toHaveProperty('configJson');
        expect(pkg.embed).toHaveProperty('cdn');
        expect(pkg.embed).toHaveProperty('iframe');
        expect(pkg.embed).toHaveProperty('scriptTag');
    });

    it('generates HTML embed', () => {
        const exporter = new VIB3PackageExporter();
        const html = exporter.generateHTMLEmbed(testParams, testReactivity, 'test-id');
        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('canvas');
    });

    it('generates CSS embed', () => {
        const exporter = new VIB3PackageExporter();
        const css = exporter.generateCSSEmbed(testParams);
        expect(typeof css).toBe('string');
        expect(css.length).toBeGreaterThan(0);
    });

    it('generates JS embed', () => {
        const exporter = new VIB3PackageExporter();
        const js = exporter.generateJSEmbed(testParams, testReactivity, 'test-id');
        expect(typeof js).toBe('string');
        expect(js.length).toBeGreaterThan(0);
    });

    it('generates framework integrations', () => {
        const exporter = new VIB3PackageExporter();
        const integrations = exporter.generateIntegrations('test-id', testParams);
        expect(typeof integrations).toBe('object');
    });

    it('exports and loads JSON roundtrip', () => {
        const exporter = new VIB3PackageExporter();
        const pkg = exporter.createPackage(testParams, testReactivity, { author: 'test' });
        const json = exporter.exportToJSON(pkg);
        const loaded = VIB3PackageExporter.loadFromJSON(json);

        expect(loaded.id).toBe(pkg.id);
        expect(loaded.version).toBe(pkg.version);
        expect(loaded.visual).toEqual(pkg.visual);
    });

    it('exports pretty JSON when requested', () => {
        const exporter = new VIB3PackageExporter();
        const pkg = exporter.createPackage(testParams, testReactivity);
        const pretty = exporter.exportToJSON(pkg, true);
        const compact = exporter.exportToJSON(pkg, false);

        expect(pretty.length).toBeGreaterThan(compact.length);
        expect(pretty).toContain('\n');
    });

    it('includes author in package', () => {
        const exporter = new VIB3PackageExporter({ author: 'Paul' });
        const pkg = exporter.createPackage(testParams, testReactivity, { name: 'Test Vis' });

        expect(pkg.author).toHaveProperty('name', 'Paul');
        expect(pkg.name).toBe('Test Vis');
    });
});

describe('createVIB3Package (global function)', () => {
    it('creates a valid package without instantiating exporter', () => {
        const pkg = createVIB3Package(testParams, testReactivity);
        expect(pkg).toHaveProperty('id');
        expect(pkg).toHaveProperty('version');
        expect(pkg.visual.parameters).toMatchObject(testParams);
    });
});

describe('VIB3_PACKAGE_VERSION', () => {
    it('is a string version', () => {
        expect(typeof VIB3_PACKAGE_VERSION).toBe('string');
        expect(VIB3_PACKAGE_VERSION).toBe('2.0');
    });
});
