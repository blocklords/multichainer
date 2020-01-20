const fs = require('fs');
const loom = require('loom-js');
const Multichainer = require('./multichainer.js');
const Utils = require('./cryptoutils');
const { Contract: LoomContract } = require('./loom/index.js');

// To create a contract
var Contract = function(address, instance) {
    this.address = address;
    this.instance = instance;
};

// @param   string      path - ABI file path
Contract.fromAbiFile = function(address, path, provider) {
    if (Multichainer.instance === undefined) {
        throw "Multichainer not instantiniated";
    }

    if (Multichainer.instance.blockchain == 'ethereum' && Multichainer.instance.sidechain == 'loom') {
        let loomInstance = LoomContract.fromAbiFile(address, path, provider);

        return new Contract(address, loomInstance);
    }
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
