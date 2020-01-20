// Assume that Loom-js is imported globally
let { Utils:  LoomUtils } = require('./loom/index.js');

let CryptoUtils = function() {};

CryptoUtils.loom = LoomUtils;

module.exports = CryptoUtils;