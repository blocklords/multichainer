const Utils = require('./cryptoutils');
const fs = require('fs');

// no constructor
var Contract = function(name, address, type) {
    this.name = name;
    this.address = address;
    this.type = type;
};

/**
 * Add a new contract to the multichainer
 * @param {String} params.name  An alias of contract 
 */
Contract.add = function(params) {
    if (params.type === undefined) {
        param.type = this.CONTRACT;
    }

    if (params.name === undefined) {
        throw 'Should be given an alias of contract. Missing "name" parameter';
    }
    if (Contract.multichainer[params.name] !== undefined) {
        throw `${params.name} is a multichainer keyword, or a contract with the name ${params.name} was initiated already`;
    }


    let contract = new Contract(params.name, params.address, params.type);

    // An alias of contract to use to interact with
    // For example, if contract name is testContract.
    // Then users could interact with testContract.withdraw by
    // mc.testContract.methods.withdraw({})
    Contract.multichainer[params.name] = contract;

    return contract;
}


Contract.multichainer = undefined;
Contract.NFT = 'erc_721';
Contract.CONTRACT = 'contract';
Contract.TOKEN = 'erc_20';

/**
 * Loads an abi file to the last added contract
 * @param  {[type]} path [description]
 * @return {[type]}      [description]
 */
Contract.prototype.fromAbiFile = function(path) {
    // var mod = this;

    // TODO turn into async
    // try {
        // let rawdata = fs.readFileSync(path);
        // let data = JSON.parse(rawdata);
    // }
    // catch (e) {
        // throw e;
    // }

    // if (web3.version.getNetwork !== undefined) {
        // resolve(loomWeb3.eth.contract(data.json.abi).at(address));
    // }
    // else {
    // return new provider.eth.Contract(data.abi, address);
    // }
};

module.exports = Contract;
