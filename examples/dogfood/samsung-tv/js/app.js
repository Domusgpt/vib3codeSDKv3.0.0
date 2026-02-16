// VIB3+ TV Application Logic

const canvas = document.getElementById('c');
const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'high-performance' });

// State
const S = {
    system: 0,
    geometry: 1,
    hue: 0.5,
    chaos: 0.1,
    density: 20,
    morph: 1.0,
    speed: 1.0,
    intensity: 0.8,
    rot: [0,0,0,0,0,0],
    saturation: 0.8,

    // App State
    screensaver: false,
    hudVisible: false,
    lastInput: Date.now(),
    fps: 30
};

// Modules
let audio = null;
let remote = null;
let programs = [];
let currentProgram = null;
let startTime = performance.now();
let frameCount = 0;
let lastFpsTime = 0;

// Shaders (from shaders.js)
// FRAG_FACETED, FRAG_QUANTUM, FRAG_HOLOGRAPHIC are available globally

function initGL() {
    function createProgram(fsSrc) {
        const vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, VERT);
        gl.compileShader(vs);
        const fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, fsSrc);
        gl.compileShader(fs);
        if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) return null;
        const p = gl.createProgram();
        gl.attachShader(p, vs);
        gl.attachShader(p, fs);
        gl.linkProgram(p);
        return p;
    }

    programs = [
        createProgram(FRAG_FACETED),
        createProgram(FRAG_QUANTUM),
        createProgram(FRAG_HOLOGRAPHIC)
    ];

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

    switchSystem(0);
}

function switchSystem(idx) {
    S.system = idx;
    currentProgram = programs[idx];
    gl.useProgram(currentProgram);
    const aPos = gl.getAttribLocation(currentProgram, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    showToast(`SYSTEM: ${['FACETED', 'QUANTUM', 'HOLOGRAPHIC'][idx]}`);
    updateHUD();
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

    if (audio) {
        u('u_bass', audio.bass);
        u('u_mid', audio.mid);
        u('u_high', audio.high);
    }
}

function render() {
    requestAnimationFrame(render);

    // FPS Limit (30 target for TV)
    const now = performance.now();
    // Simple logic: render every frame, TV browser usually vsyncs to 60.
    // If we want 30 on 60hz, skip frame.
    // For now, let it fly.

    // FPS Counter
    frameCount++;
    if (now - lastFpsTime >= 1000) {
        S.fps = frameCount;
        frameCount = 0;
        lastFpsTime = now;
        if (S.hudVisible) document.getElementById('fps').innerText = `${S.fps} FPS`;
    }

    // Screensaver Logic
    if (!S.screensaver && Date.now() - S.lastInput > 120000) { // 2 mins
        S.screensaver = true;
        document.getElementById('screensaver-overlay').classList.remove('hidden');
    }

    if (S.screensaver) {
        // Auto-cycle geometry
        S.hue += 0.001;
        S.rot[0] += 0.005;
        if (frameCount % 300 === 0) S.geometry = (S.geometry + 1) % 24;
    } else {
        // Standard rotation
        S.rot[0] += 0.002 * S.speed;
        S.rot[2] += 0.001 * S.speed;
    }

    if (audio) audio.update();

    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    updateUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (S.hudVisible && audio) updateAudioMeter();
}

// UI Functions
function showToast(msg) {
    const el = document.getElementById('toast');
    document.getElementById('toast-message').innerText = msg;
    el.classList.remove('hidden');
    el.style.opacity = '1';
    el.style.top = '50%';
    setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.classList.add('hidden'), 500);
    }, 2000);
}

function updateHUD() {
    if (!S.hudVisible) return;
    document.getElementById('system-badge').innerText = ['FACETED', 'QUANTUM', 'HOLOGRAPHIC'][S.system];
    const geoNames = ['Tetra','Hypercube','Sphere','Torus','Klein','Fractal','Wave','Crystal'];
    const base = S.geometry % 8;
    const core = Math.floor(S.geometry / 8);
    document.getElementById('geometry-name').innerText = `${geoNames[base]} • ${S.geometry}/24`;

    // Colors
    const colors = ['#60a5fa', '#a78bfa', '#34d399'];
    document.getElementById('system-badge').style.color = colors[S.system];
    document.getElementById('system-badge').style.borderColor = colors[S.system];
}

function updateAudioMeter() {
    const bars = document.querySelectorAll('.bar');
    for(let i=0; i<8; i++) {
        const h = Math.min(100, audio.bands[i] * 100);
        bars[i].style.height = `${h}%`;
    }
}

function toggleHUD() {
    S.hudVisible = !S.hudVisible;
    const hud = document.getElementById('hud');
    if (S.hudVisible) {
        hud.classList.remove('hidden');
        updateHUD();
    } else {
        hud.classList.add('hidden');
    }
}

// Input Handling
function markInput() {
    S.lastInput = Date.now();
    if (S.screensaver) {
        S.screensaver = false;
        document.getElementById('screensaver-overlay').classList.add('hidden');
    }
}

function initInput() {
    remote = new RemoteHandler({
        onLeft: () => { markInput(); S.geometry = (S.geometry - 1 + 24) % 24; updateHUD(); showToast(`GEOMETRY ${S.geometry}`); },
        onRight: () => { markInput(); S.geometry = (S.geometry + 1) % 24; updateHUD(); showToast(`GEOMETRY ${S.geometry}`); },
        onRed: () => { markInput(); switchSystem(0); },
        onGreen: () => { markInput(); switchSystem(1); },
        onYellow: () => { markInput(); switchSystem(2); },
        onBlue: () => { markInput(); toggleHUD(); },
        onPlay: () => { markInput(); S.speed = 1.0; showToast("PLAY"); },
        onPause: () => { markInput(); S.speed = 0.0; showToast("PAUSED"); },
        onStop: () => { markInput(); S.screensaver = true; }, // Force SS
        onEnter: () => {
            markInput();
            document.getElementById('startup-overlay').classList.remove('visible');
            document.getElementById('startup-overlay').classList.add('hidden');
            if (audio) audio.init(); // Start audio context on user gesture
        }
    });
}

// Boot
function init() {
    canvas.width = 1920; // Fixed for TV
    canvas.height = 1080;
    gl.viewport(0, 0, 1920, 1080);

    initGL();
    audio = new AudioEngine();
    initInput();

    render();
}

window.onload = init;
