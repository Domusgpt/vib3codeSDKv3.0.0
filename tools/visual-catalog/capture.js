#!/usr/bin/env node
/**
 * VIB3+ Visual Catalog — Automated Screenshot Capture
 *
 * Generates a comprehensive visual reference catalog using Playwright:
 *   1. All 3 systems x 24 geometries = 72 base screenshots
 *   2. Parameter effect pairs (before/after) for key params
 *   3. Composite grid sheets for AI agent context
 *
 * Usage:
 *   npx playwright install chromium   # first time
 *   node tools/visual-catalog/capture.js [--systems] [--params] [--grids] [--all]
 *
 * Output: visual-catalog/output/
 *   ├── systems/                  # Per-system screenshots
 *   │   ├── quantum/              # quantum-geo00-tetrahedron.png ... quantum-geo23-ht-crystal.png
 *   │   ├── faceted/
 *   │   └── holographic/
 *   ├── params/                   # Parameter before/after pairs
 *   │   ├── hue/                  # hue-000.png, hue-120.png, hue-240.png
 *   │   ├── gridDensity/
 *   │   ├── chaos/
 *   │   └── ...
 *   ├── grids/                    # Composite reference sheets
 *   │   ├── quantum-all-geometries.png
 *   │   ├── faceted-all-geometries.png
 *   │   ├── holographic-all-geometries.png
 *   │   └── param-effects-cheatsheet.png
 *   └── catalog.json              # Index with metadata for AI agents
 */

import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const OUTPUT = join(ROOT, 'visual-catalog', 'output');

// ─── Configuration ─────────────────────────────────────────────

const SYSTEMS = ['quantum', 'holographic', 'faceted'];
const SYSTEM_IDX = { quantum: 0, holographic: 1, faceted: 2 };

const GEOMETRIES = [
  'Tetrahedron', 'Hypercube', 'Sphere', 'Torus',
  'Klein Bottle', 'Fractal', 'Wave', 'Crystal',
  'Hyper-Tetra', 'Hyper-Cube', 'Hyper-Sphere', 'Hyper-Torus',
  'Hyper-Klein', 'Hyper-Fractal', 'Hyper-Wave', 'Hyper-Crystal',
  'HT-Tetra', 'HT-Cube', 'HT-Sphere', 'HT-Torus',
  'HT-Klein', 'HT-Fractal', 'HT-Wave', 'HT-Crystal',
];

const DEFAULTS = {
  geometry: 3, hue: 200, gridDensity: 24, speed: 1.0,
  morphFactor: 0.5, chaos: 0.2, intensity: 0.7, saturation: 0.8,
  dimension: 3.5, rot4dXW: 0, rot4dYW: 0, rot4dZW: 0,
  rot4dXY: 0, rot4dXZ: 0, rot4dYZ: 0,
};

// Parameters to showcase with before/after values
const PARAM_SHOWCASES = {
  hue:          [0, 60, 120, 180, 240, 300],
  gridDensity:  [8, 20, 40, 60, 80],
  chaos:        [0, 0.25, 0.5, 0.75, 1.0],
  morphFactor:  [0, 0.5, 1.0, 1.5, 2.0],
  intensity:    [0.2, 0.5, 0.7, 0.9, 1.0],
  dimension:    [3.0, 3.25, 3.5, 3.75, 4.0, 4.5],
  speed:        [0.1, 0.5, 1.0, 2.0, 3.0],
  rot4dXW:      [0, 1.57, 3.14, 4.71],
  rot4dYW:      [0, 1.57, 3.14, 4.71],
  saturation:   [0, 0.25, 0.5, 0.75, 1.0],
};

const CANVAS_W = 600;
const CANVAS_H = 450;
const SETTLE_MS = 800;  // ms to let the shader run before capturing

// ─── Helpers ───────────────────────────────────────────────────

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
}

// ─── Core Capture Functions ────────────────────────────────────

/**
 * Navigate to the test page and set up system + params, then screenshot the canvas.
 */
async function captureState(page, system, params, outputPath) {
  const sysIdx = SYSTEM_IDX[system];

  await page.evaluate(async ({ sysIdx, params }) => {
    // Switch system
    const btn = document.querySelector(`[data-pg-system="${sysIdx}"]`);
    if (btn) btn.click();

    // Wait a tick for system to initialize
    await new Promise(r => setTimeout(r, 300));

    // Set slider values
    for (const [param, value] of Object.entries(params)) {
      const input = document.getElementById(`ctrl-${param}`);
      if (input) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    // Set geometry via select
    if ('geometry' in params) {
      const geo = document.getElementById('ctrl-geometry');
      if (geo) {
        geo.value = params.geometry;
        geo.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }, { sysIdx, params });

  // Let the shader settle
  await page.waitForTimeout(SETTLE_MS);

  // Screenshot the canvas element
  const canvas = page.locator('#playground-canvas');
  await canvas.screenshot({ path: outputPath });
}

// ─── Main Pipeline ─────────────────────────────────────────────

async function captureAllSystems(page, catalog) {
  console.log('\n=== CAPTURING ALL SYSTEMS x GEOMETRIES ===\n');

  for (const system of SYSTEMS) {
    const dir = join(OUTPUT, 'systems', system);
    ensureDir(dir);

    for (let geo = 0; geo < 24; geo++) {
      const geoName = GEOMETRIES[geo];
      const filename = `${system}-geo${String(geo).padStart(2, '0')}-${slug(geoName)}.png`;
      const outPath = join(dir, filename);

      const params = { ...DEFAULTS, geometry: geo };
      process.stdout.write(`  ${system} / ${geoName} (${geo})...`);
      await captureState(page, system, params, outPath);
      console.log(' done');

      catalog.systems.push({
        system, geometry: geo, name: geoName,
        path: `systems/${system}/${filename}`,
        params: { ...params },
      });
    }
  }
}

async function captureParamEffects(page, catalog) {
  console.log('\n=== CAPTURING PARAMETER EFFECTS ===\n');

  for (const [param, values] of Object.entries(PARAM_SHOWCASES)) {
    const dir = join(OUTPUT, 'params', param);
    ensureDir(dir);

    for (const value of values) {
      const params = { ...DEFAULTS, [param]: value };
      const label = typeof value === 'number' ? value.toFixed(2).replace('.', '_') : String(value);
      const filename = `${param}-${label}.png`;
      const outPath = join(dir, filename);

      process.stdout.write(`  ${param}=${value}...`);
      await captureState(page, 'faceted', params, outPath);
      console.log(' done');

      catalog.params.push({
        param, value, path: `params/${param}/${filename}`,
        system: 'faceted', params: { ...params },
      });
    }
  }
}

async function compositeGrids(catalog) {
  console.log('\n=== COMPOSITING GRID SHEETS ===\n');

  const gridDir = join(OUTPUT, 'grids');
  ensureDir(gridDir);

  // Write a simple HTML-based grid compositor
  // (uses browser-native canvas compositing via a helper page)
  const gridManifest = {
    note: 'Grid compositing requires manual or CI-based generation',
    systems: SYSTEMS.map(sys => ({
      name: `${sys}-all-geometries`,
      images: catalog.systems
        .filter(e => e.system === sys)
        .map(e => e.path),
      grid: '6x4',
    })),
    params: Object.keys(PARAM_SHOWCASES).map(param => ({
      name: `param-${param}-effect`,
      images: catalog.params
        .filter(e => e.param === param)
        .map(e => e.path),
      grid: `${PARAM_SHOWCASES[param].length}x1`,
    })),
  };

  writeFileSync(join(gridDir, 'grid-manifest.json'), JSON.stringify(gridManifest, null, 2));
  console.log('  Grid manifest written (compose with tools/visual-catalog/composite.js)');

  catalog.grids = gridManifest;
}

// ─── Entry Point ───────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const doSystems = args.includes('--systems') || args.includes('--all') || args.length === 0;
  const doParams = args.includes('--params') || args.includes('--all') || args.length === 0;
  const doGrids = args.includes('--grids') || args.includes('--all') || args.length === 0;

  console.log('VIB3+ Visual Catalog Generator v2.0.3');
  console.log(`Output: ${OUTPUT}`);
  ensureDir(OUTPUT);

  // Start dev server if not already running
  let serverProcess = null;
  try {
    execSync('curl -s http://localhost:5173/ > /dev/null 2>&1');
    console.log('Dev server already running on :5173');
  } catch {
    console.log('Starting dev server...');
    const { spawn } = await import('child_process');
    serverProcess = spawn('npx', ['vite', '--port', '5173'], { cwd: ROOT, stdio: 'ignore', detached: true });
    serverProcess.unref();
    await new Promise(r => setTimeout(r, 3000));
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  // Navigate to landing page and scroll to playground section
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);

  // Scroll playground into view to trigger GPU context acquisition
  await page.evaluate(() => {
    const el = document.getElementById('playgroundSection');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(1500);

  const catalog = { version: '2.0.3', generated: new Date().toISOString(), systems: [], params: [], grids: null };

  if (doSystems) await captureAllSystems(page, catalog);
  if (doParams) await captureParamEffects(page, catalog);
  if (doGrids) await compositeGrids(catalog);

  // Write catalog index
  writeFileSync(join(OUTPUT, 'catalog.json'), JSON.stringify(catalog, null, 2));
  console.log(`\nCatalog written: ${join(OUTPUT, 'catalog.json')}`);
  console.log(`Total screenshots: ${catalog.systems.length + catalog.params.length}`);

  await browser.close();
  if (serverProcess) {
    try { process.kill(-serverProcess.pid); } catch {}
  }
}

main().catch(e => { console.error(e); process.exit(1); });
