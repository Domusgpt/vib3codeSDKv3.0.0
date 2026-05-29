const iterations = 100000;
const obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };

console.time('Object.keys.forEach');
for (let i = 0; i < iterations; i++) {
    let sum = 0;
    Object.keys(obj).forEach(k => {
        sum += obj[k];
    });
}
console.timeEnd('Object.keys.forEach');

console.time('for...in');
for (let i = 0; i < iterations; i++) {
    let sum = 0;
    for (const k in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
            sum += obj[k];
        }
    }
}
console.timeEnd('for...in');
