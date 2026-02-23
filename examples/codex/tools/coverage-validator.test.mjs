import { describe, expect, it } from 'vitest';
import {
  resolveCoverageJsonPath,
  validateCoverageDocument
} from './coverage-validator.mjs';

describe('resolveCoverageJsonPath', () => {
  it('returns json paths as-is', () => {
    expect(resolveCoverageJsonPath('synesthesia/gold-standard-coverage.json')).toBe(
      'synesthesia/gold-standard-coverage.json'
    );
  });

  it('maps markdown href to json href', () => {
    expect(resolveCoverageJsonPath('synesthesia/gold-standard-coverage.md')).toBe(
      'synesthesia/gold-standard-coverage.json'
    );
  });

  it('returns null for invalid or empty paths', () => {
    expect(resolveCoverageJsonPath('synesthesia/gold-standard-coverage.txt')).toBeNull();
    expect(resolveCoverageJsonPath('')).toBeNull();
    expect(resolveCoverageJsonPath(null)).toBeNull();
  });
});

describe('validateCoverageDocument', () => {
  it('returns no errors for valid coverage schema', () => {
    const errors = validateCoverageDocument({
      coverage: [
        {
          section: 'A',
          pattern: 'Burst',
          status: 'full',
          implementation: 'hook',
          activation: 'click',
          validation_hint: 'works'
        }
      ]
    });

    expect(errors).toEqual([]);
  });

  it('reports missing required fields', () => {
    const errors = validateCoverageDocument({
      coverage: [
        {
          section: 'A',
          pattern: 'Burst',
          status: '',
          implementation: 'hook',
          activation: 'click'
        }
      ]
    });

    expect(errors).toContain('item 0 missing status');
    expect(errors).toContain('item 0 missing validation_hint');
  });
});
