const Utils = require('./cryptoutils.js');
const { readFileSync } = require('fs');
let Web3 = require('web3');
var web3 = new Web3(Web3.givenProvider); // your geth
const ethUtil = require('ethereumjs-util');

var Account = function(address, privateKey, publicKey) {
    this.address = address;
    this.privateKey = privateKey;
    this.publicKey = publicKey;

    return this;
};

Account.prototype.sign = function(message) {
    var buff = ethUtil.toBuffer(message);
    var privateKey = new Buffer.from(this.privateKey.substr(2), "hex")

    var sig = ethUtil.ecsign(buff, privateKey);

    return sig;
}

/**
 * Creates an account of a given type from a privatekey
 *
 */
Account.fromPrivateKeyFile = function(keyPath) {
    var keyString = undefined;

    try {
        // TODO turn into async
        keyString = readFileSync(keyPath, 'utf-8').toString().trim();
    }
    catch (e) {
        throw (e);
    }
    var privateKey = loom.CryptoUtils.B64ToUint8Array(keyString);

    const publicKey = loom.CryptoUtils.publicKeyFromPrivateKey(privateKey);

    const address = loom.LocalAddress.fromPublicKey(publicKey);
    return Account(address, privateKey, publicKey);
};


/**
 * Creates an account of a given type from a privatekey
 *
 */
Account.getRandom = function() {
    let ethAccount = web3.eth.accounts.create();

    let account = new Account(ethAccount.address, ethAccount.privateKey, ethAccount.publicKey);

    account.localObject = ethAccount;

    return account;
};


module.exports = Account;
