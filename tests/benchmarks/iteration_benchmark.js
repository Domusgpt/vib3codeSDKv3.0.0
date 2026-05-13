const visualizers = [
  { updateParameters: () => {}, render: () => {} },
  { updateParameters: () => {}, render: () => {} },
  { updateParameters: () => {}, render: () => {} },
  { updateParameters: () => {}, render: () => {} },
  { updateParameters: () => {}, render: () => {} }
];

const currentParams = {};

console.time('forEach');
for(let i = 0; i < 1000000; i++) {
  visualizers.forEach(visualizer => {
      if (visualizer.updateParameters && visualizer.render) {
          visualizer.updateParameters(currentParams);
          visualizer.render();
      }
  });
}
console.timeEnd('forEach');

console.time('forLoop');
for(let i = 0; i < 1000000; i++) {
  for(let j = 0; j < visualizers.length; j++) {
      const visualizer = visualizers[j];
      if (visualizer.updateParameters && visualizer.render) {
          visualizer.updateParameters(currentParams);
          visualizer.render();
      }
  }
}
console.timeEnd('forLoop');

console.time('forOf');
for(let i = 0; i < 1000000; i++) {
  for(const visualizer of visualizers) {
      if (visualizer.updateParameters && visualizer.render) {
          visualizer.updateParameters(currentParams);
          visualizer.render();
      }
  }
}
console.timeEnd('forOf');
