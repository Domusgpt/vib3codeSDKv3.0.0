import { performance } from 'perf_hooks';

class NodeMock {
    constructor() {
        this.children = Array.from({ length: 100 }, () => ({
            toJSON: () => ({ foo: 'bar' })
        }));
    }
}

const node = new NodeMock();

function benchmarkOriginal() {
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
        node.children.map(c => c.toJSON());
    }
    return performance.now() - start;
}

function benchmarkOptimized() {
    const start = performance.now();
    for (let j = 0; j < 10000; j++) {
        const len = node.children.length;
        const result = new Array(len);
        for (let i = 0; i < len; i++) {
            result[i] = node.children[i].toJSON();
        }
    }
    return performance.now() - start;
}

console.log("Warming up...");
benchmarkOriginal();
benchmarkOptimized();

console.log("Original (.map):", benchmarkOriginal().toFixed(2), "ms");
console.log("Optimized (for loop):", benchmarkOptimized().toFixed(2), "ms");
