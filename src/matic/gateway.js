const Network = require("@maticnetwork/meta/network");

var Gateway = function(mainchain, sidechain) {
    this.mainchain = mainchain;
    this.sidechain = sidechain;
};

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
        // console.log('Withdraw token: '+eventName);

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
        /// 2/3. Listening to second state of matic->ethereum transfer should watch on Withdraw Manager.  //
        /// Exit manager adds the burnt token to the queue of exited tokens list                          //
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        
        let withdrawManager = 'WithdrawManager';
        let withdrawManagerAddress = this.sidechain.config.mainNetwork.Contracts.WithdrawManagerProxy;
        // ABI file of withdtaw manager comes with Matic Configurations
        const network = new Network(this.sidechain.config.network, this.sidechain.config.version);
        let withdrawManagerAbi = network.abi(withdrawManager);

        // loading the withdraw manager with address, name and abi
        this.sidechain.contract.add({name: withdrawManager, address: withdrawManagerAddress, type: this.sidechain.contract.CONTRACT}).fromAbi(withdrawManagerAbi);

        this.sidechain[withdrawManager].on('ExitStarted', { token: this.mainchain[params.name].address }, function(log){
            currentState = 2;

            let txid = log.transactionHash;
            let blockNumber = log.blockNumber;
            let owner = log.returnValues.exitor;
            let tokenID = parseInt(log.returnValues.amount);

            callback({tokenID: tokenID, owner: owner, blockNumber: blockNumber, txid: txid, currentState: currentState, statesAmount: statesAmount});
        });

        // on client:
        // if clicked on export, click set the export.
        // then after receiving the state one update from server,
        // click on second state.
        // if blockchain returns an error saying that withdrawNFT() throws an AssertionError: 
        // actual: false
        // expected: true
        // generatedMessage: false
        // message: "Burn transaction has not been checkpointed as yet"
        // name: "AssertionError"
        // operator: "=="
        // then wait for 1 minute and try again.

        /////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /// 3/3. Listening to third state of matic->ethereum transfer. It still watches Withdraw Manager. However, //
        /// Withdraw Manager now emits withdraw event                                                              //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////////

        this.sidechain[withdrawManager].on('Withdraw', { token: this.mainchain[params.name].address }, function(log){
            currentState = 3;

            let txid = log.transactionHash;
            let blockNumber = log.blockNumber;
            let owner = log.returnValues.user;
            let tokenID = parseInt(log.returnValues.amount);

            callback({tokenID: tokenID, owner: owner, blockNumber: blockNumber, txid: txid, currentState: currentState, statesAmount: statesAmount});
        });

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

module.exports = Gateway;
