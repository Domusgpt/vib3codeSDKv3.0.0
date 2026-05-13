console.time('Object.keys + for loop');
const obj = {a: 1, b: 2, c: 3, d: 4, e: 5};
for (let i = 0; i < 1000000; i++) {
    const keys = Object.keys(obj);
    for (let j = 0; j < keys.length; j++) {
        const val = obj[keys[j]];
    }
}
console.timeEnd('Object.keys + for loop');
