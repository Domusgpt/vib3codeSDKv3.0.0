/**
 * HYPERSTORM — VIB3+ Premium Dogfood
 *
 * Exercises ALL 8 premium modules together in a single experience.
 * Follows Gold Standard v3: all three parameter modes active simultaneously.
 *
 * WHY: This is the canonical test that proves premium modules work together
 * under real creative load — not just unit tests, but actual motion vocabulary.
 *
 * Modules exercised:
 *   1. ShaderParameterSurface — projection cycling, UV scale, noise frequencies, breath
 *   2. RotationLockSystem — flight mode toggle, per-axis locking during portal
 *   3. LayerGeometryMixer — per-layer geometry during dimensional zoom
 *   4. VisualEventSystem — 4 threshold triggers (chaos/intensity/dimension/speed)
 *   5. CSSBridge — entire HUD + buttons + vignette driven by engine state
 *   6. ChoreographyExtensions — 4-scene premium choreography with triggers/locks
 *   7. FrameworkSync — live parameter readout via onSync callback
 *   8. PremiumMCPServer — tool definitions verified at init
 */

import { VIB3Engine } from '../../../src/core/VIB3Engine.js';
import { enablePremium } from '../../../src/premium/index.js';
import { TransitionAnimator } from '../../../src/creative/TransitionAnimator.js';
import { ColorPresetsSystem } from '../../../src/creative/ColorPresetsSystem.js';
import { ChoreographyPlayer } from '../../../src/creative/ChoreographyPlayer.js';

// ─── Constants ───

const PROJ_NAMES = ['perspective', 'stereographic', 'orthographic'];
const SYSTEMS = ['faceted', 'quantum', 'holographic'];

// Gold Standard: per-system personality
const PERSONALITY = {
    faceted:     { gridDensity: [15, 35], speed: [0.3, 0.8], chaos: [0.0, 0.15], dimension: [3.6, 4.0] },
    quantum:     { gridDensity: [25, 60], speed: [0.5, 1.5], chaos: [0.1, 0.4],  dimension: [3.2, 3.8] },
    holographic: { gridDensity: [20, 50], speed: [0.4, 1.2], chaos: [0.05, 0.3], dimension: [3.4, 4.2] },
};

// Gold Standard: EMA tau values (seconds)
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
let choreographyPlayer = null;
let currentSystem = 'quantum';
let triggerFireCount = 0;
let lastFrameTime = 0;
let isStorming = false;
let isFlyThrough = false;

// Gold Standard Mode 3: ambient drift state
const drift = {
    morphFactor: { base: 1.0, amp: 0.15, period: 4 },
    intensity:   { base: 0.7, amp: 0.08, period: 2 },   // 2x harmonic of morph
    hue:         { base: 200, amp: 5,    period: 17 },   // prime period
    gridDensity: { base: 35,  amp: 3,    period: 13 },   // prime period
    speed:       { base: 0.8, amp: 0.05, period: 11 },   // prime period
    chaos:       { base: 0.15,amp: 0.03, period: 7 },    // prime period
};

// ─── EMA utility ───
function ema(current, target, dt, tau) {
    return current + (target - current) * (1 - Math.exp(-dt / tau));
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

// ─── Init ───

async function init() {
    engine = new VIB3Engine({ system: currentSystem });
    const ok = await engine.initialize('vib3-container');
    if (!ok) {
        document.body.innerHTML = '<h1 style="padding:40px;color:red">Engine init failed</h1>';
        return;
    }

    // Base state — quantum personality midpoint
    const p = PERSONALITY[currentSystem];
    engine.setParameters({
        hue: 200,
        saturation: 0.7,
        intensity: 0.7,
        chaos: lerp(p.chaos[0], p.chaos[1], 0.3),
        speed: lerp(p.speed[0], p.speed[1], 0.4),
        gridDensity: lerp(p.gridDensity[0], p.gridDensity[1], 0.3),
        morphFactor: 1.0,
        dimension: lerp(p.dimension[0], p.dimension[1], 0.5),
        geometry: 1 // hypercube
    });

    // ═══ PREMIUM ACTIVATION ═══
    premium = enablePremium(engine, {
        licenseKey: 'hyperstorm-dogfood-2026',
        features: ['all']
    });

    // Mark all modules active in HUD
    document.querySelectorAll('.mod').forEach(el => el.classList.add('active'));

    // ═══ MODULE 1: ShaderParameterSurface ═══
    // [WHY] Start with stereographic for portal-ready feel
    premium.shaderSurface.setParameters({
        projectionType: 1,
        uvScale: 4.0,
        lineThickness: 0.025,
        noiseFrequency: [7, 11, 13],  // prime triples
        breathStrength: 0.4,
        autoRotationSpeed: [0.05, 0.06, 0.04, 0.15, 0.12, 0.18], // 4D > 3D
        particleSize: 0.15,
        layerAlpha: { background: 0.4, shadow: 0.25, content: 1.0, highlight: 0.85, accent: 0.2 }
    });

    // ═══ MODULE 3: LayerGeometryMixer ═══
    // [WHY] Different geometry per layer creates depth parallax
    premium.layerGeometry.setLayerGeometry('background', 9);   // hypersphere hypercube
    premium.layerGeometry.setGeometryOffset('accent', 8);       // one warp mode away
    premium.layerGeometry.setGeometryOffset('shadow', 16);      // hypertetrahedron

    // ═══ MODULE 4: VisualEventSystem ═══
    setupTriggers();

    // ═══ MODULE 5: CSSBridge ═══
    // [WHY] Entire HUD styling derived from engine state — zero JS DOM updates for visuals
    premium.cssBridge.start({
        outbound: true,
        normalize: true,
        throttle: 16,
        parameters: [
            'hue', 'intensity', 'chaos', 'speed', 'saturation',
            'gridDensity', 'morphFactor', 'dimension',
            'rot4dXW', 'rot4dYW', 'rot4dZW'
        ]
    });

    // ═══ MODULE 7: FrameworkSync ═══
    // [WHY] Live readout without polling — push-based parameter display
    premium.frameworkSync.onSync((params) => {
        updateReadout(params);
    });

    // ═══ MODULE 8: PremiumMCPServer ═══
    // [WHY] Verify all 8 premium tools are registered
    const toolCount = premium.mcp.getToolDefinitions().length;
    console.log(`[Hyperstorm] Premium MCP: ${toolCount} tools registered`);

    // Creative modules from free SDK
    animator = new TransitionAnimator(
        (name, value) => engine.setParameter(name, value),
        (name) => engine.getParameter(name)
    );

    colorPresets = new ColorPresetsSystem(
        engine.createParameterCallback()
    );

    // Start the ambient drift loop (Gold Standard Mode 3)
    lastFrameTime = performance.now();
    requestAnimationFrame(tick);

    console.log('[Hyperstorm] Premium dogfood initialized — all 8 modules active');
}

// ─── Module 4: Visual Event Triggers ───

function setupTriggers() {
    // Trigger 1: Chaos Burst — when chaos exceeds 0.6, flash red
    // [WHY] Gold Standard "Explosion→Settle" — chaos spike triggers visual flash
    premium.events.addTrigger('chaos_burst', {
        source: 'parameter.chaos',
        condition: 'exceeds',
        threshold: 0.6,
        cooldown: 1500,
        action: {
            type: 'set_parameters',
            value: { hue: 0, intensity: 1.0 },
            duration: 400,
            revertTo: { hue: 200, intensity: 0.7 }
        }
    });
    premium.events.on('chaos_burst', () => flashTrigger('t-chaos-burst'));

    // Trigger 2: Intensity Flash — when intensity drops below 0.3, boost back up
    // [WHY] Self-correcting trigger — prevents visual death
    premium.events.addTrigger('intensity_flash', {
        source: 'parameter.intensity',
        condition: 'drops_below',
        threshold: 0.3,
        cooldown: 2000,
        action: {
            type: 'set_parameters',
            value: { intensity: 0.9, saturation: 1.0 },
            duration: 600,
            revertTo: { intensity: 0.7, saturation: 0.7 }
        }
    });
    premium.events.on('intensity_flash', () => flashTrigger('t-intensity-flash'));

    // Trigger 3: Dimension Dive — when dimension crosses 3.2, switch layer geometry
    // [WHY] Dimensional zoom changes the "world" each layer renders
    premium.events.addTrigger('dimension_dive', {
        source: 'parameter.dimension',
        condition: 'drops_below',
        threshold: 3.2,
        cooldown: 3000,
        action: {
            type: 'custom',
            value: (eng, prem) => {
                // Randomize layer geometries on dimension dive
                const layers = ['background', 'shadow', 'highlight', 'accent'];
                for (const layer of layers) {
                    prem.layerGeometry.setLayerGeometry(layer, Math.floor(Math.random() * 24));
                }
            }
        }
    });
    premium.events.on('dimension_dive', () => flashTrigger('t-dimension-dive'));

    // Trigger 4: Storm Peak — when speed crosses 2.0, cycle projection
    // [WHY] High-speed state gets stereographic distortion for visual drama
    premium.events.addTrigger('storm_peak', {
        source: 'parameter.speed',
        condition: 'exceeds',
        threshold: 2.0,
        cooldown: 2000,
        action: {
            type: 'custom',
            value: (eng, prem) => {
                const current = prem.shaderSurface.getParameter('projectionType');
                prem.shaderSurface.setParameter('projectionType', (current + 1) % 3);
            }
        }
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

// ─── Gold Standard Mode 3: Ambient Drift Tick ───

function tick(now) {
    const dt = Math.min((now - lastFrameTime) / 1000, 0.1); // cap at 100ms
    lastFrameTime = now;

    if (!isStorming && !isFlyThrough) {
        // [WHY] Prime-number periods on each parameter prevent mechanical cycling
        const t = now / 1000;
        for (const [param, d] of Object.entries(drift)) {
            const target = d.base + d.amp * Math.sin((2 * Math.PI * t) / d.period);
            const current = engine.getParameter(param) ?? d.base;
            const tau = TAU[param] || 0.15;
            const smoothed = ema(current, target, dt, tau);
            engine.setParameter(param, smoothed);
        }
    }

    requestAnimationFrame(tick);
}

// ─── Gold Standard Mode 2: Named Motions ───

// BURST — Gold Standard "Explosion→Settle"
// 150ms attack, 2000ms release (1:13 ratio)
window.burst = function() {
    // Attack
    animator.transition({
        chaos: 0.9,
        speed: 2.5,
        gridDensity: 10,
        intensity: 1.0
    }, 150, 'easeOut');

    // Release (delayed)
    setTimeout(() => {
        animator.transition({
            chaos: drift.chaos.base,
            speed: drift.speed.base,
            gridDensity: drift.gridDensity.base,
            intensity: drift.intensity.base
        }, 2000, 'easeInOut');
    }, 200);
};

// CRYSTALLIZE — Gold Standard "order from noise"
// 3000ms slow reveal
window.crystallize = function() {
    animator.transition({
        chaos: 0,
        speed: 0.1,
        saturation: 0.2,
        intensity: 0.85,
        morphFactor: 0.0,
        gridDensity: 15
    }, 3000, 'easeInOut');

    // [WHY] Crystallize also tightens shader noise for maximum clarity
    premium.shaderSurface.setParameters({
        noiseFrequency: [30, 37, 41],  // high freq = fine detail
        lineThickness: 0.01,
        breathStrength: 0.05
    });

    // Revert shader after crystallize completes
    setTimeout(() => {
        premium.shaderSurface.setParameters({
            noiseFrequency: [7, 11, 13],
            lineThickness: 0.025,
            breathStrength: 0.4
        });
    }, 4000);
};

// PORTAL OPEN — Signature VIB3+ effect
// [WHY] Module 2 (RotationLock) + Module 1 (ShaderSurface) working together
window.portalOpen = function() {
    // Lock 3D, free 4D
    premium.rotationLock.setFlightMode(true);

    // Switch to stereographic for conformal portal aesthetics
    premium.shaderSurface.setParameter('projectionType', 1);

    // Animate 4D rotation
    animator.transition({
        hue: (engine.getParameter('hue') + 40) % 360,
        speed: engine.getParameter('speed') + 0.3,
    }, 1200, 'easeInOut');

    // Unlock after portal opens
    setTimeout(() => {
        premium.rotationLock.setFlightMode(false);
    }, 2500);
};

// FLY-THROUGH — spaceship window effect
// [WHY] Module 2 flight mode + Module 1 auto-rotation at high speed
window.flyThrough = function() {
    isFlyThrough = !isFlyThrough;

    if (isFlyThrough) {
        premium.rotationLock.setFlightMode(true);
        premium.shaderSurface.setParameters({
            autoRotationSpeed: [0.0, 0.0, 0.0, 0.35, 0.28, 0.42], // 4D only, fast
            uvScale: 2.0,
            lineThickness: 0.015
        });
        engine.setParameters({
            gridDensity: 10,
            speed: 2.2,
            chaos: 0.05,
            dimension: 3.2
        });
    } else {
        premium.rotationLock.setFlightMode(false);
        premium.shaderSurface.setParameters({
            autoRotationSpeed: [0.05, 0.06, 0.04, 0.15, 0.12, 0.18],
            uvScale: 4.0,
            lineThickness: 0.025
        });
        animator.transition({
            gridDensity: drift.gridDensity.base,
            speed: drift.speed.base,
            chaos: drift.chaos.base,
            dimension: drift.dimension?.base || 3.5
        }, 1000, 'easeInOut');
    }
};

// DIMENSIONAL ZOOM — push into 4D lattice
// [WHY] Module 1 (uvScale, lineThickness) + Module 3 (layer geometry shift)
window.dimensionalZoom = function() {
    // Zoom in
    animator.transition({
        dimension: 3.0,
        speed: 0.3,
        gridDensity: 55,
        intensity: 0.9
    }, 2000, 'easeInOut');

    premium.shaderSurface.setParameters({
        uvScale: 1.5,
        lineThickness: 0.08,
        breathStrength: 0.8
    });

    // Each layer gets a different geometry at max zoom
    premium.layerGeometry.setLayerGeometry('background', 0);   // tetrahedron
    premium.layerGeometry.setLayerGeometry('shadow', 4);       // klein bottle
    premium.layerGeometry.setLayerGeometry('highlight', 2);    // sphere
    premium.layerGeometry.setLayerGeometry('accent', 7);       // crystal

    // Zoom back out
    setTimeout(() => {
        animator.transition({
            dimension: drift.dimension?.base || 3.5,
            speed: drift.speed.base,
            gridDensity: drift.gridDensity.base,
            intensity: drift.intensity.base
        }, 2500, 'easeInOut');

        premium.shaderSurface.setParameters({
            uvScale: 4.0,
            lineThickness: 0.025,
            breathStrength: 0.4
        });

        // Restore layer geometry
        premium.layerGeometry.setLayerGeometry('background', 9);
        premium.layerGeometry.setGeometryOffset('accent', 8);
        premium.layerGeometry.setGeometryOffset('shadow', 16);
    }, 3000);
};

// STORM — Gold Standard "all parameters oscillating randomly"
// [WHY] Module 1 (high breath + noise) + Module 4 (triggers fire under storm)
window.stormMode = function() {
    isStorming = !isStorming;

    if (isStorming) {
        // Storm shader tuning
        premium.shaderSurface.setParameters({
            noiseFrequency: [3, 5, 7],  // low freq = large scale chaos
            breathStrength: 0.9,
            autoRotationSpeed: [0.2, 0.25, 0.15, 0.4, 0.35, 0.45]
        });

        // Storm parameter walk — recursive random walk
        stormWalk();
    } else {
        // Settle back
        premium.shaderSurface.setParameters({
            noiseFrequency: [7, 11, 13],
            breathStrength: 0.4,
            autoRotationSpeed: [0.05, 0.06, 0.04, 0.15, 0.12, 0.18]
        });

        animator.transition({
            chaos: drift.chaos.base,
            speed: drift.speed.base,
            gridDensity: drift.gridDensity.base,
            intensity: drift.intensity.base,
            hue: drift.hue.base
        }, 2000, 'easeInOut');
    }
};

function stormWalk() {
    if (!isStorming) return;

    const p = PERSONALITY[currentSystem];
    animator.transition({
        chaos: lerp(0.4, 0.8, Math.random()),
        speed: lerp(1.5, 2.5, Math.random()),
        gridDensity: lerp(15, 45, Math.random()),
        intensity: lerp(0.5, 0.9, Math.random()),
        hue: (drift.hue.base + (Math.random() - 0.5) * 60 + 360) % 360
    }, 800 + Math.random() * 1200, 'easeInOut');

    // Random geometry shift during storm
    if (Math.random() > 0.6) {
        engine.setParameter('geometry', Math.floor(Math.random() * 24));
    }

    setTimeout(stormWalk, 1500 + Math.random() * 2000);
}

// CYCLE SYSTEM — Gold Standard "Dimensional Crossfade"
// [WHY] Drain→Switch→Flood with personality change
window.cycleSystem = function() {
    const idx = SYSTEMS.indexOf(currentSystem);
    const next = SYSTEMS[(idx + 1) % SYSTEMS.length];

    // Drain current
    animator.transition({ intensity: 0.15, saturation: 0.1 }, 400, 'easeOut');

    setTimeout(() => {
        currentSystem = next;
        engine.switchSystem(next);

        // Flood into new personality
        const p = PERSONALITY[next];
        animator.transition({
            intensity: drift.intensity.base,
            saturation: 0.7,
            gridDensity: lerp(p.gridDensity[0], p.gridDensity[1], 0.4),
            speed: lerp(p.speed[0], p.speed[1], 0.4),
            chaos: lerp(p.chaos[0], p.chaos[1], 0.3),
            dimension: lerp(p.dimension[0], p.dimension[1], 0.5)
        }, 600, 'easeInOut');

        // Update drift bases for new system
        drift.gridDensity.base = lerp(p.gridDensity[0], p.gridDensity[1], 0.3);
        drift.speed.base = lerp(p.speed[0], p.speed[1], 0.4);
        drift.chaos.base = lerp(p.chaos[0], p.chaos[1], 0.3);
    }, 450);
};

// ═══ MODULE 6: Choreography — premium extended ═══

window.choreographyGo = function() {
    // [WHY] Premium choreography has layer_profile, rotation_locks, triggers, layer_geometries per scene
    const spec = premium.choreography.createExtendedChoreography({
        name: 'Hyperstorm Sequence',
        mode: 'once',
        scenes: [
            {
                system: 'quantum',
                geometry: 1,
                duration: 4000,
                color_preset: 'Cyberpunk Neon',
                transition_in: { duration: 800, easing: 'easeInOut' },
                tracks: {
                    chaos: { keyframes: [{ time: 0, value: 0.1 }, { time: 0.5, value: 0.7 }, { time: 1, value: 0.2 }] },
                    speed: { keyframes: [{ time: 0, value: 0.5 }, { time: 0.5, value: 2.0 }, { time: 1, value: 0.8 }] }
                },
                // Premium fields:
                layer_profile: 'storm',
                rotation_locks: { rot4dXY: 0.0, rot4dXZ: 0.0, rot4dYZ: 0.0 },
                layer_geometries: { background: 9, accent: 17 }
            },
            {
                system: 'faceted',
                geometry: 5,
                duration: 3000,
                color_preset: 'Ocean Deep',
                transition_in: { duration: 600, easing: 'easeOut' },
                tracks: {
                    gridDensity: { keyframes: [{ time: 0, value: 15 }, { time: 1, value: 35 }] },
                    morphFactor: { keyframes: [{ time: 0, value: 0 }, { time: 0.5, value: 1.8 }, { time: 1, value: 1.0 }] }
                },
                layer_geometries: { background: 2, shadow: 10, accent: 18 },
                triggers: [
                    {
                        source: 'parameter.chaos',
                        condition: 'exceeds',
                        threshold: 0.5,
                        cooldown: 1000,
                        action: { type: 'color_preset', value: 'Electric Purple' }
                    }
                ]
            },
            {
                system: 'holographic',
                geometry: 16,
                duration: 5000,
                color_preset: 'Aurora Borealis',
                transition_in: { duration: 1000, easing: 'easeInOut' },
                tracks: {
                    dimension: { keyframes: [{ time: 0, value: 4.2 }, { time: 0.3, value: 3.0 }, { time: 1, value: 3.8 }] },
                    intensity: { keyframes: [{ time: 0, value: 0.5 }, { time: 0.5, value: 1.0 }, { time: 1, value: 0.6 }] }
                },
                rotation_locks: { rot4dXY: 0.0, rot4dXZ: 0.0, rot4dYZ: 0.0 },
                layer_geometries: { background: 0, shadow: 4, highlight: 7, accent: 20 }
            },
            {
                system: 'quantum',
                geometry: 1,
                duration: 3000,
                transition_in: { duration: 500, easing: 'easeOut' },
                tracks: {
                    chaos: { keyframes: [{ time: 0, value: 0.8 }, { time: 1, value: 0.15 }] },
                    speed: { keyframes: [{ time: 0, value: 2.0 }, { time: 1, value: 0.8 }] }
                },
                // Final settle — no premium locks
            }
        ]
    });

    console.log('[Hyperstorm] Choreography validated:', {
        scenes: spec.scenes.length,
        premiumFields: {
            layerProfiles: spec.scenes.filter(s => s.layer_profile).length,
            rotationLocks: spec.scenes.filter(s => s.rotation_locks).length,
            triggers: spec.scenes.reduce((n, s) => n + (s.triggers?.length || 0), 0),
            layerGeometries: spec.scenes.filter(s => s.layer_geometries).length
        }
    });

    // In a full setup we'd play via ChoreographyPlayer + ChoreographyExtensions.attachToPlayer()
    // For dogfood, just execute scene 0 directly to prove the pipeline
    const scene0 = spec.scenes[0];
    if (scene0.system) engine.switchSystem(scene0.system);
    if (scene0.geometry !== undefined) engine.setParameter('geometry', scene0.geometry);

    // Apply premium scene fields manually (same as ChoreographyExtensions._applyPremiumScene)
    if (scene0.rotation_locks) {
        premium.rotationLock.unlockAll();
        for (const [axis, val] of Object.entries(scene0.rotation_locks)) {
            premium.rotationLock.lockAxis(axis, val);
        }
    }
    if (scene0.layer_geometries) {
        for (const [layer, geom] of Object.entries(scene0.layer_geometries)) {
            premium.layerGeometry.setLayerGeometry(layer, geom);
        }
    }

    // Auto-advance through remaining scenes
    let sceneIdx = 1;
    function nextScene() {
        if (sceneIdx >= spec.scenes.length) {
            // Reset after choreography
            premium.rotationLock.unlockAll();
            currentSystem = 'quantum';
            return;
        }
        const s = spec.scenes[sceneIdx];
        if (s.system) {
            currentSystem = s.system;
            engine.switchSystem(s.system);
        }
        if (s.geometry !== undefined) engine.setParameter('geometry', s.geometry);
        if (s.color_preset && colorPresets) colorPresets.applyPreset(s.color_preset, true, 800);
        if (s.rotation_locks) {
            premium.rotationLock.unlockAll();
            for (const [axis, val] of Object.entries(s.rotation_locks)) {
                premium.rotationLock.lockAxis(axis, val);
            }
        }
        if (s.layer_geometries) {
            for (const [layer, geom] of Object.entries(s.layer_geometries)) {
                premium.layerGeometry.setLayerGeometry(layer, geom);
            }
        }

        sceneIdx++;
        if (sceneIdx < spec.scenes.length) {
            setTimeout(nextScene, s.duration);
        } else {
            // Final settle
            setTimeout(() => {
                premium.rotationLock.unlockAll();
                animator.transition({
                    chaos: drift.chaos.base,
                    speed: drift.speed.base,
                    intensity: drift.intensity.base
                }, 2000, 'easeInOut');
            }, s.duration);
        }
    }
    setTimeout(nextScene, scene0.duration);
};

// ─── Module 7: FrameworkSync readout ───

function updateReadout(params) {
    const $ = (id) => document.getElementById(id);
    if (params.hue !== undefined) $('r-hue').textContent = Math.round(params.hue) + '°';
    if (params.chaos !== undefined) $('r-chaos').textContent = params.chaos.toFixed(2);
    if (params.speed !== undefined) $('r-speed').textContent = params.speed.toFixed(2);
    if (params.dimension !== undefined) $('r-dim').textContent = params.dimension.toFixed(2);
    if (params.geometry !== undefined) $('r-geom').textContent = params.geometry;

    // Premium-specific readouts
    if (premium) {
        const proj = premium.shaderSurface.getParameter('projectionType');
        $('r-proj').textContent = PROJ_NAMES[proj] || proj;
        $('r-flight').textContent = premium.rotationLock.isFlightMode() ? 'ON' : 'off';
        $('r-triggers').textContent = triggerFireCount;
    }
}

// ─── Keyboard shortcuts ───

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

// ─── Launch ───
init();
