const visualizers = new Array(5).fill({
    updateParameters: () => {},
    render: () => {}
});

const currentParams = { a: 1, b: 2 };

function withForEach() {
    visualizers.forEach(visualizer => {
        if (visualizer.updateParameters && visualizer.render) {
            visualizer.updateParameters(currentParams);
            visualizer.render();
        }
    });
}

function withForLoop() {
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
    withForEach();
    withForLoop();
}

const iterations = 5000000;
const startForEach = performance.now();
for (let i = 0; i < iterations; i++) {
    withForEach();
}
const timeForEach = performance.now() - startForEach;

const startForLoop = performance.now();
for (let i = 0; i < iterations; i++) {
    withForLoop();
}
const timeForLoop = performance.now() - startForLoop;

console.log(`forEach: ${timeForEach.toFixed(2)}ms`);
console.log(`forLoop: ${timeForLoop.toFixed(2)}ms`);
console.log(`Improvement: ${(((timeForEach - timeForLoop) / timeForEach) * 100).toFixed(2)}%`);
