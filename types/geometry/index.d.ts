/**
 * Geometry Module TypeScript Definitions
 * GeometryLibrary, generators, BufferBuilder
 */

import { Vec4 } from '../math';

// ============================================================================
// GeometryLibrary
// ============================================================================

/** Base geometry names (8 types) */
export type BaseGeometryName = 'TETRAHEDRON' | 'HYPERCUBE' | 'SPHERE' | 'TORUS' | 'KLEIN BOTTLE' | 'FRACTAL' | 'WAVE' | 'CRYSTAL';

/** Variation parameters for a geometry at a given level */
export interface VariationParameters {
    gridDensity: number;
    morphFactor: number;
    chaos: number;
    speed: number;
    hue: number;
}

/** Static geometry library for the 8 base geometries. */
export declare class GeometryLibrary {
    /** Get all 8 geometry names. */
    static getGeometryNames(): BaseGeometryName[];

    /** Get name for a geometry type index (0-7). Returns 'UNKNOWN' for invalid. */
    static getGeometryName(type: number): string;

    /** Get variation parameters for a geometry type at a given level. */
    static getVariationParameters(geometryType: number, level: number): VariationParameters;
}

// ============================================================================
// Geometry Object (common return type from generators)
// ============================================================================

/** Standard geometry output from generators */
export interface Geometry4D {
    name: string;
    vertices: Vec4[];
    edges: number[][];
    faces: number[][];
    cells?: number;
    vertexCount: number;
    edgeCount: number;
    faceCount: number;
    radius?: number;
    tubeRadius?: number;
}

// ============================================================================
// Generators
// ============================================================================

// Tesseract
export declare function generateTesseractVertices(size?: number): Vec4[];
export declare function generateTesseractEdges(): number[][];
export declare function generateTesseractFaces(): number[][];
export declare function generateTesseract(size?: number): Geometry4D;
export declare function generateTesseractSubdivided(size?: number, subdivisions?: number): Geometry4D;

// Sphere (Hypersphere)
export declare function generateHypersphereVertices(radius?: number, segments?: number): Vec4[];
export declare function generateHypersphereFibonacci(radius?: number, count?: number): Vec4[];
export declare function generateHypersphereEdges(vertices: Vec4[], threshold?: number): number[][];
export declare function generateSphere(radius?: number, density?: number): Geometry4D;

// Torus
export declare function generateCliffordTorusVertices(radius?: number, segments?: number): Vec4[];
export declare function generateCliffordTorusEdges(segments?: number): number[][];
export declare function generateTorusVertices(majorRadius?: number, minorRadius?: number, majorSegments?: number, minorSegments?: number, wOffset?: number): Vec4[];
export declare function generateTorus(radius?: number, density?: number): Geometry4D;
export declare function generateCliffordTorus(radius?: number, tubeRadius?: number, segments?: number): Geometry4D;
export declare function generateTorus4D(radius?: number, segments?: number): Geometry4D;
export declare function generate4DTorus(r1?: number, r2?: number, r3?: number, segments?: number): Geometry4D;

// Tetrahedron
export declare function generateTetrahedron(size?: number): Geometry4D;

// Klein Bottle
export declare function generateKleinBottle(radius?: number, density?: number): Geometry4D;

// Fractal
export declare function generateFractal(depth?: number, size?: number): Geometry4D;

// Wave
export declare function generateWave(amplitude?: number, frequency?: number, segments?: number): Geometry4D;

// Crystal
export declare function generateCrystal(size?: number, facets?: number): Geometry4D;

// ============================================================================
// Warp Cores
// ============================================================================

/** Apply hypersphere (S³) projection warp to geometry vertices. */
export declare function applyHypersphereWarp(vertices: Vec4[], radius?: number): Vec4[];

/** Apply hypertetrahedron (pentatope) warp to geometry vertices. */
export declare function applyHypertetraWarp(vertices: Vec4[], scale?: number): Vec4[];

// ============================================================================
// BufferBuilder
// ============================================================================

/** Vertex buffer format */
export type VertexFormat = 'xyz' | 'xyzw';

/** Color generation mode */
export type ColorMode = 'wDepth' | 'rainbow' | 'uniform';

/** WebGL-ready geometry buffers */
export interface GeometryBuffers {
    vertices: Float32Array;
    vertexCount: number;
    stride: 3 | 4;
    edgeIndices?: Uint16Array | Uint32Array;
    edgeCount?: number;
    faceIndices?: Uint16Array | Uint32Array;
    faceCount?: number;
    normals?: Float32Array;
    colors?: Float32Array;
}

export interface GeometryBufferOptions {
    format?: VertexFormat;
    includeNormals?: boolean;
    includeColors?: boolean;
    colorMode?: ColorMode;
    uniformColor?: number[];
    use32BitIndices?: boolean;
}

/** Build Float32Array vertex buffer from Vec4 vertices. */
export declare function buildVertexBuffer(vertices: Vec4[], format?: VertexFormat): Float32Array;

/** Build edge index buffer from edge pairs. */
export declare function buildEdgeIndexBuffer(edges: number[][], use32Bit?: boolean): Uint16Array | Uint32Array;

/** Build triangle index buffer from faces (triangulates quads/polygons). */
export declare function buildFaceIndexBuffer(faces: number[][], use32Bit?: boolean): Uint16Array | Uint32Array;

/** Build interleaved position + color buffer. */
export declare function buildInterleavedBuffer(vertices: Vec4[], colors: number[][], format?: VertexFormat): Float32Array;

/** Build normal vectors from vertex and face data. */
export declare function buildNormalBuffer(vertices: Vec4[], faces: number[][]): Float32Array;

/** Generate W-depth based RGBA colors. */
export declare function generateWDepthColors(vertices: Vec4[], colorMap?: {
    nearColor?: number[];
    farColor?: number[];
    midColor?: number[];
    range?: number;
}): number[][];

/** Generate rainbow RGBA colors by vertex index. */
export declare function generateRainbowColors(vertexCount: number, saturation?: number, lightness?: number): number[][];

/** Build complete WebGL-ready geometry buffers. */
export declare function buildGeometryBuffers(geometry: Geometry4D, options?: GeometryBufferOptions): GeometryBuffers;
