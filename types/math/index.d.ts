/**
 * Math Module TypeScript Definitions
 * Constants, projections, rotations, Vec4
 */

// ============================================================================
// Constants
// ============================================================================

export declare const PI: number;
export declare const TAU: number;
export declare const HALF_PI: number;
export declare const QUARTER_PI: number;

export declare const DEG_TO_RAD: number;
export declare const RAD_TO_DEG: number;

export declare const EPSILON: number;
export declare const EPSILON_NORMAL: number;
export declare const EPSILON_EQUAL: number;

export declare const PHI: number;
export declare const PHI_INV: number;

// 4D Polytope topology constants
export declare const TESSERACT_VERTICES: 16;
export declare const TESSERACT_EDGES: 32;
export declare const TESSERACT_FACES: 24;
export declare const TESSERACT_CELLS: 8;

export declare const CELL24_VERTICES: 24;
export declare const CELL24_EDGES: 96;
export declare const CELL24_FACES: 96;
export declare const CELL24_CELLS: 24;

export declare const CELL120_VERTICES: 600;
export declare const CELL120_EDGES: 1200;
export declare const CELL120_FACES: 720;
export declare const CELL120_CELLS: 120;

export declare const CELL600_VERTICES: 120;
export declare const CELL600_EDGES: 720;
export declare const CELL600_FACES: 1200;
export declare const CELL600_CELLS: 600;

// Rotation plane indices
export declare const PLANE_XY: 0;
export declare const PLANE_XZ: 1;
export declare const PLANE_YZ: 2;
export declare const PLANE_XW: 3;
export declare const PLANE_YW: 4;
export declare const PLANE_ZW: 5;

export declare const PLANE_NAMES: ['XY', 'XZ', 'YZ', 'XW', 'YW', 'ZW'];

// Base geometry indices
export declare const GEOMETRY_TETRAHEDRON: 0;
export declare const GEOMETRY_HYPERCUBE: 1;
export declare const GEOMETRY_SPHERE: 2;
export declare const GEOMETRY_TORUS: 3;
export declare const GEOMETRY_KLEIN: 4;
export declare const GEOMETRY_FRACTAL: 5;
export declare const GEOMETRY_WAVE: 6;
export declare const GEOMETRY_CRYSTAL: 7;

// Core type indices
export declare const CORE_BASE: 0;
export declare const CORE_HYPERSPHERE: 1;
export declare const CORE_HYPERTETRAHEDRON: 2;

/** Encode base + core type into geometry index (0-23). */
export declare function encodeGeometry(baseIndex: number, coreIndex: number): number;

/** Decode geometry index into base and core type. */
export declare function decodeGeometry(geometryIndex: number): { baseIndex: number; coreIndex: number };

/** Convert degrees to radians. */
export declare function toRadians(degrees: number): number;

/** Convert radians to degrees. */
export declare function toDegrees(radians: number): number;

/** Clamp value to [min, max]. */
export declare function clamp(value: number, min: number, max: number): number;

/** Linear interpolation: a + (b - a) * t. */
export declare function lerp(a: number, b: number, t: number): number;

/** Smooth Hermite interpolation (cubic). */
export declare function smoothstep(t: number): number;

/** Smoother step interpolation (quintic). */
export declare function smootherstep(t: number): number;

// ============================================================================
// Projections
// ============================================================================

/** Result of a 4D→3D projection */
export interface ProjectionResult {
    x: number;
    y: number;
    z: number;
    denom: number;
}

/** Options for perspective projection */
export interface PerspectiveOptions {
    /** Projection distance (default: 2) */
    distance?: number;
    /** Minimum absolute denominator (default: 1e-5) */
    epsilon?: number;
}

/** Options for stereographic projection */
export interface StereographicOptions {
    /** Minimum absolute denominator (default: 1e-5) */
    epsilon?: number;
}

/**
 * Perspective projection: P.xyz = v.xyz / (distance - v.w)
 * Most intuitive projection — closer objects appear larger.
 */
export declare function perspectiveProject4D(v: number[], options?: PerspectiveOptions): ProjectionResult;

/**
 * Stereographic projection: P.xyz = v.xyz / (1 - v.w)
 * Conformal — preserves angles locally.
 */
export declare function stereographicProject4D(v: number[], options?: StereographicOptions): ProjectionResult;

// ============================================================================
// Rotations
// ============================================================================

/** Canonical rotation plane name */
export type RotationPlane = 'XY' | 'XZ' | 'YZ' | 'XW' | 'YW' | 'ZW';

/** 16-element column-major 4×4 matrix */
export type Matrix4x4 = number[];

/** 4-element vector [x, y, z, w] */
export type Vector4D = number[];

/** Sparse angle map (plane name → angle in radians) */
export type AngleMap = Partial<Record<RotationPlane, number>>;

export declare const ROTATION_PLANES: RotationPlane[];

/** Create a 4D rotation matrix for a given plane and angle. */
export declare function createRotationMatrix4D(plane: RotationPlane | string, angle: number): Matrix4x4;

/** Return a 16-element identity matrix. */
export declare function identityMatrix4x4(): Matrix4x4;

/** Multiply two 16-element column-major matrices. */
export declare function multiplyMatrix4x4(a: Matrix4x4, b: Matrix4x4): Matrix4x4;

/** Transpose a 16-element column-major matrix. */
export declare function transposeMatrix4x4(m: Matrix4x4): Matrix4x4;

/** Apply a 4×4 matrix to a 4-element vector. */
export declare function applyMatrix4x4(m: Matrix4x4, v: Vector4D): Vector4D;

/** Compute Euclidean length of a 4D vector. */
export declare function vectorLength4D(v: Vector4D): number;

/** Normalize a 4D vector to unit length. */
export declare function normalizeVector4D(v: Vector4D): Vector4D;

/** Normalize angle keys to uppercase, filling missing planes with 0. */
export declare function normalizeRotationAngles(angles: Record<string, number>): Record<RotationPlane, number>;

/** Create rotation matrices for all 6 planes from an angle map. */
export declare function createRotationMatricesFromAngles(angles: Record<string, number>): Record<RotationPlane, Matrix4x4>;

/** Compose a single rotation matrix from angles (XY*XZ*YZ*XW*YW*ZW order). */
export declare function composeRotationMatrixFromAngles(angles: Record<string, number>): Matrix4x4;

// ============================================================================
// Vec4
// ============================================================================

/** 4D vector class */
export declare class Vec4 {
    x: number;
    y: number;
    z: number;
    w: number;

    constructor(x?: number, y?: number, z?: number, w?: number);

    /** Linear interpolation to another Vec4. */
    lerp(other: Vec4, t: number): Vec4;

    /** Euclidean distance to another Vec4. */
    distanceTo(other: Vec4): number;

    /** Vector length. */
    length(): number;

    /** Normalize to unit length. */
    normalize(): Vec4;

    /** Dot product. */
    dot(other: Vec4): number;

    /** Clone this vector. */
    clone(): Vec4;

    /** Convert to array [x, y, z, w]. */
    toArray(): number[];
}
