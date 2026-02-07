/**
 * Landing Page Configuration
 *
 * All parameter presets for each visualization section.
 * Each preset showcases a different VIB3+ aesthetic.
 */

export const heroParams = {
  geometry: 3, hue: 210, gridDensity: 28, speed: 0.4,
  intensity: 0.75, chaos: 0.05, morphFactor: 0.6,
  rot4dXW: 0.15, rot4dYW: 0.08, dimension: 3.6, saturation: 0.9,
};

export const trinityParams = [
  // Quantum: cool lattice, torus geometry, medium density
  { geometry: 3, hue: 195, gridDensity: 24, speed: 0.5, intensity: 0.8, chaos: 0.08, morphFactor: 0.5, dimension: 3.5, saturation: 0.85 },
  // Holographic: warm spectral, Klein bottle, lower density for moiré
  { geometry: 4, hue: 310, gridDensity: 18, speed: 0.4, intensity: 0.85, chaos: 0.12, morphFactor: 0.4, dimension: 3.7, saturation: 0.9 },
  // Faceted: golden precise, hypercube, high density for lattice clarity
  { geometry: 1, hue: 45, gridDensity: 32, speed: 0.6, intensity: 0.75, chaos: 0.03, morphFactor: 0.8, dimension: 3.4, saturation: 0.8 },
];

export const energyCardParams = {
  geometry: 7, hue: 180, gridDensity: 26, speed: 0.6,
  intensity: 0.65, chaos: 0.08, morphFactor: 0.7, dimension: 3.5, saturation: 0.85,
};

export const convergenceParams = {
  quantum:     { geometry: 0, hue: 200, gridDensity: 20, speed: 0.8, intensity: 0.7, chaos: 0.15 },
  holographic: { geometry: 3, hue: 300, gridDensity: 22, speed: 0.6, intensity: 0.7, chaos: 0.2 },
  faceted:     { geometry: 1, hue: 60, gridDensity: 18, speed: 0.7, intensity: 0.7, chaos: 0.1 },
};

export const energyBgParams = {
  geometry: 6, hue: 270, gridDensity: 16, speed: 0.3,
  intensity: 0.2, chaos: 0.05, dimension: 4.0,
};

export const ctaParams = {
  geometry: 5, hue: 160, gridDensity: 14, speed: 0.3,
  intensity: 0.2, chaos: 0.25, dimension: 4.0,
};
