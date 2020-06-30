const Network = require("@maticnetwork/meta/network");

var Gateway = function(mainchain, sidechain) {
    this.mainchain = mainchain;
    this.sidechain = sidechain;
};

/**
 * Matic -> Ethereum token exporting 2/3 is the ExitStarted event of Withdraw Manager
 * @param  {[type]} web3 [description]
 * @param  {[type]} raw  [description]
 * @return {[type]}      [description]
 */
Gateway.decodeExitStarted = function(web3, raw) {
    const inputs = [
            {
               "indexed":true,
               "name":"exitor",
               "type":"address"
            },
            {
               "indexed":true,
               "name":"exitId",
               "type":"uint256"
            },
            {
               "indexed":true,
               "name":"token",
               "type":"address"
            },
            {
               "indexed":false,
               "name":"amount",
               "type":"uint256"
            },
            {
                "indexed":false,
                "name":"isRegularExit",
                "type":"bool"
            }
    ];
    const res = web3.eth.abi.decodeLog(inputs, raw.data, raw.topics.slice(1));
    
    return res;
};


/**
 * Matic -> Ethereum token exporting 3/3 is the Transfer event of NFT token
 * @param  {[type]} web3 [description]
 * @param  {[type]} raw  [description]
 * @return {[type]}      [description]
 */
Gateway.decodeWithdraw = function(web3, raw) {
    const inputs = [{
            "indexed":true,
            "name":"exitId",
            "type":"uint256"
        },
        {
            "indexed":true,
            "name":"user",
           "type":"address"
        },
        {
            "indexed":true,
            "name":"token",
           "type":"address"
        },
        {
            "indexed":false,
            "name":"amount",
           "type":"uint256"
        }
    ];

    const res = web3.eth.abi.decodeLog(inputs, raw.data, raw.topics.slice(1));
    
    return res;
};

Gateway.exitStartedSign = '0xaa5303fdad123ab5ecaefaf69137bf8632257839546d43a3b3dd148cc2879d6f';
Gateway.withdrawSign = '0xfeb2000dca3e617cd6f3a8bbb63014bb54a124aac6ccbf73ee7229b4cd01f120';


/**
 * Invokes an event on each state of fungible token transfer, non fungible token (NFT) transfer
 * between two mainchain and sidechain. 
 * If `from` is set to mainchain, and `to` set to sidechain, then `onTransfer` will track token import from mainchain to sidechain.
 * If `from` is set to sidechain, and `to` set to mainchain, then `onTransfer` will track token export from sidechain to mainchain.
 * Transfer between mainchains is not supported. Transfer between sidechains is not supported.
 * 
 * @param  {Multichainer}   params.from         The multichainer to start with. It could be either main chain or sidechain.
 * @param  {Multichainer}   params.to           The multichainer to start with. It could be either main chain or sidechain.
 * @param  {String}         params.name         Name of Token on mainchain, to track. Doesn't matter whether the mainchain is set as `from` or `to`
 * @param  {Function} callback  A function that should be invoked when transfer state was updated
 * @return {Gateway}        current gateway 
 */
Gateway.prototype.onTransfer = function(params, callback) {
    console.log(`\n\nWarning! Don't forget to update the contract's mapTo function. And get name of contract on sidechain from mapping (Gateway.onTransfer)\n\n`);

    if (params.from === this.mainchain && params.to === this.sidechain) {
        let depositManager = this.sidechain.config.mainNetwork.Contracts.DepositManagerProxy;

        this.mainchain[params.name].onTransferTo(depositManager, function(log){
            // ethereum -> matic has 1 states that requires player transaction confirmation
            let currentState = 1;
            let statesAmount = 1;

            callback({tokenID: log.tokenID, owner: log.from, blockNumber: log.blockNumber, txid: log.txid, currentState: currentState, statesAmount: statesAmount});
        });

        // deposit token
        return this;
    }
    else if (params.from === this.sidechain && params.to === this.mainchain) {
        let eventName = `transfer_from_${this.sidechain.name}_${this.sidechain.network}_to_${this.mainchain.name}_${this.mainchain.network}`;

        let currentState = 0;
        let statesAmount = 3;

        /////////////////////////////////////////////////////////////////////////////////////////////////////
        /// 1/3. Listening to first state of matic->ethereum transfer should watch on NFT at matic network //
        /////////////////////////////////////////////////////////////////////////////////////////////////////
        
        let lordsNFT = 'lordsNFT';
        this.sidechain[lordsNFT].on('Withdraw', {}, function(log){
            currentState = 1;

            let txid = log.transactionHash;
            let blockNumber = log.blockNumber;
            let owner = log.returnValues.from;
            let tokenID = parseInt(log.returnValues.tokenId);

            callback({tokenID: tokenID, owner: owner, blockNumber: blockNumber, txid: txid, currentState: currentState, statesAmount: statesAmount});
        }.bind(this));

        ////////////////////////////////////////////////////////////////////////////////////////////////////
        
        let withdrawManagerAddress = this.sidechain.config.mainNetwork.Contracts.WithdrawManagerProxy;
        streamOn = "latest:log/"+withdrawManagerAddress;

        this.mainchain.provider.eventStreamer.on(streamOn, function(results) {
            let result = results[0];

            /////////////////
            /// 2/3 export //
            /////////////////
            if (result.topics[0] == Gateway.exitStartedSign) {
                let data = Gateway.decodeExitStarted(this.mainchain.getProvider(), result);

                currentState = 2;

                let txid = result.transactionHash;
                let blockNumber = result.blockNumber;
                let owner = data.exitor;
                let tokenID = parseInt(data.amount);

                callback({tokenID: tokenID, owner: owner, blockNumber: blockNumber, txid: txid, currentState: currentState, statesAmount: statesAmount});

            /////////////////
            /// 3/3 export //
            /////////////////
            } else if (result.topics[0] == Gateway.withdrawSign) {
                currentState = 3;
                
                let data = Gateway.decodeWithdraw(this.mainchain.getProvider(), result);

                let txid = result.transactionHash;
                let blockNumber = result.blockNumber;
                let owner = data.user;
                let tokenID = parseInt(data.amount);

                callback({tokenID: tokenID, owner: owner, blockNumber: blockNumber, txid: txid, currentState: currentState, statesAmount: statesAmount});
            }
        }.bind(this));

        return this;
    }

    if (params.from === undefined && params.to === undefined) {
        throw `Missed 'from' and 'to' properties of argument.`;
    }
    else if (params.from === undefined) {
        throw `Missed 'from' property of argument`;
    }
    else if (params.to === undefined) {
        throw `Missed 'to' property of argument`;
    }
    else if (params.from !== this.mainchain && params.from !== this.sidechain) {
        throw `'from' property wasn't recognized. It should be a reference to mainchain or sidechain`;
    }
    else if (params.to !== this.mainchain && params.to !== this.sidechain) {
        throw `'to' property wasn't recognized. It should be a reference to mainchain or sidechain`;
    }
    throw `Unrecognized error`;
}

Gateway.prototype.transferToSidechain = function (params) {
    let contract = this.mainchain[params.name];
    let id = parseInt(params.id);

    this.sidechain.provider.setWallet(params.account.defaultSigningKey.privateKey);

    return this.sidechain.provider.matic.safeDepositERC721Tokens(contract.address, id, {from: params.account.default.address.toLocaleLowerCase() });
}

module.exports = Gateway;
