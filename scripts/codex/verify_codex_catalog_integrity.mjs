#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveCoverageJsonPath } from '../../examples/codex/tools/coverage-validator.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const catalogPath = path.join(repoRoot, 'examples/codex/catalog.json');

if (!fs.existsSync(catalogPath)) {
  console.error('missing examples/codex/catalog.json');
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const entries = Array.isArray(catalog.entries) ? catalog.entries : [];

if (!entries.length) {
  console.error('catalog.entries is empty');
  process.exit(1);
}

const requiredFields = [
  'slug', 'title', 'status', 'input_source', 'patterns_used',
  'gold_standard_coverage', 'difficulty', 'runtime_requirements'
];

let failures = 0;

for (const entry of entries) {
  const ctx = `[${entry.slug || 'unknown'}]`;

  for (const field of requiredFields) {
    if (!(field in entry)) {
      console.error(`${ctx} missing required field: ${field}`);
      failures += 1;
    }
  }

  if (!Array.isArray(entry.patterns_used) || entry.patterns_used.length === 0) {
    console.error(`${ctx} patterns_used must be a non-empty array`);
    failures += 1;
  }

  if (!Array.isArray(entry.runtime_requirements) || entry.runtime_requirements.length === 0) {
    console.error(`${ctx} runtime_requirements must be a non-empty array`);
    failures += 1;
  }

  const entryDir = path.join(repoRoot, 'examples/codex', entry.slug || '');

  if (entry.status !== 'active') {
    continue;
  }

  if (!entry.slug) {
    console.error(`${ctx} active entry must include a non-empty slug`);
    failures += 1;
    continue;
  }

  if (!fs.existsSync(entryDir)) {
    console.error(`${ctx} active entry directory missing: examples/codex/${entry.slug}`);
    failures += 1;
    continue;
  }

  const expectedFiles = ['index.html', 'README.md'];
  for (const name of expectedFiles) {
    const target = path.join(entryDir, name);
    if (!fs.existsSync(target)) {
      console.error(`${ctx} missing active entry file: examples/codex/${entry.slug}/${name}`);
      failures += 1;
    }
  }

  if (!entry.read_href || !entry.run_href || !entry.coverage_href) {
    console.error(`${ctx} active entries require read_href, run_href, and coverage_href`);
    failures += 1;
    continue;
  }

  const readPath = path.join(repoRoot, 'examples/codex', entry.read_href);
  if (!fs.existsSync(readPath)) {
    console.error(`${ctx} missing read_href target: examples/codex/${entry.read_href}`);
    failures += 1;
  }

  const runPath = path.join(repoRoot, 'examples/codex', entry.run_href);
  if (!fs.existsSync(runPath)) {
    console.error(`${ctx} missing run_href target: examples/codex/${entry.run_href}`);
    failures += 1;
  }

  const coverageDocPath = path.join(repoRoot, 'examples/codex', entry.coverage_href);
  if (!fs.existsSync(coverageDocPath)) {
    console.error(`${ctx} missing coverage file: examples/codex/${entry.coverage_href}`);
    failures += 1;
  }

  const coverageJsonHref = resolveCoverageJsonPath(entry.coverage_href);
  if (!coverageJsonHref) {
    console.error(`${ctx} invalid coverage_href (expected .md or .json): ${entry.coverage_href}`);
    failures += 1;
  } else {
    const coverageJsonPath = path.join(repoRoot, 'examples/codex', coverageJsonHref);
    if (!fs.existsSync(coverageJsonPath)) {
      console.error(`${ctx} missing machine-readable coverage file: examples/codex/${coverageJsonHref}`);
      failures += 1;
    }
  }

  if (!entry.mcp_labs) {
    console.error(`${ctx} active entries require mcp_labs path`);
    failures += 1;
  } else {
    const labsPath = path.join(repoRoot, 'examples/codex', entry.mcp_labs);
    if (!fs.existsSync(labsPath)) {
      console.error(`${ctx} missing MCP labs path: examples/codex/${entry.mcp_labs}`);
      failures += 1;
    }
  }
}

if (failures) {
  console.error(`Codex catalog integrity check failed with ${failures} issue(s).`);
  process.exit(1);
}

console.log(`Codex catalog integrity passed for ${entries.length} entries.`);
