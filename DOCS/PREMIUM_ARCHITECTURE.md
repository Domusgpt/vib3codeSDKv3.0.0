# Premium Architecture — @vib3code/premium

**Last updated**: 2026-02-18

## Overview

The VIB3+ Premium tier extends the free SDK with 8 modules that add fine-grained shader control, rotation locking, per-layer geometry, event triggers, CSS integration, choreography extensions, framework sync, and premium MCP tools.

Premium is activated via a single function call:

```javascript
import { enablePremium } from '@vib3code/premium';

const premium = enablePremium(engine, {
    licenseKey: 'your-license-key',
    features: ['all'] // or selective: ['shaderSurface', 'rotationLock']
});
```

## Design Principles

1. **One-directional dependency**: Premium depends on the free SDK. The free SDK never imports or references premium code.
2. **Plugin architecture**: Premium registers as a plugin via `engine.registerPlugin()`, added in the free SDK enhancement PR.
3. **Selective activation**: Users can enable only the modules they need via the `features` option.
4. **License gating**: Premium tools require a valid license key. Unlicensed calls return error responses.
5. **Clean teardown**: `premium.destroy()` removes all monkey-patches and restores the engine to its original state.

## Module Map

| # | Module | Class | What it does |
|---|--------|-------|-------------|
| 1 | ShaderParameterSurface | `ShaderParameterSurface` | Exposes 8 hardcoded shader values as controllable parameters |
| 2 | RotationLockSystem | `RotationLockSystem` | Lock rotation axes at fixed values, flight mode |
| 3 | LayerGeometryMixer | `LayerGeometryMixer` | Per-layer geometry assignment (each of 5 layers can render different geometry) |
| 4 | VisualEventSystem | `VisualEventSystem` | Threshold-based event triggers ("when chaos > 0.7, switch profile") |
| 5 | CSSBridge | `CSSBridge` | Bidirectional CSS custom property binding |
| 6 | ChoreographyExtensions | `ChoreographyExtensions` | Extended choreography with layer profiles, triggers, rotation locks per scene |
| 7 | FrameworkSync | `FrameworkSync` | Bidirectional React/Vue/Svelte state sync |
| 8 | PremiumMCPServer | `PremiumMCPServer` | 8 premium MCP tools with license gating |

## File Structure

```
src/premium/
├── index.js                    # enablePremium() entry point
├── ShaderParameterSurface.js   # Module 1
├── RotationLockSystem.js       # Module 2
├── LayerGeometryMixer.js       # Module 3
├── VisualEventSystem.js        # Module 4
├── CSSBridge.js                # Module 5
├── ChoreographyExtensions.js   # Module 6
├── FrameworkSync.js            # Module 7
└── mcp/
    ├── PremiumMCPServer.js     # Module 8
    └── premium-tools.js        # 8 premium tool definitions
```

## Premium Context Object

`enablePremium()` returns a premium context with all enabled modules:

```javascript
const premium = enablePremium(engine, options);

// Access modules directly:
premium.shaderSurface     // ShaderParameterSurface
premium.rotationLock      // RotationLockSystem
premium.layerGeometry     // LayerGeometryMixer
premium.events            // VisualEventSystem
premium.cssBridge         // CSSBridge
premium.choreography      // ChoreographyExtensions
premium.frameworkSync     // FrameworkSync
premium.mcp               // PremiumMCPServer

// Utility methods:
premium.isLicensed()          // → boolean
premium.getLicenseKey()       // → string
premium.getEnabledFeatures() // → string[]
premium.destroy()             // Clean teardown
```

## Integration Points

### Engine Enhancement (Free SDK)

The premium tier requires two enhancements added to the free SDK:

1. **`engine.registerPlugin(plugin)`** — Registers a plugin with `attach(engine)` and `destroy()` lifecycle methods.
2. **Enhanced `onParameterChange(cb)`** — Callbacks now receive `(params, meta)` where `meta.changed` lists which parameter keys actually changed.

### How Modules Hook Into the Engine

| Module | Mechanism |
|--------|-----------|
| ShaderParameterSurface | Stores params on `engine._shaderSurfaceParams`, calls `updateCurrentSystemParameters()` |
| RotationLockSystem | Monkey-patches `engine.setParameter()` and `engine.updateCurrentSystemParameters()` |
| LayerGeometryMixer | Stores overrides on `engine._layerGeometryOverrides`, calls `updateCurrentSystemParameters()` |
| VisualEventSystem | Subscribes via `engine.onParameterChange()` |
| CSSBridge | Subscribes via `engine.onParameterChange()` for outbound, polls CSS for inbound |
| ChoreographyExtensions | Wraps `ChoreographyPlayer.onSceneChange` callback |
| FrameworkSync | Subscribes via `engine.onParameterChange()` |
| PremiumMCPServer | Delegates to module methods, wraps base MCPServer |

## MCP Premium Tools (8)

| Tool | Module | Description |
|------|--------|-------------|
| `set_shader_parameter` | ShaderParameterSurface | Set projection, UV scale, line thickness, noise, etc. |
| `set_rotation_lock` | RotationLockSystem | Lock axes, enable flight mode |
| `set_layer_geometry` | LayerGeometryMixer | Per-layer geometry index or offset |
| `add_visual_trigger` | VisualEventSystem | Add threshold-based event trigger |
| `remove_visual_trigger` | VisualEventSystem | Remove trigger by ID |
| `list_visual_triggers` | VisualEventSystem | List all active triggers |
| `configure_css_bridge` | CSSBridge | Start/stop/configure CSS binding |
| `create_premium_choreography` | ChoreographyExtensions | Extended choreography with premium scene fields |

## Testing

183 tests across 9 test files in `tests/premium/`:

```bash
pnpm test tests/premium/
```

## License Validation

Currently uses a simple length check (min 8 characters). In production, this will validate against a license server or local cryptographic signature.
