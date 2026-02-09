/**
 * GSAP Scroll Choreography — Premium Edition v2
 *
 * Architecture:
 *   Opening (800vh) → Hero → Morph (1200vh) → Playground → Triptych → Cascade → Energy → Agent → CTA
 *
 * Parameter coordination philosophy:
 *   - Density DROPS as visual elements expand (inverse relationship)
 *   - Speed and chaos RISE during dramatic moments, SETTLE in calm phases
 *   - Rotations accumulate continuously across stages for organic motion
 *   - Hue shifts follow emotional arcs (cool→warm→spectral→calm)
 *
 * Scrub hierarchy:
 *   0.1  — progress bar (instant feedback)
 *   0.3  — hero exit (responsive)
 *   0.5  — cascade, energy card (fluid)
 *   0.6  — morph experience (dramatic but not laggy)
 *   1.0  — CTA, ambient (natural parallax)
 */

import { QuantumAdapter, HolographicAdapter, FacetedAdapter, Canvas2DRenderer } from './adapters.js';
import { morphStages, trinityParams, energyCardParams, openingParams } from './config.js';

// ─── Morph State ─────────────────────────────────────────────
const morphFactories = [QuantumAdapter, HolographicAdapter, FacetedAdapter];
let morphCurrent = -1;
let morphSwapLock = false;
let morphLastStage = -1;

// ─── Helpers ──────────────────────────────────────────────────
function smoothstep(p) { return p * p * (3 - 2 * p); }
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp01(v) { return Math.max(0, Math.min(1, v)); }

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

  gsap.to(flash, { opacity: 0.85, duration: 0.08, ease: 'power2.in', onComplete: () => {
    createMorphSystem(pool, newIdx);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        gsap.to(flash, { opacity: 0, duration: 0.2, ease: 'power2.out', onComplete: () => {
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

      // ── Canvas parameter evolution across all phases ──
      if (adapter) {
        const wave = Math.sin(p * Math.PI * 6);
        adapter.setParams({
          intensity: 0.3 + smoothstep(p) * 0.55 + Math.sin(p * Math.PI) * 0.1,
          rot4dXW: p * Math.PI * 4,
          rot4dYW: Math.sin(p * Math.PI * 2) * 2,
          rot4dZW: p * Math.PI * 0.8,
          hue: 220 + p * 100 + wave * 15,
          gridDensity: 22 + Math.sin(p * Math.PI * 3) * 10,
          chaos: 0.05 + smoothstep(clamp01((p - 0.3) / 0.4)) * 0.35,
          speed: 0.3 + smoothstep(p) * 0.8,
          morphFactor: 0.6 + Math.sin(p * Math.PI * 2) * 0.4,
          dimension: 3.8 - p * 0.4,
          geometry: p < 0.2 ? 11 : p < 0.5 ? 3 : p < 0.75 ? 4 : 7,
        });
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

      // ── MORPH CARD CHOREOGRAPHY ──
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
// Two Canvas2D visualizer columns + center content
// Each column scrolls at a different parallax rate
// Visualizer parameters shift smoothly as you scroll through

export function initTriptych(c2d) {
  const left = document.getElementById('triptychLeft');
  const right = document.getElementById('triptychRight');

  ScrollTrigger.create({
    trigger: '#triptychSection', start: 'top bottom', end: 'bottom top',
    scrub: 0.5,
    onUpdate: (self) => {
      const p = self.progress;

      // Parallax rates: left column faster, right column slower
      if (left) left.style.transform = `translateY(${(p - 0.5) * -120}px)`;
      if (right) right.style.transform = `translateY(${(p - 0.5) * -60}px)`;

      // ── Left visualizer: density sweep UP, warm hue arc ──
      const triL = c2d.get('triLeft');
      if (triL) {
        const wave = Math.sin(p * Math.PI * 4);
        const pulse = Math.sin(p * Math.PI);
        // Density sweeps from sparse→dense across section
        const densitySweep = 10 + p * 40;
        triL.setParams({
          geometry: p < 0.3 ? 2 : p < 0.6 ? 3 : p < 0.85 ? 10 : 7,
          hue: 195 + p * 100 + wave * 25,
          rot4dXW: p * Math.PI * 4,
          rot4dYW: Math.sin(p * Math.PI * 2) * 2.0,
          rot4dZW: p * Math.PI * 0.6,
          gridDensity: densitySweep + wave * 6,
          intensity: 0.65 + pulse * 0.2 + wave * 0.05,
          chaos: 0.15 + p * 0.25,
          morphFactor: 0.6 + Math.sin(p * Math.PI * 2) * 0.4,
          speed: 0.4 + pulse * 0.6,
          saturation: 0.85 + pulse * 0.1,
        });
      }

      // ── Right visualizer: density sweep DOWN, cool hue arc (opposing) ──
      const triR = c2d.get('triRight');
      if (triR) {
        const wave = Math.sin(p * Math.PI * 3 + 1.5);
        const pulse = Math.sin(p * Math.PI + 0.5);
        // Density sweeps from dense→sparse (opposing left)
        const densitySweep = 50 - p * 35;
        triR.setParams({
          geometry: p < 0.25 ? 12 : p < 0.5 ? 4 : p < 0.75 ? 20 : 5,
          hue: 310 - p * 130 + wave * 30,
          rot4dXW: -p * Math.PI * 3,
          rot4dYW: Math.cos(p * Math.PI * 2) * 1.8,
          rot4dZW: -p * Math.PI * 0.4,
          gridDensity: densitySweep + wave * 5,
          intensity: 0.65 + pulse * 0.2 + wave * 0.05,
          chaos: 0.2 + p * 0.2,
          morphFactor: 0.7 + Math.sin(p * Math.PI * 2 + 1) * 0.35,
          speed: 0.5 + pulse * 0.5,
          saturation: 0.9 + pulse * 0.08,
        });
      }
    },
  });
}

// ─── CASCADE — Morphing Cards with Glow Leak ────────────────
// Cards morph in size, glow leaks beyond borders
// Active card: scale up (1.12), glow intensifies, density DROPS
// Adjacent: smaller hue bleed, subtle scale
// Inactive: normal state

export function initCascade(c2d) {
  const cascadeCards = document.querySelectorAll('.cascade-card');
  const cascadeTrack = document.getElementById('cascadeTrack');

  // Stagger entrance
  ScrollTrigger.create({
    trigger: '#cascadeSection', start: 'top 75%', once: true,
    onEnter: () => {
      gsap.to('.cascade-card', {
        opacity: 1, y: 0, scale: 1,
        duration: 0.9, stagger: 0.15,
        ease: 'power3.out',
      });
    },
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
    const cardW = 360 + 32;
    const totalScroll = (cascadeCards.length - 1) * cardW;

    ScrollTrigger.create({
      trigger: '#cascadeSection', start: 'top top', end: 'bottom bottom',
      pin: '#cascadePinned', scrub: 0.5,
      onUpdate: (self) => {
        const p = self.progress;
        cascadeTrack.style.transform = `translateX(${-p * totalScroll}px)`;

        const activeIdx = Math.min(Math.floor(p * cascadeCards.length), cascadeCards.length - 1);
        const activeHue = parseInt(cascadeCards[activeIdx].dataset.hue);
        const localP = (p * cascadeCards.length) - activeIdx;
        const pulse = Math.sin(localP * Math.PI);

        cascadeCards.forEach((card, i) => {
          const inst = c2d.get(`cas${i}`);
          if (!inst) return;
          const hue = parseInt(card.dataset.hue);

          if (i === activeIdx) {
            // ── ACTIVE CARD: scale up, glow leaks, density drops, dramatic params ──
            const scaleVal = 1 + pulse * 0.14;
            card.dataset.scrollTransform = `scale(${scaleVal})`;
            card.classList.add('leaking');
            card.style.setProperty('--card-glow', `hsla(${hue}, 75%, 50%, ${0.2 + pulse * 0.15})`);

            inst.setParams({
              rot4dXW: localP * Math.PI * 1.5,
              rot4dYW: Math.sin(localP * Math.PI) * 1.2,
              rot4dZW: localP * 0.5,
              intensity: 0.85 + pulse * 0.15,
              morphFactor: 0.8 + localP * 0.8,
              // Density DROPS as card scales up (inverse coordination)
              gridDensity: Math.max(6, 22 - pulse * 14),
              // Speed ramps up significantly
              speed: 0.7 + pulse * 1.2,
              chaos: 0.18 + pulse * 0.35,
              // Hue shifts during active phase
              hue: hue + pulse * 30,
              saturation: 0.9 + pulse * 0.1,
            });
          } else if (Math.abs(i - activeIdx) === 1) {
            // ── ADJACENT: hue bleed, mild scale, complementary params ──
            const bleedAmount = i < activeIdx ? (1 - localP) * 0.35 : localP * 0.35;
            card.dataset.scrollTransform = `scale(${1 + bleedAmount * 0.06})`;
            card.classList.toggle('leaking', bleedAmount > 0.15);
            if (bleedAmount > 0.15) {
              card.style.setProperty('--card-glow', `hsla(${hue}, 60%, 45%, ${bleedAmount * 0.2})`);
            }

            inst.setParams({
              hue: hue + (activeHue - hue) * bleedAmount,
              intensity: 0.7 + bleedAmount * 0.1,
              gridDensity: 22 - bleedAmount * 6,
              speed: 0.7 + bleedAmount * 0.3,
              chaos: 0.18 + bleedAmount * 0.1,
              rot4dXW: bleedAmount * 0.5,
            });
          } else {
            // ── INACTIVE: still visually present, just calmer ──
            card.dataset.scrollTransform = 'scale(0.97)';
            card.classList.remove('leaking');

            inst.setParams({
              intensity: 0.6,
              gridDensity: 22,
              speed: 0.6,
              chaos: 0.12,
              saturation: 0.85,
            });
          }
        });
      },
    });
  }
}

// ─── ENERGY TRANSFER ────────────────────────────────────────

export function initEnergy(pool, c2d) {
  // Lazy GPU lifecycle for the card
  ScrollTrigger.create({
    trigger: '#energySection', start: 'top 80%', end: 'bottom top',
    onEnter: () => pool.acquire('energyCard', 'energy-card-canvas', FacetedAdapter, energyCardParams),
    onLeave: () => pool.release('energyCard'),
    onEnterBack: () => pool.acquire('energyCard', 'energy-card-canvas', FacetedAdapter, energyCardParams),
    onLeaveBack: () => pool.release('energyCard'),
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

  // Scroll-driven background params
  ScrollTrigger.create({
    trigger: '#energySection', start: 'top top', end: 'bottom bottom', scrub: 0.5,
    onUpdate: (self) => {
      const bg = c2d.get('energyBg');
      if (!bg) return;
      const p = self.progress;
      bg.setParams({
        rot4dXW: p * 4,
        hue: 270 + p * 60,
        gridDensity: 16 + p * 14,
        intensity: 0.2 + Math.sin(p * Math.PI) * 0.2,
        chaos: 0.05 + p * 0.15,
      });
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
      const bg = c2d.get('energyBg');
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

// ─── CTA ────────────────────────────────────────────────────

export function initCTA(c2d) {
  ScrollTrigger.create({
    trigger: '#ctaSection', start: 'top bottom', end: 'bottom bottom', scrub: 1.0,
    onUpdate: (self) => {
      const cta = c2d.get('cta');
      if (!cta) return;
      cta.setParams({ rot4dXW: self.progress * 2, hue: 160 + self.progress * 80, intensity: 0.2 + self.progress * 0.1 });
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
// Fast scrolling triggers chaos/speed burst on all visible Canvas2D renderers

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

        // Apply burst to all Canvas2D renderers
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

export function initPhaseShiftBridges(c2d) {
  // Bridge 1: Between triptych exit and cascade
  ScrollTrigger.create({
    trigger: '#triptychSection',
    start: '80% top',
    end: 'bottom top',
    scrub: 0.3,
    onUpdate: (self) => {
      const p = self.progress;
      // Structure build: triptych visuals crystallize
      const triL = c2d.get('triLeft');
      const triR = c2d.get('triRight');
      if (triL) {
        triL.setParams({
          gridDensity: lerp(22, 55, smoothstep(p)),
          speed: lerp(0.4, 0.08, smoothstep(p)),
          chaos: lerp(0.15, 0.01, smoothstep(p)),
          intensity: lerp(0.65, 0.9, smoothstep(p)),
        });
      }
      if (triR) {
        triR.setParams({
          gridDensity: lerp(18, 50, smoothstep(p)),
          speed: lerp(0.5, 0.1, smoothstep(p)),
          chaos: lerp(0.2, 0.02, smoothstep(p)),
          intensity: lerp(0.65, 0.85, smoothstep(p)),
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

export function initSpeedCrescendo(c2d) {
  ScrollTrigger.create({
    trigger: '#agentSection',
    start: '60% top',
    end: 'bottom top',
    scrub: 0.4,
    onUpdate: (self) => {
      const p = self.progress;

      // Phase A (0-80%): The Build
      if (p < 0.8) {
        const build = p / 0.8;
        const agent = c2d.get('agent');
        if (agent) {
          agent.setParams({
            speed: 0.3 * (1 + build * 4),
            chaos: 0.2 + build * 0.6,
            intensity: 0.45 + build * 0.4,
            gridDensity: 16 + build * 30,
          });
        }
        // Vignette effect via CSS
        document.documentElement.style.setProperty('--crescendo-vignette', (build * 0.3).toFixed(2));
      }

      // Phase B (80-88%): THE SILENCE
      if (p >= 0.8 && p < 0.88) {
        const agent = c2d.get('agent');
        if (agent) {
          agent.setParams({ speed: 0, chaos: 0, intensity: 0.05, gridDensity: 4 });
        }
        document.documentElement.style.setProperty('--crescendo-vignette', '0');
        document.documentElement.style.setProperty('--silence-blackout', '1');
      }

      // Phase C (88-100%): Gentle rebirth
      if (p >= 0.88) {
        const rebirth = (p - 0.88) / 0.12;
        const agent = c2d.get('agent');
        if (agent) {
          agent.setParams({
            speed: rebirth * 0.2,
            intensity: rebirth * 0.3,
            gridDensity: 8 + rebirth * 8,
            chaos: rebirth * 0.1,
          });
        }
        document.documentElement.style.setProperty('--silence-blackout', (1 - rebirth).toFixed(2));
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
}
