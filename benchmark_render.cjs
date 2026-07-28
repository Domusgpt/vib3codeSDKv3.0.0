const { performance } = require('perf_hooks');

const visualizers = Array.from({ length: 10 }, () => ({
    render: () => { let a = 1 + 1; },
    updateParameters: (p) => { let a = p; }
}));
const currentParams = { a: 1 };

function testForEach() {
    visualizers.forEach(visualizer => {
        if (visualizer.updateParameters && visualizer.render) {
            visualizer.updateParameters(currentParams);
            visualizer.render();
        }
    });
}

function testForLoop() {
    for (let i = 0, len = visualizers.length; i < len; i++) {
        const visualizer = visualizers[i];
        if (visualizer.updateParameters && visualizer.render) {
            visualizer.updateParameters(currentParams);
            visualizer.render();
        }
    }
}

// Warmup
for (let i = 0; i < 10000; i++) {
    testForEach();
    testForLoop();
}

const iterations = 1000000;
const t0 = performance.now();
for (let i = 0; i < iterations; i++) {
    testForEach();
}
const t1 = performance.now();

const t2 = performance.now();
for (let i = 0; i < iterations; i++) {
    testForLoop();
}
const t3 = performance.now();

console.log(`forEach: ${(t1 - t0).toFixed(2)}ms`);
console.log(`for loop: ${(t3 - t2).toFixed(2)}ms`);
console.log(`Improvement: ${(((t1 - t0) - (t3 - t2)) / (t1 - t0) * 100).toFixed(2)}%`);
