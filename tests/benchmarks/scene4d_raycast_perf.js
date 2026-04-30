import { Scene4D } from '../../src/scene/Scene4D.js';
import { Node4D } from '../../src/scene/Node4D.js';
import { Vec4 } from '../../src/math/Vec4.js';

const scene = new Scene4D();
// Create a complex scene graph
for (let i = 0; i < 50; i++) {
    const parent = new Node4D();
    parent.localPosition = new Vec4(Math.random() * 10, Math.random() * 10, Math.random() * 10, Math.random() * 10);
    scene.add(parent);

    for (let j = 0; j < 20; j++) {
        const child = new Node4D();
        child.localPosition = new Vec4(Math.random() * 2, Math.random() * 2, Math.random() * 2, Math.random() * 2);
        parent.addChild(child);

        for (let k = 0; k < 10; k++) {
            const grandchild = new Node4D();
            grandchild.localPosition = new Vec4(Math.random(), Math.random(), Math.random(), Math.random());
            child.addChild(grandchild);
        }
    }
}
scene.update(0.016); // force world matrix updates

console.log(`Scene has ${scene.nodeCount} nodes`);

const center = new Vec4(5, 5, 5, 5);
const radius = 5;
const rayOrigin = new Vec4(0, 0, -10, 0);
const rayDirection = new Vec4(0, 0, 1, 0);

const iterations = 50000;

// Recreate the old, unoptimized behavior for testing
Scene4D.prototype.findNodesInSphereOriginal = function(center, radius) {
    const results = [];
    const radiusSq = radius * radius;

    this.root.traverse(node => {
        if (node === this.root) return;
        const dist = node.worldPosition.sub(center).lengthSquared();
        if (dist <= radiusSq) {
            results.push(node);
        }
    });

    return results;
};

const start1 = performance.now();
for (let i = 0; i < iterations; i++) {
    scene.findNodesInSphereOriginal(center, radius);
}
const end1 = performance.now();
console.log(`Original findNodesInSphere ${iterations}x: ${(end1 - start1).toFixed(2)} ms`);


const start2 = performance.now();
for (let i = 0; i < iterations; i++) {
    scene.findNodesInSphere(center, radius); // This is now the optimized version
}
const end2 = performance.now();
console.log(`Optimized findNodesInSphere ${iterations}x: ${(end2 - start2).toFixed(2)} ms`);


// Recreate the old, unoptimized behavior for findNearestNode
Scene4D.prototype.findNearestNodeOriginal = function(point, maxDistance = Infinity) {
    let nearest = null;
    let nearestDistSq = maxDistance * maxDistance;

    this.root.traverse(node => {
        if (node === this.root) return;
        const distSq = node.worldPosition.sub(point).lengthSquared();
        if (distSq < nearestDistSq) {
            nearestDistSq = distSq;
            nearest = node;
        }
    });

    return nearest;
};

const start3 = performance.now();
for (let i = 0; i < iterations; i++) {
    scene.findNearestNodeOriginal(center, radius);
}
const end3 = performance.now();
console.log(`Original findNearestNode ${iterations}x: ${(end3 - start3).toFixed(2)} ms`);

const start4 = performance.now();
for (let i = 0; i < iterations; i++) {
    scene.findNearestNode(center, radius);
}
const end4 = performance.now();
console.log(`Optimized findNearestNode ${iterations}x: ${(end4 - start4).toFixed(2)} ms`);

// Recreate the old, unoptimized behavior for raycast
Scene4D.prototype.raycastOriginal = function(origin, direction, maxDistance = 1000) {
    const hits = [];
    const dir = direction.normalize();

    this.root.traverse(node => {
        if (node === this.root) return;

        const toNode = node.worldPosition.sub(origin);
        const dist = toNode.dot(dir);

        if (dist > 0 && dist < maxDistance) {
            const closest = origin.add(dir.scale(dist));
            const perpDist = node.worldPosition.sub(closest).length();

            if (perpDist < 0.5) {
                hits.push({ node, distance: dist });
            }
        }
    });

    hits.sort((a, b) => a.distance - b.distance);
    return hits;
};

const raycastIterations = 10000;
const start5 = performance.now();
for (let i = 0; i < raycastIterations; i++) {
    scene.raycastOriginal(rayOrigin, rayDirection);
}
const end5 = performance.now();
console.log(`Original raycast ${raycastIterations}x: ${(end5 - start5).toFixed(2)} ms`);

const start6 = performance.now();
for (let i = 0; i < raycastIterations; i++) {
    scene.raycast(rayOrigin, rayDirection);
}
const end6 = performance.now();
console.log(`Optimized raycast ${raycastIterations}x: ${(end6 - start6).toFixed(2)} ms`);
