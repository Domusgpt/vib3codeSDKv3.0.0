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

console.time('sort (original)');
for (let i = 0; i < 100; i++) {
    scene.getVisibleNodesSortedByW();
}
console.timeEnd('sort (original)');

const optimizedScene = new Scene4D('OptimizedTestScene');
for (const child of scene.root.children) {
    optimizedScene.add(child.cloneDeep());
}
optimizedScene.update(0);

optimizedScene.getVisibleNodesSortedByWOpt = function() {
    const nodes = [];
    this.traverseVisible(node => {
        if (node !== this.root) {
            nodes.push(node);
        }
    });

    // Sort by world W coordinate (far to near for proper transparency)
    // Avoid allocating Vec4 just to read W
    nodes.sort((a, b) => a.worldMatrix.data[15] - b.worldMatrix.data[15]);
    return nodes;
};

console.time('sortOpt (inline)');
for (let i = 0; i < 100; i++) {
    optimizedScene.getVisibleNodesSortedByWOpt();
}
console.timeEnd('sortOpt (inline)');
