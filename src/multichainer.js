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
const config                        = require('./config.js');
const { Provider: LoomProvider }    = require('./loom/index.js');
const loomProvider                  = new LoomProvider();

/**
 * Check the passed parameters to Multichainer, which means validate blockchain, network and sidechain
 * @param  {[type]} blockchain blockchain name, e.g.: tron, ethereum and so on.
 * @param  {[type]} network    a network of blockchain. e.g.: testnet, privatenet
 * @param  {[type]} sidechain  [optional]
 * @return {true|object}       return true, if validation of parameters passed, otherwise an object with error message           
 */
let validate   = function (blockchain, network, sidechain) {
    if (config.BLOCKCHAINS[blockchain] === undefined) {
        return {message: "Unsupported blockchain type: "+blockchain};
    }
    if (config.NETWORKS[network] === undefined) {
        return {message: "Unsupported network type: "+network};
    }
    if (sidechain !== undefined && config.SIDECHAINS[sidechain] === undefined) {
        return {message: "Unsupported sidechain type: "+sidechain};
    }

    return true;
};

/**
 * Is an instance of the Multichainer that connected to the blockchain with an optional sidechain on network created or not.
 * @param  {string}  blockchain
 * @param  {string}  network   
 * @param  {string}  sidechain 
 * @return {Boolean}           
 */
let isCreated = function (blockchain, network, sidechain) {
    let chainer = Multichainer.instance;

    if (chainer === undefined) {
        return false;
    }
    
    return (chainer.blockchain === blockchain && chainer.network === network && chainer.sidechain === sidechain);
};


/**
 * Constructor
 * @param {string} blockchain Blockchain to which Multichainer was connected: ethereum, tron etc
 * @param {string} network    Blockchain network name: privatenet, testnet etc
 * @param {string} sidechain  [Optional] name of the sidechain to connect to: loom, matic etc
 */
var Multichainer = function (blockchain, network, sidechain = undefined) {
    /**
     * A static instance of the Multichainer.
     * @type {Multichainer}
     */
    let multichainer = Multichainer.instance;

    if (isCreated(blockchain, network, sidechain)) {
        return chainer;
    }

    let result = validate(blockchain, network, sidechain);
    if (result !== true) {
        throw result.message;        
    }

    this.blockchain         = blockchain;
    this.network            = network;
    this.sidechain          = sidechain;
    this.version            = config.VERSION;

    /**
     * Set an instance
     * @type {[type]}
     */
    Multichainer.instance   = this;

    return this;
};

// Static reference of Multichainer
Multichainer.instance   = undefined;
Multichainer.config     = config;
Multichainer.validate   = validate;
Multichainer.isCreated  = isCreated;

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
