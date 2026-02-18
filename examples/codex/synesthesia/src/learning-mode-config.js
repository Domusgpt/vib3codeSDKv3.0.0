export const LEARNING_MODE_STORAGE_KEY = 'vib3.synesthesia.learningMode';

export const LEARNING_MODES = {
  l1: {
    label: 'L1 · Single Engine Foundations',
    description: 'One engine only. Focus on parameter vocabulary, audio mapping, and 4D rotation basics.',
    secondary: false,
    choreography: false
  },
  l2: {
    label: 'L2 · Dual Engine Coordination',
    description: 'Adds secondary engine and inverse density coordination, but keeps autonomous choreography off.',
    secondary: true,
    choreography: false
  },
  l3: {
    label: 'L3 · Narrative + Choreography',
    description: 'Adds autonomous 8-scene arc for narrative timing and idle behavior.',
    secondary: true,
    choreography: true
  },
  l4: {
    label: 'L4 · Full Flagship + Agent Handoff',
    description: 'Complete flagship behavior plus docs/labs for MCP and agent handoff workflows.',
    secondary: true,
    choreography: true
  }
};

export function isValidLearningMode(modeKey) {
  return Boolean(LEARNING_MODES[modeKey]);
}

export function normalizeLearningMode(modeKey, fallback = 'l4') {
  return isValidLearningMode(modeKey) ? modeKey : fallback;
}

export function resolveLearningModeFromEnvironment({
  search = window.location.search,
  storage = window.localStorage,
  fallback = 'l4'
} = {}) {
  const params = new URLSearchParams(search);
  const fromQuery = (params.get('mode') || '').toLowerCase();
  if (isValidLearningMode(fromQuery)) return fromQuery;

  const saved = (storage?.getItem?.(LEARNING_MODE_STORAGE_KEY) || '').toLowerCase();
  if (isValidLearningMode(saved)) return saved;

  return fallback;
}

export function persistLearningMode(modeKey, storage = window.localStorage) {
  const normalized = normalizeLearningMode(modeKey);
  storage?.setItem?.(LEARNING_MODE_STORAGE_KEY, normalized);
  return normalized;
}
