/**
 * VIB3+ Landing Page — Boot Script
 *
 * Demonstrates modular SDK usage:
 *   1. ContextPool manages GPU context budget
 *   2. Adapters wrap each visualization system with a uniform interface
 *   3. Choreography drives shader parameters from scroll position
 *   4. Playground provides interactive parameter sliders with REAL GPU shaders
 *   5. Hover coordination shows multi-instance visual communication
 *
 * GPU Context Budget:
 *   Hero ............ 1 (Quantum)
 *   Trinity ......... 1 (swaps Q → H → F on scroll)
 *   Energy card ..... 1 (Faceted, lazy)
 *   Playground ...... 1 (Q/H/F, lazy — scroll-triggered)
 *   Convergence ..... 0 (Canvas2D ambient)
 *   Cascade ......... 0 (Canvas2D ambient)
 *   Agent ........... 0 (Canvas2D ambient)
 *   CTA ............. 0 (Canvas2D ambient)
 *   MAX CONCURRENT .. 2-3 (pool auto-evicts oldest)
 */

import { ContextPool } from './ContextPool.js';
import { QuantumAdapter, HolographicAdapter, FacetedAdapter, Canvas2DRenderer } from './adapters.js';
import {
  heroParams, convergenceParams, energyBgParams,
  agentBgParams, playgroundDefaults, ctaParams,
} from './config.js';
import {
  initScrollProgress, initHero, initTrinity,
  initConvergence, initEnergy, initCascade, initCTA,
  initConvergenceHover, initSectionReveals,
} from './choreography.js';

// ─── State ────────────────────────────────────────────────────

const pool = new ContextPool(3);
const c2d = new Map();
let lastScrollSection = null;

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
  // Re-apply current slider values to new system
  if (adapter) {
    adapter.setParams(readSliderValues());
  }
}

function readSliderValues() {
  const params = {};
  const sliderParams = [
    'hue', 'gridDensity', 'speed', 'chaos',
    'morphFactor', 'intensity', 'dimension',
    'rot4dXW', 'rot4dYW', 'rot4dZW',
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

// ─── Canvas 2D Instances (ambient backgrounds — no GPU) ───────

function initCanvas2D() {
  c2d.set('convQ', new Canvas2DRenderer('conv-canvas-q', convergenceParams.quantum));
  c2d.set('convH', new Canvas2DRenderer('conv-canvas-h', convergenceParams.holographic));
  c2d.set('convF', new Canvas2DRenderer('conv-canvas-f', convergenceParams.faceted));
  c2d.set('energyBg', new Canvas2DRenderer('energy-bg-canvas', energyBgParams));

  document.querySelectorAll('.cascade-card').forEach((card, i) => {
    c2d.set(`cas${i}`, new Canvas2DRenderer(`cas-${i}`, {
      geometry: parseInt(card.dataset.geo),
      hue: parseInt(card.dataset.hue),
      gridDensity: 18, speed: 0.6, intensity: 0.75, chaos: 0.15,
      morphFactor: 0.6, dimension: 3.5,
    }));
  });

  c2d.set('agent', new Canvas2DRenderer('agent-canvas', agentBgParams));
  c2d.set('cta', new Canvas2DRenderer('cta-canvas', ctaParams));
  // NOTE: playground uses real GPU adapter — not Canvas2D
}

// ─── Parameters Playground (GPU-backed) ──────────────────────

function initPlayground() {
  const sliderParams = [
    'hue', 'gridDensity', 'speed', 'chaos',
    'morphFactor', 'intensity', 'dimension',
    'rot4dXW', 'rot4dYW', 'rot4dZW',
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
    // No GSAP — acquire immediately
    acquirePlayground();
  }
}

// ─── Render Loop (Canvas2D only — GPU systems self-render) ────

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
// Wire Lenis to GSAP's ticker so ScrollTrigger stays in sync

if (typeof Lenis !== 'undefined' && typeof gsap !== 'undefined') {
  const lenis = new Lenis();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

createHero();
initCanvas2D();

if (typeof gsap !== 'undefined') {
  initScrollProgress();
  initHero(pool);
  initTrinity(pool, createHero);
  initConvergence(c2d);
  initConvergenceHover(c2d);
  initEnergy(pool, c2d);
  initCascade(c2d);
  initCTA(c2d);
  initSectionReveals();
}

initPlayground();
requestAnimationFrame(renderLoop);

// Clean up on page hide (mobile tab switching) — re-acquire on return
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    lastScrollSection = null;
    pool.releaseAll();
  } else {
    // Re-acquire hero context if we're at the top
    if (window.scrollY < window.innerHeight) {
      createHero();
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
