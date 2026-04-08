/**
 * VIB3+ Accent System — TypeScript Declarations
 *
 * The accent system is the CSS projection of the LayerRelationshipGraph.
 * Maps visualization parameters to CSS custom properties using color theory
 * and the same relationship math (complement, harmonic, reactive, echo, chase)
 * used internally by the SDK's layer system.
 */

export interface AccentSystemOptions {
  /** Element to set CSS custom properties on (default: document.documentElement) */
  root?: Element;
  /** Override EMA tau values per parameter (seconds) */
  taus?: Partial<Record<AccentParam, number>>;
}

export type AccentParam =
  | 'hue' | 'saturation' | 'intensity' | 'chaos'
  | 'speed' | 'dimension' | 'morphFactor' | 'gridDensity'
  | 'rot4dXW' | 'rot4dYW' | 'rot4dZW';

/** Object with a `.params` property matching VIB3+ adapter shape */
export interface AccentAdapter {
  params: Partial<Record<AccentParam, number>>;
}

/** Map of CSS custom property name → value string */
export interface AccentDerivedVars {
  '--accent-hue': string;
  '--accent-complement': string;
  '--accent-split-warm': string;
  '--accent-split-cool': string;
  '--accent-analogous-a': string;
  '--accent-analogous-b': string;
  '--accent-harmonic': string;
  '--accent-saturation': string;
  '--glass-depth': string;
  '--glass-blur': string;
  '--glass-tint': string;
  '--energy-intensity': string;
  '--energy-hue': string;
  '--energy-pulse': string;
  '--depth-shadow': string;
  '--depth-shadow-alpha': string;
  '--depth-radius': string;
  '--depth-lift': string;
  '--rhythm-duration': string;
  '--rhythm-ease': string;
}

export declare class AccentSystem {
  constructor(options?: AccentSystemOptions);

  /**
   * Read adapter params and update CSS custom properties.
   * Call once per frame from your render loop.
   */
  update(adapter: AccentAdapter | null, ts: number): void;

  /** Get current smoothed parameter values (read-only snapshot) */
  getSmoothed(): Record<AccentParam, number>;

  /**
   * Compute derived CSS values without setting them (pure function).
   * Useful for SSR or testing.
   */
  static derive(params: Partial<Record<AccentParam, number>>): AccentDerivedVars;
}
