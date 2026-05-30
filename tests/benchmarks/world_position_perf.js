import Node4D from '../../src/scene/Node4D.js';
import Scene4D from '../../src/scene/Scene4D.js';
import Vec4 from '../../src/math/Vec4.js';

const scene = new Scene4D('TestScene');
for (let i = 0; i < 1000; i++) {
    const node = new Node4D('Node' + i);
    node.setWorldPosition(new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));
    scene.add(node);
}
// Force world matrices to be computed
scene.update(0.016);

function testOriginal() {
    const start = performance.now();
    let count = 0;
    const center = new Vec4(0.5, 0.5, 0.5, 0.5);
    const radiusSq = 0.5 * 0.5;
    for (let i = 0; i < 1000; i++) {
        scene.root.traverse(node => {
            if (node === scene.root) return;
            const dist = node.worldPosition.sub(center).lengthSquared();
            if (dist <= radiusSq) {
                count++;
            }
        });
    }
    const end = performance.now();
    return end - start;
}

function testOptimized() {
    const start = performance.now();
    let count = 0;
    const center = new Vec4(0.5, 0.5, 0.5, 0.5);
    const radiusSq = 0.5 * 0.5;
    for (let i = 0; i < 1000; i++) {
        scene.root.traverse(node => {
            if (node === scene.root) return;
            const d = node.worldMatrix.data;
            const dx = d[12] - center._x;
            const dy = d[13] - center._y;
            const dz = d[14] - center._z;
            const dw = d[15] - center._w;
            const dist = dx*dx + dy*dy + dz*dz + dw*dw;
            if (dist <= radiusSq) {
                count++;
            }
        });
    }
    const end = performance.now();
    return end - start;
}

// Warmup
testOriginal();
testOptimized();

const origTime = testOriginal();
const optTime = testOptimized();

console.log(`Original: ${origTime.toFixed(2)}ms`);
console.log(`Optimized: ${optTime.toFixed(2)}ms`);
console.log(`Speedup: ${(origTime / optTime).toFixed(2)}x`);
