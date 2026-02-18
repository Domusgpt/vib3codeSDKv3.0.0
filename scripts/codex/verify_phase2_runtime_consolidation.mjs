#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const wrapperExpectations = [
  ['site/js/ContextPool.js', /^export \* from '\.\.\/\.\.\/src\/codex-runtime\/landing-v3\/ContextPool\.js';\s*$/m],
  ['site/js/adapters.js', /^export \* from '\.\.\/\.\.\/src\/codex-runtime\/landing-v3\/adapters\.js';\s*$/m],
  ['site/js/CardTiltSystem.js', /^export \* from '\.\.\/\.\.\/src\/codex-runtime\/landing-v3\/CardTiltSystem\.js';\s*$/m],
  ['site/js/choreography.js', /^export \* from '\.\.\/\.\.\/src\/codex-runtime\/landing-v3\/choreography\.js';\s*$/m],
  ['site/js/config.js', /^export \* from '\.\.\/\.\.\/src\/codex-runtime\/landing-v3\/config\.js';\s*$/m],
  ['site/js/overlay-choreography.js', /^export \* from '\.\.\/\.\.\/src\/codex-runtime\/landing-v3\/overlay-choreography\.js';\s*$/m],
  ['site/js/main.js', /bootLandingPage\(\{\s*enableRevealChoreography:\s*true\s*}\);/m],
  ['js/landing/ContextPool.js', /^export \* from '\.\.\/\.\.\/src\/codex-runtime\/landing-v3\/ContextPool\.js';\s*$/m],
  ['js/landing/adapters.js', /^export \* from '\.\.\/\.\.\/src\/codex-runtime\/landing-v3\/adapters\.js';\s*$/m],
  ['js/landing/CardTiltSystem.js', /^export \* from '\.\.\/\.\.\/src\/codex-runtime\/landing-v3\/CardTiltSystem\.js';\s*$/m],
  ['js/landing/choreography.js', /^export \* from '\.\.\/\.\.\/src\/codex-runtime\/landing-v3\/choreography\.js';\s*$/m],
  ['js/landing/config.js', /^export \* from '\.\.\/\.\.\/src\/codex-runtime\/landing-v3\/config\.js';\s*$/m],
  ['js/landing/overlay-choreography.js', /^export \* from '\.\.\/\.\.\/src\/codex-runtime\/landing-v3\/overlay-choreography\.js';\s*$/m],
  ['js/landing/main.js', /bootLandingPage\(\{\s*enableRevealChoreography:\s*false\s*}\);/m]
];

const canonicalFiles = [
  'src/codex-runtime/landing-v3/ContextPool.js',
  'src/codex-runtime/landing-v3/adapters.js',
  'src/codex-runtime/landing-v3/CardTiltSystem.js',
  'src/codex-runtime/landing-v3/choreography.js',
  'src/codex-runtime/landing-v3/config.js',
  'src/codex-runtime/landing-v3/main-core.js',
  'src/codex-runtime/landing-v3/overlay-choreography.js',
  'src/codex-runtime/landing-v3/reveal-choreography.js'
];

let failed = 0;

for (const file of canonicalFiles) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    console.error(`missing canonical file: ${file}`);
    failed++;
  }
}

for (const [file, pattern] of wrapperExpectations) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    console.error(`missing wrapper file: ${file}`);
    failed++;
    continue;
  }
  const content = fs.readFileSync(full, 'utf8').trim();
  if (!pattern.test(content)) {
    console.error(`wrapper did not match expected shape: ${file}`);
    failed++;
  }
}

if (failed) {
  console.error(`Phase 2 verification failed with ${failed} issue(s).`);
  process.exit(1);
}

console.log(`Phase 2 verification passed: ${canonicalFiles.length} canonical files and ${wrapperExpectations.length} wrappers validated.`);
