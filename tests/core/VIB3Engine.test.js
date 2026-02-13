import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VIB3Engine } from '../../src/core/VIB3Engine.js';

// Mock dependencies
vi.mock('../../src/core/CanvasManager.js', () => ({
    CanvasManager: vi.fn(() => ({
        createSystemCanvases: vi.fn(() => ['test-canvas']),
        registerContext: vi.fn(),
        destroy: vi.fn()
    }))
}));

vi.mock('../../src/quantum/QuantumEngine.js', () => ({
    QuantumEngine: vi.fn(() => ({
        initWithBridge: vi.fn(),
        updateParameters: vi.fn(),
        setActive: vi.fn(),
        destroy: vi.fn(),
        getBackendType: vi.fn(() => 'webgl')
    }))
}));

vi.mock('../../src/faceted/FacetedSystem.js', () => ({
    FacetedSystem: vi.fn(() => ({
        initWithBridge: vi.fn(),
        initialize: vi.fn(() => true),
        updateParameters: vi.fn(),
        setActive: vi.fn(),
        destroy: vi.fn(), // FacetedSystem uses destroy as alias for dispose in some contexts or vice versa
        dispose: vi.fn(),
        getBackendType: vi.fn(() => 'webgl')
    }))
}));

vi.mock('../../src/holograms/RealHolographicSystem.js', () => ({
    RealHolographicSystem: vi.fn(() => ({
        initWithBridge: vi.fn(),
        updateParameters: vi.fn(),
        setActive: vi.fn(),
        destroy: vi.fn(),
        getBackendType: vi.fn(() => 'webgl')
    }))
}));

vi.mock('../../src/reactivity/ReactivityManager.js', () => ({
    ReactivityManager: vi.fn(() => ({
        loadConfig: vi.fn(),
        getConfig: vi.fn(() => ({})),
        setBaseParameter: vi.fn(),
        setBaseParameters: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        isActive: false,
        setAudioInput: vi.fn(),
        setTiltInput: vi.fn(),
        setMouseInput: vi.fn(),
        triggerClick: vi.fn(),
        setScrollDelta: vi.fn(),
        setTouchInput: vi.fn(),
        destroy: vi.fn()
    }))
}));

vi.mock('../../src/reactivity/SpatialInputSystem.js', () => ({
    SpatialInputSystem: vi.fn(() => ({
        loadProfile: vi.fn(),
        enable: vi.fn(),
        disable: vi.fn(),
        setSensitivity: vi.fn(),
        setDramaticMode: vi.fn(),
        feedInput: vi.fn(),
        exportConfig: vi.fn(() => ({})),
        importConfig: vi.fn(),
        destroy: vi.fn(),
        enabled: false
    }))
}));

vi.mock('../../src/core/VitalitySystem.js', () => ({
    VitalitySystem: vi.fn(() => ({
        start: vi.fn(),
        stop: vi.fn(),
        update: vi.fn(() => 0.5)
    }))
}));

describe('VIB3Engine', () => {
    let engine;

    beforeEach(() => {
        // Mock DOM elements
        document.body.innerHTML = '<div id="vib3-container"></div><canvas id="test-canvas"></canvas>';

        // Mock getContext
        const canvas = document.getElementById('test-canvas');
        canvas.getContext = vi.fn(() => ({}));

        engine = new VIB3Engine();
    });

    afterEach(() => {
        if (engine) {
            engine.destroy();
        }
        vi.clearAllMocks();
        document.body.innerHTML = '';
    });

    describe('Initialization', () => {
        it('should initialize successfully', async () => {
            const result = await engine.initialize();
            expect(result).toBe(true);
            expect(engine.initialized).toBe(true);
            expect(engine.canvasManager).toBeDefined();
            expect(engine.activeSystem).toBeDefined();
            expect(engine.currentSystemName).toBe('quantum');
        });

        it('should handle initialization failure', async () => {
            // Force CanvasManager to throw
            const { CanvasManager } = await import('../../src/core/CanvasManager.js');
            CanvasManager.mockImplementationOnce(() => {
                throw new Error('CanvasManager failed');
            });

            const result = await engine.initialize();
            expect(result).toBe(false);
            expect(engine.initialized).toBe(false);
        });
    });

    describe('System Switching', () => {
        beforeEach(async () => {
            await engine.initialize();
        });

        it('should switch to faceted system', async () => {
            const result = await engine.switchSystem('faceted');
            expect(result).toBe(true);
            expect(engine.currentSystemName).toBe('faceted');
            expect(engine.activeSystem).toBeDefined();
        });

        it('should switch to holographic system', async () => {
            const result = await engine.switchSystem('holographic');
            expect(result).toBe(true);
            expect(engine.currentSystemName).toBe('holographic');
        });

        it('should fail for unknown system', async () => {
            const result = await engine.switchSystem('unknown');
            expect(result).toBe(false);
            expect(engine.currentSystemName).toBe('quantum'); // Should remain on previous system
        });

        it('should destroy previous system when switching', async () => {
            const oldSystem = engine.activeSystem;
            await engine.switchSystem('faceted');
            expect(oldSystem.destroy).toHaveBeenCalled();
        });
    });

    describe('Parameter Management', () => {
        beforeEach(async () => {
            await engine.initialize();
        });

        it('should set and get a parameter', () => {
            engine.setParameter('hue', 100);
            expect(engine.getParameter('hue')).toBe(100);
        });

        it('should update active system when parameter changes', () => {
            engine.setParameter('hue', 150);
            expect(engine.activeSystem.updateParameters).toHaveBeenCalled();
        });

        it('should set multiple parameters', () => {
            engine.setParameters({ hue: 200, speed: 2.0 });
            const params = engine.getAllParameters();
            expect(params.hue).toBe(200);
            expect(params.speed).toBe(2.0);
        });

        it('should randomize parameters', () => {
            const initialHue = engine.getParameter('hue');
            // Assuming randomization changes the value, but we mock dependencies so we verify method calls
            // Since ParameterManager is not mocked directly but instantiated inside VIB3Engine,
            // we rely on VIB3Engine's integration with it.
            // However, ParameterManager logic is real here unless we mock it too.
            // Let's check if updateParameters is called on active system.
            engine.randomizeAll();
            expect(engine.activeSystem.updateParameters).toHaveBeenCalled();
        });

        it('should reset parameters', () => {
            engine.setParameter('hue', 300);
            engine.resetAll();
            // Assuming default hue is not 300.
            expect(engine.activeSystem.updateParameters).toHaveBeenCalled();
        });
    });

    describe('Reactivity Integration', () => {
        beforeEach(async () => {
            await engine.initialize();
        });

        it('should start and stop reactivity', () => {
            engine.startReactivity();
            expect(engine.reactivity.start).toHaveBeenCalled();

            engine.stopReactivity();
            expect(engine.reactivity.stop).toHaveBeenCalled();
        });

        it('should forward audio input', () => {
            engine.setAudioInput(0.5, 0.3, 0.2, 0.4);
            expect(engine.reactivity.setAudioInput).toHaveBeenCalledWith(0.5, 0.3, 0.2, 0.4);
        });

        it('should forward tilt input', () => {
            engine.setTiltInput(10, 20, 30);
            expect(engine.reactivity.setTiltInput).toHaveBeenCalledWith(10, 20, 30);
        });

        it('should forward mouse input', () => {
            engine.setMouseInput(0.1, 0.2, 0.01, 0.02);
            expect(engine.reactivity.setMouseInput).toHaveBeenCalledWith(0.1, 0.2, 0.01, 0.02);
        });

        it('should trigger click', () => {
            engine.triggerClick(0.8);
            expect(engine.reactivity.triggerClick).toHaveBeenCalledWith(0.8);
        });
    });

    describe('Spatial Input Integration', () => {
        beforeEach(async () => {
            await engine.initialize();
        });

        it('should enable spatial input with profile', () => {
            engine.enableSpatialInput('gamepad');
            expect(engine.spatialInput.loadProfile).toHaveBeenCalledWith('gamepad');
            expect(engine.spatialInput.enable).toHaveBeenCalled();
        });

        it('should disable spatial input', () => {
            engine.disableSpatialInput();
            expect(engine.spatialInput.disable).toHaveBeenCalled();
        });

        it('should set spatial profile', () => {
            engine.setSpatialProfile('cardTilt');
            expect(engine.spatialInput.loadProfile).toHaveBeenCalledWith('cardTilt');
        });

        it('should feed programmatic input', () => {
            const data = { pitch: 0.5 };
            engine.feedSpatialInput(data);
            expect(engine.spatialInput.feedInput).toHaveBeenCalledWith('programmatic', data);
        });
    });

    describe('State Management', () => {
        beforeEach(async () => {
            await engine.initialize();
        });

        it('should export state correctly', () => {
            const state = engine.exportState();
            expect(state.system).toBe('quantum');
            expect(state.parameters).toBeDefined();
            expect(state.reactivity).toBeDefined();
            expect(state.spatialInput).toBeDefined();
            expect(state.version).toBe('2.0.3');
        });

        it('should import state correctly', async () => {
            const state = {
                system: 'faceted',
                parameters: { hue: 123 },
                reactivityActive: true,
                spatialActive: true
            };

            await engine.importState(state);

            expect(engine.currentSystemName).toBe('faceted');
            expect(engine.getParameter('hue')).toBe(123);
            expect(engine.reactivity.start).toHaveBeenCalled();
            expect(engine.spatialInput.enable).toHaveBeenCalled();
        });

        it('should reject invalid state import', async () => {
            const consoleSpy = vi.spyOn(console, 'warn');
            await engine.importState(null);
            expect(consoleSpy).toHaveBeenCalledWith('VIB3Engine: importState received invalid state');
        });
    });

    describe('Destruction', () => {
        beforeEach(async () => {
            await engine.initialize();
        });

        it('should cleanup resources on destroy', () => {
            const canvasManager = engine.canvasManager;
            const spatialInput = engine.spatialInput;
            const reactivity = engine.reactivity;
            const vitality = engine.vitality;

            engine.destroy();

            expect(vitality.stop).toHaveBeenCalled();
            expect(spatialInput.destroy).toHaveBeenCalled();
            expect(reactivity.destroy).toHaveBeenCalled();
            expect(canvasManager.destroy).toHaveBeenCalled();
            expect(engine.initialized).toBe(false);
        });
    });
});
