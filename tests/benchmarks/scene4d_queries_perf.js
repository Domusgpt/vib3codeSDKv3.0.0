import Scene4D from '../../src/scene/Scene4D.js';
import Node4D from '../../src/scene/Node4D.js';
import Vec4 from '../../src/math/Vec4.js';

// Setup scene
const scene = new Scene4D('TestScene');
for (let i = 0; i < 5000; i++) {
    const node = new Node4D(`node_${i}`);
    node.setPosition(Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100);
    scene.add(node);
}
scene.update(0);

const center = new Vec4(50, 50, 50, 50);
const dir = new Vec4(1, 0, 0, 0);
const min = new Vec4(40, 40, 40, 40);
const max = new Vec4(60, 60, 60, 60);

const iterations = 2000;

console.log(`Running benchmarks for ${iterations} iterations with 5000 nodes...`);
console.log('---');

console.time('findNodesInSphere (Optimized)');
for (let i = 0; i < iterations; i++) {
    scene.findNodesInSphere(center, 20);
}
console.timeEnd('findNodesInSphere (Optimized)');

console.time('findNodesInBox (Optimized)');
for (let i = 0; i < iterations; i++) {
    scene.findNodesInBox(min, max);
}
console.timeEnd('findNodesInBox (Optimized)');

console.time('findNearestNode (Optimized)');
for (let i = 0; i < iterations; i++) {
    scene.findNearestNode(center);
}
console.timeEnd('findNearestNode (Optimized)');

console.time('raycast (Optimized)');
for (let i = 0; i < iterations; i++) {
    scene.raycast(center, dir, 100);
}
console.timeEnd('raycast (Optimized)');

console.time('getVisibleNodesSortedByW (Optimized)');
for (let i = 0; i < iterations; i++) {
    scene.getVisibleNodesSortedByW();
}
console.timeEnd('getVisibleNodesSortedByW (Optimized)');
