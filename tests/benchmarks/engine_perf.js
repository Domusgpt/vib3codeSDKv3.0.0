import { performance } from 'perf_hooks';

// Simulate QuantumEngine and RealHolographicSystem render loop methods
class EngineForeach {
    constructor(visualizers) {
        this.visualizers = visualizers;
        this.parameters = { getAllParameters: () => ({ param1: 1, param2: 2 }) };
    }
    _renderDirectFrame() {
        const currentParams = this.parameters.getAllParameters();
        this.visualizers.forEach(visualizer => {
            if (visualizer.updateParameters && visualizer.render) {
                visualizer.updateParameters(currentParams);
                visualizer.render();
            }
        });
    }
}

class EngineFor {
    constructor(visualizers) {
        this.visualizers = visualizers;
        this.parameters = { getAllParameters: () => ({ param1: 1, param2: 2 }) };
    }
    _renderDirectFrame() {
        const currentParams = this.parameters.getAllParameters();
        const visualizers = this.visualizers;
        for (let i = 0, len = visualizers.length; i < len; i++) {
            const visualizer = visualizers[i];
            if (visualizer.updateParameters && visualizer.render) {
                visualizer.updateParameters(currentParams);
                visualizer.render();
            }
        }
    }
}

const mockVisualizers = Array.from({ length: 5 }, () => ({
    updateParameters: () => {},
    render: () => {}
}));

const engineForeach = new EngineForeach(mockVisualizers);
const engineFor = new EngineFor(mockVisualizers);

const iterations = 100000;

// Warmup
for (let i = 0; i < 1000; i++) {
    engineForeach._renderDirectFrame();
    engineFor._renderDirectFrame();
}

const start1 = performance.now();
for (let i = 0; i < iterations; i++) {
    engineForeach._renderDirectFrame();
}
const end1 = performance.now();
const timeForeach = end1 - start1;

const start2 = performance.now();
for (let i = 0; i < iterations; i++) {
    engineFor._renderDirectFrame();
}
const end2 = performance.now();
const timeFor = end2 - start2;

console.log(`forEach: ${timeForeach.toFixed(2)}ms`);
console.log(`for loop: ${timeFor.toFixed(2)}ms`);
console.log(`Improvement: ${((timeForeach - timeFor) / timeForeach * 100).toFixed(2)}%`);
