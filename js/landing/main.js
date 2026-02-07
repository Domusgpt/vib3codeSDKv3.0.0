/**
 * VIB3+ Landing Page — Boot Script
 *
 * Demonstrates modular SDK usage:
 *   1. ContextPool manages GPU context budget (max 2 simultaneous)
 *   2. Adapters wrap each visualization system with a uniform interface
 *   3. Canvas2DRenderer provides zero-GPU-cost procedural visuals
 *   4. Choreography drives shader parameters from scroll position
 *   5. Playground provides interactive parameter sliders
 *   6. Hover coordination shows multi-instance visual communication
 *
 * GPU Context Budget:
 *   Hero ............ 1 (Quantum)
 *   Trinity ......... 1 (swaps Q → H → F on scroll)
 *   Convergence ..... 0 (Canvas2D)
 *   Energy card ..... 1 (Faceted, lazy)
 *   Cascade ......... 0 (Canvas2D)
 *   Agent ........... 0 (Canvas2D)
 *   Playground ...... 0 (Canvas2D)
 *   CTA ............. 0 (Canvas2D)
 *   MAX CONCURRENT .. 1-2 (safe for mobile)
 */

import { ContextPool } from './ContextPool.js';
import { QuantumAdapter, Canvas2DRenderer } from './adapters.js';
import {
  heroParams, convergenceParams, energyBgParams,
  agentBgParams, playgroundDefaults, ctaParams,
} from './config.js';
import {
  initScrollProgress, initHero, initTrinity,
  initConvergence, initEnergy, initCascade, initCTA,
  initConvergenceHover,
} from './choreography.js';

// ─── State ────────────────────────────────────────────────────

const pool = new ContextPool(2);
const c2d = new Map();
let lastScrollSection = null;

// ─── GPU System: Hero ─────────────────────────────────────────

function createHero() {
  return pool.acquire('hero', 'hero-canvas', QuantumAdapter, heroParams);
}

// ─── Canvas 2D Instances (no GPU contexts) ────────────────────

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
  c2d.set('playground', new Canvas2DRenderer('playground-canvas', playgroundDefaults));
  c2d.set('cta', new Canvas2DRenderer('cta-canvas', ctaParams));
}

// ─── Parameters Playground ────────────────────────────────────

function initPlayground() {
  const pg = c2d.get('playground');
  if (!pg) return;

  const sliderParams = [
    'hue', 'gridDensity', 'speed', 'chaos',
    'morphFactor', 'intensity', 'dimension',
    'rot4dXW', 'rot4dYW', 'rot4dZW',
  ];

  // Wire range sliders
  sliderParams.forEach(param => {
    const input = document.getElementById(`ctrl-${param}`);
    const valEl = document.getElementById(`val-${param}`);
    if (!input || !valEl) return;

    input.addEventListener('input', () => {
      const v = parseFloat(input.value);
      valEl.textContent = Number.isInteger(v) ? v : v.toFixed(2);
      pg.setParam(param, v);
    });
  });

  // Wire geometry select
  const geoSelect = document.getElementById('ctrl-geometry');
  const geoVal = document.getElementById('val-geometry');
  if (geoSelect && geoVal) {
    geoSelect.addEventListener('change', () => {
      const v = parseInt(geoSelect.value);
      geoVal.textContent = v;
      pg.setParam('geometry', v);
    });
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
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }
});
