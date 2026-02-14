import { describe, it, expect, beforeEach } from 'vitest';
import {
    ObjectPool,
    TypedArrayPool,
    Vec4Pool,
    PoolManager
} from '../../src/scene/MemoryPool.js';

describe('ObjectPool', () => {
    let pool;

    beforeEach(() => {
        pool = new ObjectPool(
            () => ({ x: 0, y: 0 }),
            (obj) => { obj.x = 0; obj.y = 0; }
        );
    });

    describe('acquire', () => {
        it('creates new object when pool empty', () => {
            const obj = pool.acquire();
            expect(obj).toHaveProperty('x');
            expect(obj).toHaveProperty('y');
        });

        it('increments total allocations', () => {
            pool.acquire();
            pool.acquire();
            expect(pool.getStats().totalAllocations).toBe(2);
        });

        it('records misses for new objects', () => {
            pool.acquire();
            expect(pool.getStats().misses).toBe(1);
        });
    });

    describe('release', () => {
        it('returns object to pool', () => {
            const obj = pool.acquire();
            const returned = pool.release(obj);
            expect(returned).toBe(true);
            expect(pool.available).toBe(1);
            expect(pool.inUse).toBe(0);
        });

        it('resets object on release', () => {
            const obj = pool.acquire();
            obj.x = 42;
            obj.y = 99;
            pool.release(obj);
            expect(obj.x).toBe(0);
            expect(obj.y).toBe(0);
        });

        it('returns false for unknown object', () => {
            expect(pool.release({ x: 0, y: 0 })).toBe(false);
        });

        it('reuses released objects (pool hit)', () => {
            const obj = pool.acquire();
            pool.release(obj);
            const reused = pool.acquire();
            expect(reused).toBe(obj);
            expect(pool.getStats().hits).toBe(1);
        });
    });

    describe('maxSize', () => {
        it('rejects release when pool is full', () => {
            const small = new ObjectPool(() => ({}), null, { maxSize: 1 });
            const a = small.acquire();
            const b = small.acquire();
            small.release(a);
            const returned = small.release(b);
            expect(returned).toBe(false);
        });
    });

    describe('preWarm', () => {
        it('pre-warms pool with initial objects', () => {
            const warmed = new ObjectPool(() => ({}), null, { initialSize: 5, preWarm: true });
            expect(warmed.available).toBe(5);
        });

        it('skips pre-warm when disabled', () => {
            const cold = new ObjectPool(() => ({}), null, { initialSize: 5, preWarm: false });
            expect(cold.available).toBe(0);
        });
    });

    describe('releaseAll', () => {
        it('releases all in-use objects', () => {
            pool.acquire();
            pool.acquire();
            pool.acquire();
            expect(pool.inUse).toBe(3);
            pool.releaseAll();
            expect(pool.inUse).toBe(0);
            expect(pool.available).toBe(3);
        });
    });

    describe('clear', () => {
        it('clears both available and in-use', () => {
            pool.acquire();
            pool.acquire();
            const obj = pool.acquire();
            pool.release(obj);
            pool.clear();
            expect(pool.available).toBe(0);
            expect(pool.inUse).toBe(0);
        });
    });

    describe('getStats', () => {
        it('reports hit rate', () => {
            const obj = pool.acquire();
            pool.release(obj);
            pool.acquire(); // Should be a hit
            const stats = pool.getStats();
            expect(stats.hitRate).toBe(0.5); // 1 hit / 2 total
        });

        it('reports 0 hit rate with no allocations', () => {
            expect(pool.getStats().hitRate).toBe(0);
        });
    });
});

describe('TypedArrayPool', () => {
    let pool;

    beforeEach(() => {
        pool = new TypedArrayPool();
    });

    describe('acquireFloat32', () => {
        it('returns Float32Array', () => {
            const arr = pool.acquireFloat32(16);
            expect(arr).toBeInstanceOf(Float32Array);
        });

        it('returns array with power-of-2 size', () => {
            const arr = pool.acquireFloat32(10);
            // Should be rounded up to 16
            expect(arr.length).toBe(16);
        });

        it('minimum size is 16', () => {
            const arr = pool.acquireFloat32(1);
            expect(arr.length).toBe(16);
        });
    });

    describe('releaseFloat32', () => {
        it('clears array data on release', () => {
            const arr = pool.acquireFloat32(16);
            arr[0] = 42;
            pool.releaseFloat32(arr);
            expect(arr[0]).toBe(0);
        });

        it('reuses released arrays (hit)', () => {
            const arr = pool.acquireFloat32(16);
            pool.releaseFloat32(arr);
            const reused = pool.acquireFloat32(16);
            expect(reused).toBe(arr);
            expect(pool.getStats().hits).toBe(1);
        });
    });

    describe('acquireUint16', () => {
        it('returns Uint16Array', () => {
            const arr = pool.acquireUint16(32);
            expect(arr).toBeInstanceOf(Uint16Array);
        });
    });

    describe('acquireUint32', () => {
        it('returns Uint32Array', () => {
            const arr = pool.acquireUint32(64);
            expect(arr).toBeInstanceOf(Uint32Array);
        });
    });

    describe('clear', () => {
        it('clears all type pools', () => {
            const f = pool.acquireFloat32(16);
            const u16 = pool.acquireUint16(16);
            const u32 = pool.acquireUint32(16);
            pool.releaseFloat32(f);
            pool.releaseUint16(u16);
            pool.releaseUint32(u32);
            pool.clear();
            const stats = pool.getStats();
            expect(stats.float32Pooled).toBe(0);
            expect(stats.uint16Pooled).toBe(0);
            expect(stats.uint32Pooled).toBe(0);
        });
    });

    describe('getStats', () => {
        it('tracks total allocations and hits', () => {
            pool.acquireFloat32(16);
            pool.acquireUint16(32);
            const stats = pool.getStats();
            expect(stats.totalAllocations).toBe(2);
        });
    });
});

describe('Vec4Pool', () => {
    let pool;

    // Simple Vec4 mock
    class MockVec4 {
        constructor(x = 0, y = 0, z = 0, w = 0) {
            this.x = x; this.y = y; this.z = z; this.w = w;
        }
    }

    beforeEach(() => {
        pool = new Vec4Pool(10);
        pool.init(MockVec4);
    });

    it('throws if not initialized', () => {
        const uninit = new Vec4Pool();
        expect(() => uninit.acquire()).toThrow('not initialized');
    });

    it('pre-warms pool on init', () => {
        expect(pool.getStats().available).toBe(10);
    });

    it('acquires with custom values', () => {
        const v = pool.acquire(1, 2, 3, 4);
        expect(v.x).toBe(1);
        expect(v.y).toBe(2);
        expect(v.z).toBe(3);
        expect(v.w).toBe(4);
    });

    it('releases and resets to zero', () => {
        const v = pool.acquire(1, 2, 3, 4);
        pool.release(v);
        expect(v.x).toBe(0);
        expect(v.y).toBe(0);
    });

    it('releaseAll returns all to pool', () => {
        pool.acquire(1, 0, 0, 0);
        pool.acquire(0, 1, 0, 0);
        pool.acquire(0, 0, 1, 0);
        expect(pool.getStats().inUse).toBe(3);
        pool.releaseAll();
        expect(pool.getStats().inUse).toBe(0);
    });
});

describe('PoolManager', () => {
    let manager;

    beforeEach(() => {
        manager = new PoolManager();
    });

    it('provides typed array pool', () => {
        const arr = manager.typedArrays.acquireFloat32(32);
        expect(arr).toBeInstanceOf(Float32Array);
    });

    it('registers custom pools', () => {
        const pool = manager.registerPool('particles', () => ({ pos: [0, 0, 0] }));
        expect(pool).toBeInstanceOf(ObjectPool);
        expect(manager.getPool('particles')).toBe(pool);
    });

    it('returns undefined for unregistered pool', () => {
        expect(manager.getPool('nonexistent')).toBeUndefined();
    });

    it('clearAll releases all pools', () => {
        const pool = manager.registerPool('test', () => ({}));
        pool.acquire();
        manager.clearAll();
        expect(pool.available).toBe(0);
        expect(pool.inUse).toBe(0);
    });

    it('getStats combines all pool stats', () => {
        manager.registerPool('p1', () => ({}));
        manager.typedArrays.acquireFloat32(16);
        const stats = manager.getStats();
        expect(stats.objectPools).toHaveProperty('p1');
        expect(stats.typedArrays).toBeDefined();
        expect(stats.vec4).toBeDefined();
        expect(stats.mat4x4).toBeDefined();
    });
});
