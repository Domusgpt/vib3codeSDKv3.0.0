/**
 * VIB3+ Accent System — barrel export
 *
 * The accent system is the CSS projection of the LayerRelationshipGraph.
 * It maps visualization parameters to CSS custom properties using the same
 * color theory and relationship math the SDK uses internally.
 *
 * Usage:
 *   import { AccentSystem } from '@vib3code/sdk/accent';
 *   const accent = new AccentSystem();
 *   // In your render loop:
 *   accent.update(adapter, timestamp);
 *
 * CSS: Import accent.css for the utility classes (.vib3-glass, .vib3-text, etc.)
 *
 * @module accent
 */
export { AccentSystem } from './AccentSystem.js';
