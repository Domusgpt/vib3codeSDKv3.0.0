/**
 * CanvasManager - Creates and manages 5-layer canvas architecture per system.
 *
 * Provides the API surface expected by VIB3Engine:
 *   constructor(containerId)
 *   createSystemCanvases(systemName) -> string[]
 *   registerContext(canvasId, gl)
 *   destroy()
 *
 * AGENT NOTE — Container Requirements:
 *   The container element MUST have:
 *     1. position: relative (or absolute/fixed) — canvases are position:absolute children
 *     2. Non-zero dimensions (width AND height) — canvases inherit 100% of container size
 *   If either condition is missing, CanvasManager will auto-fix and log a warning.
 *   Common fix: <div id="vib3-container" style="position:relative; width:100vw; height:100vh;">
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

        if (typeof document !== 'undefined' && !this.container) {
            console.error(
                `[VIB3+ CanvasManager] Container element "#${containerId}" not found in DOM.\n` +
                `Make sure your HTML has: <div id="${containerId}"></div>`
            );
        }
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
            // ── Auto-fix container positioning ──
            // Canvases are position:absolute — if container is position:static (default),
            // they'll position relative to the nearest positioned ancestor (often <body>),
            // which breaks layout and produces invisible/zero-size canvases.
            this._validateAndFixContainer();

            const viewWidth = this.container.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 800);
            const viewHeight = this.container.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 600);
            const dpr = (typeof window !== 'undefined') ? Math.min(window.devicePixelRatio || 1, 2) : 1;

            if (viewWidth === 0 || viewHeight === 0) {
                console.error(
                    `[VIB3+ CanvasManager] Container "#${this.containerId}" has zero dimensions ` +
                    `(${viewWidth}x${viewHeight}). Canvases will be invisible.\n` +
                    `Fix: give the container explicit size, e.g. style="width:100vw; height:100vh;"`
                );
            }

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

    /**
     * Validate container CSS and auto-fix common problems that produce invisible canvases.
     * Logs warnings so agents and developers see the issue in console immediately.
     */
    _validateAndFixContainer() {
        if (!this.container || typeof getComputedStyle === 'undefined') return;

        const style = getComputedStyle(this.container);

        // Fix 1: Container must be a positioning context for absolute children
        if (style.position === 'static') {
            console.warn(
                `[VIB3+ CanvasManager] Container "#${this.containerId}" has position:static. ` +
                `Auto-fixing to position:relative.\n` +
                `Canvases are position:absolute — without a positioned parent they escape the container.`
            );
            this.container.style.position = 'relative';
        }

        // Fix 2: Container must not hide canvas overflow
        if (style.overflow === 'visible') {
            this.container.style.overflow = 'hidden';
        }

        // Warning: zero-size container (can't auto-fix — depends on layout intent)
        const rect = this.container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            console.warn(
                `[VIB3+ CanvasManager] Container "#${this.containerId}" has zero rendered size ` +
                `(${Math.round(rect.width)}x${Math.round(rect.height)}).\n` +
                `Fix: give it explicit dimensions, e.g.:\n` +
                `  <div id="${this.containerId}" style="position:relative; width:100vw; height:100vh;">`
            );
        }
    }

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
