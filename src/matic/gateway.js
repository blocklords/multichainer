
var Gateway = function(mainchain, sidechain) {
    this.mainchain = mainchain;
    this.sidechain = sidechain;
};

Gateway.prototype.onTransfer = function(params, callback) {
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
        console.log('Withdraw token: '+eventName);

        let currentState = 0;
        let statesAmount = 3;

        let lordsNFT = 'lordsNFT';

        this.sidechain[lordsNFT].on('Withdraw', {}, function(log){
            currentState = 1;

            let txid = log.transactionHash;
            let blockNumber = log.blockNumber;
            let owner = log.returnValues.from;
            let tokenID = parseInt(log.returnValues.tokenId);

            callback({tokenID: tokenID, owner: owner, blockNumber: blockNumber, txid: txid, currentState: currentState, statesAmount: statesAmount});
        }.bind(this));

        // add matic nft token streamer to Withdraw.
        // ChildERC721.json Withdraw
        // from: "0xFAa502EBe96601782A34b1a947B676FB4e9d090c"
        // token: "0xbb60Fd245E2821bc7a5C6EeC4ef77A9A6bEdFe53"
        // tokenId: "1"
        // set the state of token export to 1/3

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

        // add a contract of withdraw proxy
        // listen the WithdrawProxy's ExitStarted event
        // listen to transfers on ethereum to the ERC721 predicate if was sent a NFT
        // on predicate, set the state of token export to 2/3

        // listen to transfers on ethereum withdraw manager proxy (0x3cf9ad3395028a42eafc949e2ec4588396b8a7d4) for withdraw event
        // amount: "1"
        // exitId: "541212018547743864515934151807498599089339105536"
        // token: "0xbb60Fd245E2821bc7a5C6EeC4ef77A9A6bEdFe53"
        // user: "0xFAa502EBe96601782A34b1a947B676FB4e9d090c"
        // filter by "returnValues.token"

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
