# Report 2: Build - Scroll Choreography

**Agent**: B
**Date**: 2026-02-16
**Artifact**: `examples/dogfood/scroll-site/`

## 1. Implementation Strategy

### 1.1 The "Fixed Canvas" Pattern
I used a single full-screen `<canvas>` with `position: fixed; z-index: -1`. The HTML content scrolls *over* it. This creates a deeply immersive feel where the visualization is the environment, not just a widget.

### 1.2 Scroll Mapping
I mapped `window.scrollY` to two key parameters:
1.  **XW / YW Rotation**: As the user scrolls, the object rotates *into* the 4th dimension. This visualizes "depth" in a way that matches the physical action of scrolling down into content.
2.  **Hue**: The color spectrum cycles once fully over the length of the page (0-1).

### 1.3 System Transitions via IntersectionObserver
To create distinct "chapters", I used `IntersectionObserver` on the `<section>` elements.
*   **Hero**: Faceted (Clean, welcoming)
*   **Explainer**: Quantum (Complex, scientific)
*   **Playground**: Holographic (Interactive, layered)

I implemented a smooth cross-fade logic in the render loop. When the target system changes, `crossFade` lerps from 0 to 1, swapping the shader program at the midpoint (0.5) to mask the compilation hitch.

## 2. SDK Features Used

*   **All 3 Rendering Systems**: Demonstrated that they can coexist in one experience.
*   **Lattice Geometries**: Used specific geometries (Hypercube, Klein Bottle) to match the narrative content.
*   **4D Projection**: The `proj4D` function is essential for the "depth" effect.

## 3. Workarounds & Feedback

### 3.1 Shader Switching
Transitioning between systems requires recompiling or switching programs. In a full engine build, this might be handled by `VIB3Engine`. In this lightweight build, I had to manage the `gl.useProgram` calls manually.
*Feedback*: The SDK should expose a "Transition Manager" that handles cross-fading between systems automatically, even for custom implementations.

### 3.2 Scroll Performance
Binding directly to `scroll` events can cause jank. I used `requestAnimationFrame` for the render loop and just sampled the scroll position there, effectively decoupling the input rate from the render rate.

## 4. Final Result
The result is a smooth, narrative-driven experience that explains the 4D concepts visually. The scroll interaction feels natural and directly connected to the math.
