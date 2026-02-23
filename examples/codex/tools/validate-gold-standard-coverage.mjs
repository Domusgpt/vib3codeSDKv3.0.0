#!/usr/bin/env node
import { loadCoverageDocument, validateCoverageDocument } from './coverage-validator.mjs';

const file = process.argv[2] || 'examples/codex/synesthesia/gold-standard-coverage.json';

let loaded;
try {
  loaded = loadCoverageDocument(file);
} catch (error) {
  console.error(`unable to load coverage file ${file}: ${error.message}`);
  process.exit(1);
}

const errors = validateCoverageDocument(loaded.document);

if (errors.length > 0) {
  for (const error of errors) {
    console.error(error);
  }
  console.error(`failed with ${errors.length} schema errors`);
  process.exit(1);
}

console.log(`validated ${loaded.document.coverage.length} coverage records in ${file}`);
