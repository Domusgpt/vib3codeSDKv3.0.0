#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCoverageDocument, validateCoverageDocument } from '../../examples/codex/tools/coverage-validator.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const catalogPath = path.join(repoRoot, 'examples/codex/catalog.json');

if (!fs.existsSync(catalogPath)) {
  console.error('missing examples/codex/catalog.json');
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const entries = Array.isArray(catalog.entries) ? catalog.entries : [];

let failures = 0;
let checked = 0;

for (const entry of entries) {
  if (entry.status !== 'active' || !entry.coverage_href) {
    continue;
  }

  const declaredCoverage = String(entry.coverage_href);
  const jsonCoveragePath = declaredCoverage.endsWith('.json')
    ? declaredCoverage
    : declaredCoverage.replace(/\.md$/u, '.json');
  const coverageFile = path.posix.join('examples/codex', jsonCoveragePath);
  checked += 1;

  let document;
  try {
    document = loadCoverageDocument(coverageFile, repoRoot).document;
  } catch (error) {
    console.error(`[${entry.slug || 'unknown'}] unable to load ${coverageFile}: ${error.message}`);
    failures += 1;
    continue;
  }

  const errors = validateCoverageDocument(document);
  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`[${entry.slug || 'unknown'}] ${error}`);
    }
    failures += errors.length;
    continue;
  }

  console.log(`[${entry.slug}] coverage OK (${document.coverage.length} records)`);
}

if (checked === 0) {
  console.error('no active coverage json files discovered in catalog entries');
  process.exit(1);
}

if (failures > 0) {
  console.error(`Codex coverage integrity failed with ${failures} issue(s).`);
  process.exit(1);
}

console.log(`Codex coverage integrity passed for ${checked} coverage file(s).`);
