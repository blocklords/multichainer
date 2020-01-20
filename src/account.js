const Multichainer = require('./multichainer.js');

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

Account.validateAccountType = function(type) {
    if (Account.TYPE[type] === undefined) {
        throw "Invalid Account type: "+type;
    }
};

/**
 * Creates an account of a given type from a privatekey
 *
 */
Account.fromPrivateKeyFile = function(path, accountType) {
    Account.validateAccountType(accountType);

    // todo validate path
    if (accountType === Account.TYPE.LOOM) {
        const { Account: LoomAccount } = require ('./loom/index.js');

        let loomAccount = LoomAccount.fromPrivateKeyFile(path);

        let account = new Account(loomAccount.address, accountType);
        account.setKeyPair(loomAccount.privateKey, loomAccount.publicKey);

        return account;
    }

    return new Account();
};

module.exports = Account;
