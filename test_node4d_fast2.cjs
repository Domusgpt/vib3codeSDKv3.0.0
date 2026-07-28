const { performance } = require('perf_hooks');

const nodes = Array.from({length: 1000}, () => {
    const wm = [1,0,0,Math.random(), 0,1,0,Math.random(), 0,0,1,Math.random(), 0,0,0,Math.random()];
    return {
        get worldMatrix() { return { get: (r, c) => wm[r*4 + c] }; }
    };
});
const center = {x: 0.5, y: 0.5, z: 0.5, w: 0.5};

function testMatrixGetDirect() {
    let sum = 0;
    const radiusSq = 0.5 * 0.5;
    let count = 0;
    for (let i = 0; i < nodes.length; i++) {
        const wm = nodes[i].worldMatrix;
        const dx = wm.get(0, 3) - center.x;
        const dy = wm.get(1, 3) - center.y;
        const dz = wm.get(2, 3) - center.z;
        const dw = wm.get(3, 3) - center.w;
        const dist = dx*dx + dy*dy + dz*dz + dw*dw;
        if (dist <= radiusSq) {
            count++;
        }
    }
    return count;
}

const Vec4 = class {
    constructor(x=0,y=0,z=0,w=0) {
        this.x = x; this.y = y; this.z = z; this.w = w;
    }
    sub(v) {
        return new Vec4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
    }
    lengthSquared() {
        return this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w;
    }
}
const nodes2 = nodes.map(n => ({
    get worldPosition() {
        const wm = n.worldMatrix;
        return new Vec4(wm.get(0, 3), wm.get(1, 3), wm.get(2, 3), wm.get(3, 3));
    }
}));


function testOldWorldPosition() {
    let count = 0;
    const radiusSq = 0.5 * 0.5;
    for (let i = 0; i < nodes2.length; i++) {
        const dist = nodes2[i].worldPosition.sub(center).lengthSquared();
        if (dist <= radiusSq) {
            count++;
        }
    }
    return count;
}


for (let i = 0; i < 100; i++) {
    testMatrixGetDirect();
    testOldWorldPosition();
}

const iters = 10000;

const t0 = performance.now();
for (let i = 0; i < iters; i++) testOldWorldPosition();
const t1 = performance.now();

const t2 = performance.now();
for (let i = 0; i < iters; i++) testMatrixGetDirect();
const t3 = performance.now();

console.log(`Old worldPosition (allocates 2 Vec4s per node): ${(t1 - t0).toFixed(2)}ms`);
console.log(`New direct matrix get (zero allocation): ${(t3 - t2).toFixed(2)}ms`);
console.log(`Improvement: ${(((t1 - t0) - (t3 - t2)) / (t1 - t0) * 100).toFixed(2)}%`);
