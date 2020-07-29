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
let getBlockchain = function (blockchain, network) {
    for(var i in blockchains) {

        if (blockchains[i].name !== blockchain) {
            continue;
        }

        // multichainer supports the given blockchain.
        // does multichainer has a configuration of blockchain for the given network
        let config = blockchains[i].config;
        if (config[network] != undefined) {
            return blockchains[i];
        }
        else {
            return {error: '', message: `Unsupported network type: ${network}`};
        }
    }

    return {erro: '', message: `Unsupported blockchain type: ${blockchain}`};
};


/**
 * Constructor
 * @param {string} blockchain Blockchain to which Multichainer was connected: ethereum, tron etc
 * @param {string} network    Blockchain network name: privatenet, testnet etc
 * @param {string} sidechain  [Optional] name of the sidechain to connect to: loom, matic etc
 */
var Multichainer = function (blockchain, network) {
    let result = getBlockchain(blockchain, network);
    if (result.error !== undefined) {
        throw result.message;        
    }

    this.name               = result.name;
    this.network            = network;

    this.config             = result.config[network];

    this.utils              = result.utils;
    this.account            = new result.Account(this);
    this.provider           = new result.Provider(this);
    this.Gateway            = result.Gateway;

    this.contract           = result.contract;
    // Contract is a class that generates a contract object for each contract
    // We set a global multichainer reference that will be used by all contract objects
    this.contract.multichainer = this;

    this.smartcontract      = result.smartcontract;

    return this;
};


Multichainer.prototype.addSidechain = async function (blockchain, network) {
    this.sidechain          = new Multichainer(blockchain, network);

    let mapping = this.sidechain.config[this.name];
    if (mapping === undefined) {
        throw `${blockchain} can not be sidechain of ${this.name}`;
    }
    if (mapping[this.network] === undefined) {
        throw `The ${this.name}-${this.network} can't be mapped to ${blockchain}-${network}`;
    }
    
    this.sidechain.config = mapping[this.network];

    await this.sidechain.provider.init(this);

    this.gateway = new this.sidechain.Gateway(this, this.sidechain);

    return this.sidechain;
};


Multichainer.prototype.getProvider = function(signer = undefined) {
    return this.provider.get();
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


/***************************************************************
 *  Multichainer's crosschain part
 *
 *
 * *************************************************************/

Multichainer.prototype.transfer = function(params) {
    if (params.name === undefined) {
        throw `Please pass the token 'name' to transfer`;
    }
    else if (this[params.name] === undefined) {
        throw `Multichainer hasn't registered a ${params.name} token`;
    }

    // transferring nft
    if (params.id !== undefined) {
        if (this[params.name].type !== this.contract.NFT) {
            throw `The ${params.name} is a '${this.contract.NFT}', but transfer method is missing 'id' parameter`;
        }
        
        this.transferName = params.name;
        this.transferType = this.contract.NFT;
        this.transferValue = params.id;
    }
    else if (params.amount !== undefined) {
        if (this[params.name].type !== this.contract.TOKEN) {
            throw `The ${params.name} is a '${this.contract.TOKEN}', but transfer method is missing 'amount' parameter`;
        }
        this.transferName = params.name;
        this.transferType = this.contract.TOKEN;
        this.transferValue = params.amount * 10e17;
    }
    else {
        throw `Couldn't detect a transferring data. Please set either 'id' param for NFTs or 'amount' param for tokens`;
    }

    return this;
};

Multichainer.prototype.from = function(multichainer) {
    if (multichainer === this) {
        console.log(`Deposit from ${this.name}-${this.network}`);
    }
    else if (multichainer === this.sidechain) {
        console.log(`Deposit from ${this.sidechain.name}-${this.sidechain.network}`);
    }

    this.fromMultichainer = this;

    return this;
};

Multichainer.prototype.to = function (multichainer) {
    if (multichainer === this) {
        console.log(`to ${this.name}-${this.network}`);
    }
    else if (multichainer === this.sidechain) {
        console.log(`To ${this.sidechain.name}-${this.sidechain.network}`);

        let contract = this.fromMultichainer[this.transferName];
        let account = this.fromMultichainer.account;
        let addressFrom = account.default.address;
        let addressTo = this.sidechain.config.mainNetwork.Contracts.DepositManagerProxy;

        // console.log(`Transfer token #${this.transferValue} from ${addressFrom} to ${addressTo}`);

        return this.gateway.transferToSidechain({
            id: this.transferValue,
            name: this.transferName,
            account: account 
        });
        return;


        contract
        .send()
        .as(account)
        .safeTransferFrom(addressFrom, addressTo, this.transferValue)
        .then(txHash => {
            console.log(txHash);
        })
        .catch(e => {
            console.error(e);
        })
    }

    this.toMultichainer = this.sidechain;

    return this;
};


// Invoke when import was done

Multichainer.prototype.onTransfer = function(params, callback) {
    return this.gateway.onTransfer(params, callback);
}

module.exports = Multichainer;
