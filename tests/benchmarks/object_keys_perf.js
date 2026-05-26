const params = { a: 1, b: 2, c: 3, d: 4, e: 5 };

function withKeysForEach() {
    let sum = 0;
    Object.keys(params).forEach(param => {
        sum += params[param];
    });
    return sum;
}

function withForIn() {
    let sum = 0;
    for (const param in params) {
        if (Object.prototype.hasOwnProperty.call(params, param)) {
            sum += params[param];
        }
    }
    return sum;
}

// Warmup
for (let i = 0; i < 10000; i++) {
    withKeysForEach();
    withForIn();
}

const iterations = 5000000;
const startForEach = performance.now();
for (let i = 0; i < iterations; i++) {
    withKeysForEach();
}
const timeForEach = performance.now() - startForEach;

const startForIn = performance.now();
for (let i = 0; i < iterations; i++) {
    withForIn();
}
const timeForIn = performance.now() - startForIn;

console.log(`Object.keys().forEach: ${timeForEach.toFixed(2)}ms`);
console.log(`for...in: ${timeForIn.toFixed(2)}ms`);
console.log(`Improvement: ${(((timeForEach - timeForIn) / timeForEach) * 100).toFixed(2)}%`);
