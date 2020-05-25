const fs = require('fs');
const loom = require('loom-js');
const Multichainer = require('./multichainer.js');
const Utils = require('./cryptoutils');
const Config = require('./config.js');
const { Contract: LoomContract } = require('./loom/index.js');
const { Contract: EthereumContract } = require('./ethereum/index.js');

// To create a contract
var Contract = function(address, instance) {
    this.address    = address;
    this.instance   = instance;
};

// @param   string      path - ABI file path
Contract.fromAbiFile = function(address, path, blockhainConfig, provider) {
    let instance = undefined;

    if (blockhainConfig.blockchain == Config.BLOCKCHAINS.ethereum && blockhainConfig.sidechain == Config.SIDECHAINS.loom) {
        instance = LoomContract.fromAbiFile(address, path, provider);

    }
    else if (blockhainConfig.blockchain == Config.BLOCKCHAINS.ethereum && blockhainConfig.sidechain === undefined) {
        instance = EthereumContract.fromAbiFile(address, path, blockhainConfig);
    }
    else {
        throw "Not implemented";
    }

    return new Contract(address, instance);
};
    
    // let gatewayAddress = cc.zz.LoginData.getCurrentBlockchainNetworkData().gateway;
Contract.loadGatewayContract = function(ethParams) {
        let mod = this;

        let promise = new Promise((resolve, reject) => {
            let version = cc.zz.LoginData.getCurrentBlockchainNetworkData().gatewayVersion;

            const ethersProvider = new ethers.providers.Web3Provider(ethParams.currentProvider)
            const signer = ethersProvider.getSigner();

            loom.createEthereumGatewayAsync(version, ethParams.gatewayAddress, ethersProvider)
           .then(res => {
                resolve(res.withSigner(signer));
            }).catch(e => {
                cc.error(e);
                reject(e);
            }); 
        });

        return promise;
};

Contract.loadLoomGatewayContract = function(apiPath, loomParams, ethParams, loomWeb3) {
        let mod = this;

        // var promise = new Promise((resolve, reject) => {
        let { privateKey, publicKey } = Utils.generateKeyPair();

        const loomAccount = Utils.generateAccountFromPublicKey({chainId: loomParams.chainId, publicKey: publicKey});
                
        let client = Utils.generateClient(loomParams);

        let ethersProvider = new ethers.providers.Web3Provider(ethParams.currentProvider);
        const signer = ethersProvider.getSigner();

        const ethAccount = Utils.generateAccount(ethParams);

        client.txMiddleware = [
            new loom.NonceTxMiddleware(ethAccount, client), 
            new loom.SignedEthTxMiddleware(signer) 
        ];

        return loom.Contracts.TransferGateway.createAsync(client, ethAccount);
};

module.exports = Contract;
