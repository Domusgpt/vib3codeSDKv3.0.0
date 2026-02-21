/**
 * Overlay Choreography System — CSS Accent Layers + Multi-Instance Mirrors
 *
 * Adds coordinated CSS effects on TOP of visualizer canvases:
 *   1. GradientWashLayer — scroll-reactive gradient washes over canvas sections
 *   2. MirrorReflection — CSS transform duplicates of canvases (no resize, no new GPU)
 *   3. EdgeGlowRing — animated border glow rings that pulse with visualizer params
 *   4. ParticleField — lightweight CSS particle system driven by scroll + params
 *   5. CrossfadeBridge — smooth inter-section transitions with coordinated CSS + params
 *
 * Key constraint: NEVER resizes or moves the actual canvas. All effects are CSS-only
 * layers positioned absolutely on top via pointer-events:none overlays.
 */

// ─── Math Helpers ──────────────────────────────────────────────
const clamp01 = v => Math.max(0, Math.min(1, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = p => p * p * (3 - 2 * p);

// ═══════════════════════════════════════════════════════════════
//  1. GRADIENT WASH LAYER
//     Animated radial/conic gradient overlays that respond to
//     scroll position and visualizer parameters (hue, intensity)
// ═══════════════════════════════════════════════════════════════

export class GradientWashLayer {
  /**
   * @param {string} containerId - parent element to overlay
   * @param {object} opts - { mode: 'radial'|'conic'|'sweep', blendMode, baseOpacity }
   */
  constructor(containerId, opts = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.mode = opts.mode || 'radial';
    this.blendMode = opts.blendMode || 'screen';
    this.baseOpacity = opts.baseOpacity ?? 0.12;
    this.hue = opts.hue ?? 200;
    this.intensity = opts.intensity ?? 0.5;
    this.angle = 0;

    this.el = document.createElement('div');
    this.el.className = 'overlay-gradient-wash';
    this.el.setAttribute('aria-hidden', 'true');
    Object.assign(this.el.style, {
      position: 'absolute', inset: '0',
      pointerEvents: 'none',
      zIndex: opts.zIndex ?? '6',
      mixBlendMode: this.blendMode,
      opacity: '0',
      transition: 'opacity 0.4s ease-out',
      willChange: 'background, opacity',
    });
    this.container.style.position = this.container.style.position || 'relative';
    this.container.appendChild(this.el);
  }

  update(scrollProgress, params = {}) {
    if (!this.el) return;
    const hue = params.hue ?? this.hue;
    const intensity = clamp01(params.intensity ?? this.intensity);
    const chaos = params.chaos ?? 0;
    const time = performance.now() * 0.001;

    this.angle += (0.3 + chaos * 2) * 0.016; // ~60fps increment

    const alpha = this.baseOpacity * intensity;
    const sat = 70 + chaos * 20;
    const light = 45 + intensity * 15;

    if (this.mode === 'radial') {
      // Mouse-following radial wash
      const cx = 50 + Math.sin(time * 0.3 + scrollProgress * Math.PI * 2) * 20;
      const cy = 50 + Math.cos(time * 0.2 + scrollProgress * Math.PI) * 15;
      this.el.style.background = `radial-gradient(
        ellipse 80% 80% at ${cx}% ${cy}%,
        hsla(${hue}, ${sat}%, ${light}%, ${alpha}) 0%,
        hsla(${(hue + 60) % 360}, ${sat}%, ${light - 10}%, ${alpha * 0.4}) 40%,
        transparent 75%
      )`;
    } else if (this.mode === 'conic') {
      const rotation = this.angle * 57.3; // rad → deg
      this.el.style.background = `conic-gradient(
        from ${rotation}deg at 50% 50%,
        hsla(${hue}, ${sat}%, ${light}%, ${alpha}) 0deg,
        transparent 60deg,
        hsla(${(hue + 120) % 360}, ${sat}%, ${light}%, ${alpha * 0.6}) 120deg,
        transparent 180deg,
        hsla(${(hue + 240) % 360}, ${sat}%, ${light}%, ${alpha * 0.4}) 240deg,
        transparent 300deg,
        hsla(${hue}, ${sat}%, ${light}%, ${alpha}) 360deg
      )`;
    } else {
      // Sweep: diagonal linear gradient that shifts with scroll
      const angle = scrollProgress * 360;
      this.el.style.background = `linear-gradient(
        ${angle}deg,
        hsla(${hue}, ${sat}%, ${light}%, ${alpha}) 0%,
        transparent 35%,
        hsla(${(hue + 180) % 360}, ${sat}%, ${light}%, ${alpha * 0.5}) 65%,
        transparent 100%
      )`;
    }

    this.el.style.opacity = intensity > 0.05 ? '1' : '0';
  }

  dispose() {
    this.el?.remove();
  }
}

// ═══════════════════════════════════════════════════════════════
//  2. MIRROR REFLECTION SYSTEM
//     Creates CSS-only "reflections" of a canvas using CSS transforms.
//     No GPU contexts, no canvas resize — just a clipped, blended copy
//     via CSS mask-image + transform + opacity layering.
// ═══════════════════════════════════════════════════════════════

export class MirrorReflection {
  /**
   * @param {string} sourceCanvasId - canvas to mirror
   * @param {string} containerId - parent to place mirror in
   * @param {object} opts - { position, opacity, blendMode, maskGradient, transforms }
   */
  constructor(sourceCanvasId, containerId, opts = {}) {
    this.sourceCanvas = document.getElementById(sourceCanvasId);
    this.container = document.getElementById(containerId);
    if (!this.sourceCanvas || !this.container) return;

    this.position = opts.position || 'below'; // 'below' | 'above' | 'left' | 'right'
    this.baseOpacity = opts.opacity ?? 0.15;
    this.blendMode = opts.blendMode || 'screen';

    // Create the mirror container
    this.el = document.createElement('div');
    this.el.className = `overlay-mirror mirror-${this.position}`;
    this.el.setAttribute('aria-hidden', 'true');

    const posStyles = this._getPositionStyles();
    Object.assign(this.el.style, {
      position: 'absolute',
      pointerEvents: 'none',
      overflow: 'hidden',
      mixBlendMode: this.blendMode,
      opacity: String(this.baseOpacity),
      zIndex: opts.zIndex ?? '3',
      willChange: 'transform, opacity',
      transition: 'opacity 0.5s ease-out, transform 0.3s ease-out',
      ...posStyles,
    });

    // Fade mask: the reflection fades to transparent
    const maskDir = this.position === 'below' ? 'to bottom'
      : this.position === 'above' ? 'to top'
      : this.position === 'left' ? 'to left' : 'to right';
    this.el.style.maskImage = opts.maskGradient
      || `linear-gradient(${maskDir}, rgba(0,0,0,0.7) 0%, transparent 80%)`;
    this.el.style.webkitMaskImage = this.el.style.maskImage;

    this.container.style.position = this.container.style.position || 'relative';
    this.container.appendChild(this.el);
    this._startCopyLoop();
  }

  _getPositionStyles() {
    switch (this.position) {
      case 'below': return {
        left: '0', right: '0', top: '100%', height: '40%',
        transform: 'scaleY(-1)',
      };
      case 'above': return {
        left: '0', right: '0', bottom: '100%', height: '30%',
        transform: 'scaleY(-1)',
      };
      case 'left': return {
        right: '100%', top: '0', bottom: '0', width: '25%',
        transform: 'scaleX(-1)',
      };
      case 'right': return {
        left: '100%', top: '0', bottom: '0', width: '25%',
        transform: 'scaleX(-1)',
      };
      default: return {};
    }
  }

  _startCopyLoop() {
    // Use a 2D canvas to periodically snapshot the source canvas
    this._copyCanvas = document.createElement('canvas');
    this._copyCtx = this._copyCanvas.getContext('2d', { alpha: true });
    this._copyCanvas.style.cssText = 'width:100%;height:100%;display:block;';
    this.el.appendChild(this._copyCanvas);

    this._frameCount = 0;
    this._copyLoop();
  }

  _copyLoop() {
    if (!this.sourceCanvas || !this._copyCtx) return;

    this._frameCount++;
    // Copy every 3rd frame to save CPU (mirrors don't need full framerate)
    if (this._frameCount % 3 === 0) {
      const src = this.sourceCanvas;
      const dst = this._copyCanvas;
      if (src.width > 0 && src.height > 0) {
        if (dst.width !== src.width || dst.height !== src.height) {
          dst.width = src.width;
          dst.height = src.height;
        }
        try {
          this._copyCtx.drawImage(src, 0, 0);
        } catch (_) { /* cross-origin or lost context, silently skip */ }
      }
    }

    this._rafId = requestAnimationFrame(() => this._copyLoop());
  }

  /**
   * Update mirror opacity/transform based on scroll or params
   */
  update(scrollProgress, params = {}) {
    if (!this.el) return;
    const intensity = clamp01(params.intensity ?? 0.5);
    this.el.style.opacity = String(this.baseOpacity * intensity);

    // Subtle parallax shift with scroll
    const offset = (scrollProgress - 0.5) * 20;
    const base = this._getPositionStyles().transform || '';
    if (this.position === 'below' || this.position === 'above') {
      this.el.style.transform = `${base} translateY(${offset}px)`;
    } else {
      this.el.style.transform = `${base} translateX(${offset}px)`;
    }
  }

  dispose() {
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this.el?.remove();
  }
}

// ═══════════════════════════════════════════════════════════════
//  3. EDGE GLOW RING
//     Animated pulsing border glow that syncs with visualizer params.
//     Uses box-shadow + pseudo-element conic gradient.
// ═══════════════════════════════════════════════════════════════

export class EdgeGlowRing {
  /**
   * @param {string} targetId - element to apply glow ring to
   * @param {object} opts - { baseSize, pulseScale, color }
   */
  constructor(targetId, opts = {}) {
    this.target = document.getElementById(targetId);
    if (!this.target) return;

    this.baseSize = opts.baseSize ?? 8;
    this.pulseScale = opts.pulseScale ?? 2.5;
    this.hue = opts.hue ?? 200;

    // Create pseudo-layer for the ring
    this.el = document.createElement('div');
    this.el.className = 'overlay-edge-glow';
    this.el.setAttribute('aria-hidden', 'true');
    Object.assign(this.el.style, {
      position: 'absolute',
      inset: `-${this.baseSize}px`,
      borderRadius: 'inherit',
      pointerEvents: 'none',
      zIndex: opts.zIndex ?? '7',
      opacity: '0',
      transition: 'opacity 0.3s ease-out',
    });

    this.target.style.position = this.target.style.position || 'relative';
    this.target.appendChild(this.el);
  }

  update(scrollProgress, params = {}) {
    if (!this.el) return;
    const hue = params.hue ?? this.hue;
    const intensity = clamp01(params.intensity ?? 0.5);
    const chaos = clamp01(params.chaos ?? 0);
    const speed = params.speed ?? 1;
    const time = performance.now() * 0.001;

    const pulse = Math.sin(time * speed * 2) * 0.5 + 0.5;
    const glowSize = this.baseSize + pulse * this.pulseScale * (1 + chaos);
    const alpha = (0.15 + intensity * 0.3 + chaos * 0.15) * pulse;

    this.el.style.boxShadow = [
      `0 0 ${glowSize}px hsla(${hue}, 80%, 55%, ${alpha})`,
      `inset 0 0 ${glowSize * 0.6}px hsla(${(hue + 30) % 360}, 70%, 50%, ${alpha * 0.5})`,
    ].join(', ');

    this.el.style.opacity = intensity > 0.1 ? '1' : '0';
  }

  dispose() {
    this.el?.remove();
  }
}

// ═══════════════════════════════════════════════════════════════
//  4. CSS PARTICLE FIELD
//     Lightweight scroll-driven particles using CSS animations.
//     No canvas, no GPU — pure DOM + animation.
//     Particles spawn at scroll events, drift with time, fade out.
// ═══════════════════════════════════════════════════════════════

export class ParticleField {
  /**
   * @param {string} containerId - element to host particles
   * @param {object} opts - { count, hue, spread, lifespan }
   */
  constructor(containerId, opts = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.maxCount = opts.count ?? 20;
    this.hue = opts.hue ?? 200;
    this.spread = opts.spread ?? 200;
    this.lifespan = opts.lifespan ?? 4000;
    this.particles = [];

    this.el = document.createElement('div');
    this.el.className = 'overlay-particle-field';
    this.el.setAttribute('aria-hidden', 'true');
    Object.assign(this.el.style, {
      position: 'absolute', inset: '0',
      pointerEvents: 'none', overflow: 'hidden',
      zIndex: opts.zIndex ?? '5',
    });

    this.container.style.position = this.container.style.position || 'relative';
    this.container.appendChild(this.el);

    // Seed initial particles
    for (let i = 0; i < Math.floor(this.maxCount * 0.6); i++) {
      this._spawn(true);
    }
  }

  _spawn(randomStart = false) {
    if (this.particles.length >= this.maxCount) return;

    const p = document.createElement('span');
    const size = 2 + Math.random() * 3;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const dx = (Math.random() - 0.5) * this.spread;
    const dy = -20 - Math.random() * this.spread * 0.6;
    const dur = this.lifespan * (0.6 + Math.random() * 0.8);
    const delay = randomStart ? -Math.random() * dur : 0;
    const hueShift = Math.random() * 60 - 30;

    Object.assign(p.style, {
      position: 'absolute',
      left: `${x}%`, top: `${y}%`,
      width: `${size}px`, height: `${size}px`,
      borderRadius: '50%',
      background: `hsla(${this.hue + hueShift}, 70%, 70%, 0.6)`,
      boxShadow: `0 0 ${size * 2}px hsla(${this.hue + hueShift}, 70%, 60%, 0.3)`,
      '--dx': `${dx}px`, '--dy': `${dy}px`,
      '--particle-dur': `${dur}ms`,
      animation: `particle-drift ${dur}ms linear infinite`,
      animationDelay: `${delay}ms`,
    });

    this.el.appendChild(p);
    this.particles.push(p);
  }

  update(scrollProgress, params = {}) {
    if (!this.el) return;
    this.hue = params.hue ?? this.hue;
    const intensity = clamp01(params.intensity ?? 0.5);
    const chaos = clamp01(params.chaos ?? 0);

    // Adjust particle visibility based on intensity
    this.el.style.opacity = String(0.3 + intensity * 0.7);

    // Chaos spawns burst particles
    if (chaos > 0.4 && this.particles.length < this.maxCount) {
      this._spawn();
    }

    // Update particle hues (batch — only recolor every 60 frames)
    if (!this._frameCount) this._frameCount = 0;
    this._frameCount++;
    if (this._frameCount % 60 === 0) {
      this.particles.forEach((p, i) => {
        const shift = Math.sin(i * 0.5) * 40;
        p.style.background = `hsla(${this.hue + shift}, 70%, 70%, ${0.3 + intensity * 0.4})`;
      });
    }
  }

  dispose() {
    this.el?.remove();
    this.particles = [];
  }
}

// ═══════════════════════════════════════════════════════════════
//  5. CROSSFADE BRIDGE
//     Smooth section-to-section transitions:
//     - CSS overlay fades between section colors
//     - Coordinates parameter ramps between outgoing/incoming adapters
//     - Accent effects: border glow pulse, particle burst, gradient sweep
//     All without resizing or touching the canvas itself.
// ═══════════════════════════════════════════════════════════════

export class CrossfadeBridge {
  /**
   * @param {object} opts - { triggerSelector, outHue, inHue, duration }
   */
  constructor(opts = {}) {
    this.outHue = opts.outHue ?? 200;
    this.inHue = opts.inHue ?? 280;

    // Create fixed overlay for bridge effect
    this.el = document.createElement('div');
    this.el.className = 'overlay-crossfade-bridge';
    this.el.setAttribute('aria-hidden', 'true');
    Object.assign(this.el.style, {
      position: 'fixed', inset: '0',
      pointerEvents: 'none',
      zIndex: '45',
      opacity: '0',
      willChange: 'opacity, background',
      transition: 'opacity 0.2s ease-out',
    });
    document.body.appendChild(this.el);
  }

  /**
   * Drive the bridge effect from scroll progress (0-1 across the transition zone)
   * @param {number} progress - 0=start of transition, 1=end
   * @param {object} outAdapter - departing visualizer adapter
   * @param {object} inAdapter - incoming visualizer adapter
   */
  update(progress, outAdapter, inAdapter) {
    if (!this.el) return;
    const p = clamp01(progress);

    // Bell curve: peak at midpoint, zero at edges
    const bell = Math.sin(p * Math.PI);
    const bellSq = bell * bell;

    // Gradient overlay: outHue fading to inHue
    const hue = lerp(this.outHue, this.inHue, smoothstep(p));
    const alpha = bellSq * 0.08;

    this.el.style.background = `radial-gradient(
      ellipse 120% 100% at 50% ${lerp(100, 0, p)}%,
      hsla(${hue}, 60%, 50%, ${alpha}) 0%,
      hsla(${hue}, 40%, 30%, ${alpha * 0.4}) 40%,
      transparent 70%
    )`;
    this.el.style.opacity = bellSq > 0.01 ? '1' : '0';

    // Cross-coordinate parameters on adapters
    if (outAdapter && p < 0.7) {
      const fadeOut = smoothstep(clamp01(p / 0.7));
      outAdapter.setParams({
        intensity: lerp(outAdapter.params?.intensity ?? 0.7, 0.1, fadeOut),
        speed: lerp(outAdapter.params?.speed ?? 0.5, 0.05, fadeOut),
        gridDensity: lerp(outAdapter.params?.gridDensity ?? 24, 55, fadeOut),
      });
    }

    if (inAdapter && p > 0.3) {
      const fadeIn = smoothstep(clamp01((p - 0.3) / 0.7));
      inAdapter.setParams({
        intensity: lerp(0.05, inAdapter.params?.intensity ?? 0.7, fadeIn),
        speed: lerp(0.02, inAdapter.params?.speed ?? 0.5, fadeIn),
        gridDensity: lerp(60, inAdapter.params?.gridDensity ?? 24, fadeIn),
      });
    }
  }

  dispose() {
    this.el?.remove();
  }
}

// ═══════════════════════════════════════════════════════════════
//  6. SCROLL-SYNCED ACCENT CHOREOGRAPHER
//     Master controller that coordinates all overlay systems
//     with GSAP ScrollTrigger for per-section orchestration.
// ═══════════════════════════════════════════════════════════════

export class AccentChoreographer {
  constructor() {
    this.layers = new Map();
    this.bridges = [];
    this._rafId = null;
  }

  /**
   * Register an overlay layer with a section
   * @param {string} key - unique identifier
   * @param {object} layer - any overlay object with update(progress, params) method
   * @param {object} opts - { section, adapter, paramSource }
   */
  register(key, layer, opts = {}) {
    this.layers.set(key, { layer, opts });
  }

  /**
   * Register a crossfade bridge between two sections
   */
  registerBridge(bridge, opts = {}) {
    this.bridges.push({ bridge, ...opts });
  }

  /**
   * Initialize all scroll triggers for registered layers.
   * Call AFTER all GSAP ScrollTriggers are registered.
   */
  initScrollTriggers() {
    if (typeof ScrollTrigger === 'undefined') return;

    for (const [key, { layer, opts }] of this.layers.entries()) {
      if (!opts.trigger) continue;
      ScrollTrigger.create({
        trigger: opts.trigger,
        start: opts.start || 'top bottom',
        end: opts.end || 'bottom top',
        scrub: opts.scrub ?? 0.3,
        onUpdate: (self) => {
          const p = self.progress;
          const adapter = typeof opts.adapter === 'function' ? opts.adapter() : opts.adapter;
          const params = adapter?.params || {};
          layer.update(p, params);
        },
      });
    }

    // Register bridge scroll triggers
    for (const b of this.bridges) {
      if (!b.trigger) continue;
      ScrollTrigger.create({
        trigger: b.trigger,
        start: b.start || 'top 80%',
        end: b.end || 'top 20%',
        scrub: 0.2,
        onUpdate: (self) => {
          const outAdapter = typeof b.outAdapter === 'function' ? b.outAdapter() : b.outAdapter;
          const inAdapter = typeof b.inAdapter === 'function' ? b.inAdapter() : b.inAdapter;
          b.bridge.update(self.progress, outAdapter, inAdapter);
        },
      });
    }
  }

  dispose() {
    for (const [_, { layer }] of this.layers.entries()) {
      layer.dispose?.();
    }
    for (const b of this.bridges) {
      b.bridge.dispose?.();
    }
    this.layers.clear();
    this.bridges = [];
  }
}

// ═══════════════════════════════════════════════════════════════
//  7. SECTION TRANSITION RIPPLE
//     CSS-only radial ripple that fires at section boundaries.
//     Expands from the section divider position, colored by the
//     incoming section's theme, then fades.
// ═══════════════════════════════════════════════════════════════

export class TransitionRipple {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'overlay-transition-ripple';
    this.el.setAttribute('aria-hidden', 'true');
    Object.assign(this.el.style, {
      position: 'fixed',
      left: '50%', top: '50%',
      width: '0', height: '0',
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: '42',
      opacity: '0',
      transform: 'translate(-50%, -50%)',
      willChange: 'width, height, opacity',
    });
    document.body.appendChild(this.el);
    this._animating = false;
  }

  /**
   * Fire a ripple expanding from a given Y position
   * @param {number} hue - theme color
   * @param {number} yPercent - vertical position (0-100%)
   */
  fire(hue, yPercent = 50) {
    if (this._animating || typeof gsap === 'undefined') return;
    this._animating = true;

    const maxDim = Math.max(window.innerWidth, window.innerHeight) * 2.5;
    this.el.style.top = `${yPercent}%`;
    this.el.style.background = `radial-gradient(circle,
      hsla(${hue}, 70%, 55%, 0.12) 0%,
      hsla(${hue}, 60%, 45%, 0.06) 40%,
      transparent 70%)`;

    gsap.fromTo(this.el, {
      width: 0, height: 0, opacity: 0.8,
    }, {
      width: maxDim, height: maxDim, opacity: 0,
      duration: 1.2, ease: 'power2.out',
      onComplete: () => { this._animating = false; },
    });
  }

  dispose() {
    this.el?.remove();
  }
}

// ═══════════════════════════════════════════════════════════════
//  8. MULTI-INSTANCE OVERLAY
//     Creates the illusion of multiple visualizer copies stacked
//     at different scales, opacities, and blend modes — all from
//     ONE canvas, with CSS transforms only. No GPU duplication.
//     The copies are ghosted echoes that lag behind the main canvas.
// ═══════════════════════════════════════════════════════════════

export class MultiInstanceOverlay {
  /**
   * @param {string} sourceCanvasId - the real canvas
   * @param {string} containerId - parent element
   * @param {object} opts - { echoes: number, spacing, blendMode }
   */
  constructor(sourceCanvasId, containerId, opts = {}) {
    this.sourceCanvas = document.getElementById(sourceCanvasId);
    this.container = document.getElementById(containerId);
    if (!this.sourceCanvas || !this.container) return;

    this.echoCount = opts.echoes ?? 3;
    this.spacing = opts.spacing ?? 0.06; // scale step per echo
    this.blendMode = opts.blendMode || 'screen';
    this.echoes = [];

    for (let i = 0; i < this.echoCount; i++) {
      const echo = document.createElement('div');
      echo.className = 'overlay-multi-echo';
      echo.setAttribute('aria-hidden', 'true');

      const echoCanvas = document.createElement('canvas');
      echoCanvas.style.cssText = 'width:100%;height:100%;display:block;';

      const scaleFactor = 1 + (i + 1) * this.spacing;
      const opacity = 0.08 - i * 0.02;

      Object.assign(echo.style, {
        position: 'absolute', inset: '0',
        pointerEvents: 'none',
        transform: `scale(${scaleFactor})`,
        opacity: String(Math.max(0.01, opacity)),
        mixBlendMode: this.blendMode,
        zIndex: String(2 - i),
        willChange: 'transform, opacity',
        transition: 'transform 0.4s ease-out, opacity 0.4s ease-out',
        // Subtle blur for depth-of-field effect
        filter: `blur(${(i + 1) * 1.5}px)`,
      });

      echo.appendChild(echoCanvas);
      this.container.appendChild(echo);
      this.echoes.push({ el: echo, canvas: echoCanvas, ctx: echoCanvas.getContext('2d', { alpha: true }) });
    }

    this._frameCount = 0;
    this._copyLoop();
  }

  _copyLoop() {
    this._frameCount++;
    // Echoes are intentionally laggy — copy every 5th frame for ghost effect
    if (this._frameCount % 5 === 0 && this.sourceCanvas && this.sourceCanvas.width > 0) {
      // Stagger: each echo copies at different intervals for temporal spread
      const idx = Math.floor(this._frameCount / 5) % this.echoCount;
      const echo = this.echoes[idx];
      if (echo && echo.ctx) {
        if (echo.canvas.width !== this.sourceCanvas.width) {
          echo.canvas.width = this.sourceCanvas.width;
          echo.canvas.height = this.sourceCanvas.height;
        }
        try {
          echo.ctx.drawImage(this.sourceCanvas, 0, 0);
        } catch (_) { /* silently skip */ }
      }
    }
    this._rafId = requestAnimationFrame(() => this._copyLoop());
  }

  /**
   * Update echo transforms based on scroll/params
   */
  update(scrollProgress, params = {}) {
    if (!this.echoes.length) return;
    const chaos = clamp01(params.chaos ?? 0);
    const intensity = clamp01(params.intensity ?? 0.5);
    const time = performance.now() * 0.001;

    this.echoes.forEach((echo, i) => {
      const drift = Math.sin(time * 0.5 + i * 1.2) * chaos * 3;
      const baseScale = 1 + (i + 1) * this.spacing;
      const chaosScale = baseScale + chaos * 0.04 * (i + 1);
      const rotZ = Math.sin(time * 0.3 + i * 0.8) * chaos * 2;
      const opacity = (0.08 - i * 0.02) * (0.5 + intensity * 0.5);

      echo.el.style.transform = `scale(${chaosScale}) rotate(${rotZ}deg) translate(${drift}px, ${drift * 0.5}px)`;
      echo.el.style.opacity = String(Math.max(0.01, opacity));
    });
  }

  dispose() {
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this.echoes.forEach(e => e.el.remove());
    this.echoes = [];
  }
}

// ═══════════════════════════════════════════════════════════════
//  INIT: Setup all overlay effects for the landing page
// ═══════════════════════════════════════════════════════════════

/**
 * Initialize all overlay choreography effects.
 * @param {ContextPool} pool - GPU context pool
 * @returns {AccentChoreographer} orchestrator instance
 */
export function initOverlayChoreography(pool) {
  const choreo = new AccentChoreographer();
  const ripple = new TransitionRipple();

  // ─── Hero: Gradient wash + edge glow ──────────────────────
  const heroWash = new GradientWashLayer('heroContent', {
    mode: 'radial', blendMode: 'screen', baseOpacity: 0.08, zIndex: '1',
  });
  const heroGlow = new EdgeGlowRing('heroContent', {
    baseSize: 4, pulseScale: 3, hue: 210,
  });
  choreo.register('heroWash', heroWash, {
    trigger: '.hero', start: 'top top', end: 'bottom top',
    adapter: () => pool.get('hero'),
  });
  choreo.register('heroGlow', heroGlow, {
    trigger: '.hero', start: 'top top', end: 'bottom top',
    adapter: () => pool.get('hero'),
  });

  // ─── Morph: Conic gradient wash on the morph card ─────────
  const morphWash = new GradientWashLayer('morphCard', {
    mode: 'conic', blendMode: 'overlay', baseOpacity: 0.15, zIndex: '2',
  });
  choreo.register('morphWash', morphWash, {
    trigger: '#morphSection', start: 'top top', end: 'bottom bottom',
    adapter: () => pool.get('morph'),
  });

  // ─── Morph: Multi-instance echo on the morph canvas ───────
  const morphEchoes = new MultiInstanceOverlay('morph-canvas', 'morphPinned', {
    echoes: 2, spacing: 0.05, blendMode: 'screen',
  });
  choreo.register('morphEchoes', morphEchoes, {
    trigger: '#morphSection', start: 'top top', end: 'bottom bottom',
    adapter: () => pool.get('morph'),
  });

  // ─── Triptych: Particles in the center column ─────────────
  const triParticles = new ParticleField('triptychCenter', {
    count: 15, hue: 280, spread: 150, lifespan: 5000, zIndex: '8',
  });
  choreo.register('triParticles', triParticles, {
    trigger: '#triptychSection', start: 'top bottom', end: 'bottom top',
    adapter: () => pool.get('triCenter'),
  });

  // ─── Energy: Sweep gradient on background ─────────────────
  const energyWash = new GradientWashLayer('energyBgWrap', {
    mode: 'sweep', blendMode: 'screen', baseOpacity: 0.1, zIndex: '3',
  });
  choreo.register('energyWash', energyWash, {
    trigger: '#energySection', start: 'top top', end: 'bottom bottom',
    adapter: () => pool.get('energyBg'),
  });

  // ─── Energy card: Edge glow ring ──────────────────────────
  const energyCardGlow = new EdgeGlowRing('energyCard', {
    baseSize: 6, pulseScale: 4, hue: 180,
  });
  choreo.register('energyCardGlow', energyCardGlow, {
    trigger: '#energySection', start: 'top top', end: 'bottom bottom',
    adapter: () => pool.get('energyCard'),
  });

  // ─── CTA: Multi-instance echoes on left canvas ────────────
  const ctaEchoes = new MultiInstanceOverlay('cta-canvas-left', 'ctaGpuLeft', {
    echoes: 2, spacing: 0.04, blendMode: 'screen',
  });
  choreo.register('ctaEchoes', ctaEchoes, {
    trigger: '#ctaSection', start: 'top bottom', end: 'bottom bottom',
    adapter: () => pool.get('ctaL'),
  });

  // ─── CTA: Gradient wash on right canvas ───────────────────
  const ctaWash = new GradientWashLayer('ctaGpuRight', {
    mode: 'radial', blendMode: 'overlay', baseOpacity: 0.1, zIndex: '4',
  });
  choreo.register('ctaWash', ctaWash, {
    trigger: '#ctaSection', start: 'top bottom', end: 'bottom bottom',
    adapter: () => pool.get('ctaR'),
  });

  // ─── Agent: Particles floating across the section ─────────
  const agentParticles = new ParticleField('agentSection', {
    count: 12, hue: 240, spread: 120, lifespan: 6000, zIndex: '3',
  });
  choreo.register('agentParticles', agentParticles, {
    trigger: '#agentSection', start: 'top bottom', end: 'bottom top',
    adapter: () => pool.get('agent'),
  });

  // ─── CROSSFADE BRIDGES between sections ───────────────────
  // Hero → Morph bridge
  const heroMorphBridge = new CrossfadeBridge({ outHue: 210, inHue: 270 });
  choreo.registerBridge(heroMorphBridge, {
    trigger: '#divider-hero-morph',
    start: 'top 90%', end: 'bottom 10%',
    outAdapter: () => pool.get('hero'),
    inAdapter: () => pool.get('morph'),
  });

  // Morph → Playground bridge
  const morphPlayBridge = new CrossfadeBridge({ outHue: 280, inHue: 200 });
  choreo.registerBridge(morphPlayBridge, {
    trigger: '#divider-morph-playground',
    start: 'top 90%', end: 'bottom 10%',
    outAdapter: () => pool.get('morph'),
    inAdapter: () => pool.get('playground'),
  });

  // Cascade → Energy bridge
  const casEnergyBridge = new CrossfadeBridge({ outHue: 320, inHue: 270 });
  choreo.registerBridge(casEnergyBridge, {
    trigger: '#divider-cascade-energy',
    start: 'top 90%', end: 'bottom 10%',
    outAdapter: () => pool.get('casGpuL'),
    inAdapter: () => pool.get('energyBg'),
  });

  // ─── TRANSITION RIPPLES at section boundaries ─────────────
  if (typeof ScrollTrigger !== 'undefined') {
    const ripplePoints = [
      { trigger: '#divider-hero-morph', hue: 220 },
      { trigger: '#divider-morph-playground', hue: 280 },
      { trigger: '#divider-playground-triptych', hue: 190 },
      { trigger: '#divider-cascade-energy', hue: 310 },
    ];

    ripplePoints.forEach(({ trigger, hue }) => {
      const el = document.querySelector(trigger);
      if (!el) return;
      ScrollTrigger.create({
        trigger: el, start: 'top 60%', once: false,
        onEnter: () => {
          const rect = el.getBoundingClientRect();
          const yPct = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
          ripple.fire(hue, yPct);
        },
      });
    });
  }

  // ─── Initialize all scroll triggers ───────────────────────
  choreo.initScrollTriggers();

  // ─── Quaternion-to-CSS bridge ─────────────────────────────
  // Feeds the active visualizer's 4D rotation state to CSS custom
  // properties so CSS-only effects can react to the 4D rotation.
  // Throttled to ~20fps to avoid layout thrashing.
  const root = document.documentElement;
  const adapterKeys = ['hero', 'morph', 'triCenter', 'energyCard', 'agent', 'ctaL', 'playground'];
  let lastQFrame = 0;

  function quaternionCSSBridge() {
    const now = performance.now();
    if (now - lastQFrame < 50) { requestAnimationFrame(quaternionCSSBridge); return; }
    lastQFrame = now;

    // Find the first visible adapter with params
    for (const key of adapterKeys) {
      const adapter = pool.get(key);
      if (!adapter?.params) continue;
      const p = adapter.params;
      root.style.setProperty('--q-xw', (p.rot4dXW ?? 0).toFixed(3));
      root.style.setProperty('--q-yw', (p.rot4dYW ?? 0).toFixed(3));
      root.style.setProperty('--q-zw', (p.rot4dZW ?? 0).toFixed(3));
      root.style.setProperty('--q-intensity', clamp01(p.intensity ?? 0.5).toFixed(3));
      root.style.setProperty('--overlay-hue', Math.round(p.hue ?? 200));
      root.style.setProperty('--overlay-intensity', clamp01(p.intensity ?? 0.5).toFixed(3));
      break;
    }
    requestAnimationFrame(quaternionCSSBridge);
  }
  requestAnimationFrame(quaternionCSSBridge);

  return choreo;
}
