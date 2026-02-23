#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const catalogPath = path.join(root, 'examples/codex/catalog.json');

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
      failures++;
    }
  }

  if (!Array.isArray(entry.patterns_used) || entry.patterns_used.length === 0) {
    console.error(`${ctx} patterns_used must be a non-empty array`);
    failures++;
  }

  if (!Array.isArray(entry.runtime_requirements) || entry.runtime_requirements.length === 0) {
    console.error(`${ctx} runtime_requirements must be a non-empty array`);
    failures++;
  }

  const entryDir = path.join(root, 'examples/codex', entry.slug);

  if (entry.status === 'active') {
    if (!fs.existsSync(entryDir)) {
      console.error(`${ctx} active entry directory missing: examples/codex/${entry.slug}`);
      failures++;
      continue;
    }

    const expectedFiles = ['index.html', 'README.md'];
    for (const name of expectedFiles) {
      const target = path.join(entryDir, name);
      if (!fs.existsSync(target)) {
        console.error(`${ctx} missing active entry file: examples/codex/${entry.slug}/${name}`);
        failures++;
      }
    }

    if (entry.coverage_href) {
      const coveragePath = path.join(root, 'examples/codex', entry.coverage_href);
      if (!fs.existsSync(coveragePath)) {
        console.error(`${ctx} missing coverage file: examples/codex/${entry.coverage_href}`);
        failures++;
      }
    }

    if (entry.mcp_labs) {
      const labsPath = path.join(root, 'examples/codex', entry.mcp_labs);
      if (!fs.existsSync(labsPath)) {
        console.error(`${ctx} missing MCP labs path: examples/codex/${entry.mcp_labs}`);
        failures++;
      }
    }
  }
}

if (failures) {
  console.error(`Codex catalog integrity check failed with ${failures} issue(s).`);
  process.exit(1);
}

console.log(`Codex catalog integrity passed for ${entries.length} entries.`);
