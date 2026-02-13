/**
 * Card Tilt System
 *
 * Maps mouse/touch position over registered elements to:
 *   1. CSS 3D transforms (perspective + rotateX/Y) with smooth interpolation
 *   2. Visualizer parameter offsets (4D rotation, speed, chaos, density, hue)
 *   3. CSS custom properties for specular highlights and glare effects
 *
 * Designed to compose with scroll-driven choreography:
 *   - Choreography sets `el.dataset.scrollTransform` for scale/position
 *   - This system prepends perspective + rotation
 *   - Both coexist without conflict
 *
 * Usage:
 *   const tilt = new CardTiltSystem({ maxTilt: 18 });
 *   tilt.register(cardEl, canvasAdapter, { affectsRotation: true });
 *   tilt.setTilt(cardEl, 0.5, -0.3);   // programmatic
 *   tilt.releaseTilt(cardEl);           // return to mouse control
 *   tilt.dispose();
 */
export class CardTiltSystem {
  constructor(options = {}) {
    this.maxTilt = options.maxTilt || 15;
    this.perspective = options.perspective || 1200;
    this.smoothing = options.smoothing || 0.12;
    this.returnSpeed = options.returnSpeed || 0.06;
    this.cards = new Map();
    this._active = true;
    this._rafId = null;
    // Scroll velocity tracking for push displacement (Event 18)
    this._scrollY = 0;
    this._scrollVelocity = 0;
    this._lastScrollTime = 0;
    this._initScrollTracking();
    this._startLoop();
  }

  /**
   * Register an element for tilt tracking.
   * @param {HTMLElement} el - The card/element to tilt
   * @param {object|null} adapter - Visualizer adapter (setParams/setParam), or null for CSS-only
   * @param {object} config - Per-card configuration overrides
   */
  register(el, adapter = null, config = {}) {
    if (!el || this.cards.has(el)) return;

    const entry = {
      el,
      adapter,
      cfg: {
        maxTilt: config.maxTilt ?? this.maxTilt,
        perspective: config.perspective ?? this.perspective,
        sensitivity: config.sensitivity ?? 1.0,
        // Parameter mapping toggles
        affectsRotation: config.affectsRotation !== false,
        affectsSpeed: config.affectsSpeed ?? false,
        affectsChaos: config.affectsChaos ?? false,
        affectsDensity: config.affectsDensity ?? false,
        affectsHue: config.affectsHue ?? false,
        // Mapping scales
        rotationScale: config.rotationScale ?? 1.2,
        speedScale: config.speedScale ?? 0.4,
        chaosScale: config.chaosScale ?? 0.25,
        densityScale: config.densityScale ?? 0.25,
        hueScale: config.hueScale ?? 25,
      },
      // Smoothed current
      tx: 0, ty: 0,
      // Raw target
      gx: 0, gy: 0,
      hovering: false,
      programmatic: false,
    };

    // Per-card event wiring
    const onEnter = () => { entry.hovering = true; };
    const onLeave = () => {
      entry.hovering = false;
      if (!entry.programmatic) { entry.gx = 0; entry.gy = 0; }
    };
    const onMove = (e) => {
      if (entry.programmatic) return;
      const r = el.getBoundingClientRect();
      entry.gx = ((e.clientX - r.left) / r.width * 2 - 1) * entry.cfg.sensitivity;
      entry.gy = ((e.clientY - r.top) / r.height * 2 - 1) * entry.cfg.sensitivity;
    };
    const onTouchMove = (e) => {
      if (entry.programmatic || !e.touches.length) return;
      entry.hovering = true;
      const t = e.touches[0], r = el.getBoundingClientRect();
      entry.gx = ((t.clientX - r.left) / r.width * 2 - 1) * entry.cfg.sensitivity;
      entry.gy = ((t.clientY - r.top) / r.height * 2 - 1) * entry.cfg.sensitivity;
    };

    entry._h = { onEnter, onLeave, onMove, onTouchMove };
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onLeave);

    el.style.transformStyle = 'preserve-3d';
    this.cards.set(el, entry);
    return entry;
  }

  unregister(el) {
    const e = this.cards.get(el);
    if (!e) return;
    const h = e._h;
    el.removeEventListener('mouseenter', h.onEnter);
    el.removeEventListener('mouseleave', h.onLeave);
    el.removeEventListener('mousemove', h.onMove);
    el.removeEventListener('touchmove', h.onTouchMove);
    el.removeEventListener('touchend', h.onLeave);
    el.style.transform = '';
    this.cards.delete(el);
  }

  /** Update the adapter reference (e.g. after GPU context swap). */
  setAdapter(el, adapter) {
    const e = this.cards.get(el);
    if (e) e.adapter = adapter;
  }

  /** Programmatic tilt (-1..1 range). */
  setTilt(el, x, y) {
    const e = this.cards.get(el);
    if (!e) return;
    e.programmatic = true;
    e.gx = x; e.gy = y;
  }

  /** Release programmatic control; return to mouse-driven. */
  releaseTilt(el) {
    const e = this.cards.get(el);
    if (!e) return;
    e.programmatic = false;
    if (!e.hovering) { e.gx = 0; e.gy = 0; }
  }

  // ─── Internal ──────────────────────────────────────────────

  _initScrollTracking() {
    let lastY = window.scrollY || 0;
    const onScroll = () => {
      const now = performance.now();
      const dt = now - this._lastScrollTime;
      const newY = window.scrollY || 0;
      if (dt > 0) {
        const rawV = (newY - lastY) / (dt / 1000);
        // Smooth velocity
        this._scrollVelocity += (rawV - this._scrollVelocity) * 0.15;
      }
      lastY = newY;
      this._scrollY = newY;
      this._lastScrollTime = now;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  _startLoop() {
    const tick = () => {
      if (!this._active) return;
      this._update();
      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);
  }

  _update() {
    for (const e of this.cards.values()) {
      const spd = (e.hovering || e.programmatic) ? this.smoothing : this.returnSpeed;
      e.tx += (e.gx - e.tx) * spd;
      e.ty += (e.gy - e.ty) * spd;

      // Snap to zero
      if (!e.hovering && !e.programmatic &&
          Math.abs(e.tx) < 0.002 && Math.abs(e.ty) < 0.002) {
        e.tx = 0; e.ty = 0;
      }

      this._css(e);
      this._params(e);
    }
  }

  _css(e) {
    const { el, tx, ty, cfg } = e;
    const rotY = tx * cfg.maxTilt;
    const rotX = -ty * cfg.maxTilt;
    const scrollT = el.dataset.scrollTransform || '';

    // Scroll-push displacement (Event 18): scroll velocity tilts cards backward
    const scrollPush = Math.max(-8, Math.min(8, this._scrollVelocity * 0.002));
    const scrollTy = Math.max(-12, Math.min(12, this._scrollVelocity * 0.003));
    const totalRotX = rotX + scrollPush;

    el.style.transform =
      `perspective(${cfg.perspective}px) rotateX(${totalRotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(${scrollTy.toFixed(1)}px) ${scrollT}`;

    // CSS custom properties for specular/glare
    const intensity = Math.min(1, Math.sqrt(tx * tx + ty * ty));
    el.style.setProperty('--tilt-x', tx.toFixed(3));
    el.style.setProperty('--tilt-y', ty.toFixed(3));
    el.style.setProperty('--tilt-intensity', intensity.toFixed(3));
    el.style.setProperty('--tilt-angle', `${(Math.atan2(ty, tx) * 180 / Math.PI).toFixed(1)}deg`);
    el.style.setProperty('--specular-x', `${((tx + 1) * 50).toFixed(1)}%`);
    el.style.setProperty('--specular-y', `${((ty + 1) * 50).toFixed(1)}%`);
  }

  _params(e) {
    const { adapter, tx, ty, cfg } = e;
    if (!adapter || !adapter.active) return;

    const intensity = Math.min(1, Math.sqrt(tx * tx + ty * ty));
    // Also factor in scroll velocity for reactivity
    const scrollIntensity = Math.min(1, Math.abs(this._scrollVelocity) / 3000);
    const combinedIntensity = Math.max(intensity, scrollIntensity);
    if (combinedIntensity < 0.01) return; // Dead zone

    const p = {};

    if (cfg.affectsRotation) {
      // Map tilt to 3D rotation planes (XY, XZ)
      p.rot4dXY = ty * cfg.rotationScale;
      p.rot4dXZ = tx * cfg.rotationScale;
      // Scroll velocity drives 4D rotation (Event 18: "scroll drives 4th dimension")
      const scrollRot = scrollIntensity * cfg.rotationScale * 0.5;
      p.rot4dYW = (adapter.params?.rot4dYW || 0) + tx * cfg.rotationScale * 0.3 + scrollRot;
    }

    if (cfg.affectsSpeed) {
      const speedBoost = 1 + combinedIntensity * cfg.speedScale;
      p.speed = (adapter.params?.speed || 1.0) * speedBoost;
    }

    if (cfg.affectsChaos) {
      const base = adapter.params?.chaos ?? 0.2;
      p.chaos = Math.min(1, base + combinedIntensity * cfg.chaosScale);
    }

    if (cfg.affectsDensity) {
      const base = adapter.params?.gridDensity ?? 24;
      p.gridDensity = Math.max(4, base * (1 - combinedIntensity * cfg.densityScale));
    }

    if (cfg.affectsHue) {
      const base = adapter.params?.hue ?? 200;
      p.hue = (base + tx * cfg.hueScale + 360) % 360;
    }

    adapter.setParams(p);
  }

  dispose() {
    this._active = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    for (const el of [...this.cards.keys()]) this.unregister(el);
  }
}
