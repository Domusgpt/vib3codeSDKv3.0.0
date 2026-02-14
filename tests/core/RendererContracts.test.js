import { describe, it, expect, vi } from 'vitest';
import {
    RendererContract,
    RendererContractAdapter,
    verifyRendererContract,
    ResourceManagerContract
} from '../../src/core/RendererContracts.js';
import { QuantumRendererAdapter } from '../../src/core/renderers/QuantumRendererAdapter.js';
import { FacetedRendererAdapter } from '../../src/core/renderers/FacetedRendererAdapter.js';
import { HolographicRendererAdapter } from '../../src/core/renderers/HolographicRendererAdapter.js';

// Mock system that mimics the real API surface of all three systems
function createMockSystem() {
    return {
        init: vi.fn().mockReturnValue(true),
        resize: vi.fn(),
        render: vi.fn(),
        setActive: vi.fn(),
        dispose: vi.fn(),
        destroy: vi.fn(),
        updateParameters: vi.fn(),
        updateParameter: vi.fn(),
        getBackendType: vi.fn().mockReturnValue('webgl'),
    };
}

describe('RendererContract', () => {
    it('throws on unimplemented init()', () => {
        const contract = new RendererContract();
        expect(() => contract.init()).toThrow('must be implemented');
    });

    it('throws on unimplemented resize()', () => {
        const contract = new RendererContract();
        expect(() => contract.resize(800, 600)).toThrow('must be implemented');
    });

    it('throws on unimplemented render()', () => {
        const contract = new RendererContract();
        expect(() => contract.render()).toThrow('must be implemented');
    });

    it('throws on unimplemented setActive()', () => {
        const contract = new RendererContract();
        expect(() => contract.setActive(true)).toThrow('must be implemented');
    });

    it('throws on unimplemented dispose()', () => {
        const contract = new RendererContract();
        expect(() => contract.dispose()).toThrow('must be implemented');
    });
});

describe('RendererContractAdapter', () => {
    it('provides default init that sets initialized flag', () => {
        const adapter = new RendererContractAdapter();
        expect(adapter.initialized).toBe(false);
        const result = adapter.init({});
        expect(result).toBe(true);
        expect(adapter.initialized).toBe(true);
    });

    it('stores dimensions on resize', () => {
        const adapter = new RendererContractAdapter();
        adapter.resize(1920, 1080, 2);
        expect(adapter._width).toBe(1920);
        expect(adapter._height).toBe(1080);
        expect(adapter._pixelRatio).toBe(2);
    });

    it('tracks active state', () => {
        const adapter = new RendererContractAdapter();
        expect(adapter.isActive).toBe(false);
        adapter.setActive(true);
        expect(adapter.isActive).toBe(true);
        adapter.setActive(false);
        expect(adapter.isActive).toBe(false);
    });

    it('dispose resets state', () => {
        const adapter = new RendererContractAdapter();
        adapter.init({});
        adapter.setActive(true);
        expect(adapter.initialized).toBe(true);
        expect(adapter.isActive).toBe(true);

        adapter.dispose();
        expect(adapter.initialized).toBe(false);
        expect(adapter.isActive).toBe(false);
    });

    it('render is a no-op by default', () => {
        const adapter = new RendererContractAdapter();
        expect(() => adapter.render({})).not.toThrow();
    });
});

describe('verifyRendererContract', () => {
    it('reports fully compliant system', () => {
        const system = {
            init: () => {},
            resize: () => {},
            render: () => {},
            setActive: () => {},
            dispose: () => {}
        };
        const result = verifyRendererContract(system);
        expect(result.compliant).toBe(true);
        expect(result.missing).toHaveLength(0);
    });

    it('reports missing methods', () => {
        const system = { setActive: () => {} };
        const result = verifyRendererContract(system);
        expect(result.compliant).toBe(false);
        expect(result.missing).toContain('init');
        expect(result.missing).toContain('resize');
        expect(result.missing).toContain('render');
        expect(result.missing).toContain('dispose');
        expect(result.missing).not.toContain('setActive');
    });

    it('warns on aliases (destroy for dispose, initialize for init)', () => {
        const system = {
            initialize: () => {},
            resize: () => {},
            renderFrame: () => {},
            setActive: () => {},
            destroy: () => {}
        };
        const result = verifyRendererContract(system);
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings.some(w => w.includes('init'))).toBe(true);
        expect(result.warnings.some(w => w.includes('dispose'))).toBe(true);
        expect(result.warnings.some(w => w.includes('render'))).toBe(true);
    });

    it('handles empty object', () => {
        const result = verifyRendererContract({});
        expect(result.compliant).toBe(false);
        expect(result.missing).toHaveLength(5);
    });
});

describe('ResourceManagerContract', () => {
    it('throws on unimplemented methods', () => {
        const rmc = new ResourceManagerContract();
        expect(() => rmc.registerResource('texture', 'id1', {})).toThrow();
        expect(() => rmc.releaseResource('texture', 'id1')).toThrow();
        expect(() => rmc.disposeAll()).toThrow();
        expect(() => rmc.getStats()).toThrow();
    });
});

describe('QuantumRendererAdapter', () => {
    it('delegates init to system', () => {
        const mock = createMockSystem();
        const adapter = new QuantumRendererAdapter(mock);
        adapter.init({ canvas: null });
        expect(mock.init).toHaveBeenCalled();
    });

    it('delegates resize to system', () => {
        const mock = createMockSystem();
        const adapter = new QuantumRendererAdapter(mock);
        adapter.resize(1920, 1080, 2);
        expect(mock.resize).toHaveBeenCalledWith(1920, 1080, 2);
    });

    it('delegates render to system.render()', () => {
        const mock = createMockSystem();
        const adapter = new QuantumRendererAdapter(mock);
        const frameState = { time: 1.5 };
        adapter.render(frameState);
        expect(mock.render).toHaveBeenCalledWith(frameState);
    });

    it('delegates setActive to system', () => {
        const mock = createMockSystem();
        const adapter = new QuantumRendererAdapter(mock);
        adapter.setActive(true);
        expect(mock.setActive).toHaveBeenCalledWith(true);
    });

    it('delegates dispose to system.dispose()', () => {
        const mock = createMockSystem();
        const adapter = new QuantumRendererAdapter(mock);
        adapter.dispose();
        expect(mock.dispose).toHaveBeenCalled();
    });
});

describe('FacetedRendererAdapter', () => {
    it('delegates init to system', () => {
        const mock = createMockSystem();
        const adapter = new FacetedRendererAdapter(mock);
        adapter.init({});
        expect(mock.init).toHaveBeenCalled();
    });

    it('delegates resize to system', () => {
        const mock = createMockSystem();
        const adapter = new FacetedRendererAdapter(mock);
        adapter.resize(800, 600, 1);
        expect(mock.resize).toHaveBeenCalledWith(800, 600, 1);
    });

    it('delegates render to system.render()', () => {
        const mock = createMockSystem();
        const adapter = new FacetedRendererAdapter(mock);
        adapter.render({ time: 0 });
        expect(mock.render).toHaveBeenCalledWith({ time: 0 });
    });

    it('delegates dispose to system.dispose()', () => {
        const mock = createMockSystem();
        const adapter = new FacetedRendererAdapter(mock);
        adapter.dispose();
        expect(mock.dispose).toHaveBeenCalled();
    });
});

describe('HolographicRendererAdapter', () => {
    it('delegates init to system', () => {
        const mock = createMockSystem();
        const adapter = new HolographicRendererAdapter(mock);
        adapter.init({});
        expect(mock.init).toHaveBeenCalled();
    });

    it('delegates resize to system', () => {
        const mock = createMockSystem();
        const adapter = new HolographicRendererAdapter(mock);
        adapter.resize(1024, 768, 1.5);
        expect(mock.resize).toHaveBeenCalledWith(1024, 768, 1.5);
    });

    it('delegates render to system.render()', () => {
        const mock = createMockSystem();
        const adapter = new HolographicRendererAdapter(mock);
        adapter.render({ time: 2 });
        expect(mock.render).toHaveBeenCalledWith({ time: 2 });
    });

    it('delegates dispose to system.dispose()', () => {
        const mock = createMockSystem();
        const adapter = new HolographicRendererAdapter(mock);
        adapter.dispose();
        expect(mock.dispose).toHaveBeenCalled();
    });

    it('setActive delegates correctly', () => {
        const mock = createMockSystem();
        const adapter = new HolographicRendererAdapter(mock);
        adapter.setActive(false);
        expect(mock.setActive).toHaveBeenCalledWith(false);
    });
});
