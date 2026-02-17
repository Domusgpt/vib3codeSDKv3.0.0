// VIB3+ 24 Geometry SDF Library (GLSL)
// 8 base + 8 Hypersphere Core + 8 Hypertetrahedron Core

// Base geometry SDFs (0-7)
float baseGeometry(vec4 p, float type) {
    if (type < 0.5) {
        // 0: Tetrahedron
        return max(max(max(abs(p.x + p.y) - p.z, abs(p.x - p.y) - p.z),
                           abs(p.x + p.y) + p.z), abs(p.x - p.y) + p.z) / sqrt(3.0);
    } else if (type < 1.5) {
        // 1: Hypercube
        vec4 q = abs(p) - 0.8;
        return length(max(q, 0.0)) + min(max(max(max(q.x, q.y), q.z), q.w), 0.0);
    } else if (type < 2.5) {
        // 2: Sphere
        return length(p) - 1.0;
    } else if (type < 3.5) {
        // 3: Torus
        vec2 t = vec2(length(p.xy) - 0.8, p.z);
        return length(t) - 0.3;
    } else if (type < 4.5) {
        // 4: Klein Bottle (simplified)
        float r = length(p.xy);
        return abs(r - 0.7) - 0.2 + sin(atan(p.y, p.x) * 3.0 + p.z * 5.0) * 0.1;
    } else if (type < 5.5) {
        // 5: Fractal (Mandelbulb approximation)
        return length(p) - 0.8 + sin(p.x * 5.0) * sin(p.y * 5.0) * sin(p.z * 5.0) * 0.2;
    } else if (type < 6.5) {
        // 6: Wave
        return abs(p.z - sin(p.x * 5.0 + u_time) * cos(p.y * 5.0 + u_time) * 0.3) - 0.1;
    } else {
        // 7: Crystal
        vec4 q = abs(p);
        return max(max(max(q.x, q.y), q.z), q.w) - 0.8;
    }
}

// Hypersphere Core wrapper (8-15)
float hypersphereCore(vec4 p, float baseType) {
    float baseShape = baseGeometry(p, baseType);
    float sphereField = length(p) - 1.2;
    return max(baseShape, sphereField);
}

// Hypertetrahedron Core wrapper (16-23)
float hypertetrahedronCore(vec4 p, float baseType) {
    float baseShape = baseGeometry(p, baseType);
    float tetraField = max(max(max(
        abs(p.x + p.y) - p.z - p.w,
        abs(p.x - p.y) - p.z + p.w),
        abs(p.x + p.y) + p.z - p.w),
        abs(p.x - p.y) + p.z + p.w) / sqrt(4.0);
    return max(baseShape, tetraField);
}

// ── Polytope Core Warp Functions ──
// Requires: rotation matrices from rotation4d.glsl, project4Dto3D, and u_* uniforms

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

// Main geometry dispatcher (0-23)
float geometry(vec4 p, float type) {
    if (type < 8.0) {
        return baseGeometry(p, type);
    } else if (type < 16.0) {
        return hypersphereCore(p, type - 8.0);
    } else {
        return hypertetrahedronCore(p, type - 16.0);
    }
}
