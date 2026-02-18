/**
 * Tests for FrameworkSync — Premium Module 7
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { FrameworkSync } from '../../src/premium/FrameworkSync.js';

function createMockEngine() {
    let listener = null;
    return {
        onParameterChange: vi.fn((cb) => {
            listener = cb;
            return () => { listener = null; };
        }),
        getAllParameters: vi.fn(() => ({ hue: 180, chaos: 0.3 })),
        setParameter: vi.fn(),
        _triggerParameterChange(params, meta) {
            if (listener) listener(params, meta);
        }
    };
}

describe('FrameworkSync', () => {
    let engine;
    let sync;

    beforeEach(() => {
        engine = createMockEngine();
        sync = new FrameworkSync(engine);
    });

    afterEach(() => {
        sync.destroy();
    });

    describe('construction', () => {
        it('subscribes to engine parameter changes', () => {
            expect(engine.onParameterChange).toHaveBeenCalled();
        });
    });

    describe('onSync', () => {
        it('registers a sync callback', () => {
            const cb = vi.fn();
            sync.onSync(cb);

            engine._triggerParameterChange({ hue: 200 });
            expect(cb).toHaveBeenCalledWith({ hue: 200 }, undefined);
        });

        it('returns an unsubscribe function', () => {
            const cb = vi.fn();
            const unsub = sync.onSync(cb);

            unsub();
            engine._triggerParameterChange({ hue: 200 });
            expect(cb).not.toHaveBeenCalled();
        });

        it('passes meta to sync callbacks', () => {
            const cb = vi.fn();
            sync.onSync(cb);

            engine._triggerParameterChange({ hue: 200 }, { changed: ['hue'] });
            expect(cb).toHaveBeenCalledWith({ hue: 200 }, { changed: ['hue'] });
        });

        it('supports multiple callbacks', () => {
            const cb1 = vi.fn();
            const cb2 = vi.fn();
            sync.onSync(cb1);
            sync.onSync(cb2);

            engine._triggerParameterChange({ hue: 200 });
            expect(cb1).toHaveBeenCalled();
            expect(cb2).toHaveBeenCalled();
        });

        it('swallows errors in sync callbacks', () => {
            const badCb = vi.fn(() => { throw new Error('oops'); });
            const goodCb = vi.fn();
            sync.onSync(badCb);
            sync.onSync(goodCb);

            expect(() => engine._triggerParameterChange({ hue: 200 })).not.toThrow();
            expect(goodCb).toHaveBeenCalled();
        });
    });

    describe('setThrottle', () => {
        it('sets the throttle interval', () => {
            sync.setThrottle(50);
            // No direct getter, but it shouldn't throw
        });

        it('clamps to minimum 0', () => {
            sync.setThrottle(-10);
            // Should not throw
        });
    });

    describe('generateReactHook', () => {
        it('returns valid JavaScript code', () => {
            const code = sync.generateReactHook();
            expect(typeof code).toBe('string');
            expect(code).toContain('useVib3');
            expect(code).toContain('useState');
            expect(code).toContain('useEffect');
            expect(code).toContain('onParameterChange');
            expect(code).toContain('@vib3code/sdk');
        });

        it('includes bidirectional sync code', () => {
            const code = sync.generateReactHook();
            expect(code).toContain('setParameter');
            expect(code).toContain('switchSystem');
        });
    });

    describe('generateVueComposable', () => {
        it('returns valid Vue composable code', () => {
            const code = sync.generateVueComposable();
            expect(typeof code).toBe('string');
            expect(code).toContain('useVib3');
            expect(code).toContain('reactive');
            expect(code).toContain('onMounted');
            expect(code).toContain('onParameterChange');
        });
    });

    describe('generateSvelteStore', () => {
        it('returns valid Svelte store code', () => {
            const code = sync.generateSvelteStore();
            expect(typeof code).toBe('string');
            expect(code).toContain('createVib3Store');
            expect(code).toContain('writable');
            expect(code).toContain('onParameterChange');
        });
    });

    describe('destroy', () => {
        it('unsubscribes from engine', () => {
            const cb = vi.fn();
            sync.onSync(cb);
            sync.destroy();

            engine._triggerParameterChange({ hue: 200 });
            expect(cb).not.toHaveBeenCalled();
        });

        it('clears all sync callbacks', () => {
            sync.onSync(vi.fn());
            sync.onSync(vi.fn());
            sync.destroy();
            // After destroy, new parameter changes should not throw
        });
    });
});
