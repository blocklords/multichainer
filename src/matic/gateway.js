/**
 *  Multichainer is a library that gives a single interface to connect to the different blockchains.
 *
 *  Written on Node.js
 * 
 *  Forget about web3, matic.js, loomjs, neojs. Use just Multichainer to make your DAPP crossplatformed
 */


var Gateway = function(mainchain, sidechain) {
    this.mainchain = mainchain;
    this.sidechain = sidechain;
};

Gateway.prototype.onTransfer = function(params) {
    if (params.from === this.mainchain && params.to === this.sidechain) {
        let eventName = `transfer_from_${this.mainchain.name}_${this.mainchain.network}_to_${this.sidechain.name}_${this.sidechain.network}`;
        console.log('Deposit token: '+eventName);

        let depositManager = this.sidechain.config.mainNetwork.Contracts.DepositManagerProxy;

        console.log(`Player transfers token to ${depositManager}`);

        // deposit token
        return this;
    }
    else if (params.from === this.sidechain && params.to === this.mainchain) {
        let eventName = `transfer_from_${this.sidechain.name}_${this.sidechain.network}_to_${this.mainchain.name}_${this.mainchain.network}`;
        console.log('Withdraw token: '+eventName);

        // withdraw token
        return this;
    }

    if (params.from === undefined && params.to === undefined) {
        throw `Missed 'from' and 'to' properties of argument.`;
    }
    else if (params.from === undefined) {
        throw `Missed 'from' property of argument`;
    }
    else if (params.to === undefined) {
        throw `Missed 'to' property of argument`;
    }
    else if (params.from !== this.mainchain && params.from !== this.sidechain) {
        throw `'from' property wasn't recognized. It should be a reference to mainchain or sidechain`;
    }
    else if (params.to !== this.mainchain && params.to !== this.sidechain) {
        throw `'to' property wasn't recognized. It should be a reference to mainchain or sidechain`;
    }
    throw `Unrecognized error`;
}

module.exports = Gateway;
