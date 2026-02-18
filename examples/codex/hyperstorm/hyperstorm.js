/**
 * HYPERSTORM — VIB3+ Premium Dogfood (Mobile-First)
 *
 * Touch gestures:
 *   tap (canvas)      -> burst
 *   hold 600ms        -> crystallize
 *   swipe horizontal  -> cycle system
 *   swipe vertical    -> cycle geometry
 *   two-finger tap    -> portal
 *   pinch in/out      -> dimension zoom
 *   dock buttons      -> all 8 actions
 *
 * Desktop fallback: keyboard still works (b/c/p/f/d/s/space/x)
 */

import { VIB3Engine } from '../../../src/core/VIB3Engine.js';
import { TransitionAnimator } from '../../../src/creative/TransitionAnimator.js';
import { ColorPresetsSystem } from '../../../src/creative/ColorPresetsSystem.js';

// ─── Constants ───

const PROJ_NAMES = ['perspective', 'stereographic', 'orthographic'];
const SYSTEMS = ['faceted', 'quantum', 'holographic'];
const SYSTEM_LABELS = { faceted: 'FACETED', quantum: 'QUANTUM', holographic: 'HOLO' };

const PERSONALITY = {
    faceted:     { gridDensity: [15, 35], speed: [0.3, 0.8], chaos: [0.0, 0.15], dimension: [3.6, 4.0] },
    quantum:     { gridDensity: [25, 60], speed: [0.5, 1.5], chaos: [0.1, 0.4],  dimension: [3.2, 3.8] },
    holographic: { gridDensity: [20, 50], speed: [0.4, 1.2], chaos: [0.05, 0.3], dimension: [3.4, 4.2] },
};

const TAU = {
    speed: 0.08, gridDensity: 0.10, chaos: 0.10,
    morphFactor: 0.12, intensity: 0.12, saturation: 0.15,
    hue: 0.25, dimension: 0.20,
};

// ─── State ───

let engine = null;
let premium = null;
let animator = null;
let colorPresets = null;
let currentSystem = 'quantum';
let triggerFireCount = 0;
let lastFrameTime = 0;
let isStorming = false;
let isFlyThrough = false;

const drift = {
    morphFactor: { base: 1.0, amp: 0.15, period: 4 },
    intensity:   { base: 0.7, amp: 0.08, period: 2 },
    hue:         { base: 200, amp: 5,    period: 17 },
    gridDensity: { base: 35,  amp: 3,    period: 13 },
    speed:       { base: 0.8, amp: 0.05, period: 11 },
    chaos:       { base: 0.15, amp: 0.03, period: 7 },
};

// ─── Utilities ───

function ema(current, target, dt, tau) {
    return current + (target - current) * (1 - Math.exp(-dt / tau));
}
function lerp(a, b, t) { return a + (b - a) * t; }

function showError(msg) {
    console.error('[Hyperstorm]', msg);
    const el = document.getElementById('error-overlay');
    if (el) {
        el.style.display = 'block';
        el.textContent = msg;
    }
}

// ─── Init ───

async function init() {
    try {
        // Step 1: Create engine
        engine = new VIB3Engine({ system: currentSystem, preferWebGPU: false });

        // Step 2: Initialize — creates CanvasManager + 5 canvases + system
        const ok = await engine.initialize('vib3-container');
        if (!ok) {
            showError('VIB3Engine.initialize() returned false.\nCheck console for WebGL errors.');
            return;
        }

        console.log('[Hyperstorm] Engine initialized, system:', currentSystem);

        // Step 3: Set starting parameters (quantum personality midpoint)
        const p = PERSONALITY[currentSystem];
        engine.setParameters({
            hue: 200, saturation: 0.7, intensity: 0.7,
            chaos: lerp(p.chaos[0], p.chaos[1], 0.3),
            speed: lerp(p.speed[0], p.speed[1], 0.4),
            gridDensity: lerp(p.gridDensity[0], p.gridDensity[1], 0.3),
            morphFactor: 1.0,
            dimension: lerp(p.dimension[0], p.dimension[1], 0.5),
            geometry: 1
        });

        // Step 4: Creative modules (free SDK)
        animator = new TransitionAnimator(
            (name, value) => engine.setParameter(name, value),
            (name) => engine.getParameter(name)
        );
        colorPresets = new ColorPresetsSystem(engine.createParameterCallback());

        // Step 5: Premium — try to activate, but don't die if it fails
        try {
            const { enablePremium } = await import('../../../src/premium/index.js');
            premium = enablePremium(engine, {
                licenseKey: 'hyperstorm-dogfood-2026',
                features: ['all']
            });
            console.log('[Hyperstorm] Premium activated:', premium.getEnabledFeatures());
            initPremiumModules();
        } catch (premErr) {
            console.warn('[Hyperstorm] Premium modules unavailable:', premErr.message);
            premium = null;
        }

        // Step 6: Wire up controls
        setupDock();
        setupGestures();
        setupHUDToggle();

        // Dismiss gesture hint after 4s or first touch
        const hint = document.getElementById('gesture-hint');
        const dismissHint = () => { if (hint) hint.classList.add('hidden'); };
        setTimeout(dismissHint, 4000);
        document.addEventListener('touchstart', dismissHint, { once: true });

        // Step 7: Start ambient drift (Gold Standard Mode 3)
        lastFrameTime = performance.now();
        requestAnimationFrame(tick);
        console.log('[Hyperstorm] Running. Premium:', !!premium);

    } catch (err) {
        showError('Init failed: ' + err.message + '\n\n' + err.stack);
    }
}

// ─── Premium Module Setup (fail-safe) ───

function initPremiumModules() {
    if (!premium) return;

    // Module 1: ShaderParameterSurface
    try {
        premium.shaderSurface.setParameters({
            projectionType: 1, uvScale: 4.0, lineThickness: 0.025,
            noiseFrequency: [7, 11, 13], breathStrength: 0.4,
            autoRotationSpeed: [0.05, 0.06, 0.04, 0.15, 0.12, 0.18],
            particleSize: 0.15,
            layerAlpha: { background: 0.4, shadow: 0.25, content: 1.0, highlight: 0.85, accent: 0.2 }
        });
    } catch (e) { console.warn('[Hyperstorm] ShaderSurface setup failed:', e.message); }

    // Module 3: LayerGeometryMixer
    try {
        premium.layerGeometry.setLayerGeometry('background', 9);
        premium.layerGeometry.setGeometryOffset('accent', 8);
        premium.layerGeometry.setGeometryOffset('shadow', 16);
    } catch (e) { console.warn('[Hyperstorm] LayerGeometry setup failed:', e.message); }

    // Module 4: VisualEventSystem
    try { setupTriggers(); }
    catch (e) { console.warn('[Hyperstorm] Triggers setup failed:', e.message); }

    // Module 5: CSSBridge
    try {
        premium.cssBridge.start({
            outbound: true, normalize: true, throttle: 16,
            parameters: ['hue', 'intensity', 'chaos', 'speed', 'saturation',
                         'gridDensity', 'morphFactor', 'dimension', 'rot4dXW']
        });
    } catch (e) { console.warn('[Hyperstorm] CSSBridge setup failed:', e.message); }

    // Module 7: FrameworkSync
    try {
        premium.frameworkSync.onSync(updateReadout);
    } catch (e) { console.warn('[Hyperstorm] FrameworkSync setup failed:', e.message); }

    // Module 8: PremiumMCPServer
    try {
        const toolCount = premium.mcp.getToolDefinitions().length;
        console.log(`[Hyperstorm] Premium MCP: ${toolCount} tools`);
    } catch (e) { console.warn('[Hyperstorm] PremiumMCP check failed:', e.message); }
}

// ─── Triggers (Module 4) ───

function setupTriggers() {
    premium.events.addTrigger('chaos_burst', {
        source: 'parameter.chaos', condition: 'exceeds', threshold: 0.6, cooldown: 1500,
        action: { type: 'set_parameters', value: { hue: 0, intensity: 1.0 }, duration: 400, revertTo: { hue: 200, intensity: 0.7 } }
    });
    premium.events.on('chaos_burst', () => flashTrigger('t-chaos-burst'));

    premium.events.addTrigger('intensity_flash', {
        source: 'parameter.intensity', condition: 'drops_below', threshold: 0.3, cooldown: 2000,
        action: { type: 'set_parameters', value: { intensity: 0.9, saturation: 1.0 }, duration: 600, revertTo: { intensity: 0.7, saturation: 0.7 } }
    });
    premium.events.on('intensity_flash', () => flashTrigger('t-intensity-flash'));

    premium.events.addTrigger('dimension_dive', {
        source: 'parameter.dimension', condition: 'drops_below', threshold: 3.2, cooldown: 3000,
        action: { type: 'custom', value: (_eng, prem) => {
            for (const layer of ['background', 'shadow', 'highlight', 'accent'])
                prem.layerGeometry.setLayerGeometry(layer, Math.floor(Math.random() * 24));
        }}
    });
    premium.events.on('dimension_dive', () => flashTrigger('t-dimension-dive'));

    premium.events.addTrigger('storm_peak', {
        source: 'parameter.speed', condition: 'exceeds', threshold: 2.0, cooldown: 2000,
        action: { type: 'custom', value: (_eng, prem) => {
            const cur = prem.shaderSurface.getParameter('projectionType');
            prem.shaderSurface.setParameter('projectionType', (cur + 1) % 3);
        }}
    });
    premium.events.on('storm_peak', () => flashTrigger('t-storm-peak'));
}

function flashTrigger(id) {
    triggerFireCount++;
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('fired');
    setTimeout(() => el.classList.remove('fired'), 600);
}

// ─── Mode 3: Ambient Drift ───

function tick(now) {
    const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
    lastFrameTime = now;

    if (!isStorming && !isFlyThrough) {
        const t = now / 1000;
        for (const [param, d] of Object.entries(drift)) {
            const target = d.base + d.amp * Math.sin((2 * Math.PI * t) / d.period);
            const current = engine.getParameter(param) ?? d.base;
            const smoothed = ema(current, target, dt, TAU[param] || 0.15);
            engine.setParameter(param, smoothed);
        }
    }

    // Manual CSS var update when premium CSSBridge is unavailable
    if (!premium) updateCSSVars();

    // Manual readout update when premium FrameworkSync is unavailable
    if (!premium) updateReadout(engine.getAllParameters());

    requestAnimationFrame(tick);
}

// Fallback CSS vars when CSSBridge premium module isn't active
function updateCSSVars() {
    const root = document.documentElement.style;
    const hue = engine.getParameter('hue') ?? 200;
    root.setProperty('--vib3-hue', (hue / 360).toFixed(3));
    root.setProperty('--vib3-intensity', (engine.getParameter('intensity') ?? 0.7).toFixed(3));
    root.setProperty('--vib3-chaos', (engine.getParameter('chaos') ?? 0.15).toFixed(3));
    root.setProperty('--vib3-speed', (engine.getParameter('speed') ?? 0.8).toFixed(3));
    root.setProperty('--vib3-saturation', (engine.getParameter('saturation') ?? 0.7).toFixed(3));
}

// ════════════════════════════════════════════════════
//  TOUCH / MOBILE CONTROLS
// ════════════════════════════════════════════════════

function setupDock() {
    const ACTIONS = {
        burst, crystallize, portal: portalOpen, fly: flyThrough,
        dimzoom: dimensionalZoom, storm: stormMode, system: cycleSystem, choreo: choreographyGo
    };

    document.querySelectorAll('.dock-btn').forEach(btn => {
        const action = btn.dataset.action;
        if (!action || !ACTIONS[action]) return;

        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            ACTIONS[action]();
        }, { passive: false });

        btn.addEventListener('click', (e) => {
            if (e.sourceCapabilities?.firesTouchEvents) return;
            ACTIONS[action]();
        });
    });
}

function setupGestures() {
    const container = document.getElementById('vib3-container');
    let touchStart = null;
    let holdTimer = null;
    let pinchStartDist = 0;
    let gestureHandled = false;

    container.addEventListener('touchstart', (e) => {
        if (e.target.closest('#dock') || e.target.closest('#hud')) return;
        gestureHandled = false;

        if (e.touches.length === 2) {
            clearTimeout(holdTimer);
            pinchStartDist = getTouchDistance(e.touches);
            return;
        }

        if (e.touches.length === 1) {
            const t = e.touches[0];
            touchStart = { x: t.clientX, y: t.clientY, time: performance.now() };
            holdTimer = setTimeout(() => {
                if (!gestureHandled) {
                    gestureHandled = true;
                    crystallize();
                    if (navigator.vibrate) navigator.vibrate(40);
                }
            }, 600);
        }
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
        if (e.target.closest('#dock') || e.target.closest('#hud')) return;

        if (e.touches.length === 2 && pinchStartDist > 0) {
            const dist = getTouchDistance(e.touches);
            const ratio = dist / pinchStartDist;
            if (Math.abs(ratio - 1) > 0.15 && !gestureHandled) {
                gestureHandled = true;
                clearTimeout(holdTimer);
                if (ratio < 0.85) dimensionalZoom();
                else if (ratio > 1.15) portalOpen();
            }
            return;
        }

        if (e.touches.length === 1 && touchStart && !gestureHandled) {
            const t = e.touches[0];
            const dx = t.clientX - touchStart.x;
            const dy = t.clientY - touchStart.y;
            if (Math.sqrt(dx * dx + dy * dy) > 40) {
                clearTimeout(holdTimer);
                gestureHandled = true;
                if (Math.abs(dx) > Math.abs(dy)) cycleSystem();
                else {
                    const geom = ((engine.getParameter('geometry') || 0) + (dy > 0 ? 1 : -1) + 24) % 24;
                    engine.setParameter('geometry', geom);
                }
            }
        }
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
        if (e.target.closest('#dock') || e.target.closest('#hud')) return;
        clearTimeout(holdTimer);

        if (e.touches.length === 0 && e.changedTouches.length === 2 && !gestureHandled) {
            portalOpen();
            gestureHandled = true;
            return;
        }

        if (!gestureHandled && touchStart && e.changedTouches.length === 1) {
            const elapsed = performance.now() - touchStart.time;
            if (elapsed < 300) burst();
        }
        touchStart = null;
        pinchStartDist = 0;
    }, { passive: true });

    function getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

function setupHUDToggle() {
    const toggle = document.getElementById('hud-toggle');
    const detail = document.getElementById('hud-detail');
    if (!toggle || !detail) return;
    toggle.addEventListener('click', () => detail.classList.toggle('open'));
    toggle.addEventListener('touchend', (e) => {
        e.preventDefault();
        detail.classList.toggle('open');
    }, { passive: false });
}

// ════════════════════════════════════════════════════
//  NAMED MOTIONS (Gold Standard Mode 2)
// ════════════════════════════════════════════════════

function burst() {
    animator.transition({ chaos: 0.9, speed: 2.5, gridDensity: 10, intensity: 1.0 }, 150, 'easeOut');
    setTimeout(() => {
        animator.transition({
            chaos: drift.chaos.base, speed: drift.speed.base,
            gridDensity: drift.gridDensity.base, intensity: drift.intensity.base
        }, 2000, 'easeInOut');
    }, 200);
    if (navigator.vibrate) navigator.vibrate(25);
}

function crystallize() {
    animator.transition({
        chaos: 0, speed: 0.1, saturation: 0.2,
        intensity: 0.85, morphFactor: 0.0, gridDensity: 15
    }, 3000, 'easeInOut');

    if (premium?.shaderSurface) {
        try {
            premium.shaderSurface.setParameters({
                noiseFrequency: [30, 37, 41], lineThickness: 0.01, breathStrength: 0.05
            });
            setTimeout(() => {
                premium.shaderSurface.setParameters({
                    noiseFrequency: [7, 11, 13], lineThickness: 0.025, breathStrength: 0.4
                });
            }, 4000);
        } catch (_) { /* premium unavailable */ }
    }
    if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
}

function portalOpen() {
    if (premium?.rotationLock) {
        try {
            premium.rotationLock.setFlightMode(true);
            setTimeout(() => premium.rotationLock.setFlightMode(false), 2500);
        } catch (_) { /* premium unavailable */ }
    }
    if (premium?.shaderSurface) {
        try { premium.shaderSurface.setParameter('projectionType', 1); } catch (_) {}
    }
    animator.transition({
        hue: ((engine.getParameter('hue') || 200) + 40) % 360,
        speed: (engine.getParameter('speed') || 0.8) + 0.3,
    }, 1200, 'easeInOut');
    if (navigator.vibrate) navigator.vibrate([10, 30, 10, 30, 10]);
}

function flyThrough() {
    isFlyThrough = !isFlyThrough;
    const btn = document.querySelector('[data-action="fly"]');
    if (btn) btn.classList.toggle('active-toggle', isFlyThrough);

    if (isFlyThrough) {
        if (premium?.rotationLock) try { premium.rotationLock.setFlightMode(true); } catch (_) {}
        if (premium?.shaderSurface) {
            try {
                premium.shaderSurface.setParameters({
                    autoRotationSpeed: [0.0, 0.0, 0.0, 0.35, 0.28, 0.42],
                    uvScale: 2.0, lineThickness: 0.015
                });
            } catch (_) {}
        }
        engine.setParameters({ gridDensity: 10, speed: 2.2, chaos: 0.05, dimension: 3.2 });
    } else {
        if (premium?.rotationLock) try { premium.rotationLock.setFlightMode(false); } catch (_) {}
        if (premium?.shaderSurface) {
            try {
                premium.shaderSurface.setParameters({
                    autoRotationSpeed: [0.05, 0.06, 0.04, 0.15, 0.12, 0.18],
                    uvScale: 4.0, lineThickness: 0.025
                });
            } catch (_) {}
        }
        animator.transition({
            gridDensity: drift.gridDensity.base, speed: drift.speed.base,
            chaos: drift.chaos.base, dimension: 3.5
        }, 1000, 'easeInOut');
    }
}

function dimensionalZoom() {
    animator.transition({ dimension: 3.0, speed: 0.3, gridDensity: 55, intensity: 0.9 }, 2000, 'easeInOut');

    if (premium?.shaderSurface) {
        try { premium.shaderSurface.setParameters({ uvScale: 1.5, lineThickness: 0.08, breathStrength: 0.8 }); } catch (_) {}
    }
    if (premium?.layerGeometry) {
        try {
            premium.layerGeometry.setLayerGeometry('background', 0);
            premium.layerGeometry.setLayerGeometry('shadow', 4);
            premium.layerGeometry.setLayerGeometry('highlight', 2);
            premium.layerGeometry.setLayerGeometry('accent', 7);
        } catch (_) {}
    }

    setTimeout(() => {
        animator.transition({
            dimension: 3.5, speed: drift.speed.base,
            gridDensity: drift.gridDensity.base, intensity: drift.intensity.base
        }, 2500, 'easeInOut');
        if (premium?.shaderSurface) {
            try { premium.shaderSurface.setParameters({ uvScale: 4.0, lineThickness: 0.025, breathStrength: 0.4 }); } catch (_) {}
        }
        if (premium?.layerGeometry) {
            try {
                premium.layerGeometry.setLayerGeometry('background', 9);
                premium.layerGeometry.setGeometryOffset('accent', 8);
                premium.layerGeometry.setGeometryOffset('shadow', 16);
            } catch (_) {}
        }
    }, 3000);
    if (navigator.vibrate) navigator.vibrate(30);
}

function stormMode() {
    isStorming = !isStorming;
    const btn = document.querySelector('[data-action="storm"]');
    if (btn) btn.classList.toggle('active-toggle', isStorming);

    if (isStorming) {
        if (premium?.shaderSurface) {
            try {
                premium.shaderSurface.setParameters({
                    noiseFrequency: [3, 5, 7], breathStrength: 0.9,
                    autoRotationSpeed: [0.2, 0.25, 0.15, 0.4, 0.35, 0.45]
                });
            } catch (_) {}
        }
        stormWalk();
        if (navigator.vibrate) navigator.vibrate([15, 40, 15, 40, 15, 40, 15]);
    } else {
        if (premium?.shaderSurface) {
            try {
                premium.shaderSurface.setParameters({
                    noiseFrequency: [7, 11, 13], breathStrength: 0.4,
                    autoRotationSpeed: [0.05, 0.06, 0.04, 0.15, 0.12, 0.18]
                });
            } catch (_) {}
        }
        animator.transition({
            chaos: drift.chaos.base, speed: drift.speed.base,
            gridDensity: drift.gridDensity.base, intensity: drift.intensity.base, hue: drift.hue.base
        }, 2000, 'easeInOut');
    }
}

function stormWalk() {
    if (!isStorming) return;
    animator.transition({
        chaos: lerp(0.4, 0.8, Math.random()),
        speed: lerp(1.5, 2.5, Math.random()),
        gridDensity: lerp(15, 45, Math.random()),
        intensity: lerp(0.5, 0.9, Math.random()),
        hue: (drift.hue.base + (Math.random() - 0.5) * 60 + 360) % 360
    }, 800 + Math.random() * 1200, 'easeInOut');

    if (Math.random() > 0.6) engine.setParameter('geometry', Math.floor(Math.random() * 24));
    setTimeout(stormWalk, 1500 + Math.random() * 2000);
}

function cycleSystem() {
    const idx = SYSTEMS.indexOf(currentSystem);
    const next = SYSTEMS[(idx + 1) % SYSTEMS.length];

    animator.transition({ intensity: 0.15, saturation: 0.1 }, 400, 'easeOut');

    setTimeout(async () => {
        currentSystem = next;
        await engine.switchSystem(next);

        const label = document.getElementById('hud-system');
        if (label) label.textContent = SYSTEM_LABELS[next] || next.toUpperCase();

        const p = PERSONALITY[next];
        animator.transition({
            intensity: drift.intensity.base, saturation: 0.7,
            gridDensity: lerp(p.gridDensity[0], p.gridDensity[1], 0.4),
            speed: lerp(p.speed[0], p.speed[1], 0.4),
            chaos: lerp(p.chaos[0], p.chaos[1], 0.3),
            dimension: lerp(p.dimension[0], p.dimension[1], 0.5)
        }, 600, 'easeInOut');

        drift.gridDensity.base = lerp(p.gridDensity[0], p.gridDensity[1], 0.3);
        drift.speed.base = lerp(p.speed[0], p.speed[1], 0.4);
        drift.chaos.base = lerp(p.chaos[0], p.chaos[1], 0.3);
    }, 450);

    if (navigator.vibrate) navigator.vibrate([15, 80, 15]);
}

function choreographyGo() {
    // Run through 3 systems with timed parameter sweeps — works with or without premium
    const scenes = [
        { system: 'quantum', geometry: 1, duration: 4000, preset: 'Cyberpunk Neon',
          params: { chaos: 0.6, speed: 1.8, gridDensity: 45, intensity: 0.9 } },
        { system: 'faceted', geometry: 5, duration: 3000, preset: 'Ocean Deep',
          params: { chaos: 0.05, speed: 0.5, gridDensity: 20, morphFactor: 1.5 } },
        { system: 'holographic', geometry: 16, duration: 5000, preset: 'Aurora Borealis',
          params: { dimension: 3.2, intensity: 0.95, chaos: 0.2, speed: 1.0 } },
        { system: 'quantum', geometry: 1, duration: 3000,
          params: { chaos: drift.chaos.base, speed: drift.speed.base, intensity: drift.intensity.base } }
    ];

    let i = 0;
    function playScene() {
        if (i >= scenes.length) return;
        const s = scenes[i];

        currentSystem = s.system;
        engine.switchSystem(s.system).then(() => {
            engine.setParameter('geometry', s.geometry);
            if (s.preset && colorPresets) {
                try { colorPresets.applyPreset(s.preset, true, 800); } catch (_) {}
            }
            animator.transition(s.params, 800, 'easeInOut');

            const label = document.getElementById('hud-system');
            if (label) label.textContent = SYSTEM_LABELS[s.system] || s.system.toUpperCase();
        });

        i++;
        if (i < scenes.length) setTimeout(playScene, s.duration);
    }
    playScene();
    if (navigator.vibrate) navigator.vibrate([10, 20, 10, 20, 10, 20, 10]);
}

// ─── Readout ───

function updateReadout(params) {
    const $ = (id) => document.getElementById(id);
    if (!$('r-hue')) return;
    if (params.hue !== undefined) $('r-hue').textContent = Math.round(params.hue) + '\u00B0';
    if (params.chaos !== undefined) $('r-chaos').textContent = (params.chaos ?? 0).toFixed(2);
    if (params.speed !== undefined) $('r-speed').textContent = (params.speed ?? 0).toFixed(2);
    if (params.dimension !== undefined) $('r-dim').textContent = (params.dimension ?? 0).toFixed(2);
    if (params.geometry !== undefined) $('r-geom').textContent = params.geometry;

    if (premium) {
        try {
            const proj = premium.shaderSurface?.getParameter('projectionType');
            $('r-proj').textContent = PROJ_NAMES[proj] || String(proj ?? '—');
            $('r-flight').textContent = premium.rotationLock?.isFlightMode() ? 'ON' : 'off';
        } catch (_) {}
    }
    $('r-triggers').textContent = triggerFireCount;
}

// ─── Desktop keyboard fallback ───

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'b': burst(); break;
        case 'c': crystallize(); break;
        case 'p': portalOpen(); break;
        case 'f': flyThrough(); break;
        case 'd': dimensionalZoom(); break;
        case 's': stormMode(); break;
        case ' ': cycleSystem(); e.preventDefault(); break;
        case 'x': choreographyGo(); break;
    }
});

// ─── Go ───
init();
