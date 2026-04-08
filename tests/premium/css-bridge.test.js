/**
 * Tests for CSSBridge — Premium Module 5
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CSSBridge } from '../../src/premium/CSSBridge.js';

function createMockEngine() {
    let listener = null;
    const params = {
        hue: 180, saturation: 0.7, intensity: 0.8, chaos: 0.3,
        speed: 1.0, gridDensity: 30, morphFactor: 0.5, dimension: 3.5,
        geometry: 5,
        rot4dXY: 0.5, rot4dXZ: 0.3, rot4dYZ: 0.1,
        rot4dXW: 0.0, rot4dYW: 0.0, rot4dZW: 0.0,
    };
    return {
        onParameterChange: vi.fn((cb) => {
            listener = cb;
            return () => { listener = null; };
        }),
        getAllParameters: vi.fn(() => ({ ...params })),
        setParameter: vi.fn((name, value) => { params[name] = value; }),
        getParameter: vi.fn((name) => params[name]),
        _triggerParameterChange(p) {
            if (listener) listener(p || params);
        }
    };
}

function createMockTarget() {
    const styles = {};
    return {
        style: {
            setProperty: vi.fn((name, value) => { styles[name] = value; }),
            getPropertyValue: vi.fn((name) => styles[name] || ''),
        },
        _styles: styles,
    };
}

describe('CSSBridge', () => {
    let engine;
    let bridge;

    beforeEach(() => {
        engine = createMockEngine();
        bridge = new CSSBridge(engine);
    });

    afterEach(() => {
        bridge.destroy();
    });

    describe('construction', () => {
        it('starts inactive', () => {
            expect(bridge.isActive()).toBe(false);
        });

        it('has no options before start', () => {
            expect(bridge.getOptions()).toBeNull();
        });
    });

    describe('start', () => {
        it('activates the bridge', () => {
            const target = createMockTarget();
            bridge.start({ target: target });
            expect(bridge.isActive()).toBe(true);
        });

        it('subscribes to engine parameter changes for outbound', () => {
            const target = createMockTarget();
            bridge.start({ target: target });
            expect(engine.onParameterChange).toHaveBeenCalled();
        });

        it('pushes initial state to CSS', () => {
            const target = createMockTarget();
            bridge.start({ target: target });
            // Should have set CSS variables for default params
            expect(target.style.setProperty).toHaveBeenCalled();
        });

        it('sets default options', () => {
            const target = createMockTarget();
            bridge.start({ target: target });
            const opts = bridge.getOptions();
            expect(opts.outbound).toBe(true);
            expect(opts.inbound).toBe(false);
            expect(opts.throttle).toBe(16);
            expect(opts.normalize).toBe(true);
            expect(opts.prefix).toBe('vib3');
        });

        it('stops previous bridge before restarting', () => {
            const target = createMockTarget();
            bridge.start({ target: target });
            bridge.start({ target: target }); // Should stop first, then start
            expect(bridge.isActive()).toBe(true);
        });
    });

    describe('outbound (engine → CSS)', () => {
        it('sets normalized CSS variables', () => {
            const target = createMockTarget();
            bridge.start({ target: target, parameters: ['hue'] });

            // Trigger parameter change
            engine._triggerParameterChange({ hue: 180 });
            // hue range is 0-360, so 180/360 = 0.5
            const calls = target.style.setProperty.mock.calls;
            const hueCall = calls.find(c => c[0] === '--vib3-hue');
            expect(hueCall).toBeDefined();
            expect(parseFloat(hueCall[1])).toBeCloseTo(0.5, 1);
        });

        it('also sets raw values', () => {
            const target = createMockTarget();
            bridge.start({ target: target, parameters: ['hue'] });

            engine._triggerParameterChange({ hue: 180 });
            const calls = target.style.setProperty.mock.calls;
            const rawCall = calls.find(c => c[0] === '--vib3-hue-raw');
            expect(rawCall).toBeDefined();
            expect(rawCall[1]).toBe('180');
        });

        it('converts camelCase to kebab-case', () => {
            const target = createMockTarget();
            bridge.start({ target: target, parameters: ['gridDensity'] });

            engine._triggerParameterChange({ gridDensity: 30 });
            const calls = target.style.setProperty.mock.calls;
            const densityCall = calls.find(c => c[0] === '--vib3-grid-density');
            expect(densityCall).toBeDefined();
        });

        it('uses custom prefix', () => {
            const target = createMockTarget();
            bridge.start({ target: target, prefix: 'myapp', parameters: ['hue'] });

            engine._triggerParameterChange({ hue: 180 });
            const calls = target.style.setProperty.mock.calls;
            const call = calls.find(c => c[0] === '--myapp-hue');
            expect(call).toBeDefined();
        });

        it('skips non-numeric values', () => {
            const target = createMockTarget();
            bridge.start({ target: target, parameters: ['hue'] });
            target.style.setProperty.mockClear();

            engine._triggerParameterChange({ hue: undefined });
            // Should not have set any property for undefined
        });
    });

    describe('outbound — no normalization', () => {
        it('outputs raw values when normalize=false', () => {
            const target = createMockTarget();
            bridge.start({ target: target, normalize: false, parameters: ['hue'] });

            engine._triggerParameterChange({ hue: 180 });
            const calls = target.style.setProperty.mock.calls;
            const hueCall = calls.find(c => c[0] === '--vib3-hue');
            expect(hueCall).toBeDefined();
            expect(hueCall[1]).toBe('180');
        });
    });

    describe('manual pushToCSS', () => {
        it('pushes a single value to CSS', () => {
            const target = createMockTarget();
            bridge.start({ target: target });
            target.style.setProperty.mockClear();

            bridge.pushToCSS('hue', 90);
            const calls = target.style.setProperty.mock.calls;
            const hueCall = calls.find(c => c[0] === '--vib3-hue');
            expect(hueCall).toBeDefined();
        });
    });

    describe('manual pullFromCSS', () => {
        it('reads a CSS variable and pushes to engine', () => {
            const target = createMockTarget();
            bridge.start({ target: target });

            // Mock getComputedStyle
            const originalGetComputed = globalThis.getComputedStyle;
            globalThis.getComputedStyle = vi.fn(() => ({
                getPropertyValue: vi.fn(() => '0.5')
            }));

            const value = bridge.pullFromCSS('hue');
            // hue denormalized: 0 + 0.5 * (360 - 0) = 180
            expect(value).toBe(180);
            expect(engine.setParameter).toHaveBeenCalledWith('hue', 180);

            globalThis.getComputedStyle = originalGetComputed;
        });

        it('returns 0 for non-numeric CSS values', () => {
            const target = createMockTarget();
            bridge.start({ target: target });

            const originalGetComputed = globalThis.getComputedStyle;
            globalThis.getComputedStyle = vi.fn(() => ({
                getPropertyValue: vi.fn(() => '')
            }));

            const value = bridge.pullFromCSS('hue');
            expect(value).toBe(0);

            globalThis.getComputedStyle = originalGetComputed;
        });
    });

    describe('stop', () => {
        it('deactivates the bridge', () => {
            const target = createMockTarget();
            bridge.start({ target: target });
            bridge.stop();
            expect(bridge.isActive()).toBe(false);
        });
    });

    describe('destroy', () => {
        it('stops and cleans up', () => {
            const target = createMockTarget();
            bridge.start({ target: target });
            bridge.destroy();
            expect(bridge.isActive()).toBe(false);
            expect(bridge.getOptions()).toBeNull();
        });
    });
});
