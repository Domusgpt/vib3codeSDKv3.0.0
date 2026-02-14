import { describe, it, expect } from 'vitest';
import {
    generateTesseractVertices,
    generateTesseractEdges,
    generateTesseractFaces,
    generateTesseract,
    generateTesseractSubdivided
} from '../../src/geometry/generators/Tesseract.js';

describe('Tesseract Generator', () => {
    describe('generateTesseractVertices', () => {
        it('generates 16 vertices', () => {
            const verts = generateTesseractVertices();
            expect(verts).toHaveLength(16);
        });

        it('all vertices have coordinates at ±1', () => {
            const verts = generateTesseractVertices(1);
            for (const v of verts) {
                expect(Math.abs(v.x)).toBe(1);
                expect(Math.abs(v.y)).toBe(1);
                expect(Math.abs(v.z)).toBe(1);
                expect(Math.abs(v.w)).toBe(1);
            }
        });

        it('respects custom size', () => {
            const verts = generateTesseractVertices(2);
            for (const v of verts) {
                expect(Math.abs(v.x)).toBe(2);
                expect(Math.abs(v.y)).toBe(2);
            }
        });

        it('all 16 vertices are unique', () => {
            const verts = generateTesseractVertices();
            const keys = verts.map(v => `${v.x},${v.y},${v.z},${v.w}`);
            expect(new Set(keys).size).toBe(16);
        });
    });

    describe('generateTesseractEdges', () => {
        it('generates 32 edges', () => {
            const edges = generateTesseractEdges();
            expect(edges).toHaveLength(32);
        });

        it('each edge connects vertices differing in exactly one bit', () => {
            const edges = generateTesseractEdges();
            for (const [i, j] of edges) {
                const diff = i ^ j;
                // Power of 2 means exactly one bit differs
                expect(diff & (diff - 1)).toBe(0);
                expect(diff).toBeGreaterThan(0);
            }
        });

        it('edge indices are in range [0, 15]', () => {
            const edges = generateTesseractEdges();
            for (const [i, j] of edges) {
                expect(i).toBeGreaterThanOrEqual(0);
                expect(i).toBeLessThan(16);
                expect(j).toBeGreaterThanOrEqual(0);
                expect(j).toBeLessThan(16);
            }
        });
    });

    describe('generateTesseractFaces', () => {
        it('generates 24 faces', () => {
            const faces = generateTesseractFaces();
            expect(faces).toHaveLength(24);
        });

        it('each face has 4 vertices (quads)', () => {
            const faces = generateTesseractFaces();
            for (const face of faces) {
                expect(face).toHaveLength(4);
            }
        });
    });

    describe('generateTesseract', () => {
        it('returns complete geometry with correct counts', () => {
            const geom = generateTesseract();
            expect(geom.name).toBe('tesseract');
            expect(geom.vertexCount).toBe(16);
            expect(geom.edgeCount).toBe(32);
            expect(geom.faceCount).toBe(24);
            expect(geom.cells).toBe(8);
            expect(geom.vertices).toHaveLength(16);
            expect(geom.edges).toHaveLength(32);
            expect(geom.faces).toHaveLength(24);
        });
    });

    describe('generateTesseractSubdivided', () => {
        it('returns base geometry with subdivisions=1', () => {
            const geom = generateTesseractSubdivided(1, 1);
            expect(geom.vertexCount).toBe(16);
            expect(geom.edgeCount).toBe(32);
        });

        it('adds intermediate vertices with subdivisions=2', () => {
            const geom = generateTesseractSubdivided(1, 2);
            // 16 original + 32 midpoints (one per edge)
            expect(geom.vertices.length).toBe(16 + 32);
            // Each original edge becomes 2 sub-edges
            expect(geom.edges.length).toBe(32 * 2);
        });

        it('preserves original topology info', () => {
            const geom = generateTesseractSubdivided(1, 3);
            expect(geom.name).toBe('tesseract');
            expect(geom.faces).toHaveLength(24);
        });
    });
});
