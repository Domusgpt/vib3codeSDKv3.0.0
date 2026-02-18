// ============================================================================
// VIB3+ WEAPON SKIN FORGE
// ============================================================================
'use strict';

// ── Shared VIB3+ Math & Geometry (from synesthesia.html) ──
const SHARED_GLSL = `
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_geometry;
uniform float u_rot4dXY, u_rot4dXZ, u_rot4dYZ, u_rot4dXW, u_rot4dYW, u_rot4dZW;
uniform float u_dimension, u_gridDensity, u_morphFactor, u_chaos, u_speed;
uniform float u_hue, u_intensity, u_saturation;
uniform float u_mouseIntensity, u_clickIntensity;
uniform vec2 u_mouse;
uniform int u_weaponType; // 0=Knife, 1=Pistol, 2=Rifle, 3=Sniper, 4=Sword
uniform vec2 u_cursorPos; // Normalized cursor position for glow

// 6D rotation matrices
mat4 rotXY(float t){float c=cos(t),s=sin(t);return mat4(c,-s,0,0,s,c,0,0,0,0,1,0,0,0,0,1);}
mat4 rotXZ(float t){float c=cos(t),s=sin(t);return mat4(c,0,s,0,0,1,0,0,-s,0,c,0,0,0,0,1);}
mat4 rotYZ(float t){float c=cos(t),s=sin(t);return mat4(1,0,0,0,0,c,-s,0,0,s,c,0,0,0,0,1);}
mat4 rotXW(float t){float c=cos(t),s=sin(t);return mat4(c,0,0,-s,0,1,0,0,0,0,1,0,s,0,0,c);}
mat4 rotYW(float t){float c=cos(t),s=sin(t);return mat4(1,0,0,0,0,c,0,-s,0,0,1,0,0,s,0,c);}
mat4 rotZW(float t){float c=cos(t),s=sin(t);return mat4(1,0,0,0,0,1,0,0,0,0,c,-s,0,0,s,c);}

vec4 rot6D(vec4 p){
  p=rotXY(u_rot4dXY)*p; p=rotXZ(u_rot4dXZ)*p; p=rotYZ(u_rot4dYZ)*p;
  p=rotXW(u_rot4dXW)*p; p=rotYW(u_rot4dYW)*p; p=rotZW(u_rot4dZW)*p;
  return p;
}

vec3 proj4D(vec4 p){float w=u_dimension/(u_dimension+p.w);return p.xyz*w;}

// ── SDF Primitives ──
float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}
float sdCircle(vec2 p, float r) { return length(p) - r; }
float sdTri(vec2 p, float r) {
    const float k = sqrt(3.0);
    p.x = abs(p.x) - r;
    p.y = p.y + r/k;
    if( p.x+k*p.y>0.0 ) p = vec2(p.x-k*p.y,-k*p.x-p.y)/2.0;
    p.x -= clamp( p.x, -2.0*r, 0.0 );
    return -length(p)*sign(p.y);
}
// Rotation for SDF construction
mat2 rot2D(float a) { float s=sin(a), c=cos(a); return mat2(c,-s,s,c); }

// ── Weapon SDFs ──
// All defined in roughly -1.5 to 1.5 range

float sdfKnife(vec2 p) {
    // Handle
    float d = sdBox(p - vec2(-0.6, 0.0), vec2(0.3, 0.08));
    // Guard
    d = min(d, sdBox(p - vec2(-0.25, 0.0), vec2(0.05, 0.15)));
    // Blade
    vec2 bp = p - vec2(0.3, 0.0);
    float blade = max(sdBox(bp, vec2(0.5, 0.07)), -bp.y - 0.07 + bp.x*0.15); // Taper top
    // Pointy tip
    blade = max(blade, dot(bp-vec2(0.5,0.0), vec2(0.7,0.7)));
    return min(d, blade);
}

float sdfPistol(vec2 p) {
    // Grip
    vec2 gp = (p - vec2(-0.4, -0.3)) * rot2D(0.2);
    float d = sdBox(gp, vec2(0.15, 0.3));
    // Body/Barrel
    d = min(d, sdBox(p - vec2(0.0, 0.15), vec2(0.5, 0.12)));
    // Trigger guard
    float tg = max(sdCircle(p - vec2(-0.2, -0.1), 0.15), -sdCircle(p - vec2(-0.2, -0.1), 0.13));
    tg = max(tg, -p.y + 0.05); // Cut top
    d = min(d, tg);
    // Sights
    d = min(d, sdBox(p - vec2(-0.45, 0.28), vec2(0.05, 0.04)));
    d = min(d, sdBox(p - vec2(0.45, 0.28), vec2(0.02, 0.02)));
    return d;
}

float sdfRifle(vec2 p) {
    // Stock
    float d = sdBox(p - vec2(-0.8, -0.1), vec2(0.3, 0.15));
    // Body
    d = min(d, sdBox(p - vec2(-0.2, 0.0), vec2(0.4, 0.12)));
    // Grip
    vec2 gp = (p - vec2(-0.4, -0.25)) * rot2D(0.2);
    d = min(d, sdBox(gp, vec2(0.08, 0.2)));
    // Mag
    vec2 mp = (p - vec2(0.0, -0.3)) * rot2D(-0.1);
    d = min(d, sdBox(mp, vec2(0.1, 0.25)));
    // Barrel
    d = min(d, sdBox(p - vec2(0.5, 0.05), vec2(0.4, 0.04)));
    // Handguard
    d = min(d, sdBox(p - vec2(0.4, 0.0), vec2(0.25, 0.08)));
    return d;
}

float sdfSniper(vec2 p) {
    // Stock
    float d = sdBox(p - vec2(-0.9, -0.05), vec2(0.3, 0.12));
    // Body
    d = min(d, sdBox(p - vec2(-0.3, 0.0), vec2(0.3, 0.1)));
    // Grip
    vec2 gp = (p - vec2(-0.5, -0.2)) * rot2D(0.3);
    d = min(d, sdBox(gp, vec2(0.07, 0.15)));
    // Barrel (Long)
    d = min(d, sdBox(p - vec2(0.4, 0.0), vec2(0.7, 0.035)));
    // Muzzle break
    d = min(d, sdBox(p - vec2(1.1, 0.0), vec2(0.08, 0.06)));
    // Scope
    d = min(d, sdBox(p - vec2(-0.1, 0.25), vec2(0.25, 0.04)));
    d = min(d, sdBox(p - vec2(-0.35, 0.25), vec2(0.02, 0.06))); // Scope mount
    d = min(d, sdBox(p - vec2(0.15, 0.25), vec2(0.02, 0.06))); // Scope mount
    return d;
}

float sdfSword(vec2 p) {
    // Handle
    float d = sdBox(p - vec2(-0.8, 0.0), vec2(0.2, 0.06));
    // Pommel
    d = min(d, sdCircle(p - vec2(-1.05, 0.0), 0.08));
    // Guard
    d = min(d, sdBox(p - vec2(-0.55, 0.0), vec2(0.05, 0.3)));
    // Blade
    vec2 bp = p - vec2(0.2, 0.0);
    float blade = max(sdBox(bp, vec2(0.7, 0.08)), -bp.x*0.1 - 0.04 + abs(bp.y)); // Taper
    // Tip
    blade = max(blade, dot(bp-vec2(0.7,0.0), vec2(0.7,0.7))); // Point
    return min(d, blade);
}

float getWeaponSDF(vec2 p, int type) {
    if (type == 0) return sdfKnife(p);
    if (type == 1) return sdfPistol(p);
    if (type == 2) return sdfRifle(p);
    if (type == 3) return sdfSniper(p);
    if (type == 4) return sdfSword(p);
    return length(p) - 0.5; // Fallback sphere
}

// ── VIB3+ Geometry Functions (Simplified from FacetedSystem) ──
vec3 applyCoreWarp(vec3 p,float gt){
  // Basic warp logic placeholder for demo
  return p;
}

float hypercubeLattice(vec3 p,float gs){
  vec3 g=fract(p*gs),ed=min(g,1.0-g);
  float me=min(min(ed.x,ed.y),ed.z);
  return 1.0-smoothstep(0.0,0.03,me);
}

float geoFunc(vec4 p4){
    vec3 p3 = proj4D(p4);
    // Simple 4D lattice for demo
    float gs = u_gridDensity * 0.08;
    // Mix different lattices based on geometry index for variety
    float val = hypercubeLattice(p3, gs);
    if (mod(u_geometry, 3.0) > 1.0) {
        // Sphere-like
        vec3 c=fract(p3*gs)-0.5;
        val = 1.0-smoothstep(0.15,0.25,length(c));
    }
    return val * u_morphFactor;
}

vec3 hsl2rgb(float h,float s,float l){
  float c2=(1.0-abs(2.0*l-1.0))*s,hp=h*6.0,x=c2*(1.0-abs(mod(hp,2.0)-1.0)),m=l-c2*0.5;
  vec3 rgb;
  if(hp<1.0) rgb=vec3(c2,x,0); else if(hp<2.0) rgb=vec3(x,c2,0);
  else if(hp<3.0) rgb=vec3(0,c2,x); else if(hp<4.0) rgb=vec3(0,x,c2);
  else if(hp<5.0) rgb=vec3(x,0,c2); else rgb=vec3(c2,0,x);
  return rgb+m;
}
`;

// ── Fragment Shader Main ──
const FRAG_MAIN = SHARED_GLSL + `
void main(){
  vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / min(u_resolution.x, u_resolution.y);
  vec2 p = uv * 3.0; // Scale to SDF space

  // 1. Calculate Weapon SDF Mask
  float d = getWeaponSDF(p, u_weaponType);

  // 2. Glow / Outline
  float glow = 1.0 - smoothstep(0.0, 0.1, abs(d)); // Edge glow
  float inside = 1.0 - smoothstep(0.0, 0.01, d);   // Inside mask

  // Mouse proximity glow
  float mouseDist = length(uv - (u_mouse - 0.5) * vec2(u_resolution.x/u_resolution.y, 1.0));
  float cursorGlow = exp(-mouseDist * 3.0);

  // 3. VIB3+ Pattern (only calculate if inside or near edge)
  vec3 col = vec3(0.0);

  if (inside > 0.0 || glow > 0.0) {
      float ts = u_time * 0.0001 * u_speed;
      vec4 pos = vec4(p, sin(ts*3.0), cos(ts*2.0));

      // Shockwave ripple from click
      float ripple = sin(length(p)*10.0 - u_time*0.01 * u_clickIntensity * 50.0) * u_clickIntensity;
      pos.xyz += ripple * 0.1;

      pos = rot6D(pos);
      float val = geoFunc(pos);

      // Noise/Chaos
      float noise = sin(pos.x*7.0)*cos(pos.y*11.0)*sin(pos.z*13.0);
      val += noise * u_chaos;

      float gi = 1.0 - clamp(abs(val), 0.0, 1.0);
      float fi = gi * u_intensity;

      // Coloring
      float h = fract(u_hue + val * 0.1);
      col = hsl2rgb(h, u_saturation, 0.5 * fi);

      // Add edge glow
      col += hsl2rgb(fract(h+0.5), 1.0, 0.8) * glow * (0.5 + cursorGlow);
  }

  // Masking
  if (d > 0.05) discard; // Hard cut for background

  // Composite with background (soft edge)
  float alpha = smoothstep(0.01, 0.0, d);
  gl_FragColor = vec4(col, alpha);
}`;

const VERT = `attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.0,1.0);}`;

// ============================================================================
// APP LOGIC
// ============================================================================

const canvas = document.getElementById('gl-canvas');
const gl = canvas.getContext('webgl', { alpha: true, antialias: true });

// State
const S = {
    weapon: 2, // Rifle
    system: 0,
    geometry: 9,
    hue: 0.04, // Dragon Fire orange
    chaos: 0.6,
    density: 45,
    morph: 0.8,
    speed: 1.0,
    intensity: 1.0,
    rot: [0,0,0,0,0,0],
    comparisonMode: false,
    presetA: null, // Stores state for Left side
    presetB: null  // Stores state for Right side (current UI)
};

// Initial Presets (matching summary)
const PRESETS = {
    'dragon_fire': { weapon: 2, system: 0, geometry: 9, hue: 0.04, chaos: 0.6, density: 45, morph: 0.8 },
    'void_crystal': { weapon: 4, system: 1, geometry: 5, hue: 0.75, chaos: 0.2, density: 80, morph: 0.4 },
    'neon_rain': { weapon: 1, system: 2, geometry: 12, hue: 0.33, chaos: 0.8, density: 60, morph: 1.2 }
};

let program = null;
let startTime = performance.now();
let mouse = { x: 0.5, y: 0.5, click: 0 };

function initGL() {
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, VERT);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, FRAG_MAIN);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(fs));
        return;
    }

    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
}

function resize() {
    canvas.width = canvas.parentElement.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.parentElement.clientHeight * window.devicePixelRatio;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function updateUniforms(state) {
    const u = (name, v) => {
        const loc = gl.getUniformLocation(program, name);
        if (loc) gl.uniform1f(loc, v);
    };

    gl.uniform1f(gl.getUniformLocation(program, 'u_time'), performance.now() - startTime);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvas.width, canvas.height);
    gl.uniform2f(gl.getUniformLocation(program, 'u_mouse'), mouse.x, mouse.y);
    gl.uniform1i(gl.getUniformLocation(program, 'u_weaponType'), state.weapon);

    u('u_geometry', state.geometry);
    u('u_rot4dXY', state.rot[0]); u('u_rot4dXZ', state.rot[1]); u('u_rot4dYZ', state.rot[2]);
    u('u_rot4dXW', state.rot[3]); u('u_rot4dYW', state.rot[4]); u('u_rot4dZW', state.rot[5]);
    u('u_dimension', 3.5);
    u('u_gridDensity', state.density);
    u('u_morphFactor', state.morph);
    u('u_chaos', state.chaos);
    u('u_speed', state.speed);
    u('u_hue', state.hue);
    u('u_intensity', state.intensity);
    u('u_saturation', 0.8);
    u('u_clickIntensity', mouse.click);
}

function render() {
    requestAnimationFrame(render);

    // Auto-rotate
    S.rot[0] += 0.005 * S.speed;
    S.rot[3] += 0.003 * S.speed;
    S.rot[5] += 0.002 * S.speed;

    // Click decay
    mouse.click *= 0.95;

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (S.comparisonMode && S.presetA) {
        // Render Left (Preset A)
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(0, 0, canvas.width / 2, canvas.height);
        updateUniforms(S.presetA);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Render Right (Current S)
        gl.scissor(canvas.width / 2, 0, canvas.width / 2, canvas.height);
        updateUniforms(S);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.disable(gl.SCISSOR_TEST);
    } else {
        // Fullscreen render
        updateUniforms(S);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}

// ── UI Binding ──

function bindControl(id, key, displayId, scale=1) {
    const el = document.getElementById(id);
    const disp = document.getElementById(displayId);
    if (!el) return;
    el.addEventListener('input', e => {
        S[key] = parseFloat(e.target.value) * scale;
        if (disp) disp.innerText = S[key].toFixed(2);
    });
}

function updateUI() {
    document.getElementById('system-select').value = S.system;
    document.getElementById('geometry').value = S.geometry;
    document.getElementById('hue').value = S.hue;
    document.getElementById('chaos').value = S.chaos;
    document.getElementById('density').value = S.density;
    document.getElementById('morph').value = S.morph;

    document.getElementById('geo-val').innerText = S.geometry;
    document.getElementById('hue-val').innerText = S.hue.toFixed(2);
    document.getElementById('chaos-val').innerText = S.chaos.toFixed(2);
    document.getElementById('density-val').innerText = S.density;
    document.getElementById('morph-val').innerText = S.morph.toFixed(2);

    // Update weapon buttons
    document.querySelectorAll('.weapon-btn').forEach(btn => {
        btn.classList.toggle('active',
            (btn.dataset.weapon === 'knife' && S.weapon === 0) ||
            (btn.dataset.weapon === 'pistol' && S.weapon === 1) ||
            (btn.dataset.weapon === 'rifle' && S.weapon === 2) ||
            (btn.dataset.weapon === 'sniper' && S.weapon === 3) ||
            (btn.dataset.weapon === 'sword' && S.weapon === 4)
        );
    });
}

function loadPreset(name) {
    const p = PRESETS[name];
    if (p) {
        Object.assign(S, p);
        updateUI();
    }
}

// Listeners
window.addEventListener('resize', resize);
document.getElementById('system-select').addEventListener('change', e => S.system = parseInt(e.target.value));
bindControl('geometry', 'geometry', 'geo-val');
bindControl('hue', 'hue', 'hue-val');
bindControl('chaos', 'chaos', 'chaos-val');
bindControl('density', 'density', 'density-val');
bindControl('morph', 'morph', 'morph-val');

// Weapon buttons
const weaponMap = { 'knife': 0, 'pistol': 1, 'rifle': 2, 'sniper': 3, 'sword': 4 };
document.querySelectorAll('.weapon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        S.weapon = weaponMap[btn.dataset.weapon];
        updateUI();
    });
});

// Preset cards
document.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', () => loadPreset(card.dataset.preset));
});

// Comparison
document.getElementById('compare-btn').addEventListener('click', () => {
    S.comparisonMode = !S.comparisonMode;
    document.querySelector('.comparison-divider').classList.toggle('hidden');
    if (S.comparisonMode) {
        // Snapshot current as Preset A
        S.presetA = { ...S };
        // Change current slightly to show diff
        S.hue = (S.hue + 0.5) % 1.0;
        updateUI();
    } else {
        S.presetA = null;
    }
});

// Mouse interaction
canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) / rect.width;
    mouse.y = 1.0 - (e.clientY - rect.top) / rect.height; // Flip Y
});
canvas.addEventListener('mousedown', () => mouse.click = 1.0);

// Init
initGL();
resize();
loadPreset('dragon_fire');
render();
