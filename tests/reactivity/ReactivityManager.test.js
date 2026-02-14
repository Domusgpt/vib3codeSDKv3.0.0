import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReactivityManager } from '../../src/reactivity/ReactivityManager.js';
import { ReactivityConfig } from '../../src/reactivity/ReactivityConfig.js';

describe('ReactivityManager', () => {
    let manager;
    let updateFn;

    beforeEach(() => {
        updateFn = vi.fn();
        manager = new ReactivityManager(updateFn);
    });

    afterEach(() => {
        manager.destroy();
    });

    describe('constructor', () => {
        it('starts inactive', () => {
            expect(manager.isActive).toBe(false);
        });

        it('uses provided update function', () => {
            manager.setBaseParameter('chaos', 0);
            manager.addDelta('chaos', 0.5, 'add');
            manager.applyDeltas();
            expect(updateFn).toHaveBeenCalledWith('chaos', 0.5);
        });

        it('has default input state', () => {
            expect(manager.inputState.audio).toEqual({ bass: 0, mid: 0, high: 0, energy: 0 });
            expect(manager.inputState.tilt).toEqual({ alpha: 0, beta: 0, gamma: 0 });
            expect(manager.inputState.mouse).toEqual({ x: 0.5, y: 0.5, velocityX: 0, velocityY: 0 });
        });

        it('has default config', () => {
            const cfg = manager.getConfig();
            expect(cfg.audio.enabled).toBe(false);
            expect(cfg.interaction.enabled).toBe(true);
        });
    });

    describe('loadConfig', () => {
        it('accepts ReactivityConfig instance', () => {
            const cfg = new ReactivityConfig({ audio: { enabled: true } });
            const result = manager.loadConfig(cfg);
            expect(result.valid).toBe(true);
            expect(manager.getConfig().audio.enabled).toBe(true);
        });

        it('accepts plain object', () => {
            const result = manager.loadConfig({ audio: { enabled: true } });
            expect(result.valid).toBe(true);
            expect(manager.getConfig().audio.enabled).toBe(true);
        });

        it('emits configChanged event', () => {
            const spy = vi.fn();
            manager.on('configChanged', spy);
            manager.loadConfig({ audio: { enabled: true } });
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('start / stop', () => {
        it('start activates the system', () => {
            manager.start();
            expect(manager.isActive).toBe(true);
        });

        it('stop deactivates the system', () => {
            manager.start();
            manager.stop();
            expect(manager.isActive).toBe(false);
        });

        it('start is idempotent', () => {
            manager.start();
            manager.start();
            expect(manager.isActive).toBe(true);
        });

        it('emits started/stopped events', () => {
            const startSpy = vi.fn();
            const stopSpy = vi.fn();
            manager.on('started', startSpy);
            manager.on('stopped', stopSpy);
            manager.start();
            expect(startSpy).toHaveBeenCalled();
            manager.stop();
            expect(stopSpy).toHaveBeenCalled();
        });
    });

    describe('input methods', () => {
        it('setAudioInput updates audio state', () => {
            manager.setAudioInput(0.8, 0.5, 0.3);
            expect(manager.inputState.audio.bass).toBe(0.8);
            expect(manager.inputState.audio.mid).toBe(0.5);
            expect(manager.inputState.audio.high).toBe(0.3);
            // Energy is average when not explicitly provided
            expect(manager.inputState.audio.energy).toBeCloseTo((0.8 + 0.5 + 0.3) / 3);
        });

        it('setAudioInput accepts explicit energy', () => {
            manager.setAudioInput(0.8, 0.5, 0.3, 0.9);
            expect(manager.inputState.audio.energy).toBe(0.9);
        });

        it('setAudioInput clamps values to 0-1', () => {
            manager.setAudioInput(5, -3, 2);
            expect(manager.inputState.audio.bass).toBe(1);
            expect(manager.inputState.audio.mid).toBe(0);
            expect(manager.inputState.audio.high).toBe(1);
        });

        it('setAudioInput handles NaN gracefully', () => {
            manager.setAudioInput(NaN, NaN, NaN);
            expect(manager.inputState.audio.bass).toBe(0);
            expect(manager.inputState.audio.mid).toBe(0);
            expect(manager.inputState.audio.high).toBe(0);
        });

        it('setTiltInput updates tilt state', () => {
            manager.setTiltInput(45, 30, 15);
            expect(manager.inputState.tilt.alpha).toBe(45);
            expect(manager.inputState.tilt.beta).toBe(30);
            expect(manager.inputState.tilt.gamma).toBe(15);
        });

        it('setMouseInput updates mouse state', () => {
            manager.setMouseInput(0.7, 0.3, 5, -2);
            expect(manager.inputState.mouse.x).toBe(0.7);
            expect(manager.inputState.mouse.y).toBe(0.3);
            expect(manager.inputState.mouse.velocityX).toBe(5);
            expect(manager.inputState.mouse.velocityY).toBe(-2);
        });

        it('setMouseInput clamps position to 0-1', () => {
            manager.setMouseInput(5, -3);
            expect(manager.inputState.mouse.x).toBe(1);
            expect(manager.inputState.mouse.y).toBe(0);
        });

        it('triggerClick sets click intensity', () => {
            manager.triggerClick(0.8);
            expect(manager.inputState.click.intensity).toBe(0.8);
            expect(manager.inputState.click.lastTime).toBeGreaterThan(0);
        });

        it('triggerClick clamps intensity to 0-2', () => {
            manager.triggerClick(5);
            expect(manager.inputState.click.intensity).toBe(2);
        });

        it('setScrollDelta accumulates delta', () => {
            manager.setScrollDelta(10);
            manager.setScrollDelta(5);
            expect(manager.inputState.scroll.delta).toBe(15);
        });

        it('setScrollDelta ignores non-finite values', () => {
            manager.setScrollDelta(NaN);
            expect(manager.inputState.scroll.delta).toBe(0);
        });

        it('setTouchInput updates touch state', () => {
            manager.setTouchInput([{ id: 1 }], 1.5, 0.2);
            expect(manager.inputState.touch.touches).toHaveLength(1);
            expect(manager.inputState.touch.pinchScale).toBe(1.5);
            expect(manager.inputState.touch.rotation).toBe(0.2);
        });
    });

    describe('base parameters', () => {
        it('setBaseParameter sets single param', () => {
            manager.setBaseParameter('chaos', 0.5);
            expect(manager.baseParameters.chaos).toBe(0.5);
        });

        it('setBaseParameters merges params', () => {
            manager.setBaseParameters({ chaos: 0.3, speed: 2 });
            expect(manager.baseParameters.chaos).toBe(0.3);
            expect(manager.baseParameters.speed).toBe(2);
        });
    });

    describe('addDelta', () => {
        it('adds delta in add mode', () => {
            manager.addDelta('chaos', 0.3, 'add');
            manager.addDelta('chaos', 0.2, 'add');
            expect(manager.reactivityDeltas.chaos.value).toBeCloseTo(0.5);
        });

        it('replaces in replace mode', () => {
            manager.addDelta('chaos', 0.3, 'add');
            manager.addDelta('chaos', 0.7, 'replace');
            expect(manager.reactivityDeltas.chaos.value).toBe(0.7);
        });

        it('takes max in max mode', () => {
            manager.addDelta('chaos', 0.3, 'max');
            manager.addDelta('chaos', 0.7, 'max');
            expect(manager.reactivityDeltas.chaos.value).toBe(0.7);
        });

        it('takes min in min mode', () => {
            // First addDelta creates entry at 0, min(0, 0.7) = 0, min(0, 0.3) = 0
            // So we use replace first, then min
            manager.addDelta('chaos', 0.7, 'replace');
            manager.addDelta('chaos', 0.3, 'min');
            expect(manager.reactivityDeltas.chaos.value).toBe(0.3);
        });

        it('ignores unknown parameters', () => {
            manager.addDelta('fake_param', 1, 'add');
            expect(manager.reactivityDeltas).not.toHaveProperty('fake_param');
        });
    });

    describe('applyDeltas', () => {
        it('applies add delta to base', () => {
            manager.setBaseParameter('chaos', 0.2);
            manager.addDelta('chaos', 0.3, 'add');
            manager.applyDeltas();
            expect(updateFn).toHaveBeenCalledWith('chaos', 0.5);
        });

        it('applies replace delta', () => {
            manager.setBaseParameter('chaos', 0.2);
            manager.addDelta('chaos', 0.9, 'replace');
            manager.applyDeltas();
            expect(updateFn).toHaveBeenCalledWith('chaos', 0.9);
        });

        it('applies multiply delta', () => {
            manager.setBaseParameter('speed', 2);
            manager.addDelta('speed', 1.5, 'multiply');
            manager.applyDeltas();
            expect(updateFn).toHaveBeenCalledWith('speed', 3);
        });

        it('skips tiny deltas in add mode', () => {
            manager.addDelta('chaos', 0.00001, 'add');
            manager.applyDeltas();
            expect(updateFn).not.toHaveBeenCalled();
        });

        it('guards against NaN in delta value', () => {
            manager.setBaseParameter('chaos', 0.2);
            manager.addDelta('chaos', NaN, 'replace');
            manager.applyDeltas();
            // NaN is not finite, should be skipped
            expect(updateFn).not.toHaveBeenCalled();
        });
    });

    describe('audio reactivity processing', () => {
        it('processes audio input when enabled', () => {
            manager.loadConfig({ audio: { enabled: true, globalSensitivity: 1.0 } });
            manager.setAudioInput(0.8, 0.5, 0.3);
            manager.setBaseParameter('morphFactor', 0);
            manager.computeReactivityDeltas();
            // Bass targets morphFactor with weight 0.8 and sensitivity 1.5
            expect(manager.reactivityDeltas).toHaveProperty('morphFactor');
        });

        it('does not process audio when disabled', () => {
            manager.loadConfig({
                audio: { enabled: false },
                interaction: { enabled: false },
                tilt: { enabled: false }
            });
            manager.setAudioInput(0.8, 0.5, 0.3);
            manager.computeReactivityDeltas();
            // With all inputs disabled, should have no deltas
            expect(Object.keys(manager.reactivityDeltas)).toHaveLength(0);
        });
    });

    describe('event system', () => {
        it('on/emit works', () => {
            const spy = vi.fn();
            manager.on('test', spy);
            manager.emit('test', 'data');
            expect(spy).toHaveBeenCalledWith('data');
        });

        it('off removes listener', () => {
            const spy = vi.fn();
            manager.on('test', spy);
            manager.off('test', spy);
            manager.emit('test', 'data');
            expect(spy).not.toHaveBeenCalled();
        });

        it('handles errors in event handlers', () => {
            manager.on('test', () => { throw new Error('oops'); });
            // Should not throw
            expect(() => manager.emit('test')).not.toThrow();
        });
    });

    describe('destroy', () => {
        it('stops and clears listeners', () => {
            manager.start();
            const spy = vi.fn();
            manager.on('test', spy);
            manager.destroy();
            expect(manager.isActive).toBe(false);
            manager.emit('test');
            expect(spy).not.toHaveBeenCalled();
        });
    });
});
