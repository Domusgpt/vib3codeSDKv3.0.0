console.time('Object.keys.forEach');
const obj = {a: 1, b: 2, c: 3, d: 4, e: 5};
for(let i=0; i<1000000; i++) {
  Object.keys(obj).forEach(k => {
    let x = obj[k];
  });
}
console.timeEnd('Object.keys.forEach');

console.time('for...in');
for(let i=0; i<1000000; i++) {
  for(let k in obj) {
    let x = obj[k];
  }
}
console.timeEnd('for...in');

console.time('Object.keys + for');
for(let i=0; i<1000000; i++) {
  const keys = Object.keys(obj);
  for(let j=0; j<keys.length; j++) {
    let x = obj[keys[j]];
  }
}
console.timeEnd('Object.keys + for');
