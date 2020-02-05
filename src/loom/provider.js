const loom = require('loom-js');
const Web3 = require('web3');

var Provider = function () {};

// const writeUrl = 'http://extdev-plasma-us1.dappchains.com:80/rpc'
// const readUrl = 'http://extdev-plasma-us1.dappchains.com:80/query'

const CONFIG = {
    'mainnet': {
        writeUrl : 'ws://127.0.0.1:46658/websocket',
        readUrl : 'ws://127.0.0.1:46658/queryws',
        networkId : 'default'
    },
    'testnet': {
        writeUrl : 'ws://extdev-plasma-us1.dappchains.com:80/websocket',
        readUrl : 'ws://extdev-plasma-us1.dappchains.com:80/queryws',
        networkId : 'extdev-plasma-us1'
    },
    'privatenet': {
        writeUrl : 'ws://extdev-plasma-us1.dappchains.com:80/websocket',
        readUrl : 'ws://extdev-plasma-us1.dappchains.com:80/queryws',
        networkId : 'extdev-plasma-us1'
    }
};

// Get Interactor with a node. Web3 instance for example.
// This is default version returning only for sidechain
//
// @param account - Multichainer/Account loom account
Provider.prototype.getProvider = function(network, account = undefined) {
    if (CONFIG[network] === undefined) {
        throw "Unsupported Loom network type: "+network;
    }

    const {writeUrl, readUrl, networkId} = CONFIG[network];

    let client = new loom.Client(networkId, writeUrl, readUrl)

    if (account === undefined) {
        let privateKey = loom.CryptoUtils.generatePrivateKey()

        return new Web3(new loom.LoomProvider(client, privateKey))
    }
    else
    {
        client.txMiddleware = [
            new loom.NonceTxMiddleware(account.publicKey, client),
            new loom.SignedTxMiddleware(account.privateKey)
        ];

        return new Web3(new loom.LoomProvider(client, account.privateKey))
    }
};

// Provider.prototype.getProvider = function(loomParams, ethParams) {
//             const ethAccount = Utils.generateAccount(ethParams);

//             const { privateKey, publicKey } = Utils.generateKeyPair();

//             const client = Utils.generateClient(loomParams);

//             client.txMiddleware = [
//                 new loom.NonceTxMiddleware(publicKey, client),
//                 new loom.SignedTxMiddleware(privateKey)
//             ];

//             const ethersProvider = new ethers.providers.Web3Provider( ethParams.currentProvider );
//             const signer = ethersProvider.getSigner();

//             let loomProvider = new loom.LoomProvider(client, privateKey)
//             loomProvider.callerChainId = ethParams.chainId;
//             loomProvider.setMiddlewaresForAddress(ethAccount.local.toString(), [
//                 new loom.NonceTxMiddleware(ethAccount, client),
//                 new loom.SignedEthTxMiddleware(signer)
//             ]);

//             // this.web3 = new Web3(loomProvider);
//             return new Web3(loomProvider);
//         };

module.exports = Provider;