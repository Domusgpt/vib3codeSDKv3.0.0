import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ReactivityManager, InputSource, InputPreset } from '../../src/viewer/ViewerInputHandler.js';

describe('InputSource constants', () => {
    it('has all input types', () => {
        expect(InputSource.MOUSE).toBe('mouse');
        expect(InputSource.TOUCH).toBe('touch');
        expect(InputSource.GYROSCOPE).toBe('gyroscope');
        expect(InputSource.KEYBOARD).toBe('keyboard');
        expect(InputSource.GAMEPAD).toBe('gamepad');
    });
});

describe('InputPreset constants', () => {
    it('has all preset types', () => {
        expect(InputPreset.DEFAULT).toBe('default');
        expect(InputPreset.MOBILE).toBe('mobile');
        expect(InputPreset.DESKTOP).toBe('desktop');
        expect(InputPreset.VR).toBe('vr');
    });
});

describe('ReactivityManager', () => {
    let manager;

    beforeEach(() => {
        manager = new ReactivityManager();
    });

    afterEach(() => {
        manager.dispose();
    });

    it('initializes with default configuration', () => {
        expect(manager.config.mouseSensitivity).toBe(0.005);
        expect(manager.config.touchSensitivity).toBe(0.008);
        expect(manager.config.gyroSensitivity).toBe(0.02);
        expect(manager.config.keyboardSpeed).toBe(0.02);
        expect(manager.config.gamepadSensitivity).toBe(0.03);
        expect(manager.config.damping).toBe(0.92);
        expect(manager.config.deadzone).toBe(0.1);
    });

    it('accepts custom options', () => {
        const m = new ReactivityManager({
            mouseSensitivity: 0.01,
            damping: 0.8,
            deadzone: 0.2
        });
        expect(m.config.mouseSensitivity).toBe(0.01);
        expect(m.config.damping).toBe(0.8);
        expect(m.config.deadzone).toBe(0.2);
        m.dispose();
    });

    it('starts with zero rotation', () => {
        const rot = manager.getRotation();
        for (const val of Object.values(rot)) {
            expect(val).toBe(0);
        }
    });

    it('starts with no active sources', () => {
        expect(manager.activeSources.size).toBe(0);
    });

    it('has default input mapping', () => {
        const mapping = manager.config.mapping;
        expect(mapping.mouse.dragX).toBe('xw');
        expect(mapping.mouse.dragY).toBe('yw');
        expect(mapping.mouse.wheel).toBe('zw');
        expect(mapping.touch.panX).toBe('xw');
        expect(mapping.touch.panY).toBe('yw');
        expect(mapping.gyro.alpha).toBe('xy');
        expect(mapping.keyboard).toHaveProperty('ArrowLeft');
        expect(mapping.keyboard).toHaveProperty('ArrowRight');
        expect(mapping.gamepad.leftStickX).toBe('xw');
    });

    it('keyboard mapping has correct structure', () => {
        const kb = manager.config.mapping.keyboard;
        expect(kb.ArrowLeft).toEqual({ plane: 'xw', direction: -1 });
        expect(kb.ArrowRight).toEqual({ plane: 'xw', direction: 1 });
        expect(kb.ArrowUp).toEqual({ plane: 'yw', direction: -1 });
        expect(kb.ArrowDown).toEqual({ plane: 'yw', direction: 1 });
        expect(kb.KeyQ).toEqual({ plane: 'xy', direction: -1 });
        expect(kb.KeyE).toEqual({ plane: 'xy', direction: 1 });
    });

    it('resets all state', () => {
        manager.rotation.xw = 1.5;
        manager.rotation.yw = 0.5;
        manager._velocity.xw = 0.1;
        manager.state.keys.add('KeyW');

        const spy = vi.fn();
        manager.on('reset', spy);
        manager.reset();

        const rot = manager.getRotation();
        for (const val of Object.values(rot)) {
            expect(val).toBe(0);
        }
        expect(manager._velocity.xw).toBe(0);
        expect(manager.state.keys.size).toBe(0);
        expect(spy).toHaveBeenCalled();
    });

    it('enables and disables sources', async () => {
        const enableSpy = vi.fn();
        const disableSpy = vi.fn();
        manager.on('sourceEnabled', enableSpy);
        manager.on('sourceDisabled', disableSpy);

        await manager.enableSource(InputSource.MOUSE);
        expect(manager.activeSources.has(InputSource.MOUSE)).toBe(true);
        expect(enableSpy).toHaveBeenCalledWith(InputSource.MOUSE);

        manager.disableSource(InputSource.MOUSE);
        expect(manager.activeSources.has(InputSource.MOUSE)).toBe(false);
        expect(disableSpy).toHaveBeenCalledWith(InputSource.MOUSE);
    });

    it('enables keyboard source', async () => {
        await manager.enableSource(InputSource.KEYBOARD);
        expect(manager.activeSources.has(InputSource.KEYBOARD)).toBe(true);
    });

    it('enables touch source', async () => {
        await manager.enableSource(InputSource.TOUCH);
        expect(manager.activeSources.has(InputSource.TOUCH)).toBe(true);
    });

    it('switches preset to mobile', () => {
        const spy = vi.fn();
        manager.on('presetChanged', spy);
        manager.setPreset(InputPreset.MOBILE);
        expect(manager.config.mapping.touch.panX).toBe('xw');
        expect(spy).toHaveBeenCalledWith(InputPreset.MOBILE);
    });

    it('switches preset to VR', () => {
        manager.setPreset(InputPreset.VR);
        expect(manager.config.mapping.gyro.beta).toBe('xw');
        expect(manager.config.mapping.gyro.gamma).toBe('yw');
    });

    it('switches preset to desktop (same as default)', () => {
        manager.setPreset(InputPreset.DESKTOP);
        expect(manager.config.mapping.mouse.dragX).toBe('xw');
    });

    it('defaults to default mapping for unknown preset', () => {
        manager.setPreset('unknown');
        expect(manager.config.mapping.mouse.dragX).toBe('xw');
    });

    it('getRotation returns a copy', () => {
        manager.rotation.xw = 1.5;
        const rot = manager.getRotation();
        rot.xw = 99;
        expect(manager.rotation.xw).toBe(1.5);
    });

    it('initializes with element and emits event', () => {
        const el = document.createElement('div');
        const spy = vi.fn();
        manager.on('initialized', spy);
        const result = manager.initialize(el);
        expect(result).toBe(manager);
        expect(manager.element).toBe(el);
        expect(spy).toHaveBeenCalled();
    });

    it('dispose emits event', () => {
        const spy = vi.fn();
        manager.on('disposed', spy);
        manager.dispose();
        expect(spy).toHaveBeenCalled();
    });

    it('handles key down and up events', () => {
        const downSpy = vi.fn();
        const upSpy = vi.fn();
        manager.on('keyDown', downSpy);
        manager.on('keyUp', upSpy);

        manager._onKeyDown({ code: 'ArrowLeft' });
        expect(manager.state.keys.has('ArrowLeft')).toBe(true);
        expect(downSpy).toHaveBeenCalledWith('ArrowLeft');

        manager._onKeyUp({ code: 'ArrowLeft' });
        expect(manager.state.keys.has('ArrowLeft')).toBe(false);
        expect(upSpy).toHaveBeenCalledWith('ArrowLeft');
    });

    it('handles mouse down event', () => {
        const spy = vi.fn();
        manager.on('pointerDown', spy);
        manager._onMouseDown({ clientX: 100, clientY: 200 });
        expect(manager.state.pointerX).toBe(100);
        expect(manager.state.pointerY).toBe(200);
        expect(spy).toHaveBeenCalled();
    });

    it('handles mouse move and updates velocity', () => {
        manager.state.pointerX = 100;
        manager.state.pointerY = 200;

        manager._onMouseMove({ clientX: 120, clientY: 210 });
        expect(manager.state.deltaX).toBe(20);
        expect(manager.state.deltaY).toBe(10);
        // Velocity += delta * sensitivity
        expect(manager._velocity.xw).toBeCloseTo(20 * 0.005);
        expect(manager._velocity.yw).toBeCloseTo(10 * 0.005);
    });

    it('handles wheel event', () => {
        const spy = vi.fn();
        manager.on('wheel', spy);
        manager._onWheel({ deltaY: 100, preventDefault: vi.fn() });
        expect(manager._velocity.zw).toBeCloseTo(100 * 0.001);
        expect(spy).toHaveBeenCalledWith(100);
    });

    it('handles device orientation', () => {
        const spy = vi.fn();
        manager.on('deviceOrientation', spy);
        manager._onDeviceOrientation({ alpha: 90, beta: 45, gamma: 30 });
        expect(manager.state.alpha).toBe(90);
        expect(manager.state.beta).toBe(45);
        expect(manager.state.gamma).toBe(30);
        expect(spy).toHaveBeenCalled();
    });

    it('initial state has correct defaults', () => {
        expect(manager.state.pointerX).toBe(0);
        expect(manager.state.pointerY).toBe(0);
        expect(manager.state.pinchScale).toBe(1);
        expect(manager.state.rotationAngle).toBe(0);
        expect(manager.state.gamepadAxes).toEqual([0, 0, 0, 0]);
    });
});
