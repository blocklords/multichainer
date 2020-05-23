const Utils = require('./cryptoutils.js');
const { readFileSync } = require('fs');
let Web3 = require('web3');
var web3 = new Web3(Web3.givenProvider); // your geth
const ethUtil = require('ethereumjs-util');
let ethers = require('ethers');

let Account = function(address, privateKey, publicKey) {
    this.address = address;
    this.privateKey = privateKey;
    this.publicKey = publicKey;

    return this;
};

Account.prototype.sign = function(message) {
    // if (this.accountType === 'LOOM') {
        var buff = ethUtil.toBuffer(message);

        let unprefixed = this.privateKey;
        if (this.privateKey.substr(0, 2) == "0x") {
            unprefixed = this.privateKey.substr(2);
        }

        var privateKey = new Buffer.from(unprefixed, "hex")

        var sig = ethUtil.ecsign(buff, privateKey);

        return sig;
    // }
    // else if (this.accountType === 'ETHEREUM') {
        // let sig = this.localObject.sign(message, this.localObject.address);
    
        // return sig;
    // }
};

Account.prototype.setAccountType = function(accountType) {
    this.accountType = accountType;
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
    let ethAccount = new ethers.Wallet(keyString);
    // let ethAccount = web3.eth.accounts.wallet.add(keyString);

    let account = new Account(ethAccount.signingKey.address, ethAccount.signingKey.privateKey, ethAccount.signingKey.publicKey);

    account.localObject = ethAccount;

    return account;
};


/**
 * Creates an account of a given type from a privatekey
 * And attaches 
 */
Account.fromPrivateKeyFileWithProvider = function(keyPath, provider) {
    var keyString = undefined;

    try {
        // TODO turn into async
        keyString = readFileSync(keyPath, 'utf-8').toString().trim();
    }
    catch (e) {
        throw (e);
    }
    // let ethAccount = new ethers.Wallet(keyString, provider);
    const _account = provider.eth.accounts.privateKeyToAccount('0x' + keyString)
    // console.log(_account);
    let ethAccount = provider.eth.accounts.wallet.add(_account);
    // let ethAccount = provider.eth.accounts.wallet.add(keyString);

    // let account = new Account(ethAccount.signingKey.address, ethAccount.signingKey.privateKey, ethAccount.signingKey.publicKey);
    let account = new Account(_account.address, _account.privateKey, _account.publicKey);

    account.localObject = ethAccount;
    account.provider = provider;

    return account;
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
