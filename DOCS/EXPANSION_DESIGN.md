Last reviewed: 2026-02-17

# VIB3+ Premium Tier — Expansion Design Document

**Purpose**: Technical specification for `@vib3code/premium`, a separate npm package that extends the free `@vib3code/sdk` with fine-grained shader control, axis locking, per-layer geometry, event-triggered state changes, and live CSS/framework integration.

**Status**: Design document. No code implemented yet.
**Date**: Feb 16, 2026
**Based on**: Deep analysis of all shader GLSL, layer system, event architecture, and licensing model in the free SDK.

---

## Architecture Overview

### Package Relationship

```
@vib3code/sdk (free, MIT)          @vib3code/premium (paid)
┌──────────────────────────┐       ┌──────────────────────────┐
│ VIB3Engine               │◄──────│ enablePremium(engine)    │
│ 3 visualization systems  │       │                          │
│ 24 geometries            │       │ ShaderParameterSurface   │
│ LayerRelationshipGraph   │       │ RotationLockSystem       │
│ ChoreographyPlayer       │       │ LayerGeometryMixer       │
│ TransitionAnimator       │       │ VisualEventSystem        │
│ ColorPresetsSystem       │       │ CSSBridge                │
│ AestheticMapper          │       │ ChoreographyExtensions   │
│ 14 core MCP tools        │       │ FrameworkSync            │
│ ReactivityManager        │       │ 8+ premium MCP tools     │
│ SpatialInputSystem       │       │                          │
│ onParameterChange()      │       │ PremiumMCPServer         │
└──────────────────────────┘       └──────────────────────────┘
```

Premium imports from free SDK as a **peer dependency**. Free SDK never imports from premium. One-directional dependency.

### How Premium Wraps the Engine

```javascript
import { VIB3Engine } from '@vib3code/sdk';
import { enablePremium } from '@vib3code/premium';

const engine = new VIB3Engine({ system: 'holographic' });
await engine.initialize(container);

const premium = enablePremium(engine, {
    licenseKey: 'VIB3-PRO-xxxx-xxxx',
    features: ['all']  // or specific: ['shaderSurface', 'rotationLock', 'events']
});

// Premium modules are now active
premium.shaderSurface.setParameter('projectionType', 1);
premium.rotationLock.setFlightMode(true);
premium.events.addTrigger('bass_drop', { ... });
premium.cssBridge.start({ target: document.documentElement });
```

### Public API Surface

```javascript
// enablePremium() returns:
{
    shaderSurface: ShaderParameterSurface,
    rotationLock: RotationLockSystem,
    layerGeometry: LayerGeometryMixer,
    events: VisualEventSystem,
    cssBridge: CSSBridge,
    choreography: ChoreographyExtensions,
    frameworkSync: FrameworkSync,
    mcp: PremiumMCPServer,
    destroy(): void
}
```

---

## Module 1: ShaderParameterSurface

**File**: `src/ShaderParameterSurface.js`
**Purpose**: Exposes 8 hardcoded shader values as controllable parameters.

### What's Currently Hardcoded (from shader analysis)

| Value | Where in GLSL | Current Value | Why It Should Be a Parameter |
|-------|--------------|---------------|------------------------------|
| Projection distance | `float w = 2.5 / (2.5 + p.w)` | 2.5 | `u_dimension` is supposed to control this but doesn't. This fix alone unlocks the `dimension` parameter |
| Projection type | Only perspective exists | 0 | Stereographic (`xyz / (1-w)`) and orthographic (`xyz`) are documented in CLAUDE.md but never implemented |
| UV scale | `uv * 3.0` | 3.0 | Controls zoom into 4D space. Different scales reveal different pattern features |
| Smoothstep threshold | `smoothstep(0.03, 0.04, ...)` | ~0.03 | Controls wireframe line thickness. Dramatic visual difference between 0.005 and 0.15 |
| Chaos noise frequencies | `sin(x*7)*cos(y*11)*sin(z*13)` | (7, 11, 13) | Different prime triples create different noise textures |
| Breath modulation strength | `1.0 + breath * 0.3` / `0.4` / `0.5` | Varies per system | Should be unified and controllable |
| Holographic auto-rotation speeds | `time * 0.1`, `0.12`, `0.08`, `0.2`, `0.15`, `0.25` | Per-axis | Currently only Holographic has auto-rotation; these speeds are hardcoded |
| Quantum particle size | `step(0.2, ...)` / `step(0.1, ...)` | 0.2 / 0.1 per layer | Controls particle dot size in Quantum system |

### API

```javascript
class ShaderParameterSurface {
    constructor(engine) { }

    // Set a shader parameter (validates range, forwards to active system)
    setParameter(name, value): void
    getParameter(name): number | number[]
    getParameterSchema(): Object  // JSON Schema for all shader params

    // Batch set
    setParameters(params: Object): void

    // Reset to defaults
    reset(): void

    // Supported parameters:
    // 'projectionType'      - int 0-2 (perspective/stereographic/orthographic)
    // 'uvScale'             - float 1.0-8.0
    // 'lineThickness'       - float 0.005-0.15
    // 'noiseFrequency'      - [float, float, float] each 1-50
    // 'breathStrength'      - float 0-1
    // 'autoRotationSpeed'   - [float x6] each 0-0.5 (XY,XZ,YZ,XW,YW,ZW)
    // 'particleSize'        - float 0.02-0.5
    // 'layerAlpha'          - { background, shadow, content, highlight, accent } each 0-1
}
```

### Implementation Strategy

This module wraps `engine.onParameterChange()` to intercept render updates. When a shader parameter is set, it modifies the GLSL shader strings dynamically (replacing hardcoded values with the new values) or — more practically — patches the system's `_buildUniforms()` method to include the new uniforms.

**Approach A (preferred)**: Add uniform declarations to each system's shader source. The shader code already has `#define`-like patterns we can augment. Add `uniform float u_uvScale;`, etc. and change `uv * 3.0` to `uv * u_uvScale`. This requires modifying the free SDK's shader strings — we'd submit PRs upstream for the uniform declarations (keeping defaults identical) and the premium module sends the actual values.

**Approach B (no-upstream-change)**: Use WebGL `uniform` injection post-compilation. After the free SDK compiles its shader, premium locates the uniform locations and sets them. This only works for uniforms already declared — so it doesn't help with adding NEW uniforms. Less clean but zero upstream changes.

**Recommended**: Approach A. Submit a PR to the free SDK that adds the uniform declarations with default values matching the current hardcoded values. This is a **no-behavior-change** PR. Then the premium module sends the actual configurable values.

### MCP Tool

```javascript
{
    name: 'set_shader_parameter',
    description: 'Set fine-grained shader parameters (premium)',
    inputSchema: {
        type: 'object',
        properties: {
            projectionType: { type: 'integer', minimum: 0, maximum: 2 },
            uvScale: { type: 'number', minimum: 1.0, maximum: 8.0 },
            lineThickness: { type: 'number', minimum: 0.005, maximum: 0.15 },
            noiseFrequency: { type: 'array', items: { type: 'number' }, minItems: 3, maxItems: 3 },
            breathStrength: { type: 'number', minimum: 0, maximum: 1 },
            autoRotationSpeed: { type: 'array', items: { type: 'number' }, minItems: 6, maxItems: 6 },
            particleSize: { type: 'number', minimum: 0.02, maximum: 0.5 },
            layerAlpha: { type: 'object' }
        }
    }
}
```

---

## Module 2: RotationLockSystem

**File**: `src/RotationLockSystem.js`
**Purpose**: Lock rotation axes at fixed values and provide "flight mode" — stable screen orientation while 4D content streams past.

### Why This Matters

When an agent animates `rot4dXW` to create a "portal" effect, other inputs (audio reactivity, spatial input, user interaction) can also change `rot4dXY`/`rot4dXZ`/`rot4dYZ`, causing the screen-plane orientation to drift. Axis locking prevents this — the portal effect stays clean.

"Flight mode" is a preset: lock all 3D rotations (XY/XZ/YZ) at their current values, leaving 4D rotations (XW/YW/ZW) free. The result: the viewport is stable, and 4D geometry "flies through" it as hyperspace rotations are animated.

### API

```javascript
class RotationLockSystem {
    constructor(engine) { }

    // Lock a specific axis at current value or specified value
    lockAxis(axisName: string, value?: number): void
    // axisName: 'rot4dXY' | 'rot4dXZ' | 'rot4dYZ' | 'rot4dXW' | 'rot4dYW' | 'rot4dZW'

    // Unlock a specific axis
    unlockAxis(axisName: string): void

    // Lock all 3D rotations, free all 4D rotations
    setFlightMode(enabled: boolean): void

    // Get lock state
    isLocked(axisName: string): boolean
    getLockedValue(axisName: string): number | null
    getLockedAxes(): string[]

    // Convenience: lock all axes
    lockAll(values?: Object): void
    unlockAll(): void

    destroy(): void
}
```

### Implementation

Intercepts `engine.setParameter()` by wrapping it:

```javascript
const originalSetParameter = engine.setParameter.bind(engine);
engine.setParameter = (name, value) => {
    if (this._locks.has(name)) {
        // Silently ignore — axis is locked
        return;
    }
    originalSetParameter(name, value);
};
```

Also intercepts `engine.updateCurrentSystemParameters()` to enforce locked values:

```javascript
const originalUpdate = engine.updateCurrentSystemParameters.bind(engine);
engine.updateCurrentSystemParameters = () => {
    // Override locked axes in the parameter manager before update
    for (const [axis, lockedValue] of this._locks) {
        engine.parameters.setParameter(axis, lockedValue);
    }
    originalUpdate();
};
```

### MCP Tool

```javascript
{
    name: 'set_rotation_lock',
    description: 'Lock or unlock rotation axes. Use flight mode to lock 3D rotations while 4D rotates freely (premium)',
    inputSchema: {
        type: 'object',
        properties: {
            axes: { type: 'array', items: { type: 'string' } },
            locked: { type: 'boolean' },
            values: { type: 'array', items: { type: 'number' } },
            flightMode: { type: 'boolean' }
        }
    }
}
```

---

## Module 3: LayerGeometryMixer

**File**: `src/LayerGeometryMixer.js`
**Purpose**: Allow each of the 5 layers to render a different geometry.

### Current Limitation

Geometry is global: `engine.setParameter('geometry', 16)` sets all layers to geometry 16. The LayerRelationshipGraph relationship functions pass `geometry` through unchanged — none of the 6 preset relationship types (echo, mirror, complement, harmonic, reactive, chase) modify the `geometry` key.

### How It Works

The shader uniform `u_geometry` (float) is already sent per-visualizer-instance. Each HolographicVisualizer/QuantumVisualizer instance has its own WebGL context with its own uniform state. So geometrically, per-layer geometry IS possible — we just need to get different geometry values into each layer's resolved parameters.

**Approach**: Register custom relationship functions on the LayerRelationshipGraph that override the `geometry` key:

```javascript
// Custom relationship that offsets geometry
engine.activeSystem.layerGraph.setRelationship('shadow', (kp, time) => ({
    ...kp,
    geometry: (kp.geometry + 8) % 24  // Same base shape, next warp type
}));
```

The LayerGeometryMixer wraps this into a clean API.

### Verification Needed

Before implementation, verify that `RealHolographicSystem.updateParameters()` doesn't override per-layer geometry with the global value. The research suggests it builds a single `currentVariant` and calls `generateVariantParams(variant)` for all layers — this may need patching.

### API

```javascript
class LayerGeometryMixer {
    constructor(engine) { }

    // Set explicit geometry for a layer
    setLayerGeometry(layerName: string, geometry: number): void

    // Use geometry offset from keystone (same base, different warp)
    setGeometryOffset(layerName: string, offset: number): void

    // Clear per-layer geometry (revert to keystone geometry)
    clearLayerGeometry(layerName: string): void

    // Get current per-layer geometries
    getLayerGeometries(): { background: number, shadow: number, content: number, highlight: number, accent: number }

    destroy(): void
}
```

### New Relationship Presets

```javascript
// Added to LayerRelationshipGraph preset library:
function geometryOffset(config = {}) {
    const { offset = 8, ...echoConfig } = config;
    const echoFn = echo(echoConfig);
    return (kp, time) => ({
        ...echoFn(kp, time),
        geometry: ((kp.geometry || 0) + offset) % 24
    });
}

function geometrySplit(config = {}) {
    // Explicit per-layer geometry assignment
    return (kp, time) => ({
        ...kp,
        geometry: config.geometry ?? kp.geometry
    });
}
```

### MCP Tool

```javascript
{
    name: 'set_layer_geometry',
    description: 'Set geometry per layer. Each layer can render a different geometry variant (premium)',
    inputSchema: {
        type: 'object',
        properties: {
            layer: { type: 'string', enum: ['background', 'shadow', 'content', 'highlight', 'accent'] },
            geometry: { type: 'integer', minimum: 0, maximum: 23 },
            offset: { type: 'integer', minimum: -23, maximum: 23 }
        }
    }
}
```

---

## Module 4: VisualEventSystem

**File**: `src/VisualEventSystem.js`
**Purpose**: Threshold-based triggers that fire discrete state changes — not continuous parameter mappings. "When X happens, DO Y."

### Why This Matters

The free SDK has continuous reactivity (audio→parameter mapping via ReactivityManager) and timed animation (TransitionAnimator, ParameterTimeline, ChoreographyPlayer). But there's no way to say "when bass exceeds 0.8, switch to storm profile for 3 seconds." That's an EVENT — a discrete state change with a trigger, an action, and optionally a revert.

This is what makes VIB3+ feel intentional rather than random. Without events, audio reactivity just produces continuous wobble. WITH events, a bass drop can trigger a dramatic visual state change.

### API

```javascript
class VisualEventSystem {
    constructor(engine, premium) { }

    // Add a trigger
    addTrigger(id: string, config: TriggerConfig): void

    // Remove a trigger
    removeTrigger(id: string): void

    // List all triggers
    listTriggers(): TriggerConfig[]

    // Emit a custom event (for external code to trigger actions)
    emit(eventName: string, data?: Object): void

    // Subscribe to trigger fires
    on(eventName: string, callback: Function): () => void  // returns unsubscribe

    // Enable/disable
    setEnabled(enabled: boolean): void

    destroy(): void
}

// TriggerConfig:
{
    source: string,           // 'parameter.chaos' | 'audio.bass' | 'audio.mid' | 'audio.high' | 'audio.energy' | 'custom.eventName'
    condition: string,        // 'exceeds' | 'drops_below' | 'crosses' | 'equals'
    threshold: number,
    cooldown: number,         // ms before trigger can fire again (default: 1000)
    action: {
        type: string,         // 'layer_profile' | 'color_preset' | 'set_parameters' | 'transition' | 'custom'
        value: any,           // profile name, preset name, params object, or custom handler
        duration?: number,    // ms to hold the action state (optional)
        revertTo?: any,       // what to revert to after duration (optional)
        easing?: string,      // for transitions
        transition?: boolean  // smooth transition to the new state
    }
}
```

### Implementation

Uses `engine.onParameterChange()` to watch parameter sources. Uses audio input via `engine.reactivity` events or direct audio polling for audio sources.

Each frame:
1. Read current values for all watched sources
2. Evaluate trigger conditions against thresholds
3. Check cooldown timers
4. Fire actions for triggered events
5. Check duration timers for active timed actions
6. Revert expired timed actions

### Example Patterns

```javascript
// Bass drop triggers storm mode
events.addTrigger('bass_storm', {
    source: 'audio.bass',
    condition: 'exceeds',
    threshold: 0.8,
    cooldown: 3000,
    action: {
        type: 'layer_profile',
        value: 'storm',
        duration: 2000,
        revertTo: 'holographic'
    }
});

// High chaos triggers red alert color
events.addTrigger('chaos_alert', {
    source: 'parameter.chaos',
    condition: 'exceeds',
    threshold: 0.7,
    cooldown: 5000,
    action: {
        type: 'set_parameters',
        value: { hue: 0, saturation: 1, intensity: 1 },
        duration: 1500,
        easing: 'elastic',
        transition: true
    }
});

// Geometry reaches hypertetra range → cosmic color preset
events.addTrigger('hypertetra_cosmic', {
    source: 'parameter.geometry',
    condition: 'exceeds',
    threshold: 15.5,  // entering 16+ range
    cooldown: 0,      // fires every time
    action: {
        type: 'color_preset',
        value: 'Cosmic Nebula',
        transition: true
    }
});

// Custom event from external code
events.addTrigger('card_flip', {
    source: 'custom.card_flip',
    condition: 'equals',
    threshold: 1,
    cooldown: 500,
    action: {
        type: 'transition',
        value: { rot4dXW: 0.9, gridDensity: 12 },
        easing: 'easeOutQuad',
        duration: 800
    }
});
```

### MCP Tools

```javascript
// add_visual_trigger
{
    name: 'add_visual_trigger',
    description: 'Add a threshold-based event trigger (premium)',
    inputSchema: {
        type: 'object',
        required: ['id', 'source', 'condition', 'threshold', 'action'],
        properties: {
            id: { type: 'string' },
            source: { type: 'string' },
            condition: { type: 'string', enum: ['exceeds', 'drops_below', 'crosses', 'equals'] },
            threshold: { type: 'number' },
            cooldown: { type: 'number' },
            action: { type: 'object' }
        }
    }
}

// remove_visual_trigger
{
    name: 'remove_visual_trigger',
    description: 'Remove a visual event trigger by ID (premium)',
    inputSchema: { type: 'object', required: ['id'], properties: { id: { type: 'string' } } }
}

// list_visual_triggers
{
    name: 'list_visual_triggers',
    description: 'List all active visual event triggers (premium)',
    inputSchema: { type: 'object', properties: {} }
}
```

---

## Module 5: CSSBridge

**File**: `src/CSSBridge.js`
**Purpose**: Live bidirectional binding between VIB3+ parameters and CSS custom properties.

### Why This Matters

CSS animations, transforms, and layout properties can express things WebGL cannot: text, DOM elements, box shadows, blur filters, clip paths. When VIB3+ parameter state drives CSS custom properties in real-time, the ENTIRE page becomes part of the visualization — not just the canvas rectangles.

Conversely, CSS animations (scroll position, hover states, transition values) can drive VIB3+ parameters, creating page interactions that directly control the 4D visualization.

### API

```javascript
class CSSBridge {
    constructor(engine) { }

    // Start the bridge
    start(options?: CSSBridgeOptions): void

    // Stop the bridge
    stop(): void

    // Manually push a parameter value to CSS
    pushToCSS(name: string, value: number): void

    // Manually read a CSS custom property and push to engine
    pullFromCSS(name: string): number

    // Check if running
    isActive(): boolean

    destroy(): void
}

// CSSBridgeOptions:
{
    target: HTMLElement,          // default: document.documentElement
    prefix: string,              // default: 'vib3' (produces --vib3-hue, etc.)
    outbound: boolean,           // default: true (engine → CSS)
    inbound: boolean,            // default: false (CSS → engine)
    throttle: number,            // default: 16 (ms, ~60fps)
    parameters: string[],        // which params to bridge. default: all
    inboundParameters: string[], // which CSS vars to watch for inbound. default: none
    normalize: boolean           // default: true (normalize ranges to 0-1 for CSS)
}
```

### Outbound (VIB3+ → CSS)

Subscribes to `engine.onParameterChange()`. On each update (throttled):

```javascript
for (const param of this.parameters) {
    const value = params[param];
    const cssName = `--${this.prefix}-${this.kebabCase(param)}`;

    if (this.normalize) {
        // Normalize to 0-1 range for easier CSS calc()
        const { min, max } = this.paramRanges[param];
        const normalized = (value - min) / (max - min);
        this.target.style.setProperty(cssName, normalized);
        this.target.style.setProperty(`${cssName}-raw`, value);
    } else {
        this.target.style.setProperty(cssName, value);
    }
}
```

**CSS output example** (with `normalize: true`):
```css
:root {
    --vib3-hue: 0.611;          /* 220/360 normalized */
    --vib3-hue-raw: 220;        /* raw value */
    --vib3-grid-density: 0.375; /* (40-4)/(100-4) normalized */
    --vib3-grid-density-raw: 40;
    --vib3-rot4d-xw: 0.225;    /* (0.9-(-2))/(2-(-2)) normalized */
    --vib3-rot4d-xw-raw: 0.9;
    --vib3-chaos: 0.1;          /* already 0-1 range */
    --vib3-chaos-raw: 0.1;
    --vib3-intensity: 0.7;
    --vib3-intensity-raw: 0.7;
}
```

**CSS usage examples:**
```css
/* Card tilt follows 4D rotation */
.card {
    transform: perspective(800px)
               rotateY(calc(var(--vib3-rot4d-xw) * 30deg - 15deg));
}

/* Shadow grows with grid density decrease (lower density = more shadow) */
.card-shadow {
    box-shadow: 0
                calc((1 - var(--vib3-grid-density)) * 24px)
                calc((1 - var(--vib3-grid-density)) * 40px)
                rgba(0, 0, 0, calc(0.1 + var(--vib3-intensity) * 0.3));
}

/* Background blur follows chaos */
.background {
    filter: blur(calc(var(--vib3-chaos) * 20px));
}

/* Text color from VIB3+ hue */
.title {
    color: hsl(calc(var(--vib3-hue-raw) * 1deg), 80%, 65%);
}

/* Clip path deforms with chaos */
.blob {
    border-radius: calc(30% + var(--vib3-chaos) * 20%);
}
```

### Inbound (CSS → VIB3+)

Uses `requestAnimationFrame` polling (MutationObserver doesn't fire for CSS custom property changes from animations):

```javascript
function pollCSSProperties() {
    for (const cssParam of this.inboundParameters) {
        const cssName = `--${this.prefix}-input-${this.kebabCase(cssParam)}`;
        const raw = getComputedStyle(this.target).getPropertyValue(cssName);
        const value = parseFloat(raw);
        if (!isNaN(value) && value !== this._lastInbound[cssParam]) {
            this._lastInbound[cssParam] = value;
            engine.setParameter(cssParam, this.denormalize(cssParam, value));
        }
    }
    if (this._active) requestAnimationFrame(pollCSSProperties);
}
```

**CSS input example:**
```css
/* Scroll drives 4D rotation via CSS custom property */
:root {
    --vib3-input-rot4d-xw: 0;
}
@keyframes scroll-drive {
    from { --vib3-input-rot4d-xw: 0; }
    to   { --vib3-input-rot4d-xw: 1; }
}
html {
    animation: scroll-drive linear;
    animation-timeline: scroll(root);
}
```

### MCP Tool

```javascript
{
    name: 'configure_css_bridge',
    description: 'Configure live CSS custom property binding (premium)',
    inputSchema: {
        type: 'object',
        properties: {
            enabled: { type: 'boolean' },
            outbound: { type: 'boolean' },
            inbound: { type: 'boolean' },
            parameters: { type: 'array', items: { type: 'string' } },
            throttle: { type: 'number' },
            normalize: { type: 'boolean' }
        }
    }
}
```

---

## Module 6: ChoreographyExtensions

**File**: `src/ChoreographyExtensions.js`
**Purpose**: Extend ChoreographyPlayer scenes with `layer_profile` and `layer_overrides` fields.

### Current Limitation

`ChoreographyScene` in the free SDK supports: `system`, `geometry`, `transition_in`, `tracks`, `color_preset`, `post_processing`, `audio`. It does NOT support: `layer_profile`, `layer_overrides`, `triggers`.

### Extended Scene Format

```javascript
{
    // Existing fields (free SDK):
    system: 'holographic',
    geometry: 16,
    transition_in: { type: 'smooth', duration: 800 },
    tracks: {
        gridDensity: [
            { time: 0, value: 40 },
            { time: 0.5, value: 14, easing: 'easeOutQuad' },
            { time: 1, value: 28, easing: 'easeOut' }
        ]
    },
    color_preset: 'Cosmic Nebula',

    // NEW premium fields:
    layer_profile: 'storm',
    layer_overrides: {
        shadow: { type: 'echo', config: { densityScale: 1.5 } },
        accent: { type: 'reactive', config: { gain: 4.0, decay: 0.85 } }
    },
    triggers: [
        {
            source: 'audio.bass',
            condition: 'exceeds',
            threshold: 0.8,
            action: { type: 'layer_profile', value: 'storm', duration: 2000, revertTo: 'holographic' }
        }
    ],
    rotation_locks: {
        rot4dXY: 0,
        rot4dXZ: 0,
        rot4dYZ: 0
    }
}
```

### Implementation

Wraps `ChoreographyPlayer._enterScene()` by monkey-patching or using the `onSceneChange` callback:

```javascript
class ChoreographyExtensions {
    constructor(engine, premium, choreographyPlayer) {
        choreographyPlayer.onSceneChange = (index, scene) => {
            // Apply layer profile
            if (scene.layer_profile && engine.activeSystem?.loadRelationshipProfile) {
                engine.activeSystem.loadRelationshipProfile(scene.layer_profile);
            }

            // Apply layer overrides
            if (scene.layer_overrides && engine.activeSystem?.layerGraph) {
                for (const [layer, config] of Object.entries(scene.layer_overrides)) {
                    engine.activeSystem.layerGraph.setRelationship(layer, config.type, config.config);
                }
            }

            // Register scene triggers
            if (scene.triggers && premium.events) {
                // Clear previous scene's triggers
                premium.events.clearSceneTriggers();
                for (const trigger of scene.triggers) {
                    premium.events.addTrigger(`scene_${index}_${trigger.source}`, trigger);
                }
            }

            // Apply rotation locks
            if (scene.rotation_locks && premium.rotationLock) {
                premium.rotationLock.unlockAll();
                for (const [axis, value] of Object.entries(scene.rotation_locks)) {
                    premium.rotationLock.lockAxis(axis, value);
                }
            }
        };
    }
}
```

---

## Module 7: FrameworkSync

**File**: `src/FrameworkSync.js`
**Purpose**: Bidirectional state sync between VIB3+ engine and React/Vue/Svelte frameworks.

### Current Limitation

The free SDK's framework integrations (Vib3React.js, Vib3Vue.js, Vib3Svelte.js) generate code that pushes props→engine but never subscribes to engine→framework state. If audio reactivity or spatial input changes a parameter, the framework state goes stale.

### Implementation

Generates enhanced framework code that includes `onParameterChange()` subscription:

**React (enhanced `useVib3()`):**
```javascript
useEffect(() => {
    if (!engine) return;
    const unsubscribe = engine.onParameterChange((params) => {
        setParameters(prev => {
            // Only update if values actually changed (avoid infinite loops)
            const changed = Object.keys(params).some(k => prev[k] !== params[k]);
            return changed ? { ...prev, ...params } : prev;
        });
    });
    return unsubscribe;
}, [engine]);
```

**Vue (enhanced composable):**
```javascript
watch(engine, (eng) => {
    if (!eng) return;
    eng.onParameterChange((params) => {
        Object.assign(parameters, params);
    });
});
```

**Svelte (enhanced store):**
```javascript
// In vib3Actions.initialize():
engine.onParameterChange((params) => {
    vib3Store.update(state => ({
        ...state,
        parameters: { ...state.parameters, ...params }
    }));
});
```

---

## Module 8: PremiumMCPServer

**File**: `src/mcp/PremiumMCPServer.js`
**Purpose**: Wraps the free SDK's MCPServer, adding premium tool handling with license validation.

### Tool List

| Tool | Module | Description |
|------|--------|-------------|
| `set_shader_parameter` | ShaderParameterSurface | Set fine-grained shader params |
| `set_rotation_lock` | RotationLockSystem | Lock/unlock rotation axes, flight mode |
| `set_layer_geometry` | LayerGeometryMixer | Per-layer geometry assignment |
| `add_visual_trigger` | VisualEventSystem | Add threshold-based event trigger |
| `remove_visual_trigger` | VisualEventSystem | Remove trigger by ID |
| `list_visual_triggers` | VisualEventSystem | List all active triggers |
| `configure_css_bridge` | CSSBridge | Configure live CSS binding |
| `create_premium_choreography` | ChoreographyExtensions | Create choreography with layer profiles + triggers |

### License Gating

```javascript
async handleToolCall(toolName, args) {
    if (PREMIUM_TOOLS.has(toolName)) {
        if (!this.premium || !this.premium.isLicensed()) {
            return {
                content: [{ type: 'text', text: `Tool "${toolName}" requires @vib3code/premium. See https://vib3.dev/premium` }],
                isError: true
            };
        }
    }
    // Route to appropriate module handler
    return this.routeTool(toolName, args);
}
```

---

## New Premium Repo File Structure

```
vib3-premium/
├── CLAUDE.md                           # Agent context for premium development
├── package.json                        # @vib3code/premium
├── vitest.config.js                    # Test config
├── src/
│   ├── index.js                        # enablePremium() entry point + license validation
│   ├── ShaderParameterSurface.js       # Module 1
│   ├── RotationLockSystem.js           # Module 2
│   ├── LayerGeometryMixer.js           # Module 3
│   ├── VisualEventSystem.js            # Module 4
│   ├── CSSBridge.js                    # Module 5
│   ├── ChoreographyExtensions.js       # Module 6
│   ├── FrameworkSync.js                # Module 7
│   └── mcp/
│       ├── premium-tools.js            # Tool definitions
│       └── PremiumMCPServer.js         # Module 8
├── DOCS/
│   ├── ARCHITECTURE.md                 # Extension architecture
│   ├── SHADER_PARAMETER_REFERENCE.md   # Full parameter→shader→visual reference
│   ├── VISUAL_EVENT_PATTERNS.md        # Trigger pattern library
│   ├── CSS_INTEGRATION_GUIDE.md        # CSSBridge usage + CSS examples
│   └── AGENT_PREMIUM_CONTEXT.md        # Agent onboarding for premium
├── examples/
│   ├── card-lift-portal.html           # Gold standard: card lift + portal
│   ├── audio-storm.html                # Audio events + layer storms
│   └── css-synchronized.html           # CSSBridge + CSS coordination
└── tests/
    ├── shader-surface.test.js
    ├── rotation-lock.test.js
    ├── layer-geometry.test.js
    ├── visual-events.test.js
    ├── css-bridge.test.js
    ├── choreography-ext.test.js
    └── framework-sync.test.js
```

---

## Free SDK Bug Fixes (Pre-requisites)

These bugs should be fixed in `@vib3code/sdk` before premium development starts. They are NOT premium features — they're broken standard behavior.

### Fix 1: `u_dimension` Projection (VERIFY POST-MERGE)

**File**: `src/faceted/FacetedSystem.js`, `src/quantum/QuantumVisualizer.js`, `src/holograms/HolographicVisualizer.js`
**What**: Replace `float w = 2.5 / (2.5 + p.w)` with `float w = u_dimension / (u_dimension + p.w)` in all `project4Dto3D()` functions
**Impact**: The `dimension` parameter actually controls 4D projection distance. Default 3.5 produces slightly different visual than current 2.5 — may need to adjust the default in `Parameters.js` to 2.5 for visual consistency.
**Verify**: The 6-commit dev branch (`claude/vib3-sdk-handoff-p00R8`) may have fixed this under "uniform standardization" — check before duplicating work.

### Fix 2: Dead Faceted Audio Code

**File**: `src/faceted/FacetedSystem.js`
**What**: In the fragment shader, `audioDensityMod` and `audioMorphMod` are computed from `u_bass` and `u_mid` but never used in the final value computation. Wire them:
```glsl
// Currently: float value = latticeFunction(...) * u_morphFactor;
// Should be: float value = latticeFunction(...) * u_morphFactor * audioMorphMod;
// And: gridSize = u_gridDensity * 0.08 * audioDensityMod;
```
**Impact**: Faceted system becomes audio-reactive (bass pulses density, mid modulates morph).
**Verify**: This is shader logic, not naming — unlikely to be covered by the dev branch fixes.

### Fix 3: Hue Encoding Inconsistency

**File**: `src/quantum/QuantumVisualizer.js` (or `src/faceted/FacetedSystem.js`)
**What**: Faceted passes hue as 0-360 raw degrees to the shader. Quantum normalizes to 0-1 before sending. Pick one convention.
**Recommendation**: Standardize to 0-360 in the parameter API (as defined in `Parameters.js`), normalize to 0-1 inside each system's `updateParameters()` if the shader needs it.
**Verify**: Check if "uniform standardization" commit addressed this.

---

## Upstream PRs to Free SDK (Enabling Premium)

These are optional enhancements to the free SDK that make premium integration cleaner:

### PR 1: Shader Uniform Declarations (No Behavior Change)

Add `uniform float u_uvScale;`, `uniform int u_projectionType;`, `uniform float u_lineThickness;` etc. to all shader strings, with default values matching current hardcoded values. The free SDK sends these defaults — no visual change. Premium sends configurable values.

### PR 2: Plugin Registration Hook (Optional)

```javascript
// In VIB3Engine:
registerPlugin(plugin) {
    plugin.attach(this);
    this._plugins.push(plugin);
}
```

This allows premium to attach cleanly without monkey-patching `setParameter()` and `updateCurrentSystemParameters()`.

### PR 3: Parameter Change Event Enhancement

Enhance `onParameterChange()` to include the parameter name that changed (not just the full state):
```javascript
// Current: listener(params)
// Enhanced: listener(params, { changed: ['hue', 'chaos'] })
```

This allows premium modules and framework sync to efficiently detect what changed without full-state diffing.

---

## Implementation Order

1. **Free SDK bug fixes** (PR to main) — u_dimension, dead audio, hue encoding
2. **Free SDK uniform declarations** (PR) — add new uniforms with defaults
3. **Create premium repo** — scaffold, CLAUDE.md, package.json
4. **ShaderParameterSurface** — most independent module, validates the architecture
5. **RotationLockSystem** — simple, high impact
6. **CSSBridge** — high demo value
7. **VisualEventSystem** — depends on having a working engine to test triggers
8. **LayerGeometryMixer** — may need upstream verification
9. **ChoreographyExtensions** — integrates multiple modules
10. **FrameworkSync** — lowest priority, clean enhancement
11. **PremiumMCPServer** — wraps everything, last to build
12. **Gold standard demos** — card-lift-portal.html, audio-storm.html, css-synchronized.html

---

*VIB3+ SDK — Clear Seas Solutions LLC*
*Expansion Design v1.0 — Feb 16, 2026*
