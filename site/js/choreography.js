/**
 * GSAP Scroll Choreography — v3: Depth Illusion Engine
 *
 * Architecture:
 *   Opening (800vh) → Hero → Morph (1200vh) → Playground → Triptych →
 *   Cascade → Energy → Agent → CTA
 *
 * NEW in v3:
 *   - Depth Illusion Engine: density-as-distance, faux shadows, push-pull
 *   - 6 Coordination Modes: opposition, convergence, call-response,
 *     heartbeat, energy-conservation, crossfade
 *   - Mathematical Intertwining: Lissajous rotation, sine interference,
 *     complementary hue breathing, exponential crescendo
 *   - Accent effects: glow seams, vignettes, chromatic borders, scanlines
 *   - Per-section depth plane choreography with CSS scale/blur/shadow
 */

import { QuantumAdapter, HolographicAdapter, FacetedAdapter } from './adapters.js';
import { morphStages, trinityParams, energyCardParams, openingParams, parallaxParams } from './config.js';

// ─── Morph State ─────────────────────────────────────────────
const morphFactories = [QuantumAdapter, HolographicAdapter, FacetedAdapter];
let morphCurrent = -1;
let morphSwapLock = false;
let morphLastStage = -1;

// ─── Core Math Helpers ───────────────────────────────────────
function smoothstep(p) { return p * p * (3 - 2 * p); }
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp01(v) { return Math.max(0, Math.min(1, v)); }

// ═══════════════════════════════════════════════════════════════
//  DEPTH ILLUSION ENGINE
// ═══════════════════════════════════════════════════════════════

/** Faux shadow: driven by depth factor (0=far, 1=close) */
function updateDepthShadow(el, depthFactor) {
  if (!el) return;
  el.style.setProperty('--shadow-sx', lerp(1.4, 0.7, depthFactor).toFixed(2));
  el.style.setProperty('--shadow-sy', lerp(0.3, 1.1, depthFactor).toFixed(2));
  el.style.setProperty('--shadow-blur', lerp(18, 4, depthFactor) + 'px');
  el.style.setProperty('--shadow-opacity', lerp(0.15, 0.55, depthFactor).toFixed(2));
}

/** Vignette tightens as element approaches */
function updateVignette(el, density) {
  if (!el) return;
  const d = clamp01(1 - (density - 4) / 52);
  el.style.setProperty('--vignette-strength', lerp(0.08, 0.45, d).toFixed(2));
  el.style.setProperty('--vignette-inner', lerp(55, 30, d) + '%');
}

/** Chromatic aberration border driven by rotation speed */
function updateChroma(container, adapter) {
  if (!container || !adapter?.params) return;
  const rotSpd = Math.abs(adapter.params.rot4dXW || 0) + Math.abs(adapter.params.rot4dYW || 0);
  const off = Math.min(4, rotSpd * 0.4);
  const h = adapter.params.hue || 200;
  container.style.setProperty('--chroma-offset', off + 'px');
  container.style.setProperty('--chroma-hue-a', Math.round(h - 30));
  container.style.setProperty('--chroma-hue-b', Math.round(h + 30));
}

/** Glow seam between two visualizers: chaos × chaos → seam brightness */
function updateGlowSeam(seamEl, a, b) {
  if (!seamEl) return;
  const cA = a?.params?.chaos || 0, cB = b?.params?.chaos || 0;
  const energy = (cA + cB) * 3 + cA * cB * 10;
  const intensity = Math.min(0.9, energy);
  const hue = ((a?.params?.hue || 200) + (b?.params?.hue || 200)) / 2;
  seamEl.style.setProperty('--seam-intensity', intensity.toFixed(2));
  seamEl.style.setProperty('--seam-hue', Math.round(hue));
  seamEl.style.setProperty('--seam-blur', lerp(8, 2, intensity) + 'px');
}

/** Scanlines drift with scroll */
function updateScanlines(container, p) {
  if (!container) return;
  container.querySelectorAll('.scanline').forEach((line, i) => {
    const y = ((p * 2 + i / 3) % 1) * 100;
    line.style.setProperty('--scan-y', y + '%');
    line.style.setProperty('--scan-hue', Math.round(200 + p * 160));
  });
}

/** Depth approach: density-as-distance with CSS depth illusion */
function depthApproach(progress, adapter, container, shadowEl) {
  const p = smoothstep(progress);
  adapter.setParams({
    gridDensity: lerp(55, 8, p),
    intensity: lerp(0.25, 0.9, p),
    speed: lerp(0.15, 1.2, p),
    dimension: lerp(4.2, 3.0, p),
  });
  if (container) {
    container.style.transform = `scale(${lerp(0.65, 1.25, p)})`;
    container.style.filter = `blur(${lerp(4, 0, p)}px)`;
    container.style.boxShadow = `0 ${lerp(2, 35, p)}px ${lerp(4, 70, p)}px rgba(0,0,0,${lerp(0.1, 0.5, p)})`;
  }
  if (shadowEl) updateDepthShadow(shadowEl, p);
}

/** Depth retreat: element recedes */
function depthRetreat(progress, adapter, container, shadowEl) {
  const p = smoothstep(progress);
  adapter.setParams({
    gridDensity: lerp(8, 55, p),
    intensity: lerp(0.9, 0.15, p),
    speed: lerp(1.2, 0.05, p),
    dimension: lerp(3.0, 4.5, p),
    chaos: lerp(0.35, 0.02, p),
  });
  if (container) {
    container.style.transform = `scale(${lerp(1.25, 0.45, p)})`;
    container.style.filter = `blur(${lerp(0, 8, p)}px)`;
    container.style.boxShadow = `0 ${lerp(35, 0, p)}px ${lerp(70, 0, p)}px rgba(0,0,0,${lerp(0.5, 0.05, p)})`;
  }
  if (shadowEl) updateDepthShadow(shadowEl, 1 - p);
}

// ═══════════════════════════════════════════════════════════════
//  MATHEMATICAL INTERTWINING
// ═══════════════════════════════════════════════════════════════

/** Lissajous rotation intertwining between two systems */
function lissajousRotations(t, adA, adB, ratio) {
  const r = ratio || 1.5;
  adA.setParam('rot4dXW', Math.sin(t * 2) * Math.PI);
  adA.setParam('rot4dYW', Math.cos(t * 2) * Math.PI * 0.7);
  adB.setParam('rot4dXW', Math.sin(t * 2 * r) * Math.PI);
  adB.setParam('rot4dYW', Math.cos(t * 2 * r + Math.PI / 4) * Math.PI * 0.7);
}

/** Sine-product interference: beating density patterns */
function sineInterference(progress, adA, adB) {
  const wA = Math.sin(progress * Math.PI * 3);
  const wB = Math.sin(progress * Math.PI * 5);
  adA.setParam('gridDensity', 10 + wA * wA * 30);
  adB.setParam('gridDensity', 10 + wB * wB * 30);
  return (wA * wB + 1) / 2;
}

/** Complementary hue breathing with chaos collision */
function complementaryBreathing(time, scrollP, adA, adB) {
  const rate = 0.5 + scrollP * 2;
  const breath = Math.sin(time / 1000 * rate * Math.PI * 2);
  const base = 200 + scrollP * 160;
  const comp = (base + 180) % 360;
  const hA = lerp(base, comp, (breath + 1) / 2);
  const hB = lerp(comp, base, (breath + 1) / 2);
  adA.setParam('hue', hA);
  adB.setParam('hue', hB);
  if (Math.abs(hA - hB) < 15) {
    const spike = (15 - Math.abs(hA - hB)) / 15 * 0.4;
    adA.setParam('chaos', Math.min(0.7, (adA.params?.chaos || 0.1) + spike));
    adB.setParam('chaos', Math.min(0.7, (adB.params?.chaos || 0.1) + spike));
  }
}

/** Exponential build: slow start, explosive acceleration */
function exponentialBuild(progress, adapter) {
  const e = Math.pow(progress, 3);
  adapter.setParams({ speed: 0.3 + e * 2.5, chaos: 0.05 + e * 0.65, intensity: 0.4 + e * 0.5, gridDensity: 20 + e * 35 });
}

/** Logarithmic calm: fast initial relief, slow settle */
function logarithmicCalm(progress, adapter) {
  const l = 1 - Math.pow(1 - progress, 3);
  adapter.setParams({ speed: 2.8 - l * 2.5, chaos: 0.7 - l * 0.65, intensity: 0.9 - l * 0.5, gridDensity: 55 - l * 35 });
}

/** Opposition: parameter inversion */
const oppositionRules = {
  hue: v => (v + 180) % 360,
  rot4dXW: v => -v,
  rot4dYW: v => -v * 0.7,
  gridDensity: v => clamp01((64 - v) / 60) * 56 + 4,
  intensity: v => Math.max(0.1, 1.0 - v),
  speed: v => Math.max(0.05, 2.0 - v),
  chaos: v => Math.max(0, 0.7 - v),
};

function applyOpposition(primary, secondary, params) {
  primary.setParams(params);
  const opp = {};
  for (const [k, fn] of Object.entries(oppositionRules)) {
    if (params[k] !== undefined) opp[k] = fn(params[k]);
  }
  secondary.setParams(opp);
}

/**
 * Interpolate between two morph stage parameter sets.
 * Handles geometry as discrete snap at midpoint, everything else as continuous lerp.
 */
function interpolateStages(stageA, stageB, t) {
  const smooth = smoothstep(t);
  return {
    geometry: t < 0.5 ? stageA.geometry : stageB.geometry,
    hue: lerp(stageA.hue, stageB.hue, smooth),
    gridDensity: lerp(stageA.gridDensity, stageB.gridDensity, smooth),
    speed: lerp(stageA.speed, stageB.speed, smooth),
    chaos: lerp(stageA.chaos, stageB.chaos, smooth),
    intensity: lerp(stageA.intensity, stageB.intensity, smooth),
    morphFactor: lerp(stageA.morphFactor, stageB.morphFactor, smooth),
    dimension: lerp(stageA.dimension, stageB.dimension, smooth),
    rot4dXW: lerp(stageA.rot4dXW, stageB.rot4dXW, smooth),
    rot4dYW: lerp(stageA.rot4dYW, stageB.rot4dYW, smooth),
    rot4dZW: lerp(stageA.rot4dZW, stageB.rot4dZW, smooth),
  };
}

// ─── Morph System Swap (with flash) ─────────────────────────
function createMorphSystem(pool, sysIdx) {
  if (pool.has('morph')) pool.release('morph');
  const initParams = trinityParams[sysIdx] || trinityParams[0];
  const adapter = pool.acquire('morph', 'morph-canvas', morphFactories[sysIdx], initParams);
  morphCurrent = adapter ? sysIdx : -1;
  return adapter;
}

function swapMorphSystem(pool, newIdx) {
  if (newIdx === morphCurrent || morphSwapLock) return;
  morphSwapLock = true;
  const flash = document.getElementById('morphFlash');

  // Safety timeout: release lock after 1s even if GSAP fails
  const safetyTimer = setTimeout(() => { morphSwapLock = false; }, 1000);

  gsap.to(flash, { opacity: 0.85, duration: 0.08, ease: 'power2.in', onComplete: () => {
    createMorphSystem(pool, newIdx);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        gsap.to(flash, { opacity: 0, duration: 0.2, ease: 'power2.out', onComplete: () => {
          clearTimeout(safetyTimer);
          morphSwapLock = false;
        }});
      });
    });
  }});
}

function updateMorphUI(stageIdx) {
  if (stageIdx === morphLastStage) return;
  morphLastStage = stageIdx;

  const stage = morphStages[stageIdx];
  const titleEl = document.getElementById('morphTitle');
  const subEl = document.getElementById('morphSub');
  const counterEl = document.getElementById('morphCounter');

  // Animate label out then in
  if (titleEl) {
    gsap.to(titleEl, { opacity: 0, y: -15, duration: 0.2, ease: 'power2.in', onComplete: () => {
      titleEl.textContent = stage.name;
      gsap.to(titleEl, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
    }});
  }
  if (subEl) {
    gsap.to(subEl, { opacity: 0, y: -8, duration: 0.15, ease: 'power2.in', onComplete: () => {
      subEl.textContent = stage.sub;
      gsap.to(subEl, { opacity: 1, y: 0, duration: 0.4, delay: 0.1, ease: 'power2.out' });
    }});
  }
  if (counterEl) {
    counterEl.innerHTML = `<span class="current">0${stageIdx + 1}</span> / 06`;
  }

  // Update dots
  document.querySelectorAll('.morph-dot').forEach((d, i) => {
    d.classList.toggle('active', i === stageIdx);
  });
}

// ─── Section Initializers ─────────────────────────────────────

export function initScrollProgress() {
  gsap.to('#scrollProgress', {
    scaleX: 1, ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.1 },
  });
}

// ─── OPENING CINEMATIC (800vh) ──────────────────────────────
// 5 phases: dark canvas → text appears → mask constrains canvas to letters →
// lattice layers parallax in → text fades, lattice locks, transition to hero

export function initOpening(pool, createHero) {
  const overlay = document.getElementById('openingOverlay');
  const chars = document.querySelectorAll('.opening-char');
  const lattice1 = document.getElementById('lattice1');
  const lattice2 = document.getElementById('lattice2');
  const lattice3 = document.getElementById('lattice3');
  const openingSub = document.querySelector('.opening-sub span');

  ScrollTrigger.create({
    trigger: '#openingSection',
    start: 'top top',
    end: 'bottom bottom',
    pin: '#openingPinned',
    scrub: 0.6,
    onEnter: () => {
      pool.acquire('opening', 'opening-canvas', QuantumAdapter, openingParams);
    },
    onLeave: () => {
      pool.release('opening');
    },
    onEnterBack: () => {
      pool.release('hero');
      pool.acquire('opening', 'opening-canvas', QuantumAdapter, openingParams);
    },
    onLeaveBack: () => {
      pool.release('opening');
    },
    onUpdate: (self) => {
      const p = self.progress;
      const adapter = pool.get('opening');

      // ── DEPTH TUNNEL: density-driven approach/retreat through phases ──
      const vignette = document.getElementById('openingVignette');
      const scanlines = document.getElementById('openingScanlines');
      const canvasWrap = document.getElementById('openingCanvasWrap');

      if (adapter) {
        const wave = Math.sin(p * Math.PI * 6);

        // Phase 1 (0-15%): emerge from maximum distance
        // Phase 2 (15-55%): approach — density drops, intensity rises
        // Phase 3 (55-75%): hold at medium depth, oscillate
        // Phase 4 (75-95%): retreat to distance
        // Phase 5 (95-100%): iris close
        let density, intensity, speed, dim, chaos;
        if (p < 0.15) {
          // DISTANT: high density, dim, slow
          const t = p / 0.15;
          density = lerp(60, 45, smoothstep(t));
          intensity = lerp(0.0, 0.3, smoothstep(t));
          speed = lerp(0.05, 0.2, t);
          dim = 4.3;
          chaos = 0.02;
        } else if (p < 0.55) {
          // APPROACH: density drops, scale grows, sharpens
          const t = (p - 0.15) / 0.4;
          density = lerp(45, 14, smoothstep(t));
          intensity = lerp(0.3, 0.75, smoothstep(t));
          speed = lerp(0.2, 0.9, t);
          dim = lerp(4.3, 3.3, t);
          chaos = lerp(0.02, 0.25, smoothstep(t));
        } else if (p < 0.75) {
          // HOLD + OSCILLATE: breathing depth
          const t = (p - 0.55) / 0.2;
          const breathe = Math.sin(t * Math.PI * 3) * 0.3;
          density = 14 + breathe * 8;
          intensity = 0.75 + breathe * 0.1;
          speed = 0.9 + breathe * 0.3;
          dim = 3.3 + breathe * 0.2;
          chaos = 0.25 + Math.abs(breathe) * 0.15;
        } else if (p < 0.95) {
          // RETREAT: density rises, dims, slows
          const t = (p - 0.75) / 0.2;
          density = lerp(14, 50, smoothstep(t));
          intensity = lerp(0.75, 0.15, smoothstep(t));
          speed = lerp(0.9, 0.1, t);
          dim = lerp(3.3, 4.3, t);
          chaos = lerp(0.25, 0.02, smoothstep(t));
        } else {
          // IRIS CLOSE: maximum distance, nearly invisible
          const t = (p - 0.95) / 0.05;
          density = lerp(50, 60, t);
          intensity = lerp(0.15, 0.0, t);
          speed = 0.05;
          dim = 4.5;
          chaos = 0.0;
        }

        adapter.setParams({
          intensity,
          rot4dXW: p * Math.PI * 4,
          rot4dYW: Math.sin(p * Math.PI * 2) * 2,
          rot4dZW: p * Math.PI * 0.8,
          hue: 220 + p * 100 + wave * 15,
          gridDensity: density,
          chaos,
          speed,
          morphFactor: 0.6 + Math.sin(p * Math.PI * 2) * 0.4,
          dimension: dim,
          geometry: p < 0.2 ? 11 : p < 0.5 ? 3 : p < 0.75 ? 4 : 7,
        });

        // CSS depth container: scale and blur match density
        if (canvasWrap) {
          const depthFactor = clamp01(1 - (density - 4) / 52);
          canvasWrap.style.transform = `scale(${lerp(0.85, 1.1, depthFactor)})`;
        }

        // Vignette tightens as depth increases
        updateVignette(vignette, density);
        // Scanlines drift
        updateScanlines(scanlines, p);
      }

      // ── Phase 2: Text appears letter by letter (12-35%) ──
      const textIn = clamp01((p - 0.12) / 0.22);
      const textOut = smoothstep(clamp01((p - 0.74) / 0.22));
      chars.forEach((c, i) => {
        const charP = clamp01((textIn - i * 0.07) / 0.14);
        const ease = smoothstep(charP);
        gsap.set(c, {
          opacity: ease * (1 - textOut),
          y: (1 - ease) * 80 + textOut * -60,
          scale: 0.7 + ease * 0.3 - textOut * 0.1,
          rotationX: (1 - ease) * 12,
        });
      });

      // ── Phase 3: Overlay mask (canvas visible only through letters) ──
      const maskIn = smoothstep(clamp01((p - 0.28) / 0.2));
      const maskOut = smoothstep(clamp01((p - 0.74) / 0.2));
      if (overlay) overlay.style.opacity = maskIn * (1 - maskOut);

      // ── Subtitle ──
      if (openingSub) {
        const subIn = smoothstep(clamp01((p - 0.36) / 0.08));
        const subOut = smoothstep(clamp01((p - 0.68) / 0.08));
        gsap.set(openingSub, {
          opacity: subIn * (1 - subOut),
          y: (1 - subIn) * 20,
        });
      }

      // ── Phase 4: Lattice layers slide in with parallax (45-75%) ──
      const latticeP = clamp01((p - 0.45) / 0.3);
      const lockP = clamp01((p - 0.82) / 0.15);

      if (lattice1) {
        const rot = lerp(latticeP * 6, Math.round(latticeP * 6 / 15) * 15, smoothstep(lockP));
        gsap.set(lattice1, {
          opacity: smoothstep(latticeP) * 0.7 * (1 - smoothstep(clamp01((p - 0.92) / 0.08))),
          rotation: rot,
          x: (1 - smoothstep(latticeP)) * -120,
          y: (latticeP - 0.5) * -50,
        });
      }
      if (lattice2) {
        const rot2 = lerp(-latticeP * 4 + 2, Math.round((-latticeP * 4 + 2) / 12) * 12, smoothstep(lockP));
        gsap.set(lattice2, {
          opacity: smoothstep(clamp01((latticeP - 0.1) / 0.9)) * 0.55 * (1 - smoothstep(clamp01((p - 0.92) / 0.08))),
          rotation: rot2,
          x: (1 - smoothstep(latticeP)) * 100,
          y: (latticeP - 0.5) * -35,
        });
      }
      if (lattice3) {
        const rot3 = lerp(latticeP * 9, Math.round(latticeP * 9 / 18) * 18, smoothstep(lockP));
        gsap.set(lattice3, {
          opacity: smoothstep(clamp01((latticeP - 0.2) / 0.8)) * 0.4 * (1 - smoothstep(clamp01((p - 0.9) / 0.1))),
          rotation: rot3,
          y: (latticeP - 0.5) * -70,
        });
      }
    },
  });
}

// ─── SCROLL-DRIVEN COLOR THEME ──────────────────────────────
// Root CSS hue shifts gradually across the page for cohesion

export function initScrollColorTheme() {
  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.5,
    onUpdate: (self) => {
      const p = self.progress;
      const hue = Math.round(210 + p * 140);
      document.documentElement.style.setProperty('--scroll-hue', hue);
    },
  });
}

// ─── BLUR CASCADE REVEALS ───────────────────────────────────
// Elements with .blur-reveal start blurred, clear on scroll entry

export function initBlurReveals() {
  document.querySelectorAll('.blur-reveal').forEach(el => {
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => el.classList.add('revealed'),
    });
  });
}

export function initHero(pool) {
  // Hero GPU lifecycle — acquire when entering, release on leave
  ScrollTrigger.create({
    trigger: '.hero', start: 'top 80%', end: 'bottom top',
    onEnter: () => {
      if (!pool.has('hero')) {
        pool.acquire('hero', 'hero-canvas', QuantumAdapter, {
          geometry: 11, hue: 210, gridDensity: 28, speed: 0.4,
          intensity: 0.75, chaos: 0.05, morphFactor: 0.6,
          rot4dXW: 0.15, rot4dYW: 0.08, dimension: 3.6, saturation: 0.9,
        });
      }
    },
    onEnterBack: () => {
      if (!pool.has('hero')) {
        pool.acquire('hero', 'hero-canvas', QuantumAdapter, {
          geometry: 11, hue: 210, gridDensity: 28, speed: 0.4,
          intensity: 0.75, chaos: 0.05, morphFactor: 0.6,
          rot4dXW: 0.15, rot4dYW: 0.08, dimension: 3.6, saturation: 0.9,
        });
      }
    },
  });

  const tl = gsap.timeline({ delay: 0.2 });

  // Badge entrance
  tl.to('#heroBadge', { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' });

  // Title: character cascade
  const title = document.getElementById('heroTitle');
  if (title) {
    const text = title.textContent;
    title.innerHTML = text.split('').map(c =>
      c === ' ' ? ' ' : `<span class="char">${c}</span>`
    ).join('');
    const chars = title.querySelectorAll('.char');
    chars.forEach((char) => {
      gsap.set(char, { y: 80 + Math.random() * 60, opacity: 0 });
    });
    tl.to(chars, {
      opacity: 1, y: 0,
      duration: 0.8, stagger: 0.06,
      ease: 'power4.out',
    }, '-=0.5');
  }

  tl.to('#heroSub', { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, '-=0.3');
  tl.to('#heroSystemLabel', { opacity: 1, duration: 0.6 }, '-=0.4');
  tl.to('#heroScroll', { opacity: 1, duration: 0.8 }, '-=0.2');

  // Scroll-driven hero parameter choreography
  ScrollTrigger.create({
    trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.3,
    onUpdate: (self) => {
      const p = self.progress;
      const hero = pool.get('hero');
      if (!hero) return;
      const ease = smoothstep(p);
      const late = clamp01((p - 0.4) / 0.6);
      const burst = clamp01((p - 0.7) / 0.3);

      hero.setParams({
        rot4dXY: ease * 0.4, rot4dXZ: ease * 0.25,
        rot4dXW: late * Math.PI * 1.5,
        rot4dYW: late * Math.PI * 0.8,
        rot4dZW: burst * Math.PI * 1.2,
        geometry: p < 0.25 ? 3 : p < 0.55 ? 2 : p < 0.8 ? 4 : 6,
        gridDensity: 28 + ease * 36 + Math.sin(p * Math.PI * 6) * 8,
        hue: 210 + ease * 80 + Math.sin(p * Math.PI * 4) * 20,
        chaos: 0.05 + late * 0.4 + burst * 0.2,
        intensity: 0.75 + ease * 0.2 + burst * 0.05,
        morphFactor: 0.6 + ease * 1.2,
        dimension: 3.6 - ease * 0.5,
        saturation: 0.9 + late * 0.1,
      });
    },
  });

  // Hero content exit: parallax up + fade
  gsap.to('#heroContent', {
    opacity: 0, y: -150, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: '25% top', end: 'bottom top', scrub: 1.0 },
  });
  gsap.to('#heroScroll', {
    opacity: 0, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: '10% top', end: '25% top', scrub: 0.3 },
  });
}

// ─── MORPH EXPERIENCE (1200vh) ──────────────────────────────
// 6 stages: Emergence → Dimensional Shift → Three Voices →
//           Convergence → Spectral Rupture → Resolution

export function initMorph(pool, createHero) {
  const morphCard = document.getElementById('morphCard');
  const morphGlow = document.getElementById('morphGlow');
  const morphVoices = document.querySelectorAll('.morph-voice');
  const morphFill = document.getElementById('morphProgressFill');
  const NUM_STAGES = morphStages.length;

  ScrollTrigger.create({
    trigger: '#morphSection', start: 'top top', end: 'bottom bottom',
    pin: '#morphPinned', scrub: 0.6,
    onEnter: () => {
      pool.release('hero');
      pool.release('opening');
      createMorphSystem(pool, 0);
      updateMorphUI(0);
    },
    onLeave: () => {
      pool.release('morph');
      morphCurrent = -1;
    },
    onEnterBack: () => {
      createMorphSystem(pool, 2);
      updateMorphUI(5);
    },
    onLeaveBack: () => {
      pool.release('morph');
      morphCurrent = -1;
      createHero();
    },
    onUpdate: (self) => {
      const p = self.progress;

      // ── Progress bar ──
      if (morphFill) morphFill.style.width = `${p * 100}%`;

      // ── Stage index and local progress within stage ──
      const stageFloat = p * NUM_STAGES;
      const stageIdx = Math.min(Math.floor(stageFloat), NUM_STAGES - 1);
      const localP = stageFloat - stageIdx;

      // ── Update UI (label, counter, dots) ──
      updateMorphUI(stageIdx);

      // ── System swaps: Quantum (0-1), Holographic (2-3), Faceted (4-5) ──
      const targetSys = stageIdx < 2 ? 0 : stageIdx < 4 ? 1 : 2;
      if (targetSys !== morphCurrent && !morphSwapLock) {
        swapMorphSystem(pool, targetSys);
      }

      // ── Interpolate parameters between current and next stage ──
      const nextIdx = Math.min(stageIdx + 1, NUM_STAGES - 1);
      const params = interpolateStages(morphStages[stageIdx], morphStages[nextIdx], localP);

      // ── Additional organic motion: sine modulation on top of interpolation ──
      const wave = Math.sin(p * Math.PI * 8);
      const pulse = Math.sin(localP * Math.PI);
      params.hue += wave * 15;
      params.gridDensity += pulse * 4;
      params.rot4dXW += Math.sin(p * Math.PI * 3) * 0.3;
      params.intensity += pulse * 0.05;

      // ── Apply to adapter ──
      const adapter = pool.get('morph');
      if (adapter) adapter.setParams(params);

      // ── MORPH CARD DEPTH + CHROMATIC EFFECTS ──
      const morphShadow = document.getElementById('morphShadow');
      updateChroma(morphCard, adapter);
      // Card shape morphs through stages:
      //   Stage 0: Small circle appears (scale 0→1)
      //   Stage 1: Circle grows to rounded rectangle
      //   Stage 2: Card holds, three voice labels appear
      //   Stage 3: Card grows larger with golden convergence glow
      //   Stage 4: Card expands massively (near full-screen), chaos glow
      //   Stage 5: Card shrinks to medium, calms down
      if (morphCard) {
        const glowHue = params.hue;
        morphCard.style.setProperty('--morph-glow', `hsla(${glowHue}, 70%, 50%, ${0.08 + params.chaos * 0.2})`);

        if (stageIdx === 0) {
          // Emergence: circle appears
          const s = smoothstep(localP);
          gsap.set(morphCard, {
            width: lerp(80, 120, s),
            height: lerp(80, 120, s),
            borderRadius: '50%',
            scale: s,
            x: '-50%', y: '-50%',
          });
          morphCard.classList.toggle('glowing', localP > 0.3);
        } else if (stageIdx === 1) {
          // Dimensional Shift: circle → rounded rect
          const s = smoothstep(localP);
          gsap.set(morphCard, {
            width: lerp(120, 340, s),
            height: lerp(120, 220, s),
            borderRadius: lerp(50, 24, s) + '%',
            scale: 1,
            x: '-50%', y: '-50%',
          });
          morphCard.classList.add('glowing');
          updateDepthShadow(morphShadow, smoothstep(localP) * 0.5);
        } else if (stageIdx === 2) {
          // Three Voices: card holds, voice labels appear
          gsap.set(morphCard, {
            width: 340, height: 220, borderRadius: '24px',
            scale: 1, x: '-50%', y: '-50%',
          });
          // Animate voice labels in
          morphVoices.forEach((v, i) => {
            const delay = i * 0.08;
            const show = localP > 0.15 + delay;
            gsap.to(v, {
              opacity: show ? 1 : 0,
              y: show ? 0 : 30,
              scale: show ? 1 : 0.8,
              duration: 0.4, ease: 'power3.out',
            });
          });
        } else if (stageIdx === 3) {
          // Convergence: card grows, voice labels hide
          const s = smoothstep(localP);
          gsap.set(morphCard, {
            width: lerp(340, 500, s),
            height: lerp(220, 350, s),
            borderRadius: '24px',
            scale: 1, x: '-50%', y: '-50%',
          });
          // Density coordination: as card grows, density drops
          if (adapter) adapter.setParam('gridDensity', params.gridDensity * lerp(1, 0.7, s));
          // Hide voices
          morphVoices.forEach(v => {
            gsap.to(v, { opacity: 0, y: -20, scale: 0.8, duration: 0.3, ease: 'power2.in' });
          });
        } else if (stageIdx === 4) {
          // Spectral Rupture: card expands massively
          const s = smoothstep(localP);
          const cardW = lerp(500, window.innerWidth * 0.85, s);
          const cardH = lerp(350, window.innerHeight * 0.75, s);
          gsap.set(morphCard, {
            width: cardW, height: cardH,
            borderRadius: lerp(24, 16, s) + 'px',
            scale: 1, x: '-50%', y: '-50%',
          });
          morphCard.classList.add('glowing');
          // Density drops as card expands (inverse relationship)
          if (adapter) adapter.setParam('gridDensity', params.gridDensity * lerp(0.7, 0.3, s));
          // Speed and chaos amplified during rupture
          if (adapter) {
            adapter.setParam('speed', params.speed * lerp(1, 1.5, s));
            adapter.setParam('chaos', params.chaos * lerp(1, 1.3, s));
          }
          // Card at max foreground depth
          updateDepthShadow(morphShadow, 0.5 + s * 0.5);
        } else {
          // Resolution: card shrinks back to medium
          const s = smoothstep(localP);
          gsap.set(morphCard, {
            width: lerp(window.innerWidth * 0.85, 380, s),
            height: lerp(window.innerHeight * 0.75, 240, s),
            borderRadius: lerp(16, 24, s) + 'px',
            scale: 1, x: '-50%', y: '-50%',
          });
          morphCard.classList.toggle('glowing', localP < 0.7);
          // Density recovers as card shrinks
          if (adapter) adapter.setParam('gridDensity', params.gridDensity * lerp(0.3, 1, s));
        }
      }
    },
  });
}

// ─── PARALLAX TRIPTYCH ──────────────────────────────────────
// All 3 GPU systems rendering simultaneously with cross-system coordination:
//   Quantum (left) ↔ Holographic (center, behind text) ↔ Faceted (right)
// Coordination: shared heartbeat, energy conservation, triadic hues,
//   phase-locked 4D rotation, density cross-feed, convergence event

export function initTriptych(pool) {
  const left = document.getElementById('triptychLeft');
  const right = document.getElementById('triptychRight');

  const centerInitParams = {
    ...parallaxParams.left,
    hue: 280, geometry: 3, intensity: 0.6, gridDensity: 20,
    chaos: 0.1, speed: 0.5, saturation: 0.75,
  };

  // ── GPU Lifecycle: acquire all 3 real systems ──
  const acquireAll = () => {
    pool.acquire('triLeft', 'tri-left-canvas', QuantumAdapter, parallaxParams.left);
    pool.acquire('triCenter', 'tri-center-canvas', HolographicAdapter, centerInitParams);
    pool.acquire('triRight', 'tri-right-canvas', FacetedAdapter, parallaxParams.right);
  };
  const releaseAll = () => {
    pool.release('triLeft');
    pool.release('triCenter');
    pool.release('triRight');
  };

  ScrollTrigger.create({
    trigger: '#triptychSection', start: 'top 90%', end: 'bottom top',
    onEnter: acquireAll,
    onLeave: releaseAll,
    onEnterBack: acquireAll,
    onLeaveBack: releaseAll,
  });

  // ── 3-System Cross-Coordinated Choreography with DEPTH PLANES ──
  const center = document.getElementById('triptychCenter');
  const triSeamL = document.getElementById('triSeamLeft');
  const triSeamR = document.getElementById('triSeamRight');
  const triVigL = document.getElementById('triVignetteLeft');
  const triVigC = document.getElementById('triVignetteCenter');
  const triVigR = document.getElementById('triVignetteRight');
  const triShadL = document.getElementById('triShadowLeft');
  const triShadR = document.getElementById('triShadowRight');

  ScrollTrigger.create({
    trigger: '#triptychSection', start: 'top bottom', end: 'bottom top',
    scrub: 0.5,
    onUpdate: (self) => {
      const p = self.progress;

      // ═══════ CLIP-PATH SPLIT-SCREEN ═══════
      const root = document.documentElement;
      const mouseXPct = parseFloat(root.style.getPropertyValue('--mouse-x') || '50%') || 50;
      const mouseShift = (mouseXPct / 100 - 0.5) * 6;

      const splitLeft = 34 + (p - 0.5) * 12 + mouseShift;
      const splitRight = 66 + (p - 0.5) * 12 + mouseShift;

      const conv = Math.max(0, 1 - Math.abs(p - 0.5) * 4);
      const cSplitLeft = lerp(splitLeft, 33.33, conv * 0.5);
      const cSplitRight = lerp(splitRight, 66.66, conv * 0.5);

      if (left) left.style.clipPath = `inset(0 ${100 - cSplitLeft}% 0 0)`;
      if (center) center.style.clipPath = `inset(0 ${100 - cSplitRight}% 0 ${cSplitLeft}%)`;
      if (right) right.style.clipPath = `inset(0 0 0 ${cSplitRight}%)`;

      root.style.setProperty('--tri-split-left', `${cSplitLeft}%`);
      root.style.setProperty('--tri-split-right', `${cSplitRight}%`);

      // ═══════ DEPTH PLANE SYSTEM ═══════
      // Phase 1 (0-30%): L=FOREGROUND, C=MID, R=BACK
      // Phase 2 (30-50%): L retreats, R advances (DEPTH SWAP)
      // Phase 3 (50-70%): R=FOREGROUND, C=MID, L=BACK (mirror)
      // Phase 4 (70-85%): All converge to same depth
      // Phase 5 (85-100%): Crystallization — all retreat together
      let depthL, depthC, depthR; // 0=far, 1=close
      if (p < 0.3) {
        const t = p / 0.3;
        depthL = lerp(0.9, 0.85, t);
        depthC = 0.5;
        depthR = lerp(0.15, 0.2, t);
      } else if (p < 0.5) {
        // DEPTH SWAP — dramatic crossing
        const t = (p - 0.3) / 0.2;
        const s = smoothstep(t);
        depthL = lerp(0.85, 0.15, s);
        depthC = 0.5 + Math.sin(t * Math.PI) * 0.2; // center rises then falls
        depthR = lerp(0.2, 0.9, s);
      } else if (p < 0.7) {
        const t = (p - 0.5) / 0.2;
        depthL = lerp(0.15, 0.15, t);
        depthC = 0.5;
        depthR = lerp(0.9, 0.85, t);
      } else if (p < 0.85) {
        // CONVERGENCE: all → same depth
        const t = (p - 0.7) / 0.15;
        const s = smoothstep(t);
        depthL = lerp(0.15, 0.55, s);
        depthC = lerp(0.5, 0.55, s);
        depthR = lerp(0.85, 0.55, s);
      } else {
        // CRYSTALLIZATION: all retreat together
        const t = (p - 0.85) / 0.15;
        const s = smoothstep(t);
        depthL = depthC = depthR = lerp(0.55, 0.1, s);
      }

      // Apply depth CSS to containers
      const applyDepthCSS = (el, depth) => {
        if (!el) return;
        const scale = lerp(0.88, 1.12, depth);
        const blur = lerp(3, 0, depth);
        // Only apply parallax Y offset, not full depth scale (clip-path handles width)
        el.style.transform = `translateY(${(p - 0.5) * lerp(-40, -120, depth)}px) scale(${scale})`;
        el.style.filter = blur > 0.5 ? `blur(${blur}px)` : 'none';
      };
      applyDepthCSS(left, depthL);
      applyDepthCSS(right, depthR);

      // Shadows respond to depth
      updateDepthShadow(triShadL, depthL);
      updateDepthShadow(triShadR, depthR);

      // Vignettes tighten for foreground elements
      const denFromDepth = d => lerp(50, 8, d);
      updateVignette(triVigL, denFromDepth(depthL));
      updateVignette(triVigC, denFromDepth(depthC));
      updateVignette(triVigR, denFromDepth(depthR));

      // ═══════ SHARED COORDINATION SIGNALS ═══════
      const heartbeat = Math.sin(p * Math.PI * 2);
      const pulse = Math.sin(p * Math.PI);
      const convergence = conv;

      // Triadic hue rotation
      const baseHue = 200 + p * 160;
      const hueL = baseHue % 360 + convergence * ((baseHue + 120) % 360 - baseHue % 360) * 0.6;
      const hueC = (baseHue + 120) % 360;
      const hueR = (baseHue + 240) % 360 + convergence * ((baseHue + 120) % 360 - (baseHue + 240) % 360) * 0.6;

      // Depth-driven density: close=low density, far=high
      const denL = denFromDepth(depthL) + heartbeat * 4;
      const denC = denFromDepth(depthC) + heartbeat * 6;
      const denR = denFromDepth(depthR) + heartbeat * 4;

      // Depth-driven intensity: close=bright, far=dim
      const intL = lerp(0.3, 0.85, depthL) + heartbeat * 0.1;
      const intC = lerp(0.35, 0.8, depthC) + pulse * 0.15;
      const intR = lerp(0.3, 0.85, depthR) - heartbeat * 0.08;

      // Phase-locked 4D with LISSAJOUS intertwining
      const rotBase = p * Math.PI * 4;
      const t = p * Math.PI;
      const xwL = Math.sin(t * 2) * Math.PI + rotBase * 0.3;
      const xwC = rotBase + Math.PI * 2 / 3;
      const xwR = Math.sin(t * 3) * Math.PI + rotBase * 0.3; // 3:2 ratio with L

      // Call & response: left chaos → center speed → right morph
      const chaosL = 0.1 + depthL * 0.3 + convergence * 0.2;
      const speedC = 0.4 + chaosL * 0.8 + convergence * 0.8;
      const morphR = 0.6 + speedC * 0.3;
      const sharedSpeed = 0.4 + pulse * 0.6 + convergence * 1.0;

      // ═══════ DEPTH SWAP CHAOS SPIKE ═══════
      const swapChaos = (p > 0.35 && p < 0.5) ? Math.sin((p - 0.35) / 0.15 * Math.PI) * 0.35 : 0;

      // ═══════ LEFT: QUANTUM ═══════
      const triL = pool.get('triLeft');
      if (triL) {
        triL.setParams({
          geometry: p < 0.3 ? 2 : p < 0.6 ? 3 : p < 0.85 ? 10 : 7,
          hue: hueL,
          rot4dXW: xwL,
          rot4dYW: Math.sin(p * Math.PI * 2) * 2.0,
          rot4dZW: p * Math.PI * 0.6,
          gridDensity: Math.max(6, Math.min(55, denL)),
          intensity: Math.min(0.95, intL),
          chaos: chaosL + swapChaos,
          morphFactor: 0.6 + Math.sin(p * Math.PI * 2) * 0.4,
          speed: sharedSpeed * lerp(0.7, 1.3, depthL),
          saturation: 0.85 + pulse * 0.1,
        });
      }

      // ═══════ CENTER: HOLOGRAPHIC ═══════
      const triC = pool.get('triCenter');
      if (triC) {
        triC.setParams({
          geometry: p < 0.2 ? 3 : p < 0.4 ? 11 : p < 0.6 ? 6 : p < 0.8 ? 2 : 10,
          hue: hueC,
          rot4dXW: xwC,
          rot4dYW: Math.cos(p * Math.PI * 2) * 1.5 + heartbeat * 0.5,
          rot4dZW: -p * Math.PI * 0.3 + heartbeat * 0.4,
          gridDensity: Math.max(6, Math.min(55, denC)),
          intensity: Math.min(0.95, intC),
          chaos: 0.1 + convergence * 0.4 + pulse * 0.1 + swapChaos,
          morphFactor: 0.5 + convergence * 0.8 + heartbeat * 0.3,
          speed: speedC,
          saturation: 0.75 + convergence * 0.2,
        });
      }

      // ═══════ RIGHT: FACETED ═══════
      const triR = pool.get('triRight');
      if (triR) {
        triR.setParams({
          geometry: p < 0.25 ? 12 : p < 0.5 ? 4 : p < 0.75 ? 20 : 5,
          hue: hueR,
          rot4dXW: xwR,
          rot4dYW: Math.cos(p * Math.PI * 2) * 1.8,
          rot4dZW: -p * Math.PI * 0.4,
          gridDensity: Math.max(6, Math.min(55, denR)),
          intensity: Math.min(0.95, intR),
          chaos: 0.15 + depthR * 0.2 - convergence * 0.1 + swapChaos,
          morphFactor: morphR,
          speed: sharedSpeed * lerp(0.7, 1.3, depthR) * 0.9,
          saturation: 0.9 + pulse * 0.08,
        });
      }

      // ═══════ GLOW SEAMS — energy between adjacent systems ═══════
      updateGlowSeam(triSeamL, triL, triC);
      updateGlowSeam(triSeamR, triC, triR);
    },
  });
}

// ─── CASCADE — Inter-Card Ripple Coordination ────────────────
// Active card: scale up, glow leaks, density drops
// Ripple propagation: active card's energy echoes outward through ALL cards
// with distance-based falloff — every card participates, none are idle.
// Shared rotation phase ties all cards to a common 4D rhythm.

export function initCascade(pool, c2d) {
  const cascadeCards = document.querySelectorAll('.cascade-card');
  const cascadeTrack = document.getElementById('cascadeTrack');
  const gpuLeftWrap = document.getElementById('cascadeGpuLeft');
  const gpuRightWrap = document.getElementById('cascadeGpuRight');

  // ── Dual GPU background lifecycle ──
  ScrollTrigger.create({
    trigger: '#cascadeSection', start: 'top 90%', end: 'bottom top',
    onEnter: () => {
      pool.acquire('casGpuL', 'cascade-gpu-left', QuantumAdapter, {
        geometry: 2, hue: 200, gridDensity: 20, speed: 0.5,
        intensity: 0.55, chaos: 0.15, dimension: 3.5, morphFactor: 0.6, saturation: 0.85,
      });
      pool.acquire('casGpuR', 'cascade-gpu-right', HolographicAdapter, {
        geometry: 4, hue: 320, gridDensity: 18, speed: 0.4,
        intensity: 0.5, chaos: 0.12, dimension: 3.6, morphFactor: 0.7, saturation: 0.8,
      });
    },
    onLeave: () => { pool.release('casGpuL'); pool.release('casGpuR'); },
    onEnterBack: () => {
      pool.acquire('casGpuL', 'cascade-gpu-left', QuantumAdapter, {
        geometry: 2, hue: 200, gridDensity: 20, speed: 0.5,
        intensity: 0.55, chaos: 0.15, dimension: 3.5, morphFactor: 0.6, saturation: 0.85,
      });
      pool.acquire('casGpuR', 'cascade-gpu-right', HolographicAdapter, {
        geometry: 4, hue: 320, gridDensity: 18, speed: 0.4,
        intensity: 0.5, chaos: 0.12, dimension: 3.6, morphFactor: 0.7, saturation: 0.8,
      });
    },
    onLeaveBack: () => { pool.release('casGpuL'); pool.release('casGpuR'); },
  });

  // ═══ 8-point polygon shapes for geometric morphing ═══
  // All shapes have exactly 8 vertices so CSS can interpolate between them.
  const SHAPES = {
    // Nearly-full rectangle (rounded feel via vertex placement)
    rect:    [[2,2],[50,0],[98,2],[100,50],[98,98],[50,100],[2,98],[0,50]],
    // Hexagonal window
    hex:     [[25,2],[75,2],[98,25],[98,75],[75,98],[25,98],[2,75],[2,25]],
    // Diamond / rhombus
    diamond: [[50,2],[80,20],[98,50],[80,80],[50,98],[20,80],[2,50],[20,20]],
    // Octagon
    oct:     [[28,2],[72,2],[98,28],[98,72],[72,98],[28,98],[2,72],[2,28]],
    // Narrow slit — card appears small through this window
    narrow:  [[15,12],[50,8],[85,12],[92,50],[85,88],[50,92],[15,88],[8,50]],
  };

  // Interpolate between two 8-point polygon shapes
  function lerpShape(a, b, t) {
    return 'polygon(' + a.map((pt, i) =>
      `${pt[0] + (b[i][0] - pt[0]) * t}% ${pt[1] + (b[i][1] - pt[1]) * t}%`
    ).join(', ') + ')';
  }

  // Shape sequence for the active card as it scrolls through
  const shapeSeq = [SHAPES.rect, SHAPES.hex, SHAPES.diamond, SHAPES.oct, SHAPES.rect];

  // Initialize card hue custom properties + frame elements
  cascadeCards.forEach((card) => {
    card.style.setProperty('--card-hue', card.dataset.hue);
  });

  // Stagger entrance — NO SCALE, just opacity + translateY
  ScrollTrigger.create({
    trigger: '#cascadeSection', start: 'top 75%', once: true,
    onEnter: () => {
      gsap.to('.cascade-card', {
        opacity: 1, y: 0,
        duration: 0.9, stagger: 0.15,
        ease: 'power3.out',
      });
    },
  });

  // ─── Card hover interaction: mouse drives AmbientLattice params ──
  cascadeCards.forEach((card, i) => {
    card.addEventListener('mouseenter', () => {
      const inst = c2d.get(`cas${i}`);
      if (inst) inst.setParams({ speed: 1.8, chaos: 0.5, intensity: 0.95 });
    });
    card.addEventListener('mousemove', (e) => {
      const inst = c2d.get(`cas${i}`);
      if (!inst) return;
      const rect = card.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      inst.setParam('mouseX', mx);
      inst.setParam('mouseY', my);
    });
    card.addEventListener('mouseleave', () => {
      const inst = c2d.get(`cas${i}`);
      if (inst) inst.setParams({ speed: 0.7, chaos: 0.18, intensity: 0.85, mouseX: 0.5, mouseY: 0.5 });
    });
  });

  // Cascade header reveal
  ScrollTrigger.create({
    trigger: '#cascadeSection', start: 'top 80%', once: true,
    onEnter: () => {
      gsap.from('.cascade-header', {
        y: 40, opacity: 0, duration: 0.8, ease: 'power2.out',
      });
    },
  });

  if (cascadeTrack && cascadeCards.length > 0) {
    const N = cascadeCards.length;

    ScrollTrigger.create({
      trigger: '#cascadeSection', start: 'top top', end: 'bottom bottom',
      pin: '#cascadePinned', scrub: 0.5,
      onUpdate: (self) => {
        const p = self.progress;

        // Cards are 80vw wide, end-to-end (no gap)
        const vw = window.innerWidth / 100;
        const cardW = 80 * vw;
        const totalScroll = (N - 1) * cardW;
        // Mobile: CSS handles vertical stack (transform: none !important)
        if (window.innerWidth > 768) {
          cascadeTrack.style.transform = `translateX(${-p * totalScroll}px)`;
        }

        const activeIdx = Math.min(Math.floor(p * N), N - 1);
        const activeHue = parseInt(cascadeCards[activeIdx].dataset.hue);
        const localP = (p * N) - activeIdx;
        const pulse = Math.sin(localP * Math.PI);

        // ═══ Shared rotation phase — all cards tied to a common 4D rhythm ═══
        const sharedXW = p * Math.PI * 3;

        // ═══ DUAL GPU BACKGROUND: DEPTH RESPONSE to active card ═══
        const gpuL = pool.get('casGpuL');
        const gpuR = pool.get('casGpuR');
        const casSeam = document.getElementById('cascadeSeam');
        const casVignette = document.getElementById('cascadeVignette');
        const aCard = cascadeCards[activeIdx];
        const aGeo = parseInt(aCard?.dataset.geo || '0');
        const aHue = parseInt(aCard?.dataset.hue || '200');
        const cardApproach = pulse;

        if (gpuL) {
          gpuL.setParams({
            geometry: aGeo, hue: aHue,
            rot4dXW: sharedXW,
            rot4dYW: Math.sin(p * Math.PI * 2) * 1.5,
            gridDensity: lerp(14, 50, cardApproach),
            intensity: lerp(0.55, 0.2, cardApproach),
            chaos: 0.1 + pulse * 0.25,
            speed: 0.4 + pulse * 0.8,
            morphFactor: 0.5 + localP * 0.6,
          });
        }
        if (gpuR) {
          gpuR.setParams({
            geometry: (aGeo + 16) % 24,
            hue: (aHue + 180) % 360,
            rot4dXW: -sharedXW * 0.7,
            rot4dYW: Math.cos(p * Math.PI * 2) * 1.2,
            gridDensity: lerp(18, 52, cardApproach),
            intensity: lerp(0.45, 0.18, cardApproach),
            chaos: 0.12 + (1 - pulse) * 0.2,
            speed: 0.3 + (1 - pulse) * 0.6,
            morphFactor: 0.7 - localP * 0.3,
          });
        }

        // Split line follows active card
        const splitPct = 30 + activeIdx / Math.max(1, N - 1) * 40;
        if (gpuLeftWrap) gpuLeftWrap.style.clipPath = `inset(0 ${100 - splitPct}% 0 0)`;
        if (gpuRightWrap) gpuRightWrap.style.clipPath = `inset(0 0 0 ${splitPct}%)`;
        updateGlowSeam(casSeam, gpuL, gpuR);
        if (casSeam) casSeam.style.left = `${splitPct}%`;
        if (casVignette) updateVignette(casVignette, gpuL?.params?.gridDensity || 20);

        // ═══ PER-CARD: 3D TILT + GEOMETRIC MORPHING + FRACTAL ECHOES ═══
        cascadeCards.forEach((card, i) => {
          const inst = c2d.get(`cas${i}`);
          if (!inst) return;
          const hue = parseInt(card.dataset.hue);
          const dist = Math.abs(i - activeIdx);
          const ripple = Math.max(0, 1 - dist * 0.3) * pulse;
          const phaseOffset = dist * Math.PI / 3;
          const isActive = (i === activeIdx);

          // ═══ 3D TILT — NO SCALE EVER ═══
          // Active card tilts toward face-on (flat). Neighbors fan outward.
          let tiltY, tiltX, tiltZ;
          if (isActive) {
            // Face-on when fully active, slight tilt during transition
            tiltY = (1 - pulse) * (localP < 0.5 ? -15 : 15);
            tiltX = -pulse * 3;
            tiltZ = (1 - pulse) * (localP < 0.5 ? -2 : 2);
          } else {
            // Fan outward: cards to left tilt right, cards to right tilt left
            const dir = i < activeIdx ? 1 : -1;
            const tiltStrength = Math.min(dist * 18, 50);
            tiltY = dir * tiltStrength;
            tiltX = dist * 3;
            tiltZ = dir * dist * 1.5;
          }

          card.style.transform = `perspective(1200px) rotateY(${tiltY}deg) rotateX(${tiltX}deg) rotateZ(${tiltZ}deg)`;
          card.style.zIndex = isActive ? '10' : `${Math.max(1, 7 - dist)}`;
          card.style.opacity = isActive ? '1' : `${Math.max(0.35, 1 - dist * 0.13)}`;

          // ═══ GEOMETRIC MORPHING via clip-path on canvas-wrap ═══
          // Active: morph through shape sequence. Inactive: narrow window.
          const wrap = card.querySelector('.canvas-wrap');
          const overlay = card.querySelector('.cascade-overlay');
          const frame = card.querySelector('.card-frame');
          let clipVal;

          if (isActive) {
            // Cycle through 4 shape transitions based on localP (0→1)
            const phase = localP * (shapeSeq.length - 1);
            const segIdx = Math.min(Math.floor(phase), shapeSeq.length - 2);
            const segT = phase - segIdx;
            clipVal = lerpShape(shapeSeq[segIdx], shapeSeq[segIdx + 1], segT);
          } else {
            // Narrower window the further away — controls perceived size
            const inset = Math.min(3 + dist * 6, 22);
            const r = 14 + dist * 3;
            clipVal = `inset(${inset}% ${inset * 0.6}% ${inset}% ${inset * 0.6}% round ${r}px)`;
          }

          if (wrap) wrap.style.clipPath = clipVal;
          if (overlay) overlay.style.clipPath = clipVal;
          if (frame) frame.style.clipPath = clipVal;

          // ═══ FRACTAL ECHOES via filter: drop-shadow ═══
          // Active card gets offset drop-shadows that follow the geometric clip-path.
          // This creates the illusion of the card duplicating/fracturing outward.
          if (isActive) {
            const echoOff = 5 + pulse * 16;
            const a1 = (0.18 + pulse * 0.14).toFixed(2);
            const a2 = (0.10 + pulse * 0.08).toFixed(2);
            const a3 = (0.05 + pulse * 0.04).toFixed(2);
            card.style.filter = [
              `drop-shadow(${echoOff}px ${echoOff * 0.8}px 0px hsla(${hue}, 70%, 50%, ${a1}))`,
              `drop-shadow(${echoOff * 2.2}px ${echoOff * 1.2}px 1px hsla(${hue}, 65%, 45%, ${a2}))`,
              `drop-shadow(${-echoOff * 0.8}px ${echoOff * 1.5}px 0px hsla(${hue}, 60%, 40%, ${a3}))`,
              `drop-shadow(${echoOff * 1.4}px ${-echoOff * 0.6}px 0px hsla(${hue}, 60%, 40%, ${a3}))`,
            ].join(' ');
            card.classList.add('leaking');
            // Frame glow
            card.style.setProperty('--frame-glow-size', `${18 + pulse * 35}px`);
            card.style.setProperty('--frame-glow-alpha', `${0.12 + pulse * 0.18}`);
            card.style.setProperty('--frame-border', `1px solid rgba(255,255,255,${0.06 + pulse * 0.12})`);
          } else {
            // Neighbors: subtle single echo if close, none if far
            if (ripple > 0.08) {
              const rOff = 3 + ripple * 10;
              card.style.filter = `drop-shadow(${rOff}px ${rOff * 0.6}px 0px hsla(${hue}, 60%, 45%, ${(ripple * 0.12).toFixed(2)}))`;
            } else {
              card.style.filter = 'none';
            }
            card.classList.toggle('leaking', ripple > 0.15);
            card.style.setProperty('--frame-glow-size', '0px');
            card.style.setProperty('--frame-glow-alpha', '0');
            card.style.setProperty('--frame-border', `1px solid rgba(255,255,255,${0.03 + ripple * 0.04})`);
          }

          // ═══ VISUALIZATION PARAMETERS ═══
          // Active: low density (close/dramatic), high chaos/speed
          // Inactive: high density (receded/ambient), low chaos
          if (isActive) {
            inst.setParams({
              rot4dXW: sharedXW + localP * Math.PI * 2,
              rot4dYW: Math.sin(localP * Math.PI) * 1.8,
              rot4dZW: sharedXW * 0.4 + localP * 0.8,
              intensity: 0.85 + pulse * 0.15,
              gridDensity: Math.max(6, 22 - pulse * 14),
              speed: 1.0 + pulse * 1.8,
              chaos: 0.25 + pulse * 0.5,
              hue: hue + pulse * 40,
              morphFactor: 0.5 + localP * 1.2,
              saturation: 0.95,
            });
          } else {
            const hueBleed = ripple * 0.5;
            const echoWave = Math.sin(localP * Math.PI + phaseOffset);
            const echo = Math.max(0, echoWave) * ripple;
            inst.setParams({
              hue: hue + (activeHue - hue) * hueBleed,
              intensity: 0.45 + ripple * 0.3,
              gridDensity: 24 - ripple * 8 + echo * 5,
              speed: 0.5 + echo * 0.7,
              chaos: 0.1 + echo * 0.2,
              morphFactor: 0.4 + echo * 0.5,
              rot4dXW: sharedXW + phaseOffset * 0.4,
              rot4dYW: Math.sin(sharedXW + phaseOffset) * 0.6 * ripple,
              saturation: 0.75 + ripple * 0.15,
            });
          }
        });
      },
    });
  }
}

// ─── ENERGY TRANSFER ────────────────────────────────────────

export function initEnergy(pool) {
  const energyBgInitParams = {
    geometry: 6, hue: 270, gridDensity: 24, speed: 0.5,
    intensity: 0.6, chaos: 0.15, dimension: 3.4, morphFactor: 0.8, saturation: 0.9,
  };

  // Dual GPU lifecycle: Quantum bg + Faceted card
  ScrollTrigger.create({
    trigger: '#energySection', start: 'top 80%', end: 'bottom top',
    onEnter: () => {
      pool.acquire('energyBg', 'energy-bg-canvas', QuantumAdapter, energyBgInitParams);
      pool.acquire('energyCard', 'energy-card-canvas', FacetedAdapter, energyCardParams);
    },
    onLeave: () => { pool.release('energyBg'); pool.release('energyCard'); },
    onEnterBack: () => {
      pool.acquire('energyBg', 'energy-bg-canvas', QuantumAdapter, energyBgInitParams);
      pool.acquire('energyCard', 'energy-card-canvas', FacetedAdapter, energyCardParams);
    },
    onLeaveBack: () => { pool.release('energyBg'); pool.release('energyCard'); },
  });

  // 7-Step Pinned 3D Card Timeline
  const energyCard = document.getElementById('energyCard');
  if (energyCard) {
    const pinnedTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#energySection', start: 'top top', end: 'bottom bottom',
        pin: '#energyPinned', scrub: 0.5,
      },
    });

    // Phase 1: Entrance from below with 3D tilt
    pinnedTl.fromTo(energyCard,
      { y: 200, opacity: 0, scale: 0.6, rotateX: -25 },
      { y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 0.3, ease: 'power3.out' }
    );
    // Phase 2: Overshoot with glow
    pinnedTl.to(energyCard, {
      scale: 1.06,
      boxShadow: '0 50px 100px rgba(0,240,255,0.15), 0 0 80px rgba(168,85,247,0.12)',
      duration: 0.08, ease: 'power2.out',
    });
    // Phase 3-4: Tilt wobble
    pinnedTl.to(energyCard, { rotateY: 8, scale: 1.03, duration: 0.08, ease: 'power2.inOut' });
    pinnedTl.to(energyCard, { rotateY: -8, scale: 1.02, duration: 0.08, ease: 'power2.inOut' });
    // Phase 5: Settle
    pinnedTl.to(energyCard, {
      rotateY: 0, scale: 1,
      boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      duration: 0.12, ease: 'power2.out',
    });
    // Phase 6: Hold
    pinnedTl.to(energyCard, { duration: 0.24 });
    // Phase 7: Spin + exit
    pinnedTl.to(energyCard, {
      rotation: 360, scale: 0.7, y: -150, opacity: 0,
      duration: 0.12, ease: 'power2.in',
    });
  }

  // ★ PUSH-PULL DEPTH DANCE: Scroll-driven depth oscillation
  // bg and card trade depth positions as the user scrolls
  const energyBgWrap = document.getElementById('energyBgWrap');
  const energyCardShadow = document.getElementById('energyCardShadow');
  const energyBgVignette = document.getElementById('energyBgVignette');

  ScrollTrigger.create({
    trigger: '#energySection', start: 'top top', end: 'bottom bottom', scrub: 0.5,
    onUpdate: (self) => {
      const bg = pool.get('energyBg');
      if (!bg) return;
      const p = self.progress;
      const card = pool.get('energyCard');
      const pulse = Math.sin(p * Math.PI);

      // ── PUSH-PULL DEPTH: 5 phases ──
      let cardDepth, bgDepth; // 0=far, 1=close
      if (p < 0.15) {
        // Phase 1: card enters from MAX DEPTH, bg at foreground
        const t = p / 0.15;
        cardDepth = lerp(0.0, 0.3, smoothstep(t));
        bgDepth = lerp(0.9, 0.8, t);
      } else if (p < 0.35) {
        // Phase 2: card approaches, bg retreats — cross at ~25%
        const t = (p - 0.15) / 0.2;
        cardDepth = lerp(0.3, 0.8, smoothstep(t));
        bgDepth = lerp(0.8, 0.3, smoothstep(t));
      } else if (p < 0.6) {
        // Phase 3: HOLD — both moderate, tilt-interactive depth
        const t = (p - 0.35) / 0.25;
        const breathe = Math.sin(t * Math.PI * 2) * 0.15;
        cardDepth = 0.7 + breathe;
        bgDepth = 0.4 - breathe;
      } else if (p < 0.8) {
        // Phase 4: DRAIN — card retreats, bg surges forward
        const t = (p - 0.6) / 0.2;
        cardDepth = lerp(0.7, 0.2, smoothstep(t));
        bgDepth = lerp(0.4, 0.85, smoothstep(t));
      } else {
        // Phase 5: EXIT SPIN — card spirals to distance
        const t = (p - 0.8) / 0.2;
        cardDepth = lerp(0.2, 0.0, smoothstep(t));
        bgDepth = lerp(0.85, 0.5, smoothstep(t));
      }

      // ── Apply depth to params ──
      const bgDensity = lerp(55, 8, bgDepth);
      const cardDensity = lerp(55, 8, cardDepth);

      // Background params
      const bgHue = 270 + p * 80;
      bg.setParams({
        rot4dXW: p * Math.PI * 3 * (bgDepth > cardDepth ? 1 : -0.7),
        rot4dYW: Math.sin(p * Math.PI * 2) * 1.5,
        rot4dZW: p * Math.PI * 0.4,
        hue: bgHue,
        gridDensity: Math.max(8, Math.min(55, bgDensity)),
        intensity: lerp(0.2, 0.85, bgDepth),
        chaos: lerp(0.05, 0.4, bgDepth),
        speed: lerp(0.1, 1.0, bgDepth),
        morphFactor: 0.6 + pulse * 0.5,
      });

      // Card cross-feed
      if (card) {
        card.setParams({
          gridDensity: Math.max(6, Math.min(50, cardDensity)),
          intensity: lerp(0.15, 0.85, cardDepth),
          speed: lerp(0.1, 1.2, cardDepth),
          chaos: lerp(0.02, 0.35, cardDepth),
          rot4dXW: p * Math.PI * 3 * (cardDepth > bgDepth ? 1 : -0.7) + (p > 0.8 ? (p - 0.8) / 0.2 * Math.PI * 4 : 0),
        });
        // Chromatic border driven by rotation
        updateChroma(document.getElementById('energyCard'), card);
      }

      // CSS depth on bg container
      if (energyBgWrap) {
        energyBgWrap.style.transform = `scale(${lerp(0.92, 1.05, bgDepth)})`;
        energyBgWrap.style.filter = bgDepth < 0.3 ? `blur(${lerp(4, 0, bgDepth / 0.3)}px)` : 'none';
      }

      // Card shadow responds to its depth
      updateDepthShadow(energyCardShadow, cardDepth);
      // Bg vignette
      updateVignette(energyBgVignette, bgDensity);

      // CROSS-POINT FLASH: when card and bg are at same depth
      const depthDiff = Math.abs(cardDepth - bgDepth);
      if (depthDiff < 0.1) {
        const flash = (0.1 - depthDiff) / 0.1;
        bg.setParam('chaos', Math.min(0.7, bg.params.chaos + flash * 0.3));
        if (card) card.setParam('chaos', Math.min(0.7, (card.params.chaos || 0) + flash * 0.3));
      }
    },
  });

  // Energy transfer button interaction
  const energyBtn = document.getElementById('energyBtn');
  const energyFill = document.getElementById('energyFill');
  if (energyBtn) {
    let sweeping = false;
    function energySweep() {
      if (sweeping) return;
      sweeping = true;
      const card = pool.get('energyCard');
      const bg = pool.get('energyBg');
      if (!card && !bg) { sweeping = false; return; }

      const tl = gsap.timeline({ onComplete: () => { sweeping = false; } });

      // Drain card → background
      if (card) tl.to(card.params, { intensity: 0.05, gridDensity: 4, chaos: 0.6, hue: 320, duration: 0.8, ease: 'power3.in', onUpdate: () => card.render() }, 0);
      if (bg) tl.to(bg.params, { intensity: 0.8, gridDensity: 55, chaos: 0.5, hue: 180, morphFactor: 1.5, duration: 0.8, ease: 'power2.out', onUpdate: () => bg.render() }, 0);
      tl.to(energyFill, { width: '5%', duration: 0.8, ease: 'power3.in' }, 0);

      // Morph phase
      if (card) tl.to(card.params, { hue: 270, geometry: 5, rot4dXW: Math.PI, duration: 0.6, ease: 'power2.inOut', onUpdate: () => card.render() }, 0.8);
      if (bg) tl.to(bg.params, { hue: 60, geometry: 3, duration: 0.6, ease: 'power2.inOut', onUpdate: () => bg.render() }, 0.8);

      // Card visual squeeze/release
      tl.to('#energyCard', { scale: 0.94, rotateX: 5, borderColor: 'rgba(123,63,242,0.4)', boxShadow: '0 0 60px rgba(123,63,242,0.2)', duration: 0.5, ease: 'power2.in' }, 0);
      tl.to('#energyCard', { scale: 1, rotateX: 0, borderColor: 'rgba(255,255,255,0.06)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)', duration: 0.8, ease: 'elastic.out(1, 0.4)' }, 1.4);

      // Restore
      if (card) tl.to(card.params, { intensity: 0.6, gridDensity: 30, chaos: 0.1, hue: 180, geometry: 7, rot4dXW: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)', onUpdate: () => card.render() }, 1.5);
      if (bg) tl.to(bg.params, { intensity: 0.2, gridDensity: 16, chaos: 0.05, hue: 270, morphFactor: 0.5, geometry: 6, duration: 1.2, ease: 'elastic.out(1, 0.5)', onUpdate: () => bg.render() }, 1.5);
      tl.to(energyFill, { width: '50%', duration: 1, ease: 'elastic.out(1, 0.5)' }, 1.5);
    }

    energyBtn.addEventListener('click', energySweep);
    energyBtn.addEventListener('touchstart', (e) => { e.preventDefault(); energySweep(); });
  }
}

// ─── AGENT — GPU Holographic Background ─────────────────────

export function initAgent(pool) {
  ScrollTrigger.create({
    trigger: '#agentSection', start: 'top 90%', end: 'bottom top',
    onEnter: () => pool.acquire('agent', 'agent-canvas', HolographicAdapter, {
      geometry: 3, hue: 240, gridDensity: 18, speed: 0.4,
      intensity: 0.5, chaos: 0.15, dimension: 3.5, morphFactor: 0.6, saturation: 0.8,
    }),
    onLeave: () => pool.release('agent'),
    onEnterBack: () => pool.acquire('agent', 'agent-canvas', HolographicAdapter, {
      geometry: 3, hue: 240, gridDensity: 18, speed: 0.4,
      intensity: 0.5, chaos: 0.15, dimension: 3.5, morphFactor: 0.6, saturation: 0.8,
    }),
    onLeaveBack: () => pool.release('agent'),
  });

  // Scroll-driven: holographic system evolves as user scrolls through cards
  ScrollTrigger.create({
    trigger: '#agentSection', start: 'top bottom', end: 'bottom top', scrub: 0.5,
    onUpdate: (self) => {
      const agent = pool.get('agent');
      if (!agent) return;
      const p = self.progress;
      const pulse = Math.sin(p * Math.PI);
      agent.setParams({
        rot4dXW: p * Math.PI * 2,
        rot4dYW: Math.sin(p * Math.PI * 2) * 1.0,
        hue: 240 + p * 80 + pulse * 20,
        gridDensity: 18 + pulse * 16,
        intensity: 0.5 + pulse * 0.3,
        speed: 0.4 + pulse * 0.5,
        chaos: 0.15 + p * 0.2,
        morphFactor: 0.6 + pulse * 0.4,
      });
    },
  });
}

// ─── CTA — Dual GPU Finale (Quantum + Faceted dueling) ──────

export function initCTA(pool) {
  // Dual GPU lifecycle: Quantum left + Faceted right
  ScrollTrigger.create({
    trigger: '#ctaSection', start: 'top 90%', end: 'bottom top',
    onEnter: () => {
      pool.acquire('ctaL', 'cta-canvas-left', QuantumAdapter, {
        geometry: 5, hue: 200, gridDensity: 16, speed: 0.3,
        intensity: 0.3, chaos: 0.1, dimension: 3.5, morphFactor: 0.5, saturation: 0.85,
      });
      pool.acquire('ctaR', 'cta-canvas-right', FacetedAdapter, {
        geometry: 7, hue: 320, gridDensity: 20, speed: 0.4,
        intensity: 0.3, chaos: 0.12, dimension: 3.4, morphFactor: 0.6, saturation: 0.9,
      });
    },
    onLeave: () => { pool.release('ctaL'); pool.release('ctaR'); },
    onEnterBack: () => {
      pool.acquire('ctaL', 'cta-canvas-left', QuantumAdapter, {
        geometry: 5, hue: 200, gridDensity: 16, speed: 0.3,
        intensity: 0.3, chaos: 0.1, dimension: 3.5, morphFactor: 0.5, saturation: 0.85,
      });
      pool.acquire('ctaR', 'cta-canvas-right', FacetedAdapter, {
        geometry: 7, hue: 320, gridDensity: 20, speed: 0.4,
        intensity: 0.3, chaos: 0.12, dimension: 3.4, morphFactor: 0.6, saturation: 0.9,
      });
    },
    onLeaveBack: () => { pool.release('ctaL'); pool.release('ctaR'); },
  });

  // ★ 3-ACT DEPTH STORY: opposition → crossover → unity
  const ctaSeam = document.getElementById('ctaSeam');
  const ctaVignette = document.getElementById('ctaVignette');
  const ctaLeftWrap = document.getElementById('ctaGpuLeft');
  const ctaRightWrap = document.getElementById('ctaGpuRight');

  ScrollTrigger.create({
    trigger: '#ctaSection', start: 'top bottom', end: 'bottom bottom', scrub: 1.0,
    onUpdate: (self) => {
      const ctaL = pool.get('ctaL');
      const ctaR = pool.get('ctaR');
      if (!ctaL && !ctaR) return;
      const p = self.progress;
      const pulse = Math.sin(p * Math.PI);

      // ── ACT I (0-40%): MAXIMUM SEPARATION — opposite depth extremes
      // ── ACT II (40-70%): DEPTH CROSSOVER — systems swap depth positions
      // ── ACT III (70-100%): UNITY — converge to same params + depth
      let depthL, depthR;
      if (p < 0.4) {
        // L=FOREGROUND, R=BACKGROUND
        const t = p / 0.4;
        depthL = lerp(0.9, 0.85, t);
        depthR = lerp(0.1, 0.15, t);
      } else if (p < 0.7) {
        // CROSSOVER: L retreats, R advances
        const t = (p - 0.4) / 0.3;
        const s = smoothstep(t);
        depthL = lerp(0.85, 0.15, s);
        depthR = lerp(0.15, 0.85, s);
      } else {
        // UNITY: both converge to same depth
        const t = (p - 0.7) / 0.3;
        const s = smoothstep(t);
        depthL = lerp(0.15, 0.55, s);
        depthR = lerp(0.85, 0.55, s);
      }

      const denL = lerp(50, 8, depthL);
      const denR = lerp(50, 8, depthR);
      const conv = smoothstep(clamp01((p - 0.7) / 0.3));
      const unifiedHue = 220;
      const unifiedGeo = 11;

      // CROSSOVER CHAOS: maximum energy at the crossing point (~55%)
      const crossoverIntensity = (p > 0.45 && p < 0.65)
        ? Math.sin((p - 0.45) / 0.2 * Math.PI) * 0.4 : 0;

      if (ctaL) {
        const hueL = lerp(200, unifiedHue, conv);
        ctaL.setParams({
          geometry: p < 0.3 ? 5 : p < 0.6 ? 2 : unifiedGeo,
          hue: hueL + pulse * 20 * (1 - conv),
          rot4dXW: p * Math.PI * 3,
          rot4dYW: Math.sin(p * Math.PI * 2) * 1.5 * (1 - conv),
          rot4dZW: p * Math.PI * 0.5,
          gridDensity: Math.max(6, Math.min(55, denL)),
          intensity: lerp(0.2, 0.85, depthL),
          speed: lerp(0.15, 1.0, depthL),
          chaos: lerp(0.02, 0.3, depthL) + crossoverIntensity,
          morphFactor: 0.5 + p * 0.6,
          saturation: 0.85 + conv * 0.1,
        });
      }
      if (ctaR) {
        const hueR = lerp(320, unifiedHue, conv);
        ctaR.setParams({
          geometry: p < 0.3 ? 7 : p < 0.6 ? 4 : unifiedGeo,
          hue: hueR - pulse * 20 * (1 - conv),
          rot4dXW: -p * Math.PI * 3 * (1 - conv) + p * Math.PI * 3 * conv,
          rot4dYW: Math.cos(p * Math.PI * 2) * 1.5 * (1 - conv),
          rot4dZW: -p * Math.PI * 0.5 * (1 - conv),
          gridDensity: Math.max(6, Math.min(55, denR)),
          intensity: lerp(0.2, 0.85, depthR),
          speed: lerp(0.15, 1.0, depthR),
          chaos: lerp(0.02, 0.3, depthR) + crossoverIntensity,
          morphFactor: 0.6 + p * 0.5,
          saturation: 0.9 + conv * 0.05,
        });
      }

      // CSS depth on containers
      if (ctaLeftWrap) {
        ctaLeftWrap.style.filter = depthL < 0.3 ? `blur(${lerp(4, 0, depthL / 0.3)}px)` : 'none';
      }
      if (ctaRightWrap) {
        ctaRightWrap.style.filter = depthR < 0.3 ? `blur(${lerp(4, 0, depthR / 0.3)}px)` : 'none';
      }

      // Diagonal split morphs toward vertical during convergence
      if (ctaLeftWrap && ctaRightWrap) {
        const topR = lerp(100, 50, conv);
        const botL = lerp(0, 50, conv);
        ctaLeftWrap.style.clipPath = `polygon(0 0, ${topR}% 0, ${botL}% 100%, 0 100%)`;
        ctaRightWrap.style.clipPath = `polygon(${topR}% 0, 100% 0, 100% 100%, ${botL}% 100%)`;
      }

      // Glow seam: maximum at crossover, fades at unity
      updateGlowSeam(ctaSeam, ctaL, ctaR);

      // During crossover blend moment: overlap + screen blend
      if (p > 0.5 && p < 0.6 && ctaLeftWrap && ctaRightWrap) {
        const blendP = (p - 0.5) / 0.1;
        const overlap = Math.sin(blendP * Math.PI) * 0.15;
        ctaLeftWrap.style.opacity = `${1 - overlap}`;
        ctaRightWrap.style.opacity = `${1 - overlap}`;
      } else {
        if (ctaLeftWrap) ctaLeftWrap.style.opacity = '1';
        if (ctaRightWrap) ctaRightWrap.style.opacity = '1';
      }

      // Vignette: tightens during maximum depth separation, relaxes at unity
      const maxDenBoth = Math.max(denL, denR);
      updateVignette(ctaVignette, maxDenBoth);
    },
  });
}

// ─── Section Reveal Animations ──────────────────────────────

// ─── SECTION TRANSITION PORTALS (replaces old faint veil system) ─────
// CSS clip-path portals between sections: a growing shape reveals the next section
// with glowing edges instead of a confusing faint glassmorphic square.
// Also pulses divider gradients during transitions.

export function initSectionVeils() {
  // Portal transitions at GPU swap boundaries
  const portals = [
    {
      trigger: '#divider-hero-morph',
      nextSection: '#morphSection',
      hue: 220,
    },
    {
      trigger: '#divider-morph-playground',
      nextSection: '#playgroundSection',
      hue: 280,
    },
    {
      trigger: '#divider-playground-triptych',
      nextSection: '#triptychSection',
      hue: 190,
    },
    {
      trigger: '#divider-cascade-energy',
      nextSection: '#energySection',
      hue: 310,
    },
  ];

  // Hide the old veil entirely — we use per-section effects instead
  const oldVeil = document.getElementById('sectionVeil');
  if (oldVeil) oldVeil.style.display = 'none';

  portals.forEach(({ trigger, nextSection, hue }) => {
    const divider = document.querySelector(trigger);
    const next = document.querySelector(nextSection);
    if (!divider) return;

    // Divider glow pulse during scroll-through
    ScrollTrigger.create({
      trigger: divider,
      start: 'top 95%',
      end: 'bottom 5%',
      scrub: 0.2,
      onUpdate: (self) => {
        const p = self.progress;
        const bell = Math.sin(p * Math.PI);
        const intensity = bell * bell;

        // SVG path glow via filter
        const svg = divider.querySelector('svg');
        if (svg) {
          svg.style.filter = intensity > 0.05
            ? `drop-shadow(0 0 ${12 * intensity}px hsla(${hue}, 70%, 55%, ${intensity * 0.4}))`
            : 'none';
        }

        // Next section clip-path reveal: grows from center point
        if (next && intensity > 0.01) {
          const reveal = smoothstep(clamp01((p - 0.3) / 0.7));
          if (reveal > 0 && reveal < 1) {
            next.style.clipPath = `circle(${reveal * 120}% at 50% 0%)`;
          } else if (reveal >= 1) {
            next.style.clipPath = '';
          }
        }
      },
      onLeave: () => {
        if (next) next.style.clipPath = '';
        const svg = divider.querySelector('svg');
        if (svg) svg.style.filter = 'none';
      },
      onLeaveBack: () => {
        if (next) next.style.clipPath = '';
        const svg = divider.querySelector('svg');
        if (svg) svg.style.filter = 'none';
      },
    });
  });
}

// ─── SCROLL VELOCITY BURST (Event 4) ─────────────────────────
// Fast scrolling triggers chaos/speed burst on all visible AmbientLattice renderers

export function initScrollVelocityBurst(c2d) {
  let lastScroll = 0;
  let lastTime = 0;
  let burstActive = false;
  let burstCooldown = 0;
  const VELOCITY_THRESHOLD = 2500; // px/s
  const BURST_DECAY = 500; // ms

  const tick = () => {
    const now = performance.now();
    const scrollY = window.scrollY || window.pageYOffset;
    const dt = now - lastTime;

    if (dt > 0 && lastTime > 0) {
      const velocity = Math.abs(scrollY - lastScroll) / (dt / 1000);

      if (velocity > VELOCITY_THRESHOLD && !burstActive && now > burstCooldown) {
        burstActive = true;
        burstCooldown = now + BURST_DECAY + 1000;
        const burstFactor = Math.min(1, velocity / 5000);

        // Apply burst to all AmbientLattice renderers
        const origParams = new Map();
        for (const [key, inst] of c2d.entries()) {
          origParams.set(key, {
            chaos: inst.params.chaos,
            speed: inst.params.speed,
            intensity: inst.params.intensity,
          });
          inst.setParams({
            chaos: Math.min(1, inst.params.chaos + burstFactor * 0.4),
            speed: inst.params.speed * (1 + burstFactor * 1.5),
            intensity: Math.min(1, inst.params.intensity + burstFactor * 0.2),
          });
        }

        // CSS burst
        document.documentElement.style.setProperty('--burst-intensity', burstFactor.toFixed(2));

        // Decay back
        setTimeout(() => {
          for (const [key, orig] of origParams.entries()) {
            const inst = c2d.get(key);
            if (inst) inst.setParams(orig);
          }
          document.documentElement.style.setProperty('--burst-intensity', '0');
          burstActive = false;
        }, BURST_DECAY);
      }
    }

    lastScroll = scrollY;
    lastTime = now;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ─── PHASE SHIFT BRIDGES (Event 6) ─────────────────────────
// Between triptych→cascade and cascade→energy: slow structure build → snap → chaos settle

export function initPhaseShiftBridges(pool, c2d) {
  // Bridge 1: Between triptych exit and cascade
  ScrollTrigger.create({
    trigger: '#triptychSection',
    start: '80% top',
    end: 'bottom top',
    scrub: 0.3,
    onUpdate: (self) => {
      const p = self.progress;
      // Structure build: all 3 triptych GPU systems crystallize together
      const triL = pool.get('triLeft');
      const triC = pool.get('triCenter');
      const triR = pool.get('triRight');
      const sp = smoothstep(p);
      if (triL) {
        triL.setParams({
          gridDensity: lerp(22, 55, sp),
          speed: lerp(0.4, 0.08, sp),
          chaos: lerp(0.15, 0.01, sp),
          intensity: lerp(0.65, 0.9, sp),
        });
      }
      if (triC) {
        triC.setParams({
          gridDensity: lerp(20, 50, sp),
          speed: lerp(0.5, 0.06, sp),
          chaos: lerp(0.1, 0.005, sp),
          intensity: lerp(0.5, 0.85, sp),
        });
      }
      if (triR) {
        triR.setParams({
          gridDensity: lerp(18, 50, sp),
          speed: lerp(0.5, 0.1, sp),
          chaos: lerp(0.2, 0.02, sp),
          intensity: lerp(0.65, 0.85, sp),
        });
      }
    },
  });

  // Bridge 2: Cascade entrance snap
  ScrollTrigger.create({
    trigger: '#cascadeSection',
    start: 'top 90%',
    end: 'top 60%',
    scrub: 0.2,
    onUpdate: (self) => {
      const p = self.progress;
      // Snap: cascade cards get a brief chaos burst at entrance
      const snap = p > 0.4 && p < 0.7;
      if (snap) {
        for (let i = 0; i < 6; i++) {
          const inst = c2d.get(`cas${i}`);
          if (inst) {
            inst.setParams({
              chaos: 0.6 * (1 - Math.abs(p - 0.55) / 0.15),
              speed: 2.0 * (1 - Math.abs(p - 0.55) / 0.15),
            });
          }
        }
      }
    },
  });
}

// ─── SPEED CRESCENDO → SILENCE (Event 14) ─────────────────
// Pre-CTA: all visible elements accelerate, then instant silence, then gentle CTA fade

export function initSpeedCrescendo(pool) {
  ScrollTrigger.create({
    trigger: '#agentSection',
    start: '60% top',
    end: 'bottom top',
    scrub: 0.4,
    onUpdate: (self) => {
      const p = self.progress;

      // Phase A (0-80%): EXPONENTIAL BUILD — cubic acceleration
      if (p < 0.8) {
        const build = p / 0.8;
        const agent = pool.get('agent');
        if (agent) {
          exponentialBuild(build, agent);
          // Additional rotation drama on top
          agent.setParam('rot4dXW', build * Math.PI * 4);
          agent.setParam('rot4dYW', Math.sin(build * Math.PI * 3) * 2);
        }
        document.documentElement.style.setProperty('--crescendo-vignette', (Math.pow(build, 2) * 0.35).toFixed(2));
      }

      // Phase B (80-88%): THE SILENCE — instant death
      if (p >= 0.8 && p < 0.88) {
        const agent = pool.get('agent');
        if (agent) {
          agent.setParams({ speed: 0, chaos: 0, intensity: 0.02, gridDensity: 4 });
        }
        document.documentElement.style.setProperty('--crescendo-vignette', '0');
        document.documentElement.style.setProperty('--silence-blackout', '1');
      }

      // Phase C (88-100%): LOGARITHMIC CALM — gentle rebirth
      if (p >= 0.88) {
        const rebirth = (p - 0.88) / 0.12;
        const agent = pool.get('agent');
        if (agent) {
          logarithmicCalm(1 - rebirth, agent);
          // Override to gentler values for rebirth
          agent.setParams({
            speed: rebirth * 0.3,
            intensity: rebirth * 0.35,
            gridDensity: 8 + rebirth * 10,
            chaos: rebirth * 0.12,
          });
        }
        document.documentElement.style.setProperty('--silence-blackout', (1 - smoothstep(rebirth)).toFixed(2));
      }
    },
    onLeave: () => {
      document.documentElement.style.setProperty('--crescendo-vignette', '0');
      document.documentElement.style.setProperty('--silence-blackout', '0');
    },
    onLeaveBack: () => {
      document.documentElement.style.setProperty('--crescendo-vignette', '0');
      document.documentElement.style.setProperty('--silence-blackout', '0');
    },
  });
}

export function initSectionReveals() {
  // ── data-animate: 3D depth reveal (VISUAL-CODEX: 3D transform pattern) ──
  const reveals = document.querySelectorAll('[data-animate]');
  reveals.forEach(el => {
    gsap.from(el, {
      y: 60, opacity: 0, rotateX: 8, scale: 0.97,
      filter: 'blur(4px)',
      duration: 1.0, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 82%', once: true },
    });
  });

  // ── Agent cards: center-based stagger (VISUAL-CODEX: stagger pattern) ──
  const agentCards = document.querySelectorAll('.agent-card');
  if (agentCards.length > 0) {
    gsap.from(agentCards, {
      y: 50, opacity: 0, scale: 0.92, rotateY: -5,
      duration: 0.8,
      stagger: { amount: 0.5, from: 'center' },
      ease: 'power3.out',
      scrollTrigger: { trigger: '.agent-grid', start: 'top 80%', once: true },
    });
  }

  // ── Code blocks: blur cascade reveal (VISUAL-CODEX: filter cascade) ──
  const codeBlocks = document.querySelectorAll('.code-block, .agent-tools');
  codeBlocks.forEach((block, i) => {
    gsap.from(block, {
      y: 30, opacity: 0, scale: 0.97,
      filter: 'blur(6px) brightness(0.7)',
      duration: 0.8, delay: i * 0.1,
      ease: 'power2.out',
      scrollTrigger: { trigger: block, start: 'top 85%', once: true },
    });
  });

  // ── CTA: three-phase entrance (VISUAL-CODEX: three-phase animation) ──
  const ctaContent = document.querySelector('.cta-content');
  if (ctaContent) {
    const ctaTl = gsap.timeline({
      scrollTrigger: { trigger: '#ctaSection', start: 'top 70%', once: true },
    });
    // Phase 1: fade up from depth
    ctaTl.from(ctaContent, {
      y: 100, opacity: 0, scale: 0.9, rotateX: 5,
      filter: 'blur(8px)',
      duration: 0.8, ease: 'power3.out',
    });
    // Phase 2: overshoot settle
    ctaTl.to(ctaContent, {
      scale: 1.02, duration: 0.2, ease: 'power2.out',
    });
    // Phase 3: final position
    ctaTl.to(ctaContent, {
      scale: 1, filter: 'blur(0px)',
      duration: 0.3, ease: 'power2.inOut',
    });
  }

  // ── Playground controls: wave stagger (VISUAL-CODEX: stagger suite) ──
  const ctrlGroups = document.querySelectorAll('.ctrl-group');
  if (ctrlGroups.length > 0) {
    gsap.from(ctrlGroups, {
      y: 25, opacity: 0, scale: 0.95,
      duration: 0.5,
      stagger: { amount: 0.6, from: 'start' },
      ease: 'back.out(1.2)',
      scrollTrigger: { trigger: '#playgroundControls', start: 'top 85%', once: true },
    });
  }

  // ── Triptych stats: counter-up animation ──
  document.querySelectorAll('.stat-number').forEach(el => {
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => {
        gsap.from(el, {
          scale: 0.5, opacity: 0, y: 20,
          duration: 0.6, ease: 'back.out(2)',
        });
      },
    });
  });

  // ── Section dividers: subtle parallax (VISUAL-CODEX: parallax depth) ──
  document.querySelectorAll('.section-divider').forEach(div => {
    gsap.to(div, {
      y: -15, ease: 'none',
      scrollTrigger: {
        trigger: div, start: 'top bottom', end: 'bottom top', scrub: 1.5,
      },
    });
  });

  // ── Footer ──
  const footer = document.querySelector('footer');
  if (footer) {
    gsap.from(footer, {
      y: 30, opacity: 0,
      duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: footer, start: 'top 92%', once: true },
    });
  }

  // ── Divider glow coordination: scroll progress drives --divider-glow ──
  document.querySelectorAll('.section-divider[id]').forEach(divider => {
    ScrollTrigger.create({
      trigger: divider, start: 'top 90%', end: 'bottom 10%', scrub: 0.2,
      onUpdate: (self) => {
        const bell = Math.sin(self.progress * Math.PI);
        divider.style.setProperty('--divider-glow', (bell * bell * 0.35).toFixed(3));
      },
      onLeave: () => divider.style.setProperty('--divider-glow', '0'),
      onLeaveBack: () => divider.style.setProperty('--divider-glow', '0'),
    });
  });

  // ── Canvas wrapper breathing: activate when in viewport ──
  document.querySelectorAll('.canvas-wrap').forEach(wrap => {
    ScrollTrigger.create({
      trigger: wrap, start: 'top bottom', end: 'bottom top',
      onEnter: () => wrap.classList.add('breathing'),
      onLeave: () => wrap.classList.remove('breathing'),
      onEnterBack: () => wrap.classList.add('breathing'),
      onLeaveBack: () => wrap.classList.remove('breathing'),
    });
  });

}
