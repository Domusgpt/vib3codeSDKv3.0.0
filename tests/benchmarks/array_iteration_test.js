const iterations = 1000000;
const arr = [1, 2, 3, 4, 5];

let sum = 0;

console.time('forEach');
for (let i = 0; i < iterations; i++) {
    arr.forEach(val => {
        sum += val;
    });
}
console.timeEnd('forEach');

sum = 0;
console.time('for loop');
for (let i = 0; i < iterations; i++) {
    for (let j = 0; j < arr.length; j++) {
        sum += arr[j];
    }
}
console.timeEnd('for loop');
