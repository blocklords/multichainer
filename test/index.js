const MC = require('../src/index.js');

const mc = new MC('ethereum', 'privatenet', 'loom');

console.log("MC version: "+mc.version);
