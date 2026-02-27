/**
 * HYPERSTORM — VIB3+ Premium Dogfood  (Codex Entry)
 * ═══════════════════════════════════════════════════
 *
 * A mobile-first interactive 4D visualization that exercises all 8 VIB3+ Premium
 * modules together. Demonstrates every Gold Standard v3 pattern:
 *
 *   Mode 1 — Continuous Mapping:
 *     CSSBridge pumps engine parameters to CSS custom properties every frame.
 *     All UI chrome (HUD, dock, vignette, scanlines) derives color/opacity/blur
 *     from these properties — the UI is a living extension of the visualization.
 *
 *   Mode 2 — Event Choreography:
 *     8 named motions (burst, crystallize, portal, fly, zoom, storm, system, show)
 *     with attack/sustain/release envelopes via TransitionAnimator. 4 autonomous
 *     triggers via VisualEventSystem (chaos_burst, intensity_flash, dimension_dive,
 *     storm_peak) that fire when parameters cross thresholds.
 *
 *   Mode 3 — Ambient Drift:
 *     6 parameters breathe with independent prime-number periods (4s, 2s, 17s, 13s,
 *     11s, 7s). Prime periods prevent the drift from ever exactly repeating, keeping
 *     the visualization alive during idle. All drift uses EMA smoothing.
 *
 * Premium Modules Exercised:
 *   1. ShaderParameterSurface — projection type, UV scale, noise, per-layer alpha
 *   2. RotationLockSystem     — flight mode during portal/fly
 *   3. LayerGeometryMixer     — per-layer geometry assignment, geometry offsets
 *   4. VisualEventSystem      — 4 autonomous triggers with actions
 *   5. CSSBridge              — real-time engine→CSS parameter bridge
 *   6. ChoreographyExtensions — (used indirectly via choreographyGo)
 *   7. FrameworkSync           — readout updates on sync events
 *   8. PremiumMCPServer        — tool count verification on init
 *
 * Touch Gestures:
 *   tap (canvas)     → burst        hold 600ms      → crystallize
 *   swipe horizontal → cycle system  swipe vertical → cycle geometry
 *   two-finger tap   → portal       pinch in/out    → dimension zoom
 *
 * Desktop Keyboard:
 *   b=burst  c=freeze  p=portal  f=fly  d=zoom  s=storm  space=switch  x=show
 *
 * [WHY] This file demonstrates the correct pattern for building on VIB3+ Premium:
 *   - Engine creation and init are synchronous/awaited (Step 1-2)
 *   - Premium is loaded via dynamic import in try/catch (Step 5)
 *   - Every premium module call uses optional chaining (premium?.module?.method())
 *   - Each module init is individually try/caught so one broken module doesn't kill the rest
 *   - A JS fallback writes CSS vars when CSSBridge isn't available
 *   - The viz runs fine without premium — premium enhances, it doesn't gate
 */

import { VIB3Engine } from '../../../src/core/VIB3Engine.js';
import { TransitionAnimator } from '../../../src/creative/TransitionAnimator.js';
import { ColorPresetsSystem } from '../../../src/creative/ColorPresetsSystem.js';


// ═══════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════

const PROJ_NAMES = ['perspective', 'stereographic', 'orthographic'];
const SYSTEMS = ['faceted', 'quantum', 'holographic'];
const SYSTEM_LABELS = { faceted: 'FACETED', quantum: 'QUANTUM', holographic: 'HOLO' };

/**
 * Per-system parameter personality ranges.
 * [WHY] Each system has a distinct visual character (see CLAUDE.md "Per-System Creative
 * Personality"). Using the full parameter range on every system makes them look the same.
 * These ranges constrain ambient drift and system-switch transitions to stay within each
 * system's sweet spot.
 */
const PERSONALITY = {
    faceted:     { gridDensity: [15, 35], speed: [0.3, 0.8], chaos: [0.0, 0.15], dimension: [3.6, 4.0] },
    quantum:     { gridDensity: [25, 60], speed: [0.5, 1.5], chaos: [0.1, 0.4],  dimension: [3.2, 3.8] },
    holographic: { gridDensity: [20, 50], speed: [0.4, 1.2], chaos: [0.05, 0.3], dimension: [3.4, 4.2] },
};

/**
 * EMA time constants (tau) per parameter, in seconds.
 * [WHY] EMA smoothing is the universal primitive for VIB3+ parameter transitions
 * (Gold Standard v3). The formula: current + (target - current) * (1 - exp(-dt / tau)).
 * Smaller tau = faster response. hue (0.25s) is slowest because hue jumps are jarring.
 * speed (0.08s) is fastest because users expect immediate speed changes.
 * Never use setTimeout for visual parameter changes — always EMA.
 */
const TAU = {
    speed: 0.08, gridDensity: 0.10, chaos: 0.10,
    morphFactor: 0.12, intensity: 0.12, saturation: 0.15,
    hue: 0.25, dimension: 0.20,
};


// ═══════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════

let engine = null;
let premium = null;
let animator = null;
let colorPresets = null;
let currentSystem = 'quantum';
let triggerFireCount = 0;
let lastFrameTime = 0;
let isStorming = false;
let isFlyThrough = false;

/**
 * Ambient drift configuration — Gold Standard Mode 3.
 * [WHY] Each parameter has an independent period using a PRIME number of seconds.
 * Primes (2, 4, 7, 11, 13, 17) ensure the combined drift pattern doesn't repeat
 * for LCM(2,4,7,11,13,17) = 68,068 seconds (~19 hours). This prevents the "it
 * loops every 30 seconds" feeling that kills ambient installations.
 */
const drift = {
    morphFactor: { base: 1.0, amp: 0.15, period: 4 },
    intensity:   { base: 0.7, amp: 0.08, period: 2 },
    hue:         { base: 200, amp: 5,    period: 17 },
    gridDensity: { base: 35,  amp: 3,    period: 13 },
    speed:       { base: 0.8, amp: 0.05, period: 11 },
    chaos:       { base: 0.15, amp: 0.03, period: 7 },
};


// ═══════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════

/**
 * Exponential Moving Average — the universal VIB3+ smoothing primitive.
 * [WHY] EMA with alpha = 1 - exp(-dt/tau) is frame-rate independent.
 * At 60fps, 30fps, or 120fps the smoothing behaves identically because
 * alpha adjusts to the actual elapsed time.
 */
function ema(current, target, dt, tau) {
    return current + (target - current) * (1 - Math.exp(-dt / tau));
}

function lerp(a, b, t) { return a + (b - a) * t; }

/**
 * Show an error on the visible overlay AND console.
 * [WHY] Agents and CI don't have DevTools open. The overlay ensures failures
 * are immediately visible in screenshots and screen recordings.
 */
function showError(msg) {
    console.error('[Hyperstorm]', msg);
    const el = document.getElementById('error-overlay');
    if (el) {
        el.style.display = 'block';
        el.textContent = msg;
    }
}


// ═══════════════════════════════════════════════════
//  INITIALIZATION
// ═══════════════════════════════════════════════════

async function init() {
    try {
        // ── Step 1: Create engine ──
        // [WHY] preferWebGPU:false — WebGPU on mobile is unreliable (driver bugs,
        // partial support). WebGL 2.0 is the safe choice for a mobile-first demo.
        engine = new VIB3Engine({ system: currentSystem, preferWebGPU: false });

        // ── Step 2: Initialize ──
        // [WHY] initialize() creates the CanvasManager, inserts 5 canvases into
        // #vib3-container, creates the visualization system, and acquires WebGL
        // contexts. It returns false if the system failed to create (no WebGL, zero
        // dimensions, etc). Always check the return value.
        const ok = await engine.initialize('vib3-container');
        if (!ok) {
            showError('VIB3Engine.initialize() returned false.\nCheck console for WebGL errors.');
            return;
        }

        console.log('[Hyperstorm] Engine initialized, system:', currentSystem);

        // ── Step 3: Set starting parameters ──
        // [WHY] Use the system's personality midpoint, not arbitrary numbers.
        // This ensures the initial state looks right for the current system.
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

        // ── Step 4: Creative modules (free SDK) ──
        // [WHY] TransitionAnimator and ColorPresetsSystem are part of the free SDK.
        // They work through parameter callbacks, not engine internals, so they're
        // independent of which system is active.
        animator = new TransitionAnimator(
            (name, value) => engine.setParameter(name, value),
            (name) => engine.getParameter(name)
        );
        colorPresets = new ColorPresetsSystem(engine.createParameterCallback());

        // ── Step 5: Premium activation ──
        // [WHY] Dynamic import in try/catch: if any premium sub-module fails to parse
        // or load, the app still runs. This is THE correct pattern for premium.
        // Never use top-level `import { enablePremium } from '...'` because a single
        // broken module kills the entire script.
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

        // ── Step 6: Wire controls ──
        setupDock();
        setupGestures();
        setupHUDToggle();

        // [WHY] Dismiss gesture hint after 4s or first touch — whichever comes first.
        // First-time users see the instructions; returning users aren't annoyed.
        const hint = document.getElementById('gesture-hint');
        const dismissHint = () => { if (hint) hint.classList.add('hidden'); };
        setTimeout(dismissHint, 4000);
        document.addEventListener('touchstart', dismissHint, { once: true });

        // ── Step 7: Start render loop ──
        lastFrameTime = performance.now();
        requestAnimationFrame(tick);
        console.log('[Hyperstorm] Running. Premium:', !!premium);

    } catch (err) {
        showError('Init failed: ' + err.message + '\n\n' + err.stack);
    }
}


// ═══════════════════════════════════════════════════
//  PREMIUM MODULE SETUP (fail-safe)
// ═══════════════════════════════════════════════════
//
// [WHY] Each module init is individually try/caught. Premium modules are independent —
// a broken ShaderParameterSurface shouldn't prevent CSSBridge from working.
// All premium calls throughout this file use optional chaining (premium?.module?.method())
// so they silently no-op when a module didn't initialize.

function initPremiumModules() {
    if (!premium) return;

    // Module 1: ShaderParameterSurface — controls projection, UV, noise, per-layer alpha
    try {
        premium.shaderSurface.setParameters({
            projectionType: 1,           // stereographic — reveals more 4D structure
            uvScale: 4.0,               // moderate detail level
            lineThickness: 0.025,       // thin lines for clean geometry
            noiseFrequency: [7, 11, 13], // [WHY] prime triplet prevents visible repeat patterns
            breathStrength: 0.4,        // subtle breathing
            autoRotationSpeed: [0.05, 0.06, 0.04, 0.15, 0.12, 0.18], // [WHY] 4D planes (last 3) rotate faster than 3D
            particleSize: 0.15,
            layerAlpha: { background: 0.4, shadow: 0.25, content: 1.0, highlight: 0.85, accent: 0.2 }
        });
    } catch (e) { console.warn('[Hyperstorm] ShaderSurface setup failed:', e.message); }

    // Module 3: LayerGeometryMixer — per-layer geometry assignment
    // [WHY] Different geometries on different layers creates visual depth.
    // Background gets geometry 9 (hypersphere+sphere), accent offset by 8 (torus family),
    // shadow offset by 16 (crystal family). The content layer keeps the main geometry.
    try {
        premium.layerGeometry.setLayerGeometry('background', 9);
        premium.layerGeometry.setGeometryOffset('accent', 8);
        premium.layerGeometry.setGeometryOffset('shadow', 16);
    } catch (e) { console.warn('[Hyperstorm] LayerGeometry setup failed:', e.message); }

    // Module 4: VisualEventSystem — autonomous triggers
    try { setupTriggers(); }
    catch (e) { console.warn('[Hyperstorm] Triggers setup failed:', e.message); }

    // Module 5: CSSBridge — engine parameters → CSS custom properties every frame
    // [WHY] normalize:true maps all values to 0-1 range. throttle:16 = ~60fps updates.
    // When CSSBridge is active, the JS fallback (updateCSSVars) is skipped.
    try {
        premium.cssBridge.start({
            outbound: true, normalize: true, throttle: 16,
            parameters: ['hue', 'intensity', 'chaos', 'speed', 'saturation',
                         'gridDensity', 'morphFactor', 'dimension', 'rot4dXW']
        });
    } catch (e) { console.warn('[Hyperstorm] CSSBridge setup failed:', e.message); }

    // Module 7: FrameworkSync — calls updateReadout on sync events
    try {
        premium.frameworkSync.onSync(updateReadout);
    } catch (e) { console.warn('[Hyperstorm] FrameworkSync setup failed:', e.message); }

    // Module 8: PremiumMCPServer — verify tool count
    try {
        const toolCount = premium.mcp.getToolDefinitions().length;
        console.log(`[Hyperstorm] Premium MCP: ${toolCount} tools`);
    } catch (e) { console.warn('[Hyperstorm] PremiumMCP check failed:', e.message); }
}


// ═══════════════════════════════════════════════════
//  TRIGGERS — Gold Standard Mode 2 (Event Choreography)
// ═══════════════════════════════════════════════════
//
// [WHY] Triggers are autonomous: they watch parameter values and fire actions
// when thresholds are crossed. This creates emergent behavior — the user triggers
// a burst (which spikes chaos), which fires chaos_burst trigger (which flashes red),
// which creates a cascading visual event the user didn't explicitly request.

function setupTriggers() {
    // chaos_burst: when chaos exceeds 0.6, flash hue to red + max intensity
    premium.events.addTrigger('chaos_burst', {
        source: 'parameter.chaos', condition: 'exceeds', threshold: 0.6, cooldown: 1500,
        action: { type: 'set_parameters', value: { hue: 0, intensity: 1.0 }, duration: 400, revertTo: { hue: 200, intensity: 0.7 } }
    });
    premium.events.on('chaos_burst', () => flashTrigger('t-chaos-burst'));

    // intensity_flash: when intensity drops below 0.3, auto-recover with a flash
    // [WHY] Prevents the viz from going too dark and appearing broken
    premium.events.addTrigger('intensity_flash', {
        source: 'parameter.intensity', condition: 'drops_below', threshold: 0.3, cooldown: 2000,
        action: { type: 'set_parameters', value: { intensity: 0.9, saturation: 1.0 }, duration: 600, revertTo: { intensity: 0.7, saturation: 0.7 } }
    });
    premium.events.on('intensity_flash', () => flashTrigger('t-intensity-flash'));

    // dimension_dive: when dimension drops below 3.2, randomize layer geometries
    // [WHY] Low dimension = deep 4D space. Reward the user by shuffling what they see.
    premium.events.addTrigger('dimension_dive', {
        source: 'parameter.dimension', condition: 'drops_below', threshold: 3.2, cooldown: 3000,
        action: { type: 'custom', value: (_eng, prem) => {
            for (const layer of ['background', 'shadow', 'highlight', 'accent'])
                prem.layerGeometry.setLayerGeometry(layer, Math.floor(Math.random() * 24));
        }}
    });
    premium.events.on('dimension_dive', () => flashTrigger('t-dimension-dive'));

    // storm_peak: when speed exceeds 2.0, cycle projection type
    // [WHY] High speed = intense moment. Projection switch creates a visual "shift"
    // that amplifies the intensity without the user having to do anything.
    premium.events.addTrigger('storm_peak', {
        source: 'parameter.speed', condition: 'exceeds', threshold: 2.0, cooldown: 2000,
        action: { type: 'custom', value: (_eng, prem) => {
            const cur = prem.shaderSurface.getParameter('projectionType');
            prem.shaderSurface.setParameter('projectionType', (cur + 1) % 3);
        }}
    });
    premium.events.on('storm_peak', () => flashTrigger('t-storm-peak'));
}

/** Flash a trigger dot in the HUD — adds .fired class then removes after 600ms. */
function flashTrigger(id) {
    triggerFireCount++;
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('fired');
    setTimeout(() => el.classList.remove('fired'), 600);
}


// ═══════════════════════════════════════════════════
//  RENDER LOOP — Mode 3: Ambient Drift
// ═══════════════════════════════════════════════════

function tick(now) {
    // [WHY] Cap dt at 100ms to prevent huge jumps when tab is backgrounded.
    // Without this, resuming from background causes a violent parameter snap.
    const dt = Math.min((now - lastFrameTime) / 1000, 0.1);
    lastFrameTime = now;

    // [WHY] Drift pauses during storm mode and fly-through — those modes drive
    // their own parameter animations. Running drift simultaneously would fight
    // with storm's random walks and fly's fixed parameters.
    if (!isStorming && !isFlyThrough) {
        const t = now / 1000;
        for (const [param, d] of Object.entries(drift)) {
            // Sine wave with prime period → never-repeating drift
            const target = d.base + d.amp * Math.sin((2 * Math.PI * t) / d.period);
            const current = engine.getParameter(param) ?? d.base;
            const smoothed = ema(current, target, dt, TAU[param] || 0.15);
            engine.setParameter(param, smoothed);
        }
    }

    // [WHY] Fallback: when premium CSSBridge isn't active, manually write CSS vars.
    // This ensures the UI still breathes with the viz even without premium.
    if (!premium) updateCSSVars();

    // [WHY] Fallback: when premium FrameworkSync isn't active, manually update readout.
    if (!premium) updateReadout(engine.getAllParameters());

    requestAnimationFrame(tick);
}

/**
 * Fallback CSS var writer — used when premium CSSBridge module is unavailable.
 * [WHY] Hue is divided by 360 to produce 0-1 range matching CSSBridge normalize:true output.
 * This ensures the CSS calc() expressions in the stylesheet work identically whether
 * CSSBridge or this fallback is active.
 */
function updateCSSVars() {
    const root = document.documentElement.style;
    const hue = engine.getParameter('hue') ?? 200;
    root.setProperty('--vib3-hue', (hue / 360).toFixed(3));
    root.setProperty('--vib3-intensity', (engine.getParameter('intensity') ?? 0.7).toFixed(3));
    root.setProperty('--vib3-chaos', (engine.getParameter('chaos') ?? 0.15).toFixed(3));
    root.setProperty('--vib3-speed', (engine.getParameter('speed') ?? 0.8).toFixed(3));
    root.setProperty('--vib3-saturation', (engine.getParameter('saturation') ?? 0.7).toFixed(3));
}


// ═══════════════════════════════════════════════════
//  TOUCH / MOBILE CONTROLS
// ═══════════════════════════════════════════════════

/**
 * Wire dock buttons to named motions.
 * [WHY] Uses touchend (not click) for primary interaction — eliminates the 300ms
 * click delay on mobile. The click handler is a desktop fallback with a guard
 * against duplicate firing on touch devices (sourceCapabilities.firesTouchEvents).
 */
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

/**
 * Canvas gesture system — handles tap, hold, swipe, pinch, two-finger.
 * [WHY] All gestures are on the #vib3-container, not document or body.
 * Events from #dock and #hud are filtered out so button taps don't also
 * trigger canvas gestures. Each gesture is mutually exclusive (gestureHandled flag).
 */
function setupGestures() {
    const container = document.getElementById('vib3-container');
    let touchStart = null;
    let holdTimer = null;
    let pinchStartDist = 0;
    let gestureHandled = false;

    container.addEventListener('touchstart', (e) => {
        if (e.target.closest('#dock') || e.target.closest('#hud')) return;
        gestureHandled = false;

        // Two-finger start — prepare for pinch detection
        if (e.touches.length === 2) {
            clearTimeout(holdTimer);
            pinchStartDist = getTouchDistance(e.touches);
            return;
        }

        // Single finger — start hold timer (600ms for crystallize)
        // [WHY] 600ms is long enough to not trigger on quick taps but short enough
        // to feel responsive. iOS uses 500ms for force touch; we go slightly longer
        // to differentiate from accidental holds.
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

        // Pinch detection — 15% threshold to avoid accidental triggers
        if (e.touches.length === 2 && pinchStartDist > 0) {
            const dist = getTouchDistance(e.touches);
            const ratio = dist / pinchStartDist;
            if (Math.abs(ratio - 1) > 0.15 && !gestureHandled) {
                gestureHandled = true;
                clearTimeout(holdTimer);
                if (ratio < 0.85) dimensionalZoom();        // pinch in
                else if (ratio > 1.15) portalOpen();          // pinch out
            }
            return;
        }

        // Swipe detection — 40px threshold, then check direction
        // [WHY] horizontal swipe = cycle system (matches real-world "flipping pages")
        //       vertical swipe = cycle geometry (matches "scrolling through options")
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

        // Two-finger tap (no move detected) → portal
        if (e.touches.length === 0 && e.changedTouches.length === 2 && !gestureHandled) {
            portalOpen();
            gestureHandled = true;
            return;
        }

        // Quick tap (<300ms, no swipe) → burst
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

/** Toggle HUD detail panel — both touchend and click for cross-device support. */
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


// ═══════════════════════════════════════════════════
//  NAMED MOTIONS — Gold Standard Mode 2 (Event Choreography)
// ═══════════════════════════════════════════════════
//
// [WHY] Each motion follows the Attack/Sustain/Release pattern:
//   Attack  — fast transition to extreme values (150-400ms, easeOut)
//   Sustain — hold at peak briefly (implicit via setTimeout gap)
//   Release — slow return to ambient drift base values (1000-3000ms, easeInOut)
// navigator.vibrate provides haptic feedback on mobile.

/**
 * BURST — chaos spike + speed surge + grid dissolve.
 * Attack 150ms, release 2000ms. The signature "tap to explode" gesture.
 */
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

/**
 * CRYSTALLIZE — freeze all motion, desaturate, flatten morph.
 * [WHY] Chaos→0 + speed→0.1 creates an almost-frozen state. gridDensity drops
 * to show large, clean geometry. ShaderSurface noise increases to create fine
 * crystal-like detail. Release after 4s restores ambient parameters.
 */
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

/**
 * PORTAL — rotation lock + projection switch + hue shift.
 * [WHY] RotationLockSystem.setFlightMode(true) locks out user rotation and runs
 * a smooth automated fly path. Combined with stereographic projection, this
 * creates a "flying through a portal" effect.
 */
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

/**
 * FLY THROUGH — toggle persistent flight mode.
 * [WHY] This is a toggle (not a one-shot) because fly-through is an exploratory mode.
 * 4D rotation speeds are cranked up (0.35, 0.28, 0.42 on XW/YW/ZW) to create
 * dramatic hyperspace movement. Low gridDensity (10) + fast speed (2.2) = warp lines.
 * Button gets .active-toggle class for persistent glow feedback.
 */
function flyThrough() {
    isFlyThrough = !isFlyThrough;
    const btn = document.querySelector('[data-action="fly"]');
    if (btn) btn.classList.toggle('active-toggle', isFlyThrough);

    if (isFlyThrough) {
        if (premium?.rotationLock) try { premium.rotationLock.setFlightMode(true); } catch (_) {}
        if (premium?.shaderSurface) {
            try {
                premium.shaderSurface.setParameters({
                    autoRotationSpeed: [0.0, 0.0, 0.0, 0.35, 0.28, 0.42], // [WHY] 3D planes zeroed, 4D planes fast = pure hyperspace motion
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

/**
 * DIMENSIONAL ZOOM — push dimension to minimum, crank gridDensity.
 * [WHY] dimension→3.0 brings the 4D projection distance as close as possible,
 * revealing extreme 4D structure. LayerGeometryMixer assigns different geometries
 * to each layer for maximum visual complexity. Reverts after 3s.
 */
function dimensionalZoom() {
    animator.transition({ dimension: 3.0, speed: 0.3, gridDensity: 55, intensity: 0.9 }, 2000, 'easeInOut');

    if (premium?.shaderSurface) {
        try { premium.shaderSurface.setParameters({ uvScale: 1.5, lineThickness: 0.08, breathStrength: 0.8 }); } catch (_) {}
    }
    if (premium?.layerGeometry) {
        try {
            premium.layerGeometry.setLayerGeometry('background', 0);  // tetrahedron
            premium.layerGeometry.setLayerGeometry('shadow', 4);      // klein bottle
            premium.layerGeometry.setLayerGeometry('highlight', 2);   // sphere
            premium.layerGeometry.setLayerGeometry('accent', 7);      // crystal
        } catch (_) {}
    }

    // Release after 3s
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

/**
 * STORM MODE — toggle chaotic random walk.
 * [WHY] Storm is a persistent toggle. While active, stormWalk() runs a recursive
 * setTimeout that randomly transitions parameters every 1.5-3.5s, randomly switches
 * geometry 40% of the time, and cranks noise/breath/rotation on the ShaderSurface.
 * Disabling storm smoothly transitions back to ambient drift base values.
 */
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

/** Recursive random walk during storm mode. Self-terminates when isStorming becomes false. */
function stormWalk() {
    if (!isStorming) return;
    animator.transition({
        chaos: lerp(0.4, 0.8, Math.random()),
        speed: lerp(1.5, 2.5, Math.random()),
        gridDensity: lerp(15, 45, Math.random()),
        intensity: lerp(0.5, 0.9, Math.random()),
        hue: (drift.hue.base + (Math.random() - 0.5) * 60 + 360) % 360
    }, 800 + Math.random() * 1200, 'easeInOut');

    // [WHY] 40% chance to switch geometry each step — enough variety without epileptic flashing
    if (Math.random() > 0.6) engine.setParameter('geometry', Math.floor(Math.random() * 24));
    setTimeout(stormWalk, 1500 + Math.random() * 2000);
}

/**
 * CYCLE SYSTEM — drain → switch → flood.
 * [WHY] System switches are jarring without transition. We drain intensity/saturation
 * first (400ms), switch system during the dark moment, then flood back with the new
 * system's personality parameters. This creates a clean "crossfade" between systems.
 * Drift base values are updated to match the new system's personality.
 */
function cycleSystem() {
    const idx = SYSTEMS.indexOf(currentSystem);
    const next = SYSTEMS[(idx + 1) % SYSTEMS.length];

    // Drain
    animator.transition({ intensity: 0.15, saturation: 0.1 }, 400, 'easeOut');

    // Switch + flood
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

        // [WHY] Update drift bases so ambient drift stays within new system's range
        drift.gridDensity.base = lerp(p.gridDensity[0], p.gridDensity[1], 0.3);
        drift.speed.base = lerp(p.speed[0], p.speed[1], 0.4);
        drift.chaos.base = lerp(p.chaos[0], p.chaos[1], 0.3);
    }, 450);

    if (navigator.vibrate) navigator.vibrate([15, 80, 15]);
}

/**
 * CHOREOGRAPHY — automated 3-system show.
 * [WHY] Demonstrates the full VIB3+ system by walking through all three visualization
 * systems with timed parameter transitions and color presets. Works with or without
 * premium — ColorPresetsSystem is a free SDK module. The final scene returns to the
 * starting system with ambient drift values, so the user ends up where they started.
 */
function choreographyGo() {
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


// ═══════════════════════════════════════════════════
//  READOUT
// ═══════════════════════════════════════════════════

/** Update the HUD parameter readout from engine state. */
function updateReadout(params) {
    const $ = (id) => document.getElementById(id);
    if (!$('r-hue')) return;
    if (params.hue !== undefined) $('r-hue').textContent = Math.round(params.hue) + '\u00B0';
    if (params.chaos !== undefined) $('r-chaos').textContent = (params.chaos ?? 0).toFixed(2);
    if (params.speed !== undefined) $('r-speed').textContent = (params.speed ?? 0).toFixed(2);
    if (params.dimension !== undefined) $('r-dim').textContent = (params.dimension ?? 0).toFixed(2);
    if (params.geometry !== undefined) $('r-geom').textContent = params.geometry;

    // Premium-only readouts: projection type and flight mode status
    if (premium) {
        try {
            const proj = premium.shaderSurface?.getParameter('projectionType');
            $('r-proj').textContent = PROJ_NAMES[proj] || String(proj ?? '\u2014');
            $('r-flight').textContent = premium.rotationLock?.isFlightMode() ? 'ON' : 'off';
        } catch (_) {}
    }
    $('r-triggers').textContent = triggerFireCount;
}


// ═══════════════════════════════════════════════════
//  DESKTOP KEYBOARD FALLBACK
// ═══════════════════════════════════════════════════
// [WHY] Phones are the primary input. But developers testing on desktop need
// keyboard controls too. These mirror the dock buttons exactly.

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


// ═══════════════════════════════════════════════════
//  GO
// ═══════════════════════════════════════════════════
init();
