/**
 * Tests for enablePremium() — Premium Entry Point
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { enablePremium } from '../../src/premium/index.js';

function createMockEngine() {
    let listener = null;
    const params = {
        hue: 180, chaos: 0.3, speed: 1.0, geometry: 5,
        rot4dXY: 0, rot4dXZ: 0, rot4dYZ: 0,
        rot4dXW: 0, rot4dYW: 0, rot4dZW: 0,
    };
    return {
        _plugins: [],
        activeSystem: {
            name: 'quantum',
            layerGraph: { setRelationship: vi.fn() },
            loadRelationshipProfile: vi.fn(),
        },
        parameters: {
            setParameter: vi.fn((name, value) => { params[name] = value; }),
        },
        getParameter: vi.fn((name) => params[name] ?? 0),
        setParameter: vi.fn((name, value) => { params[name] = value; }),
        setParameters: vi.fn(),
        getAllParameters: vi.fn(() => ({ ...params })),
        onParameterChange: vi.fn((cb) => {
            listener = cb;
            return () => { listener = null; };
        }),
        updateCurrentSystemParameters: vi.fn(),
        registerPlugin: vi.fn(function(plugin) {
            if (typeof plugin.attach === 'function') {
                plugin.attach(this);
                this._plugins.push(plugin);
            }
        }),
        destroy: vi.fn(),
    };
}

describe('enablePremium', () => {
    let engine;

    beforeEach(() => {
        engine = createMockEngine();
    });

    describe('basic activation', () => {
        it('returns a premium context object', () => {
            const premium = enablePremium(engine, { licenseKey: 'test-license-key-123' });
            expect(premium).toBeDefined();
            expect(typeof premium.isLicensed).toBe('function');
            expect(typeof premium.destroy).toBe('function');
        });

        it('throws without an engine', () => {
            expect(() => enablePremium(null)).toThrow(/requires a VIB3Engine/);
        });

        it('validates license key', () => {
            const licensed = enablePremium(engine, { licenseKey: 'valid-key-1234' });
            expect(licensed.isLicensed()).toBe(true);
        });

        it('rejects empty license key', () => {
            const unlicensed = enablePremium(engine, {});
            expect(unlicensed.isLicensed()).toBe(false);
        });

        it('rejects short license key', () => {
            const unlicensed = enablePremium(engine, { licenseKey: 'short' });
            expect(unlicensed.isLicensed()).toBe(false);
        });

        it('registers as a plugin on the engine', () => {
            enablePremium(engine, { licenseKey: 'test-license-key-123' });
            expect(engine.registerPlugin).toHaveBeenCalled();
        });
    });

    describe('feature selection', () => {
        it('enables all modules by default', () => {
            const premium = enablePremium(engine, { licenseKey: 'test-license-key-123' });
            expect(premium.shaderSurface).toBeDefined();
            expect(premium.rotationLock).toBeDefined();
            expect(premium.layerGeometry).toBeDefined();
            expect(premium.events).toBeDefined();
            expect(premium.cssBridge).toBeDefined();
            expect(premium.choreography).toBeDefined();
            expect(premium.frameworkSync).toBeDefined();
            expect(premium.mcp).toBeDefined();
        });

        it('enables all modules with features=["all"]', () => {
            const premium = enablePremium(engine, {
                licenseKey: 'test-license-key-123',
                features: ['all']
            });
            expect(premium.getEnabledFeatures()).toHaveLength(8);
        });

        it('enables only selected features', () => {
            const premium = enablePremium(engine, {
                licenseKey: 'test-license-key-123',
                features: ['shaderSurface', 'rotationLock']
            });
            expect(premium.shaderSurface).toBeDefined();
            expect(premium.rotationLock).toBeDefined();
            expect(premium.layerGeometry).toBeUndefined();
            expect(premium.events).toBeUndefined();
            expect(premium.cssBridge).toBeUndefined();
        });

        it('reports enabled features', () => {
            const premium = enablePremium(engine, {
                licenseKey: 'test-license-key-123',
                features: ['shaderSurface', 'events']
            });
            const features = premium.getEnabledFeatures();
            expect(features).toContain('shaderSurface');
            expect(features).toContain('events');
            expect(features).not.toContain('rotationLock');
        });
    });

    describe('module instances', () => {
        it('creates ShaderParameterSurface', () => {
            const premium = enablePremium(engine, {
                licenseKey: 'test-license-key-123',
                features: ['shaderSurface']
            });
            expect(premium.shaderSurface.getAllParameters()).toBeDefined();
            expect(premium.shaderSurface.getParameter('uvScale')).toBe(3.0);
        });

        it('creates RotationLockSystem', () => {
            const premium = enablePremium(engine, {
                licenseKey: 'test-license-key-123',
                features: ['rotationLock']
            });
            expect(premium.rotationLock.getLockedAxes()).toEqual([]);
            expect(premium.rotationLock.isFlightMode()).toBe(false);
        });

        it('creates LayerGeometryMixer', () => {
            const premium = enablePremium(engine, {
                licenseKey: 'test-license-key-123',
                features: ['layerGeometry']
            });
            const geoms = premium.layerGeometry.getLayerGeometries();
            expect(geoms.content).toBe(5);
        });

        it('creates VisualEventSystem', () => {
            const premium = enablePremium(engine, {
                licenseKey: 'test-license-key-123',
                features: ['events']
            });
            expect(premium.events.listTriggers()).toEqual([]);
        });

        it('creates CSSBridge', () => {
            const premium = enablePremium(engine, {
                licenseKey: 'test-license-key-123',
                features: ['cssBridge']
            });
            expect(premium.cssBridge.isActive()).toBe(false);
        });

        it('creates ChoreographyExtensions', () => {
            const premium = enablePremium(engine, {
                licenseKey: 'test-license-key-123',
                features: ['choreography']
            });
            const spec = premium.choreography.createExtendedChoreography({
                scenes: [{ system: 'quantum', duration: 1000 }]
            });
            expect(spec.scenes).toHaveLength(1);
        });

        it('creates FrameworkSync', () => {
            const premium = enablePremium(engine, {
                licenseKey: 'test-license-key-123',
                features: ['frameworkSync']
            });
            expect(typeof premium.frameworkSync.generateReactHook).toBe('function');
        });

        it('creates PremiumMCPServer', () => {
            const premium = enablePremium(engine, {
                licenseKey: 'test-license-key-123',
                features: ['mcp']
            });
            expect(premium.mcp.getToolDefinitions()).toHaveLength(8);
        });

        it('passes baseMCPServer to PremiumMCPServer', () => {
            const baseMCP = {
                getToolDefinitions: () => [{ name: 'get_state' }],
                handleToolCall: vi.fn()
            };
            const premium = enablePremium(engine, {
                licenseKey: 'test-license-key-123',
                features: ['mcp'],
                baseMCPServer: baseMCP
            });
            const all = premium.mcp.getAllToolDefinitions();
            const names = all.map(t => t.name);
            expect(names).toContain('get_state');
        });
    });

    describe('destroy', () => {
        it('destroys all modules', () => {
            const premium = enablePremium(engine, { licenseKey: 'test-license-key-123' });
            premium.destroy();
            expect(premium.isLicensed()).toBe(false);
            expect(premium.getEnabledFeatures()).toEqual([]);
        });

        it('cleans up engine references', () => {
            const premium = enablePremium(engine, { licenseKey: 'test-license-key-123' });
            premium.destroy();
            expect(premium._engine).toBeNull();
        });
    });
});
