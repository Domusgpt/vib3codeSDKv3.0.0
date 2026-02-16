// ============================================================================
// VIB3+ SCROLL CHOREOGRAPHY ENGINE
// ============================================================================
'use strict';

// ── Shared GLSL (Same as Synesthesia/Weapon Skins) ──
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

// Geometry Functions
float hypercubeLattice(vec3 p,float gs){
  vec3 g=fract(p*gs),ed=min(g,1.0-g);
  float me=min(min(ed.x,ed.y),ed.z);
  return 1.0-smoothstep(0.0,0.03,me);
}
float sphereLattice(vec3 p,float gs){
  vec3 c=fract(p*gs)-0.5;
  return 1.0-smoothstep(0.15,0.25,length(c));
}
float fractalLattice(vec3 p,float gs){
  vec3 c=fract(p*gs);c=abs(c*2.0-1.0);
  float d=length(max(abs(c)-0.3,0.0));
  for(int i=0;i<3;i++){c=abs(c*2.0-1.0);d=min(d,length(max(abs(c)-0.3,0.0))/pow(2.0,float(i+1)));}
  return 1.0-smoothstep(0.0,0.05,d);
}

float geoFunc(vec4 p4){
    vec3 p3 = proj4D(p4);
    float gs = u_gridDensity * 0.08;
    int gt = int(mod(u_geometry, 3.0));

    float val = 0.0;
    if(gt==0) val = hypercubeLattice(p3, gs);
    else if(gt==1) val = sphereLattice(p3, gs);
    else val = fractalLattice(p3, gs);

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

// ── Fragment Shaders ──
const FRAG_FACETED = SHARED_GLSL + `
void main(){
  vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/min(u_resolution.x,u_resolution.y);
  float ts=u_time*0.0001*u_speed;
  vec4 pos=vec4(uv*3.0,sin(ts*3.0),cos(ts*2.0));
  pos=rot6D(pos);
  float val=geoFunc(pos);
  float gi=1.0-clamp(abs(val),0.0,1.0);
  vec3 col=hsl2rgb(fract(u_hue+val*0.1),u_saturation,gi*u_intensity*0.5);
  gl_FragColor=vec4(col,1.0);
}`;

const FRAG_QUANTUM = SHARED_GLSL + `
void main(){
  vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/min(u_resolution.x,u_resolution.y);
  float ts=u_time*0.0001*u_speed;
  vec4 pos=vec4(uv*3.0,sin(ts*3.0),cos(ts*2.0));
  pos=rot6D(pos);
  float val=geoFunc(pos);
  val+=sin(pos.x*10.0)*u_chaos;
  float gi=1.0-clamp(abs(val),0.0,1.0);
  gi=pow(gi,2.0);
  vec3 col=hsl2rgb(fract(u_hue+val*0.2),u_saturation,gi*u_intensity);
  gl_FragColor=vec4(col,1.0);
}`;

const FRAG_HOLOGRAPHIC = SHARED_GLSL + `
void main(){
  vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/min(u_resolution.x,u_resolution.y);
  float ts=u_time*0.0001*u_speed;
  vec4 pos=vec4(uv*3.0,sin(ts*3.0),cos(ts*2.0));
  pos=rot6D(pos);
  float val=geoFunc(pos);
  float gi=1.0-clamp(abs(val),0.0,1.0);
  gi=pow(gi,1.5);
  // Layered effect
  vec3 bg=hsl2rgb(fract(u_hue),u_saturation,0.1);
  vec3 fg=hsl2rgb(fract(u_hue+0.5),u_saturation,gi*u_intensity);
  vec3 col=bg+fg;
  gl_FragColor=vec4(col,1.0);
}`;

const VERT = `attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.0,1.0);}`;

// ============================================================================
// APP LOGIC
// ============================================================================

const canvas = document.getElementById('c');
const gl = canvas.getContext('webgl');
let programs = [];
let currentProgram = null;

// State
const S = {
    system: 0,
    targetSystem: 0,
    geometry: 1,
    targetGeometry: 1,
    hue: 0.0,
    chaos: 0.1,
    density: 20,
    morph: 1.0,
    speed: 0.5,
    intensity: 0.8,
    rot: [0,0,0,0,0,0],
    saturation: 0.8,
    crossFade: 0,
    crossFadeDir: 0
};

let startTime = performance.now();

function createProgram(fsSrc) {
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, VERT);
    gl.compileShader(vs);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fsSrc);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(fs));
        return null;
    }
    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    return p;
}

function initGL() {
    programs = [
        createProgram(FRAG_FACETED),
        createProgram(FRAG_QUANTUM),
        createProgram(FRAG_HOLOGRAPHIC)
    ];

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

    switchProgram(0);
}

function switchProgram(idx) {
    currentProgram = programs[idx];
    gl.useProgram(currentProgram);
    const aPos = gl.getAttribLocation(currentProgram, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
}

function resize() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function updateUniforms() {
    if (!currentProgram) return;
    const u = (n, v) => {
        const loc = gl.getUniformLocation(currentProgram, n);
        if (loc) gl.uniform1f(loc, v);
    };

    gl.uniform1f(gl.getUniformLocation(currentProgram, 'u_time'), performance.now() - startTime);
    gl.uniform2f(gl.getUniformLocation(currentProgram, 'u_resolution'), canvas.width, canvas.height);

    u('u_geometry', S.geometry);
    u('u_rot4dXY', S.rot[0]); u('u_rot4dXZ', S.rot[1]); u('u_rot4dYZ', S.rot[2]);
    u('u_rot4dXW', S.rot[3]); u('u_rot4dYW', S.rot[4]); u('u_rot4dZW', S.rot[5]);
    u('u_dimension', 3.5);
    u('u_gridDensity', S.density);
    u('u_morphFactor', S.morph);
    u('u_chaos', S.chaos);
    u('u_speed', S.speed);
    u('u_hue', S.hue);
    u('u_intensity', S.intensity);
    u('u_saturation', S.saturation);
}

function render() {
    requestAnimationFrame(render);

    // Auto Rotation
    S.rot[0] += 0.001 * S.speed;
    S.rot[2] += 0.002 * S.speed;

    // Smooth transitions
    S.geometry += (S.targetGeometry - S.geometry) * 0.05;

    // System Cross-fade logic
    if (S.crossFadeDir > 0) {
        S.crossFade += 0.02;
        if (S.crossFade > 0.5 && S.system !== S.targetSystem) {
            S.system = S.targetSystem;
            switchProgram(S.system);
        }
        if (S.crossFade >= 1.0) {
            S.crossFade = 0;
            S.crossFadeDir = 0;
        }
    }

    // Simulate opacity fade via intensity during transition
    const fade = S.crossFadeDir > 0 ? Math.abs(1.0 - S.crossFade * 2.0) : 1.0;
    const originalIntensity = S.intensity;
    S.intensity *= fade;

    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    updateUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    S.intensity = originalIntensity;
}

// ── Scroll & Interaction Logic ──

const sections = document.querySelectorAll('.scroll-section');

// Intersection Observer for Sections
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Fade in content
            const content = entry.target.querySelector('.content');
            if (content) content.classList.add('visible');

            // Trigger System Switch
            const sys = parseInt(entry.target.dataset.system);
            const geo = parseInt(entry.target.dataset.geo);

            if (!isNaN(sys) && sys !== S.targetSystem) {
                S.targetSystem = sys;
                S.crossFadeDir = 1;
                S.crossFade = 0;
            }

            if (!isNaN(geo)) {
                S.targetGeometry = geo;
            }
        }
    });
}, { threshold: 0.5 });

sections.forEach(s => observer.observe(s));

// Scroll Listener for Continuous Parameters
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollRatio = scrollY / docHeight;

    // Map scroll to rotation
    S.rot[3] = scrollY * 0.002; // XW rotation (4D reveal)
    S.rot[4] = scrollY * 0.001; // YW rotation

    // Map scroll to Hue
    S.hue = scrollRatio;

    // Parallax effects
    // handled by CSS for content, JS for WebGL
});

// UI Controls (Playground Section)
document.getElementById('u-hue').addEventListener('input', e => S.hue = parseFloat(e.target.value));
document.getElementById('u-chaos').addEventListener('input', e => S.chaos = parseFloat(e.target.value));
document.getElementById('u-density').addEventListener('input', e => S.density = parseFloat(e.target.value));

// Gallery Items
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
        S.targetGeometry = parseInt(item.dataset.geo);
    });
});

// Init
initGL();
resize();
window.addEventListener('resize', resize);
render();
