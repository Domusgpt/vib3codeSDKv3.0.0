// Mock visualizer with realistic update function
const visualizers = new Array(5).fill(0).map(() => ({
    updateParameters: () => {},
    render: () => {},
    variant: 0,
    variantParams: {},
    roleParams: {}
}));

const currentParams = {
    rotationSpeed: 1.0,
    colorIntensity: 0.8,
    scale: 2.0,
    time: 123.45,
    noiseScale: 0.5
};

const customParams = {
    colorIntensity: 1.2,
    noiseScale: 0.8
};

// 1. Array iteration approaches
function renderWithForEach() {
    visualizers.forEach(visualizer => {
        if (visualizer.updateParameters && visualizer.render) {
            visualizer.updateParameters(currentParams);
            visualizer.render();
        }
    });
}

function renderWithForLoop() {
    for (let i = 0, len = visualizers.length; i < len; i++) {
        const visualizer = visualizers[i];
        if (visualizer.updateParameters && visualizer.render) {
            visualizer.updateParameters(currentParams);
            visualizer.render();
        }
    }
}

// 2. Object keys approaches
function updateCustomParamsWithForEach() {
    visualizers.forEach(visualizer => {
        Object.keys(customParams).forEach(param => {
            visualizer.variantParams[param] = customParams[param];
        });
    });
}

function updateCustomParamsWithForIn() {
    for (let i = 0, len = visualizers.length; i < len; i++) {
        const visualizer = visualizers[i];
        for (const param in customParams) {
            if (Object.prototype.hasOwnProperty.call(customParams, param)) {
                visualizer.variantParams[param] = customParams[param];
            }
        }
    }
}

// Warmup
for (let i = 0; i < 10000; i++) {
    renderWithForEach();
    renderWithForLoop();
    updateCustomParamsWithForEach();
    updateCustomParamsWithForIn();
}

const iterations = 5000000;

console.log("--- Render Loop Benchmarks ---");
const startRenderForEach = performance.now();
for (let i = 0; i < iterations; i++) {
    renderWithForEach();
}
const timeRenderForEach = performance.now() - startRenderForEach;

const startRenderForLoop = performance.now();
for (let i = 0; i < iterations; i++) {
    renderWithForLoop();
}
const timeRenderForLoop = performance.now() - startRenderForLoop;

console.log(`Render .forEach(): ${timeRenderForEach.toFixed(2)}ms`);
console.log(`Render for loop: ${timeRenderForLoop.toFixed(2)}ms`);
console.log(`Improvement: ${(((timeRenderForEach - timeRenderForLoop) / timeRenderForEach) * 100).toFixed(2)}%\n`);

console.log("--- Params Update Benchmarks ---");
const startParamsForEach = performance.now();
for (let i = 0; i < iterations; i++) {
    updateCustomParamsWithForEach();
}
const timeParamsForEach = performance.now() - startParamsForEach;

const startParamsForIn = performance.now();
for (let i = 0; i < iterations; i++) {
    updateCustomParamsWithForIn();
}
const timeParamsForIn = performance.now() - startParamsForIn;

console.log(`Params Object.keys().forEach(): ${timeParamsForEach.toFixed(2)}ms`);
console.log(`Params for...in: ${timeParamsForIn.toFixed(2)}ms`);
console.log(`Improvement: ${(((timeParamsForEach - timeParamsForIn) / timeParamsForEach) * 100).toFixed(2)}%`);
