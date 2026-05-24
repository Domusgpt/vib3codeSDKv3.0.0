import { performance } from 'perf_hooks';

const params = {
    a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10
};

function testObjectKeysForEach() {
    for (let i = 0; i < 100000; i++) {
        Object.keys(params).forEach(k => {
            const v = params[k];
        });
    }
}

function testForIn() {
    for (let i = 0; i < 100000; i++) {
        for (const k in params) {
            if (Object.prototype.hasOwnProperty.call(params, k)) {
                const v = params[k];
            }
        }
    }
}

function testObjectKeysForLoop() {
    for (let i = 0; i < 100000; i++) {
        const keys = Object.keys(params);
        for (let j = 0, len = keys.length; j < len; j++) {
            const k = keys[j];
            const v = params[k];
        }
    }
}

const t4 = performance.now();
testObjectKeysForEach();
const t5 = performance.now();
console.log(`Object.keys().forEach: ${t5 - t4} ms`);

const t6 = performance.now();
testForIn();
const t7 = performance.now();
console.log(`for...in loop: ${t7 - t6} ms`);

const t8 = performance.now();
testObjectKeysForLoop();
const t9 = performance.now();
console.log(`Object.keys() with for loop: ${t9 - t8} ms`);
