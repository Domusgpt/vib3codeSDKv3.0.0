const params = { a: 1, b: 2, c: 3, d: 4, e: 5 };

function withEntriesForEach() {
    let sum = 0;
    Object.entries(params).forEach(([key, value]) => {
        sum += value;
    });
    return sum;
}

function withForIn() {
    let sum = 0;
    for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
            sum += params[key];
        }
    }
    return sum;
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

console.log(`Object.entries().forEach: ${timeEntries.toFixed(2)}ms`);
console.log(`for...in: ${timeForIn.toFixed(2)}ms`);
console.log(`Improvement: ${(((timeEntries - timeForIn) / timeEntries) * 100).toFixed(2)}%`);
