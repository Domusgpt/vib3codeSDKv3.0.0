#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');

const checks = [
  {
    label: 'Phase 2 runtime consolidation',
    args: ['scripts/codex/verify_phase2_runtime_consolidation.mjs']
  },
  {
    label: 'Codex catalog integrity',
    args: ['scripts/codex/verify_codex_catalog_integrity.mjs']
  },
  {
    label: 'Synesthesia coverage integrity',
    args: ['examples/codex/tools/validate-gold-standard-coverage.mjs']
  }
];

let failures = 0;

for (const check of checks) {
  console.log(`\n[verify:codex-suite] ${check.label}`);
  const startedAt = Date.now();
  const result = spawnSync(process.execPath, check.args, {
    cwd: repoRoot,
    stdio: 'inherit'
  });

  const elapsedMs = Date.now() - startedAt;
  const elapsed = `${elapsedMs}ms`;

  if (typeof result.status === 'number' && result.status === 0) {
    console.log(`[verify:codex-suite] OK: ${check.label} (${elapsed})`);
    continue;
  }

  failures += 1;

  if (result.error) {
    console.error(`[verify:codex-suite] FAILED: ${check.label} (${elapsed})`);
    console.error(`[verify:codex-suite] spawn error: ${result.error.message}`);
    continue;
  }

  if (result.signal) {
    console.error(`[verify:codex-suite] FAILED: ${check.label} (${elapsed})`);
    console.error(`[verify:codex-suite] terminated by signal: ${result.signal}`);
    continue;
  }

  console.error(`[verify:codex-suite] FAILED: ${check.label} (${elapsed})`);
  console.error(`[verify:codex-suite] exit code: ${result.status ?? 'unknown'}`);
}

if (failures > 0) {
  console.error(`\nverify:codex-suite failed with ${failures} failing check(s).`);
  process.exit(1);
}

console.log('\nverify:codex-suite passed all checks.');
