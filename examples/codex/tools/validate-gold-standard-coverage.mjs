#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const file = process.argv[2] || 'examples/codex/synesthesia/gold-standard-coverage.json';
const fullPath = path.resolve(process.cwd(), file);
const required = ['section', 'pattern', 'status', 'implementation', 'activation', 'validation_hint'];

const raw = fs.readFileSync(fullPath, 'utf8');
const doc = JSON.parse(raw);

if (!Array.isArray(doc.coverage)) {
  console.error('coverage must be an array');
  process.exit(1);
}

let errors = 0;
for (const [idx, item] of doc.coverage.entries()) {
  for (const key of required) {
    if (!(key in item) || item[key] === '') {
      console.error(`item ${idx} missing ${key}`);
      errors++;
    }
  }
}

if (errors) {
  console.error(`failed with ${errors} schema errors`);
  process.exit(1);
}

console.log(`validated ${doc.coverage.length} coverage records in ${file}`);
