import Node4D from '../../src/scene/Node4D.js';
import Scene4D from '../../src/scene/Scene4D.js';
import Vec4 from '../../src/math/Vec4.js';

const scene = new Scene4D('TestScene');
for (let i = 0; i < 1000; i++) {
    const node = new Node4D('Node' + i);
    node.setWorldPosition(new Vec4(Math.random(), Math.random(), Math.random(), Math.random()));
    scene.add(node);
}
scene.update(0.016);

function testOriginal() {
    const start = performance.now();
    let hits = 0;
    const origin = new Vec4(0, 0, 0, 0);
    const direction = new Vec4(1, 1, 1, 1);
    const maxDistance = 10;
    for (let i = 0; i < 100; i++) {
        const h = scene.raycast(origin, direction, maxDistance);
        hits += h.length;
    }
    const end = performance.now();
    return end - start;
}

function testOptimized() {
    const start = performance.now();
    let hits = 0;
    const origin = new Vec4(0, 0, 0, 0);
    const direction = new Vec4(1, 1, 1, 1);
    const maxDistance = 10;

    // Inline Scene4D.raycast locally
    const preallocNodePos = new Vec4();
    const preallocToNode = new Vec4();
    const preallocScaledDir = new Vec4();
    const preallocClosest = new Vec4();
    const preallocClosestToNode = new Vec4();

    for (let i = 0; i < 100; i++) {
        const localHits = [];
        const dir = direction.normalize();

        scene.root.traverse(node => {
            if (node === scene.root) return;

            // Simplified: treat each node as a point
            const m = node.worldMatrix.data;
            preallocNodePos.set(m[12], m[13], m[14], m[15]);

            preallocNodePos.sub(origin, preallocToNode);
            const dist = preallocToNode.dot(dir);

            if (dist > 0 && dist < maxDistance) {
                // Check perpendicular distance
                dir.scale(dist, preallocScaledDir);
                origin.add(preallocScaledDir, preallocClosest);

                // perpDist < 0.5 is perpDistSq < 0.25
                const perpDistSq = preallocNodePos.distanceToSquared(preallocClosest);
                if (perpDistSq < 0.25) {
                    localHits.push({ node, distance: dist });
                }
            }
        });
        localHits.sort((a, b) => a.distance - b.distance);
        hits += localHits.length;
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
