(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))i(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();const Y={background:.4,shadow:.6,content:1,highlight:1.3,accent:1.6};class A{constructor(e,t,i,r){if(this.canvas=e instanceof HTMLCanvasElement?e:document.getElementById(e),this.role=t,this.reactivity=i,this.variant=r,this._canvasLabel=typeof e=="string"?e:(e==null?void 0:e.id)||"unknown",this.contextOptions={alpha:!0,depth:!0,stencil:!1,antialias:!1,premultipliedAlpha:!0,preserveDrawingBuffer:!1,powerPreference:"high-performance",failIfMajorPerformanceCaveat:!1},this.gl=this.canvas.getContext("webgl2",this.contextOptions)||this.canvas.getContext("webgl",this.contextOptions)||this.canvas.getContext("experimental-webgl",this.contextOptions),this.gl){if(window.mobileDebug){const s=this.gl.getParameter(this.gl.VERSION);window.mobileDebug.log(`✅ ${this._canvasLabel}: WebGL context created - ${s}`)}}else{console.error(`WebGL not supported for ${this._canvasLabel}`),window.mobileDebug&&window.mobileDebug.log(`❌ ${this._canvasLabel}: WebGL context creation failed`),this.showWebGLError();return}this.mouseX=.5,this.mouseY=.5,this.mouseIntensity=0,this.clickIntensity=0,this.startTime=Date.now(),this._contextLost=!1,this._onContextLost=s=>{s.preventDefault(),this._contextLost=!0,console.warn(`WebGL context lost for ${this._canvasLabel}`)},this._onContextRestored=()=>{console.log(`WebGL context restored for ${this._canvasLabel}`),this._contextLost=!1;try{this.init()}catch(s){console.error(`Failed to reinit after context restore for ${this._canvasLabel}:`,s)}},this.canvas.addEventListener("webglcontextlost",this._onContextLost),this.canvas.addEventListener("webglcontextrestored",this._onContextRestored),this.params={geometry:0,gridDensity:15,morphFactor:1,chaos:.2,speed:1,hue:200,intensity:.5,saturation:.8,dimension:3.5,rot4dXY:0,rot4dXZ:0,rot4dYZ:0,rot4dXW:0,rot4dYW:0,rot4dZW:0},this.init()}async ensureCanvasSizedThenInitWebGL(){let e=this.canvas.getBoundingClientRect();const t=Math.min(window.devicePixelRatio||1,2);e.width===0||e.height===0?await new Promise(i=>{setTimeout(()=>{if(e=this.canvas.getBoundingClientRect(),e.width===0||e.height===0){const r=window.innerWidth,s=window.innerHeight;this.canvas.width=r*t,this.canvas.height=s*t,window.mobileDebug&&window.mobileDebug.log(`📐 Quantum Canvas ${this.canvas.id}: Using viewport fallback ${this.canvas.width}x${this.canvas.height}`)}else this.canvas.width=e.width*t,this.canvas.height=e.height*t,window.mobileDebug&&window.mobileDebug.log(`📐 Quantum Canvas ${this.canvas.id}: Layout ready ${this.canvas.width}x${this.canvas.height}`);i()},100)}):(this.canvas.width=e.width*t,this.canvas.height=e.height*t,window.mobileDebug&&window.mobileDebug.log(`📐 Quantum Canvas ${this.canvas.id}: ${this.canvas.width}x${this.canvas.height} (DPR: ${t})`)),this.createWebGLContext(),this.gl&&this.init()}createWebGLContext(){let e=this.canvas.getContext("webgl2")||this.canvas.getContext("webgl")||this.canvas.getContext("experimental-webgl");if(e&&!e.isContextLost()){console.log(`🔄 Reusing existing WebGL context for ${this.canvas.id}`),this.gl=e;return}if(this.gl=this.canvas.getContext("webgl2",this.contextOptions)||this.canvas.getContext("webgl",this.contextOptions)||this.canvas.getContext("experimental-webgl",this.contextOptions),this.gl){if(window.mobileDebug){const t=this.gl.getParameter(this.gl.VERSION);window.mobileDebug.log(`✅ Quantum ${this.canvas.id}: WebGL context created - ${t} (size: ${this.canvas.width}x${this.canvas.height})`)}}else{console.error(`WebGL not supported for ${this.canvas.id}`),window.mobileDebug&&window.mobileDebug.log(`❌ Quantum ${this.canvas.id}: WebGL context creation failed (size: ${this.canvas.width}x${this.canvas.height})`),this.showWebGLError();return}}init(){this.initShaders(),this.initBuffers(),this.resize()}reinitializeContext(){if(console.log(`🔄 Reinitializing WebGL context for ${this.canvas.id}`),this.program=null,this.buffer=null,this.uniforms=null,this.gl=null,this.gl=this.canvas.getContext("webgl2")||this.canvas.getContext("webgl")||this.canvas.getContext("experimental-webgl"),!this.gl)return console.error(`❌ No WebGL context available for ${this.canvas.id} - SmartCanvasPool should have created one`),!1;if(this.gl.isContextLost())return console.error(`❌ WebGL context is lost for ${this.canvas.id}`),!1;try{return this.initShaders(),this.initBuffers(),this.resize(),console.log(`✅ WebGL context reinitialized for ${this.canvas.id}`),!0}catch(e){return console.error(`❌ Failed to reinitialize WebGL resources for ${this.canvas.id}:`,e),!1}}initShaders(){const e=`attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}`,t=`
#ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
#else
    precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_geometry;
uniform float u_gridDensity;
uniform float u_morphFactor;
uniform float u_chaos;
uniform float u_speed;
uniform float u_hue;
uniform float u_intensity;
uniform float u_saturation;
uniform float u_dimension;
uniform float u_rot4dXY;
uniform float u_rot4dXZ;
uniform float u_rot4dYZ;
uniform float u_rot4dXW;
uniform float u_rot4dYW;
uniform float u_rot4dZW;
uniform float u_mouseIntensity;
uniform float u_clickIntensity;
uniform float u_roleIntensity;
uniform float u_breath;

// 6D rotation matrices - 3D space rotations (XY, XZ, YZ)
mat4 rotateXY(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(c, -s, 0.0, 0.0, s, c, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0);
}

mat4 rotateXZ(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(c, 0.0, s, 0.0, 0.0, 1.0, 0.0, 0.0, -s, 0.0, c, 0.0, 0.0, 0.0, 0.0, 1.0);
}

mat4 rotateYZ(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(1.0, 0.0, 0.0, 0.0, 0.0, c, -s, 0.0, 0.0, s, c, 0.0, 0.0, 0.0, 0.0, 1.0);
}

// 4D hyperspace rotations (XW, YW, ZW)
mat4 rotateXW(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(c, 0.0, 0.0, -s, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, s, 0.0, 0.0, c);
}

mat4 rotateYW(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(1.0, 0.0, 0.0, 0.0, 0.0, c, 0.0, -s, 0.0, 0.0, 1.0, 0.0, 0.0, s, 0.0, c);
}

mat4 rotateZW(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat4(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, c, -s, 0.0, 0.0, s, c);
}

vec3 project4Dto3D(vec4 p) {
    float w = 2.5 / (2.5 + p.w);
    return vec3(p.x * w, p.y * w, p.z * w);
}

// ========================================
// POLYTOPE CORE WARP FUNCTIONS (24 Geometries)
// ========================================
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

    float planeInfluence = min(min(abs(dot(p, c1)), abs(dot(p, c2))), min(abs(dot(p, c3)), abs(dot(p, c4))));
    vec3 blended = mix(p, projected, clamp(0.45 + morphBlend * 0.35, 0.0, 1.0));
    return mix(blended, blended * (1.0 - planeInfluence * 0.55), 0.2 + morphBlend * 0.2);
}

vec3 applyCoreWarp(vec3 p, float geometryType, vec2 mouseDelta) {
    float totalBase = 8.0;
    float coreFloat = floor(geometryType / totalBase);
    int coreIndex = int(clamp(coreFloat, 0.0, 2.0));
    float baseGeomFloat = mod(geometryType, totalBase);
    int geometryIndex = int(clamp(floor(baseGeomFloat + 0.5), 0.0, totalBase - 1.0));

    if (coreIndex == 1) {
        return warpHypersphereCore(p, geometryIndex, mouseDelta);
    }
    if (coreIndex == 2) {
        return warpHypertetraCore(p, geometryIndex, mouseDelta);
    }
    return p;
}
// ========================================

// Complex 3D Lattice Functions - Superior Quantum Shaders
float tetrahedronLattice(vec3 p, float gridSize) {
    vec3 q = fract(p * gridSize) - 0.5;
    float d1 = length(q);
    float d2 = length(q - vec3(0.4, 0.0, 0.0));
    float d3 = length(q - vec3(0.0, 0.4, 0.0));
    float d4 = length(q - vec3(0.0, 0.0, 0.4));
    float vertices = 1.0 - smoothstep(0.0, 0.04, min(min(d1, d2), min(d3, d4)));
    float edges = 0.0;
    edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.xy) - 0.2)));
    edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.yz) - 0.2)));
    edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.xz) - 0.2)));
    return max(vertices, edges * 0.5);
}

float hypercubeLattice(vec3 p, float gridSize) {
    vec3 grid = fract(p * gridSize);
    vec3 edges = min(grid, 1.0 - grid);
    float minEdge = min(min(edges.x, edges.y), edges.z);
    float lattice = 1.0 - smoothstep(0.0, 0.03, minEdge);

    vec3 centers = abs(grid - 0.5);
    float maxCenter = max(max(centers.x, centers.y), centers.z);
    float vertices = 1.0 - smoothstep(0.45, 0.5, maxCenter);

    return max(lattice * 0.7, vertices);
}

float sphereLattice(vec3 p, float gridSize) {
    vec3 cell = fract(p * gridSize) - 0.5;
    float sphere = 1.0 - smoothstep(0.15, 0.25, length(cell));

    float rings = 0.0;
    float ringRadius = length(cell.xy);
    rings = max(rings, 1.0 - smoothstep(0.0, 0.02, abs(ringRadius - 0.3)));
    rings = max(rings, 1.0 - smoothstep(0.0, 0.02, abs(ringRadius - 0.2)));

    return max(sphere, rings * 0.6);
}

float torusLattice(vec3 p, float gridSize) {
    vec3 cell = fract(p * gridSize) - 0.5;
    float majorRadius = 0.3;
    float minorRadius = 0.1;

    float toroidalDist = length(vec2(length(cell.xy) - majorRadius, cell.z));
    float torus = 1.0 - smoothstep(minorRadius - 0.02, minorRadius + 0.02, toroidalDist);

    float rings = 0.0;
    float angle = atan(cell.y, cell.x);
    rings = sin(angle * 8.0) * 0.02;

    return max(torus, 0.0) + rings;
}

float kleinLattice(vec3 p, float gridSize) {
    vec3 cell = fract(p * gridSize) - 0.5;
    float u = atan(cell.y, cell.x) / 3.14159 + 1.0;
    float v = cell.z + 0.5;

    float x = (2.0 + cos(u * 0.5)) * cos(u);
    float y = (2.0 + cos(u * 0.5)) * sin(u);
    float z = sin(u * 0.5) + v;

    vec3 kleinPoint = vec3(x, y, z) * 0.1;
    float dist = length(cell - kleinPoint);

    return 1.0 - smoothstep(0.1, 0.15, dist);
}

float fractalLattice(vec3 p, float gridSize) {
    vec3 cell = fract(p * gridSize);
    cell = abs(cell * 2.0 - 1.0);

    float dist = length(max(abs(cell) - 0.3, 0.0));

    // Recursive subdivision
    for(int i = 0; i < 3; i++) {
        cell = abs(cell * 2.0 - 1.0);
        float subdist = length(max(abs(cell) - 0.3, 0.0)) / pow(2.0, float(i + 1));
        dist = min(dist, subdist);
    }

    return 1.0 - smoothstep(0.0, 0.05, dist);
}

float waveLattice(vec3 p, float gridSize) {
    float time = u_time * 0.001 * u_speed;
    vec3 cell = fract(p * gridSize) - 0.5;

    float wave1 = sin(p.x * gridSize * 2.0 + time * 2.0);
    float wave2 = sin(p.y * gridSize * 1.8 + time * 1.5);
    float wave3 = sin(p.z * gridSize * 2.2 + time * 1.8);

    float interference = (wave1 + wave2 + wave3) / 3.0;
    float amplitude = 1.0 - length(cell) * 2.0;

    return max(0.0, interference * amplitude);
}

float crystalLattice(vec3 p, float gridSize) {
    vec3 cell = fract(p * gridSize) - 0.5;

    // Octahedral crystal structure
    float crystal = max(max(abs(cell.x) + abs(cell.y), abs(cell.y) + abs(cell.z)), abs(cell.x) + abs(cell.z));
    crystal = 1.0 - smoothstep(0.3, 0.4, crystal);

    // Add crystalline faces
    float faces = 0.0;
    faces = max(faces, 1.0 - smoothstep(0.0, 0.02, abs(abs(cell.x) - 0.35)));
    faces = max(faces, 1.0 - smoothstep(0.0, 0.02, abs(abs(cell.y) - 0.35)));
    faces = max(faces, 1.0 - smoothstep(0.0, 0.02, abs(abs(cell.z) - 0.35)));

    return max(crystal, faces * 0.5);
}

// Enhanced geometry function with holographic effects (24 GEOMETRIES)
float geometryFunction(vec4 p) {
    // Decode geometry: base = geometry % 8 (supports 24 geometries)
    float totalBase = 8.0;
    float baseGeomFloat = mod(u_geometry, totalBase);
    int geomType = int(clamp(floor(baseGeomFloat + 0.5), 0.0, totalBase - 1.0));

    // Project to 3D and apply polytope warp
    vec3 p3d = project4Dto3D(p);
    vec3 warped = applyCoreWarp(p3d, u_geometry, vec2(0.0, 0.0));
    float gridSize = u_gridDensity * 0.08;

    if (geomType == 0) {
        return tetrahedronLattice(warped, gridSize) * u_morphFactor;
    }
    else if (geomType == 1) {
        return hypercubeLattice(warped, gridSize) * u_morphFactor;
    }
    else if (geomType == 2) {
        return sphereLattice(warped, gridSize) * u_morphFactor;
    }
    else if (geomType == 3) {
        return torusLattice(warped, gridSize) * u_morphFactor;
    }
    else if (geomType == 4) {
        return kleinLattice(warped, gridSize) * u_morphFactor;
    }
    else if (geomType == 5) {
        return fractalLattice(warped, gridSize) * u_morphFactor;
    }
    else if (geomType == 6) {
        return waveLattice(warped, gridSize) * u_morphFactor;
    }
    else if (geomType == 7) {
        return crystalLattice(warped, gridSize) * u_morphFactor;
    }
    else {
        return hypercubeLattice(warped, gridSize) * u_morphFactor;
    }
}

// HSL to RGB conversion for proper color control
vec3 hsl2rgb(float h, float s, float l) {
    float c = (1.0 - abs(2.0 * l - 1.0)) * s;
    float hp = h * 6.0; // h is 0-1
    float x = c * (1.0 - abs(mod(hp, 2.0) - 1.0));
    float m = l - c * 0.5;
    vec3 rgb;
    if (hp < 1.0)      rgb = vec3(c, x, 0.0);
    else if (hp < 2.0) rgb = vec3(x, c, 0.0);
    else if (hp < 3.0) rgb = vec3(0.0, c, x);
    else if (hp < 4.0) rgb = vec3(0.0, x, c);
    else if (hp < 5.0) rgb = vec3(x, 0.0, c);
    else               rgb = vec3(c, 0.0, x);
    return rgb + m;
}

// LAYER-BY-LAYER COLOR SYSTEM with user hue/saturation control
// Each layer gets a hue offset from the user-controlled base hue
vec3 getLayerColorPalette(int layerIndex, float t) {
    float baseHue = u_hue; // 0-1 from JavaScript (user hue / 360)
    float sat = u_saturation;

    // Per-layer hue offsets for visual variety
    float hueOffset = 0.0;
    float lightness = 0.5;

    if (layerIndex == 0) {
        // BACKGROUND: Darkened, shifted hue
        hueOffset = 0.0;
        lightness = 0.15;
        sat *= 0.7;
    }
    else if (layerIndex == 1) {
        // SHADOW: Complementary offset, medium-dark
        hueOffset = 0.33;
        lightness = 0.3;
        sat *= 0.9;
    }
    else if (layerIndex == 2) {
        // CONTENT: Primary hue, bright
        hueOffset = 0.0;
        lightness = 0.55;
    }
    else if (layerIndex == 3) {
        // HIGHLIGHT: Analogous offset, bright
        hueOffset = 0.15;
        lightness = 0.6;
    }
    else {
        // ACCENT: Triadic offset, vivid
        hueOffset = 0.67;
        lightness = 0.5;
    }

    // Animate hue gently over time and geometry value
    float animatedHue = fract(baseHue + hueOffset + sin(t * 3.0) * 0.05);
    return hsl2rgb(animatedHue, sat, lightness);
}

// Extreme RGB separation and distortion for each layer
vec3 extremeRGBSeparation(vec3 baseColor, vec2 uv, float intensity, int layerIndex) {
    vec2 offset = vec2(0.01, 0.005) * intensity;

    // Different separation patterns per layer
    if (layerIndex == 0) {
        // Background: Minimal separation, smooth
        return baseColor + vec3(
            sin(uv.x * 10.0 + u_time * 0.001) * 0.02,
            cos(uv.y * 8.0 + u_time * 0.0015) * 0.02,
            sin(uv.x * uv.y * 6.0 + u_time * 0.0008) * 0.02
        ) * intensity;
    }
    else if (layerIndex == 1) {
        // Shadow: Heavy vertical separation
        float r = baseColor.r + sin(uv.y * 50.0 + u_time * 0.003) * intensity * 0.15;
        float g = baseColor.g + sin((uv.y + 0.1) * 45.0 + u_time * 0.0025) * intensity * 0.12;
        float b = baseColor.b + sin((uv.y - 0.1) * 55.0 + u_time * 0.0035) * intensity * 0.18;
        return vec3(r, g, b);
    }
    else if (layerIndex == 2) {
        // Content: Explosive radial separation
        float dist = length(uv);
        float angle = atan(uv.y, uv.x);
        float r = baseColor.r + sin(dist * 30.0 + angle * 10.0 + u_time * 0.004) * intensity * 0.2;
        float g = baseColor.g + cos(dist * 25.0 + angle * 8.0 + u_time * 0.0035) * intensity * 0.18;
        float b = baseColor.b + sin(dist * 35.0 + angle * 12.0 + u_time * 0.0045) * intensity * 0.22;
        return vec3(r, g, b);
    }
    else if (layerIndex == 3) {
        // Highlight: Lightning-like separation
        float lightning = sin(uv.x * 80.0 + u_time * 0.008) * cos(uv.y * 60.0 + u_time * 0.006);
        float r = baseColor.r + lightning * intensity * 0.25;
        float g = baseColor.g + sin(lightning * 40.0 + u_time * 0.005) * intensity * 0.2;
        float b = baseColor.b + cos(lightning * 30.0 + u_time * 0.007) * intensity * 0.3;
        return vec3(r, g, b);
    }
    else {
        // Accent: Chaotic multi-directional separation
        float chaos1 = sin(uv.x * 100.0 + uv.y * 80.0 + u_time * 0.01);
        float chaos2 = cos(uv.x * 70.0 - uv.y * 90.0 + u_time * 0.008);
        float chaos3 = sin(uv.x * uv.y * 150.0 + u_time * 0.012);
        return baseColor + vec3(chaos1, chaos2, chaos3) * intensity * 0.3;
    }
}

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / min(u_resolution.x, u_resolution.y);

    // Enhanced 4D position with holographic depth
    float timeSpeed = u_time * 0.0001 * u_speed;
    vec4 pos = vec4(uv * 3.0, sin(timeSpeed * 3.0), cos(timeSpeed * 2.0));
    pos.xy += (u_mouse - 0.5) * u_mouseIntensity * 2.0;

    // Apply 6D rotations - 3D space rotations first, then 4D hyperspace
    pos = rotateXY(u_rot4dXY) * pos;
    pos = rotateXZ(u_rot4dXZ) * pos;
    pos = rotateYZ(u_rot4dYZ) * pos;
    pos = rotateXW(u_rot4dXW) * pos;
    pos = rotateYW(u_rot4dYW) * pos;
    pos = rotateZW(u_rot4dZW) * pos;

    // Calculate enhanced geometry value
    float value = geometryFunction(pos);

    // Enhanced chaos with holographic effects
    float noise = sin(pos.x * 7.0) * cos(pos.y * 11.0) * sin(pos.z * 13.0);
    value += noise * u_chaos;

    // Enhanced intensity calculation with holographic glow
    float geometryIntensity = 1.0 - clamp(abs(value * 0.8), 0.0, 1.0);
    geometryIntensity = pow(geometryIntensity, 1.5); // More dramatic falloff
    geometryIntensity += u_clickIntensity * 0.3;

    // Holographic shimmer effect
    float shimmer = sin(uv.x * 20.0 + timeSpeed * 5.0) * cos(uv.y * 15.0 + timeSpeed * 3.0) * 0.1;
    geometryIntensity += shimmer * geometryIntensity;

    // Apply user intensity control
    // Breath modulation (Exhale system)
    float breathMod = 1.0 + (u_breath * 0.4);
    float finalIntensity = geometryIntensity * u_intensity * breathMod;

    // LAYER-BY-LAYER COLOR SYSTEM with user hue/saturation/intensity controls
    // Determine canvas layer from role/variant (0=background, 1=shadow, 2=content, 3=highlight, 4=accent)
    // Values must match ROLE_INTENSITIES in JS: bg=0.4, shadow=0.6, content=1.0, highlight=1.3, accent=1.6
    int layerIndex = 0;
    if (abs(u_roleIntensity - 0.6) < 0.05) layerIndex = 1;       // shadow layer
    else if (abs(u_roleIntensity - 1.0) < 0.05) layerIndex = 2;  // content layer
    else if (abs(u_roleIntensity - 1.3) < 0.05) layerIndex = 3;  // highlight layer
    else if (abs(u_roleIntensity - 1.6) < 0.05) layerIndex = 4;  // accent layer

    // Get layer-specific base color using user hue/saturation controls
    float colorTime = timeSpeed * 2.0 + value * 3.0;
    vec3 layerColor = getLayerColorPalette(layerIndex, colorTime);

    // Apply geometry-based intensity modulation per layer
    vec3 extremeBaseColor;
    if (layerIndex == 0) {
        // Background: Subtle, fills empty space
        extremeBaseColor = layerColor * (0.3 + geometryIntensity * 0.4);
    }
    else if (layerIndex == 1) {
        // Shadow: Aggressive, high contrast where geometry is weak
        float shadowIntensity = pow(1.0 - geometryIntensity, 2.0); // Inverted for shadows
        extremeBaseColor = layerColor * (shadowIntensity * 0.8 + 0.1);
    }
    else if (layerIndex == 2) {
        // Content: Dominant, follows geometry strongly
        extremeBaseColor = layerColor * (geometryIntensity * 1.2 + 0.2);
    }
    else if (layerIndex == 3) {
        // Highlight: Electric, peaks only
        float peakIntensity = pow(geometryIntensity, 3.0); // Cubic for sharp peaks
        extremeBaseColor = layerColor * (peakIntensity * 1.5 + 0.1);
    }
    else {
        // Accent: Chaotic, random bursts
        float randomBurst = sin(value * 50.0 + timeSpeed * 10.0) * 0.5 + 0.5;
        extremeBaseColor = layerColor * (randomBurst * geometryIntensity * 2.0 + 0.05);
    }

    // Apply extreme RGB separation per layer
    vec3 extremeColor = extremeRGBSeparation(extremeBaseColor, uv, finalIntensity, layerIndex);

    // Layer-specific particle systems with extreme colors
    float extremeParticles = 0.0;
    if (layerIndex == 2 || layerIndex == 3) {
        // Only content and highlight layers get particles
        vec2 particleUV = uv * (layerIndex == 2 ? 12.0 : 20.0);
        vec2 particleID = floor(particleUV);
        vec2 particlePos = fract(particleUV) - 0.5;
        float particleDist = length(particlePos);

        float particleTime = timeSpeed * (layerIndex == 2 ? 3.0 : 8.0) + dot(particleID, vec2(127.1, 311.7));
        float particleAlpha = sin(particleTime) * 0.5 + 0.5;
        float particleSize = layerIndex == 2 ? 0.2 : 0.1;
        extremeParticles = (1.0 - smoothstep(0.05, particleSize, particleDist)) * particleAlpha * 0.4;
    }

    // Combine color with particles based on layer
    // Particle color derives from user hue for consistency
    vec3 particleColor = hsl2rgb(fract(u_hue + 0.15), u_saturation * 0.5, 0.85);
    vec3 finalColor;
    if (layerIndex == 0) {
        finalColor = extremeColor;
    }
    else if (layerIndex == 1) {
        finalColor = extremeColor * 0.8;
    }
    else if (layerIndex == 2) {
        finalColor = extremeColor + extremeParticles * particleColor;
    }
    else if (layerIndex == 3) {
        finalColor = extremeColor + extremeParticles * particleColor;
    }
    else {
        finalColor = extremeColor * (1.0 + sin(timeSpeed * 20.0) * 0.3);
    }

    // Layer-specific alpha intensity with extreme contrast
    float layerAlpha;
    if (layerIndex == 0) layerAlpha = 0.6;        // Background: Medium
    else if (layerIndex == 1) layerAlpha = 0.4;   // Shadow: Lower
    else if (layerIndex == 2) layerAlpha = 1.0;   // Content: Full intensity
    else if (layerIndex == 3) layerAlpha = 0.8;   // Highlight: High
    else layerAlpha = 0.3;                        // Accent: Subtle bursts

    gl_FragColor = vec4(finalColor, finalIntensity * layerAlpha);
}`;this.program=this.createProgram(e,t),this.uniforms={resolution:this.gl.getUniformLocation(this.program,"u_resolution"),time:this.gl.getUniformLocation(this.program,"u_time"),mouse:this.gl.getUniformLocation(this.program,"u_mouse"),geometry:this.gl.getUniformLocation(this.program,"u_geometry"),gridDensity:this.gl.getUniformLocation(this.program,"u_gridDensity"),morphFactor:this.gl.getUniformLocation(this.program,"u_morphFactor"),chaos:this.gl.getUniformLocation(this.program,"u_chaos"),speed:this.gl.getUniformLocation(this.program,"u_speed"),hue:this.gl.getUniformLocation(this.program,"u_hue"),intensity:this.gl.getUniformLocation(this.program,"u_intensity"),saturation:this.gl.getUniformLocation(this.program,"u_saturation"),dimension:this.gl.getUniformLocation(this.program,"u_dimension"),rot4dXY:this.gl.getUniformLocation(this.program,"u_rot4dXY"),rot4dXZ:this.gl.getUniformLocation(this.program,"u_rot4dXZ"),rot4dYZ:this.gl.getUniformLocation(this.program,"u_rot4dYZ"),rot4dXW:this.gl.getUniformLocation(this.program,"u_rot4dXW"),rot4dYW:this.gl.getUniformLocation(this.program,"u_rot4dYW"),rot4dZW:this.gl.getUniformLocation(this.program,"u_rot4dZW"),mouseIntensity:this.gl.getUniformLocation(this.program,"u_mouseIntensity"),clickIntensity:this.gl.getUniformLocation(this.program,"u_clickIntensity"),roleIntensity:this.gl.getUniformLocation(this.program,"u_roleIntensity"),breath:this.gl.getUniformLocation(this.program,"u_breath")}}createProgram(e,t){var o,a;const i=this.createShader(this.gl.VERTEX_SHADER,e),r=this.createShader(this.gl.FRAGMENT_SHADER,t);if(!i||!r)return null;const s=this.gl.createProgram();if(this.gl.attachShader(s,i),this.gl.attachShader(s,r),this.gl.linkProgram(s),this.gl.getProgramParameter(s,this.gl.LINK_STATUS))window.mobileDebug&&window.mobileDebug.log(`✅ ${(a=this.canvas)==null?void 0:a.id}: Shader program linked successfully`);else{const n=this.gl.getProgramInfoLog(s);return console.error("Program linking failed:",n),window.mobileDebug&&window.mobileDebug.log(`❌ ${(o=this.canvas)==null?void 0:o.id}: Shader program link failed - ${n}`),null}return s}createShader(e,t){var i,r,s,o,a,n;if(!this.gl)return console.error("❌ Cannot create shader: WebGL context is null"),window.mobileDebug&&window.mobileDebug.log(`❌ ${(i=this.canvas)==null?void 0:i.id}: Cannot create shader - WebGL context is null`),null;if(this.gl.isContextLost())return console.error("❌ Cannot create shader: WebGL context is lost"),window.mobileDebug&&window.mobileDebug.log(`❌ ${(r=this.canvas)==null?void 0:r.id}: Cannot create shader - WebGL context is lost`),null;try{const l=this.gl.createShader(e);if(!l)return console.error("❌ Failed to create shader object - WebGL context may be invalid"),window.mobileDebug&&window.mobileDebug.log(`❌ ${(s=this.canvas)==null?void 0:s.id}: Failed to create shader object`),null;if(this.gl.shaderSource(l,t),this.gl.compileShader(l),this.gl.getShaderParameter(l,this.gl.COMPILE_STATUS)){if(window.mobileDebug){const c=e===this.gl.VERTEX_SHADER?"vertex":"fragment";window.mobileDebug.log(`✅ ${(a=this.canvas)==null?void 0:a.id}: ${c} shader compiled successfully`)}}else{const c=this.gl.getShaderInfoLog(l),h=e===this.gl.VERTEX_SHADER?"vertex":"fragment";if(c?console.error(`❌ ${h} shader compilation failed:`,c):console.error(`❌ ${h} shader compilation failed: WebGL returned no error info (context may be invalid)`),console.error("Shader source:",t),window.mobileDebug){const d=c||"No error info (context may be invalid)";window.mobileDebug.log(`❌ ${(o=this.canvas)==null?void 0:o.id}: ${h} shader compile failed - ${d}`);const m=t.split(`
`).slice(0,5).join("\\n");window.mobileDebug.log(`🔍 ${h} shader source start: ${m}...`)}return this.gl.deleteShader(l),null}return l}catch(l){return console.error("❌ Exception during shader creation:",l),window.mobileDebug&&window.mobileDebug.log(`❌ ${(n=this.canvas)==null?void 0:n.id}: Exception during shader creation - ${l.message}`),null}}initBuffers(){const e=new Float32Array([-1,-1,1,-1,-1,1,1,1]);this.buffer=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.buffer),this.gl.bufferData(this.gl.ARRAY_BUFFER,e,this.gl.STATIC_DRAW);const t=this.gl.getAttribLocation(this.program,"a_position");this.gl.enableVertexAttribArray(t),this.gl.vertexAttribPointer(t,2,this.gl.FLOAT,!1,0,0)}resize(){var r,s;const e=Math.min(window.devicePixelRatio||1,2),t=this.canvas.clientWidth,i=this.canvas.clientHeight;window.mobileDebug&&(t===0||i===0)&&!this._zeroDimWarned&&(window.mobileDebug.log(`⚠️ ${(r=this.canvas)==null?void 0:r.id}: Canvas clientWidth=${t}, clientHeight=${i} - will be invisible`),this._zeroDimWarned=!0),(this.canvas.width!==t*e||this.canvas.height!==i*e)&&(this.canvas.width=t*e,this.canvas.height=i*e,this.gl.viewport(0,0,this.canvas.width,this.canvas.height),window.mobileDebug&&!this._finalSizeLogged&&(window.mobileDebug.log(`📐 ${(s=this.canvas)==null?void 0:s.id}: Final canvas buffer ${this.canvas.width}x${this.canvas.height} (DPR=${e})`),this._finalSizeLogged=!0))}showWebGLError(){if(!this.canvas)return;const e=this.canvas.getContext("2d");e&&(e.fillStyle="#000",e.fillRect(0,0,this.canvas.width,this.canvas.height),e.fillStyle="#64ff96",e.font="16px Orbitron, monospace",e.textAlign="center",e.fillText("WebGL Required",this.canvas.width/2,this.canvas.height/2),e.fillStyle="#888",e.font="12px Orbitron, monospace",e.fillText("Please enable WebGL in your browser",this.canvas.width/2,this.canvas.height/2+25))}updateParameters(e){if(!(!e||typeof e!="object"))for(const[t,i]of Object.entries(e))typeof i=="number"&&Number.isFinite(i)&&(this.params[t]=i)}updateInteraction(e,t,i){this.mouseX=e,this.mouseY=t,this.mouseIntensity=i}render(){var o;if(!this.program||this._contextLost)return;if(!this.gl||this.gl.isContextLost()){this._contextLost=!0;return}this.resize(),this.gl.useProgram(this.program),this.gl.clearColor(0,0,0,0),this.gl.clear(this.gl.COLOR_BUFFER_BIT),this._renderParamsLogged||(console.log(`[Mobile] ${(o=this.canvas)==null?void 0:o.id}: Render params - geometry=${this.params.geometry}, gridDensity=${this.params.gridDensity}, intensity=${this.params.intensity}`),this._renderParamsLogged=!0);const e=Date.now()-this.startTime;this.gl.uniform2f(this.uniforms.resolution,this.canvas.width,this.canvas.height),this.gl.uniform1f(this.uniforms.time,e),this.gl.uniform2f(this.uniforms.mouse,this.mouseX,this.mouseY),this.gl.uniform1f(this.uniforms.geometry,this.params.geometry);let t=this.params.gridDensity,i=this.params.morphFactor,r=this.params.hue,s=this.params.chaos;window.audioEnabled&&window.audioReactive&&(t+=window.audioReactive.bass*40,i+=window.audioReactive.mid*1.2,r+=window.audioReactive.high*120,s+=window.audioReactive.energy*.6,Date.now()%1e4<16&&console.log(`🌌 Quantum audio reactivity: Density+${(window.audioReactive.bass*40).toFixed(1)} Morph+${(window.audioReactive.mid*1.2).toFixed(2)} Hue+${(window.audioReactive.high*120).toFixed(1)} Chaos+${(window.audioReactive.energy*.6).toFixed(2)}`)),this.gl.uniform1f(this.uniforms.gridDensity,Math.min(100,t)),this.gl.uniform1f(this.uniforms.morphFactor,Math.min(2,i)),this.gl.uniform1f(this.uniforms.chaos,Math.min(1,s)),this.gl.uniform1f(this.uniforms.speed,this.params.speed),this.gl.uniform1f(this.uniforms.hue,r%360/360),this.gl.uniform1f(this.uniforms.intensity,this.params.intensity),this.gl.uniform1f(this.uniforms.saturation,this.params.saturation),this.gl.uniform1f(this.uniforms.dimension,this.params.dimension),this.gl.uniform1f(this.uniforms.rot4dXY,this.params.rot4dXY||0),this.gl.uniform1f(this.uniforms.rot4dXZ,this.params.rot4dXZ||0),this.gl.uniform1f(this.uniforms.rot4dYZ,this.params.rot4dYZ||0),this.gl.uniform1f(this.uniforms.rot4dXW,this.params.rot4dXW||0),this.gl.uniform1f(this.uniforms.rot4dYW,this.params.rot4dYW||0),this.gl.uniform1f(this.uniforms.rot4dZW,this.params.rot4dZW||0),this.gl.uniform1f(this.uniforms.mouseIntensity,this.mouseIntensity),this.gl.uniform1f(this.uniforms.clickIntensity,this.clickIntensity),this.gl.uniform1f(this.uniforms.roleIntensity,Y[this.role]||1),this.gl.uniform1f(this.uniforms.breath,this.params.breath||0),this.gl.drawArrays(this.gl.TRIANGLE_STRIP,0,4)}destroy(){this.canvas&&(this._onContextLost&&this.canvas.removeEventListener("webglcontextlost",this._onContextLost),this._onContextRestored&&this.canvas.removeEventListener("webglcontextrestored",this._onContextRestored)),this.gl&&!this.gl.isContextLost()&&(this.program&&this.gl.deleteProgram(this.program),this.buffer&&this.gl.deleteBuffer(this.buffer)),this.program=null,this.buffer=null,this.gl=null,this._contextLost=!0}}class O{constructor(){this.params={variation:0,rot4dXY:0,rot4dXZ:0,rot4dYZ:0,rot4dXW:0,rot4dYW:0,rot4dZW:0,dimension:3.5,gridDensity:15,morphFactor:1,chaos:.2,speed:1,hue:200,intensity:.5,saturation:.8,geometry:0},this.parameterDefs={variation:{min:0,max:99,step:1,type:"int"},rot4dXY:{min:-6.28,max:6.28,step:.01,type:"float"},rot4dXZ:{min:-6.28,max:6.28,step:.01,type:"float"},rot4dYZ:{min:-6.28,max:6.28,step:.01,type:"float"},rot4dXW:{min:-2,max:2,step:.01,type:"float"},rot4dYW:{min:-2,max:2,step:.01,type:"float"},rot4dZW:{min:-2,max:2,step:.01,type:"float"},dimension:{min:3,max:4.5,step:.01,type:"float"},gridDensity:{min:4,max:100,step:.1,type:"float"},morphFactor:{min:0,max:2,step:.01,type:"float"},chaos:{min:0,max:1,step:.01,type:"float"},speed:{min:.1,max:3,step:.01,type:"float"},hue:{min:0,max:360,step:1,type:"int"},intensity:{min:0,max:1,step:.01,type:"float"},saturation:{min:0,max:1,step:.01,type:"float"},geometry:{min:0,max:23,step:1,type:"int"}},this.defaults={...this.params}}getAllParameters(){return{...this.params}}setParameter(e,t){if(this.parameterDefs[e]){const i=this.parameterDefs[e];return t=Number(t),Number.isFinite(t)?(t=Math.max(i.min,Math.min(i.max,t)),i.type==="int"&&(t=Math.round(t)),this.params[e]=t,!0):(console.warn(`Parameter "${e}" received non-finite value, ignoring`),!1)}return console.warn(`Unknown parameter: ${e}`),!1}setParameters(e){for(const[t,i]of Object.entries(e))this.setParameter(t,i)}getParameter(e){return this.params[e]}setGeometry(e){this.setParameter("geometry",e)}updateFromControls(){["variationSlider","rot4dXW","rot4dYW","rot4dZW","dimension","gridDensity","morphFactor","chaos","speed","hue"].forEach(t=>{const i=document.getElementById(t);if(i){const r=parseFloat(i.value);if(!Number.isFinite(r))return;let s=t;t==="variationSlider"&&(s="variation"),this.setParameter(s,r)}})}updateDisplayValues(){this.updateSliderValue("variationSlider",this.params.variation),this.updateSliderValue("rot4dXW",this.params.rot4dXW),this.updateSliderValue("rot4dYW",this.params.rot4dYW),this.updateSliderValue("rot4dZW",this.params.rot4dZW),this.updateSliderValue("dimension",this.params.dimension),this.updateSliderValue("gridDensity",this.params.gridDensity),this.updateSliderValue("morphFactor",this.params.morphFactor),this.updateSliderValue("chaos",this.params.chaos),this.updateSliderValue("speed",this.params.speed),this.updateSliderValue("hue",this.params.hue),this.updateDisplayText("rot4dXWDisplay",this.params.rot4dXW.toFixed(2)),this.updateDisplayText("rot4dYWDisplay",this.params.rot4dYW.toFixed(2)),this.updateDisplayText("rot4dZWDisplay",this.params.rot4dZW.toFixed(2)),this.updateDisplayText("dimensionDisplay",this.params.dimension.toFixed(2)),this.updateDisplayText("gridDensityDisplay",this.params.gridDensity.toFixed(1)),this.updateDisplayText("morphFactorDisplay",this.params.morphFactor.toFixed(2)),this.updateDisplayText("chaosDisplay",this.params.chaos.toFixed(2)),this.updateDisplayText("speedDisplay",this.params.speed.toFixed(2)),this.updateDisplayText("hueDisplay",this.params.hue+"°"),this.updateVariationInfo(),this.updateGeometryButtons()}updateSliderValue(e,t){const i=document.getElementById(e);i&&(i.value=t)}updateDisplayText(e,t){const i=document.getElementById(e);i&&(i.textContent=t)}updateVariationInfo(){const e=document.getElementById("currentVariationDisplay");if(e){const t=["TETRAHEDRON LATTICE","HYPERCUBE LATTICE","SPHERE LATTICE","TORUS LATTICE","KLEIN BOTTLE LATTICE","FRACTAL LATTICE","WAVE LATTICE","CRYSTAL LATTICE"],i=Math.floor(this.params.variation/4),r=this.params.variation%4+1,s=t[i]||"CUSTOM VARIATION";e.textContent=`${this.params.variation+1} - ${s}`,this.params.variation<30&&(e.textContent+=` ${r}`)}}updateGeometryButtons(){document.querySelectorAll("[data-geometry]").forEach(e=>{e.classList.toggle("active",parseInt(e.dataset.geometry)===this.params.geometry)})}randomizeAll(){this.params.rot4dXY=Math.random()*12.56-6.28,this.params.rot4dXZ=Math.random()*12.56-6.28,this.params.rot4dYZ=Math.random()*12.56-6.28,this.params.rot4dXW=Math.random()*4-2,this.params.rot4dYW=Math.random()*4-2,this.params.rot4dZW=Math.random()*4-2,this.params.dimension=3+Math.random()*1.5,this.params.gridDensity=4+Math.random()*26,this.params.morphFactor=Math.random()*2,this.params.chaos=Math.random(),this.params.speed=.1+Math.random()*2.9,this.params.hue=Math.random()*360,this.params.geometry=Math.floor(Math.random()*24)}resetToDefaults(){this.params={...this.defaults}}loadConfiguration(e){if(!e||typeof e!="object")return!1;const t=e.parameters||e;if(typeof t!="object")return!1;for(const[i,r]of Object.entries(t))this.parameterDefs[i]&&this.setParameter(i,r);return!0}exportConfiguration(){return{type:"vib34d-integrated-config",version:"2.0.3",timestamp:new Date().toISOString(),name:`VIB34D Config ${new Date().toLocaleDateString()}`,parameters:{...this.params}}}generateVariationParameters(e){if(e<30){const t=Math.floor(e/4),i=e%4;return{geometry:t,gridDensity:8+i*4,morphFactor:.5+i*.3,chaos:i*.15,speed:.8+i*.2,hue:(t*45+i*15)%360,rot4dXW:(i-1.5)*.5,rot4dYW:t%2*.3,rot4dZW:(t+i)%3*.2,dimension:3.2+i*.2}}else return{...this.params}}applyVariation(e){const t=this.generateVariationParameters(e);this.setParameters(t),this.params.variation=e}getColorHSV(){return{h:this.params.hue,s:.8,v:.9}}getColorRGB(){const e=this.getColorHSV();return this.hsvToRgb(e.h,e.s,e.v)}hsvToRgb(e,t,i){e=e/60;const r=i*t,s=r*(1-Math.abs(e%2-1)),o=i-r;let a,n,l;return e<1?[a,n,l]=[r,s,0]:e<2?[a,n,l]=[s,r,0]:e<3?[a,n,l]=[0,r,s]:e<4?[a,n,l]=[0,s,r]:e<5?[a,n,l]=[s,0,r]:[a,n,l]=[r,0,s],{r:Math.round((a+o)*255),g:Math.round((n+o)*255),b:Math.round((l+o)*255)}}validateConfiguration(e){if(!e||typeof e!="object")return{valid:!1,error:"Configuration must be an object"};if(e.type!=="vib34d-integrated-config")return{valid:!1,error:"Invalid configuration type"};if(!e.parameters)return{valid:!1,error:"Missing parameters object"};for(const[t,i]of Object.entries(e.parameters))if(this.parameterDefs[t]){const r=this.parameterDefs[t];if(typeof i!="number"||i<r.min||i>r.max)return{valid:!1,error:`Invalid value for parameter ${t}: ${i}`}}return{valid:!0}}}class X{constructor(e,t,i,r=null){this.timestamp=performance.now(),this.type=e,this.action=t,this.bytes=i,this.label=r}}class V{constructor(e={}){this._resources=new Map,this._trackHistory=e.trackHistory||!1,this._historyLimit=e.historyLimit||1e3,this._detectLeaks=e.detectLeaks||!1,this._peakResources=0,this._peakBytes=0,this._peakByType=new Map,this._frameStartResources=0,this._frameStartBytes=0,this._frameDelta={resources:0,bytes:0},this._history=[],this._disposedTypes=new Set,this._stats={totalAllocations:0,totalDeallocations:0,currentResources:0,currentBytes:0}}setHistoryTracking(e){this._trackHistory=e,e||(this._history=[])}beginFrame(){this._frameStartResources=this._stats.currentResources,this._frameStartBytes=this._stats.currentBytes}endFrame(){return this._frameDelta={resources:this._stats.currentResources-this._frameStartResources,bytes:this._stats.currentBytes-this._frameStartBytes},this._frameDelta}register(e,t,i,r={}){if(!t)return null;const s=r.bytes??0,o=r.label??null,a={handle:t,disposer:i,bytes:s,label:o,createdAt:performance.now(),id:++this._stats.totalAllocations},n=this._resources.get(e)??new Set;return n.add(a),this._resources.set(e,n),this._stats.currentResources++,this._stats.currentBytes+=s,this._updatePeakStats(e),this._trackHistory&&this._recordEvent(e,"alloc",s,o),a}release(e,t){const i=this._resources.get(e);if(!i)return!1;for(const r of i)if(r.handle===t)return i.delete(r),this._stats.currentResources--,this._stats.currentBytes-=r.bytes,this._stats.totalDeallocations++,this._trackHistory&&this._recordEvent(e,"free",r.bytes,r.label),i.size===0&&this._resources.delete(e),!0;return!1}dispose(e,t){const i=this._resources.get(e);if(!i)return!1;for(const r of i)if(r.handle===t){if(r.disposer)try{r.disposer()}catch(s){console.warn(`RenderResourceRegistry: dispose error for ${e}:`,s)}return i.delete(r),this._stats.currentResources--,this._stats.currentBytes-=r.bytes,this._stats.totalDeallocations++,this._trackHistory&&this._recordEvent(e,"free",r.bytes,r.label),i.size===0&&this._resources.delete(e),!0}return!1}disposeType(e){const t=this._resources.get(e);if(!t)return 0;let i=0;for(const r of t){if(r.disposer)try{r.disposer()}catch(s){console.warn(`RenderResourceRegistry: dispose error for ${e}:`,s)}this._stats.currentResources--,this._stats.currentBytes-=r.bytes,this._stats.totalDeallocations++,this._trackHistory&&this._recordEvent(e,"free",r.bytes,r.label),i++}return this._resources.delete(e),this._disposedTypes.add(e),i}disposeAll(){for(const[e,t]of this._resources.entries()){for(const i of t){if(i.disposer)try{i.disposer()}catch(r){console.warn(`RenderResourceRegistry: dispose error for ${e}:`,r)}this._stats.totalDeallocations++,this._trackHistory&&this._recordEvent(e,"free",i.bytes,i.label)}this._disposedTypes.add(e)}this._stats.currentResources=0,this._stats.currentBytes=0,this._resources.clear()}_updatePeakStats(e){this._stats.currentResources>this._peakResources&&(this._peakResources=this._stats.currentResources),this._stats.currentBytes>this._peakBytes&&(this._peakBytes=this._stats.currentBytes);const t=this._resources.get(e);if(t){const i=t.size,r=this._peakByType.get(e)||0;i>r&&this._peakByType.set(e,i)}}_recordEvent(e,t,i,r){this._history.push(new X(e,t,i,r)),this._history.length>this._historyLimit&&(this._history=this._history.slice(-this._historyLimit))}getStats(){const e={totalResources:this._stats.currentResources,totalBytes:this._stats.currentBytes,byType:{}};for(const[t,i]of this._resources.entries()){let r=0;for(const s of i)r+=s.bytes;e.byType[t]={count:i.size,bytes:r}}return e}getDiagnostics(){return{...this.getStats(),peak:{resources:this._peakResources,bytes:this._peakBytes,byType:Object.fromEntries(this._peakByType)},frameDelta:{...this._frameDelta},lifetime:{totalAllocations:this._stats.totalAllocations,totalDeallocations:this._stats.totalDeallocations,netAllocations:this._stats.totalAllocations-this._stats.totalDeallocations},efficiency:{utilizationPercent:this._peakBytes>0?(this._stats.currentBytes/this._peakBytes*100).toFixed(1):100,averageBytesPerResource:this._stats.currentResources>0?Math.round(this._stats.currentBytes/this._stats.currentResources):0}}}getHistory(e={}){let t=this._history;return e.type&&(t=t.filter(i=>i.type===e.type)),e.action&&(t=t.filter(i=>i.action===e.action)),e.limit&&(t=t.slice(-e.limit)),t}getResourcesByType(e){const t=this._resources.get(e);return t?Array.from(t).map(i=>({label:i.label,bytes:i.bytes,createdAt:i.createdAt,age:performance.now()-i.createdAt,id:i.id})):[]}detectLeaks(e=6e4){const t=performance.now(),i=[];for(const[r,s]of this._resources.entries())for(const o of s){const a=t-o.createdAt;a>e&&i.push({type:r,label:o.label,bytes:o.bytes,age:Math.round(a),id:o.id})}return i}resetPeakStats(){this._peakResources=this._stats.currentResources,this._peakBytes=this._stats.currentBytes,this._peakByType.clear();for(const[e,t]of this._resources.entries())this._peakByType.set(e,t.size)}clearHistory(){this._history=[]}exportDiagnosticsJSON(){return JSON.stringify({diagnostics:this.getDiagnostics(),history:this._history.map(e=>({timestamp:e.timestamp,type:e.type,action:e.action,bytes:e.bytes,label:e.label}))},null,2)}getSummaryString(){const e=this.getDiagnostics(),t=[`Resources: ${e.totalResources} (peak: ${e.peak.resources})`,`Memory: ${this._formatBytes(e.totalBytes)} (peak: ${this._formatBytes(e.peak.bytes)})`,`Frame Δ: ${e.frameDelta.resources>=0?"+":""}${e.frameDelta.resources} resources`];for(const[i,r]of Object.entries(e.byType))t.push(`  ${i}: ${r.count} (${this._formatBytes(r.bytes)})`);return t.join(`
`)}_formatBytes(e){return e<1024?`${e}B`:e<1024*1024?`${(e/1024).toFixed(1)}KB`:`${(e/(1024*1024)).toFixed(2)}MB`}}const $=`
struct Uniforms {
    modelMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    projectionMatrix: mat4x4<f32>,
    time: f32,
    dimension: f32,
    _padding: vec2<f32>,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexInput {
    @location(0) position: vec4<f32>,
    @location(1) color: vec4<f32>,
};

struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,
    @location(1) worldPos: vec3<f32>,
};

@vertex
fn main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;

    // Apply 4D to 3D projection based on dimension parameter
    let w = input.position.w;
    let projectionFactor = 1.0 / (uniforms.dimension - w);
    let projected = vec4<f32>(
        input.position.x * projectionFactor,
        input.position.y * projectionFactor,
        input.position.z * projectionFactor,
        1.0
    );

    // Apply model-view-projection
    let worldPos = uniforms.modelMatrix * projected;
    let viewPos = uniforms.viewMatrix * worldPos;
    output.position = uniforms.projectionMatrix * viewPos;
    output.worldPos = worldPos.xyz;
    output.color = input.color;

    return output;
}
`,q=`
struct FragmentInput {
    @location(0) color: vec4<f32>,
    @location(1) worldPos: vec3<f32>,
};

@fragment
fn main(input: FragmentInput) -> @location(0) vec4<f32> {
    // Add subtle depth-based shading
    let depth = clamp(length(input.worldPos) * 0.2, 0.0, 1.0);
    let shaded = input.color.rgb * (1.0 - depth * 0.3);

    return vec4<f32>(shaded, input.color.a);
}
`,H=`
struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
};

@vertex
fn main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    var output: VertexOutput;

    // Generate fullscreen triangle (covers entire screen with 3 vertices)
    // Uses the oversized triangle technique - no vertex buffer needed
    let x = f32(i32(vertexIndex & 1u) * 4 - 1);
    let y = f32(i32(vertexIndex >> 1u) * 4 - 1);
    output.position = vec4<f32>(x, y, 0.0, 1.0);
    output.uv = vec2<f32>((x + 1.0) * 0.5, (1.0 - y) * 0.5);

    return output;
}
`,T={TIMESTAMP_QUERY:"timestamp-query",INDIRECT_FIRST_INSTANCE:"indirect-first-instance",SHADER_F16:"shader-f16",DEPTH_CLIP_CONTROL:"depth-clip-control",DEPTH32_STENCIL8:"depth32float-stencil8",TEXTURE_COMPRESSION_BC:"texture-compression-bc",RG11B10_UFLOAT_RENDERABLE:"rg11b10ufloat-renderable",BGRA8_UNORM_STORAGE:"bgra8unorm-storage"};class Z{constructor({canvas:e,device:t,context:i,format:r,adapter:s},o={}){this.canvas=e,this.device=t,this.context=i,this.format=r,this.adapter=s||null,this.debug=o.debug||!1,this.depthEnabled=o.depth!==!1,this._resources=o.resourceRegistry||new V,this._depthTexture=null,this._pipelines=new Map,this._shaderModules=new Map,this._uniformBuffer=null,this._uniformBindGroup=null,this._uniformBindGroupLayout=null,this._customUniformBuffers=new Map,this._textures=new Map,this._samplers=new Map,this._enabledFeatures=new Set(o.features||[]),this._stats={frames:0,commandEncoders:0,drawCalls:0,triangles:0,pipelineChanges:0},this._initUniformBuffer(),this._createDefaultPipeline(),this.resize(e.clientWidth||e.width,e.clientHeight||e.height)}hasFeature(e){return this._enabledFeatures.has(e)}getGPUInfo(){var e,t,i,r;return this.adapter?{vendor:((e=this.adapter.info)==null?void 0:e.vendor)||"unknown",architecture:((t=this.adapter.info)==null?void 0:t.architecture)||"unknown",device:((i=this.adapter.info)==null?void 0:i.device)||"unknown",description:((r=this.adapter.info)==null?void 0:r.description)||"unknown",features:Array.from(this._enabledFeatures)}:{vendor:"unknown",architecture:"unknown"}}_initUniformBuffer(){this._uniformBuffer=this.device.createBuffer({size:256,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this._resources.register("buffer",this._uniformBuffer),this._uniformBindGroupLayout=this.device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,buffer:{type:"uniform"}}]}),this._uniformBindGroup=this.device.createBindGroup({layout:this._uniformBindGroupLayout,entries:[{binding:0,resource:{buffer:this._uniformBuffer}}]})}createCustomUniformBuffer(e,t,i){const r=i??GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT,s=Math.ceil(t/256)*256,o=this.device.createBuffer({size:s,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});this._resources.register("buffer",o);const a=this.device.createBindGroupLayout({entries:[{binding:0,visibility:r,buffer:{type:"uniform"}}]}),n=this.device.createBindGroup({layout:a,entries:[{binding:0,resource:{buffer:o}}]}),l={buffer:o,bindGroup:n,layout:a};return this._customUniformBuffers.set(e,l),l}updateCustomUniforms(e,t){const i=this._customUniformBuffers.get(e);if(!i){this.debug&&console.warn(`Custom uniform buffer "${e}" not found`);return}this.device.queue.writeBuffer(i.buffer,0,t)}getCustomUniformBuffer(e){return this._customUniformBuffers.get(e)}updateUniforms(e){const t=new Float32Array(64),i=e.modelMatrix||[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];t.set(i,0);const r=e.viewMatrix||[1,0,0,0,0,1,0,0,0,0,1,0,0,0,-3,1];t.set(r,16);const s=e.projectionMatrix||this._createProjectionMatrix();t.set(s,32),t[48]=e.time||0,t[49]=e.dimension||3.5,this.device.queue.writeBuffer(this._uniformBuffer,0,t)}_createProjectionMatrix(){const e=Math.PI/4,t=this.canvas.width/this.canvas.height,i=.1,r=100,s=1/Math.tan(e/2),o=1/(i-r);return[s/t,0,0,0,0,s,0,0,0,0,(i+r)*o,-1,0,0,i*r*o*2,0]}compileShader(e,t){const i=this.device.createShaderModule({code:t,label:e});return this._shaderModules.set(e,i),i}_getOrCreateShaderModule(e,t){return this._shaderModules.has(e)?this._shaderModules.get(e):this.compileShader(e,t)}createFullscreenPipeline(e,t,i={}){const r=i.vertexCode||H,s=this._getOrCreateShaderModule(`${e}-vertex`,r),o=this._getOrCreateShaderModule(`${e}-fragment`,t),a=i.bindGroupLayouts||[this._uniformBindGroupLayout],n=this.device.createPipelineLayout({bindGroupLayouts:a}),l=i.blend||{color:{srcFactor:"src-alpha",dstFactor:"one-minus-src-alpha",operation:"add"},alpha:{srcFactor:"one",dstFactor:"one-minus-src-alpha",operation:"add"}},c=i.depth!==void 0?i.depth:!1,h=this.device.createRenderPipeline({layout:n,vertex:{module:s,entryPoint:"main"},fragment:{module:o,entryPoint:"main",targets:[{format:this.format,blend:l}]},primitive:{topology:"triangle-list"},depthStencil:c?{depthWriteEnabled:!0,depthCompare:"less",format:"depth24plus"}:void 0});return this._pipelines.set(e,h),h}createPipeline(e,t){const i=this._getOrCreateShaderModule(`${e}-vertex`,t.vertexCode),r=this._getOrCreateShaderModule(`${e}-fragment`,t.fragmentCode),s=t.bindGroupLayouts||[this._uniformBindGroupLayout],o=this.device.createPipelineLayout({bindGroupLayouts:s}),a=t.blend||{color:{srcFactor:"src-alpha",dstFactor:"one-minus-src-alpha",operation:"add"},alpha:{srcFactor:"one",dstFactor:"one-minus-src-alpha",operation:"add"}},n=this.device.createRenderPipeline({layout:o,vertex:{module:i,entryPoint:"main",buffers:t.vertexBuffers||[{arrayStride:32,attributes:[{shaderLocation:0,offset:0,format:"float32x4"},{shaderLocation:1,offset:16,format:"float32x4"}]}]},fragment:{module:r,entryPoint:"main",targets:[{format:this.format,blend:a}]},primitive:{topology:t.topology||"triangle-list",cullMode:t.cullMode||"none",frontFace:"ccw"},depthStencil:t.depth!==!1&&this.depthEnabled?{depthWriteEnabled:!0,depthCompare:"less",format:"depth24plus"}:void 0});return this._pipelines.set(e,n),n}getPipeline(e){return this._pipelines.get(e)}_createDefaultPipeline(){const e=this._getOrCreateShaderModule("default-vertex",$),t=this._getOrCreateShaderModule("default-fragment",q),i=this.device.createPipelineLayout({bindGroupLayouts:[this._uniformBindGroupLayout]}),r=this.device.createRenderPipeline({layout:i,vertex:{module:e,entryPoint:"main",buffers:[{arrayStride:32,attributes:[{shaderLocation:0,offset:0,format:"float32x4"},{shaderLocation:1,offset:16,format:"float32x4"}]}]},fragment:{module:t,entryPoint:"main",targets:[{format:this.format,blend:{color:{srcFactor:"src-alpha",dstFactor:"one-minus-src-alpha",operation:"add"},alpha:{srcFactor:"one",dstFactor:"one-minus-src-alpha",operation:"add"}}}]},primitive:{topology:"triangle-list",cullMode:"back",frontFace:"ccw"},depthStencil:this.depthEnabled?{depthWriteEnabled:!0,depthCompare:"less",format:"depth24plus"}:void 0});this._pipelines.set("default",r)}createTexture(e,t){const i=this.device.createTexture({size:{width:t.width,height:t.height},format:t.format||"rgba8unorm",usage:t.usage||GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT});return this._resources.register("texture",i),this._textures.set(e,i),i}createSampler(e,t={}){const i=this.device.createSampler({magFilter:t.magFilter||"linear",minFilter:t.minFilter||"linear",mipmapFilter:t.mipmapFilter||"linear",addressModeU:t.addressModeU||"clamp-to-edge",addressModeV:t.addressModeV||"clamp-to-edge"});return this._samplers.set(e,i),i}getTexture(e){return this._textures.get(e)}getSampler(e){return this._samplers.get(e)}resize(e,t){const i=Math.max(1,Math.floor(e)),r=Math.max(1,Math.floor(t));this.canvas.width=i,this.canvas.height=r,this.context.configure({device:this.device,format:this.format,alphaMode:"premultiplied"}),this.depthEnabled&&(this._destroyDepthTexture(),this._depthTexture=this.device.createTexture({size:{width:i,height:r,depthOrArrayLayers:1},format:"depth24plus",usage:GPUTextureUsage.RENDER_ATTACHMENT}),this._resources.register("texture",this._depthTexture))}createVertexBuffer(e){const t=this.device.createBuffer({size:e.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST,mappedAtCreation:!0});return new Float32Array(t.getMappedRange()).set(e),t.unmap(),this._resources.register("buffer",t),t}createIndexBuffer(e){const t=this.device.createBuffer({size:e.byteLength,usage:GPUBufferUsage.INDEX|GPUBufferUsage.COPY_DST,mappedAtCreation:!0});return e instanceof Uint16Array?new Uint16Array(t.getMappedRange()).set(e):new Uint32Array(t.getMappedRange()).set(e),t.unmap(),this._resources.register("buffer",t),t}renderFullscreenQuad(e){const{pipeline:t,bindGroups:i=[],clearColor:r=[0,0,0,1],clear:s=!0}=e,o=this._pipelines.get(t);if(!o){this.debug&&console.warn(`Pipeline "${t}" not found`);return}const a=this.device.createCommandEncoder();this._stats.commandEncoders+=1;const n=this.context.getCurrentTexture().createView(),l=a.beginRenderPass({colorAttachments:[{view:n,clearValue:{r:r[0],g:r[1],b:r[2],a:r[3]},loadOp:s?"clear":"load",storeOp:"store"}]});l.setPipeline(o),this._stats.pipelineChanges+=1;for(let c=0;c<i.length;c++)l.setBindGroup(c,i[c]);l.draw(3),this._stats.drawCalls+=1,l.end(),this.device.queue.submit([a.finish()]),this._stats.frames+=1}renderFrame(e={}){const t=e.clearColor||[0,0,0,1],i=this.device.createCommandEncoder();this._stats.commandEncoders+=1;const r=this.context.getCurrentTexture().createView(),s=this.depthEnabled&&this._depthTexture?{view:this._depthTexture.createView(),depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}:void 0;i.beginRenderPass({colorAttachments:[{view:r,clearValue:{r:t[0],g:t[1],b:t[2],a:t[3]},loadOp:"clear",storeOp:"store"}],depthStencilAttachment:s}).end(),this.device.queue.submit([i.finish()]),this._stats.frames+=1}renderGeometry(e){const{vertexBuffer:t,indexBuffer:i,vertexCount:r,indexCount:s,uniforms:o={},clearColor:a=[0,0,0,1]}=e;this.updateUniforms(o);const n=this.device.createCommandEncoder();this._stats.commandEncoders+=1;const l=this.context.getCurrentTexture().createView(),c=this.depthEnabled&&this._depthTexture?{view:this._depthTexture.createView(),depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store"}:void 0,h=n.beginRenderPass({colorAttachments:[{view:l,clearValue:{r:a[0],g:a[1],b:a[2],a:a[3]},loadOp:"clear",storeOp:"store"}],depthStencilAttachment:c}),d=this._pipelines.get("default");h.setPipeline(d),this._stats.pipelineChanges+=1,h.setBindGroup(0,this._uniformBindGroup),h.setVertexBuffer(0,t),i&&s?(h.setIndexBuffer(i,"uint16"),h.drawIndexed(s),this._stats.triangles+=s/3):(h.draw(r),this._stats.triangles+=r/3),this._stats.drawCalls+=1,h.end(),this.device.queue.submit([n.finish()]),this._stats.frames+=1}renderWithPipeline(e){const{pipeline:t,vertexBuffer:i,indexBuffer:r,vertexCount:s,indexCount:o,bindGroups:a=[],clearColor:n=[0,0,0,1],clear:l=!0}=e,c=this._pipelines.get(t);if(!c){this.debug&&console.warn(`Pipeline "${t}" not found`);return}const h=this.device.createCommandEncoder();this._stats.commandEncoders+=1;const d=this.context.getCurrentTexture().createView(),m=this.depthEnabled&&this._depthTexture?{view:this._depthTexture.createView(),depthClearValue:1,depthLoadOp:l?"clear":"load",depthStoreOp:"store"}:void 0,f=h.beginRenderPass({colorAttachments:[{view:d,clearValue:{r:n[0],g:n[1],b:n[2],a:n[3]},loadOp:l?"clear":"load",storeOp:"store"}],depthStencilAttachment:m});f.setPipeline(c),this._stats.pipelineChanges+=1;for(let p=0;p<a.length;p++)f.setBindGroup(p,a[p]);f.setVertexBuffer(0,i),r&&o?(f.setIndexBuffer(r,"uint16"),f.drawIndexed(o),this._stats.triangles+=o/3):(f.draw(s),this._stats.triangles+=s/3),this._stats.drawCalls+=1,f.end(),this.device.queue.submit([h.finish()]),this._stats.frames+=1}beginRenderPass(e={}){const t=e.clearColor||[0,0,0,1],i=this.device.createCommandEncoder(),r=this.context.getCurrentTexture().createView(),s=this.depthEnabled&&this._depthTexture?{view:this._depthTexture.createView(),depthClearValue:1,depthLoadOp:e.loadDepth?"load":"clear",depthStoreOp:"store"}:void 0,o=i.beginRenderPass({colorAttachments:[{view:r,clearValue:{r:t[0],g:t[1],b:t[2],a:t[3]},loadOp:e.loadColor?"load":"clear",storeOp:"store"}],depthStencilAttachment:s});return{encoder:i,pass:o}}endRenderPass(e,t){t.end(),this.device.queue.submit([e.finish()]),this._stats.frames+=1}getStats(){return{...this._stats,resources:this._resources.getStats()}}resetFrameStats(){this._stats.drawCalls=0,this._stats.triangles=0,this._stats.pipelineChanges=0}dispose(){this._destroyDepthTexture(),this._uniformBuffer&&(this._uniformBuffer.destroy(),this._uniformBuffer=null);for(const[,e]of this._customUniformBuffers)e.buffer.destroy();this._customUniformBuffers.clear();for(const[,e]of this._textures)e.destroy();this._textures.clear(),this._samplers.clear(),this._pipelines.clear(),this._shaderModules.clear(),this._resources.disposeAll()}_destroyDepthTexture(){this._depthTexture&&(this._resources.release("texture",this._depthTexture),this._depthTexture.destroy(),this._depthTexture=null)}}function U(){return typeof navigator<"u"&&!!navigator.gpu}async function N(u,e={}){var i,r;if(!u||!U())return e.debug&&console.warn("WebGPU not supported"),null;const t=u.getContext("webgpu");if(!t)return e.debug&&console.warn("Could not get WebGPU context"),null;try{const s=await navigator.gpu.requestAdapter({powerPreference:e.powerPreference||"high-performance"});if(!s)return e.debug&&console.warn("Could not get WebGPU adapter"),null;const o=new Set(s.features),a=[],n=e.requiredFeatures||[];for(const d of n)o.has(d)?a.push(d):e.debug&&console.warn(`WebGPU feature not available: ${d}`);const l=[T.TIMESTAMP_QUERY,T.INDIRECT_FIRST_INSTANCE];for(const d of l)o.has(d)&&!a.includes(d)&&a.push(d);const c=await s.requestDevice({requiredFeatures:a.length>0?a:void 0});c.lost.then(d=>{console.error("WebGPU device lost:",d.reason,d.message)}),e.debug&&(c.onuncapturederror=d=>{console.error("WebGPU error:",d.error.message)});const h=navigator.gpu.getPreferredCanvasFormat();return e.debug&&console.log("WebGPU initialized:",{vendor:(i=s.info)==null?void 0:i.vendor,architecture:(r=s.info)==null?void 0:r.architecture,format:h,features:a}),new Z({canvas:u,device:c,context:t,format:h,adapter:s},{...e,features:a})}catch(s){return e.debug&&console.error("WebGPU initialization failed:",s),null}}function j(u){var t,i,r,s,o;const e=new Float32Array(64);return e[0]=u.u_time||0,e[1]=0,e[2]=((t=u.u_resolution)==null?void 0:t[0])||800,e[3]=((i=u.u_resolution)==null?void 0:i[1])||600,e[4]=u.u_geometry||0,e[5]=u.u_rot4dXY||0,e[6]=u.u_rot4dXZ||0,e[7]=u.u_rot4dYZ||0,e[8]=u.u_rot4dXW||0,e[9]=u.u_rot4dYW||0,e[10]=u.u_rot4dZW||0,e[11]=u.u_dimension||3.5,e[12]=u.u_gridDensity||1.5,e[13]=u.u_morphFactor||1,e[14]=u.u_chaos||.2,e[15]=u.u_speed||1,e[16]=u.u_hue||200,e[17]=u.u_intensity||.7,e[18]=u.u_saturation||.8,e[19]=u.u_mouseIntensity||0,e[20]=u.u_clickIntensity||0,e[21]=u.u_bass||0,e[22]=u.u_mid||0,e[23]=u.u_high||0,e[32]=u.u_breath||0,e[24]=u.u_layerScale||1,e[25]=u.u_layerOpacity||1,e[26]=0,e[27]=((r=u.u_layerColor)==null?void 0:r[0])||1,e[28]=((s=u.u_layerColor)==null?void 0:s[1])||1,e[29]=((o=u.u_layerColor)==null?void 0:o[2])||1,e[30]=u.u_densityMult||1,e[31]=u.u_speedMult||1,e}class B{constructor(e,t,i){this.canvas=e,this.backendType=t,this.backend=i,this._glPrograms=new Map,this._glQuadBuffer=null,this._gpuPipelineBuffers=new Map,this._currentUniforms=new Map,this._initialized=!1}static async create(e,t={}){const i=t.preferWebGPU!==!1,r=t.debug||!1;if(i&&U())try{const a=await N(e,{debug:r,depth:!1});if(a){const n=new B(e,"webgpu",a);return n._initialized=!0,r&&console.log("UnifiedRenderBridge: using WebGPU backend"),n}}catch(a){r&&console.warn("WebGPU init failed, falling back to WebGL:",a)}const s=e.getContext("webgl2")||e.getContext("webgl");if(!s)throw new Error("Neither WebGPU nor WebGL is available");const o=new B(e,"webgl",s);return o._initWebGLQuadBuffer(),o._initialized=!0,r&&console.log("UnifiedRenderBridge: using WebGL backend"),o}getBackendType(){return this.backendType}get initialized(){return this._initialized}compileShader(e,t){return this.backendType==="webgl"?this._compileWebGLShader(e,t.glslVertex,t.glslFragment):t.wgslFragment?this._compileWebGPUShader(e,t.wgslFragment):(console.warn(`No WGSL fragment shader for "${e}", WebGPU rendering unavailable`),!1)}_compileWebGLShader(e,t,i){const r=this.backend,s=this._compileGLShader(r,r.VERTEX_SHADER,t),o=this._compileGLShader(r,r.FRAGMENT_SHADER,i);if(!s||!o)return!1;const a=r.createProgram();if(r.attachShader(a,s),r.attachShader(a,o),r.linkProgram(a),!r.getProgramParameter(a,r.LINK_STATUS))return console.error(`Shader link error [${e}]:`,r.getProgramInfoLog(a)),!1;const n=new Map,l=r.getProgramParameter(a,r.ACTIVE_UNIFORMS);for(let h=0;h<l;h++){const d=r.getActiveUniform(a,h);d&&n.set(d.name,r.getUniformLocation(a,d.name))}const c=this._glPrograms.get(e);return c&&r.deleteProgram(c.program),this._glPrograms.set(e,{program:a,uniformLocations:n}),r.deleteShader(s),r.deleteShader(o),!0}_compileGLShader(e,t,i){const r=e.createShader(t);return e.shaderSource(r,i),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(console.error("Shader compile error:",e.getShaderInfoLog(r)),e.deleteShader(r),null)}_compileWebGPUShader(e,t){const i=this.backend,r=`${e}-uniforms`;i.getCustomUniformBuffer(r)||i.createCustomUniformBuffer(r,256);const o=i.getCustomUniformBuffer(r);try{return i.createFullscreenPipeline(e,t,{bindGroupLayouts:[o.layout]}),this._gpuPipelineBuffers.set(e,r),!0}catch(a){return console.error(`WebGPU pipeline creation failed [${e}]:`,a),!1}}setUniforms(e){this._pendingUniforms=e}render(e,t={}){this.backendType==="webgl"?this._renderWebGL(e,t):this._renderWebGPU(e,t)}_renderWebGL(e,t){const i=this.backend,r=this._glPrograms.get(e);if(!r)return;const{program:s,uniformLocations:o}=r;if(i.useProgram(s),i.enable(i.BLEND),i.blendFunc(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA),t.clear!==!1){const l=t.clearColor||[0,0,0,1];i.clearColor(l[0],l[1],l[2],l[3]),i.clear(i.COLOR_BUFFER_BIT)}const a=this._pendingUniforms||{};for(const[l,c]of Object.entries(a)){const h=o.get(l);if(h!=null)if(Array.isArray(c))switch(c.length){case 2:i.uniform2fv(h,c);break;case 3:i.uniform3fv(h,c);break;case 4:i.uniform4fv(h,c);break;default:i.uniform1fv(h,c);break}else typeof c=="number"?i.uniform1f(h,c):typeof c=="boolean"&&i.uniform1i(h,c?1:0)}i.bindBuffer(i.ARRAY_BUFFER,this._glQuadBuffer);const n=i.getAttribLocation(s,"a_position");n>=0&&(i.enableVertexAttribArray(n),i.vertexAttribPointer(n,2,i.FLOAT,!1,0,0)),i.drawArrays(i.TRIANGLES,0,6)}_renderWebGPU(e,t){const i=this.backend,r=this._gpuPipelineBuffers.get(e);if(!r)return;const s=i.getCustomUniformBuffer(r);if(!s)return;const o=j(this._pendingUniforms||{});i.updateCustomUniforms(r,o),i.renderFullscreenQuad({pipeline:e,bindGroups:[s.bindGroup],clearColor:t.clearColor||[0,0,0,1],clear:t.clear!==!1})}resize(e,t,i=1){const r=Math.floor(e*i),s=Math.floor(t*i);this.canvas.width=r,this.canvas.height=s,this.backendType==="webgl"?this.backend.viewport(0,0,r,s):this.backend.resize(r,s)}getRawBackend(){return this.backend}dispose(){if(this.backendType==="webgl"){const e=this.backend;for(const[,i]of this._glPrograms)e.deleteProgram(i.program);this._glPrograms.clear(),this._glQuadBuffer&&(e.deleteBuffer(this._glQuadBuffer),this._glQuadBuffer=null);const t=e.getExtension("WEBGL_lose_context");t&&t.loseContext()}else this.backend.dispose();this._gpuPipelineBuffers.clear(),this._currentUniforms.clear(),this._pendingUniforms=null,this._initialized=!1}_initWebGLQuadBuffer(){const e=this.backend,t=new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]);this._glQuadBuffer=e.createBuffer(),e.bindBuffer(e.ARRAY_BUFFER,this._glQuadBuffer),e.bufferData(e.ARRAY_BUFFER,t,e.STATIC_DRAW)}}const w=["background","shadow","content","highlight","accent"];function Q(u={}){const{opacity:e=.3,densityScale:t=.5,speedScale:i=.3,intensityScale:r=.4}=u;return(s,o)=>({...s,layerOpacity:(s.layerOpacity||1)*e,density:(s.density||1)*t,speed:(s.speed||1)*i,intensity:(s.intensity||.5)*r})}function K(u={}){const{opacity:e=.5,invertRotation:t=!0,hueShift:i=180}=u;return(r,s)=>{const o={...r,layerOpacity:(r.layerOpacity||1)*e};return r.hue!==void 0&&(o.hue=(r.hue+i)%360),t&&(r.rot4dXW!==void 0&&(o.rot4dXW=-r.rot4dXW),r.rot4dYW!==void 0&&(o.rot4dYW=-r.rot4dYW),r.rot4dZW!==void 0&&(o.rot4dZW=-r.rot4dZW)),o}}function J(u={}){const{opacity:e=.4,densityPivot:t=1,chaosInvert:i=!0}=u;return(r,s)=>{const o={...r,layerOpacity:(r.layerOpacity||1)*e};return r.hue!==void 0&&(o.hue=(r.hue+180)%360),r.density!==void 0&&(o.density=Math.max(.1,t*2-r.density)),i&&r.chaos!==void 0&&(o.chaos=Math.max(0,1-r.chaos)),o}}function ee(u={}){const{opacity:e=.5,densityHarmonic:t=2,speedRatio:i=.5,hueAngle:r=137.508}=u;return(s,o)=>{const a={...s,layerOpacity:(s.layerOpacity||1)*e};return s.density!==void 0&&(a.density=s.density*t),s.speed!==void 0&&(a.speed=s.speed*i),s.hue!==void 0&&(a.hue=(s.hue+r)%360),a}}function te(u={}){const{opacity:e=.6,gain:t=2,decay:i=.95}=u;let r=null,s={};return(o,a)=>{const n={...o,layerOpacity:(o.layerOpacity||1)*e};if(r)for(const l of Object.keys(o)){if(typeof o[l]!="number")continue;const c=o[l]-(r[l]||0);s[l]=((s[l]||0)+c*t)*i,n[l]=o[l]+(s[l]||0)}return r={...o},n}}function ie(u={}){const{opacity:e=.5,lerpRate:t=.1}=u;let i=null;return(r,s)=>{i||(i={...r});for(const o of Object.keys(r)){if(typeof r[o]!="number")continue;const a=i[o]!==void 0?i[o]:r[o];i[o]=a+(r[o]-a)*t}return{...i,layerOpacity:(r.layerOpacity||1)*e}}}const C={echo:Q,mirror:K,complement:J,harmonic:ee,reactive:te,chase:ie},R={holographic:{keystone:"content",relationships:{background:{preset:"echo",config:{opacity:.2,densityScale:.4,speedScale:.2,intensityScale:.3}},shadow:{preset:"complement",config:{opacity:.4,densityPivot:1}},highlight:{preset:"harmonic",config:{opacity:.6,densityHarmonic:1.5,speedRatio:.8,hueAngle:60}},accent:{preset:"reactive",config:{opacity:.3,gain:2.5,decay:.92}}}},symmetry:{keystone:"content",relationships:{background:{preset:"echo",config:{opacity:.15,densityScale:.3,speedScale:.15}},shadow:{preset:"mirror",config:{opacity:.35}},highlight:{preset:"mirror",config:{opacity:.5,hueShift:120}},accent:{preset:"chase",config:{opacity:.4,lerpRate:.05}}}},chord:{keystone:"content",relationships:{background:{preset:"harmonic",config:{opacity:.2,densityHarmonic:.5,speedRatio:.25,hueAngle:0}},shadow:{preset:"harmonic",config:{opacity:.35,densityHarmonic:1.5,speedRatio:.667,hueAngle:137.508}},highlight:{preset:"harmonic",config:{opacity:.55,densityHarmonic:2,speedRatio:.5,hueAngle:275.016}},accent:{preset:"harmonic",config:{opacity:.3,densityHarmonic:3,speedRatio:.333,hueAngle:52.524}}}},storm:{keystone:"content",relationships:{background:{preset:"reactive",config:{opacity:.25,gain:1.5,decay:.98}},shadow:{preset:"reactive",config:{opacity:.4,gain:2,decay:.95}},highlight:{preset:"reactive",config:{opacity:.6,gain:3,decay:.9}},accent:{preset:"reactive",config:{opacity:.35,gain:4,decay:.88}}}},legacy:{keystone:"content",relationships:{background:{preset:"echo",config:{opacity:.2,densityScale:.4,speedScale:.2,intensityScale:.4}},shadow:{preset:"echo",config:{opacity:.4,densityScale:.8,speedScale:.3,intensityScale:.6}},highlight:{preset:"echo",config:{opacity:.6,densityScale:1.5,speedScale:.8,intensityScale:.8}},accent:{preset:"echo",config:{opacity:.3,densityScale:2.5,speedScale:.4,intensityScale:.5}}}}};class I{constructor(e={}){this._keystone=e.keystone||"content",this._relationships=new Map,this._layerShaders=new Map,this._relationshipConfigs=new Map,this._activeProfile=null,e.profile&&R[e.profile]&&this.loadProfile(e.profile)}setKeystone(e){if(!w.includes(e))throw new Error(`Invalid layer name: "${e}". Must be one of: ${w.join(", ")}`);this._keystone=e,this._activeProfile=null}get keystone(){return this._keystone}setRelationship(e,t){if(!w.includes(e))throw new Error(`Invalid layer name: "${e}". Must be one of: ${w.join(", ")}`);if(e===this._keystone)throw new Error(`Cannot set relationship on keystone layer "${e}". Change the keystone first.`);if(typeof t=="function")this._relationships.set(e,t),this._relationshipConfigs.set(e,null);else if(typeof t=="string"){const i=C[t];if(!i)throw new Error(`Unknown relationship preset: "${t}". Available: ${Object.keys(C).join(", ")}`);this._relationships.set(e,i()),this._relationshipConfigs.set(e,{preset:t,config:{}})}else if(t&&typeof t=="object"&&t.preset){const i=C[t.preset];if(!i)throw new Error(`Unknown relationship preset: "${t.preset}". Available: ${Object.keys(C).join(", ")}`);this._relationships.set(e,i(t.config||{})),this._relationshipConfigs.set(e,{preset:t.preset,config:t.config||{}})}else throw new Error("Relationship must be a preset name (string), a function, or { preset, config }.");this._activeProfile=null}setLayerShader(e,t){if(!w.includes(e))throw new Error(`Invalid layer name: "${e}".`);this._layerShaders.set(e,t)}getLayerShader(e){return this._layerShaders.get(e)||null}loadProfile(e){const t=R[e];if(!t)throw new Error(`Unknown profile: "${e}". Available: ${Object.keys(R).join(", ")}`);this._keystone=t.keystone||"content",this._relationships.clear(),this._relationshipConfigs.clear();for(const[i,r]of Object.entries(t.relationships)){const s=C[r.preset];s&&(this._relationships.set(i,s(r.config||{})),this._relationshipConfigs.set(i,{preset:r.preset,config:r.config||{}}))}this._activeProfile=e}get activeProfile(){return this._activeProfile}static get profileNames(){return Object.keys(R)}static get presetNames(){return Object.keys(C)}resolve(e,t,i){if(t===this._keystone)return{...e};const r=this._relationships.get(t);return r?r(e,i):{...e}}resolveAll(e,t){const i={};for(const r of w)i[r]=this.resolve(e,r,t);return i}exportConfig(){const e={};for(const[i,r]of this._relationshipConfigs)e[i]=r;const t={};for(const[i,r]of this._layerShaders)t[i]=r;return{keystone:this._keystone,profile:this._activeProfile,relationships:e,shaders:t}}importConfig(e){if(e){if(e.profile&&R[e.profile])this.loadProfile(e.profile);else if(this._keystone=e.keystone||"content",this._relationships.clear(),this._relationshipConfigs.clear(),e.relationships)for(const[t,i]of Object.entries(e.relationships))i&&i.preset&&this.setRelationship(t,i);if(this._layerShaders.clear(),e.shaders)for(const[t,i]of Object.entries(e.shaders))this._layerShaders.set(t,i)}}}const re={background:{layerScale:1,layerOpacity:.2,densityMult:.4,speedMult:.2},shadow:{layerScale:1,layerOpacity:.4,densityMult:.8,speedMult:.3},content:{layerScale:1,layerOpacity:.8,densityMult:1,speedMult:.5},highlight:{layerScale:1,layerOpacity:.6,densityMult:1.5,speedMult:.8},accent:{layerScale:1,layerOpacity:.3,densityMult:2.5,speedMult:.4}},se=w;class k{constructor(){this._bridges=new Map,this._canvases=new Map,this._sharedUniforms={},this._layerUniforms=new Map,this._layerConfig=new Map,this._initialized=!1,this._backendType=null,this._relationshipGraph=null,this._frameTime=0}async initialize(e){const{canvases:t,preferWebGPU:i=!0,debug:r=!1,layerConfig:s={},relationshipProfile:o,relationshipGraph:a}=e,n=Object.entries(t),l=await Promise.allSettled(n.map(async([c,h])=>{const d=await B.create(h,{preferWebGPU:i,debug:r});return{layerName:c,canvas:h,bridge:d}}));for(const c of l)if(c.status==="fulfilled"){const{layerName:h,canvas:d,bridge:m}=c.value;this._bridges.set(h,m),this._canvases.set(h,d);const f={...re[h]||{},...s[h]||{}};this._layerConfig.set(h,f),this._layerUniforms.set(h,{}),this._backendType||(this._backendType=m.getBackendType())}else console.error(`MultiCanvasBridge: Failed to init layer "${c.reason}"`);if(a instanceof I?this._relationshipGraph=a:o&&(this._relationshipGraph=new I({profile:o})),this._initialized=this._bridges.size>0,r){const c=this._relationshipGraph?` [graph: ${this._relationshipGraph.activeProfile||"custom"}]`:" [legacy mode]";console.log(`MultiCanvasBridge: ${this._bridges.size}/${n.length} layers initialized (${this._backendType})${c}`)}}get initialized(){return this._initialized}get backendType(){return this._backendType}get layerNames(){return se.filter(e=>this._bridges.has(e))}getBridge(e){return this._bridges.get(e)}get relationshipGraph(){return this._relationshipGraph||(this._relationshipGraph=new I({profile:"holographic"})),this._relationshipGraph}set relationshipGraph(e){this._relationshipGraph=e}loadRelationshipProfile(e){this.relationshipGraph.loadProfile(e)}setKeystone(e){this.relationshipGraph.setKeystone(e)}setLayerRelationship(e,t){this.relationshipGraph.setRelationship(e,t)}compileShaderAll(e,t){const i=[],r=[];for(const[s,o]of this._bridges)o.compileShader(e,t)?i.push(s):r.push(s);return{succeeded:i,failed:r}}compileShader(e,t,i){const r=this._bridges.get(e);return r?r.compileShader(t,i):!1}setSharedUniforms(e){this._sharedUniforms=e}setKeystoneUniforms(e){this._sharedUniforms=e}setLayerUniforms(e,t){const i=this._layerUniforms.get(e)||{};this._layerUniforms.set(e,{...i,...t})}setLayerConfig(e,t){const i=this._layerConfig.get(e)||{};this._layerConfig.set(e,{...i,...t})}_buildLayerUniforms(e){const t=this._layerUniforms.get(e)||{};if(this._relationshipGraph){const r=this._relationshipGraph.resolve(this._sharedUniforms,e,this._frameTime);return{...r,u_layerOpacity:r.layerOpacity||r.u_layerOpacity||1,...t}}const i=this._layerConfig.get(e)||{};return{...this._sharedUniforms,u_layerScale:i.layerScale||1,u_layerOpacity:i.layerOpacity||1,u_densityMult:i.densityMult||1,u_speedMult:i.speedMult||1,...t}}renderAll(e,t={}){t.time!==void 0?this._frameTime=t.time:this._frameTime+=16;for(const i of this.layerNames){const r=(this._relationshipGraph?this._relationshipGraph.getLayerShader(i):null)||e;this.renderLayer(i,r,t)}}renderLayer(e,t,i={}){const r=this._bridges.get(e);if(!r)return;const s=this._buildLayerUniforms(e);r.setUniforms(s),r.render(t,{clearColor:i.clearColor||[0,0,0,0],clear:!0})}resizeAll(e,t,i=1){for(const[,r]of this._bridges)r.resize(e,t,i)}get layerCount(){return this._bridges.size}dispose(){for(const[,e]of this._bridges)e.dispose();this._bridges.clear(),this._canvases.clear(),this._layerUniforms.clear(),this._layerConfig.clear(),this._sharedUniforms={},this._initialized=!1,this._backendType=null,this._relationshipGraph=null,this._frameTime=0}}const oe="src/shaders",W=`
attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`,ae=`
struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv: vec2<f32>,
};

@vertex
fn main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    var output: VertexOutput;
    let x = f32(i32(vertexIndex & 1u) * 4 - 1);
    let y = f32(i32(vertexIndex >> 1u) * 4 - 1);
    output.position = vec4<f32>(x, y, 0.0, 1.0);
    output.uv = vec2<f32>((x + 1.0) * 0.5, (1.0 - y) * 0.5);
    return output;
}
`;class ne{constructor(e={}){this.basePath=e.basePath||oe,this._cache=new Map,this._pending=new Map,this._failed=new Set}async load(e){const t=e;if(this._cache.has(t))return this._cache.get(t);if(this._pending.has(t))return this._pending.get(t);if(this._failed.has(t))return null;const i=`${this.basePath}/${e}`,r=this._fetchShader(i,t);this._pending.set(t,r);const s=await r;return this._pending.delete(t),s}async loadShaderPair(e,t,i={}){const r=i.vertexGlslPath||"common/fullscreen.vert.glsl",s=i.vertexWgslPath||"common/fullscreen.vert.wgsl",o=`${t}.glsl`,a=`${t}.wgsl`,[n,l,c,h]=await Promise.all([this.load(r),this.load(s),this.load(o),this.load(a)]);return{glslVertex:n||W,glslFragment:c,wgslVertex:l||ae,wgslFragment:h}}async loadCommonLibrary(){const e=["uniforms","rotation4d","geometry24"],t={};return await Promise.all(e.map(async i=>{const[r,s]=await Promise.all([this.load(`common/${i}.glsl`),this.load(`common/${i}.wgsl`)]);t[i]={glsl:r,wgsl:s}})),t}async preloadSystem(e){const i={quantum:"quantum/quantum.frag",faceted:"faceted/faceted.frag",holographic:"holographic/holographic.frag"}[e];return i?this.loadShaderPair(e,i):(console.warn(`ShaderLoader: Unknown system "${e}"`),{glslVertex:W,glslFragment:null,wgslFragment:null})}async preloadAll(){const e=["quantum","faceted","holographic"],t=new Map;return await Promise.all(e.map(async i=>{t.set(i,await this.preloadSystem(i))})),t}resolveIncludes(e){if(!e)return e;const t=/(?:^|\n)\s*(?:#include|\/\/\s*@include)\s+"([^"]+)"\s*(?:\n|$)/g;return e.replace(t,(i,r)=>{const s=this._cache.get(r);return s?`
// --- included from `+r+` ---
`+s+`
// --- end `+r+` ---
`:(console.warn(`ShaderLoader: Include not found in cache: "${r}" — load it first via loadCommonLibrary()`),i)})}async loadAndResolve(e){const t=await this.load(e);return t?this.resolveIncludes(t):null}clearCache(){this._cache.clear(),this._failed.clear()}getStats(){return{cached:this._cache.size,failed:this._failed.size,pending:this._pending.size}}async _fetchShader(e,t){try{const i=await fetch(e);if(!i.ok)return console.warn(`ShaderLoader: Failed to fetch ${e} (${i.status})`),this._failed.add(t),null;const r=await i.text();return this._cache.set(t,r),r}catch(i){return console.warn(`ShaderLoader: Network error fetching ${e}:`,i.message),this._failed.add(t),null}}}const z=new ne;class ce{constructor(e={}){console.log("🔮 Initializing VIB34D Quantum Engine..."),this.visualizers=[],this.parameters=new O,this.isActive=!1,this.autoStart=e.autoStart??!0,this.canvasOverride=e.canvas||null,this.canvasSet=e.canvases||null,this._multiCanvasBridge=null,this._renderMode="direct",this._bridgeTime=0,this.useBuiltInReactivity=!window.reactivityManager,this.lastMousePosition={x:.5,y:.5},this.mouseVelocity={x:0,y:0},this.velocityHistory=[],this.maxVelocityHistory=10,this.baseHue=280,this.baseMorphFactor=1,this.parameters.setParameter("hue",this.baseHue),this.parameters.setParameter("intensity",.7),this.parameters.setParameter("saturation",.9),this.parameters.setParameter("gridDensity",20),this.parameters.setParameter("morphFactor",this.baseMorphFactor),this.init()}init(){this.createVisualizers(),this.setupAudioReactivity(),this.setupGestureVelocityReactivity(),this.autoStart&&this.startRenderLoop(),console.log("✨ Quantum Engine initialized with audio + gesture velocity reactivity")}createVisualizers(){if(this.canvasOverride){try{const t=new A(this.canvasOverride,"content",1,0);t.gl?(this.visualizers.push(t),console.log("🌌 Created quantum single-canvas visualizer (content layer)")):console.warn("⚠️ No WebGL context for quantum canvasOverride")}catch(t){console.warn("Failed to create quantum single-canvas visualizer:",t)}return}if(this.canvasSet){[{key:"background",role:"background",reactivity:.4},{key:"shadow",role:"shadow",reactivity:.6},{key:"content",role:"content",reactivity:1},{key:"highlight",role:"highlight",reactivity:1.3},{key:"accent",role:"accent",reactivity:1.6}].forEach(i=>{const r=this.canvasSet[i.key];if(r)try{const s=new A(r,i.role,i.reactivity,0);s.gl&&(this.visualizers.push(s),console.log(`🌌 Created quantum layer (canvasSet): ${i.role}`))}catch(s){console.warn(`Failed to create quantum layer ${i.role}:`,s)}}),console.log(`✅ Created ${this.visualizers.length} quantum visualizers via canvasSet`);return}[{id:"quantum-background-canvas",role:"background",reactivity:.4},{id:"quantum-shadow-canvas",role:"shadow",reactivity:.6},{id:"quantum-content-canvas",role:"content",reactivity:1},{id:"quantum-highlight-canvas",role:"highlight",reactivity:1.3},{id:"quantum-accent-canvas",role:"accent",reactivity:1.6}].forEach(t=>{try{if(!document.getElementById(t.id)){console.warn(`⚠️ Canvas ${t.id} not found in DOM - skipping`);return}const r=new A(t.id,t.role,t.reactivity,0);r.gl?(this.visualizers.push(r),console.log(`🌌 Created quantum layer: ${t.role}`)):console.warn(`⚠️ No WebGL context for quantum layer ${t.id}`)}catch(i){console.warn(`Failed to create quantum layer ${t.id}:`,i)}}),console.log(`✅ Created ${this.visualizers.length} quantum visualizers with enhanced effects`)}async initWithBridge(e={}){try{const t=await this.createMultiCanvasBridge(e);return t&&t.initialized?(this._renderMode="bridge",this._bridgeTime=0,console.log(`Quantum System initialized via ${t.backendType} bridge (${t.layerCount} layers)`),!0):(console.warn("Quantum bridge init returned no bridge, staying in direct mode"),!1)}catch(t){return console.error("Quantum bridge init failed, staying in direct mode:",t),this._renderMode="direct",!1}}async createMultiCanvasBridge(e={}){const t={},i={background:"quantum-background-canvas",shadow:"quantum-shadow-canvas",content:"quantum-content-canvas",highlight:"quantum-highlight-canvas",accent:"quantum-accent-canvas"};for(const[o,a]of Object.entries(i)){const n=document.getElementById(a);n&&(t[o]=n)}if(Object.keys(t).length===0)return null;const r=new k;await r.initialize({canvases:t,preferWebGPU:e.preferWebGPU!==!1});let s={glslVertex:`attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`,glslFragment:null,wgslFragment:null};try{const o=await z.loadShaderPair("quantum","quantum/quantum.frag");o.glslVertex&&(s.glslVertex=o.glslVertex),o.glslFragment&&(s.glslFragment=o.glslFragment),o.wgslFragment&&(s.wgslFragment=o.wgslFragment)}catch{console.warn("Quantum external shader load failed, using inline fallback")}if(s.glslFragment||s.wgslFragment){const o=r.compileShaderAll("quantum",s);o.failed.length>0&&console.warn(`Quantum shader compilation failed on layers: ${o.failed.join(", ")}`)}return this._multiCanvasBridge=r,r}_buildSharedUniforms(){const e=this.parameters.getAllParameters(),t=window.audioReactive||{bass:0,mid:0,high:0};return{u_time:this._bridgeTime,u_resolution:null,u_geometry:e.geometry||0,u_rot4dXY:e.rot4dXY||0,u_rot4dXZ:e.rot4dXZ||0,u_rot4dYZ:e.rot4dYZ||0,u_rot4dXW:e.rot4dXW||0,u_rot4dYW:e.rot4dYW||0,u_rot4dZW:e.rot4dZW||0,u_dimension:e.dimension||3.5,u_gridDensity:e.gridDensity||20,u_morphFactor:e.morphFactor||1,u_chaos:e.chaos||.2,u_speed:e.speed||1,u_hue:e.hue||280,u_intensity:e.intensity||.7,u_saturation:e.saturation||.9,u_mouseIntensity:0,u_clickIntensity:this.clickFlashIntensity||0,u_bass:t.bass||0,u_mid:t.mid||0,u_high:t.high||0}}_renderBridgeFrame(){if(!this._multiCanvasBridge||!this._multiCanvasBridge.initialized)return;this._bridgeTime+=16;const e=this._buildSharedUniforms();for(const t of this._multiCanvasBridge.layerNames){const i=this._multiCanvasBridge.getBridge(t);i&&i.canvas&&this._multiCanvasBridge.setLayerUniforms(t,{u_resolution:[i.canvas.width,i.canvas.height]})}this._multiCanvasBridge.setSharedUniforms(e),this._multiCanvasBridge.renderAll("quantum",{clearColor:[0,0,0,0]})}setActive(e){if(this.isActive=e,e){if(!this.canvasOverride){const t=document.getElementById("quantumLayers");t&&(t.style.display="block")}window.audioEnabled&&!this.audioEnabled&&this.enableAudio(),console.log("🔮 Quantum System ACTIVATED - Audio frequency reactivity mode")}else{if(!this.canvasOverride){const t=document.getElementById("quantumLayers");t&&(t.style.display="none")}console.log("🔮 Quantum System DEACTIVATED")}}toggleAudio(e){e&&this.isActive&&!this.audioEnabled?this.enableAudio():!e&&this.audioEnabled&&(this.audioEnabled=!1,this._audioStream&&(this._audioStream.getTracks().forEach(t=>t.stop()),this._audioStream=null),this.audioContext&&(this.audioContext.close().catch(()=>{}),this.audioContext=null),this.analyser=null,this.frequencyData=null,console.log("Quantum audio reactivity disabled"))}setupAudioReactivity(){console.log("🌌 Setting up Quantum audio frequency reactivity")}setupGestureVelocityReactivity(){if(!this.useBuiltInReactivity){console.log("🌌 Quantum built-in reactivity DISABLED - ReactivityManager active");return}if(this.canvasOverride){console.log("🌌 Quantum gesture reactivity skipped (single-canvas override mode)");return}console.log("🌌 Setting up Quantum: velocity + click + scroll + multi-parameter reactivity"),this.clickFlashIntensity=0,this.scrollMorph=1,this.velocitySmoothing=.8;const e=[];this.canvasSet?Object.values(this.canvasSet).forEach(t=>{t&&e.push(t)}):["quantum-background-canvas","quantum-shadow-canvas","quantum-content-canvas","quantum-highlight-canvas","quantum-accent-canvas"].forEach(t=>{const i=document.getElementById(t);i&&e.push(i)}),e.forEach(t=>{t.addEventListener("mousemove",i=>{if(!this.isActive)return;const r=t.getBoundingClientRect(),s=(i.clientX-r.left)/r.width,o=(i.clientY-r.top)/r.height;this.updateEnhancedQuantumParameters(s,o)}),t.addEventListener("touchmove",i=>{if(this.isActive&&i.touches.length>0){const r=i.touches[0],s=t.getBoundingClientRect(),o=(r.clientX-s.left)/s.width,a=(r.clientY-s.top)/s.height;this.updateEnhancedQuantumParameters(o,a)}},{passive:!0}),t.addEventListener("click",i=>{this.isActive&&this.triggerQuantumClick()}),t.addEventListener("touchend",i=>{this.isActive&&this.triggerQuantumClick()}),t.addEventListener("wheel",i=>{this.isActive&&this.updateQuantumScroll(i.deltaY)},{passive:!0})}),this.startQuantumEffectLoops()}updateEnhancedQuantumParameters(e,t){const i=e-this.lastMousePosition.x,r=t-this.lastMousePosition.y,s=Math.sqrt(i*i+r*r);this.velocityHistory.push(s),this.velocityHistory.length>5&&this.velocityHistory.shift();const o=this.velocityHistory.reduce((b,E)=>b+E,0)/this.velocityHistory.length,a=(e-.5)*Math.PI*2,n=a*.5,l=a*.3,c=a*.2,h=10+t*90,f=Math.sqrt(Math.pow(e-.5,2)+Math.pow(t-.5,2)),p=Math.min(1,f*Math.sqrt(2)),_=e<.5,g=t<.5;let y;_&&g?y=240:!_&&g?y=300:_&&!g?y=180:y=320;const L=p*60,x=(y+L)%360,P=Math.min(1,o*30),S=.5+Math.min(2.5,o*15),D=.3+p*.7;window.updateParameter&&(window.updateParameter("rot4dXW",n.toFixed(3)),window.updateParameter("rot4dYW",l.toFixed(3)),window.updateParameter("rot4dZW",c.toFixed(3)),window.updateParameter("chaos",P.toFixed(2)),window.updateParameter("speed",S.toFixed(2)),window.updateParameter("gridDensity",Math.round(h)),window.updateParameter("intensity",D.toFixed(2)),window.updateParameter("hue",Math.round(x))),this.lastMousePosition.x=e,this.lastMousePosition.y=t,(!this._lastLogTime||performance.now()-this._lastLogTime>2e3)&&(this._lastLogTime=performance.now(),console.log(`Quantum: Rot=${a.toFixed(2)}, Density=${Math.round(h)}, Hue=${Math.round(x)}`))}triggerQuantumClick(){this.clickFlashIntensity=1,this.quantumChaosBlast=.7,this.quantumSpeedWave=2,this.quantumHueShift=60}updateQuantumScroll(e){const i=e>0?1:-1;this.scrollMorph+=i*.02,this.scrollMorph=Math.max(.2,Math.min(2,this.scrollMorph)),window.updateParameter&&window.updateParameter("morphFactor",this.scrollMorph.toFixed(2))}startQuantumEffectLoops(){this._effectsLoopActive=!0;const e=()=>{if(this._effectsLoopActive){if(this.clickFlashIntensity>.01){const t=.9+this.clickFlashIntensity*.1,i=this.scrollMorph+this.clickFlashIntensity*.5;window.updateParameter&&(window.updateParameter("saturation",t.toFixed(2)),window.updateParameter("morphFactor",i.toFixed(2))),this.clickFlashIntensity*=.91}if(this.quantumChaosBlast>.01){const i=.3+this.quantumChaosBlast;window.updateParameter&&window.updateParameter("chaos",Math.min(1,i).toFixed(2)),this.quantumChaosBlast*=.88}if(this.quantumSpeedWave>.01){const i=1+this.quantumSpeedWave;window.updateParameter&&window.updateParameter("speed",Math.min(3,i).toFixed(2)),this.quantumSpeedWave*=.89}if(this.quantumHueShift>1){const i=(280+this.quantumHueShift)%360;window.updateParameter&&window.updateParameter("hue",Math.round(i)),this.quantumHueShift*=.9}this._effectsRafId=requestAnimationFrame(e)}};this._effectsRafId=requestAnimationFrame(e)}async enableAudio(){if(!this.audioEnabled)try{const e=await navigator.mediaDevices.getUserMedia({audio:!0});this.audioContext=new(window.AudioContext||window.webkitAudioContext),this.analyser=this.audioContext.createAnalyser(),this.analyser.fftSize=256,this.analyser.smoothingTimeConstant=.8,this.frequencyData=new Uint8Array(this.analyser.frequencyBinCount),this._audioStream=e,this.audioContext.createMediaStreamSource(e).connect(this.analyser),this.audioEnabled=!0,console.log("Quantum audio reactivity enabled")}catch(e){console.error("❌ Failed to enable Quantum audio:",e),this.audioEnabled=!1}}updateParameter(e,t){this.parameters.setParameter(e,t),this.visualizers.forEach(i=>{if(i.updateParameters){const r={};r[e]=t,i.updateParameters(r)}else i.params&&(i.params[e]=t,i.render&&i.render())}),console.log(`🔮 Updated quantum ${e}: ${t}`)}updateParameters(e){Object.keys(e).forEach(t=>{this.updateParameter(t,e[t])})}updateInteraction(e,t,i){this.visualizers.forEach(r=>{r.updateInteraction&&r.updateInteraction(e,t,i)})}getParameters(){return this.parameters.getAllParameters()}setParameters(e){Object.keys(e).forEach(t=>{this.parameters.setParameter(t,e[t])}),this.updateParameters(e)}startRenderLoop(){var t;window.mobileDebug&&window.mobileDebug.log(`🎬 Quantum Engine: Starting render loop with ${(t=this.visualizers)==null?void 0:t.length} visualizers, isActive=${this.isActive}`),this._renderLoopActive=!0;const e=()=>{this._renderLoopActive&&(this.renderFrame(),this._renderRafId=requestAnimationFrame(e))};this._renderRafId=requestAnimationFrame(e),console.log("🎬 Quantum render loop started"),window.mobileDebug&&window.mobileDebug.log("✅ Quantum Engine: Render loop started, will render when isActive=true")}renderFrame(){this.isActive?(this._renderMode==="bridge"?this._renderBridgeFrame():this._renderDirectFrame(),window.mobileDebug&&!this._renderActivityLogged&&(window.mobileDebug.log(`🎬 Quantum Engine: Actively rendering (${this._renderMode} mode)`),this._renderActivityLogged=!0)):window.mobileDebug&&!this._inactiveWarningLogged&&(window.mobileDebug.log("⚠️ Quantum Engine: Not rendering because isActive=false"),this._inactiveWarningLogged=!0)}_renderDirectFrame(){const e=this.parameters.getAllParameters();this.visualizers.forEach(t=>{t.updateParameters&&t.render&&(t.updateParameters(e),t.render())})}updateClick(e){this.visualizers.forEach(t=>{t.triggerClick&&t.triggerClick(.5,.5,e)})}updateScroll(e){this.visualizers.forEach(t=>{t.updateScroll&&t.updateScroll(e)})}destroy(){this.isActive=!1,this._renderLoopActive=!1,this._renderRafId&&(cancelAnimationFrame(this._renderRafId),this._renderRafId=null),this._effectsLoopActive=!1,this._effectsRafId&&(cancelAnimationFrame(this._effectsRafId),this._effectsRafId=null),window.universalReactivity&&window.universalReactivity.disconnectSystem("quantum"),this._audioStream&&(this._audioStream.getTracks().forEach(e=>e.stop()),this._audioStream=null),this.audioContext&&(this.audioContext.close().catch(()=>{}),this.audioContext=null),this.audioEnabled=!1,this.analyser=null,this.frequencyData=null,this._multiCanvasBridge&&(this._multiCanvasBridge.dispose(),this._multiCanvasBridge=null),this._renderMode="direct",this.visualizers.forEach(e=>{e.destroy&&e.destroy()}),this.visualizers=[],console.log("Quantum Engine destroyed")}initWithCanvas(e={}){const t=e.canvas||(e.canvasId?document.getElementById(e.canvasId):null);return t&&(this.canvasOverride=t),this.visualizers.forEach(i=>i.destroy&&i.destroy()),this.visualizers=[],this.createVisualizers(),this.autoStart?(this.startRenderLoop(),this.visualizers.length>0):this.visualizers.length>0}resize(e,t,i=1){this._renderMode==="bridge"&&this._multiCanvasBridge?this._multiCanvasBridge.resizeAll(e,t,i):this.visualizers.forEach(r=>{r.canvas&&r.gl&&(r.canvas.width=e*i,r.canvas.height=t*i,r.canvas.style.width=`${e}px`,r.canvas.style.height=`${t}px`,r.gl.viewport(0,0,r.canvas.width,r.canvas.height))}),console.log(`🔮 Quantum resized to ${e}x${t} @${i}x`)}render(e={}){e.params&&this.updateParameters(e.params),this.renderFrame()}getBackendType(){return this._renderMode==="bridge"&&this._multiCanvasBridge?this._multiCanvasBridge.backendType||"bridge":"direct-webgl"}dispose(){this.destroy()}}class F{constructor(e,t="content",i=1,r=0){this.canvas=e instanceof HTMLCanvasElement?e:document.getElementById(e),this.role=t,this.reactivity=i,this.variant=r,this.contextOptions={alpha:!0,depth:!0,stencil:!1,antialias:!1,premultipliedAlpha:!0,preserveDrawingBuffer:!1,powerPreference:"high-performance",failIfMajorPerformanceCaveat:!1};let s=this.canvas.getContext("webgl2")||this.canvas.getContext("webgl")||this.canvas.getContext("experimental-webgl");if(s&&!s.isContextLost()?(console.log(`🔄 Reusing existing WebGL context for ${e instanceof HTMLCanvasElement?e.id:e}`),this.gl=s):this.gl=this.canvas.getContext("webgl2",this.contextOptions)||this.canvas.getContext("webgl",this.contextOptions)||this.canvas.getContext("experimental-webgl",this.contextOptions),!this.gl)throw console.error(`WebGL not supported for ${e}`),this.showWebGLError(),new Error(`WebGL not supported for ${e}`);this.variantParams=this.generateVariantParams(r),this.roleParams=this.generateRoleParams(t),this.mouseX=.5,this.mouseY=.5,this.mouseIntensity=0,this.clickIntensity=0,this.clickDecay=.95,this.touchX=.5,this.touchY=.5,this.touchActive=!1,this.touchMorph=0,this.touchChaos=0,this.scrollPosition=0,this.scrollVelocity=0,this.scrollDecay=.92,this.parallaxDepth=0,this.gridDensityShift=0,this.colorScrollShift=0,this.densityVariation=0,this.densityTarget=0,this.audioData={bass:0,mid:0,high:0},this.audioDensityBoost=0,this.audioMorphBoost=0,this.audioSpeedBoost=0,this.audioChaosBoost=0,this.audioColorShift=0,this.startTime=Date.now(),this._contextLost=!1,this._onContextLost=o=>{o.preventDefault(),this._contextLost=!0,console.warn(`WebGL context lost for ${e}`)},this._onContextRestored=()=>{console.log(`WebGL context restored for ${e}`),this._contextLost=!1;try{this.initShaders(),this.initBuffers(),this.resize()}catch(o){console.error(`Failed to reinit after context restore for ${e}:`,o)}},this.canvas.addEventListener("webglcontextlost",this._onContextLost),this.canvas.addEventListener("webglcontextrestored",this._onContextRestored),this.initShaders(),this.initBuffers(),this.resize()}generateVariantParams(e){const t=["TETRAHEDRON","HYPERCUBE","SPHERE","TORUS","KLEIN BOTTLE","FRACTAL","WAVE","CRYSTAL"],r=[0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,6,6,6,7,7,7,7][e]||0,s=e%4,n=t[r]+[" LATTICE"," FIELD"," MATRIX"," RESONANCE"][s],c={0:{gridDensity:.8+s*.2,speed:.3+s*.1,chaos:s*.1,morphFactor:0+s*.2},1:{gridDensity:1+s*.3,speed:.5+s*.1,chaos:s*.15,morphFactor:s*.2},2:{gridDensity:1.2+s*.4,speed:.4+s*.2,chaos:.1+s*.1,morphFactor:.3+s*.2},3:{gridDensity:.9+s*.3,speed:.6+s*.2,chaos:.2+s*.2,morphFactor:.5+s*.1},4:{gridDensity:1.4+s*.5,speed:.7+s*.1,chaos:.3+s*.2,morphFactor:.7+s*.1},5:{gridDensity:1.8+s*.3,speed:.5+s*.3,chaos:.5+s*.2,morphFactor:.8+s*.05},6:{gridDensity:.6+s*.4,speed:.8+s*.4,chaos:.4+s*.3,morphFactor:.6+s*.2},7:{gridDensity:1.6+s*.2,speed:.2+s*.1,chaos:.1+s*.1,morphFactor:.2+s*.2}}[r];return{geometry:r,name:n,gridDensity:c.gridDensity,speed:c.speed,hue:e*12.27%360,saturation:.8+s*.05,intensity:.5+s*.1,chaos:c.chaos,morphFactor:c.morphFactor}}generateRoleParams(e){const t=this.variantParams;return{background:{densityMult:.4,speedMult:.2,colorShift:0,intensity:.2,mouseReactivity:.3,clickReactivity:.1},shadow:{densityMult:.8,speedMult:.3,colorShift:180,intensity:.4,mouseReactivity:.5,clickReactivity:.3},content:{densityMult:t.gridDensity,speedMult:t.speed,colorShift:t.hue,intensity:t.intensity,mouseReactivity:1,clickReactivity:.8},highlight:{densityMult:1.5+t.gridDensity*.3,speedMult:.8+t.speed*.2,colorShift:t.hue+60,intensity:.6+t.intensity*.2,mouseReactivity:1.2,clickReactivity:1},accent:{densityMult:2.5+t.gridDensity*.5,speedMult:.4+t.speed*.1,colorShift:t.hue+300,intensity:.3+t.intensity*.1,mouseReactivity:1.5,clickReactivity:1.2}}[e]||{densityMult:1,speedMult:.5,colorShift:0,intensity:.5,mouseReactivity:1,clickReactivity:.5}}initShaders(){const e=`
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `,t=`
            precision highp float;

            uniform vec2 u_resolution;
            uniform float u_time;
            uniform vec2 u_mouse;
            uniform float u_geometry;
            uniform float u_gridDensity;
            uniform float u_speed;
            uniform vec3 u_color;
            uniform float u_intensity;
            uniform float u_roleDensity;
            uniform float u_roleSpeed;
            uniform float u_colorShift;
            uniform float u_chaosIntensity;
            uniform float u_mouseIntensity;
            uniform float u_clickIntensity;
            uniform float u_densityVariation;
            uniform float u_chaos;
            uniform float u_morphFactor;
            uniform float u_touchMorph;
            uniform float u_touchChaos;
            uniform float u_scrollParallax;
            uniform float u_gridDensityShift;
            uniform float u_colorScrollShift;
            uniform float u_audioDensityBoost;
            uniform float u_audioMorphBoost;
            uniform float u_audioSpeedBoost;
            uniform float u_audioChaosBoost;
            uniform float u_audioColorShift;
            uniform float u_rot4dXY;
            uniform float u_rot4dXZ;
            uniform float u_rot4dYZ;
            uniform float u_rot4dXW;
            uniform float u_rot4dYW;
            uniform float u_rot4dZW;

            // EXHALE FEATURE: Breathing uniform
            uniform float u_breath;

            // 6D rotation matrices - 3D space rotations (XY, XZ, YZ)
            mat4 rotateXY(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
            }

            mat4 rotateXZ(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1);
            }

            mat4 rotateYZ(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1);
            }

            // 4D hyperspace rotations (XW, YW, ZW)
            mat4 rotateXW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(c, 0, 0, -s, 0, 1, 0, 0, 0, 0, 1, 0, s, 0, 0, c);
            }

            mat4 rotateYW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(1, 0, 0, 0, 0, c, 0, -s, 0, 0, 1, 0, 0, s, 0, c);
            }

            mat4 rotateZW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, c, -s, 0, 0, s, c);
            }

            // 4D to 3D projection - BREATHING EFFECT
            vec3 project4Dto3D(vec4 p) {
                // Modulate projection distance with breath for "exhale" effect (expansion/contraction)
                float baseDim = 2.5;
                float dim = baseDim + u_breath * 0.5; // Expands on exhale
                float w = dim / (dim + p.w);
                return vec3(p.x * w, p.y * w, p.z * w);
            }

            // ========================================
            // POLYTOPE CORE WARP FUNCTIONS (24 Geometries)
            // ========================================
            vec3 warpHypersphereCore(vec3 p, int geometryIndex, vec2 mouseDelta) {
                float radius = length(p);
                float morphBlend = clamp(u_morphFactor * 0.6 + 0.3, 0.0, 2.0);
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

                float morphBlend = clamp(u_morphFactor * 0.8 + 0.2, 0.0, 2.0);
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

                float planeInfluence = min(min(abs(dot(p, c1)), abs(dot(p, c2))), min(abs(dot(p, c3)), abs(dot(p, c4))));
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
            // ========================================

            // Enhanced VIB3 Geometry Library - Higher Fidelity
            float tetrahedronLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;

                // Enhanced tetrahedron vertices with holographic shimmer
                float d1 = length(q);
                float d2 = length(q - vec3(0.35, 0.0, 0.0));
                float d3 = length(q - vec3(0.0, 0.35, 0.0));
                float d4 = length(q - vec3(0.0, 0.0, 0.35));
                float d5 = length(q - vec3(0.2, 0.2, 0.0));
                float d6 = length(q - vec3(0.2, 0.0, 0.2));
                float d7 = length(q - vec3(0.0, 0.2, 0.2));

                float vertices = 1.0 - smoothstep(0.0, 0.03, min(min(min(d1, d2), min(d3, d4)), min(min(d5, d6), d7)));

                // Enhanced edge network with interference patterns
                float edges = 0.0;
                float shimmer = sin(u_time * 0.002) * 0.02;
                edges = max(edges, 1.0 - smoothstep(0.0, 0.015, abs(length(q.xy) - (0.18 + shimmer))));
                edges = max(edges, 1.0 - smoothstep(0.0, 0.015, abs(length(q.yz) - (0.18 + shimmer * 0.8))));
                edges = max(edges, 1.0 - smoothstep(0.0, 0.015, abs(length(q.xz) - (0.18 + shimmer * 1.2))));

                // Add interference patterns between vertices
                float interference = sin(d1 * 25.0 + u_time * 0.003) * sin(d2 * 22.0 + u_time * 0.0025) * 0.1;

                // Volumetric density based on distance field
                float volume = exp(-length(q) * 3.0) * 0.15;

                return max(vertices, edges * 0.7) + interference + volume;
            }

            float hypercubeLattice(vec3 p, float gridSize) {
                vec3 grid = fract(p * gridSize);
                vec3 q = grid - 0.5;

                // Enhanced hypercube with 4D projection effects
                vec3 edges = 1.0 - smoothstep(0.0, 0.025, abs(q));
                float wireframe = max(max(edges.x, edges.y), edges.z);

                // Add 4D hypercube vertices (8 corners + 8 hypervertices)
                float vertices = 0.0;
                for(int i = 0; i < 8; i++) {
                    // WebGL 1.0 compatible modulus replacement
                    float iFloat = float(i);
                    vec3 corner = vec3(
                        floor(iFloat - floor(iFloat / 2.0) * 2.0) - 0.5,
                        floor((iFloat / 2.0) - floor((iFloat / 2.0) / 2.0) * 2.0) - 0.5,
                        float(i / 4) - 0.5
                    );
                    float dist = length(q - corner * 0.4);
                    vertices = max(vertices, 1.0 - smoothstep(0.0, 0.04, dist));
                }

                // Holographic interference patterns
                float interference = sin(length(q) * 20.0 + u_time * 0.002) * 0.08;

                // Cross-dimensional glow
                float glow = exp(-length(q) * 2.5) * 0.12;

                return wireframe * 0.8 + vertices + interference + glow;
            }

            float sphereLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float r = length(q);
                return 1.0 - smoothstep(0.2, 0.5, r);
            }

            float torusLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float r1 = sqrt(q.x*q.x + q.y*q.y);
                float r2 = sqrt((r1 - 0.3)*(r1 - 0.3) + q.z*q.z);
                return 1.0 - smoothstep(0.0, 0.1, r2);
            }

            float kleinLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize);
                float u = q.x * 2.0 * 3.14159;
                float v = q.y * 2.0 * 3.14159;
                float x = cos(u) * (3.0 + cos(u/2.0) * sin(v) - sin(u/2.0) * sin(2.0*v));
                float klein = length(vec2(x, q.z)) - 0.1;
                return 1.0 - smoothstep(0.0, 0.05, abs(klein));
            }

            float fractalLattice(vec3 p, float gridSize) {
                vec3 q = p * gridSize;
                float scale = 1.0;
                float fractal = 0.0;
                for(int i = 0; i < 4; i++) {
                  q = fract(q) - 0.5;
                  fractal += abs(length(q)) / scale;
                  scale *= 2.0;
                  q *= 2.0;
                }
                return 1.0 - smoothstep(0.0, 1.0, fractal);
            }

            float waveLattice(vec3 p, float gridSize) {
                vec3 q = p * gridSize;
                float wave = sin(q.x * 2.0) * sin(q.y * 2.0) * sin(q.z * 2.0 + u_time);
                return smoothstep(-0.5, 0.5, wave);
            }

            float crystalLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float d = max(max(abs(q.x), abs(q.y)), abs(q.z));
                return 1.0 - smoothstep(0.3, 0.5, d);
            }

            float getDynamicGeometry(vec3 p, float gridSize, float geometryType) {
                // Apply polytope core warp transformation (24-geometry system)
                vec3 warped = applyCoreWarp(p, geometryType, vec2(0.0, 0.0));

                // WebGL 1.0 compatible modulus replacement - decode base geometry
                float baseGeomFloat = geometryType - floor(geometryType / 8.0) * 8.0;
                int baseGeom = int(baseGeomFloat);
                float variation = floor(geometryType / 8.0) / 4.0;
                float variedGridSize = gridSize * (0.5 + variation * 1.5);

                // Call lattice functions with warped point (enables 24 geometry variants)
                if (baseGeom == 0) return tetrahedronLattice(warped, variedGridSize);
                else if (baseGeom == 1) return hypercubeLattice(warped, variedGridSize);
                else if (baseGeom == 2) return sphereLattice(warped, variedGridSize);
                else if (baseGeom == 3) return torusLattice(warped, variedGridSize);
                else if (baseGeom == 4) return kleinLattice(warped, variedGridSize);
                else if (baseGeom == 5) return fractalLattice(warped, variedGridSize);
                else if (baseGeom == 6) return waveLattice(warped, variedGridSize);
                else return crystalLattice(warped, variedGridSize);
            }

            vec3 hsv2rgb(vec3 c) {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }

            vec3 rgbGlitch(vec3 color, vec2 uv, float intensity) {
                vec2 offset = vec2(intensity * 0.005, 0.0);
                float r = color.r + sin(uv.y * 30.0 + u_time * 0.001) * intensity * 0.06;
                float g = color.g + sin(uv.y * 28.0 + u_time * 0.0012) * intensity * 0.06;
                float b = color.b + sin(uv.y * 32.0 + u_time * 0.0008) * intensity * 0.06;
                return vec3(r, g, b);
            }

            float moirePattern(vec2 uv, float intensity) {
                float freq1 = 12.0 + intensity * 6.0 + u_densityVariation * 3.0;
                float freq2 = 14.0 + intensity * 8.0 + u_densityVariation * 4.0;
                float pattern1 = sin(uv.x * freq1) * sin(uv.y * freq1);
                float pattern2 = sin(uv.x * freq2) * sin(uv.y * freq2);
                return (pattern1 * pattern2) * intensity * 0.15;
            }

            float gridOverlay(vec2 uv, float intensity) {
                vec2 grid = fract(uv * (8.0 + u_densityVariation * 4.0));
                float lines = 0.0;
                lines = max(lines, 1.0 - smoothstep(0.0, 0.02, abs(grid.x - 0.5)));
                lines = max(lines, 1.0 - smoothstep(0.0, 0.02, abs(grid.y - 0.5)));
                return lines * intensity * 0.1;
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                float aspectRatio = u_resolution.x / u_resolution.y;
                uv.x *= aspectRatio;
                uv -= 0.5;

                float time = u_time * 0.0004 * u_speed * u_roleSpeed;

                float mouseInfluence = u_mouseIntensity * 0.25; // FIX: Reduce mouse jarring by 50%
                vec2 mouseOffset = (u_mouse - 0.5) * mouseInfluence;

                float parallaxOffset = u_scrollParallax * 0.2;
                vec2 scrollOffset = vec2(parallaxOffset * 0.1, parallaxOffset * 0.05);

                float morphOffset = u_touchMorph * 0.3;

                vec4 p4d = vec4(uv + mouseOffset * 0.1 + scrollOffset,
                               sin(time * 0.1 + morphOffset) * 0.15,
                               cos(time * 0.08 + morphOffset * 0.5) * 0.15);

                float scrollRotation = u_scrollParallax * 0.1;
                float touchRotation = u_touchMorph * 0.2;

                // Combine manual rotation with automatic/interactive rotation - 6D full rotation
                p4d = rotateXY(u_rot4dXY + time * 0.1) * p4d;
                p4d = rotateXZ(u_rot4dXZ + time * 0.12) * p4d;
                p4d = rotateYZ(u_rot4dYZ + time * 0.08) * p4d;
                p4d = rotateXW(u_rot4dXW + time * 0.2 + mouseOffset.y * 0.5 + scrollRotation) * p4d;
                p4d = rotateYW(u_rot4dYW + time * 0.15 + mouseOffset.x * 0.5 + touchRotation) * p4d;
                p4d = rotateZW(u_rot4dZW + time * 0.25 + u_clickIntensity * 0.3 + u_touchChaos * 0.4) * p4d;

                vec3 p = project4Dto3D(p4d);

                float scrollDensityMod = 1.0 + u_gridDensityShift * 0.3;
                float audioDensityMod = 1.0 + u_audioDensityBoost * 0.5;
                // Controlled density calculation - breathing modulation added
                float breathDensityMod = 1.0 + u_breath * 0.1;
                float baseDensity = u_gridDensity * u_roleDensity * breathDensityMod;

                float densityVariations = (u_densityVariation * 0.3 + (scrollDensityMod - 1.0) * 0.4 + (audioDensityMod - 1.0) * 0.2);
                float roleDensity = baseDensity + densityVariations;

                float morphedGeometry = u_geometry + u_morphFactor * 3.0 + u_touchMorph * 2.0 + u_audioMorphBoost * 1.5;
                float lattice = getDynamicGeometry(p, roleDensity, morphedGeometry);

                // Enhanced holographic color processing
                vec3 baseColor = u_color;
                float latticeIntensity = lattice * u_intensity;

                // Breathing glow effect
                latticeIntensity *= (1.0 + u_breath * 0.4);

                // Multi-layer color composition for higher fidelity
                vec3 color = baseColor * (0.2 + latticeIntensity * 0.8);

                // Holographic shimmer layers
                vec3 shimmer1 = baseColor * lattice * 0.5;
                vec3 shimmer2 = baseColor * sin(lattice * 8.0 + u_time * 0.001) * 0.2;
                vec3 shimmer3 = baseColor * cos(lattice * 12.0 + u_time * 0.0008) * 0.15;

                color += shimmer1 + shimmer2 + shimmer3;

                // Enhanced brightness variations with interference
                color += vec3(lattice * 0.6) * baseColor;
                color += vec3(sin(lattice * 15.0) * 0.1) * baseColor;

                // Depth-based coloring for 3D effect
                float depth = 1.0 - length(p) * 0.3;
                color *= (0.7 + depth * 0.3);

                float enhancedChaos = u_chaos + u_chaosIntensity + u_touchChaos * 0.3 + u_audioChaosBoost * 0.4;
                color += vec3(moirePattern(uv + scrollOffset, enhancedChaos));
                color += vec3(gridOverlay(uv, u_mouseIntensity + u_scrollParallax * 0.1));
                color = rgbGlitch(color, uv, enhancedChaos);

                // Apply morph distortion to position
                vec2 morphDistortion = vec2(sin(uv.y * 10.0 + u_time * 0.001) * u_morphFactor * 0.1,
                                           cos(uv.x * 10.0 + u_time * 0.001) * u_morphFactor * 0.1);
                color = mix(color, color * (1.0 + length(morphDistortion)), u_morphFactor * 0.5);

                // Enhanced holographic interaction effects
                float mouseDist = length(uv - (u_mouse - 0.5) * vec2(aspectRatio, 1.0));

                // Multi-layer mouse glow with holographic ripples
                float mouseGlow = exp(-mouseDist * 1.2) * u_mouseIntensity * 0.25;
                float mouseRipple = sin(mouseDist * 15.0 - u_time * 0.003) * exp(-mouseDist * 2.0) * u_mouseIntensity * 0.1;
                color += vec3(mouseGlow + mouseRipple) * baseColor * 0.8;

                // Enhanced click pulse with interference
                float clickPulse = u_clickIntensity * exp(-mouseDist * 1.8) * 0.4;
                float clickRing = sin(mouseDist * 20.0 - u_clickIntensity * 5.0) * u_clickIntensity * 0.15;
                color += vec3(clickPulse + clickRing, (clickPulse + clickRing) * 0.6, (clickPulse + clickRing) * 1.2);

                // Holographic interference from interactions
                float interference = sin(mouseDist * 25.0 + u_time * 0.002) * u_mouseIntensity * 0.05;
                color += vec3(interference) * baseColor;

                gl_FragColor = vec4(color, 0.95);
            }
        `;this.program=this.createProgram(e,t),this.uniforms={resolution:this.gl.getUniformLocation(this.program,"u_resolution"),time:this.gl.getUniformLocation(this.program,"u_time"),mouse:this.gl.getUniformLocation(this.program,"u_mouse"),geometry:this.gl.getUniformLocation(this.program,"u_geometry"),gridDensity:this.gl.getUniformLocation(this.program,"u_gridDensity"),speed:this.gl.getUniformLocation(this.program,"u_speed"),color:this.gl.getUniformLocation(this.program,"u_color"),intensity:this.gl.getUniformLocation(this.program,"u_intensity"),roleDensity:this.gl.getUniformLocation(this.program,"u_roleDensity"),roleSpeed:this.gl.getUniformLocation(this.program,"u_roleSpeed"),colorShift:this.gl.getUniformLocation(this.program,"u_colorShift"),chaosIntensity:this.gl.getUniformLocation(this.program,"u_chaosIntensity"),mouseIntensity:this.gl.getUniformLocation(this.program,"u_mouseIntensity"),clickIntensity:this.gl.getUniformLocation(this.program,"u_clickIntensity"),densityVariation:this.gl.getUniformLocation(this.program,"u_densityVariation"),chaos:this.gl.getUniformLocation(this.program,"u_chaos"),morphFactor:this.gl.getUniformLocation(this.program,"u_morphFactor"),touchMorph:this.gl.getUniformLocation(this.program,"u_touchMorph"),touchChaos:this.gl.getUniformLocation(this.program,"u_touchChaos"),scrollParallax:this.gl.getUniformLocation(this.program,"u_scrollParallax"),gridDensityShift:this.gl.getUniformLocation(this.program,"u_gridDensityShift"),colorScrollShift:this.gl.getUniformLocation(this.program,"u_colorScrollShift"),audioDensityBoost:this.gl.getUniformLocation(this.program,"u_audioDensityBoost"),audioMorphBoost:this.gl.getUniformLocation(this.program,"u_audioMorphBoost"),audioSpeedBoost:this.gl.getUniformLocation(this.program,"u_audioSpeedBoost"),audioChaosBoost:this.gl.getUniformLocation(this.program,"u_audioChaosBoost"),audioColorShift:this.gl.getUniformLocation(this.program,"u_audioColorShift"),rot4dXY:this.gl.getUniformLocation(this.program,"u_rot4dXY"),rot4dXZ:this.gl.getUniformLocation(this.program,"u_rot4dXZ"),rot4dYZ:this.gl.getUniformLocation(this.program,"u_rot4dYZ"),rot4dXW:this.gl.getUniformLocation(this.program,"u_rot4dXW"),rot4dYW:this.gl.getUniformLocation(this.program,"u_rot4dYW"),rot4dZW:this.gl.getUniformLocation(this.program,"u_rot4dZW"),breath:this.gl.getUniformLocation(this.program,"u_breath")}}createProgram(e,t){const i=this.createShader(this.gl.VERTEX_SHADER,e),r=this.createShader(this.gl.FRAGMENT_SHADER,t),s=this.gl.createProgram();if(this.gl.attachShader(s,i),this.gl.attachShader(s,r),this.gl.linkProgram(s),!this.gl.getProgramParameter(s,this.gl.LINK_STATUS))throw new Error("Program linking failed: "+this.gl.getProgramInfoLog(s));return s}createShader(e,t){if(!this.gl)throw console.error("❌ Cannot create shader: WebGL context is null"),new Error("WebGL context is null");if(this.gl.isContextLost())throw console.error("❌ Cannot create shader: WebGL context is lost"),new Error("WebGL context is lost");try{const i=this.gl.createShader(e);if(!i)throw console.error("❌ Failed to create shader object - WebGL context may be invalid"),new Error("Failed to create shader object - WebGL context may be invalid");if(this.gl.shaderSource(i,t),this.gl.compileShader(i),!this.gl.getShaderParameter(i,this.gl.COMPILE_STATUS)){const r=this.gl.getShaderInfoLog(i),s=e===this.gl.VERTEX_SHADER?"vertex":"fragment";throw r?(console.error(`❌ ${s} shader compilation failed:`,r),new Error(`${s} shader compilation failed: ${r}`)):(console.error(`❌ ${s} shader compilation failed: WebGL returned no error info (context may be invalid)`),new Error(`${s} shader compilation failed: WebGL returned no error info (context may be invalid)`))}return i}catch(i){throw console.error("❌ Exception during shader creation:",i),i}}initBuffers(){const e=new Float32Array([-1,-1,1,-1,-1,1,1,1]);this.buffer=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.buffer),this.gl.bufferData(this.gl.ARRAY_BUFFER,e,this.gl.STATIC_DRAW);const t=this.gl.getAttribLocation(this.program,"a_position");this.gl.enableVertexAttribArray(t),this.gl.vertexAttribPointer(t,2,this.gl.FLOAT,!1,0,0)}resize(){const e=Math.min(window.devicePixelRatio||1,2),t=this.canvas.clientWidth,i=this.canvas.clientHeight;(this.canvas.width!==t*e||this.canvas.height!==i*e)&&(this.canvas.width=t*e,this.canvas.height=i*e,this.gl.viewport(0,0,this.canvas.width,this.canvas.height))}showWebGLError(){if(!this.canvas)return;const e=this.canvas.getContext("2d");e&&(e.fillStyle="#000",e.fillRect(0,0,this.canvas.width,this.canvas.height),e.fillStyle="#ff64ff",e.font="16px Orbitron, monospace",e.textAlign="center",e.fillText("WebGL Required",this.canvas.width/2,this.canvas.height/2),e.fillStyle="#888",e.font="12px Orbitron, monospace",e.fillText("Please enable WebGL in your browser",this.canvas.width/2,this.canvas.height/2+25))}updateInteraction(e,t,i){this.mouseX=e,this.mouseY=t,this.mouseIntensity=i*this.roleParams.mouseReactivity*this.reactivity}triggerClick(e,t){this.clickIntensity=Math.min(1,this.clickIntensity+this.roleParams.clickReactivity*this.reactivity)}updateDensity(e){this.densityTarget=e}updateTouch(e,t,i){this.touchX=e,this.touchY=t,this.touchActive=i,this.touchMorph=(e-.5)*2,this.touchChaos=Math.abs(t-.5)*2}updateScroll(e){this.scrollVelocity+=e*.001,this.scrollVelocity=Math.max(-2,Math.min(2,this.scrollVelocity))}updateAudio_DISABLED(){}updateScrollPhysics(){this.scrollPosition+=this.scrollVelocity,this.scrollVelocity*=this.scrollDecay,this.parallaxDepth=Math.sin(this.scrollPosition*.1)*.5,this.gridDensityShift=Math.sin(this.scrollPosition*.05)*.3,this.colorScrollShift=this.scrollPosition*.02%(Math.PI*2)}render(){if(!this.program||this._contextLost)return;if(this.gl.isContextLost()){this._contextLost=!0;return}this.resize(),this.gl.useProgram(this.program),this.densityVariation+=(this.densityTarget-this.densityVariation)*.05,this.clickIntensity*=this.clickDecay,this.updateScrollPhysics();const e=Date.now()-this.startTime,t=(this.variantParams.hue||0)/360,i=this.variantParams.saturation||.8,r=Math.max(.2,Math.min(.8,this.variantParams.intensity||.5)),o=((p,_,g)=>{let y,L,x;if(_===0)y=L=x=g;else{const P=(b,E,v)=>(v<0&&(v+=1),v>1&&(v-=1),v<.16666666666666666?b+(E-b)*6*v:v<.5?E:v<.6666666666666666?b+(E-b)*(.6666666666666666-v)*6:b),S=g<.5?g*(1+_):g+_-g*_,D=2*g-S;y=P(D,S,p+1/3),L=P(D,S,p),x=P(D,S,p-1/3)}return[y,L,x]})(t,i,r);this.gl.uniform2f(this.uniforms.resolution,this.canvas.width,this.canvas.height),this.gl.uniform1f(this.uniforms.time,e),this.gl.uniform2f(this.uniforms.mouse,this.mouseX,this.mouseY),this.gl.uniform1f(this.uniforms.geometry,this.variantParams.geometry!==void 0?this.variantParams.geometry:this.variant||0),this.gl.uniform1f(this.uniforms.gridDensity,this.variantParams.gridDensity||1);const a=(this.variantParams.speed||.5)*.2,n=(this.audioSpeedBoost||0)*.1;this.gl.uniform1f(this.uniforms.speed,a+n),this.gl.uniform3fv(this.uniforms.color,new Float32Array(o)),this.gl.uniform1f(this.uniforms.intensity,(this.variantParams.intensity||.5)*this.roleParams.intensity),this.gl.uniform1f(this.uniforms.roleDensity,this.roleParams.densityMult),this.gl.uniform1f(this.uniforms.roleSpeed,this.roleParams.speedMult),this.gl.uniform1f(this.uniforms.colorShift,this.roleParams.colorShift+(this.variantParams.hue||0)/360),this.gl.uniform1f(this.uniforms.chaosIntensity,this.variantParams.chaos||0),this.gl.uniform1f(this.uniforms.mouseIntensity,this.mouseIntensity),this.gl.uniform1f(this.uniforms.clickIntensity,this.clickIntensity),this.gl.uniform1f(this.uniforms.densityVariation,this.densityVariation),this.gl.uniform1f(this.uniforms.chaos,this.variantParams.chaos||0),this.gl.uniform1f(this.uniforms.morphFactor,this.variantParams.morphFactor||0),this.gl.uniform1f(this.uniforms.touchMorph,this.touchMorph),this.gl.uniform1f(this.uniforms.touchChaos,this.touchChaos),this.gl.uniform1f(this.uniforms.scrollParallax,this.parallaxDepth),this.gl.uniform1f(this.uniforms.gridDensityShift,this.gridDensityShift),this.gl.uniform1f(this.uniforms.colorScrollShift,this.colorScrollShift);let l=0,c=0,h=0,d=0,m=0;window.audioEnabled&&window.audioReactive&&(l=window.audioReactive.bass*1.5,c=window.audioReactive.mid*1.2,h=window.audioReactive.high*.8,d=window.audioReactive.energy*.6,m=window.audioReactive.bass*45,Date.now()%1e4<16&&console.log(`✨ Holographic audio reactivity: Density+${l.toFixed(2)} Morph+${c.toFixed(2)} Speed+${h.toFixed(2)} Chaos+${d.toFixed(2)} Color+${m.toFixed(1)}`)),this.gl.uniform1f(this.uniforms.audioDensityBoost,l),this.gl.uniform1f(this.uniforms.audioMorphBoost,c),this.gl.uniform1f(this.uniforms.audioSpeedBoost,h),this.gl.uniform1f(this.uniforms.audioChaosBoost,d),this.gl.uniform1f(this.uniforms.audioColorShift,m),this.gl.uniform1f(this.uniforms.rot4dXY,this.variantParams.rot4dXY||0),this.gl.uniform1f(this.uniforms.rot4dXZ,this.variantParams.rot4dXZ||0),this.gl.uniform1f(this.uniforms.rot4dYZ,this.variantParams.rot4dYZ||0),this.gl.uniform1f(this.uniforms.rot4dXW,this.variantParams.rot4dXW||0),this.gl.uniform1f(this.uniforms.rot4dYW,this.variantParams.rot4dYW||0),this.gl.uniform1f(this.uniforms.rot4dZW,this.variantParams.rot4dZW||0);const f=this.variantParams.breath||0;this.gl.uniform1f(this.uniforms.breath,f),this.gl.drawArrays(this.gl.TRIANGLE_STRIP,0,4)}reinitializeContext(){var e,t,i,r,s;if(console.log(`🔄 Reinitializing WebGL context for ${(e=this.canvas)==null?void 0:e.id}`),this.program=null,this.buffer=null,this.uniforms=null,this.gl=null,this.gl=this.canvas.getContext("webgl2")||this.canvas.getContext("webgl")||this.canvas.getContext("experimental-webgl"),!this.gl)return console.error(`❌ No WebGL context available for ${(t=this.canvas)==null?void 0:t.id} - SmartCanvasPool should have created one`),!1;if(this.gl.isContextLost())return console.error(`❌ WebGL context is lost for ${(i=this.canvas)==null?void 0:i.id}`),!1;try{return this.initShaders(),this.initBuffers(),this.resize(),console.log(`✅ ${(r=this.canvas)==null?void 0:r.id}: Holographic context reinitialized successfully`),!0}catch(o){return console.error(`❌ Failed to reinitialize holographic WebGL resources for ${(s=this.canvas)==null?void 0:s.id}:`,o),!1}}updateParameters(e){!e||typeof e!="object"||this.variantParams&&Object.keys(e).forEach(t=>{let i=e[t];typeof i!="number"||!Number.isFinite(i)||(t==="gridDensity"&&(i=.3+(parseFloat(e[t])-5)/95*2.2),this.variantParams[t]=i,t==="geometry"&&(this.roleParams=this.generateRoleParams(this.role)))})}destroy(){this.canvas&&(this._onContextLost&&this.canvas.removeEventListener("webglcontextlost",this._onContextLost),this._onContextRestored&&this.canvas.removeEventListener("webglcontextrestored",this._onContextRestored)),this.gl&&!this.gl.isContextLost()&&(this.program&&this.gl.deleteProgram(this.program),this.buffer&&this.gl.deleteBuffer(this.buffer)),this.program=null,this.buffer=null,this.gl=null,this._contextLost=!0}}class he{constructor(e={}){this.visualizers=[],this.currentVariant=0,this.baseVariants=30,this.totalVariants=30,this.isActive=!1,this.canvasOverride=e.canvas||null,this.canvasSet=e.canvases||null,this._multiCanvasBridge=null,this._renderMode="direct",this._bridgeTime=0,this._layerGraph=new I({profile:e.relationshipProfile||"holographic"}),this.useBuiltInReactivity=!window.reactivityManager,this.audioEnabled=!1,this.audioContext=null,this.analyser=null,this.frequencyData=null,this.audioData={bass:0,mid:0,high:0},this.variantNames=["TETRAHEDRON LATTICE","TETRAHEDRON FIELD","TETRAHEDRON MATRIX","TETRAHEDRON RESONANCE","HYPERCUBE LATTICE","HYPERCUBE FIELD","HYPERCUBE MATRIX","HYPERCUBE QUANTUM","SPHERE LATTICE","SPHERE FIELD","SPHERE MATRIX","SPHERE RESONANCE","TORUS LATTICE","TORUS FIELD","TORUS MATRIX","TORUS QUANTUM","KLEIN BOTTLE LATTICE","KLEIN BOTTLE FIELD","KLEIN BOTTLE MATRIX","KLEIN BOTTLE QUANTUM","FRACTAL LATTICE","FRACTAL FIELD","FRACTAL QUANTUM","WAVE LATTICE","WAVE FIELD","WAVE QUANTUM","CRYSTAL LATTICE","CRYSTAL FIELD","CRYSTAL MATRIX","CRYSTAL QUANTUM"],this.initialize()}initialize(){console.log("🎨 Initializing REAL Holographic System for Active Holograms tab..."),this.createVisualizers(),this.setupCenterDistanceReactivity(),this.updateVariantDisplay(),this.startRenderLoop()}createVisualizers(){if(this.canvasOverride){try{const i=new F(this.canvasOverride,"content",1,this.currentVariant);i.gl?(this.visualizers.push(i),console.log("✅ Created holographic single-canvas visualizer (content layer)")):console.warn("⚠️ No WebGL context for holographic canvasOverride")}catch(i){console.warn("Failed to create holographic single-canvas visualizer:",i)}return}if(this.canvasSet){const i=[{key:"background",role:"background",reactivity:.5},{key:"shadow",role:"shadow",reactivity:.7},{key:"content",role:"content",reactivity:.9},{key:"highlight",role:"highlight",reactivity:1.1},{key:"accent",role:"accent",reactivity:1.5}];let r=0;i.forEach(s=>{const o=this.canvasSet[s.key];if(o)try{const a=new F(o,s.role,s.reactivity,this.currentVariant);a.gl&&(this.visualizers.push(a),r++,console.log(`✅ Created holographic layer (canvasSet): ${s.role}`))}catch(a){console.warn(`Failed to create holographic layer ${s.role}:`,a)}}),console.log(`✅ Created ${r} holographic visualizers via canvasSet`);return}const e=[{id:"holo-background-canvas",role:"background",reactivity:.5},{id:"holo-shadow-canvas",role:"shadow",reactivity:.7},{id:"holo-content-canvas",role:"content",reactivity:.9},{id:"holo-highlight-canvas",role:"highlight",reactivity:1.1},{id:"holo-accent-canvas",role:"accent",reactivity:1.5}];let t=0;e.forEach(i=>{try{if(!document.getElementById(i.id)){console.error(`❌ Canvas not found: ${i.id}`);return}console.log(`🔍 Creating holographic visualizer for: ${i.id}`);const s=new F(i.id,i.role,i.reactivity,this.currentVariant);s.gl?(this.visualizers.push(s),t++,console.log(`✅ Created REAL holographic layer: ${i.role} (${i.id})`)):console.error(`❌ No WebGL context for: ${i.id}`)}catch(r){console.error(`❌ Failed to create REAL holographic layer ${i.id}:`,r)}}),console.log(`✅ Created ${t}/5 REAL holographic layers`),t===0&&console.error("🚨 NO HOLOGRAPHIC VISUALIZERS CREATED! Check canvas elements and WebGL support.")}async initWithBridge(e={}){try{const t=await this.createMultiCanvasBridge(e);return t&&t.initialized?(this._renderMode="bridge",this._bridgeTime=0,console.log(`Holographic System initialized via ${t.backendType} bridge (${t.layerCount} layers)`),!0):(console.warn("Holographic bridge init returned no bridge, staying in direct mode"),!1)}catch(t){return console.error("Holographic bridge init failed, staying in direct mode:",t),this._renderMode="direct",!1}}async createMultiCanvasBridge(e={}){const t={},i={background:"holo-background-canvas",shadow:"holo-shadow-canvas",content:"holo-content-canvas",highlight:"holo-highlight-canvas",accent:"holo-accent-canvas"};for(const[o,a]of Object.entries(i)){const n=document.getElementById(a);n&&(t[o]=n)}if(Object.keys(t).length===0)return null;const r=new k;await r.initialize({canvases:t,preferWebGPU:e.preferWebGPU!==!1,relationshipGraph:this._layerGraph});let s={glslVertex:`attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`,glslFragment:null,wgslFragment:null};try{const o=await z.loadShaderPair("holographic","holographic/holographic.frag");o.glslVertex&&(s.glslVertex=o.glslVertex),o.glslFragment&&(s.glslFragment=o.glslFragment),o.wgslFragment&&(s.wgslFragment=o.wgslFragment)}catch{console.warn("Holographic external shader load failed, using inline fallback")}if(s.glslFragment||s.wgslFragment){const o=r.compileShaderAll("holographic",s);o.failed.length>0&&console.warn(`Holographic shader compilation failed on layers: ${o.failed.join(", ")}`)}return this._multiCanvasBridge=r,r}_buildSharedUniforms(){const e=this.getParameters(),t=this.audioData||{bass:0,mid:0,high:0};return{u_time:this._bridgeTime,u_resolution:null,u_geometry:e.geometry||0,u_rot4dXY:e.rot4dXY||0,u_rot4dXZ:e.rot4dXZ||0,u_rot4dYZ:e.rot4dYZ||0,u_rot4dXW:e.rot4dXW||0,u_rot4dYW:e.rot4dYW||0,u_rot4dZW:e.rot4dZW||0,u_dimension:e.dimension||3.5,u_gridDensity:e.gridDensity||15,u_morphFactor:e.morphFactor||1,u_chaos:e.chaos||.2,u_speed:e.speed||1,u_hue:e.hue||320,u_intensity:e.intensity||.6,u_saturation:e.saturation||.8,u_mouseIntensity:0,u_clickIntensity:this.colorBurstIntensity||0,u_bass:t.bass||0,u_mid:t.mid||0,u_high:t.high||0}}_renderBridgeFrame(){if(!this._multiCanvasBridge||!this._multiCanvasBridge.initialized)return;this._bridgeTime+=16;const e=this._buildSharedUniforms();for(const t of this._multiCanvasBridge.layerNames){const i=this._multiCanvasBridge.getBridge(t);i&&i.canvas&&this._multiCanvasBridge.setLayerUniforms(t,{u_resolution:[i.canvas.width,i.canvas.height]})}this._multiCanvasBridge.setSharedUniforms(e),this._multiCanvasBridge.renderAll("holographic",{clearColor:[0,0,0,0]})}setActive(e){if(this.isActive=e,e){if(!this.canvasOverride){const t=document.getElementById("holographicLayers");t&&(t.style.display="block")}!this.audioEnabled&&window.audioEnabled===!0&&this.initAudio(),console.log("🌌 REAL Active Holograms ACTIVATED with audio reactivity")}else{if(!this.canvasOverride){const t=document.getElementById("holographicLayers");t&&(t.style.display="none")}console.log("🌌 REAL Active Holograms DEACTIVATED")}}updateVariantDisplay(){const e=this.variantNames[this.currentVariant];return{variant:this.currentVariant,name:e,geometryType:Math.floor(this.currentVariant/4)}}nextVariant(){this.updateVariant(this.currentVariant+1)}previousVariant(){this.updateVariant(this.currentVariant-1)}randomVariant(){const e=Math.floor(Math.random()*this.totalVariants);this.updateVariant(e)}setVariant(e){this.updateVariant(e)}updateParameter(e,t){this.customParams||(this.customParams={}),this.customParams[e]=t;const i={...this._buildKeystoneParams(),[e]:t},r=this._layerGraph.resolveAll(i,Date.now());this.visualizers.forEach((s,o)=>{const a=s.role||"content",n=r[a]||i;try{s.updateParameters?s.updateParameters(n):s.variantParams&&(Object.assign(s.variantParams,n),(e==="geometryType"||e==="geometry")&&(s.roleParams=s.generateRoleParams(a)))}catch(l){console.error(`Failed to update holographic layer ${o} (${a}):`,l)}})}updateParameters(e){if(!e||typeof e!="object")return;this.customParams||(this.customParams={}),Object.assign(this.customParams,e);const t={...this._buildKeystoneParams(),...e},i=this._layerGraph.resolveAll(t,Date.now());this.visualizers.forEach((r,s)=>{const o=r.role||"content",a=i[o]||t;try{r.updateParameters?r.updateParameters(a):r.variantParams&&Object.assign(r.variantParams,a)}catch(n){console.error(`Failed to update holographic layer ${s} (${o}):`,n)}})}_buildKeystoneParams(){const e={},t=this.visualizers.find(i=>i.role==="content");return t&&t.variantParams&&Object.assign(e,t.variantParams),this.customParams&&Object.assign(e,this.customParams),e}get layerGraph(){return this._layerGraph}loadRelationshipProfile(e){this._layerGraph.loadProfile(e)}setKeystone(e){this._layerGraph.setKeystone(e)}setLayerRelationship(e,t){this._layerGraph.setRelationship(e,t)}updateVariant(e){e<0&&(e=this.totalVariants-1),e>=this.totalVariants&&(e=0),this.currentVariant=e,this.visualizers.forEach(t=>{t.variant=this.currentVariant,t.variantParams=t.generateVariantParams(this.currentVariant),t.roleParams=t.generateRoleParams(t.role),this.customParams&&Object.keys(this.customParams).forEach(i=>{t.variantParams[i]=this.customParams[i]})}),this.updateVariantDisplay(),console.log(`🔄 REAL Holograms switched to variant ${this.currentVariant+1}: ${this.variantNames[this.currentVariant]}`)}getCurrentVariantInfo(){return{variant:this.currentVariant,name:this.variantNames[this.currentVariant],geometryType:Math.floor(this.currentVariant/4)}}getParameters(){var t,i,r,s,o,a,n,l,c,h;const e={geometry:Math.floor(this.currentVariant/4),gridDensity:parseFloat(((t=document.getElementById("gridDensity"))==null?void 0:t.value)||15),morphFactor:parseFloat(((i=document.getElementById("morphFactor"))==null?void 0:i.value)||1),chaos:parseFloat(((r=document.getElementById("chaos"))==null?void 0:r.value)||.2),speed:parseFloat(((s=document.getElementById("speed"))==null?void 0:s.value)||1),hue:parseFloat(((o=document.getElementById("hue"))==null?void 0:o.value)||320),intensity:parseFloat(((a=document.getElementById("intensity"))==null?void 0:a.value)||.6),saturation:parseFloat(((n=document.getElementById("saturation"))==null?void 0:n.value)||.8),rot4dXW:parseFloat(((l=document.getElementById("rot4dXW"))==null?void 0:l.value)||0),rot4dYW:parseFloat(((c=document.getElementById("rot4dYW"))==null?void 0:c.value)||0),rot4dZW:parseFloat(((h=document.getElementById("rot4dZW"))==null?void 0:h.value)||0),variant:this.currentVariant};return this.customParams&&Object.assign(e,this.customParams),e.layerRelationship=this._layerGraph.exportConfig(),e}async initAudio(){try{this.audioContext=new(window.AudioContext||window.webkitAudioContext),this.audioContext.state==="suspended"&&await this.audioContext.resume(),this.analyser=this.audioContext.createAnalyser(),this.analyser.fftSize=256,this.frequencyData=new Uint8Array(this.analyser.frequencyBinCount);const e={audio:{echoCancellation:!1,noiseSuppression:!1,autoGainControl:!1,sampleRate:44100}},t=await navigator.mediaDevices.getUserMedia(e);this._audioStream=t,this.audioContext.createMediaStreamSource(t).connect(this.analyser),this.audioEnabled=!0,console.log("REAL Holograms audio reactivity enabled")}catch(e){console.error("REAL Holograms audio initialization failed:",e)}}disableAudio(){this.audioEnabled&&(this.audioEnabled=!1,this._audioStream&&(this._audioStream.getTracks().forEach(e=>e.stop()),this._audioStream=null),this.audioContext&&(this.audioContext.close().catch(()=>{}),this.audioContext=null),this.analyser=null,this.frequencyData=null,this.audioData={bass:0,mid:0,high:0},console.log("REAL Holograms audio reactivity disabled"))}updateAudio(){if(!this.audioEnabled||!this.analyser||!this.isActive||window.audioEnabled===!1)return;this.analyser.getByteFrequencyData(this.frequencyData);const e=Math.floor(this.frequencyData.length*.1),t=Math.floor(this.frequencyData.length*.4);let i=0,r=0,s=0;for(let a=0;a<e;a++)i+=this.frequencyData[a];i/=e*255;for(let a=e;a<t;a++)r+=this.frequencyData[a];r/=(t-e)*255;for(let a=t;a<this.frequencyData.length;a++)s+=this.frequencyData[a];s/=(this.frequencyData.length-t)*255;const o={bass:this.smoothAudioValue(i,"bass"),mid:this.smoothAudioValue(r,"mid"),high:this.smoothAudioValue(s,"high"),energy:(i+r+s)/3,rhythm:this.detectRhythm(i),melody:this.detectMelody(r,s)};this.audioData=o,window.audioReactivitySettings&&this.applyAudioReactivityGrid(o),this.visualizers.forEach(a=>{a.updateAudio(this.audioData)})}smoothAudioValue(e,t){this.audioSmoothing||(this.audioSmoothing={bass:0,mid:0,high:0});const i=.4;return this.audioSmoothing[t]=this.audioSmoothing[t]*i+e*(1-i),this.audioSmoothing[t]>.05?this.audioSmoothing[t]:0}detectRhythm(e){this.previousBass||(this.previousBass=0);const t=e>this.previousBass+.2;return this.previousBass=e,t?1:0}detectMelody(e,t){const i=(e+t)/2;return i>.3?i:0}applyAudioReactivityGrid(e){const t=window.audioReactivitySettings;if(!t||t.activeVisualModes.size===0)return;const i=t.sensitivity[t.activeSensitivity];t.activeVisualModes.forEach(r=>{const[s,o]=r.split("-"),a=t.visualModes[o];if(!a)return;const n=e.energy*i,l=e.bass*i,c=e.rhythm*i;a.forEach(h=>{let d=0;switch(h){case"hue":this.audioHueBase||(this.audioHueBase=320),this.audioHueBase+=n*5,d=this.audioHueBase%360;break;case"saturation":d=Math.min(1,.6+c*.4);break;case"intensity":d=Math.min(1,.4+n*.6);break;case"morphFactor":d=Math.min(2,1+l*1);break;case"gridDensity":d=Math.min(100,15+c*50);break;case"chaos":d=Math.min(1,n*.8);break;case"speed":d=Math.min(3,1+n*2);break;case"rot4dXW":this.audioRotationXW||(this.audioRotationXW=0),this.audioRotationXW+=l*.1,d=this.audioRotationXW%(Math.PI*2);break;case"rot4dYW":this.audioRotationYW||(this.audioRotationYW=0),this.audioRotationYW+=e.mid*i*.08,d=this.audioRotationYW%(Math.PI*2);break;case"rot4dZW":this.audioRotationZW||(this.audioRotationZW=0),this.audioRotationZW+=e.high*i*.06,d=this.audioRotationZW%(Math.PI*2);break}window.updateParameter&&d!==void 0&&window.updateParameter(h,d.toFixed(2))})})}setupCenterDistanceReactivity(){if(console.log("✨ Holographic system: AUDIO-ONLY mode (no mouse/touch reactivity)"),this.canvasOverride){console.log("✨ Holographic reactivity skipped (single-canvas override mode)");return}if(!this.useBuiltInReactivity){console.log("✨ Holographic built-in reactivity DISABLED - ReactivityManager active");return}console.log("🎵 Holographic system will respond to audio input only")}updateHolographicShimmer(e,t){const i=(e-.5)*Math.PI,r=(t-.5)*Math.PI,s=320,a=Math.sin(i*2)*Math.cos(r*2)*120,n=(s+a+360)%360,l=.4+.5*Math.abs(Math.sin(i)*Math.cos(r)),c=.7+.3*Math.abs(Math.cos(i*1.5)*Math.sin(r*1.5)),h=1+.15*Math.sin(i*.8)*Math.cos(r*.8);window.updateParameter&&(window.updateParameter("hue",Math.round(n)),window.updateParameter("intensity",l.toFixed(2)),window.updateParameter("saturation",c.toFixed(2)),window.updateParameter("morphFactor",h.toFixed(2)))}triggerHolographicColorBurst(e,t){this.colorBurstIntensity=1,this.burstHueShift=180,this.burstIntensityBoost=.7,this.burstSaturationSpike=.8,this.burstChaosEffect=.6,this.burstSpeedBoost=1.8}startHolographicColorBurstLoop(){this._burstLoopActive=!0;const e=()=>{if(this._burstLoopActive){if(this.colorBurstIntensity>.01){const t=this.colorBurstIntensity;if(this.burstHueShift>1){const s=(320+this.burstHueShift*Math.sin(t*Math.PI*2))%360;window.updateParameter&&window.updateParameter("hue",Math.round(s)),this.burstHueShift*=.93}if(this.burstIntensityBoost>.01){const r=Math.min(1,.5+this.burstIntensityBoost*t);window.updateParameter&&window.updateParameter("intensity",r.toFixed(2)),this.burstIntensityBoost*=.92}if(this.burstSaturationSpike>.01){const r=Math.min(1,.8+this.burstSaturationSpike*t);window.updateParameter&&window.updateParameter("saturation",r.toFixed(2)),this.burstSaturationSpike*=.91}if(this.burstChaosEffect>.01){const r=.2+this.burstChaosEffect*t;window.updateParameter&&window.updateParameter("chaos",r.toFixed(2)),this.burstChaosEffect*=.9}if(this.burstSpeedBoost>.01){const r=1+this.burstSpeedBoost*t;window.updateParameter&&window.updateParameter("speed",r.toFixed(2)),this.burstSpeedBoost*=.89}this.colorBurstIntensity*=.94}this._burstRafId=requestAnimationFrame(e)}};this._burstRafId=requestAnimationFrame(e)}startRenderLoop(){this._renderLoopActive=!0;const e=()=>{this._renderLoopActive&&(this.isActive&&(this.updateAudio(),this._renderMode==="bridge"?this._renderBridgeFrame():this.visualizers.forEach(t=>{t.render()})),this._renderRafId=requestAnimationFrame(e))};this._renderRafId=requestAnimationFrame(e),console.log(`REAL Holographic render loop started (${this._renderMode} mode)`)}getVariantName(e=this.currentVariant){return this.variantNames[e]||"UNKNOWN"}destroy(){this.isActive=!1,this._renderLoopActive=!1,this._renderRafId&&(cancelAnimationFrame(this._renderRafId),this._renderRafId=null),this._burstLoopActive=!1,this._burstRafId&&(cancelAnimationFrame(this._burstRafId),this._burstRafId=null),this._multiCanvasBridge&&(this._multiCanvasBridge.dispose(),this._multiCanvasBridge=null),this._renderMode="direct",this.visualizers.forEach(e=>{e.destroy&&e.destroy()}),this.visualizers=[],this.audioContext&&this.audioContext.close(),console.log("REAL Holographic System destroyed")}init(e={}){const t=e.canvas||(e.canvasId?document.getElementById(e.canvasId):null);return t&&(this.canvasOverride=t,this.visualizers.forEach(i=>i.destroy&&i.destroy()),this.visualizers=[]),this.visualizers.length>0?!0:(this.initialize(),this.visualizers.length>0)}resize(e,t,i=1){this._renderMode==="bridge"&&this._multiCanvasBridge?this._multiCanvasBridge.resizeAll(e,t,i):this.visualizers.forEach(r=>{r.canvas&&r.gl&&(r.canvas.width=e*i,r.canvas.height=t*i,r.canvas.style.width=`${e}px`,r.canvas.style.height=`${t}px`,r.gl.viewport(0,0,r.canvas.width,r.canvas.height))}),console.log(`🌌 Holographic resized to ${e}x${t} @${i}x`)}render(e={}){e.params&&Object.keys(e.params).forEach(t=>{this.updateParameter(t,e.params[t])}),e.audio&&(this.audioData=e.audio),this._renderMode==="bridge"?this._renderBridgeFrame():this.visualizers.forEach(t=>{t.render&&t.render()})}getBackendType(){return this._renderMode==="bridge"&&this._multiCanvasBridge?this._multiCanvasBridge.backendType||"bridge":"direct-webgl"}dispose(){this.disableAudio(),this.destroy()}}const M=`
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`,G=`
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
            // Tetrahedron lattice — tetrahedral symmetry planes
            float d = u_gridDensity * 0.08;
            vec3 c1 = normalize(vec3(1.0, 1.0, 1.0));
            vec3 c2 = normalize(vec3(-1.0, -1.0, 1.0));
            vec3 c3 = normalize(vec3(-1.0, 1.0, -1.0));
            vec3 c4 = normalize(vec3(1.0, -1.0, -1.0));
            vec3 q = fract(p.xyz * d + 0.5) - 0.5;
            float minPlane = min(min(abs(dot(q, c1)), abs(dot(q, c2))),
                                 min(abs(dot(q, c3)), abs(dot(q, c4))));
            return (1.0 - smoothstep(0.0, 0.05, minPlane)) * u_morphFactor;
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
`,le=`
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
        // Tetrahedron — tetrahedral symmetry planes
        let c1 = normalize(vec3<f32>(1.0, 1.0, 1.0));
        let c2 = normalize(vec3<f32>(-1.0, -1.0, 1.0));
        let c3 = normalize(vec3<f32>(-1.0, 1.0, -1.0));
        let c4 = normalize(vec3<f32>(1.0, -1.0, -1.0));
        let q = fract(p.xyz * d + 0.5) - 0.5;
        let minPlane = min(min(abs(dot(q, c1)), abs(dot(q, c2))),
                           min(abs(dot(q, c3)), abs(dot(q, c4))));
        return (1.0 - smoothstep(0.0, 0.05, minPlane)) * u.morphFactor;
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
`;class ue{constructor(){this.bridge=null,this.canvas=null,this.gl=null,this.program=null,this.params={},this.initialized=!1,this.contextLost=!1,this._animFrame=null,this._time=0,this._running=!1,this._quadBuffer=null,this._uniformLocations={},this._useDirectGL=!1}initDirect(e){this.canvas=e;try{this.gl=e.getContext("webgl2")||e.getContext("webgl")}catch(s){return console.warn("FacetedSystem: WebGL context creation failed",s),!1}if(!this.gl)return console.warn("FacetedSystem: WebGL not available"),!1;if(this.program=this._compileProgram(this.gl,M,G),!this.program)return console.error("FacetedSystem: Shader compilation failed"),!1;const t=new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]);this._quadBuffer=this.gl.createBuffer(),this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this._quadBuffer),this.gl.bufferData(this.gl.ARRAY_BUFFER,t,this.gl.STATIC_DRAW);const i=this.gl,r=i.getProgramParameter(this.program,i.ACTIVE_UNIFORMS);for(let s=0;s<r;s++){const o=i.getActiveUniform(this.program,s);o&&(this._uniformLocations[o.name]=i.getUniformLocation(this.program,o.name))}return this._useDirectGL=!0,this.initialized=!0,this.start(),!0}_compileProgram(e,t,i){const r=this._compileShader(e,e.VERTEX_SHADER,t),s=this._compileShader(e,e.FRAGMENT_SHADER,i);if(!r||!s)return null;const o=e.createProgram();return e.attachShader(o,r),e.attachShader(o,s),e.linkProgram(o),e.getProgramParameter(o,e.LINK_STATUS)?(e.deleteShader(r),e.deleteShader(s),o):(console.error("FacetedSystem link error:",e.getProgramInfoLog(o)),null)}_compileShader(e,t,i){const r=e.createShader(t);return e.shaderSource(r,i),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(console.error("FacetedSystem shader error:",e.getShaderInfoLog(r)),e.deleteShader(r),null)}async initWithBridge(e,t){this.canvas=e;try{if(this.bridge=await B.create(e,t),this.bridge)return this.bridge.compileShader("faceted",{glslVertex:M,glslFragment:G,wgslFragment:le})?(this.initialized=!0,this.start(),!0):(console.error("Faceted shader compilation failed"),!1)}catch(i){console.error("Faceted initWithBridge failed:",i)}return!1}async initialize(e={}){if(this.initialized)return!0;const t=e.canvas||document.getElementById("faceted-content-canvas")||document.getElementById("content-canvas");return t?this.initWithBridge(t,{preferWebGPU:e.preferWebGPU!==void 0?e.preferWebGPU:!0,debug:e.debug||!1}):(console.warn("FacetedSystem: No canvas found for initialize()"),!1)}updateParameters(e){e&&(this.params={...this.params,...e})}_buildUniforms(){var t,i;const e=this.params;return{u_time:this._time,u_resolution:[((t=this.canvas)==null?void 0:t.width)||800,((i=this.canvas)==null?void 0:i.height)||600],u_geometry:e.geometry??0,u_rot4dXY:e.rot4dXY??0,u_rot4dXZ:e.rot4dXZ??0,u_rot4dYZ:e.rot4dYZ??0,u_rot4dXW:e.rot4dXW??0,u_rot4dYW:e.rot4dYW??0,u_rot4dZW:e.rot4dZW??0,u_dimension:e.dimension??3.5,u_gridDensity:e.gridDensity??15,u_morphFactor:e.morphFactor??1,u_chaos:e.chaos??.2,u_speed:e.speed??1,u_hue:e.hue??200,u_intensity:e.intensity??.7,u_saturation:e.saturation??.8,u_mouseIntensity:e.mouseIntensity??0,u_clickIntensity:e.clickIntensity??0,u_bass:e.bass??0,u_mid:e.mid??0,u_high:e.high??0,u_breath:e.breath??0,u_mouse:e.mouse??[.5,.5]}}start(){this._running||(this._running=!0,this._renderLoop())}stop(){this._running=!1,this._animFrame&&(cancelAnimationFrame(this._animFrame),this._animFrame=null)}_renderLoop(){this._running&&(this._time+=16*(this.params.speed??1),this._useDirectGL?this._renderDirectGL():this.bridge&&(this.bridge.setUniforms(this._buildUniforms()),this.bridge.render("faceted",{clear:!0,clearColor:[0,0,0,1]})),this._animFrame=requestAnimationFrame(()=>this._renderLoop()))}_renderDirectGL(){const e=this.gl;if(!e||!this.program)return;e.useProgram(this.program),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT);const t=this._buildUniforms();for(const[r,s]of Object.entries(t)){const o=this._uniformLocations[r];o!=null&&(Array.isArray(s)?s.length===2?e.uniform2fv(o,s):s.length===3?e.uniform3fv(o,s):s.length===4&&e.uniform4fv(o,s):e.uniform1f(o,s))}e.bindBuffer(e.ARRAY_BUFFER,this._quadBuffer);const i=e.getAttribLocation(this.program,"a_position");i>=0&&(e.enableVertexAttribArray(i),e.vertexAttribPointer(i,2,e.FLOAT,!1,0,0)),e.drawArrays(e.TRIANGLES,0,6)}render(){this._useDirectGL?this._renderDirectGL():this.bridge&&(this.bridge.setUniforms(this._buildUniforms()),this.bridge.render("faceted",{clear:!0,clearColor:[0,0,0,1]}))}getBackendType(){return this._useDirectGL?"webgl":this.bridge?this.bridge.getBackendType():"none"}setActive(e){e?this.start():this.stop();const t=document.getElementById("faceted-layer");t&&(t.style.display=e?"block":"none")}init(e={}){return this.initialize(e)}resize(e,t,i=1){const r=Math.floor(e*i),s=Math.floor(t*i);this.canvas&&(this.canvas.width=r,this.canvas.height=s),this._useDirectGL&&this.gl?this.gl.viewport(0,0,r,s):this.bridge&&this.bridge.resize&&this.bridge.resize(e,t,i)}dispose(){this.destroy()}destroy(){this.stop(),this._useDirectGL&&this.gl&&(this.program&&this.gl.deleteProgram(this.program),this._quadBuffer&&this.gl.deleteBuffer(this._quadBuffer),this.gl=null,this.program=null,this._quadBuffer=null),this.bridge&&(this.bridge.dispose(),this.bridge=null),this.initialized=!1,this._useDirectGL=!1}}export{ue as F,O as P,ce as Q,he as R};
//# sourceMappingURL=FacetedSystem-PaU9wK_B.js.map
