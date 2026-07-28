const { performance } = require('perf_hooks');
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
    distanceToSquared(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        const dw = this.w - v.w;
        return dx*dx + dy*dy + dz*dz + dw*dw;
    }
}
const nodes = Array.from({length: 1000}, () => ({
    get worldPosition() { return new Vec4(Math.random(), Math.random(), Math.random(), Math.random()); }
}));
const center = new Vec4(0.5, 0.5, 0.5, 0.5);

function testSubLenSq() {
    let sum = 0;
    for (let i = 0; i < nodes.length; i++) {
        sum += nodes[i].worldPosition.sub(center).lengthSquared();
    }
    return sum;
}

function testDistSq() {
    let sum = 0;
    for (let i = 0; i < nodes.length; i++) {
        sum += nodes[i].worldPosition.distanceToSquared(center);
    }
    return sum;
}

for (let i = 0; i < 100; i++) {
    testSubLenSq();
    testDistSq();
}

const iters = 10000;
const t0 = performance.now();
for (let i = 0; i < iters; i++) testSubLenSq();
const t1 = performance.now();

const t2 = performance.now();
for (let i = 0; i < iters; i++) testDistSq();
const t3 = performance.now();

console.log(`sub.lenSq: ${(t1 - t0).toFixed(2)}ms`);
console.log(`distSq: ${(t3 - t2).toFixed(2)}ms`);
console.log(`Improvement: ${(((t1 - t0) - (t3 - t2)) / (t1 - t0) * 100).toFixed(2)}%`);
