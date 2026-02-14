import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';

const PROJECT_ROOT = resolve(import.meta.dirname || '.', '../..');
const CLI_PATH = join(PROJECT_ROOT, 'src/cli/index.js');
const TMP_DIR = join('/tmp', 'vib3-cli-create-test-' + process.pid);

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

describe('vib3 create', () => {
    beforeEach(() => {
        mkdirSync(TMP_DIR, { recursive: true });
    });

    afterEach(() => {
        rmSync(TMP_DIR, { recursive: true, force: true });
    });

    it('creates a visualization with --json', () => {
        const result = runCLI('create --system quantum --geometry 0 --json');
        expect(result.exitCode).toBe(0);
        const json = JSON.parse(result.stdout);
        expect(json.success).toBe(true);
        expect(json.operation).toBe('create_4d_visualization');
    });

    it('creates with default system (quantum)', () => {
        const result = runCLI('create --json');
        expect(result.exitCode).toBe(0);
        const json = JSON.parse(result.stdout);
        expect(json.success).toBe(true);
    });

    it('creates with geometry index', () => {
        const result = runCLI('create --system faceted --geometry 11 --json');
        expect(result.exitCode).toBe(0);
        const json = JSON.parse(result.stdout);
        expect(json.success).toBe(true);
    });

    it('creates with holographic system', () => {
        const result = runCLI('create --system holographic --json');
        expect(result.exitCode).toBe(0);
        const json = JSON.parse(result.stdout);
        expect(json.success).toBe(true);
    });

    it('creates with visual parameters', () => {
        const result = runCLI('create --system quantum --hue 200 --speed 0.5 --chaos 0.3 --json');
        expect(result.exitCode).toBe(0);
        const json = JSON.parse(result.stdout);
        expect(json.success).toBe(true);
    });

    it('creates with rotation parameters', () => {
        const result = runCLI('create --system quantum --XW 1.5 --YW 0.5 --ZW 0.8 --json');
        expect(result.exitCode).toBe(0);
        const json = JSON.parse(result.stdout);
        expect(json.success).toBe(true);
    });

    it('creates with behavior preset', () => {
        const result = runCLI('create --system quantum --preset calm --json');
        expect(result.exitCode).toBe(0);
        const json = JSON.parse(result.stdout);
        expect(json.success).toBe(true);
    });

    it('creates with --describe flag', () => {
        const result = runCLI('create --describe "serene ocean deep" --json');
        expect(result.exitCode).toBe(0);
        const json = JSON.parse(result.stdout);
        expect(json.success).toBe(true);
    });

    it('creates with color preset', () => {
        const result = runCLI('create --system quantum --color ocean --json');
        expect(result.exitCode).toBe(0);
        const json = JSON.parse(result.stdout);
        expect(json.success).toBe(true);
    });

    it('creates with multiple flags combined', () => {
        const result = runCLI('create --system faceted --geometry 16 --XW 0.8 --hue 200 --preset cinematic --json');
        expect(result.exitCode).toBe(0);
        const json = JSON.parse(result.stdout);
        expect(json.success).toBe(true);
    });

    it('help shows create command with extended options', () => {
        const result = runCLI('--help --json');
        // --help exits with code 2 (INVALID_ARGS convention)
        const json = JSON.parse(result.stdout);
        expect(json.commands.create).toContain('--describe');
        expect(json.commands.create).toContain('--preset');
    });

    it('examples include create --describe', () => {
        const result = runCLI('--help --json');
        const json = JSON.parse(result.stdout);
        const hasDescribeExample = json.examples.some(e => e.includes('--describe'));
        expect(hasDescribeExample).toBe(true);
    });
});
