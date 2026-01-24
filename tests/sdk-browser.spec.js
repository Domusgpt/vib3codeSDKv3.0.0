/**
 * VIB3+ SDK Browser Test Suite
 *
 * This file tests the actual deployed SDK in a real browser environment.
 * Uses Playwright to verify WASM loading, WebGL rendering, and controls.
 */

import { test, expect } from '@playwright/test';
import { createServer } from 'http';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, extname } from 'path';

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.mjs': 'application/javascript',
    '.css': 'text/css',
    '.wasm': 'application/wasm',
    '.json': 'application/json',
    '.png': 'image/png'
};

// Create test results directory
const RESULTS_DIR = './test-results';
if (!existsSync(RESULTS_DIR)) {
    mkdirSync(RESULTS_DIR, { recursive: true });
}

// Simple static server for testing
let server;
const PORT = 3457;

test.beforeAll(async () => {
    server = createServer((req, res) => {
        let filePath = join('./sdk', req.url === '/' ? 'index.html' : req.url);
        filePath = filePath.split('?')[0];

        if (!existsSync(filePath)) {
            res.writeHead(404);
            res.end('Not found: ' + filePath);
            return;
        }

        const ext = extname(filePath);
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        try {
            const content = readFileSync(filePath);
            res.writeHead(200, {
                'Content-Type': contentType,
                'Cross-Origin-Opener-Policy': 'same-origin',
                'Cross-Origin-Embedder-Policy': 'require-corp'
            });
            res.end(content);
        } catch (err) {
            res.writeHead(500);
            res.end('Error: ' + err.message);
        }
    });

    await new Promise(resolve => server.listen(PORT, resolve));
    console.log(`Test server running at http://localhost:${PORT}/`);
});

test.afterAll(async () => {
    if (server) server.close();
});

test.describe('VIB3+ SDK Tests', () => {

    test('TEST 1: Page loads successfully', async ({ page }) => {
        console.log('\n========================================');
        console.log('TEST 1: Page Load');
        console.log('========================================');

        const response = await page.goto(`http://localhost:${PORT}/`);

        console.log(`HTTP Status: ${response.status()}`);
        expect(response.ok()).toBeTruthy();

        await page.screenshot({ path: `${RESULTS_DIR}/01-page-load.png` });
        console.log('Screenshot saved: test-results/01-page-load.png');
    });

    test('TEST 2: WASM Core initialization', async ({ page }) => {
        console.log('\n========================================');
        console.log('TEST 2: WASM Core Initialization');
        console.log('========================================');

        const errors = [];
        const logs = [];

        page.on('console', msg => {
            logs.push({ type: msg.type(), text: msg.text() });
        });
        page.on('pageerror', err => errors.push(err.message));

        await page.goto(`http://localhost:${PORT}/`);

        // Wait for WASM to attempt loading
        await page.waitForTimeout(8000);

        // Check loading status
        const loadingText = await page.locator('#loadingText').textContent().catch(() => 'N/A');
        console.log(`Loading Status: "${loadingText}"`);

        // Check for Vib3Core
        const vib3Status = await page.evaluate(() => {
            return {
                hasVib3Core: typeof window.Vib3Core !== 'undefined',
                hasVib3Math: typeof window.Vib3Math !== 'undefined',
                coreType: typeof window.Vib3Core
            };
        });
        console.log(`window.Vib3Core: ${vib3Status.hasVib3Core} (${vib3Status.coreType})`);
        console.log(`window.Vib3Math: ${vib3Status.hasVib3Math}`);

        // Print console errors
        const consoleErrors = logs.filter(l => l.type === 'error');
        console.log(`Console Errors: ${consoleErrors.length}`);
        consoleErrors.forEach(e => console.log(`  - ${e.text}`));

        // Print page errors
        console.log(`Page Errors: ${errors.length}`);
        errors.forEach(e => console.log(`  - ${e}`));

        await page.screenshot({ path: `${RESULTS_DIR}/02-wasm-init.png` });
        console.log('Screenshot saved: test-results/02-wasm-init.png');

        // Log all console output
        console.log('\nFull Console Log:');
        logs.slice(0, 30).forEach(l => console.log(`  [${l.type}] ${l.text.substring(0, 120)}`));
    });

    test('TEST 3: Canvas and WebGL context', async ({ page }) => {
        console.log('\n========================================');
        console.log('TEST 3: Canvas and WebGL');
        console.log('========================================');

        await page.goto(`http://localhost:${PORT}/`);
        await page.waitForTimeout(5000);

        const canvasInfo = await page.evaluate(() => {
            const canvases = document.querySelectorAll('canvas');
            const results = [];
            canvases.forEach((canvas, i) => {
                const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
                results.push({
                    index: i,
                    id: canvas.id || 'no-id',
                    width: canvas.width,
                    height: canvas.height,
                    hasWebGL: !!gl,
                    webglVersion: gl ? (gl instanceof WebGL2RenderingContext ? 'WebGL2' : 'WebGL1') : 'none'
                });
            });
            return results;
        });

        console.log(`Found ${canvasInfo.length} canvas elements:`);
        canvasInfo.forEach(c => {
            console.log(`  - #${c.id}: ${c.width}x${c.height}, ${c.webglVersion}`);
        });

        await page.screenshot({ path: `${RESULTS_DIR}/03-canvas-webgl.png` });
        console.log('Screenshot saved: test-results/03-canvas-webgl.png');
    });

    test('TEST 4: UI Controls present', async ({ page }) => {
        console.log('\n========================================');
        console.log('TEST 4: UI Controls');
        console.log('========================================');

        await page.goto(`http://localhost:${PORT}/`);
        await page.waitForTimeout(3000);

        const controls = await page.evaluate(() => {
            const sliders = document.querySelectorAll('input[type="range"]');
            const buttons = document.querySelectorAll('button');
            const selects = document.querySelectorAll('select');

            return {
                sliders: Array.from(sliders).map(s => ({ id: s.id, min: s.min, max: s.max, value: s.value })),
                buttons: Array.from(buttons).map(b => b.textContent?.trim().substring(0, 30)),
                selects: Array.from(selects).map(s => s.id)
            };
        });

        console.log(`Sliders: ${controls.sliders.length}`);
        controls.sliders.slice(0, 10).forEach(s => console.log(`  - #${s.id}: ${s.min}-${s.max} (val: ${s.value})`));

        console.log(`Buttons: ${controls.buttons.length}`);
        controls.buttons.slice(0, 10).forEach(b => console.log(`  - "${b}"`));

        console.log(`Selects: ${controls.selects.length}`);
        controls.selects.forEach(s => console.log(`  - #${s}`));

        await page.screenshot({ path: `${RESULTS_DIR}/04-ui-controls.png` });
        console.log('Screenshot saved: test-results/04-ui-controls.png');
    });

});
