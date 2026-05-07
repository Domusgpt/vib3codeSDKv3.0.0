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

const origin = new Vec4(50, 50, 50, 50);
const direction = new Vec4(1, 0, 0, 0);

console.time('raycast (original)');
for (let i = 0; i < 1000; i++) {
    scene.raycast(origin, direction, 100);
}
console.timeEnd('raycast (original)');

// Test optimized version
const optimizedScene = new Scene4D('OptimizedTestScene');
for (const child of scene.root.children) {
    optimizedScene.add(child.cloneDeep());
}
optimizedScene.update(0);

optimizedScene.raycastOpt = function(origin, direction, maxDistance = 1000) {
    const hits = [];
    const dir = direction.normalize();

    const ox = origin._x, oy = origin._y, oz = origin._z, ow = origin._w;
    const dx = dir._x, dy = dir._y, dz = dir._z, dw = dir._w;

    this.root.traverse(node => {
        if (node === this.root) return;

        // Extract world pos
        const wm = node.worldMatrix.data;
        const nx = wm[12], ny = wm[13], nz = wm[14], nw = wm[15];

        // toNode = node.pos - origin
        const tnx = nx - ox;
        const tny = ny - oy;
        const tnz = nz - oz;
        const tnw = nw - ow;

        // dist = toNode.dot(dir)
        const dist = tnx*dx + tny*dy + tnz*dz + tnw*dw;

        if (dist > 0 && dist < maxDistance) {
            // closest = origin + dir * dist
            const cx = ox + dx * dist;
            const cy = oy + dy * dist;
            const cz = oz + dz * dist;
            const cw = ow + dw * dist;

            // perpDistSq = lengthSquared(node.pos - closest)
            const pdx = nx - cx;
            const pdy = ny - cy;
            const pdz = nz - cz;
            const pdw = nw - cw;
            const perpDistSq = pdx*pdx + pdy*pdy + pdz*pdz + pdw*pdw;

            if (perpDistSq < 0.25) { // 0.5^2
                hits.push({ node, distance: dist });
            }
        }
    });

    hits.sort((a, b) => a.distance - b.distance);
    return hits;
};

console.time('raycastOpt (inline)');
for (let i = 0; i < 1000; i++) {
    optimizedScene.raycastOpt(origin, direction, 100);
}
console.timeEnd('raycastOpt (inline)');
