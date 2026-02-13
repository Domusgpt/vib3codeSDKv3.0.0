import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CanvasManager } from '../../src/core/CanvasManager.js';

describe('CanvasManager', () => {
    let canvasManager;
    let container;

    beforeEach(() => {
        // Mock container
        document.body.innerHTML = '<div id="vib3-container" style="width: 800px; height: 600px;"></div>';
        container = document.getElementById('vib3-container');

        canvasManager = new CanvasManager('vib3-container');
    });

    afterEach(() => {
        canvasManager.destroy();
        document.body.innerHTML = '';
        vi.clearAllMocks();
    });

    describe('Constructor', () => {
        it('should initialize with container ID', () => {
            expect(canvasManager.containerId).toBe('vib3-container');
            expect(canvasManager.container).toBe(container);
            expect(canvasManager.createdCanvases).toEqual([]);
            expect(canvasManager.registeredContexts.size).toBe(0);
        });

        it('should handle missing container gracefully', () => {
            const cm = new CanvasManager('non-existent-id');
            expect(cm.container).toBeNull();
        });
    });

    describe('createSystemCanvases', () => {
        it('should create 5 canvases for "faceted" system', () => {
            const canvasIds = canvasManager.createSystemCanvases('faceted');

            expect(canvasIds).toHaveLength(5);
            expect(canvasIds).toEqual([
                'background-canvas', 'shadow-canvas', 'content-canvas',
                'highlight-canvas', 'accent-canvas'
            ]);

            const canvases = container.querySelectorAll('canvas');
            expect(canvases.length).toBe(5);
            expect(canvasManager.createdCanvases.length).toBe(5);
        });

        it('should create 5 canvases for "quantum" system with prefixed IDs', () => {
            const canvasIds = canvasManager.createSystemCanvases('quantum');

            expect(canvasIds).toHaveLength(5);
            expect(canvasIds[0]).toBe('quantum-background-canvas');

            const canvases = container.querySelectorAll('canvas');
            expect(canvases.length).toBe(5);
        });

        it('should create 5 canvases for "holographic" system with prefixed IDs', () => {
            const canvasIds = canvasManager.createSystemCanvases('holographic');

            expect(canvasIds).toHaveLength(5);
            expect(canvasIds[0]).toBe('holo-background-canvas');
        });

        it('should create 5 canvases for "polychora" system with prefixed IDs', () => {
            const canvasIds = canvasManager.createSystemCanvases('polychora');

            expect(canvasIds).toHaveLength(5);
            expect(canvasIds[0]).toBe('polychora-background-canvas');
        });

        it('should fallback to default IDs for unknown system', () => {
            const canvasIds = canvasManager.createSystemCanvases('unknown');

            expect(canvasIds).toEqual([
                'background-canvas', 'shadow-canvas', 'content-canvas',
                'highlight-canvas', 'accent-canvas'
            ]);
        });

        it('should set canvas styles correctly', () => {
            canvasManager.createSystemCanvases('faceted');
            const canvas = container.querySelector('canvas');

            expect(canvas.style.position).toBe('absolute');
            expect(canvas.style.top).toBe('0px');
            expect(canvas.style.left).toBe('0px');
            expect(canvas.style.width).toBe('100%');
            expect(canvas.style.height).toBe('100%');
            expect(canvas.style.zIndex).toBe('1'); // First canvas has zIndex 1
        });

        it('should set zIndex incrementally', () => {
            canvasManager.createSystemCanvases('faceted');
            const canvases = container.querySelectorAll('canvas');

            expect(canvases[0].style.zIndex).toBe('1');
            expect(canvases[4].style.zIndex).toBe('5');
        });

        it('should remove existing canvases before creating new ones', () => {
            canvasManager.createSystemCanvases('faceted');
            const firstSet = Array.from(container.querySelectorAll('canvas'));

            canvasManager.createSystemCanvases('quantum');
            const secondSet = Array.from(container.querySelectorAll('canvas'));

            expect(container.querySelectorAll('canvas').length).toBe(5);
            expect(secondSet[0]).not.toBe(firstSet[0]);
        });
    });

    describe('Context Management', () => {
        it('should register WebGL context', () => {
            const mockGL = { canvas: {} };
            canvasManager.registerContext('test-canvas', mockGL);

            expect(canvasManager.registeredContexts.has('test-canvas')).toBe(true);
            expect(canvasManager.registeredContexts.get('test-canvas')).toBe(mockGL);
        });
    });

    describe('Destroy', () => {
        it('should clean up canvases from DOM', () => {
            canvasManager.createSystemCanvases('faceted');
            expect(container.querySelectorAll('canvas').length).toBe(5);

            canvasManager.destroy();
            expect(container.querySelectorAll('canvas').length).toBe(0);
            expect(canvasManager.createdCanvases.length).toBe(0);
        });

        it('should lose WebGL contexts on destroy', () => {
            const loseContextSpy = vi.fn();
            const mockGL = {
                getExtension: vi.fn(() => ({ loseContext: loseContextSpy }))
            };

            canvasManager.registerContext('test-canvas', mockGL);
            canvasManager.destroy();

            expect(mockGL.getExtension).toHaveBeenCalledWith('WEBGL_lose_context');
            expect(loseContextSpy).toHaveBeenCalled();
            expect(canvasManager.registeredContexts.size).toBe(0);
        });

        it('should handle context loss failure gracefully', () => {
            const mockGL = {
                getExtension: vi.fn(() => { throw new Error('Failed'); })
            };

            canvasManager.registerContext('test-canvas', mockGL);

            expect(() => canvasManager.destroy()).not.toThrow();
        });
    });
});
