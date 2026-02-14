import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ViewerPortal, ViewerMode, ProjectionMode } from '../../src/viewer/ViewerPortal.js';

describe('ViewerMode constants', () => {
    it('has all mode values', () => {
        expect(ViewerMode.NORMAL).toBe('normal');
        expect(ViewerMode.FULLSCREEN).toBe('fullscreen');
        expect(ViewerMode.IMMERSIVE).toBe('immersive');
        expect(ViewerMode.CARD).toBe('card');
    });
});

describe('ProjectionMode constants', () => {
    it('has all projection values', () => {
        expect(ProjectionMode.PERSPECTIVE).toBe('perspective');
        expect(ProjectionMode.STEREOGRAPHIC).toBe('stereographic');
        expect(ProjectionMode.ORTHOGRAPHIC).toBe('orthographic');
        expect(ProjectionMode.CROSS_SECTION).toBe('cross_section');
    });
});

describe('ViewerPortal', () => {
    let portal;

    beforeEach(() => {
        portal = new ViewerPortal();
    });

    afterEach(() => {
        portal.dispose();
    });

    it('initializes with default values', () => {
        expect(portal.mode).toBe(ViewerMode.NORMAL);
        expect(portal.projectionMode).toBe(ProjectionMode.PERSPECTIVE);
        expect(portal.isFullscreen).toBe(false);
        expect(portal.gyroscopeEnabled).toBe(false);
        expect(portal.autoRotate).toBe(false);
        expect(portal.damping).toBe(0.95);
        expect(portal.sensitivity).toBe(0.01);
    });

    it('accepts constructor options', () => {
        const p = new ViewerPortal({
            damping: 0.8,
            sensitivity: 0.02,
            autoRotate: true,
            autoRotateSpeed: 0.01,
            autoRotatePlanes: ['xw', 'zw']
        });
        expect(p.damping).toBe(0.8);
        expect(p.sensitivity).toBe(0.02);
        expect(p.autoRotate).toBe(true);
        expect(p.autoRotateSpeed).toBe(0.01);
        expect(p.autoRotatePlanes).toEqual(['xw', 'zw']);
        p.dispose();
    });

    it('has zero rotation and velocity on creation', () => {
        const planes = ['xy', 'xz', 'yz', 'xw', 'yw', 'zw'];
        for (const plane of planes) {
            expect(portal.rotation[plane]).toBe(0);
            expect(portal.velocity[plane]).toBe(0);
        }
    });

    it('sets single plane rotation', () => {
        const mockEngine = { setRotation: vi.fn() };
        portal.engine = mockEngine;
        portal.setRotation('xw', 1.5);
        expect(portal.rotation.xw).toBe(1.5);
        expect(mockEngine.setRotation).toHaveBeenCalledWith(portal.rotation);
    });

    it('ignores invalid plane names', () => {
        portal.setRotation('invalid', 1.0);
        expect(portal.rotation).not.toHaveProperty('invalid');
    });

    it('sets all rotations at once', () => {
        const mockEngine = { setRotation: vi.fn() };
        portal.engine = mockEngine;
        portal.setAllRotations({ xy: 1, xz: 2, yz: 3, xw: 4, yw: 5, zw: 6 });
        expect(portal.rotation.xy).toBe(1);
        expect(portal.rotation.xz).toBe(2);
        expect(portal.rotation.yz).toBe(3);
        expect(portal.rotation.xw).toBe(4);
        expect(portal.rotation.yw).toBe(5);
        expect(portal.rotation.zw).toBe(6);
    });

    it('resets rotation and velocity', () => {
        portal.rotation = { xy: 1, xz: 2, yz: 3, xw: 4, yw: 5, zw: 6 };
        portal.velocity = { xy: 0.1, xz: 0.2, yz: 0.3, xw: 0.4, yw: 0.5, zw: 0.6 };

        const resetSpy = vi.fn();
        portal.on('reset', resetSpy);

        portal.resetRotation();

        for (const plane of Object.keys(portal.rotation)) {
            expect(portal.rotation[plane]).toBe(0);
            expect(portal.velocity[plane]).toBe(0);
        }
        expect(resetSpy).toHaveBeenCalled();
    });

    it('sets projection mode and emits event', () => {
        const spy = vi.fn();
        portal.on('projectionMode', spy);
        portal.setProjectionMode(ProjectionMode.STEREOGRAPHIC);
        expect(portal.projectionMode).toBe(ProjectionMode.STEREOGRAPHIC);
        expect(spy).toHaveBeenCalledWith(ProjectionMode.STEREOGRAPHIC);
    });

    it('initializes with container and emits event', () => {
        const container = document.createElement('div');
        const canvas = document.createElement('canvas');
        container.appendChild(canvas);

        const mockEngine = { setRotation: vi.fn() };
        const spy = vi.fn();
        portal.on('initialized', spy);

        const result = portal.initialize(container, mockEngine);

        expect(result).toBe(portal);
        expect(portal.container).toBe(container);
        expect(portal.engine).toBe(mockEngine);
        expect(portal.canvas).toBe(canvas);
        expect(spy).toHaveBeenCalled();
    });

    it('creates canvas when container has none', () => {
        const container = document.createElement('div');
        const mockEngine = {};

        portal.initialize(container, mockEngine);
        expect(portal.canvas).toBeTruthy();
        expect(portal.canvas.tagName).toBe('CANVAS');
    });

    it('emits disposed event on dispose', () => {
        const spy = vi.fn();
        portal.on('disposed', spy);
        portal.dispose();
        expect(spy).toHaveBeenCalled();
    });

    it('toggles fullscreen', () => {
        portal.isFullscreen = false;
        const enterSpy = vi.spyOn(portal, 'enterFullscreen').mockResolvedValue();
        portal.toggleFullscreen();
        expect(enterSpy).toHaveBeenCalled();
    });

    it('handles mouse interaction correctly', () => {
        const startSpy = vi.fn();
        const endSpy = vi.fn();
        portal.on('interactionStart', startSpy);
        portal.on('interactionEnd', endSpy);

        portal._onMouseDown({ clientX: 100, clientY: 200 });
        expect(portal._touch.active).toBe(true);
        expect(portal._touch.startX).toBe(100);
        expect(portal._touch.startY).toBe(200);
        expect(startSpy).toHaveBeenCalled();

        portal._onMouseMove({ clientX: 110, clientY: 220 });
        expect(portal.velocity.xw).toBeCloseTo(10 * 0.01);
        expect(portal.velocity.yw).toBeCloseTo(20 * 0.01);

        portal._onMouseUp();
        expect(portal._touch.active).toBe(false);
        expect(endSpy).toHaveBeenCalled();
    });

    it('handles device orientation', () => {
        const spy = vi.fn();
        portal.on('deviceOrientation', spy);

        portal._onDeviceOrientation({ alpha: 90, beta: 45, gamma: 30 });
        expect(spy).toHaveBeenCalledWith({ alpha: 90, beta: 45, gamma: 30 });
        expect(portal._deviceOrientation).toEqual({ alpha: 90, beta: 45, gamma: 30 });
    });

    it('captureFrame returns null without canvas', () => {
        expect(portal.captureFrame()).toBeNull();
    });
});
