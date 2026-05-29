const iterations = 100000;
const visualizers = [1, 2, 3, 4, 5]; // Simulate small array typical of visualizers

console.time('forEach');
for (let i = 0; i < iterations; i++) {
    let sum = 0;
    visualizers.forEach(v => {
        sum += v;
    });
}
console.timeEnd('forEach');

console.time('for loop');
for (let i = 0; i < iterations; i++) {
    let sum = 0;
    for (let j = 0, len = visualizers.length; j < len; j++) {
        sum += visualizers[j];
    }
}
console.timeEnd('for loop');
