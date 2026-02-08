/**
 * Faceted System - Clean 2D Geometric Patterns with 4D Rotation
 * Supports 24 geometry variants: 8 base + 8 Hypersphere Core + 8 Hypertetrahedron Core
 * Full 6D rotation mathematics (XY, XZ, YZ, XW, YW, ZW)
 *
 * Supports both WebGL (direct) and WebGPU (via UnifiedRenderBridge).
 */

import { UnifiedRenderBridge } from '../render/UnifiedRenderBridge.js';
import { shaderLoader } from '../render/ShaderLoader.js';

// ============================================================================
// Shader Sources
// ============================================================================

const VERTEX_SHADER_GLSL = `
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`;

const FRAGMENT_SHADER_GLSL = `
    precision highp float;

    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_geometry;      // 0-23

    // 6D Rotation uniforms
    uniform float u_rot4dXY;
    uniform float u_rot4dXZ;
    uniform float u_rot4dYZ;
    uniform float u_rot4dXW;
    uniform float u_rot4dYW;
    uniform float u_rot4dZW;

    uniform float u_dimension;
    uniform float u_gridDensity;
    uniform float u_morphFactor;
    uniform float u_chaos;
    uniform float u_speed;
    uniform float u_hue;
    uniform float u_intensity;
    uniform float u_saturation;
    uniform float u_mouseIntensity;
    uniform float u_clickIntensity;
    uniform float u_roleIntensity;
    uniform float u_bass;
    uniform float u_mid;
    uniform float u_high;
    uniform float u_breath; // Vitality System Breath (0.0 - 1.0)

    // ── 6D Rotation Matrices ──

    mat4 rotateXY(float theta) {
        float c = cos(theta); float s = sin(theta);
        return mat4(c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
    }
    mat4 rotateXZ(float theta) {
        float c = cos(theta); float s = sin(theta);
        return mat4(c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1);
    }
    mat4 rotateYZ(float theta) {
        float c = cos(theta); float s = sin(theta);
        return mat4(1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1);
    }
    mat4 rotateXW(float theta) {
        float c = cos(theta); float s = sin(theta);
        return mat4(c, 0, 0, -s, 0, 1, 0, 0, 0, 0, 1, 0, s, 0, 0, c);
    }
    mat4 rotateYW(float theta) {
        float c = cos(theta); float s = sin(theta);
        return mat4(1, 0, 0, 0, 0, c, 0, -s, 0, 0, 1, 0, 0, s, 0, c);
    }
    mat4 rotateZW(float theta) {
        float c = cos(theta); float s = sin(theta);
        return mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, c, -s, 0, 0, s, c);
    }

    // ── 4D → 3D Projection ──

    vec3 project4Dto3D(vec4 p) {
        float w = 2.5 / (2.5 + p.w);
        return vec3(p.x * w, p.y * w, p.z * w);
    }

    // ── Polytope Core Warp Functions (24 Geometries) ──

    vec3 warpHypersphereCore(vec3 p, int geometryIndex, vec2 mouseDelta) {
        float radius = length(p);
        float morphBlend = clamp(u_morphFactor * 0.6 + (u_dimension - 3.0) * 0.25, 0.0, 2.0);
        float w = sin(radius * (1.3 + float(geometryIndex) * 0.12) + u_time * 0.0008 * u_speed);
        w *= (0.4 + morphBlend * 0.45);

        vec4 p4d = vec4(p * (1.0 + morphBlend * 0.2), w);
        p4d = rotateXY(u_rot4dXY) * p4d;
        p4d = rotateXZ(u_rot4dXZ) * p4d;
        p4d = rotateYZ(u_rot4dYZ) * p4d;
        p4d = rotateXW(u_rot4dXW) * p4d;
        p4d = rotateYW(u_rot4dYW) * p4d;
        p4d = rotateZW(u_rot4dZW) * p4d;

        vec3 projected = project4Dto3D(p4d);
        return mix(p, projected, clamp(0.45 + morphBlend * 0.35, 0.0, 1.0));
    }

    vec3 warpHypertetraCore(vec3 p, int geometryIndex, vec2 mouseDelta) {
        vec3 c1 = normalize(vec3(1.0, 1.0, 1.0));
        vec3 c2 = normalize(vec3(-1.0, -1.0, 1.0));
        vec3 c3 = normalize(vec3(-1.0, 1.0, -1.0));
        vec3 c4 = normalize(vec3(1.0, -1.0, -1.0));

        float morphBlend = clamp(u_morphFactor * 0.8 + (u_dimension - 3.0) * 0.2, 0.0, 2.0);
        float basisMix = dot(p, c1) * 0.14 + dot(p, c2) * 0.1 + dot(p, c3) * 0.08;
        float w = sin(basisMix * 5.5 + u_time * 0.0009 * u_speed);
        w *= cos(dot(p, c4) * 4.2 - u_time * 0.0007 * u_speed);
        w *= (0.5 + morphBlend * 0.4);

        vec3 offset = vec3(dot(p, c1), dot(p, c2), dot(p, c3)) * 0.1 * morphBlend;
        vec4 p4d = vec4(p + offset, w);
        p4d = rotateXY(u_rot4dXY) * p4d;
        p4d = rotateXZ(u_rot4dXZ) * p4d;
        p4d = rotateYZ(u_rot4dYZ) * p4d;
        p4d = rotateXW(u_rot4dXW) * p4d;
        p4d = rotateYW(u_rot4dYW) * p4d;
        p4d = rotateZW(u_rot4dZW) * p4d;

        vec3 projected = project4Dto3D(p4d);
        float planeInfluence = min(min(abs(dot(p, c1)), abs(dot(p, c2))),
                                   min(abs(dot(p, c3)), abs(dot(p, c4))));
        vec3 blended = mix(p, projected, clamp(0.45 + morphBlend * 0.35, 0.0, 1.0));
        return mix(blended, blended * (1.0 - planeInfluence * 0.55), 0.2 + morphBlend * 0.2);
    }

    vec3 applyCoreWarp(vec3 p, float geometryType, vec2 mouseDelta) {
        float totalBase = 8.0;
        float coreFloat = floor(geometryType / totalBase);
        int coreIndex = int(clamp(coreFloat, 0.0, 2.0));
        // WebGL 1.0 compatible modulus
        float baseGeomFloat = geometryType - floor(geometryType / totalBase) * totalBase;
        int geometryIndex = int(clamp(floor(baseGeomFloat + 0.5), 0.0, totalBase - 1.0));

        if (coreIndex == 1) {
            return warpHypersphereCore(p, geometryIndex, mouseDelta);
        }
        if (coreIndex == 2) {
            return warpHypertetraCore(p, geometryIndex, mouseDelta);
        }
        return p;
    }

    // ── 8 Lattice Geometry Functions ──

    float geometryFunction(vec4 p) {
        float totalBase = 8.0;
        // WebGL 1.0 compatible modulus
        float baseGeomFloat = u_geometry - floor(u_geometry / totalBase) * totalBase;
        int geomType = int(clamp(floor(baseGeomFloat + 0.5), 0.0, totalBase - 1.0));

        if (geomType == 0) {
            // Tetrahedron lattice
            vec4 pos = fract(p * u_gridDensity * 0.08);
            vec4 dist = min(pos, 1.0 - pos);
            return min(min(dist.x, dist.y), min(dist.z, dist.w)) * u_morphFactor;
        }
        else if (geomType == 1) {
            // Hypercube lattice
            vec4 pos = fract(p * u_gridDensity * 0.08);
            vec4 dist = min(pos, 1.0 - pos);
            float minDist = min(min(dist.x, dist.y), min(dist.z, dist.w));
            return minDist * u_morphFactor;
        }
        else if (geomType == 2) {
            // Sphere lattice
            float r = length(p);
            float density = u_gridDensity * 0.08;
            float spheres = abs(fract(r * density) - 0.5) * 2.0;
            float theta = atan(p.y, p.x);
            float harmonics = sin(theta * 3.0) * 0.2;
            return (spheres + harmonics) * u_morphFactor;
        }
        else if (geomType == 3) {
            // Torus lattice
            float r1 = length(p.xy) - 2.0;
            float torus = length(vec2(r1, p.z)) - 0.8;
            float lattice = sin(p.x * u_gridDensity * 0.08) * sin(p.y * u_gridDensity * 0.08);
            return (torus + lattice * 0.3) * u_morphFactor;
        }
        else if (geomType == 4) {
            // Klein bottle lattice
            float u_ang = atan(p.y, p.x);
            float v_ang = atan(p.w, p.z);
            float dist = length(p) - 2.0;
            float lattice = sin(u_ang * u_gridDensity * 0.08) * sin(v_ang * u_gridDensity * 0.08);
            return (dist + lattice * 0.4) * u_morphFactor;
        }
        else if (geomType == 5) {
            // Fractal lattice
            vec4 pos = fract(p * u_gridDensity * 0.08);
            pos = abs(pos * 2.0 - 1.0);
            float dist = length(max(abs(pos) - 1.0, 0.0));
            return dist * u_morphFactor;
        }
        else if (geomType == 6) {
            // Wave lattice
            float freq = u_gridDensity * 0.08;
            float time = u_time * 0.001 * u_speed;
            float wave1 = sin(p.x * freq + time);
            float wave2 = sin(p.y * freq + time * 1.3);
            float wave3 = sin(p.z * freq * 0.8 + time * 0.7);
            float interference = wave1 * wave2 * wave3;
            return interference * u_morphFactor;
        }
        else if (geomType == 7) {
            // Crystal lattice
            vec4 pos = fract(p * u_gridDensity * 0.08) - 0.5;
            float cube = max(max(abs(pos.x), abs(pos.y)), max(abs(pos.z), abs(pos.w)));
            return cube * u_morphFactor;
        }
        else {
            // Default hypercube
            vec4 pos = fract(p * u_gridDensity * 0.08);
            vec4 dist = min(pos, 1.0 - pos);
            return min(min(dist.x, dist.y), min(dist.z, dist.w)) * u_morphFactor;
        }
    }

    // ── Main ──

    void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / min(u_resolution.x, u_resolution.y);
        float timeSpeed = u_time * 0.0001 * u_speed;

        // Create 4D point
        vec4 pos = vec4(uv * 3.0, sin(timeSpeed * 3.0), cos(timeSpeed * 2.0));

        // Mouse influence
        pos.xy += (u_mouse - 0.5) * u_mouseIntensity * 2.0;

        // Audio-reactive density and morph
        float audioDensityMod = 1.0 + u_bass * 0.3;
        float audioMorphMod = 1.0 + u_mid * 0.2;

        // Apply full 6D rotation
        pos = rotateXY(u_rot4dXY) * pos;
        pos = rotateXZ(u_rot4dXZ) * pos;
        pos = rotateYZ(u_rot4dYZ) * pos;
        pos = rotateXW(u_rot4dXW) * pos;
        pos = rotateYW(u_rot4dYW) * pos;
        pos = rotateZW(u_rot4dZW) * pos;

        // 4D → 3D projection
        vec3 basePoint = project4Dto3D(pos);

        // Apply polytope core warp (types 8-23)
        vec3 warpedPoint = applyCoreWarp(basePoint, u_geometry, u_mouse - 0.5);

        // Evaluate lattice geometry
        vec4 warpedPos = vec4(warpedPoint, pos.w);
        float value = geometryFunction(warpedPos);

        // Chaos noise
        float noise = sin(pos.x * 7.0) * cos(pos.y * 11.0) * sin(pos.z * 13.0);
        value += noise * u_chaos;

        // Intensity from lattice
        float geometryIntensity = 1.0 - clamp(abs(value), 0.0, 1.0);
        geometryIntensity += u_clickIntensity * 0.3;

        // Exhale: Vitality Breath Modulation
        float breathMod = 1.0 + (u_breath * 0.3); // +30% intensity at full breath

        float finalIntensity = geometryIntensity * u_intensity * breathMod;

        // Audio-reactive hue shift
        float hue = u_hue / 360.0 + value * 0.1 + u_high * 0.08;

        // Color via sin-wave HSL
        vec3 baseColor = vec3(
            sin(hue * 6.28318 + 0.0) * 0.5 + 0.5,
            sin(hue * 6.28318 + 2.0943) * 0.5 + 0.5,
            sin(hue * 6.28318 + 4.1887) * 0.5 + 0.5
        );

        // Saturation control (mix to gray)
        float gray = (baseColor.r + baseColor.g + baseColor.b) / 3.0;
        vec3 color = mix(vec3(gray), baseColor, u_saturation) * finalIntensity;

        gl_FragColor = vec4(color, finalIntensity);
    }
`;

// WGSL version of the faceted fragment shader for WebGPU
const FRAGMENT_SHADER_WGSL = `
struct VIB3Uniforms {
    time: f32,
    _pad0: f32,
    resolution: vec2<f32>,
    geometry: f32,
    rot4dXY: f32,
    rot4dXZ: f32,
    rot4dYZ: f32,
    rot4dXW: f32,
    rot4dYW: f32,
    rot4dZW: f32,
    dimension: f32,
    gridDensity: f32,
    morphFactor: f32,
    chaos: f32,
    speed: f32,
    hue: f32,
    intensity: f32,
    saturation: f32,
    mouseIntensity: f32,
    clickIntensity: f32,
    bass: f32,
    mid: f32,
    high: f32,
    layerScale: f32,
    layerOpacity: f32,
    _pad1: f32,
    layerColorR: f32,
    layerColorG: f32,
    layerColorB: f32,
    densityMult: f32,
    speedMult: f32,
    breath: f32, // Index 32
};

@group(0) @binding(0) var<uniform> u: VIB3Uniforms;

fn rotateXY_w(theta: f32) -> mat4x4<f32> {
    let c = cos(theta); let s = sin(theta);
    return mat4x4<f32>(
        vec4<f32>(c, -s, 0.0, 0.0), vec4<f32>(s, c, 0.0, 0.0),
        vec4<f32>(0.0, 0.0, 1.0, 0.0), vec4<f32>(0.0, 0.0, 0.0, 1.0));
}
fn rotateXZ_w(theta: f32) -> mat4x4<f32> {
    let c = cos(theta); let s = sin(theta);
    return mat4x4<f32>(
        vec4<f32>(c, 0.0, s, 0.0), vec4<f32>(0.0, 1.0, 0.0, 0.0),
        vec4<f32>(-s, 0.0, c, 0.0), vec4<f32>(0.0, 0.0, 0.0, 1.0));
}
fn rotateYZ_w(theta: f32) -> mat4x4<f32> {
    let c = cos(theta); let s = sin(theta);
    return mat4x4<f32>(
        vec4<f32>(1.0, 0.0, 0.0, 0.0), vec4<f32>(0.0, c, -s, 0.0),
        vec4<f32>(0.0, s, c, 0.0), vec4<f32>(0.0, 0.0, 0.0, 1.0));
}
fn rotateXW_w(theta: f32) -> mat4x4<f32> {
    let c = cos(theta); let s = sin(theta);
    return mat4x4<f32>(
        vec4<f32>(c, 0.0, 0.0, -s), vec4<f32>(0.0, 1.0, 0.0, 0.0),
        vec4<f32>(0.0, 0.0, 1.0, 0.0), vec4<f32>(s, 0.0, 0.0, c));
}
fn rotateYW_w(theta: f32) -> mat4x4<f32> {
    let c = cos(theta); let s = sin(theta);
    return mat4x4<f32>(
        vec4<f32>(1.0, 0.0, 0.0, 0.0), vec4<f32>(0.0, c, 0.0, -s),
        vec4<f32>(0.0, 0.0, 1.0, 0.0), vec4<f32>(0.0, s, 0.0, c));
}
fn rotateZW_w(theta: f32) -> mat4x4<f32> {
    let c = cos(theta); let s = sin(theta);
    return mat4x4<f32>(
        vec4<f32>(1.0, 0.0, 0.0, 0.0), vec4<f32>(0.0, 1.0, 0.0, 0.0),
        vec4<f32>(0.0, 0.0, c, -s), vec4<f32>(0.0, 0.0, s, c));
}

fn project4Dto3D_w(p: vec4<f32>) -> vec3<f32> {
    let w = 2.5 / (2.5 + p.w);
    return vec3<f32>(p.x * w, p.y * w, p.z * w);
}

fn warpHypersphereCore_w(p: vec3<f32>, geomIdx: i32) -> vec3<f32> {
    let radius = length(p);
    let morphBlend = clamp(u.morphFactor * 0.6 + (u.dimension - 3.0) * 0.25, 0.0, 2.0);
    let w = sin(radius * (1.3 + f32(geomIdx) * 0.12) + u.time * 0.0008 * u.speed)
          * (0.4 + morphBlend * 0.45);
    var p4d = vec4<f32>(p * (1.0 + morphBlend * 0.2), w);
    p4d = rotateXY_w(u.rot4dXY) * p4d;
    p4d = rotateXZ_w(u.rot4dXZ) * p4d;
    p4d = rotateYZ_w(u.rot4dYZ) * p4d;
    p4d = rotateXW_w(u.rot4dXW) * p4d;
    p4d = rotateYW_w(u.rot4dYW) * p4d;
    p4d = rotateZW_w(u.rot4dZW) * p4d;
    let proj = project4Dto3D_w(p4d);
    return mix(p, proj, clamp(0.45 + morphBlend * 0.35, 0.0, 1.0));
}

fn warpHypertetraCore_w(p: vec3<f32>, geomIdx: i32) -> vec3<f32> {
    let c1 = normalize(vec3<f32>(1.0, 1.0, 1.0));
    let c2 = normalize(vec3<f32>(-1.0, -1.0, 1.0));
    let c3 = normalize(vec3<f32>(-1.0, 1.0, -1.0));
    let c4 = normalize(vec3<f32>(1.0, -1.0, -1.0));
    let morphBlend = clamp(u.morphFactor * 0.8 + (u.dimension - 3.0) * 0.2, 0.0, 2.0);
    let basisMix = dot(p, c1) * 0.14 + dot(p, c2) * 0.1 + dot(p, c3) * 0.08;
    let w = sin(basisMix * 5.5 + u.time * 0.0009 * u.speed)
          * cos(dot(p, c4) * 4.2 - u.time * 0.0007 * u.speed)
          * (0.5 + morphBlend * 0.4);
    let offset = vec3<f32>(dot(p, c1), dot(p, c2), dot(p, c3)) * 0.1 * morphBlend;
    var p4d = vec4<f32>(p + offset, w);
    p4d = rotateXY_w(u.rot4dXY) * p4d;
    p4d = rotateXZ_w(u.rot4dXZ) * p4d;
    p4d = rotateYZ_w(u.rot4dYZ) * p4d;
    p4d = rotateXW_w(u.rot4dXW) * p4d;
    p4d = rotateYW_w(u.rot4dYW) * p4d;
    p4d = rotateZW_w(u.rot4dZW) * p4d;
    let proj = project4Dto3D_w(p4d);
    let planeInf = min(min(abs(dot(p, c1)), abs(dot(p, c2))),
                       min(abs(dot(p, c3)), abs(dot(p, c4))));
    let blended = mix(p, proj, clamp(0.45 + morphBlend * 0.35, 0.0, 1.0));
    return mix(blended, blended * (1.0 - planeInf * 0.55), 0.2 + morphBlend * 0.2);
}

fn applyCoreWarp_w(p: vec3<f32>, geomType: f32, mouseDelta: vec2<f32>) -> vec3<f32> {
    let coreFloat = floor(geomType / 8.0);
    let coreIndex = i32(clamp(coreFloat, 0.0, 2.0));
    let baseFloat = geomType - floor(geomType / 8.0) * 8.0;
    let geomIdx = i32(clamp(floor(baseFloat + 0.5), 0.0, 7.0));
    if (coreIndex == 1) { return warpHypersphereCore_w(p, geomIdx); }
    if (coreIndex == 2) { return warpHypertetraCore_w(p, geomIdx); }
    return p;
}

fn geometryFunction_w(p: vec4<f32>) -> f32 {
    let baseFloat = u.geometry - floor(u.geometry / 8.0) * 8.0;
    let gt = i32(clamp(floor(baseFloat + 0.5), 0.0, 7.0));
    let d = u.gridDensity * 0.08;
    if (gt == 0) {
        let pos = fract(p * d); let dist = min(pos, 1.0 - pos);
        return min(min(dist.x, dist.y), min(dist.z, dist.w)) * u.morphFactor;
    } else if (gt == 1) {
        let pos = fract(p * d); let dist = min(pos, 1.0 - pos);
        return min(min(dist.x, dist.y), min(dist.z, dist.w)) * u.morphFactor;
    } else if (gt == 2) {
        let r = length(p); let sph = abs(fract(r * d) - 0.5) * 2.0;
        let harm = sin(atan2(p.y, p.x) * 3.0) * 0.2;
        return (sph + harm) * u.morphFactor;
    } else if (gt == 3) {
        let r1 = length(p.xy) - 2.0; let tor = length(vec2<f32>(r1, p.z)) - 0.8;
        let lat = sin(p.x * d) * sin(p.y * d);
        return (tor + lat * 0.3) * u.morphFactor;
    } else if (gt == 4) {
        let ua = atan2(p.y, p.x); let va = atan2(p.w, p.z);
        let dist = length(p) - 2.0; let lat = sin(ua * d) * sin(va * d);
        return (dist + lat * 0.4) * u.morphFactor;
    } else if (gt == 5) {
        var pos = fract(p * d); pos = abs(pos * 2.0 - 1.0);
        return length(max(abs(pos) - 1.0, vec4<f32>(0.0))) * u.morphFactor;
    } else if (gt == 6) {
        let t = u.time * 0.001 * u.speed;
        return sin(p.x * d + t) * sin(p.y * d + t * 1.3) * sin(p.z * d * 0.8 + t * 0.7) * u.morphFactor;
    } else {
        let pos = fract(p * d) - 0.5;
        return max(max(abs(pos.x), abs(pos.y)), max(abs(pos.z), abs(pos.w))) * u.morphFactor;
    }
}

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
};

@fragment
fn main(input: VertexOutput) -> @location(0) vec4<f32> {
    let fragCoord = input.position.xy;
    let uv2 = (fragCoord - u.resolution * 0.5) / min(u.resolution.x, u.resolution.y);
    let timeSpeed = u.time * 0.0001 * u.speed;

    var pos = vec4<f32>(uv2 * 3.0, sin(timeSpeed * 3.0), cos(timeSpeed * 2.0));
    pos = vec4<f32>(pos.xy + (vec2<f32>(0.5, 0.5) - 0.5) * u.mouseIntensity * 2.0, pos.z, pos.w);

    pos = rotateXY_w(u.rot4dXY) * pos;
    pos = rotateXZ_w(u.rot4dXZ) * pos;
    pos = rotateYZ_w(u.rot4dYZ) * pos;
    pos = rotateXW_w(u.rot4dXW) * pos;
    pos = rotateYW_w(u.rot4dYW) * pos;
    pos = rotateZW_w(u.rot4dZW) * pos;

    let basePoint = project4Dto3D_w(pos);
    let warpedPoint = applyCoreWarp_w(basePoint, u.geometry, vec2<f32>(0.0, 0.0));
    let warpedPos = vec4<f32>(warpedPoint, pos.w);
    var value = geometryFunction_w(warpedPos);

    let noise = sin(pos.x * 7.0) * cos(pos.y * 11.0) * sin(pos.z * 13.0);
    value += noise * u.chaos;

    var geomIntensity = 1.0 - clamp(abs(value), 0.0, 1.0);
    geomIntensity += u.clickIntensity * 0.3;

    // Vitality (Breath) modulation
    let breathMod = 1.0 + (u.breath * 0.3);
    let finalIntensity = geomIntensity * u.intensity * breathMod;

    let hueVal = u.hue / 360.0 + value * 0.1 + u.high * 0.08;
    let baseColor = vec3<f32>(
        sin(hueVal * 6.28318 + 0.0) * 0.5 + 0.5,
        sin(hueVal * 6.28318 + 2.0943) * 0.5 + 0.5,
        sin(hueVal * 6.28318 + 4.1887) * 0.5 + 0.5);
    let gray = (baseColor.r + baseColor.g + baseColor.b) / 3.0;
    let color = mix(vec3<f32>(gray), baseColor, u.saturation) * finalIntensity;

    return vec4<f32>(color, finalIntensity);
}
`;

// ============================================================================
// FacetedSystem Class
// ============================================================================

export class FacetedSystem {
    constructor() {
        this.bridge = null;
        this.canvas = null;
        this.params = {};
        this.initialized = false;
        this.contextLost = false;
    }

    async initWithBridge(canvas, options) {
        this.canvas = canvas;
        try {
            this.bridge = await UnifiedRenderBridge.create(canvas, options);
            if (this.bridge) {
                const success = this.bridge.compileShader('faceted', {
                    glslVertex: VERTEX_SHADER_GLSL,
                    glslFragment: FRAGMENT_SHADER_GLSL,
                    wgslFragment: FRAGMENT_SHADER_WGSL
                });
                if (!success) {
                    console.error("Faceted shader compilation failed");
                    return false;
                }
                this.initialized = true;
                return true;
            }
        } catch (e) {
            console.error("Faceted initWithBridge failed:", e);
        }
        return false;
    }

    async initialize() {
        if (this.initialized) return true;

        // Find default canvas if not already set
        const canvas = document.getElementById('faceted-content-canvas') ||
                      document.getElementById('content-canvas');
        if (!canvas) {
            console.warn("FacetedSystem: No canvas found for initialize()");
            return false;
        }

        return this.initWithBridge(canvas, { preferWebGPU: false });
    }

    updateParameters(params) {
        if (!params) return;
        this.params = { ...this.params, ...params };

        // Handle breath mapping if key is 'breath' -> 'u_breath'
        if ('breath' in params) {
            this.params.u_breath = params.breath;
        }

        if (this.bridge) {
            this.bridge.setUniforms(this.params);
        }
    }

    render() {
        if (this.bridge) {
            this.bridge.render('faceted', { clear: true, clearColor: [0,0,0,0] });
        }
    }

    getBackendType() {
        return this.bridge ? this.bridge.getBackendType() : 'none';
    }

    setActive(active) {
        const layer = document.getElementById('faceted-layer');
        if (layer) layer.style.display = active ? 'block' : 'none';
    }

    // RendererContract compliance: init / resize / dispose
    init(context) {
        return this.initialize();
    }

    resize(width, height, pixelRatio = 1) {
        if (this.bridge && this.bridge.resize) {
            this.bridge.resize(width, height, pixelRatio);
        }
    }

    dispose() {
        this.destroy();
    }

    destroy() {
        if (this.bridge) {
            this.bridge.dispose();
            this.bridge = null;
        }
        this.initialized = false;
    }
}
