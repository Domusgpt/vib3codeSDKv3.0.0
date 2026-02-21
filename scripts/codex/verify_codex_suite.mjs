#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const checks = [
  ['Phase 2 runtime consolidation', ['node', 'scripts/codex/verify_phase2_runtime_consolidation.mjs']],
  ['Codex catalog integrity', ['node', 'scripts/codex/verify_codex_catalog_integrity.mjs']],
  ['Synesthesia coverage integrity', ['node', 'examples/codex/tools/validate-gold-standard-coverage.mjs']]
];

let failed = 0;

for (const [label, cmd] of checks) {
  console.log(`\n[verify:codex-suite] ${label}`);
  const [bin, ...args] = cmd;
  const run = spawnSync(bin, args, { stdio: 'inherit' });
  if (run.status !== 0) {
    console.error(`[verify:codex-suite] FAILED: ${label}`);
    failed++;
  } else {
    console.log(`[verify:codex-suite] OK: ${label}`);
  }
}

if (failed) {
  console.error(`\nverify:codex-suite failed with ${failed} failing check(s).`);
  process.exit(1);
}

console.log('\nverify:codex-suite passed all checks.');
