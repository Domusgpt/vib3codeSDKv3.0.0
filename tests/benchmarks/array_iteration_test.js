const ITERATIONS = 1000000;

function runBenchmark() {
    const arr = [
        { render: () => {}, updateParameters: () => {} },
        { render: () => {}, updateParameters: () => {} },
        { render: () => {}, updateParameters: () => {} },
        { render: () => {}, updateParameters: () => {} },
        { render: () => {}, updateParameters: () => {} }
    ];

    console.log(`Running benchmark with ${ITERATIONS} iterations on array size ${arr.length}...`);

    let start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        arr.forEach(item => {
            if (item.updateParameters && item.render) {
                item.updateParameters();
                item.render();
            }
        });
    }
    let end = performance.now();
    console.log(`Array.prototype.forEach: ${(end - start).toFixed(2)}ms`);

    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        for (let j = 0, len = arr.length; j < len; j++) {
            const item = arr[j];
            if (item.updateParameters && item.render) {
                item.updateParameters();
                item.render();
            }
        }
    }
    end = performance.now();
    console.log(`Standard for loop (cached len): ${(end - start).toFixed(2)}ms`);
}

runBenchmark();
