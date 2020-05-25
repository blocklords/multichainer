const MultichainerConfig = require('./config.js');

/**
 * Prepare the blockchain parameters, such as default gas fee, root contracts, node endpoint and blockchain type
 * @param {[type]} blockchain Name of the blockchain. For example ethereum, loom
 * @param {[type]} network    
 * @param {[type]} custom     [description]
 */
var Config = function(blockchain, network, custom, isSidechain = false) {
    this.blockchain         = blockchain;
    this.network            = network;
    this.custom             = custom;
    this.isSidechain        = isSidechain;
};

module.exports = Config;
