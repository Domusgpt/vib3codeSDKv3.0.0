// VIB3+ 24 Geometry SDF Library (WGSL)
// 8 base + 8 Hypersphere Core + 8 Hypertetrahedron Core

fn baseGeometry(p: vec4<f32>, t: f32) -> f32 {
    if (t < 0.5) {
        // 0: Tetrahedron
        return max(max(max(abs(p.x + p.y) - p.z, abs(p.x - p.y) - p.z),
                       abs(p.x + p.y) + p.z), abs(p.x - p.y) + p.z) / sqrt(3.0);
    } else if (t < 1.5) {
        // 1: Hypercube
        let q = abs(p) - vec4<f32>(0.8);
        return length(max(q, vec4<f32>(0.0))) + min(max(max(max(q.x, q.y), q.z), q.w), 0.0);
    } else if (t < 2.5) {
        // 2: Sphere
        return length(p) - 1.0;
    } else if (t < 3.5) {
        // 3: Torus
        let t2 = vec2<f32>(length(p.xy) - 0.8, p.z);
        return length(t2) - 0.3;
    } else if (t < 4.5) {
        // 4: Klein Bottle (simplified)
        let r = length(p.xy);
        return abs(r - 0.7) - 0.2 + sin(atan2(p.y, p.x) * 3.0 + p.z * 5.0) * 0.1;
    } else if (t < 5.5) {
        // 5: Fractal (Mandelbulb approximation)
        return length(p) - 0.8 + sin(p.x * 5.0) * sin(p.y * 5.0) * sin(p.z * 5.0) * 0.2;
    } else if (t < 6.5) {
        // 6: Wave
        return abs(p.z - sin(p.x * 5.0 + u.time) * cos(p.y * 5.0 + u.time) * 0.3) - 0.1;
    } else {
        // 7: Crystal
        let q = abs(p);
        return max(max(max(q.x, q.y), q.z), q.w) - 0.8;
    }
}

fn hypersphereCore(p: vec4<f32>, baseType: f32) -> f32 {
    return max(baseGeometry(p, baseType), length(p) - 1.2);
}

fn hypertetrahedronCore(p: vec4<f32>, baseType: f32) -> f32 {
    let tf = max(max(max(
        abs(p.x + p.y) - p.z - p.w,
        abs(p.x - p.y) - p.z + p.w),
        abs(p.x + p.y) + p.z - p.w),
        abs(p.x - p.y) + p.z + p.w) / sqrt(4.0);
    return max(baseGeometry(p, baseType), tf);
}

// ── Polytope Core Warp Functions ──
// Requires: rotation functions from rotation4d.wgsl and u: VIB3Uniforms

fn warpHypersphereCore_common(p: vec3<f32>, geomIdx: i32) -> vec3<f32> {
    let radius = length(p);
    let morphBlend = clamp(u.morphFactor * 0.6 + (u.dimension - 3.0) * 0.25, 0.0, 2.0);
    let w = sin(radius * (1.3 + f32(geomIdx) * 0.12) + u.time * 0.0008 * u.speed)
          * (0.4 + morphBlend * 0.45);
    var p4d = vec4<f32>(p * (1.0 + morphBlend * 0.2), w);
    p4d = rotateXY(u.rot4dXY) * p4d;
    p4d = rotateXZ(u.rot4dXZ) * p4d;
    p4d = rotateYZ(u.rot4dYZ) * p4d;
    p4d = rotateXW(u.rot4dXW) * p4d;
    p4d = rotateYW(u.rot4dYW) * p4d;
    p4d = rotateZW(u.rot4dZW) * p4d;
    let proj = project4Dto3D(p4d);
    return mix(p, proj, clamp(0.45 + morphBlend * 0.35, 0.0, 1.0));
}

fn warpHypertetraCore_common(p: vec3<f32>, geomIdx: i32) -> vec3<f32> {
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
    p4d = rotateXY(u.rot4dXY) * p4d;
    p4d = rotateXZ(u.rot4dXZ) * p4d;
    p4d = rotateYZ(u.rot4dYZ) * p4d;
    p4d = rotateXW(u.rot4dXW) * p4d;
    p4d = rotateYW(u.rot4dYW) * p4d;
    p4d = rotateZW(u.rot4dZW) * p4d;
    let proj = project4Dto3D(p4d);
    let planeInf = min(min(abs(dot(p, c1)), abs(dot(p, c2))),
                       min(abs(dot(p, c3)), abs(dot(p, c4))));
    let blended = mix(p, proj, clamp(0.45 + morphBlend * 0.35, 0.0, 1.0));
    return mix(blended, blended * (1.0 - planeInf * 0.55), 0.2 + morphBlend * 0.2);
}

fn applyCoreWarp_common(p: vec3<f32>, geomType: f32) -> vec3<f32> {
    let coreFloat = floor(geomType / 8.0);
    let coreIndex = i32(clamp(coreFloat, 0.0, 2.0));
    let baseFloat = geomType - floor(geomType / 8.0) * 8.0;
    let geomIdx = i32(clamp(floor(baseFloat + 0.5), 0.0, 7.0));
    if (coreIndex == 1) { return warpHypersphereCore_common(p, geomIdx); }
    if (coreIndex == 2) { return warpHypertetraCore_common(p, geomIdx); }
    return p;
}

fn geometry(p: vec4<f32>, t: f32) -> f32 {
    if (t < 8.0) { return baseGeometry(p, t); }
    else if (t < 16.0) { return hypersphereCore(p, t - 8.0); }
    else { return hypertetrahedronCore(p, t - 16.0); }
}
