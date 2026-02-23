/**
 * AccentSystem — The CSS Projection of LayerRelationshipGraph
 *
 * Maps VIB3+ visualization parameters to CSS custom properties using the same
 * mathematical relationships the SDK uses internally:
 *
 *   complement  → Glass panels (opacity inverts with viz intensity)
 *   harmonic    → Text color & shimmer (golden angle hue offset)
 *   reactive    → Border glow (tracks 4D rotation velocity)
 *   echo        → Shadows (attenuated follower of dimension)
 *   chase       → Animation timing (transitions lag behind viz)
 *
 * Color theory derivations match HolographicVisualizer's per-layer offsets:
 *   complement:  hue + 180°
 *   analogous:   hue + 60° (warm), hue + 300° (cool)
 *   split:       hue + 150° (warm), hue + 210° (cool)
 *   harmonic:    hue + 137.508° (golden angle)
 *
 * @module AccentSystem
 */

// ─── EMA Tau Constants (Gold Standard v3) ────────────────────
// Frame-rate-independent smoothing: alpha = 1 - exp(-dt / tau)
const TAU = {
  speed:       0.08,
  chaos:       0.10,
  gridDensity: 0.10,
  morphFactor: 0.12,
  intensity:   0.12,
  saturation:  0.15,
  dimension:   0.20,
  hue:         0.25,
  rot4dXW:     0.10,
  rot4dYW:     0.10,
  rot4dZW:     0.10,
};

// ─── Default parameter fallbacks ─────────────────────────────
const DEFAULTS = {
  hue: 200, saturation: 0.7, intensity: 0.7, chaos: 0.2,
  speed: 1.0, dimension: 3.5, morphFactor: 0.5, gridDensity: 24,
  rot4dXW: 0, rot4dYW: 0, rot4dZW: 0,
};

/**
 * Reads VIB3+ visualization parameters and sets ~25 CSS custom properties
 * on the document root, organized into 5 relationship layers:
 *   1. Chromatic (color theory derivations)
 *   2. Glass (complement — adaptive opacity/blur)
 *   3. Energy (reactive — border glow from 4D rotation)
 *   4. Depth (echo — shadows from dimension)
 *   5. Rhythm (chase — animation timing from speed)
 */
export class AccentSystem {
  /**
   * @param {object} [options]
   * @param {Element} [options.root]  Element to set CSS vars on (default: documentElement)
   * @param {object}  [options.taus]  Override EMA tau values per parameter
   */
  constructor(options = {}) {
    this._root = options.root || null;
    this._taus = { ...TAU, ...options.taus };
    this._smoothed = { ...DEFAULTS };
    this._prevTime = 0;
    this._initialized = false;
  }

  /**
   * Read an adapter's current params and update all CSS custom properties.
   * Call this once per frame from your render loop.
   *
   * @param {object|null} adapter  Object with `.params` (e.g. VIB3+ adapter)
   * @param {number}      ts       Timestamp in ms (from requestAnimationFrame)
   */
  update(adapter, ts) {
    // Resolve root lazily (supports SSR / non-DOM contexts)
    if (!this._root && typeof document !== 'undefined') {
      this._root = document.documentElement;
    }
    if (!this._root) return;

    const dt = this._initialized ? (ts - this._prevTime) / 1000 : 0;
    this._prevTime = ts;
    this._initialized = true;

    // Guard: hold last smoothed values when no adapter (prevents jarring)
    const params = adapter?.params || this._smoothed;

    // ─── EMA Smooth ──────────────────────────────────────────
    for (const key of Object.keys(this._taus)) {
      const target = params[key] ?? this._smoothed[key] ?? DEFAULTS[key] ?? 0;
      if (dt > 0) {
        const alpha = 1 - Math.exp(-dt / this._taus[key]);
        this._smoothed[key] = this._smoothed[key] + (target - this._smoothed[key]) * alpha;
      } else {
        this._smoothed[key] = target;
      }
    }

    const s = this._smoothed;

    // ═══════════════════════════════════════════════════════════
    // LAYER 1: Chromatic — color theory derivations from hue
    // ═══════════════════════════════════════════════════════════
    const hue         = s.hue;
    const complement  = (hue + 180) % 360;
    const splitWarm   = (hue + 150) % 360;
    const splitCool   = (hue + 210) % 360;
    const analogousA  = (hue + 60) % 360;    // matches Holographic highlight offset
    const analogousB  = (hue + 300) % 360;   // matches Holographic accent offset
    const harmonic    = (hue + 137.508) % 360; // golden angle
    const sat         = Math.max(0, Math.min(1, s.saturation));

    // ═══════════════════════════════════════════════════════════
    // LAYER 2: Glass — complement relationship
    //   Bright viz → darker glass (for readability)
    //   Chaotic viz → softer blur (visual softness)
    // ═══════════════════════════════════════════════════════════
    const intensity  = Math.max(0, Math.min(1, s.intensity));
    const chaos      = Math.max(0, Math.min(1, s.chaos));
    const glassDepth = 0.35 + intensity * 0.35;
    const glassBlur  = 12 + chaos * 20;

    // ═══════════════════════════════════════════════════════════
    // LAYER 3: Energy — reactive relationship
    //   4D rotation velocity → border glow intensity
    //   Viz speed → pulse animation rate
    // ═══════════════════════════════════════════════════════════
    const rot4dMag = Math.abs(s.rot4dXW) + Math.abs(s.rot4dYW) + Math.abs(s.rot4dZW);
    const energyIntensity = 0.05 + Math.min(rot4dMag / 6, 1) * 0.15;
    const speed = Math.max(0.1, Math.min(3, s.speed));
    const energyPulse = 0.8 + (1 - speed / 3) * 2.4;

    // ═══════════════════════════════════════════════════════════
    // LAYER 4: Depth — echo relationship
    //   Close 4D projection → deep shadows (attenuated follower)
    //   Morphing geometry → rounder corners
    // ═══════════════════════════════════════════════════════════
    const dimension   = Math.max(3, Math.min(4.5, s.dimension));
    const morphFactor = Math.max(0, Math.min(2, s.morphFactor));
    const depthShadow = 8 + (4.5 - dimension) * 16;
    const depthAlpha  = 0.2 + (4.5 - dimension) / 6;
    const depthRadius = 12 + morphFactor * 8;
    const depthLift   = morphFactor * 2;

    // ═══════════════════════════════════════════════════════════
    // LAYER 5: Rhythm — chase relationship
    //   Fast viz → snappy transitions
    //   Slow viz → languid timing
    // ═══════════════════════════════════════════════════════════
    const rhythmDuration = 0.4 + (1 - speed / 3) * 0.8;

    // ─── Set CSS Custom Properties ───────────────────────────
    const root = this._root.style;

    // Chromatic
    root.setProperty('--accent-hue',          hue.toFixed(1));
    root.setProperty('--accent-complement',   complement.toFixed(1));
    root.setProperty('--accent-split-warm',   splitWarm.toFixed(1));
    root.setProperty('--accent-split-cool',   splitCool.toFixed(1));
    root.setProperty('--accent-analogous-a',  analogousA.toFixed(1));
    root.setProperty('--accent-analogous-b',  analogousB.toFixed(1));
    root.setProperty('--accent-harmonic',     harmonic.toFixed(1));
    root.setProperty('--accent-saturation',   sat.toFixed(3));

    // Glass
    root.setProperty('--glass-depth',  glassDepth.toFixed(3));
    root.setProperty('--glass-blur',   glassBlur.toFixed(1) + 'px');
    root.setProperty('--glass-tint',   complement.toFixed(1));

    // Energy
    root.setProperty('--energy-intensity', energyIntensity.toFixed(3));
    root.setProperty('--energy-hue',       complement.toFixed(1));
    root.setProperty('--energy-pulse',     energyPulse.toFixed(2) + 's');

    // Depth
    root.setProperty('--depth-shadow',       depthShadow.toFixed(1) + 'px');
    root.setProperty('--depth-shadow-alpha', depthAlpha.toFixed(3));
    root.setProperty('--depth-radius',       depthRadius.toFixed(1) + 'px');
    root.setProperty('--depth-lift',         depthLift.toFixed(1) + 'px');

    // Rhythm
    root.setProperty('--rhythm-duration', rhythmDuration.toFixed(2) + 's');
    root.setProperty('--rhythm-ease',     'cubic-bezier(0.23, 1, 0.32, 1)');
  }

  /**
   * Get the current smoothed parameter values (read-only snapshot).
   * Useful for programmatic access outside CSS.
   * @returns {object}
   */
  getSmoothed() {
    return { ...this._smoothed };
  }

  /**
   * Get the complete set of derived CSS values (without setting them).
   * Useful for server-side rendering or testing.
   * @param {object} params  Raw VIB3+ parameters
   * @returns {object}  Map of CSS property name → value string
   */
  static derive(params) {
    const p = { ...DEFAULTS, ...params };
    const hue        = p.hue;
    const complement = (hue + 180) % 360;
    const sat        = Math.max(0, Math.min(1, p.saturation));
    const intensity  = Math.max(0, Math.min(1, p.intensity));
    const chaos      = Math.max(0, Math.min(1, p.chaos));
    const speed      = Math.max(0.1, Math.min(3, p.speed));
    const dimension  = Math.max(3, Math.min(4.5, p.dimension));
    const morph      = Math.max(0, Math.min(2, p.morphFactor));
    const rot4dMag   = Math.abs(p.rot4dXW || 0) + Math.abs(p.rot4dYW || 0) + Math.abs(p.rot4dZW || 0);

    return {
      '--accent-hue':          hue.toFixed(1),
      '--accent-complement':   complement.toFixed(1),
      '--accent-split-warm':   ((hue + 150) % 360).toFixed(1),
      '--accent-split-cool':   ((hue + 210) % 360).toFixed(1),
      '--accent-analogous-a':  ((hue + 60) % 360).toFixed(1),
      '--accent-analogous-b':  ((hue + 300) % 360).toFixed(1),
      '--accent-harmonic':     ((hue + 137.508) % 360).toFixed(1),
      '--accent-saturation':   sat.toFixed(3),
      '--glass-depth':         (0.35 + intensity * 0.35).toFixed(3),
      '--glass-blur':          (12 + chaos * 20).toFixed(1) + 'px',
      '--glass-tint':          complement.toFixed(1),
      '--energy-intensity':    (0.05 + Math.min(rot4dMag / 6, 1) * 0.15).toFixed(3),
      '--energy-hue':          complement.toFixed(1),
      '--energy-pulse':        (0.8 + (1 - speed / 3) * 2.4).toFixed(2) + 's',
      '--depth-shadow':        (8 + (4.5 - dimension) * 16).toFixed(1) + 'px',
      '--depth-shadow-alpha':  (0.2 + (4.5 - dimension) / 6).toFixed(3),
      '--depth-radius':        (12 + morph * 8).toFixed(1) + 'px',
      '--depth-lift':          (morph * 2).toFixed(1) + 'px',
      '--rhythm-duration':     (0.4 + (1 - speed / 3) * 0.8).toFixed(2) + 's',
      '--rhythm-ease':         'cubic-bezier(0.23, 1, 0.32, 1)',
    };
  }
}
