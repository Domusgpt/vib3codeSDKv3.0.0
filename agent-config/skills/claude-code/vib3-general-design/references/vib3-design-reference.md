# VIB3+ Design Reference

## Core design facts
- Systems: `quantum`, `faceted`, `holographic`.
- Geometry count: 24 (`index = coreType * 8 + baseGeometry`).
- 6D rotation planes: XY, XZ, YZ, XW, YW, ZW.
- Projection options: perspective, stereographic, orthographic.

## Parameter ranges
- geometry: 0-23
- rot4dXY/XZ/YZ/XW/YW/ZW: 0-2π
- hue: 0-360
- saturation: 0-1
- intensity: 0-1
- speed: 0.1-3
- chaos: 0-1
- morphFactor: 0-2
- gridDensity: 4-100
- dimension: 3.0-4.5

## Key internal docs in this repo
- `CLAUDE.md`
- `DOCS/CONTROL_REFERENCE.md`
- `DOCS/SYSTEM_INVENTORY.md`
- `DOCS/EXPORT_FORMATS.md`
- `DOCS/CROSS_SITE_DESIGN_PATTERNS.md`
