/* ==========================================================================
   VIB3+ Samsung TV — Main Application
   Render loop, state management, system switching, Gold Standard motions
   Target: 30fps at 960x540 render resolution on ARM Mali GPUs
   ========================================================================== */

window.VIB3App = (function () {
  'use strict';

  // ── Geometry metadata ──
  var BASE_NAMES = ['Tetrahedron', 'Hypercube', 'Sphere', 'Torus', 'Klein Bottle', 'Fractal', 'Wave', 'Crystal'];
  var CORE_NAMES = ['Base', 'Hypersphere', 'Hypertetra'];
  var SYSTEM_NAMES = ['FACETED', 'QUANTUM', 'HOLOGRAPHIC'];
  var BADGE_CLASSES = ['badge-faceted', 'badge-quantum', 'badge-holographic'];

  // ── Parameter definitions for menu ──
  var PARAMS = [
    { key: 'gridDensity',  label: 'Density',    min: 4,   max: 100, step: 2   },
    { key: 'morphFactor',  label: 'Morph',      min: 0,   max: 2,   step: 0.05 },
    { key: 'chaos',        label: 'Chaos',      min: 0,   max: 1,   step: 0.02 },
    { key: 'speed',        label: 'Speed',      min: 0.1, max: 3,   step: 0.05 },
    { key: 'hue',          label: 'Hue',        min: 0,   max: 1,   step: 0.01 },
    { key: 'saturation',   label: 'Saturation', min: 0,   max: 1,   step: 0.02 },
    { key: 'intensity',    label: 'Intensity',  min: 0,   max: 1,   step: 0.02 }
  ];

  // ── State ──
  var S = {
    system: 0,           // 0=Faceted, 1=Quantum, 2=Holographic
    geometry: 1,         // 0-23 (coreWarp * 8 + baseGeometry)
    hue: 0.75,
    saturation: 0.7,
    intensity: 0.4,
    chaos: 0.05,
    speed: 0.5,
    morphFactor: 0.3,
    gridDensity: 20,
    dimension: 3.2,
    rot: [0, 0, 0, 0, 0, 0],       // XY, XZ, YZ, XW, YW, ZW
    rotVel: [0.05, 0.03, 0.02, 0, 0, 0],
    bass: 0, mid: 0, high: 0,
    onset: 0,                        // decaying onset pulse

    // UI state
    frozen: false,
    hudVisible: true,
    menuOpen: false,
    focusedParam: 0,
    startupVisible: true,
    screensaverActive: false,

    // Timing
    lastInteraction: 0,
    lastFrameTime: 0,
    frameCount: 0,
    fps: 0,
    fpsAccum: 0,
    fpsTimer: 0
  };

  // Screensaver timeout (60 seconds)
  var SCREENSAVER_TIMEOUT = 60000;

  // ── DOM elements ──
  var canvas, gl;
  var elHud, elSystemName, elSystemBadge, elGeoName, elGeoIndex;
  var elAudioBars = [];
  var elStatusMode, elStatusFps, elStatusSensitivity;
  var elParamMenu, elParamTitle;
  var elParamRows = [];
  var elStartup, elToast, elScreensaver;
  var toastTimer = null;

  // ── Render target: 960x540 (upscaled by CSS to viewport) ──
  var RENDER_WIDTH = 960;
  var RENDER_HEIGHT = 540;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // ── Initialization ──

  function init() {
    cacheDOMElements();
    initWebGL();
    if (!gl) return;

    VIB3Shaders.init(gl);
    VIB3Shaders.switchSystem(S.system);

    VIB3Audio.init();
    VIB3Audio.start();

    VIB3Remote.init({
      onSystemSwitch: switchSystem,
      onGeometryChange: cycleGeometry,
      onGeometryDirect: setBaseGeometry,
      onCoreWarpChange: cycleCoreWarp,
      onParamAdjust: adjustParam,
      onParamNavigate: navigateParam,
      onToggleHud: toggleHud,
      onToggleMenu: toggleMenu,
      onToggleFreeze: toggleFreeze,
      onReset: resetDefaults,
      onSensitivity: adjustSensitivity,
      onAnyKey: onAnyKey,
      isMenuOpen: function () { return S.menuOpen; }
    });

    buildParamMenu();
    updateHUD();

    S.lastInteraction = performance.now();
    S.lastFrameTime = performance.now();

    requestAnimationFrame(renderLoop);
  }

  function cacheDOMElements() {
    canvas = document.getElementById('visualizer-canvas');
    elHud = document.getElementById('hud');
    elSystemName = document.getElementById('system-name');
    elSystemBadge = document.getElementById('system-badge');
    elGeoName = document.getElementById('geometry-name');
    elGeoIndex = document.getElementById('geometry-index');
    elStatusMode = document.getElementById('status-mode');
    elStatusFps = document.getElementById('status-fps');
    elStatusSensitivity = document.getElementById('status-sensitivity');
    elParamMenu = document.getElementById('param-menu');
    elParamTitle = document.getElementById('param-menu-title');
    elStartup = document.getElementById('startup-overlay');
    elToast = document.getElementById('toast');
    elScreensaver = document.getElementById('screensaver-indicator');

    // Audio bars
    var bars = document.querySelectorAll('.audio-bar');
    for (var i = 0; i < bars.length; i++) elAudioBars.push(bars[i]);
  }

  function initWebGL() {
    canvas.width = RENDER_WIDTH;
    canvas.height = RENDER_HEIGHT;

    gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance'
    });

    if (!gl) {
      gl = canvas.getContext('experimental-webgl');
    }

    if (!gl) {
      console.error('VIB3App: WebGL not available');
      showToast('WebGL not supported on this TV');
    }
  }

  // ── Render Loop (30fps target) ──

  function renderLoop(now) {
    requestAnimationFrame(renderLoop);

    var dt = (now - S.lastFrameTime) / 1000;
    if (dt > 0.1) dt = 0.033; // Clamp for tab-return
    S.lastFrameTime = now;

    // Frame skip for 30fps target on slow GPUs
    S.frameCount++;

    // FPS calculation (update every second)
    S.fpsAccum++;
    S.fpsTimer += dt;
    if (S.fpsTimer >= 1.0) {
      S.fps = Math.round(S.fpsAccum / S.fpsTimer);
      S.fpsAccum = 0;
      S.fpsTimer = 0;
      if (elStatusFps) elStatusFps.textContent = S.fps + ' FPS';
    }

    if (S.startupVisible) return;
    if (!gl) return;

    // Process audio
    VIB3Audio.process(dt);
    var audio = VIB3Audio.getAudioData();
    S.bass = audio.bass;
    S.mid = audio.mid;
    S.high = audio.high;

    // Onset decay
    if (audio.onset) {
      S.onset = 1.0;
    } else {
      S.onset *= Math.exp(-dt / 0.15); // 150ms decay
    }

    if (!S.frozen) {
      // Update rotations
      for (var i = 0; i < 6; i++) {
        S.rot[i] = (S.rot[i] + S.rotVel[i] * dt) % (Math.PI * 2);
      }

      // Audio → parameter mappings
      if (audio.bass > 0 || audio.mid > 0) {
        var a = 1 - Math.exp(-dt / 0.12);
        S.rotVel[5] += (audio.bass * 0.8 - S.rotVel[5]) * a;       // Bass → ZW rotation
        S.rotVel[0] += (audio.mid * 1.2 - S.rotVel[0]) * a;        // Mid → XY rotation
        S.rotVel[3] += (audio.high * 0.6 - S.rotVel[3]) * a;       // High → XW rotation
      }

      // Heartbeat idle motion (Gold Standard: morphFactor sine 0.6↔1.4, 4s period)
      if (!S.screensaverActive) {
        var heartbeat = Math.sin(now * 0.001 * Math.PI * 0.5) * 0.4 + 1.0; // 0.6 ↔ 1.4
        S.morphFactor = lerp(S.morphFactor, heartbeat, 1 - Math.exp(-dt / 0.5));
      }

      // Screensaver: Storm motion (random oscillation)
      processScreensaver(now, dt);
    }

    // Clamp parameters
    S.hue = ((S.hue % 1) + 1) % 1;
    S.saturation = clamp(S.saturation, 0, 1);
    S.intensity = clamp(S.intensity, 0, 1);
    S.chaos = clamp(S.chaos, 0, 1);
    S.speed = clamp(S.speed, 0.1, 3);
    S.morphFactor = clamp(S.morphFactor, 0, 2);
    S.gridDensity = clamp(S.gridDensity, 4, 100);
    S.dimension = clamp(S.dimension, 3.0, 4.5);

    // Set uniforms and draw
    VIB3Shaders.setUniforms({
      time: now,
      width: RENDER_WIDTH,
      height: RENDER_HEIGHT,
      geometry: S.geometry,
      rot: S.rot,
      dimension: S.dimension,
      gridDensity: S.gridDensity,
      morphFactor: S.morphFactor,
      chaos: S.chaos,
      speed: S.speed,
      hue: S.hue,
      intensity: S.intensity,
      saturation: S.saturation,
      bass: S.bass,
      mid: S.mid,
      high: S.high,
      onset: S.onset
    });

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    VIB3Shaders.draw();

    // Update audio meter bars
    updateAudioMeter(audio);
  }

  // ── Screensaver (Gold Standard: Storm motion) ──

  function processScreensaver(now, dt) {
    var idle = now - S.lastInteraction;

    if (!S.screensaverActive && idle > SCREENSAVER_TIMEOUT) {
      S.screensaverActive = true;
      if (elScreensaver) elScreensaver.classList.add('visible');
      if (elStatusMode) elStatusMode.textContent = 'SCREENSAVER';
    }

    if (S.screensaverActive) {
      // Storm: all params oscillating randomly within bounds
      var t = now * 0.001;
      S.hue = (S.hue + dt * 0.02) % 1;
      S.chaos = lerp(S.chaos, 0.3 + Math.sin(t * 0.7) * 0.2, dt * 0.5);
      S.speed = lerp(S.speed, 1.0 + Math.sin(t * 0.5) * 0.4, dt * 0.3);
      S.gridDensity = lerp(S.gridDensity, 30 + Math.sin(t * 0.3) * 15, dt * 0.2);
      S.intensity = lerp(S.intensity, 0.5 + Math.sin(t * 0.9) * 0.15, dt * 0.4);

      // Slowly cycle geometry every 15 seconds
      if (Math.floor(t / 15) % 24 !== S.geometry) {
        var nextGeo = Math.floor(t / 15) % 24;
        S.geometry = nextGeo;
        updateGeoDisplay();
      }
    }
  }

  function wakeFromScreensaver() {
    if (!S.screensaverActive) return;
    S.screensaverActive = false;
    if (elScreensaver) elScreensaver.classList.remove('visible');
    if (elStatusMode) elStatusMode.textContent = S.frozen ? 'FROZEN' : 'INTERACTIVE';

    // Explosion→Settle (Gold Standard: 150ms attack, 2s release)
    S.chaos = 0.9;
    S.speed = 2.5;
    S.intensity = 0.95;
    S.onset = 1.0;

    // Settle back over 2s (exponential decay handles this naturally via render loop)
    setTimeout(function () {
      S.chaos = 0.05;
      S.speed = 0.5;
      S.intensity = 0.4;
    }, 2000);
  }

  // ── System Switching (Gold Standard: Color Drain/Flood transition) ──

  function switchSystem(idx) {
    idx = clamp(idx, 0, 2);
    if (idx === S.system) return;

    // Color Drain on outgoing
    var prevSat = S.saturation;
    S.saturation = 0;
    S.intensity *= 0.5;

    S.system = idx;
    VIB3Shaders.switchSystem(idx);

    // Color Flood on incoming (restore over 300ms)
    setTimeout(function () {
      S.saturation = prevSat;
      S.intensity = 0.4;
    }, 300);

    updateSystemDisplay();
    showToast(SYSTEM_NAMES[idx]);
  }

  // ── Geometry Control ──

  function cycleGeometry(delta) {
    var base = S.geometry % 8;
    var core = Math.floor(S.geometry / 8);
    base = ((base + delta) % 8 + 8) % 8;
    S.geometry = core * 8 + base;
    updateGeoDisplay();
    showToast(getGeoDisplayName());
  }

  function setBaseGeometry(baseIdx) {
    var core = Math.floor(S.geometry / 8);
    S.geometry = core * 8 + clamp(baseIdx, 0, 7);
    updateGeoDisplay();
    showToast(getGeoDisplayName());
  }

  function cycleCoreWarp(delta) {
    var base = S.geometry % 8;
    var core = Math.floor(S.geometry / 8);
    core = ((core + delta) % 3 + 3) % 3;
    S.geometry = core * 8 + base;
    updateGeoDisplay();
    showToast(CORE_NAMES[core] + ' ' + BASE_NAMES[base]);
  }

  function getGeoDisplayName() {
    var base = S.geometry % 8;
    var core = Math.floor(S.geometry / 8);
    return (core > 0 ? CORE_NAMES[core] + ' ' : '') + BASE_NAMES[base];
  }

  // ── Parameter Menu ──

  function buildParamMenu() {
    var container = elParamMenu;
    if (!container) return;

    // Clear existing rows (keep title)
    var existingRows = container.querySelectorAll('.param-row');
    for (var r = 0; r < existingRows.length; r++) {
      container.removeChild(existingRows[r]);
    }

    elParamRows = [];
    for (var i = 0; i < PARAMS.length; i++) {
      var row = document.createElement('div');
      row.className = 'param-row' + (i === S.focusedParam ? ' focused' : '');

      var label = document.createElement('span');
      label.className = 'param-label';
      label.textContent = PARAMS[i].label;

      var track = document.createElement('div');
      track.className = 'param-bar-track';
      var fill = document.createElement('div');
      fill.className = 'param-bar-fill';
      track.appendChild(fill);

      var value = document.createElement('span');
      value.className = 'param-value';

      row.appendChild(label);
      row.appendChild(track);
      row.appendChild(value);
      container.appendChild(row);
      elParamRows.push({ row: row, fill: fill, value: value, param: PARAMS[i] });
    }

    updateParamMenu();
  }

  function updateParamMenu() {
    for (var i = 0; i < elParamRows.length; i++) {
      var entry = elParamRows[i];
      var p = entry.param;
      var val = S[p.key];
      var pct = ((val - p.min) / (p.max - p.min)) * 100;
      entry.fill.style.width = pct + '%';
      entry.value.textContent = val.toFixed(p.step < 1 ? 2 : 0);
      entry.row.className = 'param-row' + (i === S.focusedParam ? ' focused' : '');
    }
  }

  function navigateParam(delta) {
    S.focusedParam = ((S.focusedParam + delta) % PARAMS.length + PARAMS.length) % PARAMS.length;
    updateParamMenu();
  }

  function adjustParam(delta) {
    var p = PARAMS[S.focusedParam];
    S[p.key] = clamp(S[p.key] + p.step * delta, p.min, p.max);
    updateParamMenu();
  }

  // ── UI Toggles ──

  function toggleHud() {
    S.hudVisible = !S.hudVisible;
    if (elHud) {
      if (S.hudVisible) {
        elHud.classList.remove('hidden');
      } else {
        elHud.classList.add('hidden');
      }
    }
  }

  function toggleMenu() {
    S.menuOpen = !S.menuOpen;
    if (elParamMenu) {
      if (S.menuOpen) {
        elParamMenu.classList.add('visible');
        updateParamMenu();
      } else {
        elParamMenu.classList.remove('visible');
      }
    }
  }

  function toggleFreeze() {
    S.frozen = !S.frozen;
    if (elStatusMode) elStatusMode.textContent = S.frozen ? 'FROZEN' : 'INTERACTIVE';
    showToast(S.frozen ? 'FROZEN' : 'PLAYING');
  }

  function resetDefaults() {
    S.hue = 0.75;
    S.saturation = 0.7;
    S.intensity = 0.4;
    S.chaos = 0.05;
    S.speed = 0.5;
    S.morphFactor = 0.3;
    S.gridDensity = 20;
    S.dimension = 3.2;
    S.rot = [0, 0, 0, 0, 0, 0];
    S.rotVel = [0.05, 0.03, 0.02, 0, 0, 0];
    S.frozen = false;
    if (elStatusMode) elStatusMode.textContent = 'INTERACTIVE';
    updateParamMenu();
    showToast('RESET');
  }

  function adjustSensitivity(delta) {
    VIB3Audio.setSensitivity(VIB3Audio.getSensitivity() + delta);
    if (elStatusSensitivity) {
      elStatusSensitivity.textContent = 'SENS ' + VIB3Audio.getSensitivity().toFixed(1);
    }
    showToast('Sensitivity ' + VIB3Audio.getSensitivity().toFixed(1));
  }

  function onAnyKey() {
    S.lastInteraction = performance.now();

    if (S.startupVisible) {
      S.startupVisible = false;
      if (elStartup) elStartup.classList.add('hidden');
      if (elStatusMode) elStatusMode.textContent = 'INTERACTIVE';
    }

    if (S.screensaverActive) {
      wakeFromScreensaver();
    }
  }

  // ── HUD Updates ──

  function updateSystemDisplay() {
    if (elSystemName) elSystemName.textContent = SYSTEM_NAMES[S.system];
    if (elSystemBadge) {
      elSystemBadge.className = 'system-badge ' + BADGE_CLASSES[S.system];
      elSystemBadge.textContent = SYSTEM_NAMES[S.system];
    }
  }

  function updateGeoDisplay() {
    var base = S.geometry % 8;
    var core = Math.floor(S.geometry / 8);
    if (elGeoName) elGeoName.textContent = getGeoDisplayName();
    if (elGeoIndex) elGeoIndex.textContent = 'Index ' + S.geometry + ' (' + CORE_NAMES[core] + ')';
  }

  function updateHUD() {
    updateSystemDisplay();
    updateGeoDisplay();
    if (elStatusMode) elStatusMode.textContent = S.startupVisible ? 'STARTUP' : 'INTERACTIVE';
    if (elStatusSensitivity) {
      elStatusSensitivity.textContent = 'SENS ' + VIB3Audio.getSensitivity().toFixed(1);
    }
  }

  function updateAudioMeter(audio) {
    for (var i = 0; i < elAudioBars.length && i < 8; i++) {
      var h = Math.round(audio.bands[i] * 72); // max 72px out of 80px container
      elAudioBars[i].style.height = Math.max(4, h) + 'px';
    }
  }

  // ── Toast ──

  function showToast(msg) {
    if (!elToast) return;
    elToast.textContent = msg;
    elToast.classList.add('visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      elToast.classList.remove('visible');
    }, 2000);
  }

  // ── Start when DOM ready ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    getState: function () { return S; },
    switchSystem: switchSystem,
    showToast: showToast
  };
})();
