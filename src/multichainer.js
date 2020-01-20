const { Provider: LoomProvider } = require('./loom/index.js');
const loomProvider = new LoomProvider();

// supported blockchain, network and sidechains
const BLOCKCHAINS = {
    'ethereum'  : 'ethereum',
    'eth'       : 'ethereum'    
};

const NETWORKS = {
    'testnet'   : 'testnet',
    'test'      : 'testnet',
    'privatenet': 'privatenet',
    'private'   : 'privatenet'
};

const SIDECHAINS = {
    'loom'      : 'loom'
};

// Version of the library
const VERSION = '0.0.6';


var Multichainer = function (blockchain, network, sidechain = undefined) {
    if (Multichainer.instance !== undefined) {
        if (Multichainer.instance.blockchain == blockchain && Multichainer.instance.network == network && Multichainer.instance.sidechain == sidechain) {
            return Multichainer.instance;
        }
    }

    if (BLOCKCHAINS[blockchain] === undefined) {
        throw "Unsupported blockchain type: "+blockchain;
    }
    
    if (NETWORKS[network] === undefined) {
        throw "Unsupported network type: "+network;
    }

    if (sidechain !== undefined && SIDECHAINS[sidechain] === undefined) {
        throw "Unsupported sidechain type: "+sidechain;
    }

    this.blockchain = blockchain;
    this.network = network;
    this.sidechain = sidechain;

    this.version = VERSION;

    Multichainer.instance = this;

    return this;
};

// Static reference of Multichain
Multichainer.instance = undefined;

// Get provider
Multichainer.prototype.getProvider = function() {
    if (Multichainer.instance === undefined) {
        throw "Multichainer is undefined";
    }

    // Loom?
    if (Multichainer.instance.blockchain == BLOCKCHAINS.ethereum && Multichainer.instance.sidechain == SIDECHAINS.loom) {
        return loomProvider.getProvider(Multichainer.instance.network);
    }

    return undefined;
};

module.exports = Multichainer;