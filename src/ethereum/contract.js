const Utils = require('./cryptoutils');
const fs = require('fs');


const ON_MINTING = 'onMinting';

var Contract = function(name, address, type) {
    this.name = name;
    this.address = address;
    this.type = type;
    this.events = {};
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
 * @param  {string} path Abi File path
 * @param  {bool} path If set async, then file will be loaded asynchronously, and will return a promise
 * @return {[type]}      [description]
 */
Contract.prototype.fromAbiFile = function(path, async = false) {
    // todo turn into async

    // rawdata is a string, data is an object
    let rawdata, data;

    try {
        rawdata = fs.readFileSync(path);
        data = JSON.parse(rawdata);
    }
    catch (e) {
        throw e;
    }

    let web3 = Contract.multichainer.provider.get();
    if (web3.version.getNetwork !== undefined) {
        this.abi = web3.eth.contract(data.json.abi).at(this.address);
    }
    else {
        this.abi = new web3.eth.Contract(data.abiDefinition, this.address);
    }

    return this;
};

Contract.prototype.setStreamer = function() {
    // Get dagger.js object
    let eventStreamer = Contract.multichainer.provider.getEventStreamer();

    // daggerContract object
    this.contractStreamer = eventStreamer.contract(this.abi);

    return this;
};


Contract.prototype.mapTo = function(contract) {
    // mapping
};

module.exports = Contract;
