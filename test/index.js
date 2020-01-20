const path = require('path')
const { Multichainer, Smartcontract, Account } = require('../src/index.js');
const MC_Smartcontract = require('../src/smartcontract.js');


// Default parameters to test
const blockchain = 'ethereum';
const network = 'privatenet';
const sidechain = 'loom';
const gameOwner = path.join(__dirname, '../private/extdev_private_key');

// Sidechain parameters
const chainId = 'extdev-plasma-us1'
const writeUrl = 'http://extdev-plasma-us1.dappchains.com:80/rpc'
const readUrl = 'http://extdev-plasma-us1.dappchains.com:80/query'

const mc = new Multichainer(blockchain, network, sidechain);
const smartcontract = new Smartcontract(blockchain, network, sidechain);

// console.log("MC "+mc.version);

// Account loading
const account = Account.fromPrivateKeyFile(gameOwner, Account.TYPE.LOOM);

console.log(account.address);
