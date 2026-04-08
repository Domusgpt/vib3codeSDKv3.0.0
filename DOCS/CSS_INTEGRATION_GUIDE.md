# CSS Integration Guide — Premium Module 5

**Module**: `CSSBridge`

## Overview

The CSSBridge creates a live bidirectional binding between VIB3+ engine parameters and CSS custom properties. This enables:

- **Outbound (Engine → CSS)**: Drive CSS animations, transitions, and styling from VIB3+ parameter state
- **Inbound (CSS → Engine)**: Let CSS animations or user interactions drive VIB3+ parameters

## Quick Start

```javascript
import { enablePremium } from '@vib3code/premium';

const premium = enablePremium(engine, { licenseKey: 'your-key' });

// Start outbound bridge (engine → CSS)
premium.cssBridge.start({
    outbound: true,
    normalize: true  // Values normalized to 0-1
});
```

Your CSS can now read VIB3+ parameters:

```css
.my-element {
    /* Normalized 0-1 values */
    opacity: var(--vib3-intensity);
    filter: hue-rotate(calc(var(--vib3-hue) * 360deg));

    /* Raw values also available */
    --my-speed: var(--vib3-speed-raw);
}
```

## CSS Variable Naming

Parameters are exposed as CSS custom properties with kebab-case conversion:

| Engine Parameter | CSS Variable (normalized) | CSS Variable (raw) |
|-----------------|---------------------------|---------------------|
| `hue` | `--vib3-hue` | `--vib3-hue-raw` |
| `saturation` | `--vib3-saturation` | `--vib3-saturation-raw` |
| `intensity` | `--vib3-intensity` | `--vib3-intensity-raw` |
| `chaos` | `--vib3-chaos` | `--vib3-chaos-raw` |
| `speed` | `--vib3-speed` | `--vib3-speed-raw` |
| `gridDensity` | `--vib3-grid-density` | `--vib3-grid-density-raw` |
| `morphFactor` | `--vib3-morph-factor` | `--vib3-morph-factor-raw` |
| `dimension` | `--vib3-dimension` | `--vib3-dimension-raw` |
| `rot4dXY` | `--vib3-rot4d-x-y` | `--vib3-rot4d-x-y-raw` |
| `rot4dXW` | `--vib3-rot4d-x-w` | `--vib3-rot4d-x-w-raw` |

## Configuration Options

```javascript
premium.cssBridge.start({
    // Target element for CSS variables (default: document.documentElement)
    target: document.querySelector('.my-container'),

    // CSS variable prefix (default: 'vib3')
    prefix: 'myapp',

    // Enable engine → CSS (default: true)
    outbound: true,

    // Enable CSS → engine (default: false)
    inbound: true,

    // Which parameters to bridge (default: all)
    parameters: ['hue', 'intensity', 'chaos', 'speed'],

    // Which CSS vars to watch for inbound (required for inbound)
    inboundParameters: ['chaos', 'speed'],

    // Throttle interval in ms (default: 16 ≈ 60fps)
    throttle: 16,

    // Normalize values to 0-1 (default: true)
    normalize: true
});
```

## Inbound (CSS → Engine)

Inbound mode polls CSS custom properties and pushes values to the engine. CSS vars are read from `--{prefix}-input-{param}`:

```css
:root {
    /* These drive VIB3+ parameters */
    --vib3-input-chaos: 0.5;
    --vib3-input-speed: 0.7;
}

/* Animate via CSS */
@keyframes pulse {
    0% { --vib3-input-chaos: 0.1; }
    50% { --vib3-input-chaos: 0.9; }
    100% { --vib3-input-chaos: 0.1; }
}

.pulsing {
    animation: pulse 2s ease-in-out infinite;
}
```

```javascript
premium.cssBridge.start({
    inbound: true,
    inboundParameters: ['chaos', 'speed']
});
```

## Normalization

When `normalize: true` (default), values are mapped to 0-1 range:

| Parameter | Original Range | Normalized |
|-----------|---------------|------------|
| hue | 0-360 | 0-1 |
| saturation | 0-1 | 0-1 (unchanged) |
| intensity | 0-1 | 0-1 (unchanged) |
| chaos | 0-1 | 0-1 (unchanged) |
| speed | 0.1-3.0 | 0-1 |
| gridDensity | 4-100 | 0-1 |
| morphFactor | 0-2 | 0-1 |
| dimension | 3.0-4.5 | 0-1 |
| rot4dXY/XZ/YZ | -6.28-6.28 | 0-1 |
| rot4dXW/YW/ZW | -2-2 | 0-1 |

## Recipes

### Glow effect driven by intensity

```css
.glow-element {
    box-shadow: 0 0 calc(var(--vib3-intensity) * 50px)
                calc(var(--vib3-intensity) * 10px)
                hsla(calc(var(--vib3-hue) * 360), 80%, 50%, var(--vib3-intensity));
}
```

### Background gradient from VIB3+ colors

```css
.gradient-bg {
    background: linear-gradient(
        calc(var(--vib3-rot4d-x-y) * 360deg),
        hsla(calc(var(--vib3-hue) * 360), 80%, 50%, var(--vib3-intensity)),
        hsla(calc(var(--vib3-hue) * 360 + 120), 60%, 30%, 0.5)
    );
}
```

### Scroll-driven VIB3+ parameter

```css
/* CSS scroll-driven input */
.scroll-container {
    --vib3-input-chaos: 0;
    animation: scroll-chaos linear;
    animation-timeline: scroll();
}

@keyframes scroll-chaos {
    from { --vib3-input-chaos: 0; }
    to { --vib3-input-chaos: 1; }
}
```

## MCP Tool

```json
{
    "tool": "configure_css_bridge",
    "args": {
        "enabled": true,
        "outbound": true,
        "inbound": false,
        "parameters": ["hue", "intensity", "chaos"],
        "throttle": 16,
        "normalize": true
    }
}
```

## Manual Push/Pull

```javascript
// Manually push a single value
premium.cssBridge.pushToCSS('hue', 240);

// Manually read a CSS value and push to engine
const value = premium.cssBridge.pullFromCSS('chaos');
```
