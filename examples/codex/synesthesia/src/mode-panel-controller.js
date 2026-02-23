import { LEARNING_MODES } from './learning-mode-config.js';

/**
 * Wire the learning-mode panel to the current runtime state.
 *
 * This is intentionally a thin DOM controller. Runtime behavior lives in
 * `synesthesia.js`; this module keeps panel concerns out of orchestration logic.
 */
export function wireLearningModePanel({
  modeKey,
  onModeChange,
  selectId = 'modeSelect',
  descriptionId = 'modeDescription'
}) {
  const select = document.getElementById(selectId);
  const description = document.getElementById(descriptionId);
  if (!select || !description) return;

  select.value = modeKey;
  description.textContent = LEARNING_MODES[modeKey]?.description
    || 'Select a mode to progressively enable complexity.';

  if (typeof onModeChange === 'function') {
    select.addEventListener('change', () => onModeChange(select.value));
  }
}
