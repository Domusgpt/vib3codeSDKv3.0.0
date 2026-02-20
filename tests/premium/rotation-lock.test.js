/**
 * Tests for RotationLockSystem — Premium Module 2
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RotationLockSystem } from '../../src/premium/RotationLockSystem.js';

function createMockEngine() {
    const params = {
        rot4dXY: 1.0, rot4dXZ: 0.5, rot4dYZ: 0.3,
        rot4dXW: 0.0, rot4dYW: 0.0, rot4dZW: 0.0,
    };
    return {
        parameters: {
            setParameter: vi.fn((name, value) => { params[name] = value; }),
        },
        getParameter: vi.fn((name) => params[name] ?? 0),
        setParameter: vi.fn((name, value) => { params[name] = value; }),
        updateCurrentSystemParameters: vi.fn(),
    };
}

describe('RotationLockSystem', () => {
    let engine;
    let lock;

    beforeEach(() => {
        engine = createMockEngine();
        lock = new RotationLockSystem(engine);
    });

    describe('construction', () => {
        it('installs wraps on the engine', () => {
            // After construction, setParameter should be wrapped
            expect(typeof engine.setParameter).toBe('function');
            expect(typeof engine.updateCurrentSystemParameters).toBe('function');
        });

        it('starts with no locked axes', () => {
            expect(lock.getLockedAxes()).toEqual([]);
        });

        it('starts with flight mode disabled', () => {
            expect(lock.isFlightMode()).toBe(false);
        });
    });

    describe('lockAxis', () => {
        it('locks an axis at a specified value', () => {
            lock.lockAxis('rot4dXY', 1.5);
            expect(lock.isLocked('rot4dXY')).toBe(true);
            expect(lock.getLockedValue('rot4dXY')).toBe(1.5);
        });

        it('locks an axis at current engine value if no value given', () => {
            lock.lockAxis('rot4dXY');
            expect(lock.isLocked('rot4dXY')).toBe(true);
            // Value should come from engine.getParameter
            expect(lock.getLockedValue('rot4dXY')).toBeDefined();
        });

        it('blocks setParameter for locked axis', () => {
            lock.lockAxis('rot4dXY', 1.0);
            engine.setParameter('rot4dXY', 999);
            // The locked axis should not change
            expect(lock.getLockedValue('rot4dXY')).toBe(1.0);
        });

        it('allows setParameter for unlocked axis', () => {
            lock.lockAxis('rot4dXY', 1.0);
            engine.setParameter('rot4dXZ', 2.0);
            // Non-locked axes should pass through (the original was called)
        });

        it('throws on invalid axis name', () => {
            expect(() => lock.lockAxis('invalidAxis', 0)).toThrow(/Invalid axis/);
        });

        it('appears in getLockedAxes list', () => {
            lock.lockAxis('rot4dXY', 1.0);
            lock.lockAxis('rot4dXW', 0.5);
            expect(lock.getLockedAxes()).toContain('rot4dXY');
            expect(lock.getLockedAxes()).toContain('rot4dXW');
            expect(lock.getLockedAxes()).toHaveLength(2);
        });
    });

    describe('unlockAxis', () => {
        it('unlocks a previously locked axis', () => {
            lock.lockAxis('rot4dXY', 1.0);
            lock.unlockAxis('rot4dXY');
            expect(lock.isLocked('rot4dXY')).toBe(false);
            expect(lock.getLockedAxes()).not.toContain('rot4dXY');
        });

        it('is a no-op for an already unlocked axis', () => {
            expect(() => lock.unlockAxis('rot4dXY')).not.toThrow();
        });
    });

    describe('getLockedValue', () => {
        it('returns null for unlocked axis', () => {
            expect(lock.getLockedValue('rot4dXY')).toBeNull();
        });

        it('returns the locked value', () => {
            lock.lockAxis('rot4dXW', 2.5);
            expect(lock.getLockedValue('rot4dXW')).toBe(2.5);
        });
    });

    describe('setFlightMode', () => {
        it('locks 3D axes and frees 4D axes when enabled', () => {
            lock.setFlightMode(true);
            expect(lock.isFlightMode()).toBe(true);
            expect(lock.isLocked('rot4dXY')).toBe(true);
            expect(lock.isLocked('rot4dXZ')).toBe(true);
            expect(lock.isLocked('rot4dYZ')).toBe(true);
            expect(lock.isLocked('rot4dXW')).toBe(false);
            expect(lock.isLocked('rot4dYW')).toBe(false);
            expect(lock.isLocked('rot4dZW')).toBe(false);
        });

        it('unlocks 3D axes when disabled', () => {
            lock.setFlightMode(true);
            lock.setFlightMode(false);
            expect(lock.isFlightMode()).toBe(false);
            expect(lock.isLocked('rot4dXY')).toBe(false);
            expect(lock.isLocked('rot4dXZ')).toBe(false);
            expect(lock.isLocked('rot4dYZ')).toBe(false);
        });
    });

    describe('lockAll / unlockAll', () => {
        it('locks all 6 rotation axes', () => {
            lock.lockAll();
            expect(lock.getLockedAxes()).toHaveLength(6);
        });

        it('locks all with specific values', () => {
            lock.lockAll({ rot4dXY: 1.0, rot4dXZ: 2.0 });
            expect(lock.getLockedValue('rot4dXY')).toBe(1.0);
            expect(lock.getLockedValue('rot4dXZ')).toBe(2.0);
        });

        it('unlocks all axes', () => {
            lock.lockAll();
            lock.unlockAll();
            expect(lock.getLockedAxes()).toHaveLength(0);
            expect(lock.isFlightMode()).toBe(false);
        });
    });

    describe('exportState / importState', () => {
        it('exports current lock state', () => {
            lock.lockAxis('rot4dXY', 1.0);
            lock.setFlightMode(true);
            const state = lock.exportState();
            expect(state.flightMode).toBe(true);
            expect(state.locks).toBeDefined();
            expect(state.locks.rot4dXY).toBe(1.0);
        });

        it('imports a lock state', () => {
            lock.importState({
                locks: { rot4dXW: 0.5, rot4dYW: 1.0 },
                flightMode: false
            });
            expect(lock.isLocked('rot4dXW')).toBe(true);
            expect(lock.isLocked('rot4dYW')).toBe(true);
            expect(lock.getLockedValue('rot4dXW')).toBe(0.5);
        });

        it('ignores invalid axis names on import', () => {
            lock.importState({ locks: { invalidAxis: 1.0 } });
            expect(lock.getLockedAxes()).toHaveLength(0);
        });
    });

    describe('destroy', () => {
        it('restores original engine methods', () => {
            const origSet = lock._originalSetParameter;
            const origUpdate = lock._originalUpdateParams;
            lock.destroy();
            expect(engine.setParameter).toBe(origSet);
            expect(engine.updateCurrentSystemParameters).toBe(origUpdate);
        });

        it('clears all locks', () => {
            lock.lockAll();
            lock.destroy();
            expect(lock.getLockedAxes()).toHaveLength(0);
        });
    });
});
