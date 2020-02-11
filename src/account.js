const Multichainer = require('./multichainer.js');
const { Account: LoomAccount } = require ('./loom/index.js');
const { Account: EthAccount } = require ('./eth/index.js');

var Account = function(address, accountType) {
    this.address = address.toString();
    this.accountType = accountType;
};

Account.TYPE = {
    LOOM: 'LOOM',
    ETHEREUM: 'ETHEREUM'
};

Account.prototype.setKeyPair = function(privateKey, publicKey) {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
};

Account.prototype.setLocalObject = function(local) {
    this.localObject = local;
};

Account.prototype.setProvider = function(provider) {
    this.provider = provider;
};

Account.prototype.setObject = function(object) {
    this.object = object;
};

/**
 *  Sign the given message
 */
Account.prototype.sign = function (message) {
    return this.object.sign(message);
};


Account.validateAccountType = function(type) {
    if (Account.TYPE[type] === undefined) {
        throw "Invalid Account type: "+type;
    }
};

/**
 *  Return the Account Object that was created by 
 *  Blockchain Library.
 */
Account.prototype.getLocal = function () {
    if (this.localObject) {
        return this.localObject;
    }
    return this;
};


/**
 * Creates an account of a given type from a privatekey
 *
 * TODO make accountType parameter optional, and detect by multichainer object
 */
Account.fromPrivateKeyFile = function(path, accountType) {
    Account.validateAccountType(accountType);

    // todo validate path
    if (accountType === Account.TYPE.LOOM) {

        let loomAccount = LoomAccount.fromPrivateKeyFile(path);

        let account = new Account(loomAccount.address, accountType);
        account.setKeyPair(loomAccount.privateKey, loomAccount.publicKey);

        return account;
    }
    else if (accountType === Account.TYPE.ETHEREUM) {
        let ethAccount = EthAccount.fromPrivateKeyFile(path); 
    
        let account = new Account(ethAccount.address, accountType);

        account.setKeyPair(ethAccount.privateKey, ethAccount.publicKey);
        account.setObject(ethAccount);
        account.setLocalObject(ethAccount.localObject);

        return account;
    }

    return new Account();
};

/**
 * Creates an account of a given type from a privatekey
 *
 * TODO make accountType parameter optional, and detect by multichainer object
 */
Account.fromPrivateKeyFileWithProvider = function(path, accountType, provider) {
    Account.validateAccountType(accountType);

    // todo validate path
    if (accountType === Account.TYPE.LOOM) {

        let loomAccount = LoomAccount.fromPrivateKeyFileProvider(path);

        let account = new Account(loomAccount.address, accountType);
        account.setKeyPair(loomAccount.privateKey, loomAccount.publicKey);

        return account;
    }
    else if (accountType === Account.TYPE.ETHEREUM) {
        let ethAccount = EthAccount.fromPrivateKeyFileWithProvider(path, provider); 
        ethAccount.setAccountType(accountType);

        return ethAccount;
        // let account = new Account(ethAccount.address, accountType);

        // account.setKeyPair(ethAccount.privateKey, ethAccount.publicKey);
        // account.setObject(ethAccount);
        // account.setLocalObject(ethAccount.localObject);
        // account.setProvider(provider);

        // return account;
    }

    return new Account();
};


/**
 * Creates a random account
 *
 * TODO make accountType parameter optional, and detect by multichainer object
 */
Account.getRandom = function(accountType) {
    Account.validateAccountType(accountType);

    // todo validate path
    if (accountType === Account.TYPE.LOOM) {
        const { Account: LoomAccount } = require ('./loom/index.js');

        let loomAccount = LoomAccount.getRandom();

        let account = new Account(loomAccount.address, accountType);
        account.setKeyPair(loomAccount.privateKey, loomAccount.publicKey);

        return account;
    }
    else if (accountType === Account.TYPE.ETHEREUM) {
        let ethAccount = EthAccount.getRandom(); 
    
        let account = new Account(ethAccount.address, accountType);
        account.setKeyPair(ethAccount.publicKey, ethAccount.privateKey);
        account.setObject(ethAccount);
        account.setLocalObject(ethAccount.localObject);

        return account;    
    }

    return new Account();
};


module.exports = Account;
