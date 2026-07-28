const { performance } = require('perf_hooks');

const arr = [1, 2, 3, 4, 5];
const iterations = 10000000;

function testForEach() {
    let sum = 0;
    arr.forEach(val => {
        sum += val;
    });
    return sum;
}

function testForLoop() {
    let sum = 0;
    const len = arr.length;
    for (let i = 0; i < len; i++) {
        sum += arr[i];
    }
    return sum;
}

// Warmup
for (let i = 0; i < 10000; i++) {
    testForEach();
    testForLoop();
}

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
const improvement = ((t1 - t0) - (t3 - t2)) / (t1 - t0) * 100;
console.log(`Improvement: ${improvement.toFixed(2)}%`);
