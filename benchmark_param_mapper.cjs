const { performance } = require('perf_hooks');

const params = {
    geometryType: 1,
    polytope: 2,
    density: 15,
    gridDensity: 20,
    morph: 0.5,
    morphFactor: 1.0,
    rot4dXW: 0.1,
    rot4dYW: -0.2,
    rot4dZW: 0.5
};

const mapping = {
    geometryType: 'geometryType',
    polytope: 'polytope',
    density: 'density',
    gridDensity: 'gridDensity',
    morph: 'morph',
    morphFactor: 'morphFactor',
    rot4dXW: 'rot4dXW',
    rot4dYW: 'rot4dYW',
    rot4dZW: 'rot4dZW'
};

const unifiedSchema = {
    geometryType: { default: 0 },
    polytope: { default: 0 },
    density: { default: 10 },
    gridDensity: { default: 10 },
    morph: { default: 0 },
    morphFactor: { default: 0 },
    rot4dXW: { default: 0 },
    rot4dYW: { default: 0 },
    rot4dZW: { default: 0 },
    dimension: { default: 3.8 },
    speed: { default: 1.0 }
};

// Object.entries + forEach
function methodA() {
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

// for...in loop
function methodB() {
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

const ITERATIONS = 100000;

// Warmup
for (let i = 0; i < 1000; i++) {
    methodA();
    methodB();
}

const startA = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    methodA();
}
const endA = performance.now();

const startB = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
    methodB();
}
const endB = performance.now();

console.log(`Object.entries + forEach: ${(endA - startA).toFixed(2)}ms`);
console.log(`for...in loop: ${(endB - startB).toFixed(2)}ms`);
console.log(`Performance improvement: ${(((endA - startA) - (endB - startB)) / (endA - startA) * 100).toFixed(2)}%`);
