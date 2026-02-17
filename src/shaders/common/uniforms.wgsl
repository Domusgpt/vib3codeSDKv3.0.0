// VIB3+ Common Uniform Struct (WGSL)
// Shared across all visualization systems
// Canonical layout — must match packVIB3Uniforms() in UnifiedRenderBridge.js
// All fields are f32 (except resolution vec2) to avoid alignment surprises.
// Total: 33 floats (132 bytes), buffer padded to 256 bytes.

struct VIB3Uniforms {
    // Time and resolution (indices 0-3)
    time: f32,
    _pad0: f32,
    resolution: vec2<f32>,

    // Geometry selection 0-23 (index 4)
    geometry: f32,

    // 6D Rotation in radians (indices 5-10)
    rot4dXY: f32,
    rot4dXZ: f32,
    rot4dYZ: f32,
    rot4dXW: f32,
    rot4dYW: f32,
    rot4dZW: f32,

    // Visual parameters (indices 11-18)
    dimension: f32,
    gridDensity: f32,
    morphFactor: f32,
    chaos: f32,
    speed: f32,
    hue: f32,
    intensity: f32,
    saturation: f32,

    // Reactivity (indices 19-23)
    mouseIntensity: f32,
    clickIntensity: f32,
    bass: f32,
    mid: f32,
    high: f32,

    // Layer parameters (indices 24-31)
    layerScale: f32,
    layerOpacity: f32,
    _pad1: f32,
    layerColorR: f32,
    layerColorG: f32,
    layerColorB: f32,
    densityMult: f32,
    speedMult: f32,

    // Vitality (index 32)
    breath: f32,
};

@group(0) @binding(0) var<uniform> u: VIB3Uniforms;
