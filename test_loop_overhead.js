console.time('forEach');
const obj = {a: 1, b: 2, c: 3, d: 4, e: 5};
for (let i = 0; i < 1000000; i++) {
    Object.keys(obj).forEach(key => {
        const val = obj[key];
    });
}
console.timeEnd('forEach');

console.time('forIn');
for (let i = 0; i < 1000000; i++) {
    for (const key in obj) {
        const val = obj[key];
    }
}
console.timeEnd('forIn');
