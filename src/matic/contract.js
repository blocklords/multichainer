const Utils = require('./cryptoutils');
const loom = require('loom-js');
const fs = require('fs');

// To create a contract
var Contract = function() {};

// @param   string      path - ABI file path
Contract.fromAbiFile = function(contractAddress, path, provider) {
    var mod = this;

    let data = undefined;

    // TODO turn into async
    try {
        let rawdata = fs.readFileSync(path);
        data = JSON.parse(rawdata);
    }
    catch (e) {
        throw e;
    }

    // if (web3.version.getNetwork !== undefined) {
        // resolve(loomWeb3.eth.contract(data.json.abi).at(contractAddress));
    // }
    // else {
    return new provider.eth.Contract(data.abi, contractAddress);
    // }
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
