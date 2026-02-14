#!/usr/bin/env node

/**
 * headless-renderer.js - VIB3+ Headless Frame Capture Utility
 *
 * Uses Puppeteer to render VIB3+ visualizations in a headless browser and
 * capture screenshots. Designed for:
 * - Agent visual feedback loops (capture → analyze → refine)
 * - CI visual regression testing
 * - Thumbnail generation for gallery entries
 * - Offline batch rendering
 *
 * Usage:
 *   node tools/headless-renderer.js [options]
 *
 * Options:
 *   --url <url>         Dev server URL (default: http://localhost:5173)
 *   --output <path>     Output directory (default: ./renders)
 *   --width <px>        Viewport width (default: 512)
 *   --height <px>       Viewport height (default: 512)
 *   --params <json>     JSON parameter object to apply
 *   --system <name>     System: quantum|faceted|holographic
 *   --geometry <index>  Geometry index 0-23
 *   --delay <ms>        Wait time after parameter set (default: 500)
 *   --frames <count>    Number of frames to capture (default: 1)
 *   --interval <ms>     Interval between frames (default: 100)
 *   --format <type>     png|jpeg|webp (default: png)
 *   --base64            Output base64 to stdout instead of file
 *
 * Examples:
 *   # Single frame with custom params
 *   node tools/headless-renderer.js --system quantum --geometry 11 --params '{"hue":200,"chaos":0.3}'
 *
 *   # 10 frames of animation
 *   node tools/headless-renderer.js --frames 10 --interval 200 --output ./animation
 *
 *   # Base64 output for piping to agents
 *   node tools/headless-renderer.js --base64 --params '{"hue":120}'
 *
 * @module tools/headless-renderer
 * @version 1.0.0
 */

import { existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

// Parse CLI arguments
function parseArgs(argv) {
    const args = {
        url: 'http://localhost:5173',
        output: './renders',
        width: 512,
        height: 512,
        params: null,
        system: null,
        geometry: null,
        delay: 500,
        frames: 1,
        interval: 100,
        format: 'png',
        base64: false
    };

    for (let i = 2; i < argv.length; i++) {
        const flag = argv[i];
        const next = argv[i + 1];

        switch (flag) {
            case '--url': args.url = next; i++; break;
            case '--output': args.output = next; i++; break;
            case '--width': args.width = parseInt(next, 10); i++; break;
            case '--height': args.height = parseInt(next, 10); i++; break;
            case '--params': args.params = JSON.parse(next); i++; break;
            case '--system': args.system = next; i++; break;
            case '--geometry': args.geometry = parseInt(next, 10); i++; break;
            case '--delay': args.delay = parseInt(next, 10); i++; break;
            case '--frames': args.frames = parseInt(next, 10); i++; break;
            case '--interval': args.interval = parseInt(next, 10); i++; break;
            case '--format': args.format = next; i++; break;
            case '--base64': args.base64 = true; break;
            case '--help':
                console.log('Usage: node tools/headless-renderer.js [options]');
                console.log('See file header for full option list.');
                process.exit(0);
        }
    }

    return args;
}

async function main() {
    const args = parseArgs(process.argv);

    // Dynamic import puppeteer (devDependency)
    let puppeteer;
    try {
        puppeteer = await import('puppeteer-core');
        if (puppeteer.default) puppeteer = puppeteer.default;
    } catch {
        try {
            puppeteer = await import('puppeteer');
            if (puppeteer.default) puppeteer = puppeteer.default;
        } catch {
            console.error('Error: puppeteer or puppeteer-core is required.');
            console.error('Install with: npm install puppeteer-core');
            process.exit(1);
        }
    }

    // Find Chrome/Chromium
    const executablePath = findChromium();

    console.log(`[headless-renderer] Launching browser...`);
    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--use-gl=swiftshader',  // Software GPU for headless
            `--window-size=${args.width},${args.height}`
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: args.width, height: args.height });

    console.log(`[headless-renderer] Loading ${args.url}...`);
    try {
        await page.goto(args.url, { waitUntil: 'networkidle2', timeout: 30000 });
    } catch (err) {
        console.error(`Error: Could not load ${args.url}`);
        console.error('Is the dev server running? Start it with: npm run dev');
        await browser.close();
        process.exit(1);
    }

    // Wait for VIB3+ engine to initialize
    await page.waitForFunction(() => {
        return typeof window.engine !== 'undefined' ||
               document.querySelector('canvas') !== null;
    }, { timeout: 10000 }).catch(() => {
        console.warn('[headless-renderer] Warning: Engine not detected, capturing anyway');
    });

    // Apply system switch
    if (args.system) {
        console.log(`[headless-renderer] Switching to system: ${args.system}`);
        await page.evaluate((system) => {
            if (window.switchSystem) window.switchSystem(system);
            else if (window.engine?.switchSystem) window.engine.switchSystem(system);
        }, args.system);
        await sleep(200);
    }

    // Apply geometry
    if (args.geometry !== null) {
        console.log(`[headless-renderer] Setting geometry: ${args.geometry}`);
        await page.evaluate((geo) => {
            if (window.selectGeometry) window.selectGeometry(geo);
            else if (window.engine?.setParameter) window.engine.setParameter('geometry', geo);
        }, args.geometry);
        await sleep(100);
    }

    // Apply custom parameters
    if (args.params) {
        console.log(`[headless-renderer] Applying parameters:`, JSON.stringify(args.params));
        await page.evaluate((params) => {
            for (const [key, value] of Object.entries(params)) {
                if (window.updateParameter) window.updateParameter(key, value);
                else if (window.engine?.setParameter) window.engine.setParameter(key, value);
            }
        }, args.params);
    }

    // Wait for render to settle
    console.log(`[headless-renderer] Waiting ${args.delay}ms for render...`);
    await sleep(args.delay);

    // Wait one animation frame
    await page.evaluate(() => new Promise(r => requestAnimationFrame(r)));

    // Capture frames
    if (!args.base64 && !existsSync(args.output)) {
        mkdirSync(args.output, { recursive: true });
    }

    for (let i = 0; i < args.frames; i++) {
        const screenshot = await page.screenshot({
            type: args.format === 'jpeg' ? 'jpeg' : 'png',
            encoding: args.base64 ? 'base64' : 'binary',
            fullPage: false
        });

        if (args.base64) {
            // Output base64 to stdout (for agent consumption)
            if (args.frames === 1) {
                process.stdout.write(screenshot);
            } else {
                console.log(JSON.stringify({
                    frame: i,
                    format: args.format,
                    data: screenshot
                }));
            }
        } else {
            const ext = args.format === 'jpeg' ? 'jpg' : args.format;
            const filename = args.frames === 1
                ? `capture.${ext}`
                : `frame_${String(i).padStart(4, '0')}.${ext}`;
            const filepath = join(resolve(args.output), filename);

            const fs = await import('fs');
            fs.writeFileSync(filepath, screenshot);
            console.log(`[headless-renderer] Saved: ${filepath}`);
        }

        // Wait between frames
        if (i < args.frames - 1 && args.interval > 0) {
            await sleep(args.interval);
            await page.evaluate(() => new Promise(r => requestAnimationFrame(r)));
        }
    }

    await browser.close();
    console.log(`[headless-renderer] Done.`);
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function findChromium() {
    const candidates = [
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/snap/bin/chromium',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    ];

    for (const path of candidates) {
        if (existsSync(path)) return path;
    }

    // Let puppeteer figure it out
    return undefined;
}

main().catch(err => {
    console.error('[headless-renderer] Fatal error:', err.message);
    process.exit(1);
});
