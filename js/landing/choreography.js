/**
 * GSAP Scroll Choreography
 *
 * Each section drives VIB3+ shader parameters via scroll position,
 * demonstrating how to animate 4D geometry in response to user interaction.
 *
 * Expects gsap & ScrollTrigger as globals (loaded from CDN).
 */

import { QuantumAdapter, HolographicAdapter, FacetedAdapter, Canvas2DRenderer } from './adapters.js';
import { trinityParams, energyCardParams } from './config.js';

const triFactories = [QuantumAdapter, HolographicAdapter, FacetedAdapter];
let triCurrent = -1;
let triSwapLock = false;

// ─── Helpers ──────────────────────────────────────────────────

function smoothstep(p) { return p * p * (3 - 2 * p); }

function updateTriLabels(activeIdx) {
  ['#triQLbl', '#triHLbl', '#triFLbl'].forEach((sel, i) => {
    const h2 = document.querySelector(`${sel} h2`);
    const p = document.querySelector(`${sel} p`);
    if (i === activeIdx) {
      gsap.to(h2, { opacity: 1, y: 0, duration: 0.7, delay: 0.12, ease: 'power3.out' });
      gsap.to(p, { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: 'power2.out' });
    } else {
      gsap.to(h2, { opacity: 0, y: -20, duration: 0.25, ease: 'power2.in' });
      gsap.to(p, { opacity: 0, y: -10, duration: 0.2, ease: 'power2.in' });
    }
  });
}

function updateTriCounter(idx) {
  const counter = document.getElementById('triCounter');
  if (counter) counter.innerHTML = `<span class="active">0${idx + 1}</span> / 03`;
  document.querySelectorAll('.ring-dot').forEach((d, i) => {
    d.classList.toggle('active', i === idx);
  });
}

function createTriSystem(pool, idx) {
  if (pool.has('trinity')) pool.release('trinity');
  const adapter = pool.acquire('trinity', 'trinity-canvas', triFactories[idx], trinityParams[idx]);
  triCurrent = adapter ? idx : -1;
  return adapter;
}

function swapTriSystem(pool, newIdx) {
  if (newIdx === triCurrent || triSwapLock) return;
  triSwapLock = true;
  const flash = document.getElementById('trinityFlash');

  updateTriLabels(newIdx);
  updateTriCounter(newIdx);

  gsap.to(flash, { opacity: 0.9, duration: 0.1, ease: 'power2.in', onComplete: () => {
    createTriSystem(pool, newIdx);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        gsap.to(flash, { opacity: 0, duration: 0.25, ease: 'power2.out', onComplete: () => {
          triSwapLock = false;
        }});
      });
    });
  }});
}

// ─── Section Initializers ─────────────────────────────────────

export function initScrollProgress() {
  gsap.to('#scrollProgress', {
    scaleX: 1, ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.1 },
  });
}

export function initHero(pool) {
  // Text entrance animation
  const tl = gsap.timeline({ delay: 0.3 });
  tl.to('#heroBadge', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });

  const title = document.getElementById('heroTitle');
  const text = title.textContent;
  title.innerHTML = text.split('').map(c =>
    c === ' ' ? ' ' : `<span class="char">${c}</span>`
  ).join('');
  tl.to('#heroTitle .char', { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power4.out' }, '-=0.4');
  tl.to('#heroSub', { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.3');
  tl.to('#heroSystemLabel', { opacity: 1, duration: 0.5 }, '-=0.3');
  tl.to('#heroScroll', { opacity: 1, duration: 0.6 }, '-=0.2');

  // Scroll-driven parameter choreography: stillness → first rotation → dimensional awakening
  ScrollTrigger.create({
    trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.3,
    onUpdate: (self) => {
      const p = self.progress;
      const hero = pool.get('hero');
      if (!hero) return;
      const ease = smoothstep(p);
      const late = Math.max(0, (p - 0.4) / 0.6);

      hero.setParams({
        rot4dXY: ease * 0.4, rot4dXZ: ease * 0.25,
        rot4dXW: late * Math.PI * 1.2, rot4dYW: late * Math.PI * 0.6,
        rot4dZW: Math.max(0, (p - 0.6) / 0.4) * Math.PI * 0.8,
        geometry: p < 0.3 ? 3 : p < 0.65 ? 2 : 4,
        gridDensity: 28 + ease * 32,
        hue: 210 + ease * 60 + Math.sin(p * Math.PI * 3) * 15,
        chaos: 0.05 + late * 0.35,
        intensity: 0.75 + ease * 0.2,
        morphFactor: 0.6 + ease * 1.0,
        dimension: 3.6 - ease * 0.4,
        saturation: 0.9 + late * 0.1,
      });
    },
  });

  gsap.to('#heroContent', {
    opacity: 0, y: -100, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: 0.3 },
  });
  gsap.to('#heroScroll', {
    opacity: 0, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: '10% top', end: '30% top', scrub: 0.3 },
  });
}

export function initTrinity(pool, createHero) {
  ScrollTrigger.create({
    trigger: '#trinitySection', start: 'top top', end: 'bottom bottom',
    pin: '#trinityPinned', scrub: 0.4,
    onEnter: () => { pool.release('hero'); createTriSystem(pool, 0); updateTriLabels(0); updateTriCounter(0); },
    onLeave: () => { pool.release('trinity'); triCurrent = -1; },
    onEnterBack: () => { createTriSystem(pool, 2); updateTriLabels(2); updateTriCounter(2); },
    onLeaveBack: () => { pool.release('trinity'); triCurrent = -1; createHero(); },
    onUpdate: (self) => {
      const p = self.progress;
      const newIdx = p < 0.33 ? 0 : p < 0.66 ? 1 : 2;
      if (newIdx !== triCurrent && !triSwapLock) swapTriSystem(pool, newIdx);

      const adapter = pool.get('trinity');
      if (!adapter) return;

      const localP = newIdx === 0 ? p / 0.33 : newIdx === 1 ? (p - 0.33) / 0.33 : (p - 0.66) / 0.34;
      const smooth = smoothstep(localP);
      const pulse = Math.sin(localP * Math.PI);

      if (triCurrent === 0) {
        // Quantum: "Lattice Resonance" — torus → sphere → wave
        const breathe = Math.sin(localP * Math.PI * 4) * 0.15;
        adapter.setParams({
          geometry: localP < 0.5 ? 3 : localP < 0.8 ? 2 : 6,
          rot4dXW: smooth * Math.PI * 1.5, rot4dYW: smooth * Math.PI * 0.7,
          rot4dXY: Math.sin(localP * Math.PI * 2) * 0.3,
          gridDensity: 24 + smooth * 36 + breathe * 10,
          hue: 195 + smooth * 45 + Math.sin(localP * Math.PI * 6) * 20,
          chaos: 0.08 + pulse * 0.25, morphFactor: 0.5 + smooth * 0.9,
          intensity: 0.8 + pulse * 0.15, dimension: 3.5 - smooth * 0.3, saturation: 0.85 + pulse * 0.12,
        });
      } else if (triCurrent === 1) {
        // Holographic: "Spectral Folding" — Klein → Torus → Fractal
        const warp = Math.sin(localP * Math.PI * 3) * 0.2;
        adapter.setParams({
          geometry: 8 + (localP < 0.4 ? 4 : localP < 0.7 ? 3 : 5),
          rot4dXW: smooth * Math.PI * 2.5, rot4dZW: smooth * Math.PI * 1.2,
          rot4dYZ: Math.sin(localP * Math.PI * 2) * 0.5,
          gridDensity: 18 + pulse * 22,
          hue: 310 - smooth * 80 + Math.sin(localP * Math.PI * 5) * 30,
          chaos: 0.12 + smooth * 0.3 + warp, morphFactor: 0.4 + pulse * 0.8,
          intensity: 0.85 + pulse * 0.12, dimension: 3.7 - smooth * 0.5, saturation: 0.9 + pulse * 0.1,
        });
      } else {
        // Faceted: "Crystalline Convergence" — HT-Cube → Crystal → Tetra → Fractal
        const facet = Math.sin(localP * Math.PI * 2) * 0.1;
        adapter.setParams({
          geometry: 16 + (localP < 0.3 ? 1 : localP < 0.6 ? 7 : localP < 0.85 ? 0 : 5),
          rot4dXW: smooth * Math.PI * 2.0, rot4dYW: smooth * Math.PI * 0.4,
          rot4dXZ: Math.sin(localP * Math.PI * 1.5) * 0.4,
          gridDensity: 32 + smooth * 28 + facet * 8,
          hue: 45 + smooth * 75 + Math.sin(localP * Math.PI * 4) * 15,
          chaos: 0.03 + pulse * 0.12, morphFactor: 0.8 + smooth * 0.7,
          intensity: 0.75 + pulse * 0.2, dimension: 3.4 - smooth * 0.2, saturation: 0.8 + smooth * 0.15,
        });
      }
    },
  });
}

export function initConvergence(c2d) {
  ScrollTrigger.create({
    trigger: '#convSection', start: 'top top', end: 'bottom bottom',
    pin: '#convPinned', scrub: 0.3,
    onUpdate: (self) => {
      const p = self.progress;
      const q = c2d.get('convQ'), h = c2d.get('convH'), f = c2d.get('convF');
      if (!q || !h || !f) return;
      const overlay = document.getElementById('convOverlay');

      if (p < 0.25) {
        // Divergent: each has own parameters
        const lp = p / 0.25;
        q.setParams({ geometry: Math.floor(lp * 5), hue: 200 + lp * 40, rot4dXW: lp * 2, gridDensity: 16 + lp * 20, chaos: 0.1 + lp * 0.2 });
        h.setParams({ geometry: 3 + Math.floor(lp * 3), hue: 300 - lp * 30, rot4dXW: -lp * 1.5, gridDensity: 22 - lp * 5, chaos: 0.2 });
        f.setParams({ geometry: 1 + Math.floor(lp * 4), hue: 60 + lp * 20, rot4dXW: lp * 2.5, gridDensity: 18 + lp * 10, chaos: 0.1 });
        if (overlay) {
          overlay.querySelector('h2').style.opacity = Math.max(0, 1 - lp * 3);
          overlay.querySelector('p').style.opacity = Math.max(0, 1 - lp * 3);
        }
      } else if (p < 0.5) {
        // Color wave propagation
        const lp = (p - 0.25) / 0.25;
        const waveHue = 180 + Math.sin(lp * Math.PI * 2) * 80;
        const qD = 0, hD = 0.15, fD = 0.3;
        q.setParams({ hue: waveHue + Math.sin((lp - qD) * Math.PI * 3) * 60, rot4dXW: 2 + lp * 4, gridDensity: 30 + Math.sin(lp * Math.PI * 4) * 15, geometry: 3 + Math.floor(Math.sin(lp * Math.PI) * 3), chaos: 0.2 + Math.sin(lp * Math.PI * 2) * 0.2, morphFactor: 0.8 + Math.sin(lp * Math.PI) * 0.6 });
        h.setParams({ hue: waveHue + Math.sin((lp - hD) * Math.PI * 3) * 60, rot4dXW: -1.5 + lp * 3, gridDensity: 20 + Math.sin((lp - hD) * Math.PI * 4) * 15, geometry: 6 + Math.floor(Math.sin((lp - hD) * Math.PI) * 3), chaos: 0.2 + Math.sin((lp - hD) * Math.PI * 2) * 0.2, morphFactor: 0.6 + Math.sin((lp - hD) * Math.PI) * 0.6 });
        f.setParams({ hue: waveHue + Math.sin((lp - fD) * Math.PI * 3) * 60, rot4dXW: 2.5 + lp * 3, gridDensity: 25 + Math.sin((lp - fD) * Math.PI * 4) * 15, geometry: 1 + Math.floor(Math.sin((lp - fD) * Math.PI) * 3), chaos: 0.1 + Math.sin((lp - fD) * Math.PI * 2) * 0.2, morphFactor: 1.0 + Math.sin((lp - fD) * Math.PI) * 0.5 });
      } else if (p < 0.75) {
        // Convergence — all 3 unify
        const lp = (p - 0.5) / 0.25;
        const shared = { geometry: 3, hue: 180, gridDensity: 28, rot4dXW: lp * Math.PI * 4, rot4dYW: lp * 2, morphFactor: 1.2, chaos: 0.15, intensity: 0.8 };
        q.setParams(shared); h.setParams(shared); f.setParams(shared);
        if (overlay) {
          const convTitle = document.getElementById('convTitle');
          const convSub = document.getElementById('convSub');
          if (convTitle) { convTitle.textContent = 'Unified'; convTitle.style.opacity = Math.min(1, lp * 3); }
          if (convSub) { convSub.textContent = 'Three engines. One heartbeat.'; convSub.style.opacity = Math.min(1, lp * 3); }
        }
      } else {
        // Burst divergence — dramatic new identities
        const lp = (p - 0.75) / 0.25;
        const rot = Math.PI * 4 + lp * Math.PI * 3;
        q.setParams({ geometry: 16 + Math.floor(lp * 7), hue: lp * 180, rot4dXW: rot, rot4dYW: lp * 4, gridDensity: 28 + lp * 40, chaos: 0.15 + lp * 0.6, morphFactor: 1.2 + lp * 0.8, intensity: 0.8 + lp * 0.2 });
        h.setParams({ geometry: 8 + Math.floor(lp * 7), hue: 300 + lp * 60, rot4dXW: -rot * 0.8, rot4dYW: -lp * 3, gridDensity: 28 - lp * 10, chaos: 0.15 + lp * 0.4, morphFactor: 1.2 - lp * 0.5, intensity: 0.8 + lp * 0.15 });
        f.setParams({ geometry: Math.floor(lp * 7), hue: 60 + lp * 200, rot4dXW: rot * 1.2, rot4dZW: lp * Math.PI, gridDensity: 28 + lp * 25, chaos: 0.15 + lp * 0.5, morphFactor: 1.2 + lp * 0.6, intensity: 0.8 + lp * 0.2 });
        if (overlay) {
          overlay.querySelector('h2').style.opacity = Math.max(0, 1 - lp * 4);
          overlay.querySelector('p').style.opacity = Math.max(0, 1 - lp * 4);
        }
      }
    },
  });

  gsap.set('#convTitle', { opacity: 1 });
  gsap.set('#convSub', { opacity: 1 });
}

export function initEnergy(pool, c2d) {
  // Lazy GPU lifecycle for the card
  ScrollTrigger.create({
    trigger: '#energySection', start: 'top 80%', end: 'bottom top',
    onEnter: () => pool.acquire('energyCard', 'energy-card-canvas', FacetedAdapter, energyCardParams),
    onLeave: () => pool.release('energyCard'),
    onEnterBack: () => pool.acquire('energyCard', 'energy-card-canvas', FacetedAdapter, energyCardParams),
    onLeaveBack: () => pool.release('energyCard'),
  });

  // Pin + scroll parameter drive
  ScrollTrigger.create({
    trigger: '#energySection', start: 'top top', end: 'bottom bottom',
    pin: '#energyPinned', scrub: 0.3,
    onUpdate: (self) => {
      const bg = c2d.get('energyBg');
      if (!bg) return;
      bg.setParams({ rot4dXW: self.progress * 3, hue: 270 + self.progress * 50, gridDensity: 16 + self.progress * 10, intensity: 0.2 + self.progress * 0.15 });
    },
  });

  // Card entrance
  ScrollTrigger.create({
    trigger: '#energySection', start: 'top 60%', once: true,
    onEnter: () => gsap.to('#energyCard', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }),
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

      // Phase 1: Card drains, background surges
      if (card) tl.to(card.params, { intensity: 0.05, gridDensity: 4, chaos: 0.6, hue: 320, duration: 0.8, ease: 'power3.in', onUpdate: () => card.render() }, 0);
      if (bg) tl.to(bg.params, { intensity: 0.8, gridDensity: 55, chaos: 0.5, hue: 180, morphFactor: 1.5, duration: 0.8, ease: 'power2.out', onUpdate: () => bg.render() }, 0);
      tl.to(energyFill, { width: '5%', duration: 0.8, ease: 'power3.in' }, 0);

      // Phase 2: Color swap + geometry morph
      if (card) tl.to(card.params, { hue: 270, geometry: 5, rot4dXW: Math.PI, duration: 0.6, ease: 'power2.inOut', onUpdate: () => card.render() }, 0.8);
      if (bg) tl.to(bg.params, { hue: 60, geometry: 3, duration: 0.6, ease: 'power2.inOut', onUpdate: () => bg.render() }, 0.8);

      // Phase 3: Card element morph
      tl.to('#energyCard', { scale: 0.96, borderColor: 'rgba(123,63,242,0.4)', boxShadow: '0 0 60px rgba(123,63,242,0.2)', duration: 0.5, ease: 'power2.in' }, 0);
      tl.to('#energyCard', { scale: 1, borderColor: 'rgba(255,255,255,0.06)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)', duration: 0.8, ease: 'elastic.out(1, 0.4)' }, 1.4);

      // Phase 4: Elastic snap-back
      if (card) tl.to(card.params, { intensity: 0.6, gridDensity: 30, chaos: 0.1, hue: 180, geometry: 7, rot4dXW: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)', onUpdate: () => card.render() }, 1.5);
      if (bg) tl.to(bg.params, { intensity: 0.2, gridDensity: 16, chaos: 0.05, hue: 270, morphFactor: 0.5, geometry: 6, duration: 1.2, ease: 'elastic.out(1, 0.5)', onUpdate: () => bg.render() }, 1.5);
      tl.to(energyFill, { width: '50%', duration: 1, ease: 'elastic.out(1, 0.5)' }, 1.5);
    }

    energyBtn.addEventListener('click', energySweep);
    energyBtn.addEventListener('touchstart', (e) => { e.preventDefault(); energySweep(); });
  }
}

export function initCascade(c2d) {
  const cascadeCards = document.querySelectorAll('.cascade-card');
  const cascadeTrack = document.getElementById('cascadeTrack');

  ScrollTrigger.create({
    trigger: '#cascadeSection', start: 'top 80%', once: true,
    onEnter: () => gsap.to('.cascade-card', { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' }),
  });

  if (cascadeTrack && cascadeCards.length > 0) {
    const cardW = 340 + 28;
    const totalScroll = (cascadeCards.length - 1) * cardW;

    ScrollTrigger.create({
      trigger: '#cascadeSection', start: 'top top', end: 'bottom bottom',
      pin: '#cascadePinned', scrub: 0.4,
      onUpdate: (self) => {
        const p = self.progress;
        cascadeTrack.style.transform = `translateX(${-p * totalScroll}px)`;

        const activeIdx = Math.min(Math.floor(p * cascadeCards.length), cascadeCards.length - 1);
        const activeHue = parseInt(cascadeCards[activeIdx].dataset.hue);
        const localP = (p * cascadeCards.length) - activeIdx;

        cascadeCards.forEach((card, i) => {
          const inst = c2d.get(`cas${i}`);
          if (!inst) return;
          if (i === activeIdx) {
            inst.setParams({ rot4dXW: localP * Math.PI, intensity: 0.75 + Math.sin(localP * Math.PI) * 0.15, morphFactor: 0.6 + localP * 0.4 });
            card.style.transform = `scale(${1 + Math.sin(localP * Math.PI) * 0.03})`;
          } else if (Math.abs(i - activeIdx) === 1) {
            const ownHue = parseInt(card.dataset.hue);
            const bleedAmount = i < activeIdx ? (1 - localP) * 0.3 : localP * 0.3;
            inst.setParams({ hue: ownHue + (activeHue - ownHue) * bleedAmount, intensity: 0.6 });
            card.style.transform = 'scale(1)';
          } else {
            card.style.transform = 'scale(1)';
          }
        });
      },
    });
  }
}

export function initCTA(c2d) {
  ScrollTrigger.create({
    trigger: '#ctaSection', start: 'top bottom', end: 'bottom bottom', scrub: 0.3,
    onUpdate: (self) => {
      const cta = c2d.get('cta');
      if (!cta) return;
      cta.setParams({ rot4dXW: self.progress * 2, hue: 160 + self.progress * 80, intensity: 0.2 + self.progress * 0.1 });
    },
  });
}

// ─── Convergence Hover Coordination ──────────────────────────
// Hovering a panel: brightens it, desaturates others,
// freezes hovered speed, transfers density to hovered

export function initConvergenceHover(c2d) {
  const panels = document.querySelectorAll('.conv-panel');
  const keys = ['convQ', 'convH', 'convF'];
  const baseIntensity = [0.7, 0.7, 0.7];
  const baseSpeed = [0.8, 0.6, 0.7];

  panels.forEach((panel, idx) => {
    panel.addEventListener('mouseenter', () => {
      keys.forEach((key, i) => {
        const inst = c2d.get(key);
        if (!inst) return;
        if (i === idx) {
          // Hovered panel: brighten, density UP, speed FREEZE
          gsap.to(inst.params, {
            intensity: 0.95, gridDensity: 40, speed: 0.05, chaos: 0.05,
            duration: 0.6, ease: 'power2.out',
          });
          gsap.to(panel, { scale: 1.02, duration: 0.4, ease: 'power2.out' });
        } else {
          // Other panels: desaturate, density DOWN, dim
          gsap.to(inst.params, {
            intensity: 0.3, gridDensity: 10, speed: baseSpeed[i] * 0.3,
            chaos: 0.4, duration: 0.5, ease: 'power2.out', delay: 0.05,
          });
          gsap.to(panels[i], { scale: 0.98, opacity: 0.6, duration: 0.4, ease: 'power2.out' });
        }
      });
    });

    panel.addEventListener('mouseleave', () => {
      // Snap back: background starts first, then cards with lag
      keys.forEach((key, i) => {
        const inst = c2d.get(key);
        if (!inst) return;
        const delay = i === idx ? 0.15 : 0;
        gsap.to(inst.params, {
          intensity: baseIntensity[i], gridDensity: [20, 22, 18][i],
          speed: baseSpeed[i], chaos: [0.15, 0.2, 0.1][i],
          duration: 0.8, ease: 'elastic.out(1, 0.5)', delay,
        });
        gsap.to(panels[i], {
          scale: 1, opacity: 1,
          duration: 0.6, ease: 'power2.out', delay,
        });
      });
    });
  });
}
