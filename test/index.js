const { Multichainer, Smartcontract } = require('../src/index.js');
const MC_Smartcontract = require('../src/smartcontract.js');

const blockchain = 'ethereum';
const network = 'privatenet';
const sidechain = 'loom';

const mc = new Multichainer(blockchain, network, sidechain);
const smartcontract = new Smartcontract(blockchain, network, sidechain);

console.log("MC "+mc.version);
