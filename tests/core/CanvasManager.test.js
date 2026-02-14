import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CanvasManager } from '../../src/core/CanvasManager.js';

describe('CanvasManager', () => {
    let cm;
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'vib3-container';
        document.body.appendChild(container);
        cm = new CanvasManager('vib3-container');
    });

    afterEach(() => {
        cm.destroy();
        container.remove();
    });

    describe('constructor', () => {
        it('finds container by id', () => {
            expect(cm.container).toBe(container);
            expect(cm.containerId).toBe('vib3-container');
        });

        it('starts with empty state', () => {
            expect(cm.currentSystem).toBeNull();
            expect(cm.createdCanvases).toEqual([]);
            expect(cm.registeredContexts.size).toBe(0);
        });

        it('handles missing container gracefully', () => {
            const cm2 = new CanvasManager('nonexistent');
            expect(cm2.container).toBeNull();
        });
    });

    describe('_getCanvasIdsForSystem', () => {
        it('returns base IDs for faceted system', () => {
            const ids = cm._getCanvasIdsForSystem('faceted');
            expect(ids).toEqual([
                'background-canvas', 'shadow-canvas', 'content-canvas',
                'highlight-canvas', 'accent-canvas'
            ]);
        });

        it('returns quantum-prefixed IDs for quantum system', () => {
            const ids = cm._getCanvasIdsForSystem('quantum');
            expect(ids).toEqual([
                'quantum-background-canvas', 'quantum-shadow-canvas',
                'quantum-content-canvas', 'quantum-highlight-canvas',
                'quantum-accent-canvas'
            ]);
        });

        it('returns holo-prefixed IDs for holographic system', () => {
            const ids = cm._getCanvasIdsForSystem('holographic');
            expect(ids).toEqual([
                'holo-background-canvas', 'holo-shadow-canvas',
                'holo-content-canvas', 'holo-highlight-canvas',
                'holo-accent-canvas'
            ]);
        });

        it('returns polychora-prefixed IDs for polychora system', () => {
            const ids = cm._getCanvasIdsForSystem('polychora');
            expect(ids).toEqual([
                'polychora-background-canvas', 'polychora-shadow-canvas',
                'polychora-content-canvas', 'polychora-highlight-canvas',
                'polychora-accent-canvas'
            ]);
        });

        it('returns base IDs for unknown system', () => {
            const ids = cm._getCanvasIdsForSystem('unknown');
            expect(ids).toEqual([
                'background-canvas', 'shadow-canvas', 'content-canvas',
                'highlight-canvas', 'accent-canvas'
            ]);
        });

        it('always returns 5 canvas IDs', () => {
            for (const sys of ['faceted', 'quantum', 'holographic', 'polychora']) {
                expect(cm._getCanvasIdsForSystem(sys)).toHaveLength(5);
            }
        });
    });

    describe('createSystemCanvases', () => {
        it('creates 5 canvas elements in container', () => {
            const ids = cm.createSystemCanvases('faceted');
            expect(ids).toHaveLength(5);
            expect(cm.createdCanvases).toHaveLength(5);
            expect(container.querySelectorAll('canvas')).toHaveLength(5);
        });

        it('sets current system', () => {
            cm.createSystemCanvases('quantum');
            expect(cm.currentSystem).toBe('quantum');
        });

        it('canvases have correct IDs', () => {
            cm.createSystemCanvases('quantum');
            const canvasIds = Array.from(container.querySelectorAll('canvas')).map(c => c.id);
            expect(canvasIds).toContain('quantum-content-canvas');
            expect(canvasIds).toContain('quantum-background-canvas');
        });

        it('canvases have correct CSS positioning', () => {
            cm.createSystemCanvases('faceted');
            const canvas = container.querySelector('#content-canvas');
            expect(canvas.style.position).toBe('absolute');
            expect(canvas.style.width).toBe('100%');
            expect(canvas.style.height).toBe('100%');
        });

        it('canvases have ascending z-index', () => {
            cm.createSystemCanvases('faceted');
            const canvases = Array.from(container.querySelectorAll('canvas'));
            for (let i = 0; i < canvases.length; i++) {
                expect(canvases[i].style.zIndex).toBe(String(i + 1));
            }
        });

        it('removes previous canvases when switching systems', () => {
            cm.createSystemCanvases('faceted');
            expect(container.querySelectorAll('canvas')).toHaveLength(5);

            cm.createSystemCanvases('quantum');
            expect(container.querySelectorAll('canvas')).toHaveLength(5);
            // Should have quantum canvases now
            expect(container.querySelector('#quantum-content-canvas')).toBeTruthy();
            expect(container.querySelector('#content-canvas')).toBeNull();
        });

        it('returns canvas IDs even without container', () => {
            const cm2 = new CanvasManager('nonexistent');
            const ids = cm2.createSystemCanvases('faceted');
            expect(ids).toHaveLength(5);
            expect(cm2.createdCanvases).toHaveLength(0);
        });
    });

    describe('registerContext', () => {
        it('stores context by canvas ID', () => {
            const mockGl = { getExtension: () => null };
            cm.registerContext('content-canvas', mockGl);
            expect(cm.registeredContexts.get('content-canvas')).toBe(mockGl);
        });
    });

    describe('destroy', () => {
        it('removes all created canvases', () => {
            cm.createSystemCanvases('faceted');
            expect(container.querySelectorAll('canvas')).toHaveLength(5);

            cm.destroy();
            expect(container.querySelectorAll('canvas')).toHaveLength(0);
            expect(cm.createdCanvases).toHaveLength(0);
        });

        it('clears registered contexts', () => {
            cm.registerContext('test', { getExtension: () => null });
            cm.destroy();
            expect(cm.registeredContexts.size).toBe(0);
        });

        it('resets current system', () => {
            cm.createSystemCanvases('quantum');
            cm.destroy();
            expect(cm.currentSystem).toBeNull();
        });

        it('force-loses WebGL contexts', () => {
            const loseContextCalled = { value: false };
            const mockGl = {
                getExtension: (name) => {
                    if (name === 'WEBGL_lose_context') {
                        return { loseContext: () => { loseContextCalled.value = true; } };
                    }
                    return null;
                }
            };
            cm.registerContext('test', mockGl);
            cm.destroy();
            expect(loseContextCalled.value).toBe(true);
        });

        it('handles already-lost contexts gracefully', () => {
            const mockGl = {
                getExtension: () => { throw new Error('context lost'); }
            };
            cm.registerContext('test', mockGl);
            // Should not throw
            expect(() => cm.destroy()).not.toThrow();
        });
    });
});
