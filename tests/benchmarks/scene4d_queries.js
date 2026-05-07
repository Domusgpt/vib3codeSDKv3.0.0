import Scene4D from '../../src/scene/Scene4D.js';
import Node4D from '../../src/scene/Node4D.js';
import Vec4 from '../../src/math/Vec4.js';

const scene = new Scene4D('TestScene');
for (let i = 0; i < 5000; i++) {
    const node = new Node4D(`node_${i}`);
    node.setPosition(Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100);
    scene.add(node);
}

scene.update(0);

const center = new Vec4(50, 50, 50, 50);

console.time('findNodesInSphere (sub.lengthSquared)');
for (let i = 0; i < 5000; i++) {
    scene.findNodesInSphere(center, 20);
}
console.timeEnd('findNodesInSphere (sub.lengthSquared)');

console.time('findNearestNode (sub.lengthSquared)');
for (let i = 0; i < 5000; i++) {
    scene.findNearestNode(center);
}
console.timeEnd('findNearestNode (sub.lengthSquared)');

// Test optimized version
const optimizedScene = new Scene4D('OptimizedTestScene');
for (const child of scene.root.children) {
    optimizedScene.add(child.cloneDeep());
}
optimizedScene.update(0);

optimizedScene.findNodesInSphereOpt = function(center, radius) {
    const results = [];
    const radiusSq = radius * radius;
    // Cache center coordinates for fast inline access
    const cx = center._x, cy = center._y, cz = center._z, cw = center._w;

    this.root.traverse(node => {
        if (node === this.root) return;

        // Extract world translation from matrix directly to avoid Vec4 allocation
        const wm = node.worldMatrix.data;
        const dx = wm[12] - cx;
        const dy = wm[13] - cy;
        const dz = wm[14] - cz;
        const dw = wm[15] - cw;

        const distSq = dx*dx + dy*dy + dz*dz + dw*dw;
        if (distSq <= radiusSq) {
            results.push(node);
        }
    });

    return results;
};

optimizedScene.findNearestNodeOpt = function(point, maxDistance = Infinity) {
    let nearest = null;
    let nearestDistSq = maxDistance * maxDistance;
    const px = point._x, py = point._y, pz = point._z, pw = point._w;

    this.root.traverse(node => {
        if (node === this.root) return;

        // Extract world translation from matrix directly to avoid Vec4 allocation
        const wm = node.worldMatrix.data;
        const dx = wm[12] - px;
        const dy = wm[13] - py;
        const dz = wm[14] - pz;
        const dw = wm[15] - pw;

        const distSq = dx*dx + dy*dy + dz*dz + dw*dw;
        if (distSq < nearestDistSq) {
            nearestDistSq = distSq;
            nearest = node;
        }
    });

    return nearest;
};

optimizedScene.findNodesInBoxOpt = function(min, max) {
    const results = [];
    const minX = min._x, minY = min._y, minZ = min._z, minW = min._w;
    const maxX = max._x, maxY = max._y, maxZ = max._z, maxW = max._w;

    this.root.traverse(node => {
        if (node === this.root) return;
        const wm = node.worldMatrix.data;
        const px = wm[12], py = wm[13], pz = wm[14], pw = wm[15];

        if (px >= minX && px <= maxX &&
            py >= minY && py <= maxY &&
            pz >= minZ && pz <= maxZ &&
            pw >= minW && pw <= maxW) {
            results.push(node);
        }
    });

    return results;
};

console.time('findNodesInSphereOpt (inline extraction)');
for (let i = 0; i < 5000; i++) {
    optimizedScene.findNodesInSphereOpt(center, 20);
}
console.timeEnd('findNodesInSphereOpt (inline extraction)');

console.time('findNearestNodeOpt (inline extraction)');
for (let i = 0; i < 5000; i++) {
    optimizedScene.findNearestNodeOpt(center);
}
console.timeEnd('findNearestNodeOpt (inline extraction)');
