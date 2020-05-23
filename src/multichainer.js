/**
 *  Multichainer is a library that gives a single interface to connect to the different blockchains.
 *
 *  Written on Node.js
 * 
 *  Forget about web3, matic.js, loomjs, neojs. Use just Multichainer to make your DAPP crossplatformed
 */


/*************************************************************************
 *  Import all blockchains that are connected by Multichainer
 *************************************************************************
 *
 *  TODO: load automatically by sub module dedicated for the certain blockchain
 *
 *  Imported libraries:
 *      1. Loom
 *      2. Matic
 */
let blockchains = [];
blockchains.push (require('./ethereum/index.js'));
blockchains.push (require('./matic/index.js'));

const config                        = require('./config.js');

// const { Provider: LoomProvider }    = require('./loom/index.js');
// const loomProvider                  = new LoomProvider();

/**
 * Check the passed parameters to Multichainer, which means validate blockchain, network and sidechain
 * @param  {[type]} blockchain blockchain name, e.g.: tron, ethereum and so on.
 * @param  {[type]} network    a network of blockchain. e.g.: testnet, privatenet
 * @param  {[type]} sidechain  [optional]
 * @return {true|object}       return true, if validation of parameters passed, otherwise an object with error message           
 */
let getBlockchain   = function (blockchain, network) {
    for(var i in blockchains) {

        if (blockchains[i].name !== blockchain) {
            continue;
        }

        // multichainer supports the given blockchain.
        // does multichainer has a configuration of blockchain for the given network
        let config = blockchains[i].config;
        if (config[network] != undefined) {
            return true;
        }
        else {
            return {message: `Unsupported network type: ${network}`};
        }
    }

    return {message: `Unsupported blockchain type: ${blockchain}`};
};


/**
 * Constructor
 * @param {string} blockchain Blockchain to which Multichainer was connected: ethereum, tron etc
 * @param {string} network    Blockchain network name: privatenet, testnet etc
 * @param {string} sidechain  [Optional] name of the sidechain to connect to: loom, matic etc
 */
var Multichainer = function (blockchain, network) {
    let result = getBlockchain(blockchain, network);
    if (result !== true) {
        throw result.message;        
    }

    this.blockchain         = blockchain;
    this.network            = network;

    return this;
};


Multichainer.prototype.addSidechain = function (blockchain, network) {

};


Multichainer.prototype.getProvider = function(signer = undefined) {
    if (Multichainer.instance === undefined) {
        throw "Multichainer wasn't instantiated.";
    }

    // Loom?
    if (this.blockchain == config.BLOCKCHAINS.ethereum && this.sidechain == config.SIDECHAINS.loom) {
        return loomProvider.getProvider(Multichainer.instance.network, signer);
    }

    return undefined;
};


Multichainer.prototype.getProviderWithSigner = function(signer, signerType) {
    if (Multichainer.instance === undefined) {
        throw "Multichainer wasn't instantiated.";
    }
    // Loom?
    if (this.blockchain == config.BLOCKCHAINS.ethereum && this.sidechain == config.SIDECHAINS.loom) {
        return loomProvider.getProviderWithSigner(Multichainer.instance.network, signer, signerType);
    }
};

module.exports = Multichainer;
