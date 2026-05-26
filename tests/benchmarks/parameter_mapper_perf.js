const unifiedSchema = {
    color: { type: 'string', default: '#ffffff' },
    intensity: { type: 'number', default: 1.0 },
    speed: { type: 'number', default: 1.0 },
    scale: { type: 'number', default: 1.0 },
    rotation: { type: 'number', default: 0.0 }
};

function withEntriesForEach() {
    const defaults = {};
    Object.entries(unifiedSchema).forEach(([unifiedKey, schema]) => {
        defaults[unifiedKey] = schema.default;
    });
    return defaults;
}

function withForIn() {
    const defaults = {};
    for (const unifiedKey in unifiedSchema) {
        if (Object.prototype.hasOwnProperty.call(unifiedSchema, unifiedKey)) {
            defaults[unifiedKey] = unifiedSchema[unifiedKey].default;
        }
    }
    return defaults;
}

// Warmup
for (let i = 0; i < 10000; i++) {
    withEntriesForEach();
    withForIn();
}

const iterations = 5000000;
const startEntries = performance.now();
for (let i = 0; i < iterations; i++) {
    withEntriesForEach();
}
const timeEntries = performance.now() - startEntries;

const startForIn = performance.now();
for (let i = 0; i < iterations; i++) {
    withForIn();
}
const timeForIn = performance.now() - startForIn;

console.log(`ParameterMapper Object.entries().forEach(): ${timeEntries.toFixed(2)}ms`);
console.log(`ParameterMapper for...in: ${timeForIn.toFixed(2)}ms`);
console.log(`Improvement: ${(((timeEntries - timeForIn) / timeEntries) * 100).toFixed(2)}%`);
