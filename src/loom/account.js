const { readFileSync } = require('fs');
const loom = require('loom-js');

var Account = function(address, privateKey, publicKey) {
    this.address = address;
    this.privateKey = privateKey;
    this.publicKey = publicKey;

    return this;
};

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

module.exports = Account;
