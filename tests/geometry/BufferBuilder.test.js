import { describe, it, expect } from 'vitest';
import {
    buildVertexBuffer,
    buildEdgeIndexBuffer,
    buildFaceIndexBuffer,
    buildInterleavedBuffer,
    buildNormalBuffer,
    generateWDepthColors,
    generateRainbowColors,
    buildGeometryBuffers
} from '../../src/geometry/buffers/BufferBuilder.js';
import { generateTesseract } from '../../src/geometry/generators/Tesseract.js';

// Mock Vec4 objects for testing
function vec4(x, y, z, w) {
    return { x, y, z, w };
}

describe('BufferBuilder', () => {
    const testVerts = [
        vec4(1, 0, 0, 0),
        vec4(0, 1, 0, 0),
        vec4(0, 0, 1, 0),
        vec4(0, 0, 0, 1)
    ];

    describe('buildVertexBuffer', () => {
        it('produces Float32Array with xyzw format', () => {
            const buf = buildVertexBuffer(testVerts, 'xyzw');
            expect(buf).toBeInstanceOf(Float32Array);
            expect(buf.length).toBe(4 * 4); // 4 verts × 4 components
        });

        it('produces Float32Array with xyz format', () => {
            const buf = buildVertexBuffer(testVerts, 'xyz');
            expect(buf).toBeInstanceOf(Float32Array);
            expect(buf.length).toBe(4 * 3); // 4 verts × 3 components
        });

        it('contains correct vertex data', () => {
            const buf = buildVertexBuffer(testVerts, 'xyzw');
            expect(buf[0]).toBe(1); // x of first vertex
            expect(buf[4]).toBe(0); // x of second vertex
            expect(buf[5]).toBe(1); // y of second vertex
        });

        it('xyz format drops w coordinate', () => {
            const buf = buildVertexBuffer([vec4(1, 2, 3, 4)], 'xyz');
            expect(buf[0]).toBe(1);
            expect(buf[1]).toBe(2);
            expect(buf[2]).toBe(3);
            expect(buf.length).toBe(3);
        });
    });

    describe('buildEdgeIndexBuffer', () => {
        it('produces Uint16Array by default', () => {
            const edges = [[0, 1], [1, 2], [2, 3]];
            const buf = buildEdgeIndexBuffer(edges);
            expect(buf).toBeInstanceOf(Uint16Array);
            expect(buf.length).toBe(6); // 3 edges × 2
        });

        it('produces Uint32Array when requested', () => {
            const edges = [[0, 1]];
            const buf = buildEdgeIndexBuffer(edges, true);
            expect(buf).toBeInstanceOf(Uint32Array);
        });

        it('contains correct indices', () => {
            const edges = [[5, 10], [20, 30]];
            const buf = buildEdgeIndexBuffer(edges);
            expect(buf[0]).toBe(5);
            expect(buf[1]).toBe(10);
            expect(buf[2]).toBe(20);
            expect(buf[3]).toBe(30);
        });
    });

    describe('buildFaceIndexBuffer', () => {
        it('triangulates triangles directly', () => {
            const faces = [[0, 1, 2]];
            const buf = buildFaceIndexBuffer(faces);
            expect(buf.length).toBe(3);
            expect(buf[0]).toBe(0);
            expect(buf[1]).toBe(1);
            expect(buf[2]).toBe(2);
        });

        it('triangulates quads into 2 triangles', () => {
            const faces = [[0, 1, 2, 3]];
            const buf = buildFaceIndexBuffer(faces);
            expect(buf.length).toBe(6); // 2 triangles × 3
        });

        it('triangulates polygons via fan', () => {
            const faces = [[0, 1, 2, 3, 4]]; // pentagon
            const buf = buildFaceIndexBuffer(faces);
            expect(buf.length).toBe(9); // 3 triangles × 3
        });

        it('supports Uint32Array', () => {
            const faces = [[0, 1, 2]];
            const buf = buildFaceIndexBuffer(faces, true);
            expect(buf).toBeInstanceOf(Uint32Array);
        });
    });

    describe('buildInterleavedBuffer', () => {
        it('interleaves position and color with xyzw', () => {
            const colors = [[1, 0, 0, 1]];
            const buf = buildInterleavedBuffer([vec4(1, 2, 3, 4)], colors, 'xyzw');
            const stride = 4 + 4; // xyzw + rgba
            expect(buf.length).toBe(stride);
            expect(buf[0]).toBe(1); // x
            expect(buf[3]).toBe(4); // w
            expect(buf[4]).toBe(1); // r
            expect(buf[7]).toBe(1); // a
        });

        it('interleaves position and color with xyz', () => {
            const colors = [[0, 1, 0, 1]];
            const buf = buildInterleavedBuffer([vec4(1, 2, 3, 4)], colors, 'xyz');
            const stride = 3 + 4; // xyz + rgba
            expect(buf.length).toBe(stride);
            expect(buf[0]).toBe(1); // x
            expect(buf[2]).toBe(3); // z
            expect(buf[3]).toBe(0); // r
        });
    });

    describe('generateWDepthColors', () => {
        it('returns RGBA arrays per vertex', () => {
            const colors = generateWDepthColors(testVerts);
            expect(colors).toHaveLength(4);
            for (const c of colors) {
                expect(c).toHaveLength(4);
                expect(c[3]).toBe(1); // alpha always 1
            }
        });

        it('differentiates positive and negative W', () => {
            const posW = [vec4(0, 0, 0, 1)];
            const negW = [vec4(0, 0, 0, -1)];
            const colorsPos = generateWDepthColors(posW);
            const colorsNeg = generateWDepthColors(negW);
            // They should be different colors
            expect(colorsPos[0][0]).not.toBeCloseTo(colorsNeg[0][0], 1);
        });
    });

    describe('generateRainbowColors', () => {
        it('generates correct count of colors', () => {
            const colors = generateRainbowColors(10);
            expect(colors).toHaveLength(10);
        });

        it('all colors have RGBA format with alpha=1', () => {
            const colors = generateRainbowColors(5);
            for (const c of colors) {
                expect(c).toHaveLength(4);
                expect(c[3]).toBe(1);
            }
        });

        it('RGB values are in [0,1] range', () => {
            const colors = generateRainbowColors(100);
            for (const c of colors) {
                expect(c[0]).toBeGreaterThanOrEqual(0);
                expect(c[0]).toBeLessThanOrEqual(1);
                expect(c[1]).toBeGreaterThanOrEqual(0);
                expect(c[1]).toBeLessThanOrEqual(1);
                expect(c[2]).toBeGreaterThanOrEqual(0);
                expect(c[2]).toBeLessThanOrEqual(1);
            }
        });
    });

    describe('buildGeometryBuffers', () => {
        it('builds complete buffer set from tesseract', () => {
            const geom = generateTesseract();
            const buffers = buildGeometryBuffers(geom);
            expect(buffers.vertices).toBeInstanceOf(Float32Array);
            expect(buffers.vertexCount).toBe(16);
            expect(buffers.stride).toBe(4); // xyzw
            expect(buffers.edgeIndices).toBeInstanceOf(Uint16Array);
            expect(buffers.edgeCount).toBe(32);
            expect(buffers.faceIndices).toBeDefined();
            expect(buffers.colors).toBeInstanceOf(Float32Array);
        });

        it('respects xyz format', () => {
            const geom = generateTesseract();
            const buffers = buildGeometryBuffers(geom, { format: 'xyz' });
            expect(buffers.stride).toBe(3);
            expect(buffers.vertices.length).toBe(16 * 3);
        });

        it('includes normals when requested', () => {
            const geom = generateTesseract();
            const buffers = buildGeometryBuffers(geom, { includeNormals: true });
            expect(buffers.normals).toBeInstanceOf(Float32Array);
            expect(buffers.normals.length).toBe(16 * 3);
        });

        it('supports uniform color mode', () => {
            const geom = generateTesseract();
            const color = [0.5, 0.5, 0.5, 1];
            const buffers = buildGeometryBuffers(geom, { colorMode: 'uniform', uniformColor: color });
            // All vertices should have the same color
            for (let i = 0; i < 16; i++) {
                expect(buffers.colors[i * 4]).toBeCloseTo(0.5);
                expect(buffers.colors[i * 4 + 1]).toBeCloseTo(0.5);
            }
        });
    });
});
