# VIB3+ Landing Page Refactor Plan

**Date:** 2026-02-13
**Status:** Phase 1 Complete (CSS extraction + redirect)

---

## Problem Statement

The root `index.html` served by GitHub Pages was a bare SDK controls demo (sliders + canvas), not a landing page. The actual landing page at `site/index.html` existed but was:
- **1,978 lines monolithic** — 1,318 lines of inline `<style>` + 660 lines of HTML
- Not the default page visitors see
- Hero section only mentioned "Three Systems / 24 Geometries / 6D Rotation" — ignored the C++ WASM core, WebGPU backend, TypeScript definitions, MCP server

---

## What Was Done (Phase 1)

### 1. CSS Extraction: `site/index.html` (1978 → 659 lines)

**Before:**
```
site/index.html           1978 lines (1318 CSS + 660 HTML)
site/styles/overlay-accents.css   243 lines
site/styles/reveal-layers.css     401 lines
```

**After:**
```
site/index.html           659 lines (pure HTML + semantic structure)
site/styles/main.css      1318 lines (extracted from inline <style>)
site/styles/overlay-accents.css   243 lines (unchanged)
site/styles/reveal-layers.css     401 lines (unchanged)
```

All 1,318 lines of inline CSS moved to `site/styles/main.css`. The HTML now links:
```html
<link rel="stylesheet" href="./styles/main.css">
<link rel="stylesheet" href="./styles/overlay-accents.css">
<link rel="stylesheet" href="./styles/reveal-layers.css">
```

### 2. Root Redirect

**Before:** Root `index.html` was the raw SDK controls demo.
**After:** Root `index.html` is a meta-refresh redirect to `site/index.html`.

The raw demo moved to `demo/index.html` (import paths adjusted from `./src/` to `../src/`).

### 3. Content Updates

| Location | Before | After |
|----------|--------|-------|
| Hero badge | `v2.0.1 — Three Systems · 24 Geometries · 6D Rotation` | `v2.0.3 — C++ WASM Core · WebGPU + WebGL · TypeScript` |
| Hero subtitle | "The fourth dimension, rendered..." | "4D visualization SDK with a C++ Clifford algebra core compiled to WASM..." |
| Hero system label | `Quantum Lattice Engine` | `C++ WASM · WebGPU · WebGL · MCP Agentic Control` |
| Opening subtitle | `4D Visualization Engine` | `C++ WASM · WebGPU · WebGL · TypeScript · MCP` |
| Triptych heading | `Three Systems. One Heartbeat.` | `Three Systems. One C++ Core.` |
| Triptych stats | 24 Geometries / 6D Rotation / 3 Systems | C++ WASM Core / 24 Geometries / 6D Rotation / 19 MCP Tools |
| CTA description | "WebGPU primary, WebGL fallback, C++ WASM math core" | Full architecture mention (Cl(4,0), dual backend, TS, MCP, framework integrations) |
| CTA install | `npm install` | `pnpm add` |
| Agent section | "Drop VIB3+ into any AI agent workflow" | "19-tool MCP server with JSON-RPC 2.0..." |

---

## File Structure After Refactor

```
/                           Root
├── index.html              Redirect → site/index.html
├── demo/
│   └── index.html          SDK controls demo (moved from root)
├── site/
│   ├── index.html          Landing page (659 lines, HTML only)
│   ├── styles/
│   │   ├── main.css        Core landing page styles (1318 lines)
│   │   ├── overlay-accents.css  Overlay accent effects (243 lines)
│   │   └── reveal-layers.css   Reveal layer choreography (401 lines)
│   └── js/
│       ├── main.js         Boot script + GPU pool orchestrator (466 lines)
│       ├── config.js       Section parameter presets (107 lines)
│       ├── adapters.js     SDK system adapters (Quantum/Holographic/Faceted + AmbientLattice) (582 lines)
│       ├── choreography.js GSAP scroll choreography (~1000+ lines)
│       ├── ContextPool.js  WebGL context budget manager
│       ├── CardTiltSystem.js  Mouse/touch → CSS 3D tilt + visualizer param mapping
│       ├── overlay-choreography.js  Overlay layer scroll choreography
│       └── reveal-choreography.js   Reveal layer scroll choreography
├── docs/                   Gallery + exports + test hub
└── src/                    SDK source (unchanged)
```

---

## Phase 2 (Future)

Potential further cleanup:
- Extract remaining inline styles from `site/styles/main.css` into semantic sub-files (e.g., `hero.css`, `morph.css`, `playground.css`, `cascade.css`, etc.)
- Consider a build step (even simple CSS concat) to reduce HTTP requests
- Add proper `<nav>` component with links to Demo, Gallery, GitHub, npm
- Add architecture diagram section showing the full stack (C++ → WASM → JS/TS → WebGPU/WebGL → Canvas)
