import fs from 'node:fs';
import path from 'node:path';

export const REQUIRED_COVERAGE_FIELDS = [
  'section',
  'pattern',
  'status',
  'implementation',
  'activation',
  'validation_hint'
];

export function loadCoverageDocument(file, cwd = process.cwd()) {
  const fullPath = path.resolve(cwd, file);
  const raw = fs.readFileSync(fullPath, 'utf8');
  return {
    fullPath,
    document: JSON.parse(raw)
  };
}

export function validateCoverageDocument(document, requiredFields = REQUIRED_COVERAGE_FIELDS) {
  const errors = [];

  if (!Array.isArray(document.coverage)) {
    errors.push('coverage must be an array');
    return errors;
  }

  for (const [idx, item] of document.coverage.entries()) {
    for (const key of requiredFields) {
      if (!(key in item) || item[key] === '') {
        errors.push(`item ${idx} missing ${key}`);
      }
    }
  }

  return errors;
}
