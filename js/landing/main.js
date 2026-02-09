/**
 * VIB3+ Landing Page — Boot Script v3
 *
 * Section order:
 *   Opening (800vh) → Hero → Morph (1200vh) → Playground → Triptych →
 *   Cascade → Energy → Agent → CTA
 *
 * Systems:
 *   1. ContextPool manages GPU context budget (max 3 concurrent)
 *   2. Adapters wrap each visualization system with a uniform interface
 *   3. Choreography drives shader parameters from scroll position
 *   4. CardTiltSystem maps mouse/touch → CSS 3D transforms + visualizer params
 *   5. Opening cinematic: VIB3CODE text mask over GPU canvas, lattice parallax
 *   6. Morph section: 6 stages with system swaps, parameter coordination
 *   7. Section dividers: SVG shapes hide canvas edge lines
 *   8. Blur cascade reveals + scroll-driven color theming (VISUAL-CODEX patterns)
 *
 * GPU Context Budget:
 *   Opening ......... 1 (Quantum, released when hero enters)
 *   Hero ............ 1 (Quantum, released when morph enters)
 *   Morph ........... 1 (swaps Q → H → F on scroll)
 *   Playground ...... 1 (Q/H/F, lazy — scroll-triggered)
 *   Triptych L ...... 1 (Quantum GPU, scroll-triggered)
 *   Triptych C ...... 1 (Holographic GPU, behind text)
 *   Triptych R ...... 1 (Faceted GPU, scroll-triggered)
 *   Energy card ..... 1 (Faceted, lazy)
 *   Cascade ......... 0 (AmbientLattice accent — no GPU)
 *   Agent ........... 0 (AmbientLattice accent — no GPU)
 *   CTA ............. 0 (AmbientLattice accent — no GPU)
 *   MAX CONCURRENT .. 3 (pool auto-evicts oldest on overflow)
 */

import { ContextPool } from './ContextPool.js';
import { QuantumAdapter, HolographicAdapter, FacetedAdapter, AmbientLattice } from './adapters.js';
import { CardTiltSystem } from './CardTiltSystem.js';
import {
  heroParams, energyBgParams,
  agentBgParams, playgroundDefaults, ctaParams,
  parallaxParams, openingParams,
} from './config.js';
import {
  initScrollProgress, initOpening, initHero, initMorph,
  initTriptych, initCascade, initEnergy, initCTA,
  initSectionReveals, initScrollColorTheme, initBlurReveals,
  initSectionVeils, initScrollVelocityBurst, initPhaseShiftBridges,
  initSpeedCrescendo,
} from './choreography.js';

// ─── State ────────────────────────────────────────────────────

const pool = new ContextPool(3);
const c2d = new Map();
let tiltSystem = null;

// ─── Playground GPU State ─────────────────────────────────────

const pgFactories = [QuantumAdapter, HolographicAdapter, FacetedAdapter];
const pgNames = ['Quantum', 'Holographic', 'Faceted'];
let pgSystemIdx = 0;

function getPlayground() {
  return pool.get('playground');
}

function acquirePlayground() {
  const adapter = pool.acquire(
    'playground', 'playground-canvas',
    pgFactories[pgSystemIdx], playgroundDefaults
  );
  const errEl = document.getElementById('pgError');
  if (!adapter) {
    console.error(`[Playground] Failed to acquire ${pgNames[pgSystemIdx]} GPU context`);
    if (errEl) errEl.style.display = 'flex';
  } else {
    if (errEl) errEl.style.display = 'none';
    // Always sync slider values — covers scroll-triggered re-acquire
    adapter.setParams(readSliderValues());
  }
  return adapter;
}

function releasePlayground() {
  pool.release('playground');
}

function switchPlaygroundSystem(idx) {
  if (idx === pgSystemIdx && pool.has('playground')) return;
  pgSystemIdx = idx;
  releasePlayground();
  const adapter = acquirePlayground();
  if (adapter) {
    adapter.setParams(readSliderValues());
  }
}

function readSliderValues() {
  const params = {};
  const sliderParams = [
    'hue', 'gridDensity', 'speed', 'chaos',
    'morphFactor', 'intensity', 'dimension', 'saturation',
    'rot4dXW', 'rot4dYW', 'rot4dZW',
    'rot4dXY', 'rot4dXZ', 'rot4dYZ',
  ];
  sliderParams.forEach(param => {
    const input = document.getElementById(`ctrl-${param}`);
    if (input) params[param] = parseFloat(input.value);
  });
  const geoSelect = document.getElementById('ctrl-geometry');
  if (geoSelect) params.geometry = parseInt(geoSelect.value);
  return params;
}

// ─── GPU System: Hero ─────────────────────────────────────────

function createHero() {
  return pool.acquire('hero', 'hero-canvas', QuantumAdapter, heroParams);
}

// ─── Ambient Lattice Instances (Canvas 2D accent — no GPU) ──────
// Lightweight atmospheric backgrounds — NOT system impersonation.
// Triptych columns now use real GPU adapters (Quantum + Faceted).

function initAmbientCanvases() {
  // Cascade cards — ambient accent behind card content
  document.querySelectorAll('.cascade-card').forEach((card, i) => {
    c2d.set(`cas${i}`, new AmbientLattice(`cas-${i}`, {
      geometry: parseInt(card.dataset.geo),
      hue: parseInt(card.dataset.hue),
      gridDensity: 22, speed: 0.7, intensity: 0.85, chaos: 0.18,
      morphFactor: 0.8, dimension: 3.4, saturation: 0.9,
    }));
  });

  // Section backgrounds — subtle atmospheric accents
  c2d.set('energyBg', new AmbientLattice('energy-bg-canvas', energyBgParams));
  c2d.set('agent', new AmbientLattice('agent-canvas', agentBgParams));
  c2d.set('cta', new AmbientLattice('cta-canvas', ctaParams));
}

// ─── Card Tilt System ──────────────────────────────────────────
// Registers cascade cards and energy card for mouse-driven 3D tilt
// with visualizer parameter mapping (rotation, speed, chaos, density)

function initTiltSystem() {
  tiltSystem = new CardTiltSystem({
    maxTilt: 18,
    perspective: 1200,
    smoothing: 0.1,
    returnSpeed: 0.06,
  });

  // Register cascade cards with their AmbientLattice adapters
  document.querySelectorAll('.cascade-card').forEach((card, i) => {
    const adapter = c2d.get(`cas${i}`);
    tiltSystem.register(card, adapter, {
      maxTilt: 15,
      sensitivity: 1.2,
      affectsRotation: true,
      affectsSpeed: true,
      affectsChaos: true,
      affectsDensity: true,
      affectsHue: false,
      rotationScale: 1.0,
      speedScale: 0.3,
      chaosScale: 0.2,
      densityScale: 0.2,
    });
  });

  // Register energy card (adapter set when GPU context is acquired)
  const energyCard = document.getElementById('energyCard');
  if (energyCard) {
    tiltSystem.register(energyCard, null, {
      maxTilt: 12,
      sensitivity: 0.8,
      affectsRotation: true,
      affectsSpeed: false,
      affectsChaos: true,
      affectsDensity: false,
      rotationScale: 0.8,
      chaosScale: 0.15,
    });
  }

  // Register agent cards (CSS-only tilt, no adapter)
  document.querySelectorAll('.agent-card').forEach(card => {
    tiltSystem.register(card, null, {
      maxTilt: 8,
      sensitivity: 0.6,
    });
  });
}

// ─── Parameters Playground (GPU-backed, full 6D) ─────────────

function initPlayground() {
  const sliderParams = [
    'hue', 'gridDensity', 'speed', 'chaos',
    'morphFactor', 'intensity', 'dimension', 'saturation',
    'rot4dXW', 'rot4dYW', 'rot4dZW',
    'rot4dXY', 'rot4dXZ', 'rot4dYZ',
  ];

  // Wire range sliders → live GPU adapter
  sliderParams.forEach(param => {
    const input = document.getElementById(`ctrl-${param}`);
    const valEl = document.getElementById(`val-${param}`);
    if (!input || !valEl) return;

    input.addEventListener('input', () => {
      const v = parseFloat(input.value);
      valEl.textContent = Number.isInteger(v) ? v : v.toFixed(2);
      const pg = getPlayground();
      if (pg) pg.setParam(param, v);
    });
  });

  // Wire geometry select
  const geoSelect = document.getElementById('ctrl-geometry');
  const geoVal = document.getElementById('val-geometry');
  if (geoSelect && geoVal) {
    geoSelect.addEventListener('change', () => {
      const v = parseInt(geoSelect.value);
      geoVal.textContent = v;
      const pg = getPlayground();
      if (pg) pg.setParam('geometry', v);
    });
  }

  // Wire system type buttons (Quantum / Holographic / Faceted)
  document.querySelectorAll('[data-pg-system]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.pgSystem);
      switchPlaygroundSystem(idx);
      document.querySelectorAll('[data-pg-system]').forEach(b =>
        b.classList.toggle('active', parseInt(b.dataset.pgSystem) === idx)
      );
    });
  });

  // ── Randomize + Reset ──
  const sliderRanges = {
    hue: [0, 360], gridDensity: [4, 80], speed: [0.1, 3], chaos: [0, 1],
    morphFactor: [0, 2], intensity: [0.2, 1], dimension: [3.0, 4.5],
    saturation: [0, 1],
    rot4dXW: [0, 6.28], rot4dYW: [0, 6.28], rot4dZW: [0, 6.28],
    rot4dXY: [0, 6.28], rot4dXZ: [0, 6.28], rot4dYZ: [0, 6.28],
  };
  const defaultSliders = {
    hue: 200, gridDensity: 24, speed: 1.0, chaos: 0.2,
    morphFactor: 0.5, intensity: 0.7, dimension: 3.5, saturation: 0.8,
    rot4dXW: 0, rot4dYW: 0, rot4dZW: 0, rot4dXY: 0, rot4dXZ: 0, rot4dYZ: 0,
  };

  function setAllSliders(values) {
    for (const [param, v] of Object.entries(values)) {
      const input = document.getElementById(`ctrl-${param}`);
      const valEl = document.getElementById(`val-${param}`);
      if (input) { input.value = v; }
      if (valEl) { valEl.textContent = Number.isInteger(v) ? v : v.toFixed(2); }
    }
    const pg = getPlayground();
    if (pg) pg.setParams(values);
  }

  document.getElementById('btnRandomize')?.addEventListener('click', () => {
    const randomized = {};
    for (const [param, [lo, hi]] of Object.entries(sliderRanges)) {
      randomized[param] = lo + Math.random() * (hi - lo);
      if (param === 'hue' || param === 'gridDensity') randomized[param] = Math.round(randomized[param]);
    }
    // Random geometry too
    const geo = Math.floor(Math.random() * 24);
    randomized.geometry = geo;
    const geoSelect = document.getElementById('ctrl-geometry');
    const geoVal = document.getElementById('val-geometry');
    if (geoSelect) geoSelect.value = geo;
    if (geoVal) geoVal.textContent = geo;
    setAllSliders(randomized);
  });

  document.getElementById('btnReset')?.addEventListener('click', () => {
    setAllSliders(defaultSliders);
    const geoSelect = document.getElementById('ctrl-geometry');
    const geoVal = document.getElementById('val-geometry');
    if (geoSelect) geoSelect.value = 3;
    if (geoVal) geoVal.textContent = '3';
    const pg = getPlayground();
    if (pg) pg.setParam('geometry', 3);
  });

  // Scroll-triggered GPU lifecycle
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      trigger: '#playgroundSection',
      start: 'top 80%',
      end: 'bottom top',
      onEnter: acquirePlayground,
      onLeave: releasePlayground,
      onEnterBack: acquirePlayground,
      onLeaveBack: releasePlayground,
    });
  } else {
    acquirePlayground();
  }
}

// ─── Render Loop (AmbientLattice only — GPU systems self-render) ──

function renderLoop(ts) {
  for (const inst of c2d.values()) inst.render(ts);
  requestAnimationFrame(renderLoop);
}

// ─── Boot ─────────────────────────────────────────────────────

if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
} else {
  console.warn('GSAP not loaded — scroll choreography disabled');
}

// ─── Lenis Smooth Scroll ──────────────────────────────────────

if (typeof Lenis !== 'undefined' && typeof gsap !== 'undefined') {
  const lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// Initialize everything
initAmbientCanvases();

if (typeof gsap !== 'undefined') {
  // Opening cinematic (acquires its own GPU context)
  initOpening(pool, createHero);
  initScrollProgress();
  initHero(pool);
  initMorph(pool, createHero);
  initTriptych(pool);    // Real GPU: Quantum (left) + Faceted (right)
  initCascade(c2d);
  initEnergy(pool, c2d);
  initCTA(c2d);
  initSectionReveals();
  initSectionVeils();
  initScrollColorTheme();
  initBlurReveals();
  initScrollVelocityBurst(c2d);
  initPhaseShiftBridges(pool, c2d);
  initSpeedCrescendo(c2d);
}

// Acquire opening canvas immediately (first thing user sees)
pool.acquire('opening', 'opening-canvas', QuantumAdapter, openingParams);

initPlayground();
initTiltSystem();
requestAnimationFrame(renderLoop);

// ─── Energy Card GPU Lifecycle → Tilt Adapter ─────────────────
// When the energy GPU context is acquired/released, update the tilt system adapter

if (typeof ScrollTrigger !== 'undefined') {
  ScrollTrigger.create({
    trigger: '#energySection', start: 'top 80%', end: 'bottom top',
    onEnter: () => {
      const adapter = pool.get('energyCard');
      if (tiltSystem && adapter) {
        tiltSystem.setAdapter(document.getElementById('energyCard'), adapter);
      }
    },
  });
}

// Clean up on page hide (mobile tab switching) — re-acquire on return
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    pool.releaseAll();
  } else {
    // Re-acquire opening or hero context depending on scroll position
    const openingSection = document.getElementById('openingSection');
    if (openingSection) {
      const rect = openingSection.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        pool.acquire('opening', 'opening-canvas', QuantumAdapter, openingParams);
      } else if (window.scrollY < window.innerHeight * 2) {
        createHero();
      }
    }
    // Re-acquire playground if visible
    const pgSection = document.getElementById('playgroundSection');
    if (pgSection) {
      const rect = pgSection.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        acquirePlayground();
      }
    }
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }
});
