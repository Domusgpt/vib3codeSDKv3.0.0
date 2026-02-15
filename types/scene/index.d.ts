/**
 * Scene Module TypeScript Definitions
 * MemoryPool (ObjectPool, TypedArrayPool, Vec4Pool, Mat4x4Pool, PoolManager)
 */

import { Vec4 } from '../math';

// ============================================================================
// ObjectPool
// ============================================================================

/** Pool statistics */
export interface PoolStats {
    available: number;
    inUse: number;
    totalAllocations: number;
    hits: number;
    misses: number;
    hitRate: number;
}

/** Object pool options */
export interface ObjectPoolOptions {
    /** Maximum pool size (0 = unlimited) */
    maxSize?: number;
    /** Initial pre-warm count */
    initialSize?: number;
    /** Whether to pre-warm on construction (default: true) */
    preWarm?: boolean;
}

/**
 * Generic object pool to reduce GC pressure.
 * @template T - The type of objects managed by the pool
 */
export declare class ObjectPool<T = any> {
    maxSize: number;
    initialSize: number;
    preWarm: boolean;

    /** Number of available (pooled) objects. */
    readonly available: number;

    /** Number of objects currently in use. */
    readonly inUse: number;

    constructor(factory: () => T, reset?: ((obj: T) => void) | null, options?: ObjectPoolOptions);

    /** Acquire an object from the pool (creates new if empty). */
    acquire(): T;

    /** Release an object back to the pool. Returns true if accepted. */
    release(obj: T): boolean;

    /** Release all in-use objects back to the pool. */
    releaseAll(): void;

    /** Clear both available and in-use pools. */
    clear(): void;

    /** Get pool statistics (hit rate, allocations). */
    getStats(): PoolStats;
}

// ============================================================================
// TypedArrayPool
// ============================================================================

/** TypedArray pool statistics */
export interface TypedArrayPoolStats {
    float32Pooled: number;
    uint16Pooled: number;
    uint32Pooled: number;
    totalAllocations: number;
    hits: number;
    hitRate: number;
}

/**
 * Efficient typed array pool with power-of-2 bucketing.
 * Manages Float32Array, Uint16Array, and Uint32Array pools.
 */
export declare class TypedArrayPool {
    constructor();

    /** Acquire a Float32Array (size rounded up to power of 2, min 16). */
    acquireFloat32(size: number): Float32Array;

    /** Release a Float32Array back to the pool (cleared to 0). */
    releaseFloat32(arr: Float32Array): void;

    /** Acquire a Uint16Array. */
    acquireUint16(size: number): Uint16Array;

    /** Release a Uint16Array. */
    releaseUint16(arr: Uint16Array): void;

    /** Acquire a Uint32Array. */
    acquireUint32(size: number): Uint32Array;

    /** Release a Uint32Array. */
    releaseUint32(arr: Uint32Array): void;

    /** Clear all pools. */
    clear(): void;

    /** Get pool statistics. */
    getStats(): TypedArrayPoolStats;
}

// ============================================================================
// Vec4Pool
// ============================================================================

/**
 * Specialized pool for Vec4 instances.
 * Must be initialized with a Vec4 class before use.
 */
export declare class Vec4Pool {
    constructor(initialSize?: number);

    /** Initialize the pool with a Vec4 class. */
    init(Vec4Class: new (x: number, y: number, z: number, w: number) => Vec4): void;

    /** Acquire a Vec4 with specified values. Throws if not initialized. */
    acquire(x?: number, y?: number, z?: number, w?: number): Vec4;

    /** Release a Vec4 back to the pool. */
    release(vec: Vec4): void;

    /** Release all vectors. */
    releaseAll(): void;

    /** Get pool statistics. */
    getStats(): { available: number; inUse: number };
}

// ============================================================================
// Mat4x4Pool
// ============================================================================

/**
 * Specialized pool for 4×4 matrix instances.
 * Must be initialized with a Mat4x4 class before use.
 */
export declare class Mat4x4Pool {
    constructor(initialSize?: number);

    /** Initialize with a Mat4x4 class. */
    init(Mat4x4Class: { identity(): any }): void;

    /** Acquire an identity matrix. Throws if not initialized. */
    acquireIdentity(): any;

    /** Release a matrix. */
    release(mat: any): void;

    /** Release all matrices. */
    releaseAll(): void;

    /** Get pool statistics. */
    getStats(): { available: number; inUse: number };
}

// ============================================================================
// PoolManager
// ============================================================================

/** Combined stats from all pool types */
export interface PoolManagerStats {
    objectPools: Record<string, PoolStats>;
    typedArrays: TypedArrayPoolStats;
    vec4: { available: number; inUse: number };
    mat4x4: { available: number; inUse: number };
}

/**
 * Global pool manager coordinating all pool types.
 */
export declare class PoolManager {
    typedArrays: TypedArrayPool;
    vec4: Vec4Pool;
    mat4x4: Mat4x4Pool;

    constructor();

    /** Initialize Vec4 and Mat4x4 pools with their classes. */
    initMathPools(Vec4Class: any, Mat4x4Class: any): void;

    /** Register a named custom object pool. */
    registerPool<T>(name: string, factory: () => T, reset?: ((obj: T) => void) | null, options?: ObjectPoolOptions): ObjectPool<T>;

    /** Get a registered pool by name. */
    getPool<T = any>(name: string): ObjectPool<T> | undefined;

    /** Clear all pools. */
    clearAll(): void;

    /** Get combined statistics. */
    getStats(): PoolManagerStats;
}

/** Default global pool manager instance. */
export declare const pools: PoolManager;
