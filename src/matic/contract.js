const Utils = require('./cryptoutils');
const Network = require("@maticnetwork/meta/network");
const fs = require('fs');

const Method = require('./method.js');

const ON_TRANSFER_TO = 'onTransfer_';
const ON_MINTING = 'onMinting';

var Contract = function(name, address, type) {
    this.name = name;
    this.address = address;
    this.type = type;
    this.events = {};

    const network = new Network(Contract.multichainer.config.network, Contract.multichainer.config.version);

    if (type === Contract.NFT) {
        let abi = network.abi(Contract.multichainer.config.NFT_abi);
        this.fromAbi(abi);
    }
    else if ( type === Contract.TOKEN ) {
        let abi = network.abi(Contract.multichainer.config.TOKEN_abi);
        this.fromAbi(abi);
    }
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
    if (this.type === Contract.NFT || this.type === Contract.TOKEN) {
        console.warn(`\n\nWarning! You are going to rewrite the ABI file for ${this.type}.\nThe ABI for ${this.type} is set automatically by ${Contract.multichainer.name} standard JSON files. Rewriting ABI file could potentially broke the Contract Event Streamer\n\n`);
    }

    // rawdata is a string, data is an object
    let rawdata, data;

    try {
        rawdata = fs.readFileSync(path);
        data = JSON.parse(rawdata);
    }
    catch (e) {
        throw e;
    }

    return this.fromAbi(data.abi);
};

Contract.prototype.fromAbi = function(abi, async = false) {
    let web3 = Contract.multichainer.getProvider();
    if (web3.version.getNetwork !== undefined) {
        this.abi = web3.eth.contract(abi).at(this.address);
    }
    else {
        this.abi = new web3.eth.Contract(abi, this.address);
    }
    
    return this;
};

Contract.prototype.mapTo = function(contract) {
    throw `${Contract.multichainer.name} is a sidechain. Sidechains can not be mapped to another chains. If you want to map this contract, then call the mainchain's mapTo()`;
};

/*********************************************************************************************************************
 *  Contract methods
 * *******************************************************************************************************************
 */
Contract.prototype.call = function (params){//ame, parameters) {
    // let method = this.contract.instance.methods[name];

    let method = new Method(this, params, Method.CALL);
    return method;

    // TODO change the function to invoke methods directly from the top smartcontract module
    if (method === undefined) {
        console.trace("Unsupported method name "+name);
      process.exit(1);
    }

    let parameters = arguments.slice(1);
    if (parameters.length > 0) {
      return method(...parameters).call({ from: this.account.address.toString() });
    }
    return method().call({ from: this.account.address.toString() });
};


// Set some data
Contract.prototype.send = function (params) {
    let method = new Method(this, params, Method.SEND);
    return method;

    let name = arguments[0];

    // let method = this.contract.instance.methods[name];

    // TODO change the function to invoke methods directly from the top smartcontract module
    if (method === undefined) {
      console.trace("Unsupported method name "+name);
      process.exit(1);
    }

    let parameters = arguments.slice(1);
    if (parameters.length > 0) {
      return method(...parameters).send({ from: this.account.address.toString() });
    }
    return method().send({ from: this.account.address.toString() });
};

/////////////////////////////
// CONTRACT EVENT STREAMER //
/////////////////////////////

Contract.prototype.setStreamer = function() {
    // Get dagger.js object
    let eventStreamer = Contract.multichainer.provider.getEventStreamer();

    // daggerContract object
    this.contractStreamer = eventStreamer.contract(this.abi);

    return this;
};


Contract.prototype.on = function(eventName, filter, callback) {
    if (this.contractStreamer === undefined) {
        this.setStreamer();
    };

    if (this.events[eventName] !== undefined) {
        throw `${eventName} is listened already`;
    }

    this.events[eventName] = this.contractStreamer.events[eventName]({filter: filter, room: 'latest'});

    // Start watching logs
    this.events[eventName].watch(function(log){
        callback(log);
    }.bind(this));
};

Contract.prototype.onMinting = function(callback) {
    if (this.contractStreamer === undefined) {
        this.setStreamer();
    }

    if (callback == undefined) {
        throw `Callback function wasn't passed for onMinting event`;
    }
    if (this.events[ON_MINTING] !== undefined) {
        throw `Minting event is already listened. Please remove that event first`;
    }
    if (this.type !== Contract.NFT && this.type !== Contract.TOKEN) {
        throw `Minting event is only supported for ${Contract.NFT}, ${Contract.TOKEN} contracts. Your contract type is ${this.type}`;
    }

    // Get subscription filter
    this.events[ON_MINTING] = this.contractStreamer.events.Transfer({filter: { from: '0x0000000000000000000000000000000000000000' }, room: 'latest'});

    // Start watching logs
    this.events[ON_MINTING].watch((log) => {
        if (this.type === Contract.NFT) {
            callback({blockNumber: parseInt(log.blockNumber), txid: log.transactionHash, owner: log.returnValues.to, tokenID: parseInt(log.returnValues.tokenId)})
        }
        else if (this.type === Contract.TOKEN) {
            callback({blockNumber: parseInt(log.blockNumber), txid: log.transactionHash, owner: log.returnValues.to, amount: parseInt(log.returnValues.value)})
        }
    });
};

Contract.prototype.unMinting = function () {
    if (this.events[ON_MINTING] !== undefined) {
        this.events[ON_MINTING].stopWatching();
        this.events[ON_MINTING] = undefined;
    }
};


Contract.prototype.onTransferTo = function(address, callback) {
    if (this.contractStreamer === undefined) {
        this.setStreamer();
    };

    let eventName = ON_TRANSFER_TO + address;
    if (this.events[eventName] !== undefined) {
        throw "${eventName} is listened already";
    }

    this.events[eventName] = this.contractStreamer.events.Transfer({filter: { to: address }, room: 'latest'});

    this.events[eventName].watch((log) => {
        if (this.type === Contract.NFT) {
            callback({blockNumber: parseInt(log.blockNumber), txid: log.transactionHash, from: log.returnValues.from, to: log.returnValues.to, tokenID: parseInt(log.returnValues.tokenId)})
        }
        else if (this.type === Contract.TOKEN) {
            callback({blockNumber: parseInt(log.blockNumber), txid: log.transactionHash, from: log.returnValues.from, to: log.returnValues.to, amount: parseInt(log.returnValues.value)})
        }
    });
};


module.exports = Contract;
