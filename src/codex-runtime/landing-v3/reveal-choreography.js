/**
 * Reveal Choreography System — Multi-Layer Parallax Overlay
 *
 * Creates solid/glass overlay layers OVER the visualizer canvases.
 * These layers move, split, iris, and dissolve to reveal the visualizers
 * through negative space, replacing the old rectangular section transitions.
 *
 * Architecture:
 *   1. Persistent parallax field (subtle depth texture, 0.3x scroll speed)
 *   2. Section transition layers (unique per boundary):
 *      - Opening→Hero: Iris aperture expanding from center
 *      - Hero→Morph: Diagonal bars from corners criss-crossing
 *      - Morph→Playground: Column split sliding aside
 *      - Playground→Triptych: Glass panels retracting
 *      - Triptych→Cascade: Bezel bars from all 4 edges forming checkerboard
 *      - Cascade→Energy: Concentric iris opening
 *      - Energy→Agent: Diagonal wipe
 *      - Agent→CTA: Checkerboard stagger dissolve
 *   3. Persistent glassmorphic accent strips (3 floating panels)
 *
 * Dependencies: GSAP 3.12+, ScrollTrigger
 */

export function initRevealChoreography() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('[reveal] GSAP/ScrollTrigger not available, skipping reveal layers');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // ── Create DOM layers ──
    createParallaxField();
    createSectionTransitions();
    createFloatingAccents();
    createGlowLines();
}

/* ═══════════════════════════════════════════
   PARALLAX DEPTH FIELD
   Subtle geometric overlay moving at 0.3x scroll
   ═══════════════════════════════════════════ */
function createParallaxField() {
    const field = document.createElement('div');
    field.className = 'reveal-layer parallax-field';
    field.id = 'parallaxField';
    field.setAttribute('aria-hidden', 'true');
    document.body.appendChild(field);

    // Parallax: field moves at 30% of scroll speed
    gsap.to(field, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5,
        }
    });
}

/* ═══════════════════════════════════════════
   SECTION TRANSITION LAYERS
   Each section boundary gets a unique reveal pattern
   ═══════════════════════════════════════════ */
function createSectionTransitions() {
    // 1. Opening → Hero: Iris aperture
    createIrisTransition(
        '#openingSection',
        '#main',
        { x: 50, y: 50, startRadius: 0, endRadius: 85 }
    );

    // 2. Hero → Morph: Diagonal bars from corners
    createDiagonalBarTransition(
        '#main',
        '#morphSection',
        { count: 10, angle: -20, staggerFrom: 'edges' }
    );

    // 3. Morph → Playground: Column split
    createColumnSplitTransition(
        '#morphSection',
        '#playgroundSection',
        { cols: 6, glass: true }
    );

    // 4. Playground → Triptych: Glass panel retraction
    createGlassPanelTransition(
        '#playgroundSection',
        '#triptychSection'
    );

    // 5. Triptych → Cascade: Bezel bars criss-cross into checkerboard
    createBezelBarTransition(
        '#triptychSection',
        '#cascadeSection',
        { barsPerEdge: 5 }
    );

    // 6. Cascade → Energy: Iris
    createIrisTransition(
        '#cascadeSection',
        '#energySection',
        { x: 50, y: 40, startRadius: 0, endRadius: 90 }
    );

    // 7. Energy → Agent: Diagonal wipe
    createDiagonalBarTransition(
        '#energySection',
        '#agentSection',
        { count: 6, angle: 25, staggerFrom: 'start' }
    );

    // 8. Agent → CTA: Checkerboard dissolve
    createCheckerboardTransition(
        '#agentSection',
        '#ctaSection',
        { cols: 10, rows: 6 }
    );
}


/* ── IRIS APERTURE ── */
function createIrisTransition(triggerSel, nextSel, opts) {
    const trigger = document.querySelector(triggerSel);
    const next = document.querySelector(nextSel);
    if (!trigger || !next) return;

    // Create the iris overlay (solid bg with circular hole)
    const iris = document.createElement('div');
    iris.className = 'reveal-layer--absolute reveal-iris--invert';
    iris.setAttribute('aria-hidden', 'true');
    iris.style.cssText = `
        position: absolute; inset: -2px; z-index: 20; pointer-events: none;
        --iris-radius: ${opts.startRadius}px;
        --iris-x: ${opts.x}%;
        --iris-y: ${opts.y}%;
    `;
    next.style.position = 'relative';
    next.appendChild(iris);

    // Concentric ring accents
    for (let i = 0; i < 3; i++) {
        const ring = document.createElement('div');
        ring.className = 'iris-ring';
        ring.style.cssText = `--ring-scale: ${0.3 + i * 0.2}; --ring-opacity: 0;`;
        iris.appendChild(ring);
    }

    const maxR = Math.max(window.innerWidth, window.innerHeight) * (opts.endRadius / 100);

    gsap.to(iris, {
        '--iris-radius': `${maxR}px`,
        ease: 'power2.inOut',
        scrollTrigger: {
            trigger: next,
            start: 'top 90%',
            end: 'top 20%',
            scrub: 0.5,
        },
        onComplete: () => { iris.style.display = 'none'; }
    });

    // Animate rings
    const rings = iris.querySelectorAll('.iris-ring');
    rings.forEach((ring, i) => {
        gsap.to(ring, {
            '--ring-scale': 1 + i * 0.3,
            '--ring-opacity': 0.4 - i * 0.1,
            ease: 'power1.out',
            scrollTrigger: {
                trigger: next,
                start: `top ${95 - i * 5}%`,
                end: `top ${40 - i * 5}%`,
                scrub: 0.5,
            }
        });
    });
}


/* ── DIAGONAL BARS ── */
function createDiagonalBarTransition(triggerSel, nextSel, opts) {
    const next = document.querySelector(nextSel);
    if (!next) return;

    const container = document.createElement('div');
    container.className = 'section-reveal-layer';
    container.setAttribute('aria-hidden', 'true');
    next.appendChild(container);

    const bars = [];
    for (let i = 0; i < opts.count; i++) {
        const bar = document.createElement('div');
        bar.className = 'reveal-bar reveal-bar--diag';
        const yPos = (i / opts.count) * 100;
        bar.style.cssText = `
            top: ${yPos}%;
            --bar-angle: ${opts.angle}deg;
            --bar-count: ${opts.count};
            background: var(--bg);
        `;
        container.appendChild(bar);
        bars.push(bar);
    }

    // Stagger bars sliding out
    const stagger = opts.staggerFrom === 'edges'
        ? { from: 'edges', each: 0.03 }
        : { from: 'start', each: 0.04 };

    gsap.fromTo(bars, {
        '--bar-tx': '0%',
        opacity: 1
    }, {
        '--bar-tx': (i) => i % 2 === 0 ? '120%' : '-120%',
        opacity: 0,
        stagger,
        ease: 'power2.inOut',
        scrollTrigger: {
            trigger: next,
            start: 'top 85%',
            end: 'top 15%',
            scrub: 0.5,
        }
    });
}


/* ── COLUMN SPLIT ── */
function createColumnSplitTransition(triggerSel, nextSel, opts) {
    const next = document.querySelector(nextSel);
    if (!next) return;

    const container = document.createElement('div');
    container.className = 'section-reveal-layer reveal-columns';
    container.setAttribute('aria-hidden', 'true');
    container.style.display = 'flex';
    next.appendChild(container);

    const cols = [];
    for (let i = 0; i < opts.cols; i++) {
        const col = document.createElement('div');
        col.className = `reveal-col ${opts.glass ? 'reveal-col--glass' : ''}`;
        container.appendChild(col);
        cols.push(col);
    }

    // Columns slide out alternating left/right
    gsap.fromTo(cols, {
        xPercent: 0
    }, {
        xPercent: (i) => i % 2 === 0 ? -120 : 120,
        stagger: { from: 'center', each: 0.02 },
        ease: 'power3.inOut',
        scrollTrigger: {
            trigger: next,
            start: 'top 80%',
            end: 'top 10%',
            scrub: 0.5,
        }
    });
}


/* ── GLASS PANEL RETRACTION ── */
function createGlassPanelTransition(triggerSel, nextSel) {
    const next = document.querySelector(nextSel);
    if (!next) return;

    const positions = ['top', 'bottom', 'left', 'right'];
    const panels = [];

    positions.forEach(pos => {
        const panel = document.createElement('div');
        panel.className = `reveal-glass-panel reveal-glass-panel--${pos}`;
        panel.setAttribute('aria-hidden', 'true');
        next.style.position = 'relative';
        next.appendChild(panel);
        panels.push({ el: panel, pos });
    });

    // Each panel slides off in its direction
    panels.forEach(({ el, pos }) => {
        const prop = (pos === 'top' || pos === 'bottom') ? 'yPercent' : 'xPercent';
        const val = (pos === 'top' || pos === 'left') ? -110 : 110;

        gsap.fromTo(el, {
            [prop]: 0,
            opacity: 1
        }, {
            [prop]: val,
            opacity: 0,
            ease: 'power2.inOut',
            scrollTrigger: {
                trigger: next,
                start: 'top 85%',
                end: 'top 15%',
                scrub: 0.5,
            }
        });
    });
}


/* ── BEZEL BARS (from all 4 edges → checkerboard) ── */
function createBezelBarTransition(triggerSel, nextSel, opts) {
    const next = document.querySelector(nextSel);
    if (!next) return;

    const container = document.createElement('div');
    container.className = 'section-reveal-layer';
    container.setAttribute('aria-hidden', 'true');
    next.appendChild(container);

    const bars = [];
    const dirs = ['from-top', 'from-bottom', 'from-left', 'from-right'];

    dirs.forEach((dir, di) => {
        for (let i = 0; i < opts.barsPerEdge; i++) {
            const bar = document.createElement('div');
            bar.className = `bezel-bar bezel-bar--${dir}`;

            const isVert = dir === 'from-top' || dir === 'from-bottom';
            const pos = (i / opts.barsPerEdge) * 100 + (100 / opts.barsPerEdge / 2);

            if (isVert) {
                bar.style.left = `${pos}%`;
                bar.style.width = `${100 / opts.barsPerEdge}%`;
            } else {
                bar.style.top = `${pos}%`;
                bar.style.height = `${100 / opts.barsPerEdge}%`;
            }

            container.appendChild(bar);
            bars.push({ el: bar, dir, idx: i, group: di });
        }
    });

    // Phase 1: Bars enter from edges (form checkerboard)
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: next,
            start: 'top 90%',
            end: 'top 5%',
            scrub: 0.5,
        }
    });

    // First half: bars slide in to form pattern
    bars.forEach(({ el, dir, idx }) => {
        const isVert = dir === 'from-top' || dir === 'from-bottom';
        const prop = isVert ? 'yPercent' : 'xPercent';
        const enterVal = dir.includes('top') || dir.includes('left') ? -100 : 100;

        tl.fromTo(el,
            { [prop]: enterVal },
            { [prop]: 0, duration: 0.4, ease: 'power2.out' },
            idx * 0.03
        );
    });

    // Second half: bars slide out the other side
    bars.forEach(({ el, dir, idx }) => {
        const isVert = dir === 'from-top' || dir === 'from-bottom';
        const prop = isVert ? 'yPercent' : 'xPercent';
        const exitVal = dir.includes('top') || dir.includes('left') ? 100 : -100;

        tl.to(el,
            { [prop]: exitVal, duration: 0.4, ease: 'power2.in' },
            0.5 + idx * 0.03
        );
    });
}


/* ── CHECKERBOARD DISSOLVE ── */
function createCheckerboardTransition(triggerSel, nextSel, opts) {
    const next = document.querySelector(nextSel);
    if (!next) return;

    const checker = document.createElement('div');
    checker.className = 'section-reveal-layer reveal-checker';
    checker.setAttribute('aria-hidden', 'true');
    checker.style.cssText = `--checker-cols: ${opts.cols}; --checker-rows: ${opts.rows};`;
    next.appendChild(checker);

    const tiles = [];
    for (let r = 0; r < opts.rows; r++) {
        for (let c = 0; c < opts.cols; c++) {
            const tile = document.createElement('div');
            tile.className = 'checker-tile';
            checker.appendChild(tile);
            tiles.push(tile);
        }
    }

    // Stagger dissolve from center outward
    gsap.fromTo(tiles, {
        scale: 1,
        opacity: 1
    }, {
        scale: 0.5,
        opacity: 0,
        stagger: {
            grid: [opts.rows, opts.cols],
            from: 'center',
            amount: 0.8
        },
        ease: 'power2.inOut',
        scrollTrigger: {
            trigger: next,
            start: 'top 85%',
            end: 'top 15%',
            scrub: 0.5,
        }
    });
}


/* ═══════════════════════════════════════════
   FLOATING GLASSMORPHIC ACCENT STRIPS
   3 persistent panels at different parallax rates
   ═══════════════════════════════════════════ */
function createFloatingAccents() {
    const accents = [
        { width: '35vw', height: '2px', top: '25%', left: '10%', angle: -8, speed: 0.4, color: 'quantum' },
        { width: '25vw', height: '2px', top: '55%', right: '5%', angle: 12, speed: 0.6, color: 'faceted' },
        { width: '40vw', height: '2px', top: '75%', left: '30%', angle: -4, speed: 0.3, color: 'holographic' },
    ];

    const colorMap = {
        quantum: 'rgba(0,240,255,0.15)',
        faceted: 'rgba(168,85,247,0.12)',
        holographic: 'rgba(244,63,94,0.1)',
    };

    accents.forEach((a, i) => {
        const strip = document.createElement('div');
        strip.className = 'reveal-layer';
        strip.setAttribute('aria-hidden', 'true');
        strip.style.cssText = `
            position: fixed;
            width: ${a.width};
            height: ${a.height};
            top: ${a.top};
            ${a.left ? `left: ${a.left};` : ''}
            ${a.right ? `right: ${a.right};` : ''}
            background: linear-gradient(90deg, transparent, ${colorMap[a.color]}, transparent);
            transform: rotate(${a.angle}deg);
            z-index: 9;
            pointer-events: none;
            mix-blend-mode: screen;
            opacity: 0.7;
        `;
        document.body.appendChild(strip);

        // Parallax at different rates
        gsap.to(strip, {
            yPercent: -50 * a.speed,
            ease: 'none',
            scrollTrigger: {
                trigger: document.body,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.3,
            }
        });
    });
}


/* ═══════════════════════════════════════════
   GLOW LINES
   Replace ugly SVG dividers with luminous accent lines
   at section boundaries
   ═══════════════════════════════════════════ */
function createGlowLines() {
    const boundaries = [
        { section: '#main', position: 'bottom', color: 'rgba(0,240,255,0.3)', angle: null },
        { section: '#morphSection', position: 'top', color: 'rgba(0,240,255,0.2)', angle: -3 },
        { section: '#morphSection', position: 'bottom', color: 'rgba(168,85,247,0.3)', angle: null },
        { section: '#playgroundSection', position: 'bottom', color: 'rgba(168,85,247,0.2)', angle: 2 },
        { section: '#triptychSection', position: 'bottom', color: 'rgba(244,63,94,0.3)', angle: null },
        { section: '#cascadeSection', position: 'bottom', color: 'rgba(0,240,255,0.25)', angle: -1 },
        { section: '#energySection', position: 'bottom', color: 'rgba(168,85,247,0.25)', angle: null },
        { section: '#agentSection', position: 'bottom', color: 'rgba(244,63,94,0.2)', angle: 3 },
    ];

    boundaries.forEach(b => {
        const section = document.querySelector(b.section);
        if (!section) return;

        const line = document.createElement('div');
        if (b.angle) {
            line.className = 'glow-line glow-line--diag';
            line.style.cssText = `
                --glow-color: ${b.color};
                --diag-angle: ${b.angle}deg;
                ${b.position}: 0;
            `;
        } else {
            line.className = 'glow-line glow-line--h';
            line.style.cssText = `
                --glow-color: ${b.color};
                ${b.position}: 0;
            `;
        }
        line.setAttribute('aria-hidden', 'true');
        section.style.position = 'relative';
        section.appendChild(line);

        // Subtle pulse as section enters view
        gsap.fromTo(line, {
            opacity: 0,
            scaleX: 0.3
        }, {
            opacity: 1,
            scaleX: 1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: section,
                start: b.position === 'top' ? 'top 80%' : 'bottom 80%',
                end: b.position === 'top' ? 'top 30%' : 'bottom 30%',
                scrub: 0.3,
            }
        });
    });
}
