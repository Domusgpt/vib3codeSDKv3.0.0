// VIB3+ Holographic System Fragment Shader (WGSL)
// 5-layer glassmorphic audio-reactive effects
// Port of the GLSL HolographicVisualizer shader with Exhale feature

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
    breath: f32,
};

@group(0) @binding(0) var<uniform> u: VIB3Uniforms;

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
};

// ========== 6D Rotation ==========
fn rotateXY(angle: f32) -> mat4x4<f32> {
    let c = cos(angle); let s = sin(angle);
    return mat4x4<f32>(
        vec4<f32>(c, -s, 0.0, 0.0), vec4<f32>(s, c, 0.0, 0.0),
        vec4<f32>(0.0, 0.0, 1.0, 0.0), vec4<f32>(0.0, 0.0, 0.0, 1.0));
}
fn rotateXZ(angle: f32) -> mat4x4<f32> {
    let c = cos(angle); let s = sin(angle);
    return mat4x4<f32>(
        vec4<f32>(c, 0.0, s, 0.0), vec4<f32>(0.0, 1.0, 0.0, 0.0),
        vec4<f32>(-s, 0.0, c, 0.0), vec4<f32>(0.0, 0.0, 0.0, 1.0));
}
fn rotateYZ(angle: f32) -> mat4x4<f32> {
    let c = cos(angle); let s = sin(angle);
    return mat4x4<f32>(
        vec4<f32>(1.0, 0.0, 0.0, 0.0), vec4<f32>(0.0, c, -s, 0.0),
        vec4<f32>(0.0, s, c, 0.0), vec4<f32>(0.0, 0.0, 0.0, 1.0));
}
fn rotateXW(angle: f32) -> mat4x4<f32> {
    let c = cos(angle); let s = sin(angle);
    return mat4x4<f32>(
        vec4<f32>(c, 0.0, 0.0, -s), vec4<f32>(0.0, 1.0, 0.0, 0.0),
        vec4<f32>(0.0, 0.0, 1.0, 0.0), vec4<f32>(s, 0.0, 0.0, c));
}
fn rotateYW(angle: f32) -> mat4x4<f32> {
    let c = cos(angle); let s = sin(angle);
    return mat4x4<f32>(
        vec4<f32>(1.0, 0.0, 0.0, 0.0), vec4<f32>(0.0, c, 0.0, -s),
        vec4<f32>(0.0, 0.0, 1.0, 0.0), vec4<f32>(0.0, s, 0.0, c));
}
fn rotateZW(angle: f32) -> mat4x4<f32> {
    let c = cos(angle); let s = sin(angle);
    return mat4x4<f32>(
        vec4<f32>(1.0, 0.0, 0.0, 0.0), vec4<f32>(0.0, 1.0, 0.0, 0.0),
        vec4<f32>(0.0, 0.0, c, -s), vec4<f32>(0.0, 0.0, s, c));
}

fn apply6DRot(pos: vec4<f32>) -> vec4<f32> {
    var p = pos;
    p = rotateXY(u.rot4dXY + u.time * 0.05) * p;
    p = rotateXZ(u.rot4dXZ + u.time * 0.06) * p;
    p = rotateYZ(u.rot4dYZ + u.time * 0.04) * p;
    p = rotateXW(u.rot4dXW + u.time * 0.07) * p;
    p = rotateYW(u.rot4dYW + u.time * 0.08) * p;
    p = rotateZW(u.rot4dZW + u.time * 0.09) * p;
    return p;
}

// ========== 4D to 3D Projection (Breathing) ==========
fn project4Dto3D_w(p: vec4<f32>) -> vec3<f32> {
    // Modulate projection with breath
    let baseDim = 2.5;
    let dim = baseDim + u.breath * 0.5;
    let w = dim / (dim + p.w);
    return vec3<f32>(p.x * w, p.y * w, p.z * w);
}

// ========== Polytope Core Warp Functions ==========
fn warpHypersphereCore_w(p: vec3<f32>, geomIdx: i32) -> vec3<f32> {
    let radius = length(p);
    let morphBlend = clamp(u.morphFactor * 0.6 + 0.3, 0.0, 2.0);
    let w = sin(radius * (1.3 + f32(geomIdx) * 0.12) + u.time * 0.0008 * u.speed)
          * (0.4 + morphBlend * 0.45);

    var p4d = vec4<f32>(p * (1.0 + morphBlend * 0.2), w);
    p4d = apply6DRot(p4d); // Reuse rotation helper

    let proj = project4Dto3D_w(p4d);
    return mix(p, proj, clamp(0.45 + morphBlend * 0.35, 0.0, 1.0));
}

fn warpHypertetraCore_w(p: vec3<f32>, geomIdx: i32) -> vec3<f32> {
    let c1 = normalize(vec3<f32>(1.0, 1.0, 1.0));
    let c2 = normalize(vec3<f32>(-1.0, -1.0, 1.0));
    let c3 = normalize(vec3<f32>(-1.0, 1.0, -1.0));
    let c4 = normalize(vec3<f32>(1.0, -1.0, -1.0));

    let morphBlend = clamp(u.morphFactor * 0.8 + 0.2, 0.0, 2.0);
    let basisMix = dot(p, c1) * 0.14 + dot(p, c2) * 0.1 + dot(p, c3) * 0.08;
    let w = sin(basisMix * 5.5 + u.time * 0.0009 * u.speed)
          * cos(dot(p, c4) * 4.2 - u.time * 0.0007 * u.speed)
          * (0.5 + morphBlend * 0.4);

    let offset = vec3<f32>(dot(p, c1), dot(p, c2), dot(p, c3)) * 0.1 * morphBlend;
    var p4d = vec4<f32>(p + offset, w);
    p4d = apply6DRot(p4d);

    let proj = project4Dto3D_w(p4d);

    let planeInf = min(min(abs(dot(p, c1)), abs(dot(p, c2))),
                       min(abs(dot(p, c3)), abs(dot(p, c4))));
    let blended = mix(p, proj, clamp(0.45 + morphBlend * 0.35, 0.0, 1.0));
    return mix(blended, blended * (1.0 - planeInf * 0.55), 0.2 + morphBlend * 0.2);
}

fn applyCoreWarp_w(p: vec3<f32>, geomType: f32) -> vec3<f32> {
    let totalBase = 8.0;
    let coreFloat = floor(geomType / totalBase);
    let coreIndex = i32(clamp(coreFloat, 0.0, 2.0));
    let baseFloat = geomType - floor(geomType / totalBase) * totalBase;
    let geomIdx = i32(clamp(floor(baseFloat + 0.5), 0.0, totalBase - 1.0));

    if (coreIndex == 1) { return warpHypersphereCore_w(p, geomIdx); }
    if (coreIndex == 2) { return warpHypertetraCore_w(p, geomIdx); }
    return p;
}

// ========== 24 Geometry SDFs (Base 8) ==========
fn baseGeometry(p: vec3<f32>, t: f32) -> f32 {
    let totalBase = 8.0;
    let baseFloat = t - floor(t / totalBase) * totalBase;
    // We use integer comparison here since WGSL doesn't like float switches
    if (baseFloat < 0.5) { // Tetrahedron
        return max(max(max(abs(p.x + p.y) - p.z, abs(p.x - p.y) - p.z),
                       abs(p.x + p.y) + p.z), abs(p.x - p.y) + p.z) / sqrt(3.0);
    } else if (baseFloat < 1.5) { // Hypercube (projected)
        let q = abs(p) - vec3<f32>(0.8);
        return length(max(q, vec3<f32>(0.0))) + min(max(max(q.x, q.y), q.z), 0.0);
    } else if (baseFloat < 2.5) { // Sphere
        return length(p) - 1.0;
    } else if (baseFloat < 3.5) { // Torus
        let t2 = vec2<f32>(length(p.xy) - 0.8, p.z);
        return length(t2) - 0.3;
    } else if (baseFloat < 4.5) { // Klein
        let r = length(p.xy);
        return abs(r - 0.7) - 0.2 + sin(atan2(p.y, p.x) * 3.0 + p.z * 5.0) * 0.1;
    } else if (baseFloat < 5.5) { // Fractal
        return length(p) - 0.8 + sin(p.x * 5.0) * sin(p.y * 5.0) * sin(p.z * 5.0) * 0.2;
    } else if (baseFloat < 6.5) { // Wave
        return abs(p.z - sin(p.x * 5.0 + u.time) * cos(p.y * 5.0 + u.time) * 0.3) - 0.1;
    } else { // Crystal
        let q = abs(p);
        return max(max(q.x, q.y), q.z) - 0.8;
    }
}

// ========== HSL to RGB ==========
fn hue2rgb(p: f32, q: f32, tin: f32) -> f32 {
    var t = tin;
    if (t < 0.0) { t += 1.0; }
    if (t > 1.0) { t -= 1.0; }
    if (t < 1.0 / 6.0) { return p + (q - p) * 6.0 * t; }
    if (t < 1.0 / 2.0) { return q; }
    if (t < 2.0 / 3.0) { return p + (q - p) * (2.0 / 3.0 - t) * 6.0; }
    return p;
}

fn hslToRgb(h: f32, s: f32, l: f32) -> vec3<f32> {
    if (s == 0.0) { return vec3<f32>(l); }
    let q = select(l + s - l * s, l * (1.0 + s), l < 0.5);
    let p = 2.0 * l - q;
    return vec3<f32>(
        hue2rgb(p, q, h + 1.0 / 3.0),
        hue2rgb(p, q, h),
        hue2rgb(p, q, h - 1.0 / 3.0)
    );
}

// ========== Main Fragment ==========
@fragment
fn main(input: VertexOutput) -> @location(0) vec4<f32> {
    let fragCoord = input.position.xy;
    let uv = (fragCoord - 0.5 * u.resolution) / min(u.resolution.x, u.resolution.y);

    let density = u.densityMult;
    let spd = u.speedMult;

    // Create 4D point (simplified to 3D base + W)
    // SCALE FIX: Apply gridDensity scaling if densityMult is weak?
    // WGSL density logic usually relies on densityMult passed by bridge.
    // But let's apply the same scaling logic just in case:
    var effectiveDensity = density;
    if (u.gridDensity > 0.1 && density < 0.5) {
         effectiveDensity = 0.3 + (u.gridDensity - 5.0) / 95.0 * 2.2;
    }

    var pos4d = vec4<f32>(uv * 2.0 * effectiveDensity, sin(u.time * 0.3 * spd) * 0.5, cos(u.time * 0.2 * spd) * 0.5);

    // Rotate
    pos4d = apply6DRot(pos4d);

    // Project to 3D (with breath)
    let pos3d = project4Dto3D_w(pos4d);

    // Warp (Polytope logic)
    var warpedPos = applyCoreWarp_w(pos3d, u.geometry);

    // Apply morph/chaos to warped point
    warpedPos *= u.morphFactor;
    warpedPos += vec3<f32>(sin(u.time * 0.1), cos(u.time * 0.15), sin(u.time * 0.12)) * u.chaos;

    // Geometry evaluation on warped 3D point
    let dist = baseGeometry(warpedPos, u.geometry);

    let edge = smoothstep(0.02, 0.0, abs(dist));
    let fill = smoothstep(0.1, 0.0, dist) * 0.3;

    // Color from HSL
    let hueVal = u.hue / 360.0;
    let sat = clamp(u.saturation, 0.0, 1.0);
    let lightness = clamp(u.intensity, 0.2, 0.8);
    let color = hslToRgb(hueVal, sat, lightness);

    // Final alpha - modulate with breath
    let breathAlpha = 1.0 + u.breath * 0.2;
    let alpha = (edge + fill) * u.intensity * u.layerOpacity * breathAlpha;

    return vec4<f32>(color * alpha, alpha);
}
