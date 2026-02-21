import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LEARNING_MODES,
  LEARNING_MODE_STORAGE_KEY,
  isValidLearningMode,
  normalizeLearningMode,
  resolveLearningModeFromEnvironment,
  persistLearningMode
} from './learning-mode-config.js';

test('LEARNING_MODES exposes four canonical modes', () => {
  assert.deepEqual(Object.keys(LEARNING_MODES), ['l1', 'l2', 'l3', 'l4']);
});

test('isValidLearningMode validates known mode keys', () => {
  assert.equal(isValidLearningMode('l1'), true);
  assert.equal(isValidLearningMode('l4'), true);
  assert.equal(isValidLearningMode('unknown'), false);
});

test('normalizeLearningMode uses fallback for invalid mode', () => {
  assert.equal(normalizeLearningMode('l2', 'l1'), 'l2');
  assert.equal(normalizeLearningMode('bad', 'l3'), 'l3');
});

test('resolveLearningModeFromEnvironment prioritizes query over storage', () => {
  const storage = {
    getItem(key) {
      assert.equal(key, LEARNING_MODE_STORAGE_KEY);
      return 'l2';
    }
  };

  const resolved = resolveLearningModeFromEnvironment({
    search: '?mode=l3',
    storage,
    fallback: 'l4'
  });

  assert.equal(resolved, 'l3');
});

test('resolveLearningModeFromEnvironment falls back to storage and then fallback', () => {
  const fromStorage = resolveLearningModeFromEnvironment({
    search: '?mode=invalid',
    storage: { getItem: () => 'l1' },
    fallback: 'l4'
  });
  assert.equal(fromStorage, 'l1');

  const fromFallback = resolveLearningModeFromEnvironment({
    search: '?mode=invalid',
    storage: { getItem: () => 'invalid' },
    fallback: 'l2'
  });
  assert.equal(fromFallback, 'l2');
});

test('persistLearningMode stores normalized mode and returns it', () => {
  const calls = [];
  const storage = {
    setItem(key, value) {
      calls.push([key, value]);
    }
  };

  const saved = persistLearningMode('unknown', storage);
  assert.equal(saved, 'l4');
  assert.deepEqual(calls, [[LEARNING_MODE_STORAGE_KEY, 'l4']]);
});
