import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync, rmSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';

const PROJECT_ROOT = resolve(import.meta.dirname || '.', '../..');
const CLI_PATH = join(PROJECT_ROOT, 'src/cli/index.js');
const TMP_DIR = join('/tmp', 'vib3-cli-init-test-' + process.pid);

function runCLI(args) {
    try {
        const result = execSync(`node ${CLI_PATH} ${args}`, {
            cwd: TMP_DIR,
            encoding: 'utf-8',
            timeout: 10000,
            env: { ...process.env, NODE_NO_WARNINGS: '1' }
        });
        return { stdout: result, exitCode: 0 };
    } catch (e) {
        return { stdout: e.stdout || '', stderr: e.stderr || '', exitCode: e.status };
    }
}

describe('vib3 init', () => {
    beforeEach(() => {
        mkdirSync(TMP_DIR, { recursive: true });
    });

    afterEach(() => {
        rmSync(TMP_DIR, { recursive: true, force: true });
    });

    it('scaffolds a vanilla project by default', () => {
        const result = runCLI('init test-vanilla --json');
        expect(result.exitCode).toBe(0);

        const dir = join(TMP_DIR, 'test-vanilla');
        expect(existsSync(join(dir, 'package.json'))).toBe(true);
        expect(existsSync(join(dir, 'index.html'))).toBe(true);
        expect(existsSync(join(dir, 'main.js'))).toBe(true);

        const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'));
        expect(pkg.name).toBe('test-vanilla');
        expect(pkg.dependencies['@vib3code/sdk']).toBeDefined();
        expect(pkg.type).toBe('module');
    });

    it('scaffolds a React project with --template react', () => {
        const result = runCLI('init test-react --template react --json');
        expect(result.exitCode).toBe(0);

        const dir = join(TMP_DIR, 'test-react');
        expect(existsSync(join(dir, 'package.json'))).toBe(true);
        expect(existsSync(join(dir, 'vite.config.js'))).toBe(true);
        expect(existsSync(join(dir, 'src/main.jsx'))).toBe(true);
        expect(existsSync(join(dir, 'src/App.jsx'))).toBe(true);

        const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'));
        expect(pkg.dependencies.react).toBeDefined();
        expect(pkg.dependencies['react-dom']).toBeDefined();
        expect(pkg.devDependencies['@vitejs/plugin-react']).toBeDefined();
    });

    it('scaffolds a Vue project with --template vue', () => {
        const result = runCLI('init test-vue --template vue --json');
        expect(result.exitCode).toBe(0);

        const dir = join(TMP_DIR, 'test-vue');
        expect(existsSync(join(dir, 'package.json'))).toBe(true);
        expect(existsSync(join(dir, 'vite.config.js'))).toBe(true);
        expect(existsSync(join(dir, 'src/main.js'))).toBe(true);
        expect(existsSync(join(dir, 'src/App.vue'))).toBe(true);

        const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'));
        expect(pkg.dependencies.vue).toBeDefined();
        expect(pkg.devDependencies['@vitejs/plugin-vue']).toBeDefined();
    });

    it('scaffolds a Svelte project with --template svelte', () => {
        const result = runCLI('init test-svelte --template svelte --json');
        expect(result.exitCode).toBe(0);

        const dir = join(TMP_DIR, 'test-svelte');
        expect(existsSync(join(dir, 'package.json'))).toBe(true);
        expect(existsSync(join(dir, 'vite.config.js'))).toBe(true);
        expect(existsSync(join(dir, 'src/main.js'))).toBe(true);
        expect(existsSync(join(dir, 'src/App.svelte'))).toBe(true);

        const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'));
        expect(pkg.devDependencies.svelte).toBeDefined();
        expect(pkg.devDependencies['@sveltejs/vite-plugin-svelte']).toBeDefined();
    });

    it('rejects invalid template names', () => {
        const result = runCLI('init test-bad --template angular --json');
        expect(result.exitCode).not.toBe(0);
        const out = JSON.parse(result.stdout);
        expect(out.error.code).toBe('INVALID_TEMPLATE');
    });

    it('rejects when directory already exists', () => {
        mkdirSync(join(TMP_DIR, 'existing-dir'), { recursive: true });

        const result = runCLI('init existing-dir --json');
        expect(result.exitCode).not.toBe(0);
        const out = JSON.parse(result.stdout);
        expect(out.error.code).toBe('DIR_EXISTS');
    });

    it('all templates include VIB3 SDK dependency', () => {
        for (const template of ['vanilla', 'react', 'vue', 'svelte']) {
            const name = `dep-check-${template}`;
            runCLI(`init ${name} --template ${template}`);
            const pkg = JSON.parse(readFileSync(join(TMP_DIR, name, 'package.json'), 'utf-8'));
            expect(pkg.dependencies['@vib3code/sdk']).toBe('^2.0.0');
        }
    });

    it('all templates include vite dev script', () => {
        for (const template of ['vanilla', 'react', 'vue', 'svelte']) {
            const name = `script-check-${template}`;
            runCLI(`init ${name} --template ${template}`);
            const pkg = JSON.parse(readFileSync(join(TMP_DIR, name, 'package.json'), 'utf-8'));
            expect(pkg.scripts.dev).toContain('vite');
            expect(pkg.scripts.build).toContain('vite');
        }
    });
});
