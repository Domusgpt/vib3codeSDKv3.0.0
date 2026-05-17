const ITERATIONS = 1_000_000;
const visualizers = [1, 2, 3, 4, 5];

function testForEach() {
    let sum = 0;
    for (let j = 0; j < ITERATIONS; j++) {
        visualizers.forEach(v => {
            sum += v;
        });
    }
    return sum;
}

function testForLoop() {
    let sum = 0;
    for (let j = 0; j < ITERATIONS; j++) {
        for (let i = 0; i < visualizers.length; i++) {
            sum += visualizers[i];
        }
    }
    return sum;
}

const start1 = performance.now();
testForEach();
const end1 = performance.now();
console.log(`forEach: ${end1 - start1}ms`);

const start2 = performance.now();
testForLoop();
const end2 = performance.now();
console.log(`for loop: ${end2 - start2}ms`);
