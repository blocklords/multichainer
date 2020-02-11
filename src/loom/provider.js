const loom = require('loom-js');
const Web3 = require('web3');
const Account = require('./../account.js');

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


// Get Interactor with a node. Web3 instance for example.
// This is default version returning only for sidechain
//
// @param account - Multichainer/Account loom account
Provider.prototype.getProviderWithSigner = function(network, signer, signerType) {
    if (CONFIG[network] === undefined) {
        throw "Unsupported Loom network type: "+network;
    }

    const {writeUrl, readUrl, networkId} = CONFIG[network];

    let client = new loom.Client(networkId, writeUrl, readUrl)

    const ethAddress = signer.address;
    const callerAddress = new loom.Address('eth', loom.LocalAddress.fromHexString(ethAddress))

    if (signerType === Account.TYPE.ETHEREUM) {
        client.txMiddleware = [
            new loom.NonceTxMiddleware(callerAddress, client),
            new loom.SignedEthTxMiddleware(signer.localObject)
        ];

        let dummyKey = loom.CryptoUtils.generatePrivateKey()

        const loomProvider = new loom.LoomProvider(
          client,
          dummyKey,
          () => client.txMiddleware
        )

        loomProvider.setMiddlewaresForAddress(callerAddress.local.toString(), client.txMiddleware)
        loomProvider.callerChainId = callerAddress.chainId

        const publicKey = loom.CryptoUtils.publicKeyFromPrivateKey(dummyKey)
        const dummyAccount = loom.LocalAddress.fromPublicKey(publicKey).toString()
        // loomProvider.accounts.delete(dummyAccount)
        // loomProvider._accountMiddlewares.delete(dummyAccount)

        // // TODO move the account setting to the another place
        // const loomEthSigner = new loom.EthersSigner(signer.localObject)

        // let client2 = new loom.Client(networkId, writeUrl, readUrl)
        // client2.txMiddleware = loom.createDefaultTxMiddleware(client2, dummyKey)
        // const loomAddress = new loom.Address(client2.chainId, loom.LocalAddress.fromPublicKey(publicKey))

        // loom.Contracts.AddressMapper.createAsync(client2, loomAddress).then(mapper => {
        //       console.log("mapper returned");
        //       // mapper.getIdentityMappingAsync(
        //       mapper.addIdentityMappingAsync(
        //         loomAddress,
        //         callerAddress,
        //         loomEthSigner
        //       ).then(x => {
        //         console.log("Mapped");
        //         console.log(x);
        //         client2.disconnect()
        //       }).catch(e => {
        //           if (e.message.includes('identity mapping already exists')) {
        //             console.log('Idendity already exists');
        //           } else {
        //             console.error(e)
        //           }
        //           client2.disconnect()
        //       });
        // }).catch(
        //     e => {console.error(e);}
        // );

        return new Web3(loomProvider)
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