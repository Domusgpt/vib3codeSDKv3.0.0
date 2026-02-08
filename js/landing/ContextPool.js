/**
 * GPU Context Pool
 *
 * Manages a limited number of WebGL contexts to stay within browser limits.
 * Handles acquire/release lifecycle with automatic eviction and canvas reset.
 *
 * @example
 *   const pool = new ContextPool(2);
 *   const viz = pool.acquire('hero', 'hero-canvas', QuantumAdapter, opts);
 *   pool.release('hero');
 */
export class ContextPool {
  constructor(max = 2) {
    this.max = max;
    this.slots = new Map();
  }

  has(key) { return this.slots.has(key); }
  get(key) { return this.slots.get(key)?.adapter || null; }

  acquire(key, canvasId, Factory, opts) {
    if (this.slots.has(key)) return this.slots.get(key).adapter;

    while (this.slots.size >= this.max) {
      const oldest = this.slots.keys().next().value;
      this.release(oldest);
    }

    this._resetCanvas(canvasId);

    try {
      const adapter = new Factory(canvasId, opts);
      if (!adapter.active) {
        console.warn(`[ContextPool] ${key} init failed on #${canvasId}`);
        return null;
      }
      this.slots.set(key, { adapter, canvasId });
      return adapter;
    } catch (e) {
      console.warn(`[ContextPool] ${key} threw:`, e);
      return null;
    }
  }

  release(key) {
    const entry = this.slots.get(key);
    if (!entry) return;
    try { entry.adapter.dispose(); } catch (_) { /* ignore */ }
    this._loseContext(entry.canvasId);
    this.slots.delete(key);
  }

  releaseAll() {
    for (const key of [...this.slots.keys()]) this.release(key);
  }

  _loseContext(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    try {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (gl && !gl.isContextLost()) {
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      }
    } catch (_) { /* ignore */ }
  }

  _resetCanvas(canvasId) {
    const old = document.getElementById(canvasId);
    if (!old) return;
    this._loseContext(canvasId);
    const fresh = document.createElement('canvas');
    fresh.id = canvasId;
    fresh.className = old.className;
    if (old.style.cssText) fresh.style.cssText = old.style.cssText;
    const parent = old.parentElement;
    if (parent) {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      fresh.width = parent.clientWidth * dpr;
      fresh.height = parent.clientHeight * dpr;
    }
    old.parentNode.replaceChild(fresh, old);
  }
}
