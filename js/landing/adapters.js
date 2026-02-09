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
    this.params = { ...DEFAULT_PARAMS, ...opts };

    try {
      this.faceted = new FacetedSystem();
      // Synchronous direct WebGL init — matches Quantum/Holographic pattern.
      // No async bridge, no race conditions, starts render loop immediately.
      const ok = this.faceted.initDirect(canvas);
      if (ok) {
        this.active = true;
        this.faceted.updateParameters(this.params);
      } else {
        console.warn('Faceted initDirect failed');
        this.active = false;
        return;
      }
    } catch (e) {
      console.warn('Faceted init error', e);
      this.active = false;
      return;
    }

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

// ─── Ambient Lattice (Canvas 2D accent — no GPU context) ────────
// Complementary accent renderer: ambient nebula → lattice geometry → glow pass
// NOT a visualization system — a lightweight parallax-ready atmosphere layer.
// Uses globalCompositeOperation 'lighter' for additive glow.

export class AmbientLattice {
  constructor(canvasId, opts = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) { this.active = false; return; }
    this.ctx = this.canvas.getContext('2d');
    this.active = true;
    this.params = {
      geometry: 3, hue: 180, gridDensity: 24, speed: 1.0,
      morphFactor: 0.5, chaos: 0.2, intensity: 0.7,
      rot4dXW: 0, rot4dYW: 0, rot4dZW: 0, dimension: 3.5,
      saturation: 0.8, ...opts,
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
    const cx = w / 2, cy = h / 2;
    // DRAMATIC scale: geometry fills the canvas
    const sc = Math.max(w, h) * 0.55;
    const density = Math.max(4, Math.floor(p.gridDensity));
    const dim = p.dimension || 3.5;
    const sat = Math.round((p.saturation ?? 0.8) * 100);
    // Mouse reactivity (fed externally via setParam('mouseX'/mouseY'))
    const mx = p.mouseX ?? 0.5, my = p.mouseY ?? 0.5;
    const mouseShift = (mx - 0.5) * 0.3;

    // ── Layer 0: Deep background with hue shift ──
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    const bgR = Math.max(w, h) * 0.85;
    const bg = ctx.createRadialGradient(cx + (mx - 0.5) * w * 0.2, cy + (my - 0.5) * h * 0.2, 0, cx, cy, bgR);
    bg.addColorStop(0, `hsla(${p.hue}, ${sat}%, 12%, 1)`);
    bg.addColorStop(0.4, `hsla(${(p.hue + 20) % 360}, ${sat}%, 6%, 1)`);
    bg.addColorStop(1, `hsla(${(p.hue + 40) % 360}, ${Math.max(0, sat - 20)}%, 2%, 1)`);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // ── Layer 1: BIG nebula clouds — fill the canvas with color ──
    const nebulaAlpha = 0.25 + p.intensity * 0.35;
    for (let n = 0; n < 4; n++) {
      const nAng = t * 0.12 + n * 1.57 + (p.rot4dZW || 0) * 0.5 + mouseShift;
      const nR = sc * (0.7 + Math.sin(t * 0.25 + n * 1.2) * 0.4);
      const nx = cx + Math.cos(nAng) * sc * 0.35;
      const ny = cy + Math.sin(nAng) * sc * 0.3;
      const nGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nR);
      const nHue = (p.hue + n * 80 + core * 50) % 360;
      nGrad.addColorStop(0, `hsla(${nHue}, ${sat}%, 50%, ${nebulaAlpha})`);
      nGrad.addColorStop(0.3, `hsla(${nHue}, ${Math.max(0, sat - 10)}%, 35%, ${nebulaAlpha * 0.6})`);
      nGrad.addColorStop(0.7, `hsla(${(nHue + 30) % 360}, ${sat}%, 20%, ${nebulaAlpha * 0.2})`);
      nGrad.addColorStop(1, `hsla(${nHue}, ${sat}%, 10%, 0)`);
      ctx.fillStyle = nGrad;
      ctx.fillRect(0, 0, w, h);
    }

    // ── Layer 2: Primary geometry — BOLD filled shapes ──
    ctx.globalAlpha = Math.min(1, p.intensity * 1.2);
    const halfDensity = Math.ceil(density / 2);

    for (let i = 0; i < density; i++) {
      const f = i / density;
      const ang = f * Math.PI * 2 + t + (p.rot4dXW || 0) + mouseShift * 2;
      const hShift = (p.hue + f * 120 + core * 60) % 360;

      // 4D projection factor
      const w4 = Math.sin(t * 0.5 + f * 3.14 + (p.rot4dYW || 0)) * 0.4;
      const pf = 1.0 / (dim - w4);

      // BOLD stroke + visible fill
      const strokeAlpha = 0.45 + p.chaos * 0.4 + p.intensity * 0.15;
      const fillAlpha = 0.12 + p.chaos * 0.15 + (i < halfDensity ? 0.08 : 0);
      ctx.strokeStyle = `hsla(${hShift}, ${sat}%, 65%, ${strokeAlpha})`;
      ctx.fillStyle = `hsla(${hShift}, ${Math.max(0, sat - 5)}%, 45%, ${fillAlpha})`;
      ctx.lineWidth = 2 + p.morphFactor * 1.5 + (i === 0 ? 1.5 : 0);

      ctx.beginPath();
      this._drawGeometry(ctx, base, cx, cy, sc, pf, f, ang, t, w, h, p);
      ctx.fill();
      ctx.stroke();

      // Core warp overlay (Hypersphere / Hypertetra) — BOLD
      if (core > 0 && i % 2 === 0) {
        const warpHue = (hShift + 180) % 360;
        ctx.strokeStyle = `hsla(${warpHue}, ${sat}%, 60%, ${0.25 + p.chaos * 0.25})`;
        ctx.lineWidth = 1.5 + p.morphFactor * 0.8;
        ctx.beginPath();
        if (core === 1) {
          const hR = sc * f * pf * 1.2;
          const wobble = Math.sin(t + f * 5 + (p.rot4dZW || 0)) * sc * 0.08;
          ctx.arc(cx + wobble, cy - wobble * 0.7, Math.max(3, hR), 0, Math.PI * 2);
        } else {
          for (let v = 0; v < 5; v++) {
            const a = f * Math.PI * 2 / 5 * v + t * 0.3 + (p.rot4dZW || 0);
            const r = sc * (0.35 + f * 0.35) * pf;
            v === 0 ? ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
                     : ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
          }
          ctx.closePath();
        }
        ctx.stroke();
      }
    }

    // ── Layer 3: Additive glow pass — BIG and BRIGHT ──
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = Math.min(1, p.intensity * 0.8);

    // Center glow beacon — covers significant canvas area
    const glowR = sc * (0.55 + Math.sin(t * 0.7) * 0.2);
    const glowGrad = ctx.createRadialGradient(
      cx + (mx - 0.5) * sc * 0.3, cy + (my - 0.5) * sc * 0.3,
      0, cx, cy, glowR
    );
    const glowHue = (p.hue + Math.sin(t * 0.3) * 30) % 360;
    glowGrad.addColorStop(0, `hsla(${glowHue}, ${sat}%, 65%, ${0.3 + p.chaos * 0.2})`);
    glowGrad.addColorStop(0.4, `hsla(${glowHue}, ${sat}%, 45%, ${0.12 + p.chaos * 0.1})`);
    glowGrad.addColorStop(1, `hsla(${glowHue}, ${sat}%, 20%, 0)`);
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, w, h);

    // Glow accent dots — brighter, larger
    const glowCount = Math.min(12, Math.floor(density / 2));
    for (let i = 0; i < glowCount; i++) {
      const f = i / glowCount;
      const ang = f * Math.PI * 2 + t * 0.8 + (p.rot4dXW || 0);
      const w4 = Math.sin(t * 0.5 + f * 3.14 + (p.rot4dYW || 0)) * 0.4;
      const pf = 1.0 / (dim - w4);
      const hShift = (p.hue + f * 120 + core * 60) % 360;

      const gx = cx + Math.cos(ang) * sc * (0.2 + f * 0.6) * pf;
      const gy = cy + Math.sin(ang) * sc * (0.2 + f * 0.6) * pf;
      const dotR = 5 + p.morphFactor * 6 + Math.sin(t * 2 + f * 10) * 3;
      const dotGrad = ctx.createRadialGradient(gx, gy, 0, gx, gy, dotR * 4);
      dotGrad.addColorStop(0, `hsla(${hShift}, ${sat}%, 80%, 0.6)`);
      dotGrad.addColorStop(0.25, `hsla(${hShift}, ${sat}%, 60%, 0.25)`);
      dotGrad.addColorStop(1, `hsla(${hShift}, ${sat}%, 40%, 0)`);
      ctx.fillStyle = dotGrad;
      ctx.fillRect(gx - dotR * 4, gy - dotR * 4, dotR * 8, dotR * 8);
    }

    // ── Layer 4: Edge highlights — VIVID bright lines ──
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = Math.min(1, p.intensity * 0.9);
    const edgeCount = Math.min(density, 16);
    for (let i = 0; i < edgeCount; i++) {
      const f = i / edgeCount;
      const ang = f * Math.PI * 2 + t * 1.1 + (p.rot4dXW || 0) * 1.2;
      const hShift = (p.hue + f * 80 + 30) % 360;
      const w4 = Math.sin(t * 0.5 + f * 3.14 + (p.rot4dYW || 0)) * 0.4;
      const pf = 1.0 / (dim - w4);
      ctx.strokeStyle = `hsla(${hShift}, ${Math.min(100, sat + 15)}%, 78%, ${0.35 + p.chaos * 0.3})`;
      ctx.lineWidth = 0.8 + p.morphFactor * 0.5;
      ctx.beginPath();
      this._drawGeometry(ctx, base, cx, cy, sc * 0.92, pf, f, ang + 0.1, t, w, h, p);
      ctx.stroke();
    }

    // ── Cleanup ──
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  _drawGeometry(ctx, base, cx, cy, sc, pf, f, ang, t, w, h, p) {
    switch (base) {
      case 0: { // Tetrahedron
        const sides = 3 + Math.floor(p.morphFactor);
        for (let j = 0; j <= sides; j++) {
          const a = ang + j * (Math.PI * 2 / sides), r = sc * (0.3 + f * 0.7) * pf;
          j === 0 ? ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
                   : ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        }
        ctx.closePath();
        break;
      }
      case 1: { // Hypercube
        const s = sc * (0.2 + f * 0.6) * pf;
        const rot = t * 0.3 + f * 0.5 + (p.rot4dXW || 0);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.rect(-s / 2, -s / 2, s, s);
        // Inner cube (4D projection of inner face)
        const s2 = s * 0.55;
        const off = Math.sin(t + f * 2) * s * 0.15;
        ctx.rect(-s2 / 2 + off, -s2 / 2 + off, s2, s2);
        ctx.restore();
        break;
      }
      case 2: { // Sphere
        const wobX = Math.sin(t + f * 2) * sc * 0.05;
        const wobY = Math.cos(t + f * 2) * sc * 0.05;
        ctx.arc(cx + wobX, cy + wobY, Math.max(2, sc * f * pf), 0, Math.PI * 2);
        break;
      }
      case 3: { // Torus
        const tr = sc * 0.5 * pf, to = sc * (0.15 + f * 0.15);
        const tx = cx + Math.cos(ang) * tr;
        const ty = cy + Math.sin(ang) * tr;
        ctx.arc(tx, ty, Math.max(2, to * pf), 0, Math.PI * 2);
        break;
      }
      case 4: // Klein Bottle
        for (let k = 0; k <= 48; k++) {
          const kt = k / 48 * Math.PI * 2;
          const kr = sc * (0.3 + 0.15 * Math.sin(kt * 2 + t)) * pf;
          const twist = 1 + 0.4 * Math.sin(kt * 3 + t * 1.5);
          const kx = cx + Math.cos(kt + ang) * kr * twist;
          const ky = cy + Math.sin(kt + ang) * kr;
          k === 0 ? ctx.moveTo(kx, ky) : ctx.lineTo(kx, ky);
        }
        ctx.closePath();
        break;
      case 5: { // Fractal — recursive triangle
        const fl = sc * 0.5 * pf, fa = ang + t * 0.2;
        const depth = 1 + Math.floor(p.morphFactor * 2);
        this._fractalTriangle(ctx, cx, cy, fl * (0.3 + f * 0.7), fa, depth);
        break;
      }
      case 6: // Wave — sinusoidal interference
        for (let x = 0; x < w; x += 3) {
          const wf = x / w;
          const wave1 = Math.sin(wf * p.gridDensity * 0.5 + t + f * 3);
          const wave2 = Math.sin(wf * p.gridDensity * 0.3 - t * 0.7 + f * 5) * 0.5;
          const wy = cy + (wave1 + wave2) * sc * 0.25 * pf * (0.5 + f);
          x === 0 ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
        }
        break;
      case 7: { // Crystal
        const cl = sc * 0.45 * pf, ca = ang + f * 0.5;
        for (let ci = 0; ci < 8; ci++) {
          const a2 = ca + ci * Math.PI / 4;
          const len = cl * (0.4 + f * 0.6) * (ci % 2 === 0 ? 1 : 0.6);
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a2) * len, cy + Math.sin(a2) * len);
          // Cross connections between adjacent spokes
          if (ci > 0) {
            const prevA = ca + (ci - 1) * Math.PI / 4;
            const prevLen = cl * (0.4 + f * 0.6) * ((ci - 1) % 2 === 0 ? 1 : 0.6);
            ctx.moveTo(cx + Math.cos(prevA) * prevLen * 0.7, cy + Math.sin(prevA) * prevLen * 0.7);
            ctx.lineTo(cx + Math.cos(a2) * len * 0.7, cy + Math.sin(a2) * len * 0.7);
          }
        }
        break;
      }
    }
  }

  _fractalTriangle(ctx, x, y, size, angle, depth) {
    if (depth <= 0 || size < 3) {
      // Leaf triangle
      for (let j = 0; j < 3; j++) {
        const a = angle + j * 2.094;
        j === 0 ? ctx.moveTo(x + Math.cos(a) * size, y + Math.sin(a) * size)
                 : ctx.lineTo(x + Math.cos(a) * size, y + Math.sin(a) * size);
      }
      ctx.closePath();
      return;
    }
    // Draw outer + recurse to 3 sub-triangles
    for (let j = 0; j < 3; j++) {
      const a = angle + j * 2.094;
      j === 0 ? ctx.moveTo(x + Math.cos(a) * size, y + Math.sin(a) * size)
               : ctx.lineTo(x + Math.cos(a) * size, y + Math.sin(a) * size);
    }
    ctx.closePath();
    for (let j = 0; j < 3; j++) {
      const a = angle + j * 2.094;
      this._fractalTriangle(ctx, x + Math.cos(a) * size * 0.5, y + Math.sin(a) * size * 0.5, size * 0.45, angle + 0.2, depth - 1);
    }
  }

  dispose() { this.active = false; this._ro?.disconnect(); }
}
