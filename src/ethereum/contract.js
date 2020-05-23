const Utils = require('./cryptoutils');
const fs = require('fs');

// no constructor
var Contract = function() {};

// @param   string      path - ABI file path
Contract.fromAbiFile = function(address, path, blockhainConfig) {
    var mod = this;

    // TODO turn into async
    try {
        let rawdata = fs.readFileSync(path);
        let data = JSON.parse(rawdata);
    }
    catch (e) {
        throw e;
    }

    // if (web3.version.getNetwork !== undefined) {
        // resolve(loomWeb3.eth.contract(data.json.abi).at(address));
    // }
    // else {
    return new provider.eth.Contract(data.abi, address);
    // }
};

module.exports = Contract;
