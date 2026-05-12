import { QuantumEngine } from '../../src/quantum/QuantumEngine.js';

// Mock performance if not available globally
if (typeof performance === 'undefined') {
    globalThis.performance = require('perf_hooks').performance;
}

// Mock minimal dependencies
globalThis.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    requestAnimationFrame: (cb) => setTimeout(cb, 16),
    cancelAnimationFrame: (id) => clearTimeout(id)
};

globalThis.document = {
    getElementById: (id) => {
        return {
            getContext: () => ({
                createBuffer: () => ({}),
                bindBuffer: () => {},
                bufferData: () => {},
                enableVertexAttribArray: () => {},
                vertexAttribPointer: () => {},
                drawArrays: () => {},
                clearColor: () => {},
                clear: () => {},
                useProgram: () => {},
                getUniformLocation: () => ({}),
                uniform1f: () => {},
                uniform3f: () => {},
                uniformMatrix4fv: () => {},
                createShader: () => ({}),
                shaderSource: () => {},
                compileShader: () => {},
                createProgram: () => ({}),
                attachShader: () => {},
                linkProgram: () => {},
                getProgramParameter: () => true,
                getShaderParameter: () => true
            }),
            addEventListener: () => {},
            removeEventListener: () => {},
            style: {}
        };
    }
};

// Create a mock engine structure just to test iteration performance
class MockEngine {
    constructor() {
        this.visualizers = [
            { updateParameters: () => {}, render: () => {} },
            { updateParameters: () => {}, render: () => {} },
            { updateParameters: () => {}, render: () => {} },
            { updateParameters: () => {}, render: () => {} },
            { updateParameters: () => {}, render: () => {} }
        ];
        this.currentParams = {};
    }

    _renderDirectFrameForEach() {
        this.visualizers.forEach(visualizer => {
            if (visualizer.updateParameters && visualizer.render) {
                visualizer.updateParameters(this.currentParams);
                visualizer.render();
            }
        });
    }

    _renderDirectFrameForLoop() {
        for (let i = 0; i < this.visualizers.length; i++) {
            const visualizer = this.visualizers[i];
            if (visualizer.updateParameters && visualizer.render) {
                visualizer.updateParameters(this.currentParams);
                visualizer.render();
            }
        }
    }

    _renderDirectFrameForOf() {
        for (const visualizer of this.visualizers) {
            if (visualizer.updateParameters && visualizer.render) {
                visualizer.updateParameters(this.currentParams);
                visualizer.render();
            }
        }
    }
}

const ITERATIONS = 1000000;
const engine = new MockEngine();

// Warmup
for(let i=0; i<10000; i++) {
    engine._renderDirectFrameForEach();
    engine._renderDirectFrameForLoop();
    engine._renderDirectFrameForOf();
}

console.log(`Running ${ITERATIONS} iterations...`);

let start = performance.now();
for(let i=0; i<ITERATIONS; i++) {
    engine._renderDirectFrameForEach();
}
let end = performance.now();
console.log(`forEach: ${(end - start).toFixed(2)}ms`);

start = performance.now();
for(let i=0; i<ITERATIONS; i++) {
    engine._renderDirectFrameForOf();
}
end = performance.now();
console.log(`for...of: ${(end - start).toFixed(2)}ms`);

start = performance.now();
for(let i=0; i<ITERATIONS; i++) {
    engine._renderDirectFrameForLoop();
}
end = performance.now();
console.log(`for loop: ${(end - start).toFixed(2)}ms`);
