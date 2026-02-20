# Shader Parameter Reference — Premium Module 1

**Module**: `ShaderParameterSurface`

## Overview

The ShaderParameterSurface exposes 8 values that are normally hardcoded in VIB3+ shaders as controllable, validated parameters. This gives fine-grained control over rendering behavior that the free SDK's parameter system doesn't cover.

## Parameters

| Parameter | Type | Range | Default | Description |
|-----------|------|-------|---------|-------------|
| `projectionType` | integer | 0-2 | 0 | Projection mode: 0=perspective, 1=stereographic, 2=orthographic |
| `uvScale` | number | 1.0-8.0 | 3.0 | UV space zoom scale — controls the density of the procedural pattern |
| `lineThickness` | number | 0.005-0.15 | 0.03 | Wireframe line thickness in the fragment shader |
| `noiseFrequency` | number[3] | 1-50 each | [7, 11, 13] | Chaos noise frequency triple [x, y, z] — prime numbers prevent visual repetition |
| `breathStrength` | number | 0-1 | 0.3 | Strength of the VitalitySystem breath modulation on visual parameters |
| `autoRotationSpeed` | number[6] | 0-0.5 each | [0.1, 0.12, 0.08, 0.2, 0.15, 0.25] | Auto-rotation speeds for [XY, XZ, YZ, XW, YW, ZW] planes |
| `particleSize` | number | 0.02-0.5 | 0.2 | Quantum particle dot size in the fragment shader |
| `layerAlpha` | object | 0-1 per layer | see below | Per-layer alpha transparency |

### layerAlpha defaults

```javascript
{
    background: 0.6,
    shadow: 0.4,
    content: 1.0,
    highlight: 0.8,
    accent: 0.3
}
```

## Usage

```javascript
import { enablePremium } from '@vib3code/premium';

const premium = enablePremium(engine, { licenseKey: 'your-key' });

// Set a single parameter
premium.shaderSurface.setParameter('uvScale', 5.0);

// Batch set
premium.shaderSurface.setParameters({
    projectionType: 1,
    lineThickness: 0.08,
    noiseFrequency: [13, 17, 23]
});

// Read current values
const allParams = premium.shaderSurface.getAllParameters();

// Reset to defaults
premium.shaderSurface.reset();

// Get JSON Schema
const schema = premium.shaderSurface.getParameterSchema();
```

## MCP Tool

```json
{
    "tool": "set_shader_parameter",
    "args": {
        "projectionType": 1,
        "uvScale": 5.0,
        "noiseFrequency": [13, 17, 23]
    }
}
```

## Creative Recipes

### Ultra-fine wireframe
```javascript
premium.shaderSurface.setParameters({
    lineThickness: 0.005,
    uvScale: 6.0,
    particleSize: 0.05
});
```

### Deep space portal
```javascript
premium.shaderSurface.setParameters({
    projectionType: 1, // stereographic
    breathStrength: 0.8,
    noiseFrequency: [3, 5, 7], // low frequencies → large-scale structures
    autoRotationSpeed: [0.0, 0.0, 0.0, 0.3, 0.25, 0.35] // 4D only
});
```

### Ghostly layers
```javascript
premium.shaderSurface.setParameters({
    layerAlpha: {
        background: 0.1,
        shadow: 0.15,
        content: 0.5,
        highlight: 1.0,
        accent: 0.05
    }
});
```
