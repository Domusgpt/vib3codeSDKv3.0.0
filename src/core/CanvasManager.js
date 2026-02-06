/**
 * CanvasManager - Creates and manages 5-layer canvas architecture per system.
 *
 * Provides the API surface expected by VIB3Engine:
 *   constructor(containerId)
 *   createSystemCanvases(systemName) -> string[]
 *   registerContext(canvasId, gl)
 *   destroy()
 */

export class CanvasManager {
    constructor(containerId = 'vib3-container') {
        this.containerId = containerId;
        this.container = (typeof document !== 'undefined')
            ? document.getElementById(containerId)
            : null;
        this.currentSystem = null;
        this.createdCanvases = [];
        this.registeredContexts = new Map();
    }

    /**
     * Create 5 canvases with system-appropriate IDs inside the container.
     * Returns the array of canvas IDs created.
     */
    createSystemCanvases(systemName) {
        // Tear down previous canvases
        this._removeCreatedCanvases();

        const canvasIds = this._getCanvasIdsForSystem(systemName);

        if (this.container) {
            const viewWidth = this.container.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 800);
            const viewHeight = this.container.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 600);
            const dpr = (typeof window !== 'undefined') ? Math.min(window.devicePixelRatio || 1, 2) : 1;

            canvasIds.forEach((canvasId, index) => {
                const canvas = document.createElement('canvas');
                canvas.id = canvasId;
                canvas.className = 'visualization-canvas';
                canvas.style.position = 'absolute';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                canvas.style.zIndex = String(index + 1);
                canvas.width = viewWidth * dpr;
                canvas.height = viewHeight * dpr;
                this.container.appendChild(canvas);
                this.createdCanvases.push(canvas);
            });
        }

        this.currentSystem = systemName;
        return canvasIds;
    }

    /**
     * Track a WebGL context so we can force-lose it during cleanup.
     */
    registerContext(canvasId, gl) {
        this.registeredContexts.set(canvasId, gl);
    }

    /**
     * Destroy all managed canvases and force-lose registered WebGL contexts.
     */
    destroy() {
        // Force-lose all tracked contexts
        for (const [, gl] of this.registeredContexts) {
            try {
                const ext = gl.getExtension('WEBGL_lose_context');
                if (ext) ext.loseContext();
            } catch (_) { /* context may already be lost */ }
        }
        this.registeredContexts.clear();

        this._removeCreatedCanvases();
        this.currentSystem = null;
    }

    // ── Private helpers ──

    _removeCreatedCanvases() {
        for (const canvas of this.createdCanvases) {
            canvas.remove();
        }
        this.createdCanvases = [];
    }

    _getCanvasIdsForSystem(systemName) {
        const baseIds = [
            'background-canvas', 'shadow-canvas', 'content-canvas',
            'highlight-canvas', 'accent-canvas'
        ];

        switch (systemName) {
            case 'faceted':
                return baseIds;
            case 'quantum':
                return baseIds.map(id => `quantum-${id}`);
            case 'holographic':
                return baseIds.map(id => `holo-${id}`);
            case 'polychora':
                return baseIds.map(id => `polychora-${id}`);
            default:
                return baseIds;
        }
    }
}
