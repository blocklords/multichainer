const fs = require('fs');

const Method = require('./method.js');

const ON_MINTING = 'onMinting';
const ON_TRANSFER_TO = 'onTransfer_';

/**
 * @param {[type]} name    Name by which the contract will be addressed within Multichainer library.
 * @param {[type]} address Address of the Contract on Blockchain Network.
 * @param {[type]} type    Type of Contract. Could be normal Contract, Token or NFT token. Depending on the type, the library allows different features
 */
var Contract = function(name, address, type) {
    this.name = name;
    this.address = address;
    this.type = type;

    // List of the events and the callbacks to invoke when the event is triggered
    this.events = {};
};

/*********************************************************************************************************************
 * STATIC PROPERTIES AND METHODS
 * *******************************************************************************************************************
 */

Contract.multichainer = undefined;

// Contract Types
Contract.NFT    = 'erc_721';
Contract.CONTRACT = 'contract';
Contract.TOKEN = 'erc_20';

/**
 * Initialize a new contract on the multichainer. Will be available by the name of the Contract.
 * Note, that contract is not yet downloaded to be interacted. In order to interact with, load contract's Abi 
 * using .fromAbi() or .fromAbiFile()
 * @param {String} params.name  An alias of contract in Multichainer Library
 * @param {ContractType} [OPTIONAL] params.type Type of Contract
 * @return {Contract} Loaded Contract
 */
Contract.add = function(params) {
    ////////////////////////
    // validation library //
    ////////////////////////
    if (params.type === undefined) {
        param.type = this.CONTRACT;
    }
    if (params.name === undefined) {
        throw 'Should be given an alias of contract. Missing "name" parameter';
    }
    // Alias sho
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


/*********************************************************************************************************************
 * Initiate the Abi
 * *******************************************************************************************************************
 */

/**
 * Load the Abi contract with the ABI file given by path
 * @param  {string} path Abi File path
 * @param  {bool} path If set async, then file will be loaded asynchronously, and will return a promise
 * @return {Contract}      [description]
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

/**
 * [fromAbi description]
 * @param  {[type]}  abi   [description]
 * @param  {Boolean} async [description]
 * @return {[type]}        [description]
 */
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


/**
 * Set the Event Streamer.
 */
Contract.prototype.setStreamer = function() {
    // Get dagger.js object
    let eventStreamer = Contract.multichainer.provider.getEventStreamer();

    // daggerContract object
    this.contractStreamer = eventStreamer.contract(this.abi);

    return this;
};


Contract.prototype.mapTo = function(contract) {
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


/*********************************************************************************************************************
 *  Event Listener on Contract events.
 * *******************************************************************************************************************
 */

/**
 * Add a listener on @eventName and call a @callback
 * @param  {String}   eventName Event Name, should be matched to one of the Events in Contract
 * @param  {Object}   filter    @todo
 * @param  {Function} callback  Function to invoke when event was triggered
 */
Contract.prototype.on = function(eventName, filter, callback) {
    if (this.contractStreamer === undefined) {
        this.setStreamer();
    };

    if (this.events[eventName] !== undefined) {
        throw `${eventName} is listened already`;
    }
};

/**
 * Add a listener for the event is called for @Contract.NFT or @Contract.TOKEN types. It's invoked when a new token is created
 * @param  {Function} callback Function to invoke when a new token was invoked
 */
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

/**
 * Delete the listener for the event from being called on @Contract.NFT or @Contract.TOKEN
 * If minting listener wasn't registered, then the function will do nothing
 * @return {[type]} [description]
 */
Contract.prototype.unMinting = function () {
    if (this.events[ON_MINTING] !== undefined) {
        this.events[ON_MINTING].stopWatching();
        this.events[ON_MINTING] = undefined;
    }
};


/**
 * Register an event on to Transfering data to the certain address. This event is supported by @Contract.TOKEN and @Contract.NFT types
 * @param  {[type]}   address  Address to whom token was transferred
 * @param  {Function} callback Function to invoke when Token was transferred
 */
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
