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

const min = new Vec4(40, 40, 40, 40);
const max = new Vec4(60, 60, 60, 60);

console.time('findNodesInBox (original)');
for (let i = 0; i < 5000; i++) {
    scene.findNodesInBox(min, max);
}
console.timeEnd('findNodesInBox (original)');

const optimizedScene = new Scene4D('OptimizedTestScene');
for (const child of scene.root.children) {
    optimizedScene.add(child.cloneDeep());
}
optimizedScene.update(0);

optimizedScene.findNodesInBoxOpt2 = function(min, max) {
    const results = [];
    const minX = min._x, minY = min._y, minZ = min._z, minW = min._w;
    const maxX = max._x, maxY = max._y, maxZ = max._z, maxW = max._w;

    this.root.traverse(node => {
        if (node === this.root) return;

        const wm = node.worldMatrix.data;
        const px = wm[12];
        if (px >= minX && px <= maxX) {
            const py = wm[13];
            if (py >= minY && py <= maxY) {
                const pz = wm[14];
                if (pz >= minZ && pz <= maxZ) {
                    const pw = wm[15];
                    if (pw >= minW && pw <= maxW) {
                        results.push(node);
                    }
                }
            }
        }
    });

    return results;
};

console.time('findNodesInBoxOpt2 (inline)');
for (let i = 0; i < 5000; i++) {
    optimizedScene.findNodesInBoxOpt2(min, max);
}
console.timeEnd('findNodesInBoxOpt2 (inline)');
