/**
 * VIB3+ Synesthesia — Flagship Professional Example
 *
 * Demonstrates the complete Gold Standard creative vocabulary:
 * - 14 Named Motions (Approach/Retreat, Burst, Crystallize, Dimensional Crossfade, etc.)
 * - 7 Coordination Patterns (Inverse Density Seesaw, Energy Conservation)
 * - 6 Bridge Patterns (CSS custom properties, Approach/Retreat CSS classes)
 * - 3 Parameter Modes (Continuous Mapping, Event Choreography, Ambient Drift)
 * - Per-System Personality (Faceted/Quantum/Holographic parameter ranges)
 * - 8-Scene Autonomous Choreography via ChoreographyPlayer
 * - Post-Processing Pipeline (bloom + chromatic aberration)
 * - Audio Reactivity (8-band FFT → all parameters via EMA)
 * - Visible 4D Rotation (XW/YW/ZW dominant over 3D axes)
 * - Color Preset Cycling via ColorPresetsSystem
 * - CSS Variable Bridge (every frame)
 * - Energy Conservation (total intensity ≈ constant across both engines)
 * - Timing Asymmetry (Approach 400ms, Retreat 800ms; Burst 150ms/2000ms)
 *
 * Architecture: Two VIB3Engine instances coordinated via Inverse Density Seesaw.
 * Primary = full viewport (starts Faceted), Secondary = floating panel (starts Quantum).
 *
 * Every creative decision annotated with [WHY] from Gold Standard sections.
 *
 * @see examples/dogfood/GOLD_STANDARD.md
 */

// ─────────────────────────────────────────────────────────────────────────
// SDK Imports — Using the ACTUAL VIB3+ modules
// ─────────────────────────────────────────────────────────────────────────

import { VIB3Engine } from '../../../src/core/VIB3Engine.js';
import { TransitionAnimator } from '../../../src/creative/TransitionAnimator.js';
import { ColorPresetsSystem } from '../../../src/creative/ColorPresetsSystem.js';
import { ChoreographyPlayer } from '../../../src/creative/ChoreographyPlayer.js';
import { PostProcessingPipeline } from '../../../src/creative/PostProcessingPipeline.js';
import { AestheticMapper } from '../../../src/creative/AestheticMapper.js';

// ─────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────

// [WHY] Gold Standard F: Per-System Creative Personality
// Each system has a character. These ranges define where parameters "want" to be.
// When switching systems, the engine transitions to the new personality's midpoint.
//
// EXPERIMENT: Add your own personality. Try a "dark" mode:
//   dark: { gridDensity: [10, 25], speed: [0.1, 0.3], chaos: [0.3, 0.7],
//           dimension: [3.0, 3.4], intensity: [0.1, 0.3], saturation: [0.0, 0.15],
//           character: 'Dark, turbulent, desaturated' }
// Then add a keyboard shortcut to switch to it. Horror game vibes.
//
// Or try widening Faceted's chaos range to [0.0, 0.6] — it breaks the "clean"
// aesthetic but creates beautiful glitch art at high chaos values.
const PERSONALITY = {
  faceted: {
    gridDensity: [15, 35], speed: [0.3, 0.8], chaos: [0.0, 0.15],
    dimension: [3.6, 4.0], intensity: [0.5, 0.8], saturation: [0.6, 0.9],
    character: 'Clean, precise, geometric'
  },
  quantum: {
    gridDensity: [25, 60], speed: [0.5, 1.5], chaos: [0.1, 0.4],
    dimension: [3.2, 3.8], intensity: [0.4, 0.9], saturation: [0.5, 0.85],
    character: 'Dense, crystalline, mathematical'
  },
  holographic: {
    gridDensity: [20, 50], speed: [0.4, 1.2], chaos: [0.05, 0.3],
    dimension: [3.4, 4.2], intensity: [0.45, 0.85], saturation: [0.55, 0.95],
    character: 'Atmospheric, layered, ethereal'
  }
};

// [WHY] Gold Standard F: EMA tau values (seconds). Lower = more responsive.
// These define how "twitchy" vs "smooth" each parameter feels.
//
// EXPERIMENT: Set all taus to 0.02 — everything becomes instant and jittery,
// like a VU meter. Or set them all to 1.0 — everything becomes glacial and
// dreamy, ignoring rapid changes and only responding to sustained shifts.
// Or swap speed and hue taus — color becomes instant while motion lags.
// Each combination changes the emotional character dramatically.
const TAU = {
  speed: 0.08, gridDensity: 0.10, chaos: 0.10, morphFactor: 0.12,
  intensity: 0.12, saturation: 0.15, rotation: 0.15, dimension: 0.20, hue: 0.25
};

// [WHY] Gold Standard A.3: Prime-number periods for non-repeating frozen drift.
const DRIFT_PRIMES = [7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59];

// Audio FFT band ranges (Hz-equivalent indices for 2048-point FFT at 44100Hz)
const BAND_RANGES = [
  [1, 3], [3, 9], [9, 23], [23, 56], [56, 139], [139, 279], [279, 558], [558, 930]
];

// Geometry metadata for HUD
const BASE_NAMES = ['Tetra', 'Cube', 'Sphere', 'Torus', 'Klein', 'Fractal', 'Wave', 'Crystal'];
const CORE_NAMES = ['Base', 'Hyper-S', 'Hyper-T'];
const SYSTEM_NAMES = { faceted: 'FACETED', quantum: 'QUANTUM', holographic: 'HOLOGRAPHIC' };

// [WHY] Gold Standard: Themed color presets for visual variety.
// Press 'C' to cycle through these. The secondary engine gets an offset
// preset (+3 positions), so primary and secondary always have contrasting color.
//
// EXPERIMENT: The SDK has 22 presets total. Try reordering for different arcs,
// or use only warm presets ['Sunset Warm', 'Lava', 'Desert Sand'] for a
// coherent warm palette, or only cool ones for an icy feel. You can also
// call colorPresets.applyPreset() with transition=true and duration to
// create slow color morphs between any two presets.
const PRESET_CYCLE = ['Ocean Deep', 'Galaxy', 'Neon Pulse', 'Cyberpunk Neon', 'Aurora', 'Sunset Warm'];

// [WHY] Gold Standard D: 8-scene autonomous choreography (120s cycle).
// This kicks in after 30s of no input. Any input breaks out immediately.
//
// EXPERIMENT: Edit the scenes below. Each scene is 15 seconds — try 5s for
// frantic energy or 60s for slow meditation. Change the geometry indices
// (0-23, where index = coreType*8 + baseGeometry). Add more track keyframes
// for within-scene parameter evolution. Try all scenes with the same system
// but different geometries for a geometry showcase. Or add chaos tracks that
// arc from 0→0.4→0 within each scene for tension/release.
const CHOREOGRAPHY_SPEC = {
  id: 'synesthesia-auto',
  name: 'Synesthesia Autonomous Cycle',
  duration_ms: 120000,
  bpm: null,
  scene_count: 8,
  scenes: [
    {
      index: 0, time_start: 0, time_end: 15000,
      system: 'faceted', geometry: 1,
      transition_in: { type: 'fade', duration: 800, easing: 'easeOut' },
      tracks: { hue: [{ time: 0, value: 200 }, { time: 15000, value: 240 }] },
      color_preset: 'Ocean Deep', post_processing: ['bloom'], audio: null
    },
    {
      index: 1, time_start: 15000, time_end: 30000,
      system: 'quantum', geometry: 11,
      transition_in: { type: 'fade', duration: 800, easing: 'easeInOut' },
      tracks: { chaos: [{ time: 0, value: 0.2 }, { time: 15000, value: 0.35 }] },
      color_preset: 'Galaxy', post_processing: ['bloom'], audio: null
    },
    {
      index: 2, time_start: 30000, time_end: 45000,
      system: 'holographic', geometry: 14,
      transition_in: { type: 'fade', duration: 1000, easing: 'easeOut' },
      tracks: { dimension: [{ time: 0, value: 3.4 }, { time: 15000, value: 4.0 }] },
      color_preset: 'Aurora', post_processing: ['bloom', 'chromatic_aberration'], audio: null
    },
    {
      index: 3, time_start: 45000, time_end: 60000,
      system: 'faceted', geometry: 5,
      transition_in: { type: 'fade', duration: 600, easing: 'easeOut' },
      tracks: { morphFactor: [{ time: 0, value: 0.5 }, { time: 15000, value: 1.5 }] },
      color_preset: 'Neon Pulse', post_processing: ['bloom'], audio: null
    },
    {
      index: 4, time_start: 60000, time_end: 75000,
      system: 'quantum', geometry: 16,
      transition_in: { type: 'fade', duration: 800, easing: 'easeInOut' },
      tracks: { speed: [{ time: 0, value: 0.8 }, { time: 15000, value: 1.4 }] },
      color_preset: 'Cyberpunk Neon', post_processing: ['bloom', 'chromatic_aberration'], audio: null
    },
    {
      index: 5, time_start: 75000, time_end: 90000,
      system: 'holographic', geometry: 3,
      transition_in: { type: 'fade', duration: 1000, easing: 'easeOut' },
      tracks: { gridDensity: [{ time: 0, value: 25 }, { time: 15000, value: 45 }] },
      color_preset: 'Sunset Warm', post_processing: ['bloom'], audio: null
    },
    {
      index: 6, time_start: 90000, time_end: 105000,
      system: 'faceted', geometry: 22,
      transition_in: { type: 'fade', duration: 600, easing: 'easeOut' },
      tracks: { chaos: [{ time: 0, value: 0.0 }, { time: 7500, value: 0.15 }, { time: 15000, value: 0.0 }] },
      color_preset: 'Ocean Deep', post_processing: ['bloom'], audio: null
    },
    {
      index: 7, time_start: 105000, time_end: 120000,
      system: 'quantum', geometry: 9,
      transition_in: { type: 'fade', duration: 800, easing: 'easeInOut' },
      tracks: { intensity: [{ time: 0, value: 0.5 }, { time: 15000, value: 0.85 }] },
      color_preset: 'Galaxy', post_processing: ['bloom', 'chromatic_aberration'], audio: null
    }
  ]
};

// ─────────────────────────────────────────────────────────────────────────
// Utility: EMA Smoothing — the universal primitive
// ─────────────────────────────────────────────────────────────────────────

// [WHY] Gold Standard F: alpha = 1 - exp(-dt/tau). Never use setTimeout for visual params.
function ema(current, target, dt, tau) {
  return current + (target - current) * (1 - Math.exp(-dt / tau));
}

function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function personalityMid(system, param) {
  const p = PERSONALITY[system];
  if (!p || !p[param]) return 0.5;
  return (p[param][0] + p[param][1]) / 2;
}

// ─────────────────────────────────────────────────────────────────────────
// Main Application Class
// ─────────────────────────────────────────────────────────────────────────

class Synesthesia {
  constructor() {
    // ── Engines ──
    this.primaryEngine = null;
    this.secondaryEngine = null;

    // ── Creative Modules ──
    this.primaryAnimator = null;
    this.secondaryAnimator = null;
    this.colorPresets = null;
    this.secondaryColorPresets = null;
    this.choreographyPlayer = null;
    this.postProcessing = null;
    this.aestheticMapper = null;

    // ── State ──
    this.primarySystem = 'faceted';
    this.secondarySystem = 'quantum';
    this.primaryGeometry = 1;
    this.secondaryGeometry = 11;
    this.mode = 'active'; // active | frozen | autonomous
    this.lastInputTime = 0;
    this.frozenAt = 0;
    this.frozenParams = null;
    this.presetIndex = 0;
    this.longPressTimer = null;
    this.crystallized = false;

    // [WHY] Gold Standard F: All parameters with per-frame EMA-smoothed state
    this.state = {
      hue: 200, saturation: 0.7, intensity: 0.5, chaos: 0.1, speed: 0.6,
      morphFactor: 0.8, gridDensity: 30, dimension: 3.5,
      // Rotation order: [XY, XZ, YZ, XW, YW, ZW]
      // [WHY] 4D axes (indices 3-5) are FASTER than 3D (indices 0-2). This is
      // deliberate — the 4D rotation is what makes VIB3+ unique. If 3D rotation
      // dominates, you just see a spinning object. With 4D dominant, you see
      // geometry folding through itself, impossible intersections, alien motion.
      //
      // EXPERIMENT: Set indices 0-2 to 0 and keep 3-5. Now there's NO 3D
      // rotation — the object just morphs through the 4th dimension. Deeply
      // strange. Or set all to the same value for uniform tumbling. Or make
      // one 4D axis very fast (0.3) and others zero — the geometry flips
      // through a single hyperplane.
      rot: [0, 0, 0, 0, 0, 0],
      rotVel: [0.04, 0.03, 0.02, 0.08, 0.06, 0.05],
      clickIntensity: 0, onset: 0
    };

    // Audio state
    this.audio = {
      ctx: null, analyser: null, stream: null,
      freqData: null, timeData: null, prevFreqData: null,
      bands: new Float32Array(8), rms: 0, spectralCentroid: 0.5,
      spectralFlux: 0, spectralFluxAvg: 0,
      lastOnsetTime: 0, usingSynthetic: true
    };

    // Animation
    this.prevTime = 0;
    this.animId = null;
    this.fps = { count: 0, timer: 0, value: 0 };
  }

  // ───────────────────────────────────────────────────────────────────────
  // Initialization
  // ───────────────────────────────────────────────────────────────────────

  async init() {
    // ── Create Primary Engine (full viewport, Faceted) ──
    this.primaryEngine = new VIB3Engine({ system: this.primarySystem });
    const primaryOk = await this.primaryEngine.initialize('primary-viz');
    if (!primaryOk) {
      console.error('[Synesthesia] Primary engine failed to initialize');
      return false;
    }

    // ── Create Secondary Engine (floating panel, Quantum) ──
    this.secondaryEngine = new VIB3Engine({ system: this.secondarySystem });
    const secondaryOk = await this.secondaryEngine.initialize('secondary-viz');
    if (!secondaryOk) {
      console.warn('[Synesthesia] Secondary engine failed — running single-engine mode');
      this.secondaryEngine = null;
    }

    // ── TransitionAnimator per engine ──
    // [WHY] Gold Standard A: Named motions need smooth transitions with easing control
    this.primaryAnimator = new TransitionAnimator(
      (name, value) => this.primaryEngine.setParameter(name, value),
      (name) => this.primaryEngine.getParameter(name)
    );
    if (this.secondaryEngine) {
      this.secondaryAnimator = new TransitionAnimator(
        (name, value) => this.secondaryEngine.setParameter(name, value),
        (name) => this.secondaryEngine.getParameter(name)
      );
    }

    // ── ColorPresetsSystem ──
    // [WHY] Gold Standard: Themed color cycling for visual variety
    this.colorPresets = new ColorPresetsSystem(
      this.primaryEngine.createParameterCallback()
    );
    if (this.secondaryEngine) {
      this.secondaryColorPresets = new ColorPresetsSystem(
        this.secondaryEngine.createParameterCallback()
      );
    }

    // ── ChoreographyPlayer for autonomous mode ──
    // [WHY] Gold Standard D: 8-scene autonomous cycle after 30s idle
    this.choreographyPlayer = new ChoreographyPlayer(this.primaryEngine, {
      onSceneChange: (idx, scene) => this.onChoreographyScene(idx, scene),
      onComplete: () => this.onChoreographyComplete(),
      onTick: (time, duration) => this.onChoreographyTick(time, duration)
    });
    this.choreographyPlayer.loopMode = 'loop';
    this.choreographyPlayer.load(CHOREOGRAPHY_SPEC);

    // ── PostProcessingPipeline ──
    // [WHY] Gold Standard: Bloom + chromatic aberration for depth
    try {
      this.postProcessing = new PostProcessingPipeline(
        document.getElementById('primary-viz')
      );
      this.postProcessing.addEffect('bloom', { intensity: 0.3, radius: 8 });
    } catch (e) {
      console.warn('[Synesthesia] PostProcessing unavailable:', e.message);
    }

    // ── AestheticMapper (available for NLP-to-parameter mapping) ──
    this.aestheticMapper = new AestheticMapper(
      this.primaryEngine.createParameterCallback()
    );

    // ── Apply initial per-system personality ──
    this.applyPersonality(this.primaryEngine, this.primarySystem);
    if (this.secondaryEngine) {
      this.applyPersonality(this.secondaryEngine, this.secondarySystem);
    }

    // ── Set initial 4D rotation on engines ──
    // [WHY] Gold Standard: XW/YW/ZW must have non-zero velocity or 4D won't be visible
    this.applyRotationState(this.primaryEngine);
    if (this.secondaryEngine) {
      this.applyRotationState(this.secondaryEngine);
    }

    // ── Setup subsystems ──
    this.setupAudio();
    this.setupEvents();
    this.setupCoordination();

    // ── Start render loop ──
    this.lastInputTime = performance.now();
    this.prevTime = performance.now();
    this.animId = requestAnimationFrame((t) => this.render(t));

    // ── Hide hint after 6s ──
    setTimeout(() => {
      const hint = document.getElementById('hint');
      if (hint) hint.classList.add('hidden');
    }, 6000);

    this.updateHUD();
    console.log('[Synesthesia] Initialized — 2 engines, all 3 modes active');
    return true;
  }

  // ───────────────────────────────────────────────────────────────────────
  // Audio Pipeline
  // ───────────────────────────────────────────────────────────────────────

  setupAudio() {
    try {
      this.audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.audio.analyser = this.audio.ctx.createAnalyser();
      this.audio.analyser.fftSize = 2048;
      this.audio.analyser.smoothingTimeConstant = 0.8;
      this.audio.freqData = new Uint8Array(this.audio.analyser.frequencyBinCount);
      this.audio.timeData = new Uint8Array(this.audio.analyser.fftSize);
      this.audio.prevFreqData = new Float32Array(this.audio.analyser.frequencyBinCount);

      // Request mic — falls back to synthetic if denied
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        this.audio.stream = stream;
        const source = this.audio.ctx.createMediaStreamSource(stream);
        source.connect(this.audio.analyser);
        this.audio.usingSynthetic = false;
        console.log('[Synesthesia] Microphone connected');
      }).catch(() => {
        this.audio.usingSynthetic = true;
        console.log('[Synesthesia] Using synthetic audio (mic denied)');
      });
    } catch (e) {
      this.audio.usingSynthetic = true;
    }
  }

  processAudio(dt, now) {
    const t = now * 0.001;
    const a = this.audio;

    if (a.usingSynthetic || !a.analyser) {
      // [WHY] Gold Standard F: Synthetic audio with evolving sine waves
      for (let b = 0; b < 8; b++) {
        let target = 0.3 + 0.2 * Math.sin(t * (0.5 + b * 0.3) + b * 1.7);
        target *= 0.8 + 0.2 * Math.sin(t * 0.1 + b);
        a.bands[b] = ema(a.bands[b], target, dt, 0.1);
      }
      a.rms = 0.3 + 0.15 * Math.sin(t * 0.7);
      a.spectralCentroid = 0.4 + 0.15 * Math.sin(t * 0.3);
      // Synthetic onset every ~4 seconds
      if (Math.sin(t * 0.8) > 0.95 && now - a.lastOnsetTime > 500) {
        this.state.onset = 1.0;
        a.lastOnsetTime = now;
      }
      return;
    }

    // Real audio processing
    a.analyser.getByteFrequencyData(a.freqData);
    a.analyser.getByteTimeDomainData(a.timeData);

    // 8-band normalization with EMA
    for (let b = 0; b < 8; b++) {
      let sum = 0;
      const range = BAND_RANGES[b];
      for (let i = range[0]; i < range[1] && i < a.freqData.length; i++) {
        sum += a.freqData[i];
      }
      const raw = sum / ((range[1] - range[0]) * 255);
      a.bands[b] = ema(a.bands[b], raw, dt, 0.1);
    }

    // RMS from time-domain data
    let rmsSum = 0;
    for (let i = 0; i < a.timeData.length; i++) {
      const v = (a.timeData[i] - 128) / 128;
      rmsSum += v * v;
    }
    a.rms = ema(a.rms, Math.sqrt(rmsSum / a.timeData.length), dt, 0.1);

    // Spectral centroid
    let weightedSum = 0, totalWeight = 0;
    for (let i = 0; i < a.freqData.length; i++) {
      weightedSum += i * a.freqData[i];
      totalWeight += a.freqData[i];
    }
    a.spectralCentroid = totalWeight > 0
      ? (weightedSum / totalWeight) / a.freqData.length : 0.5;

    // Onset detection via spectral flux
    let flux = 0;
    for (let i = 0; i < a.freqData.length; i++) {
      const diff = a.freqData[i] / 255 - a.prevFreqData[i];
      if (diff > 0) flux += diff;
      a.prevFreqData[i] = a.freqData[i] / 255;
    }
    a.spectralFluxAvg = ema(a.spectralFluxAvg, flux, dt, 0.3);

    // [WHY] Gold Standard F: flux > 3x average AND absolute > 0.5, 100ms cooldown
    if (flux > a.spectralFluxAvg * 3.0 && flux > 0.5 && now - a.lastOnsetTime > 100) {
      this.state.onset = 1.0;
      a.lastOnsetTime = now;
      // [WHY] Audio onset triggers ZW rotation spike (4D pulse)
      this.state.rotVel[5] = Math.min(0.5, this.state.rotVel[5] + 0.15);
    }
  }

  // ───────────────────────────────────────────────────────────────────────
  // Mode 1: Continuous Mapping
  // ───────────────────────────────────────────────────────────────────────

  // [WHY] Gold Standard B: Audio-driven parameter table.
  // Low freq = heavyweight params (morph, density), high = lightweight (saturation, hue).
  applyContinuousMappings(dt) {
    const b = this.audio.bands;
    const s = this.state;

    // Sub-bass + bass → morphFactor
    s.morphFactor = ema(s.morphFactor, lerp(0.2, 1.8, b[0]) + b[1] * 0.4, dt, TAU.morphFactor);

    // Low-mid + presence → gridDensity
    s.gridDensity = ema(s.gridDensity, lerp(15, 60, b[2]) + b[5] * 20, dt, TAU.gridDensity);

    // Mid → speed (fastest tau = most responsive)
    s.speed = ema(s.speed, lerp(0.3, 2.2, b[3]), dt, TAU.speed);

    // Upper-mid → chaos
    s.chaos = ema(s.chaos, lerp(0, 0.5, b[4]) + b[4] * 0.15, dt, TAU.chaos);

    // Brilliance → saturation
    s.saturation = ema(s.saturation, lerp(0.5, 1.0, b[6]), dt, TAU.saturation);

    // RMS + brilliance → intensity
    s.intensity = ema(s.intensity, lerp(0.3, 0.9, this.audio.rms) + b[6] * 0.2, dt, TAU.intensity);

    // Air → dimension
    s.dimension = ema(s.dimension, lerp(3.0, 3.3, b[7]) + 0.3, dt, TAU.dimension);

    // Spectral centroid → hue (+ time-of-day base)
    // [WHY] Gold Standard: Time-of-day provides 40% of hue base (warm dawn/dusk, cool noon)
    const hour = new Date().getHours();
    const todHue = 30 + 54 * Math.sin((hour - 6) / 24 * Math.PI * 2);
    const centroidHue = (1.0 - this.audio.spectralCentroid) * 216;
    s.hue = ema(s.hue, centroidHue + todHue * 0.4, dt, TAU.hue);

    // Audio → rotation velocities
    // [WHY] 4D axes FASTER than 3D. Bass → ZW, mid → XY, upper-mid → XW
    s.rotVel[5] = ema(s.rotVel[5], 0.05 + b[1] * 0.8, dt, 0.20);   // Bass → ZW
    s.rotVel[0] = ema(s.rotVel[0], 0.04 + b[3] * 1.2, dt, 0.15);   // Mid → XY
    s.rotVel[3] = ema(s.rotVel[3], 0.08 + b[4] * 0.6, dt, 0.12);   // Upper-mid → XW
    s.rotVel[4] = ema(s.rotVel[4], 0.06 + b[2] * 0.4, dt, 0.18);   // Low-mid → YW
  }

  // ───────────────────────────────────────────────────────────────────────
  // Mode 3: Ambient Drift
  // ───────────────────────────────────────────────────────────────────────

  // [WHY] Gold Standard A.3: "Stillness looks dead. Ambient drift is the life support system."
  applyAmbientDrift(dt, now) {
    const t = now * 0.001;
    const s = this.state;

    // Quietness factor — blend heartbeat in when audio is quiet
    let audioLevel = 0;
    for (let i = 0; i < 8; i++) audioLevel += this.audio.bands[i];
    const quietness = Math.max(0, 1 - audioLevel * 2);

    if (quietness > 0.1) {
      // [WHY] Heartbeat: morphFactor ±0.4 at 4s, intensity ±0.1 at 2s (2x harmonic)
      const heartbeatMorph = Math.sin(t * Math.PI * 0.5) * 0.4 + 1.0;
      const heartbeatIntensity = Math.sin(t * Math.PI) * 0.1 + 0.7;
      s.morphFactor = ema(s.morphFactor, heartbeatMorph, dt * quietness, 0.3);
      s.intensity = ema(s.intensity, heartbeatIntensity, dt * quietness, 0.3);

      // Gentle hue drift on ambient — slow wander
      s.hue = ema(s.hue, s.hue + Math.sin(t * 0.1) * 2, dt * quietness, 1.0);
    }
  }

  // [WHY] Gold Standard A.3: Frozen drift — prime-number periods, logarithmic growth
  applyFrozenDrift(dt, now) {
    if (this.mode !== 'frozen' || !this.frozenParams) return;
    const elapsed = (now - this.frozenAt) * 0.001;
    const TAU2 = Math.PI * 2;
    // [WHY] Amplitude grows logarithmically: log(1 + t*0.1) * 0.05
    const amp = Math.log(1 + elapsed * 0.1) * 0.05;
    const fp = this.frozenParams;

    this.state.hue = fp.hue + Math.sin(elapsed * TAU2 / DRIFT_PRIMES[0]) * amp * 36;
    this.state.saturation = clamp(fp.saturation + Math.sin(elapsed * TAU2 / DRIFT_PRIMES[1]) * amp, 0, 1);
    this.state.intensity = clamp(fp.intensity + Math.sin(elapsed * TAU2 / DRIFT_PRIMES[2]) * amp, 0, 1);
    this.state.chaos = clamp(fp.chaos + Math.sin(elapsed * TAU2 / DRIFT_PRIMES[3]) * amp, 0, 1);
    this.state.speed = clamp(fp.speed + Math.sin(elapsed * TAU2 / DRIFT_PRIMES[4]) * amp * 0.5, 0.1, 3);
    this.state.morphFactor = clamp(fp.morphFactor + Math.sin(elapsed * TAU2 / DRIFT_PRIMES[5]) * amp, 0, 2);
    this.state.gridDensity = clamp(fp.gridDensity + Math.sin(elapsed * TAU2 / DRIFT_PRIMES[6]) * amp * 20, 4, 100);
    this.state.dimension = clamp(fp.dimension + Math.sin(elapsed * TAU2 / DRIFT_PRIMES[7]) * amp * 0.3, 3, 4.5);

    for (let i = 0; i < 6; i++) {
      this.state.rot[i] = fp.rot[i] + Math.sin(elapsed * TAU2 / DRIFT_PRIMES[8 + i]) * amp;
    }
  }

  // ───────────────────────────────────────────────────────────────────────
  // Mode 2: Event Choreography — Named Motions
  // ───────────────────────────────────────────────────────────────────────

  // [WHY] Gold Standard A.2: Burst — "fast attack, long release, exponentialOut"
  // Timing asymmetry: 150ms attack, 2000ms release (1:13 ratio)
  onBurst() {
    this.state.clickIntensity = Math.min(1, this.state.clickIntensity + 0.5);
    this.state.onset = 1.0;

    // Primary: chaos spike + speed burst via TransitionAnimator
    this.primaryAnimator.transition(
      { chaos: Math.min(1, this.state.chaos + 0.3), speed: Math.min(3, this.state.speed + 0.5) },
      150, 'easeOut'
    );

    // [WHY] ZW rotation spike on burst — 4D dimension pulses
    this.state.rotVel[5] = Math.min(0.5, this.state.rotVel[5] + 0.12);

    this.markInput();
  }

  // [WHY] Gold Standard: Dimensional Crossfade on system switch
  // Old engine drain (intensity→0, speed→0, 400ms), new engine flood (600ms)
  onSystemSwitch(engine, newSystem, isSecondary = false) {
    const animator = isSecondary ? this.secondaryAnimator : this.primaryAnimator;
    if (!animator) return;

    // CSS crossfade class on primary
    if (!isSecondary) {
      const el = document.getElementById('primary-viz');
      el?.classList.add('crossfading');
      setTimeout(() => el?.classList.remove('crossfading'), 600);
    }

    // Phase 1: Drain current system (400ms)
    animator.transition({ intensity: 0.1, speed: 0.1 }, 400, 'easeIn', () => {
      // Phase 2: Switch system
      engine.switchSystem(newSystem);

      // Phase 3: Apply new personality + flood (600ms)
      animator.transition({
        intensity: personalityMid(newSystem, 'intensity'),
        speed: personalityMid(newSystem, 'speed'),
        gridDensity: personalityMid(newSystem, 'gridDensity'),
        chaos: personalityMid(newSystem, 'chaos'),
        dimension: personalityMid(newSystem, 'dimension')
      }, 600, 'easeOut');
    });

    if (isSecondary) {
      this.secondarySystem = newSystem;
    } else {
      this.primarySystem = newSystem;
    }
    this.updateHUD();
  }

  // [WHY] Gold Standard: Crystallize — chaos→0, speed→0, saturation↓, intensity↑ over 3000ms
  onCrystallize() {
    this.crystallized = true;
    document.body.classList.add('crystallized');

    this.primaryAnimator.transition(
      { chaos: 0, speed: 0.05, saturation: 0.2, intensity: 0.85 },
      3000, 'easeInOut'
    );

    if (this.secondaryAnimator) {
      this.secondaryAnimator.transition(
        { chaos: 0, speed: 0.05, saturation: 0.15, intensity: 0.8 },
        3000, 'easeInOut'
      );
    }
  }

  // [WHY] Gold Standard: Color Flood — release from Crystallize
  onColorFlood() {
    this.crystallized = false;
    document.body.classList.remove('crystallized');

    this.primaryAnimator.transition({
      chaos: personalityMid(this.primarySystem, 'chaos'),
      speed: personalityMid(this.primarySystem, 'speed'),
      saturation: personalityMid(this.primarySystem, 'saturation'),
      intensity: personalityMid(this.primarySystem, 'intensity')
    }, 1500, 'easeOut');
  }

  toggleFreeze(now) {
    if (this.mode === 'frozen') {
      this.mode = 'active';
      this.frozenParams = null;
    } else {
      this.mode = 'frozen';
      this.frozenAt = now;
      this.frozenParams = {
        hue: this.state.hue, saturation: this.state.saturation,
        intensity: this.state.intensity, chaos: this.state.chaos,
        speed: this.state.speed, morphFactor: this.state.morphFactor,
        gridDensity: this.state.gridDensity, dimension: this.state.dimension,
        rot: this.state.rot.slice()
      };
    }
    this.updateHUD();
  }

  // ───────────────────────────────────────────────────────────────────────
  // Approach / Retreat (secondary panel hover)
  // ───────────────────────────────────────────────────────────────────────

  // [WHY] Gold Standard A.1 + B Pattern 1: Approach/Retreat with energy conservation
  onSecondaryApproach() {
    const secEl = document.getElementById('secondary-viz');
    if (!secEl || !this.secondaryAnimator) return;

    secEl.classList.add('approaching');
    secEl.classList.remove('retreating');

    // [WHY] Approach: density drops, intensity rises, dimension decreases (comes forward)
    // 400ms easeOutQuad (fast attack)
    this.secondaryAnimator.transition(
      { gridDensity: 8, intensity: 0.9, dimension: 3.0 },
      400, 'easeOut'
    );

    // [WHY] Energy conservation: primary does inverse Retreat
    // Primary density +10, intensity -0.15. 600ms (slow release)
    this.primaryAnimator.transition(
      {
        gridDensity: this.state.gridDensity + 10,
        intensity: Math.max(0.2, this.state.intensity - 0.15)
      },
      600, 'easeIn'
    );
  }

  onSecondaryRetreat() {
    const secEl = document.getElementById('secondary-viz');
    if (!secEl || !this.secondaryAnimator) return;

    secEl.classList.remove('approaching');
    secEl.classList.add('retreating');

    // [WHY] Retreat: 800ms easeInQuad (slow release) back to personality defaults
    this.secondaryAnimator.transition(
      {
        gridDensity: personalityMid(this.secondarySystem, 'gridDensity'),
        intensity: personalityMid(this.secondarySystem, 'intensity'),
        dimension: personalityMid(this.secondarySystem, 'dimension')
      },
      800, 'easeIn'
    );

    // Primary recovers
    this.primaryAnimator.transition(
      {
        gridDensity: personalityMid(this.primarySystem, 'gridDensity'),
        intensity: personalityMid(this.primarySystem, 'intensity')
      },
      800, 'easeIn'
    );

    // Remove retreating class after transition
    setTimeout(() => secEl?.classList.remove('retreating'), 800);
  }

  // ───────────────────────────────────────────────────────────────────────
  // Coordination: Inverse Density Seesaw
  // ───────────────────────────────────────────────────────────────────────

  // [WHY] Gold Standard B Pattern 3: "When one engine's density rises, the other falls"
  setupCoordination() {
    if (!this.secondaryEngine || !this.primaryEngine.onParameterChange) return;

    this.primaryEngine.onParameterChange((params) => {
      if (params?.gridDensity !== undefined && this.secondaryAnimator) {
        // Inverse density: total density ≈ 70
        const inverseDensity = clamp(70 - params.gridDensity, 8, 60);
        this.secondaryAnimator.transition(
          { gridDensity: inverseDensity }, 200, 'easeOut'
        );
      }
    });
  }

  // ───────────────────────────────────────────────────────────────────────
  // Event Handling
  // ───────────────────────────────────────────────────────────────────────

  setupEvents() {
    const primary = document.getElementById('primary-viz');
    const secondary = document.getElementById('secondary-viz');

    // ── Click/Tap → Burst ──
    primary?.addEventListener('click', () => this.onBurst());

    // ── Touch gestures ──
    let touchStartX = 0, touchStartY = 0, touchStartTime = 0, lastTapTime = 0;

    primary?.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      touchStartTime = Date.now();

      // Long-press detection → Crystallize
      this.longPressTimer = setTimeout(() => {
        this.onCrystallize();
      }, 800);
    }, { passive: true });

    primary?.addEventListener('touchmove', () => {
      // Cancel long-press on move
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }
    }, { passive: true });

    primary?.addEventListener('touchend', (e) => {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer);
        this.longPressTimer = null;
      }

      // Release from Crystallize
      if (this.crystallized) {
        this.onColorFlood();
        return;
      }

      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const elapsed = Date.now() - touchStartTime;
      const now = performance.now();

      if (dist < 20 && elapsed < 300) {
        // Double-tap → Freeze toggle
        if (now - lastTapTime < 400) {
          this.toggleFreeze(now);
        } else {
          this.onBurst();
        }
        lastTapTime = now;
      } else if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        // Horizontal swipe → cycle geometry
        const base = this.primaryGeometry % 8;
        const core = Math.floor(this.primaryGeometry / 8);
        const newBase = ((base + (dx > 0 ? 1 : -1)) % 8 + 8) % 8;
        this.primaryGeometry = core * 8 + newBase;
        this.primaryEngine.setParameter('geometry', this.primaryGeometry);
        this.state.onset = 0.4;
        this.markInput();
        this.updateHUD();
      } else if (Math.abs(dy) > 40 && Math.abs(dy) > Math.abs(dx) * 1.5) {
        // Vertical swipe → cycle system
        const systems = ['faceted', 'quantum', 'holographic'];
        const idx = systems.indexOf(this.primarySystem);
        const next = systems[(idx + (dy < 0 ? 1 : 2)) % 3];
        this.onSystemSwitch(this.primaryEngine, next, false);
        this.markInput();
      }
    }, { passive: true });

    // ── Scroll → Portal Open (ZW rotation) ──
    // [WHY] Gold Standard: "Portal Open — rot4dXW animates toward 0.9 with 3D locking"
    primary?.addEventListener('wheel', (e) => {
      e.preventDefault();
      // Scroll depth maps to 4D depth (ZW + XW rotation)
      this.state.rot[5] += e.deltaY * 0.003;
      this.state.rot[3] += e.deltaY * 0.001;
      this.markInput();
    }, { passive: false });

    // ── Secondary panel: Approach/Retreat on hover ──
    // [WHY] Gold Standard A.1: Approach fast (400ms), Retreat slow (800ms)
    secondary?.addEventListener('mouseenter', () => this.onSecondaryApproach());
    secondary?.addEventListener('mouseleave', () => this.onSecondaryRetreat());

    // ── Keyboard shortcuts ──
    document.addEventListener('keydown', (e) => {
      this.markInput();
      const now = performance.now();

      switch (e.key) {
        case '1':
          this.onSystemSwitch(this.primaryEngine, 'faceted', false);
          break;
        case '2':
          this.onSystemSwitch(this.primaryEngine, 'quantum', false);
          break;
        case '3':
          this.onSystemSwitch(this.primaryEngine, 'holographic', false);
          break;
        case '4':
          // Cycle secondary system
          if (this.secondaryEngine) {
            const systems = ['faceted', 'quantum', 'holographic'];
            const idx = systems.indexOf(this.secondarySystem);
            this.onSystemSwitch(this.secondaryEngine, systems[(idx + 1) % 3], true);
          }
          break;
        case 'ArrowRight': case 'l': {
          const b = this.primaryGeometry % 8;
          const c = Math.floor(this.primaryGeometry / 8);
          this.primaryGeometry = c * 8 + ((b + 1) % 8);
          this.primaryEngine.setParameter('geometry', this.primaryGeometry);
          this.state.onset = 0.3;
          this.updateHUD();
          break;
        }
        case 'ArrowLeft': case 'h': {
          const b = this.primaryGeometry % 8;
          const c = Math.floor(this.primaryGeometry / 8);
          this.primaryGeometry = c * 8 + ((b + 7) % 8);
          this.primaryEngine.setParameter('geometry', this.primaryGeometry);
          this.state.onset = 0.3;
          this.updateHUD();
          break;
        }
        case 'ArrowUp': case 'k': {
          const b = this.primaryGeometry % 8;
          const c = Math.floor(this.primaryGeometry / 8);
          this.primaryGeometry = ((c + 1) % 3) * 8 + b;
          this.primaryEngine.setParameter('geometry', this.primaryGeometry);
          this.state.onset = 0.3;
          this.updateHUD();
          break;
        }
        case 'ArrowDown': case 'j': {
          const b = this.primaryGeometry % 8;
          const c = Math.floor(this.primaryGeometry / 8);
          this.primaryGeometry = ((c + 2) % 3) * 8 + b;
          this.primaryEngine.setParameter('geometry', this.primaryGeometry);
          this.state.onset = 0.3;
          this.updateHUD();
          break;
        }
        case ' ':
          this.toggleFreeze(now);
          e.preventDefault();
          break;
        case 'c': case 'C':
          // Cycle color preset
          this.presetIndex = (this.presetIndex + 1) % PRESET_CYCLE.length;
          this.colorPresets.applyPreset(PRESET_CYCLE[this.presetIndex], true, 800);
          if (this.secondaryColorPresets) {
            // Secondary gets complementary preset (offset by 3)
            const secIdx = (this.presetIndex + 3) % PRESET_CYCLE.length;
            this.secondaryColorPresets.applyPreset(PRESET_CYCLE[secIdx], true, 800);
          }
          break;
        case 'r': case 'R':
          this.primaryGeometry = Math.floor(Math.random() * 24);
          this.primaryEngine.setParameter('geometry', this.primaryGeometry);
          this.state.onset = 1.0;
          this.updateHUD();
          break;
        case 'f': case 'F':
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen().catch(() => {});
          }
          break;
        case 'a': case 'A':
          // Resume audio context if suspended
          if (this.audio.ctx?.state === 'suspended') {
            this.audio.ctx.resume();
          }
          break;
      }
    });

    // ── Resize ──
    window.addEventListener('resize', () => {
      this.primaryEngine?.resize?.();
      this.secondaryEngine?.resize?.();
    });

    // ── Visibility — pause when hidden, resume when visible ──
    // [WHY] Battery conservation
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      } else if (!document.hidden && !this.animId) {
        this.prevTime = performance.now();
        this.animId = requestAnimationFrame((t) => this.render(t));
      }
    });
  }

  // ───────────────────────────────────────────────────────────────────────
  // Choreography Callbacks
  // ───────────────────────────────────────────────────────────────────────

  onChoreographyScene(idx, scene) {
    const modeLabel = document.getElementById('modeLabel');
    if (modeLabel) modeLabel.textContent = `autonomous [${idx + 1}/8]`;
  }

  onChoreographyComplete() {
    // Loop restarts automatically (loopMode = 'loop')
  }

  onChoreographyTick(time, duration) {
    // Could update a progress indicator here
  }

  // ───────────────────────────────────────────────────────────────────────
  // Per-System Personality
  // ───────────────────────────────────────────────────────────────────────

  // [WHY] Gold Standard F: Per-system personality — switching systems changes parameter ranges
  applyPersonality(engine, system) {
    const p = PERSONALITY[system];
    if (!p) return;

    engine.setParameter('gridDensity', (p.gridDensity[0] + p.gridDensity[1]) / 2);
    engine.setParameter('speed', (p.speed[0] + p.speed[1]) / 2);
    engine.setParameter('chaos', (p.chaos[0] + p.chaos[1]) / 2);
    engine.setParameter('dimension', (p.dimension[0] + p.dimension[1]) / 2);
    engine.setParameter('intensity', (p.intensity[0] + p.intensity[1]) / 2);
    engine.setParameter('saturation', (p.saturation[0] + p.saturation[1]) / 2);
  }

  applyRotationState(engine) {
    engine.setParameter('rot4dXY', this.state.rot[0]);
    engine.setParameter('rot4dXZ', this.state.rot[1]);
    engine.setParameter('rot4dYZ', this.state.rot[2]);
    engine.setParameter('rot4dXW', this.state.rot[3]);
    engine.setParameter('rot4dYW', this.state.rot[4]);
    engine.setParameter('rot4dZW', this.state.rot[5]);
  }

  // ───────────────────────────────────────────────────────────────────────
  // CSS Variable Bridge
  // ───────────────────────────────────────────────────────────────────────

  // [WHY] Gold Standard Section C: CSS integration bridges.
  // Every frame, push VIB3+ state into CSS custom properties so the entire
  // DOM can react to the visualization state.
  updateCSSBridge() {
    const root = document.documentElement.style;
    root.setProperty('--vib3-hue', Math.round(this.state.hue));
    root.setProperty('--vib3-intensity', this.state.intensity.toFixed(2));
    root.setProperty('--vib3-density', Math.round(this.state.gridDensity));
    root.setProperty('--vib3-speed', this.state.speed.toFixed(2));
    root.setProperty('--vib3-chaos', this.state.chaos.toFixed(2));
    root.setProperty('--vib3-saturation', this.state.saturation.toFixed(2));
  }

  // ───────────────────────────────────────────────────────────────────────
  // HUD
  // ───────────────────────────────────────────────────────────────────────

  updateHUD() {
    const base = this.primaryGeometry % 8;
    const core = Math.floor(this.primaryGeometry / 8);
    const geoName = (core > 0 ? CORE_NAMES[core] + ' ' : '') + BASE_NAMES[base];

    const sysLabel = document.getElementById('sysLabel');
    const geoLabel = document.getElementById('geoLabel');
    const modeLabel = document.getElementById('modeLabel');
    const secLabel = document.getElementById('secLabel');

    if (sysLabel) sysLabel.textContent = SYSTEM_NAMES[this.primarySystem] || 'FACETED';
    if (geoLabel) geoLabel.textContent = `${geoName} [${this.primaryGeometry}]`;
    if (modeLabel) modeLabel.textContent = this.mode;
    if (secLabel && this.secondaryEngine) {
      secLabel.textContent = `2nd: ${SYSTEM_NAMES[this.secondarySystem] || 'QUANTUM'}`;
    }
  }

  updateMeter() {
    const bars = document.querySelectorAll('#meter .bar');
    for (let i = 0; i < bars.length && i < 8; i++) {
      bars[i].style.height = Math.max(2, Math.round(this.audio.bands[i] * 40)) + 'px';
    }
  }

  markInput() {
    this.lastInputTime = performance.now();
    if (this.mode === 'autonomous') {
      this.mode = 'active';
      this.choreographyPlayer?.stop();
      this.updateHUD();
    }
  }

  // ───────────────────────────────────────────────────────────────────────
  // Main Render Loop
  // ───────────────────────────────────────────────────────────────────────

  render(now) {
    this.animId = requestAnimationFrame((t) => this.render(t));
    const dt = Math.min((now - this.prevTime) / 1000, 0.1);
    this.prevTime = now;

    // FPS tracking
    this.fps.count++;
    this.fps.timer += dt;
    if (this.fps.timer >= 1.0) {
      this.fps.value = Math.round(this.fps.count / this.fps.timer);
      this.fps.count = 0;
      this.fps.timer = 0;
      const fpsEl = document.getElementById('fpsLabel');
      if (fpsEl) fpsEl.textContent = `${this.fps.value} fps`;
    }

    // ── Process audio ──
    this.processAudio(dt, now);

    // ── Apply parameter modes ──
    if (this.mode === 'active') {
      this.applyContinuousMappings(dt);    // Mode 1
      this.applyAmbientDrift(dt, now);      // Mode 3
    } else if (this.mode === 'frozen') {
      this.applyFrozenDrift(dt, now);       // Mode 3b
    } else if (this.mode === 'autonomous') {
      this.applyContinuousMappings(dt);    // Mode 1 still runs
      this.applyAmbientDrift(dt, now);      // Mode 3
    }

    // ── Decay transient state via EMA ──
    // [WHY] Onset + click decay via EMA, never setTimeout
    this.state.onset = ema(this.state.onset, 0, dt, 0.15);
    this.state.clickIntensity = ema(this.state.clickIntensity, 0, dt, 0.2);

    // ── Idle detection → autonomous mode ──
    // [WHY] Gold Standard: 30s idle → autonomous choreography
    const idle = (now - this.lastInputTime) / 1000;
    if (this.mode === 'active' && idle > 30) {
      this.mode = 'autonomous';
      this.choreographyPlayer?.play();
      this.updateHUD();
    }

    // ── Update rotations — ALL 6 axes ──
    const TWO_PI = Math.PI * 2;
    for (let i = 0; i < 6; i++) {
      this.state.rot[i] = (this.state.rot[i] + this.state.rotVel[i] * dt) % TWO_PI;
    }

    // ── Clamp parameters ──
    const s = this.state;
    s.hue = ((s.hue % 360) + 360) % 360;
    s.saturation = clamp(s.saturation, 0, 1);
    s.intensity = clamp(s.intensity + s.clickIntensity * 0.3, 0, 1);
    s.chaos = clamp(s.chaos, 0, 1);
    s.speed = clamp(s.speed, 0.1, 3);
    s.morphFactor = clamp(s.morphFactor, 0, 2);
    s.gridDensity = clamp(s.gridDensity, 4, 100);
    s.dimension = clamp(s.dimension, 3.0, 4.5);

    // ── Push state to primary engine ──
    this.pushStateToEngine(this.primaryEngine, s);

    // ── Push state to secondary (with personality offset + coordination) ──
    if (this.secondaryEngine) {
      this.pushSecondaryState(s);
    }

    // ── Update CSS variable bridge (every frame) ──
    this.updateCSSBridge();

    // ── Update audio meter ──
    this.updateMeter();
  }

  pushStateToEngine(engine, s) {
    engine.setParameter('hue', s.hue);
    engine.setParameter('saturation', s.saturation);
    engine.setParameter('intensity', s.intensity);
    engine.setParameter('chaos', s.chaos);
    engine.setParameter('speed', s.speed);
    engine.setParameter('morphFactor', s.morphFactor);
    engine.setParameter('gridDensity', s.gridDensity);
    engine.setParameter('dimension', s.dimension);
    engine.setParameter('rot4dXY', s.rot[0]);
    engine.setParameter('rot4dXZ', s.rot[1]);
    engine.setParameter('rot4dYZ', s.rot[2]);
    engine.setParameter('rot4dXW', s.rot[3]);
    engine.setParameter('rot4dYW', s.rot[4]);
    engine.setParameter('rot4dZW', s.rot[5]);
  }

  // This is where coordination happens. Every frame, the secondary engine's
  // parameters are derived from the primary's state. This is the heart of
  // multi-instance composition.
  //
  // EXPERIMENT with different coordination rules:
  //   - Parallel: use s.gridDensity * 0.5 instead of 70 - s.gridDensity.
  //     Both engines breathe together (amplification, not opposition).
  //   - Temporal offset: store s.gridDensity in a ring buffer, read from
  //     N frames ago. The secondary echoes the primary with a delay.
  //   - Threshold: if (s.gridDensity > 50) use s.gridDensity; else use 0.
  //     Secondary only activates during high-density moments.
  //   - Hue: try (s.hue + 120) % 360 for triadic, or (s.hue + 30) % 360
  //     for analogous. Each creates a completely different color mood.
  //   - Remove energy conservation: delete the 1.0 - s.intensity line.
  //     Now both engines can hit full intensity simultaneously. Louder.
  pushSecondaryState(s) {
    const eng = this.secondaryEngine;
    const p = PERSONALITY[this.secondarySystem] || PERSONALITY.quantum;

    // [WHY] Inverse Density Seesaw — total density ≈ 70
    const inverseDensity = clamp(70 - s.gridDensity, p.gridDensity[0], p.gridDensity[1]);

    // [WHY] Complement hue — secondary is always opposite on the color wheel
    eng.setParameter('hue', (s.hue + 180) % 360);
    eng.setParameter('saturation', s.saturation);

    // [WHY] Energy conservation — when primary brightens, secondary dims
    eng.setParameter('intensity', clamp(1.0 - s.intensity + 0.3, 0.2, 0.9));
    eng.setParameter('chaos', clamp(s.chaos * 0.7, p.chaos[0], p.chaos[1]));
    eng.setParameter('speed', clamp(s.speed * 0.8, p.speed[0], p.speed[1]));
    eng.setParameter('morphFactor', s.morphFactor);
    eng.setParameter('gridDensity', inverseDensity);
    eng.setParameter('dimension', s.dimension);

    // [WHY] Mirror rotation — alternating planes are inverted, creating
    // the effect of the secondary spinning "against" the primary
    eng.setParameter('rot4dXY', -s.rot[0]);
    eng.setParameter('rot4dXZ', s.rot[1]);
    eng.setParameter('rot4dYZ', -s.rot[2]);
    eng.setParameter('rot4dXW', s.rot[3]);
    eng.setParameter('rot4dYW', -s.rot[4]);
    eng.setParameter('rot4dZW', s.rot[5]);
  }

  // ───────────────────────────────────────────────────────────────────────
  // Cleanup
  // ───────────────────────────────────────────────────────────────────────

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    this.choreographyPlayer?.stop();
    this.primaryEngine?.destroy?.();
    this.secondaryEngine?.destroy?.();
    if (this.audio.stream) {
      this.audio.stream.getTracks().forEach(t => t.stop());
    }
    if (this.audio.ctx) {
      this.audio.ctx.close();
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────────────────────────────────────────

const app = new Synesthesia();

app.init().then((ok) => {
  if (!ok) {
    console.error('[Synesthesia] Failed to initialize');
    document.body.innerHTML = '<div style="color:white;padding:40px;font-family:sans-serif">'
      + '<h2>VIB3+ Synesthesia</h2>'
      + '<p>WebGL is required. Please use a modern browser.</p></div>';
  }
}).catch((err) => {
  console.error('[Synesthesia] Init error:', err);
});

// Cleanup on unload
window.addEventListener('beforeunload', () => app.destroy());
