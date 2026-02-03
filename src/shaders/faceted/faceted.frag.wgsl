// VIB3+ Faceted System Fragment Shader (WGSL)
// Clean 2D geometric patterns with 4D rotation projection
// 24 geometry variants: 8 base + 8 Hypersphere Core + 8 Hypertetrahedron Core

struct VIB3Uniforms {
    time: f32,
    speed: f32,
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
    hue: f32,
    intensity: f32,
    saturation: f32,
    mouseIntensity: f32,
    clickIntensity: f32,
    roleIntensity: f32,
    bass: f32,
    mid: f32,
    high: f32,
    _pad0: f32,
    mouse: vec2<f32>,
    _pad1: vec2<f32>,
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
    pos = vec4<f32>(pos.xy + (u.mouse - 0.5) * u.mouseIntensity * 2.0, pos.z, pos.w);

    pos = rotateXY_w(u.rot4dXY) * pos;
    pos = rotateXZ_w(u.rot4dXZ) * pos;
    pos = rotateYZ_w(u.rot4dYZ) * pos;
    pos = rotateXW_w(u.rot4dXW) * pos;
    pos = rotateYW_w(u.rot4dYW) * pos;
    pos = rotateZW_w(u.rot4dZW) * pos;

    let basePoint = project4Dto3D_w(pos);
    let warpedPoint = applyCoreWarp_w(basePoint, u.geometry, u.mouse - 0.5);
    let warpedPos = vec4<f32>(warpedPoint, pos.w);
    var value = geometryFunction_w(warpedPos);

    let noise = sin(pos.x * 7.0) * cos(pos.y * 11.0) * sin(pos.z * 13.0);
    value += noise * u.chaos;

    var geomIntensity = 1.0 - clamp(abs(value), 0.0, 1.0);
    geomIntensity += u.clickIntensity * 0.3;
    let finalIntensity = geomIntensity * u.intensity;

    let hueVal = u.hue / 360.0 + value * 0.1 + u.high * 0.08;
    let baseColor = vec3<f32>(
        sin(hueVal * 6.28318 + 0.0) * 0.5 + 0.5,
        sin(hueVal * 6.28318 + 2.0943) * 0.5 + 0.5,
        sin(hueVal * 6.28318 + 4.1887) * 0.5 + 0.5);
    let gray = (baseColor.r + baseColor.g + baseColor.b) / 3.0;
    let color = mix(vec3<f32>(gray), baseColor, u.saturation) * finalIntensity;

    return vec4<f32>(color, finalIntensity * u.roleIntensity);
}
