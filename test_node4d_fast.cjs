const { performance } = require('perf_hooks');
const Vec4 = class {
    constructor(x=0,y=0,z=0,w=0) {
        this.x = x; this.y = y; this.z = z; this.w = w;
    }
}
const nodes = Array.from({length: 1000}, () => {
    const wm = [1,0,0,Math.random(), 0,1,0,Math.random(), 0,0,1,Math.random(), 0,0,0,Math.random()];
    return {
        get worldPosition() { return new Vec4(wm[3], wm[7], wm[11], wm[15]); },
        get worldMatrix() { return { get: (r, c) => wm[r*4 + c] }; },
        wm: wm
    };
});
const center = new Vec4(0.5, 0.5, 0.5, 0.5);

function testProp() {
    let sum = 0;
    for (let i = 0; i < nodes.length; i++) {
        const wp = nodes[i].worldPosition;
        const dx = wp.x - center.x;
        const dy = wp.y - center.y;
        const dz = wp.z - center.z;
        const dw = wp.w - center.w;
        sum += dx*dx + dy*dy + dz*dz + dw*dw;
    }
    return sum;
}

function testArray() {
    let sum = 0;
    for (let i = 0; i < nodes.length; i++) {
        const wm = nodes[i].wm;
        const dx = wm[3] - center.x;
        const dy = wm[7] - center.y;
        const dz = wm[11] - center.z;
        const dw = wm[15] - center.w;
        sum += dx*dx + dy*dy + dz*dz + dw*dw;
    }
    return sum;
}

function testMatrixGet() {
    let sum = 0;
    for (let i = 0; i < nodes.length; i++) {
        const wm = nodes[i].worldMatrix;
        const dx = wm.get(0, 3) - center.x;
        const dy = wm.get(1, 3) - center.y;
        const dz = wm.get(2, 3) - center.z;
        const dw = wm.get(3, 3) - center.w;
        sum += dx*dx + dy*dy + dz*dz + dw*dw;
    }
    return sum;
}


for (let i = 0; i < 100; i++) {
    testProp();
    testArray();
    testMatrixGet();
}

const iters = 10000;
const t0 = performance.now();
for (let i = 0; i < iters; i++) testProp();
const t1 = performance.now();

const t2 = performance.now();
for (let i = 0; i < iters; i++) testArray();
const t3 = performance.now();

const t4 = performance.now();
for (let i = 0; i < iters; i++) testMatrixGet();
const t5 = performance.now();

console.log(`new Vec4 prop: ${(t1 - t0).toFixed(2)}ms`);
console.log(`direct array access: ${(t3 - t2).toFixed(2)}ms`);
console.log(`matrix get access: ${(t5 - t4).toFixed(2)}ms`);
console.log(`Improvement (Matrix Get over Vec4): ${(((t1 - t0) - (t5 - t4)) / (t1 - t0) * 100).toFixed(2)}%`);
