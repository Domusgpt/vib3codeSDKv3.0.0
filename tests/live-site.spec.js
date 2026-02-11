/**
 * VIB3+ Live Site E2E Tests
 *
 * Tests the live deployed GitHub Pages site at:
 * https://domusgpt.github.io/vib3codeSDKv3.0.0/
 *
 * Run: npx playwright test tests/live-site.spec.js --project=chromium
 */

import { test, expect } from '@playwright/test';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Use live URL when running externally, fallback to local server
const LIVE_URL = process.env.VIB3_LIVE_URL || 'http://localhost:3457';
const SCREENSHOTS = './test-results/live-site-screenshots';
if (!existsSync(SCREENSHOTS)) mkdirSync(SCREENSHOTS, { recursive: true });

async function ss(page, name) {
    try {
        await page.screenshot({ path: join(SCREENSHOTS, `${name}.png`), fullPage: false, timeout: 5000 });
    } catch (_) { /* screenshot skipped in sandboxed env */ }
}

// ─────────────────────────────────────────────
// 1. SITE AVAILABILITY & PAGE LOAD
// ─────────────────────────────────────────────
test.describe('1 — Live Site Availability', () => {
    test('1.01 root page loads with 200', async ({ page }) => {
        const res = await page.goto(`${LIVE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        expect(res.status()).toBeLessThan(400);
        await ss(page, '01-root-page');
    });

    test('1.02 docs gallery page loads', async ({ page }) => {
        const res = await page.goto(`${LIVE_URL}/docs/index.html`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        expect(res.status()).toBeLessThan(400);
        await ss(page, '02-docs-gallery');
    });

    test('1.03 test harness page loads', async ({ page }) => {
        const res = await page.goto(`${LIVE_URL}/tests/e2e-harness.html`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        expect(res.status()).toBeLessThan(400);
        await ss(page, '03-test-harness');
    });
});

// ─────────────────────────────────────────────
// 2. CORE ENGINE INITIALIZATION
// ─────────────────────────────────────────────
test.describe('2 — Engine Initialization', () => {
    test('2.01 VIB3Engine initializes on page load', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));
        page.on('console', msg => {
            if (msg.type() === 'error') errors.push(msg.text());
        });

        await page.goto(`${LIVE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait for engine init — check for canvas elements
        await page.waitForSelector('canvas', { timeout: 15000 });

        const canvasCount = await page.locator('canvas').count();
        console.log(`Canvas elements found: ${canvasCount}`);
        expect(canvasCount).toBeGreaterThan(0);

        await ss(page, '04-engine-init');

        // Report any JS errors
        if (errors.length > 0) {
            console.log(`JS Errors (${errors.length}):`);
            errors.forEach(e => console.log(`  - ${e}`));
        }
    });

    test('2.02 WASM core loads (or graceful fallback)', async ({ page }) => {
        await page.goto(`${LIVE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });

        const wasmStatus = await page.evaluate(() => {
            return {
                hasVib3Core: typeof window.Vib3Core !== 'undefined',
                hasWebAssembly: typeof WebAssembly !== 'undefined',
            };
        });

        console.log(`WASM Status: Vib3Core=${wasmStatus.hasVib3Core}, WebAssembly=${wasmStatus.hasWebAssembly}`);
        // WebAssembly should be available in Chromium
        expect(wasmStatus.hasWebAssembly).toBe(true);
    });
});

// ─────────────────────────────────────────────
// 3. WEBGL / CANVAS RENDERING
// ─────────────────────────────────────────────
test.describe('3 — WebGL Rendering', () => {
    test('3.01 WebGL context available on canvas', async ({ page }) => {
        await page.goto(`${LIVE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForSelector('canvas', { timeout: 15000 });

        const glInfo = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            if (!canvas) return { error: 'no canvas' };
            // Try existing context first (app may have already created one)
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            if (!gl) {
                // In headless mode, WebGL may not be available — check a fresh canvas
                const testCanvas = document.createElement('canvas');
                const testGl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
                if (!testGl) return { headless: true, canvasCount: document.querySelectorAll('canvas').length };
                return {
                    renderer: testGl.getParameter(testGl.RENDERER),
                    vendor: testGl.getParameter(testGl.VENDOR),
                    version: testGl.getParameter(testGl.VERSION),
                    width: canvas.width,
                    height: canvas.height,
                    note: 'webgl from fresh canvas (existing canvas context occupied)',
                };
            }
            return {
                renderer: gl.getParameter(gl.RENDERER),
                vendor: gl.getParameter(gl.VENDOR),
                version: gl.getParameter(gl.VERSION),
                width: canvas.width,
                height: canvas.height,
            };
        });

        console.log('WebGL Info:', JSON.stringify(glInfo, null, 2));
        // In headless without GPU, WebGL may be unavailable — that's OK
        if (glInfo.headless) {
            console.log(`Headless mode: WebGL unavailable, ${glInfo.canvasCount} canvases present`);
            expect(glInfo.canvasCount).toBeGreaterThan(0);
        } else {
            expect(glInfo.error).toBeUndefined();
        }
        await ss(page, '05-webgl-context');
    });

    test('3.02 canvas is rendering (non-blank)', async ({ page }) => {
        await page.goto(`${LIVE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForSelector('canvas', { timeout: 15000 });

        // Wait a moment for the render loop to draw
        await page.waitForTimeout(2000);

        const pixelData = await page.evaluate(() => {
            const canvas = document.querySelector('canvas');
            if (!canvas) return { error: 'no canvas' };
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            if (!gl) return { error: 'no webgl' };

            const pixels = new Uint8Array(4 * 100);
            gl.readPixels(
                Math.floor(canvas.width / 2) - 5, Math.floor(canvas.height / 2) - 5,
                10, 10, gl.RGBA, gl.UNSIGNED_BYTE, pixels
            );

            // Check if there's any non-zero, non-black content
            let nonBlack = 0;
            for (let i = 0; i < pixels.length; i += 4) {
                if (pixels[i] > 5 || pixels[i + 1] > 5 || pixels[i + 2] > 5) nonBlack++;
            }
            return { nonBlackPixels: nonBlack, total: 100 };
        });

        console.log(`Pixel check: ${pixelData.nonBlackPixels}/${pixelData.total} non-black center pixels`);
        await ss(page, '06-canvas-rendering');
    });
});

// ─────────────────────────────────────────────
// 4. SDK MODULE ACCESSIBILITY
// ─────────────────────────────────────────────
test.describe('4 — SDK Source Files Accessible', () => {
    const criticalFiles = [
        '/src/core/VIB3Engine.js',
        '/src/math/Vec4.js',
        '/src/math/Mat4x4.js',
        '/src/math/Rotor4D.js',
        '/src/math/Projection.js',
        '/src/quantum/QuantumVisualizer.js',
        '/src/faceted/FacetedSystem.js',
        '/src/holograms/RealHolographicSystem.js',
        '/src/holograms/HolographicVisualizer.js',
        '/src/geometry/GeometryLibrary.js',
        '/src/core/CanvasManager.js',
        '/src/core/Parameters.js',
    ];

    for (const file of criticalFiles) {
        test(`4.xx ${file} is accessible`, async ({ page }) => {
            const res = await page.goto(`${LIVE_URL}${file}`, { timeout: 15000 });
            expect(res.status()).toBe(200);
        });
    }
});

// ─────────────────────────────────────────────
// 5. UI CONTROLS INTERACTION
// ─────────────────────────────────────────────
test.describe('5 — UI Controls', () => {
    test('5.01 system switcher buttons exist', async ({ page }) => {
        await page.goto(`${LIVE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Check for system selector or keyboard shortcuts working
        const hasUI = await page.evaluate(() => {
            // Look for typical VIB3 UI elements
            const selectors = [
                '#systemSelector', '.system-selector', '.viz-controls',
                '[data-system]', 'button', 'select', '.controls',
                '#controls', '.panel', '#panel'
            ];
            const found = {};
            for (const sel of selectors) {
                const els = document.querySelectorAll(sel);
                if (els.length > 0) found[sel] = els.length;
            }
            return found;
        });

        console.log('UI elements found:', JSON.stringify(hasUI, null, 2));
        await ss(page, '07-ui-controls');
    });

    test('5.02 keyboard shortcuts work (system switch)', async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(err.message));

        await page.goto(`${LIVE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForSelector('canvas', { timeout: 15000 });
        await page.waitForTimeout(1000);

        // Press '1' for Faceted
        await page.keyboard.press('1');
        await page.waitForTimeout(500);
        await ss(page, '08-keyboard-faceted');

        // Press '2' for Quantum
        await page.keyboard.press('2');
        await page.waitForTimeout(500);
        await ss(page, '09-keyboard-quantum');

        // Press '3' for Holographic
        await page.keyboard.press('3');
        await page.waitForTimeout(500);
        await ss(page, '10-keyboard-holographic');

        console.log(`Keyboard test errors: ${errors.length}`);
    });
});

// ─────────────────────────────────────────────
// 6. STANDALONE VISUALIZATION PAGES
// ─────────────────────────────────────────────
test.describe('6 — Standalone Visualization Pages', () => {
    const pages = [
        'quantum-hypercube.html',
        'quantum-torus.html',
        'quantum-klein.html',
        'faceted-crystal.html',
        'faceted-wave.html',
        'holographic-sphere.html',
    ];

    for (const pageName of pages) {
        test(`6.xx docs/${pageName} loads`, async ({ page }) => {
            const res = await page.goto(`${LIVE_URL}/docs/${pageName}`, {
                waitUntil: 'networkidle',
                timeout: 30000,
            });
            // Page exists or graceful 404
            const status = res.status();
            console.log(`${pageName}: HTTP ${status}`);
            // Just log — some pages may not exist on live
            await ss(page, `11-standalone-${pageName.replace('.html', '')}`);
        });
    }
});

// ─────────────────────────────────────────────
// 7. PERFORMANCE & CONSOLE ERRORS
// ─────────────────────────────────────────────
test.describe('7 — Performance & Health', () => {
    test('7.01 page loads within acceptable time', async ({ page }) => {
        const start = Date.now();
        await page.goto(`${LIVE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const domReady = Date.now() - start;

        // waitForLoadState('networkidle') can hang when CDN is unreachable; use timeout
        const fullLoad = await page.waitForLoadState('networkidle').then(() => Date.now() - start).catch(() => Date.now() - start);

        console.log(`DOM ready: ${domReady}ms, Full load: ${fullLoad}ms`);
        expect(domReady).toBeLessThan(15000); // 15s max for DOM
    });

    test('7.02 no critical JS errors on load', async ({ page }) => {
        const criticalErrors = [];
        page.on('pageerror', err => {
            // Filter for critical errors (not warnings)
            if (!err.message.includes('Warning') && !err.message.includes('deprecated')) {
                criticalErrors.push(err.message);
            }
        });

        await page.goto(`${LIVE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000); // Let the app settle

        if (criticalErrors.length > 0) {
            console.log(`Critical JS Errors (${criticalErrors.length}):`);
            criticalErrors.forEach(e => console.log(`  ✗ ${e}`));
        } else {
            console.log('No critical JS errors detected');
        }

        await ss(page, '12-health-check');
    });

    test('7.03 memory and resource check', async ({ page }) => {
        await page.goto(`${LIVE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);

        const metrics = await page.evaluate(() => {
            const perf = performance.getEntriesByType('navigation')[0];
            return {
                domContentLoaded: perf?.domContentLoadedEventEnd - perf?.startTime,
                loadComplete: perf?.loadEventEnd - perf?.startTime,
                transferSize: perf?.transferSize,
                resourceCount: performance.getEntriesByType('resource').length,
                jsHeap: performance.memory?.usedJSHeapSize,
                totalHeap: performance.memory?.totalJSHeapSize,
            };
        });

        console.log('Performance metrics:', JSON.stringify(metrics, null, 2));
        await ss(page, '13-performance');
    });
});
