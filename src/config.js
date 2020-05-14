/***********************************************************88888
 * List of supported Blockchains, Networks and Sidechains,
 * Version of the Multichainer library
 */

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
    'loom'      : 'loom',
    'matic'     : 'matic'
};

// Version of the library
const VERSION = '0.2.0';

module.exports = {
    SIDECHAINS:     SIDECHAINS,
    BLOCKCHAINS:    BLOCKCHAINS,
    NETWORKS:       NETWORKS,
    VERSION:        VERSION
};