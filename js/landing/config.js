/**
 * Landing Page Configuration
 *
 * All parameter presets for each visualization section.
 * Morph stages define the 6-stage scroll-locked morphing experience.
 * Parameter coordination rules:
 *   - Density DROPS as elements expand (inverse relationship)
 *   - Speed and chaos RISE during dramatic moments, settle in calm phases
 *   - Rotations accumulate through stages for continuous motion
 */

export const heroParams = {
  geometry: 11, hue: 210, gridDensity: 28, speed: 0.4,
  intensity: 0.75, chaos: 0.05, morphFactor: 0.6,
  rot4dXW: 0.15, rot4dYW: 0.08, dimension: 3.6, saturation: 0.9,
};

// ── Morph Experience: 6 stages across 1200vh ──
// Each stage defines target parameters; choreography interpolates between them.
// density and expansion are inversely coordinated.
export const morphStages = [
  {
    name: 'Emergence', sub: 'A lattice awakens in four dimensions',
    geometry: 3, hue: 200, gridDensity: 10, speed: 0.25,
    chaos: 0.03, intensity: 0.55, morphFactor: 0.3, dimension: 3.9,
    rot4dXW: 0.1, rot4dYW: 0, rot4dZW: 0,
  },
  {
    name: 'Dimensional Shift', sub: 'Projections ripple through hyperspace',
    geometry: 11, hue: 270, gridDensity: 14, speed: 0.5,
    chaos: 0.12, intensity: 0.7, morphFactor: 0.6, dimension: 3.5,
    rot4dXW: 0.8, rot4dYW: 0.3, rot4dZW: 0,
  },
  {
    name: 'Three Voices', sub: 'Quantum \u00b7 Holographic \u00b7 Faceted',
    geometry: 4, hue: 310, gridDensity: 8, speed: 0.9,
    chaos: 0.25, intensity: 0.8, morphFactor: 0.8, dimension: 3.4,
    rot4dXW: 1.2, rot4dYW: 0.6, rot4dZW: 0.3,
  },
  {
    name: 'Convergence', sub: 'All engines synchronize',
    geometry: 16, hue: 45, gridDensity: 38, speed: 0.55,
    chaos: 0.04, intensity: 0.88, morphFactor: 1.1, dimension: 3.2,
    rot4dXW: 2.0, rot4dYW: 1.0, rot4dZW: 0.5,
  },
  {
    name: 'Spectral Rupture', sub: 'The fourth dimension breaks through',
    geometry: 5, hue: 0, gridDensity: 5, speed: 2.2,
    chaos: 0.75, intensity: 0.95, morphFactor: 1.6, dimension: 3.0,
    rot4dXW: 4.0, rot4dYW: 2.5, rot4dZW: 1.8,
  },
  {
    name: 'Resolution', sub: 'Settled into crystalline order',
    geometry: 7, hue: 180, gridDensity: 24, speed: 0.45,
    chaos: 0.08, intensity: 0.7, morphFactor: 0.5, dimension: 3.6,
    rot4dXW: 0.5, rot4dYW: 0.2, rot4dZW: 0,
  },
];

// ── Trinity (kept for system swap logic reference) ──
export const trinityParams = [
  { geometry: 3, hue: 195, gridDensity: 24, speed: 0.5, intensity: 0.8, chaos: 0.08, morphFactor: 0.5, dimension: 3.5, saturation: 0.85 },
  { geometry: 4, hue: 310, gridDensity: 18, speed: 0.4, intensity: 0.85, chaos: 0.12, morphFactor: 0.4, dimension: 3.7, saturation: 0.9 },
  { geometry: 1, hue: 45, gridDensity: 32, speed: 0.6, intensity: 0.75, chaos: 0.03, morphFactor: 0.8, dimension: 3.4, saturation: 0.8 },
];

export const energyCardParams = {
  geometry: 7, hue: 180, gridDensity: 26, speed: 0.6,
  intensity: 0.65, chaos: 0.08, morphFactor: 0.7, dimension: 3.5, saturation: 0.85,
};

export const energyBgParams = {
  geometry: 6, hue: 270, gridDensity: 20, speed: 0.4,
  intensity: 0.55, chaos: 0.12, dimension: 3.6, morphFactor: 0.7, saturation: 0.85,
};

export const agentBgParams = {
  geometry: 5, hue: 240, gridDensity: 16, speed: 0.3,
  intensity: 0.45, chaos: 0.2, dimension: 3.8, morphFactor: 0.6, saturation: 0.8,
};

export const playgroundDefaults = {
  geometry: 3, hue: 200, gridDensity: 24, speed: 1.0,
  morphFactor: 0.5, chaos: 0.2, intensity: 0.7,
  dimension: 3.5,
  rot4dXW: 0, rot4dYW: 0, rot4dZW: 0,
  rot4dXY: 0, rot4dXZ: 0, rot4dYZ: 0,
};

export const ctaParams = {
  geometry: 5, hue: 160, gridDensity: 18, speed: 0.35,
  intensity: 0.5, chaos: 0.2, dimension: 3.7, morphFactor: 0.5, saturation: 0.85,
};

// ── Opening Cinematic: VIB3CODE text mask over GPU canvas ──
export const openingParams = {
  geometry: 11, hue: 220, gridDensity: 22, speed: 0.3,
  intensity: 0.5, chaos: 0.05, morphFactor: 0.6, dimension: 3.8,
  rot4dXW: 0.1, rot4dYW: 0.05, saturation: 0.85,
};

// ── Parallax Triptych: two visualizer columns ──
export const parallaxParams = {
  left:  { geometry: 2, hue: 195, gridDensity: 22, speed: 0.4, intensity: 0.65, chaos: 0.15, morphFactor: 0.6, dimension: 3.5, saturation: 0.85 },
  right: { geometry: 4, hue: 310, gridDensity: 18, speed: 0.5, intensity: 0.65, chaos: 0.2, morphFactor: 0.7, dimension: 3.4, saturation: 0.9 },
};
