const { performance } = require('perf_hooks');

const params = { geometry: 5, gridDensity: 20, speed: 2, hue: 100, chaos: 0.5 };
const mapping = { geometry: 'geometryType', gridDensity: 'density' };
const unifiedSchema = {
    geometryType: { min: 0, max: 7, default: 0, type: 'integer' },
    polytope: { min: 0, max: 5, default: 0, type: 'integer' },
    density: { min: 1, max: 30, default: 10, type: 'float' },
    speed: { min: 0.1, max: 3.0, default: 1.0, type: 'float' },
    hue: { min: 0, max: 360, default: 200, type: 'float' },
    chaos: { min: 0, max: 1, default: 0, type: 'float' },
    morph: { min: 0, max: 2, default: 0, type: 'float' },
    dimension: { min: 3.0, max: 4.5, default: 3.8, type: 'float' }
};

function original() {
    const unified = {};
    Object.entries(params).forEach(([key, value]) => {
        const unifiedKey = mapping[key] || key;
        unified[unifiedKey] = value;
    });

    Object.entries(unifiedSchema).forEach(([key, schema]) => {
        if (unified[key] === undefined) {
            unified[key] = schema.default;
        }
    });
    return unified;
}

function optimized() {
    const unified = {};
    for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
            const unifiedKey = mapping[key] || key;
            unified[unifiedKey] = params[key];
        }
    }

    for (const key in unifiedSchema) {
        if (Object.prototype.hasOwnProperty.call(unifiedSchema, key)) {
            if (unified[key] === undefined) {
                unified[key] = unifiedSchema[key].default;
            }
        }
    }
    return unified;
}

// Warmup
for (let i = 0; i < 10000; i++) {
    original();
    optimized();
}

const iters = 500000;
let t0 = performance.now();
for (let i = 0; i < iters; i++) {
    original();
}
let t1 = performance.now();
const origTime = t1 - t0;

t0 = performance.now();
for (let i = 0; i < iters; i++) {
    optimized();
}
t1 = performance.now();
const optTime = t1 - t0;

console.log(`Original: ${origTime.toFixed(2)}ms`);
console.log(`Optimized: ${optTime.toFixed(2)}ms`);
console.log(`Improvement: ${((origTime - optTime) / origTime * 100).toFixed(2)}%`);
