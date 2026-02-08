/**
 * VIB3+ System Adapters
 *
 * Thin wrappers around each SDK visualization system, providing a uniform
 * interface: constructor(canvasId, opts), setParam/setParams, render, dispose.
 *
 * Shows how to instantiate each system for standalone canvas usage.
 */

import { QuantumEngine } from '../../src/quantum/QuantumEngine.js';
import { RealHolographicSystem } from '../../src/holograms/RealHolographicSystem.js';
import { FacetedSystem } from '../../src/faceted/FacetedSystem.js';

const DEFAULT_PARAMS = {
  geometry: 3, hue: 200, gridDensity: 24, speed: 1.0,
  morphFactor: 0.5, chaos: 0.2, intensity: 0.7, saturation: 0.8,
  rot4dXW: 0, rot4dYW: 0, rot4dZW: 0, rot4dXY: 0, rot4dXZ: 0, rot4dYZ: 0,
  dimension: 3.5,
};

/** Wire mouse/touch interaction to a callback */
function wireInteraction(canvas, onMove, onLeave) {
  const handlers = {};
  handlers.mouse = (e) => {
    const r = canvas.getBoundingClientRect();
    onMove((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, 0.8);
  };
  handlers.touch = (e) => {
    if (!e.touches.length) return;
    const t = e.touches[0], r = canvas.getBoundingClientRect();
    onMove((t.clientX - r.left) / r.width, (t.clientY - r.top) / r.height, 0.9);
  };
  handlers.leave = () => onLeave();
  canvas.addEventListener('mousemove', handlers.mouse);
  canvas.addEventListener('touchmove', handlers.touch, { passive: true });
  canvas.addEventListener('mouseleave', handlers.leave);
  return handlers;
}

function unwireInteraction(canvas, handlers) {
  if (!canvas || !handlers) return;
  canvas.removeEventListener('mousemove', handlers.mouse);
  canvas.removeEventListener('touchmove', handlers.touch);
  canvas.removeEventListener('mouseleave', handlers.leave);
}

function observeResize(canvas, onResize) {
  const parent = canvas.parentElement;
  if (!parent) return null;
  const obs = new ResizeObserver(() => {
    onResize(parent.clientWidth, parent.clientHeight, Math.min(devicePixelRatio || 1, 2));
  });
  obs.observe(parent);
  return obs;
}

// ─── Quantum Adapter ───────────────────────────────────────────

export class QuantumAdapter {
  constructor(canvasId, opts = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { this.active = false; return; }
    this.canvas = canvas;
    this.active = true;
    this.params = { ...DEFAULT_PARAMS, ...opts };

    try {
      this.engine = new QuantumEngine({ canvas, autoStart: true });
      this.engine.setActive(true);
      this.engine.updateParameters(this.params);
    } catch (e) {
      console.warn('Quantum init failed', e);
      this.active = false;
      return;
    }

    this._handlers = wireInteraction(canvas,
      (x, y, i) => this.engine.updateInteraction(x, y, i),
      () => this.engine.updateInteraction(0.5, 0.5, 0),
    );
    this._resizeObs = observeResize(canvas, (w, h, dpr) => this.engine.resize(w, h, dpr));
  }

  setParam(k, v) { this.params[k] = v; this.engine?.updateParameter(k, v); }
  setParams(o) { Object.assign(this.params, o); this.engine?.updateParameters(o); }
  render() { if (this.active) this.engine?.updateParameters(this.params); }
  dispose() {
    this.active = false;
    unwireInteraction(this.canvas, this._handlers);
    this._resizeObs?.disconnect();
    try { this.engine?.dispose(); } catch (_) { /* ignore */ }
  }
}

// ─── Holographic Adapter ───────────────────────────────────────

export class HolographicAdapter {
  constructor(canvasId, opts = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { this.active = false; return; }
    this.canvas = canvas;
    this.active = true;
    this.params = { ...DEFAULT_PARAMS, ...opts };

    try {
      this.system = new RealHolographicSystem({ canvas });
      this.system.setActive(true);
      for (const [k, v] of Object.entries(this.params)) {
        this.system.updateParameter(k, v);
      }
    } catch (e) {
      console.warn('Holographic init failed', e);
      this.active = false;
      return;
    }

    // Holographic system is audio-reactive, no mouse/touch interaction API
    this._resizeObs = observeResize(canvas, (w, h, dpr) => this.system.resize(w, h, dpr));
  }

  setParam(k, v) { this.params[k] = v; this.system?.updateParameter(k, v); }
  setParams(o) {
    Object.assign(this.params, o);
    for (const [k, v] of Object.entries(o)) this.system?.updateParameter(k, v);
  }
  render() {
    if (!this.active) return;
    for (const [k, v] of Object.entries(this.params)) this.system?.updateParameter(k, v);
  }
  dispose() {
    this.active = false;
    this._resizeObs?.disconnect();
    try { this.system?.dispose(); } catch (_) { /* ignore */ }
  }
}

// ─── Faceted Adapter ───────────────────────────────────────────

export class FacetedAdapter {
  constructor(canvasId, opts = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) { this.active = false; return; }
    this.canvas = canvas;
    this.active = true; // optimistic — render() is safe before init completes
    this.params = { ...DEFAULT_PARAMS, ...opts };

    this.faceted = new FacetedSystem();
    // initWithBridge is the correct async API for passing a specific canvas
    // It auto-starts the render loop on success
    this.faceted.initWithBridge(canvas, { preferWebGPU: false })
      .then(ok => {
        if (ok) {
          this.faceted.updateParameters(this.params);
        } else {
          console.warn('Faceted initWithBridge returned false');
          this.active = false;
        }
      })
      .catch(e => {
        console.warn('Faceted init error', e);
        this.active = false;
      });

    this._resizeObs = observeResize(canvas, (w, h, dpr) => this.faceted.resize(w, h, dpr));
  }

  setParam(k, v) { this.params[k] = v; this.faceted?.updateParameters({ [k]: v }); }
  setParams(o) { Object.assign(this.params, o); this.faceted?.updateParameters(o); }
  render() { if (this.active) this.faceted?.updateParameters(this.params); }
  dispose() {
    this.active = false;
    this._resizeObs?.disconnect();
    try { this.faceted?.stop(); this.faceted?.dispose(); } catch (_) { /* ignore */ }
  }
}

// ─── Canvas 2D Renderer (no GPU context) ───────────────────────

export class Canvas2DRenderer {
  constructor(canvasId, opts = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) { this.active = false; return; }
    this.ctx = this.canvas.getContext('2d');
    this.active = true;
    this.params = {
      geometry: 3, hue: 180, gridDensity: 24, speed: 1.0,
      morphFactor: 0.5, chaos: 0.2, intensity: 0.7,
      rot4dXW: 0, rot4dYW: 0, dimension: 3.5, ...opts,
    };
    this.resize();
    this._ro = new ResizeObserver(() => this.resize());
    this._ro.observe(this.canvas.parentElement);
  }

  resize() {
    if (!this.canvas) return;
    const p = this.canvas.parentElement;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = p.clientWidth * dpr;
    this.canvas.height = p.clientHeight * dpr;
    this.w = this.canvas.width;
    this.h = this.canvas.height;
  }

  setParam(k, v) { this.params[k] = v; }
  setParams(o) { Object.assign(this.params, o); }

  render(time) {
    if (!this.active || !this.ctx) return;
    const { ctx, w, h, params: p } = this;
    const t = time * p.speed * 0.001;
    const geo = Math.floor(p.geometry) % 24;
    const base = geo % 8, core = Math.floor(geo / 8);

    ctx.clearRect(0, 0, w, h);

    // Radial background gradient
    const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
    bg.addColorStop(0, `hsla(${p.hue}, 40%, 6%, 1)`);
    bg.addColorStop(1, `hsla(${(p.hue + 40) % 360}, 30%, 2%, 1)`);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2, cy = h / 2, sc = Math.min(w, h) * 0.35;
    const density = Math.max(4, Math.floor(p.gridDensity));
    const dim = p.dimension || 3.5;
    ctx.globalAlpha = p.intensity;

    for (let i = 0; i < density; i++) {
      const f = i / density;
      const ang = f * Math.PI * 2 + t + (p.rot4dXW || 0);
      const hShift = (p.hue + f * 120 + core * 60) % 360;
      ctx.strokeStyle = `hsla(${hShift}, 65%, 52%, ${0.12 + p.chaos * 0.3})`;
      ctx.lineWidth = 1 + p.morphFactor * 0.5;

      // 4D projection factor
      const w4 = Math.sin(t * 0.5 + f * 3.14 + (p.rot4dYW || 0)) * 0.4;
      const pf = 1.0 / (dim - w4);

      ctx.beginPath();
      this._drawGeometry(ctx, base, cx, cy, sc, pf, f, ang, t, w, p);
      ctx.stroke();

      // Core warp overlay (Hypersphere / Hypertetra)
      if (core > 0 && i % 3 === 0) {
        ctx.strokeStyle = `hsla(${(hShift + 180) % 360}, 55%, 40%, 0.07)`;
        ctx.beginPath();
        if (core === 1) {
          ctx.arc(cx, cy, sc * f * pf * 1.1, 0, Math.PI * 2);
        } else {
          for (let v = 0; v < 5; v++) {
            const a = f * Math.PI * 2 / 5 * v + t * 0.2;
            const r = sc * 0.4 * pf;
            v === 0 ? ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
                     : ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
          }
          ctx.closePath();
        }
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  _drawGeometry(ctx, base, cx, cy, sc, pf, f, ang, t, w, p) {
    switch (base) {
      case 0: // Tetrahedron
        for (let j = 0; j < 3; j++) {
          const a = ang + j * 2.094, r = sc * (0.3 + f * 0.7) * pf;
          j === 0 ? ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
                   : ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        }
        ctx.closePath();
        break;
      case 1: { // Hypercube
        const s = sc * (0.2 + f * 0.6) * pf;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.3 + f * 0.5 + (p.rot4dXW || 0));
        ctx.rect(-s / 2, -s / 2, s, s); ctx.restore();
        break;
      }
      case 2: // Sphere
        ctx.arc(cx + Math.sin(t + f * 2) * 10, cy + Math.cos(t + f * 2) * 10, sc * f * pf, 0, Math.PI * 2);
        break;
      case 3: { // Torus
        const tr = sc * 0.5 * pf, to = sc * 0.2 * (1 + f * 0.5);
        ctx.arc(cx + Math.cos(ang) * tr, cy + Math.sin(ang) * tr, to * pf, 0, Math.PI * 2);
        break;
      }
      case 4: // Klein Bottle
        for (let k = 0; k <= 32; k++) {
          const kt = k / 32 * Math.PI * 2;
          const kr = sc * (0.3 + 0.15 * Math.sin(kt * 2 + t)) * pf;
          const kx = cx + Math.cos(kt + ang) * kr * (1 + 0.3 * Math.sin(kt + t));
          const ky = cy + Math.sin(kt + ang) * kr;
          k === 0 ? ctx.moveTo(kx, ky) : ctx.lineTo(kx, ky);
        }
        break;
      case 5: { // Fractal
        const fl = sc * 0.5 * pf, fa = ang + t * 0.2;
        ctx.moveTo(cx + Math.cos(fa) * fl * f, cy + Math.sin(fa) * fl * f);
        ctx.lineTo(cx + Math.cos(fa + 2.4) * fl * f * 0.7, cy + Math.sin(fa + 2.4) * fl * f * 0.7);
        ctx.lineTo(cx + Math.cos(fa + 4.8) * fl * f * 0.5, cy + Math.sin(fa + 4.8) * fl * f * 0.5);
        break;
      }
      case 6: // Wave
        for (let x = 0; x < w; x += 4) {
          const wf = x / w;
          const wy = cy + Math.sin(wf * p.gridDensity * 0.5 + t + f * 3) * sc * 0.3 * pf * (0.5 + f);
          x === 0 ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
        }
        break;
      case 7: { // Crystal
        const cl = sc * 0.4 * pf, ca = ang + f * 0.5;
        for (let ci = 0; ci < 6; ci++) {
          const a2 = ca + ci * Math.PI / 3;
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a2) * cl * (0.5 + f * 0.5), cy + Math.sin(a2) * cl * (0.5 + f * 0.5));
        }
        break;
      }
    }
  }

  dispose() { this.active = false; this._ro?.disconnect(); }
}
