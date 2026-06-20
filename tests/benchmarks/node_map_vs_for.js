import { performance } from 'perf_hooks';
import Node4D from '../../src/scene/Node4D.js';
import Scene4D from '../../src/scene/Scene4D.js';

const scene = new Scene4D();
for (let i = 0; i < 50; i++) {
    scene.root.addChild(new Node4D());
}

function benchmarkMap() {
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
        scene.root.children.map(c => c.toJSON());
    }
    return performance.now() - start;
}

function benchmarkFor() {
    const start = performance.now();
    for (let j = 0; j < 10000; j++) {
        const len = scene.root.children.length;
        const arr = new Array(len);
        for (let i = 0; i < len; i++) {
            arr[i] = scene.root.children[i].toJSON();
        }
    }
    return performance.now() - start;
}

console.log("Warming up...");
benchmarkMap();
benchmarkFor();

console.log("Node4D toJSON Map:", benchmarkMap().toFixed(2), "ms");
console.log("Node4D toJSON For Loop:", benchmarkFor().toFixed(2), "ms");
