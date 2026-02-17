# Report 1: Onboarding - Scroll Choreography

**Agent**: B
**Date**: 2026-02-16

## 1. Discovery Process

I started by reading `CLAUDE.md` to understand the high-level architecture. The concept of "Three Visualization Systems" (Quantum, Faceted, Holographic) stood out immediately as a powerful narrative device for a scroll-based website.

### 1.1 First Impressions
The documentation is dense but comprehensive. The mathematical foundation (Clifford algebra) is intimidating, but the SDK seems to abstract it well.

### 1.2 "Aha!" Moment
Realizing that **6D rotation** means I can rotate objects in ways impossible in 3D (XW, YW, ZW planes) gave me the core idea for the site: "Scroll to reveal the Fourth Dimension." As the user scrolls down, I can rotate the object into the W-plane, literally revealing its internal structure.

## 2. Architecture Decisions

I decided **not** to use the full `VIB3Engine` class because:
1.  I need extreme performance control for a scroll experience.
2.  I want to handle the canvas lifecycle manually to ensure it stays fixed in the background.
3.  I need to blend parameters between systems based on scroll position, which `switchSystem()` in the engine does somewhat abruptly.

Instead, I will implement a lightweight WebGL renderer that shares the GLSL logic but manages state via a simple JS object driven by scroll events.

## 3. Confusion Points

*   **Shader Source**: It wasn't immediately clear where the "master" GLSL code lived. `synesthesia.html` seems to have a copy, `src/shaders` has files, and the JS classes have inline strings. I will treat `synesthesia.html` as the source of truth for the standalone shader logic.
