const Utils = require('./cryptoutils');

var addressmapper = {
    // Creates an instance of address mapper
    init: function(loomParams, ethParams) {
        let { privateKey, publicKey } = Utils.generateKeyPair();

        const loomAccount = Utils.generateAccountFromPublicKey({chainId: loomParams.chainId, publicKey: publicKey});
            
        let client = Utils.generateClient(loomParams);
        client.txMiddleware = [
            new loom.NonceTxMiddleware(publicKey, client),
            new loom.SignedTxMiddleware(privateKey)
        ];

        return loom.Contracts.AddressMapper.createAsync(client, loomAccount);
    },
    setMapping: function(loomParams, ethParams, addressMapper) {
        cc.log("Create a mapped address on Loom chain");
            
        let { privateKey, publicKey } = Utils.generateKeyPair();

        let _this = this;

        // let chainId = cc.zz.LoginData.getCurrentBlockchainNetworkData().chainId;
        // let writeUrl = cc.zz.LoginData.getCurrentBlockchainNetworkData().writeUrl;
        // let readUrl = cc.zz.LoginData.getCurrentBlockchainNetworkData().readUrl;
        // let client = Utils.generateClient(loomParams);

        // const ethersProvider = new ethers.providers.Web3Provider(web3.currentProvider);
        // pass to ethParams the web3.currentProvider
        let ethersProvider = new ethers.providers.Web3Provider(ethParams.currentProvider);
        const signer = ethersProvider.getSigner();
          
        const ethAccount = Utils.generateAccount(ethParams);

        // const loomAccount = Utils.generateAccount({chainId: loomParams.chainId, publicKey: publicKey});
        const loomAccount = addressMapper.caller;
            
        // client.txMiddleware = [
            // new loom.NonceTxMiddleware(publicKey, client),
            // new loom.SignedTxMiddleware(privateKey)
        // ];
            
        // console.log(addressMapper);
        const ethersSigner = new loom.EthersSigner(signer)
        
        let promise = new Promise(function(resolve, reject){
            addressMapper.addIdentityMappingAsync(loomAccount, ethAccount, ethersSigner).then(function() {
                // Wait until mapping appearance on loomchain
                _this.waitMappingConfirmation(addressMapper, ethAccount)
                .then((mapping) => {
                    // mod.loomProvider = new loom.LoomProvider(mod.client, privateKey)
                    // mod.loomProvider.callerChainId = mod.callerChainId
                    // mod.loomProvider.setMiddlewaresForAddress(to.local.toString(), [
                        // new loom.NonceTxMiddleware(to, mod.client),
                        // new loom.SignedEthTxMiddleware(signer)
                    // ]);
                    let addr = "0x" + loom.CryptoUtils.bytesToHex(mapping.to.local.bytes).toLowerCase();
                    resolve(addr);
                })
                .catch(e => {
                    reject(e);
                });
            })
            .catch(e => {
                reject(e);
            })
        });
        
        return promise;
    },

    getMapping(loomParams, ethParams, addressMapper) {

        const ethAccount = Utils.generateAccount(ethParams);

        let promise = new Promise(function(resolve, reject){
            addressMapper.getMappingAsync(ethAccount).then((mapping ) => {
                let addr = "0x" + loom.CryptoUtils.bytesToHex(mapping.to.local.bytes).toLowerCase();
                resolve(addr);
            })
            .catch(e => {
                cc.warn("No address mapping");
                reject(e);
            });
        });
        
        return promise;

    },
    waitMappingConfirmation(addressMapper, ethAccount) {
        var mod = this;
        var p = new Promise((resolve, reject) => {
            addressMapper.getMappingAsync(ethAccount).then((mapping ) => {
                resolve(mapping);                    
            }).catch(e => {
                setTimeout(function(){
                    mod.waitMappingConfirmation(addressMapper, ethAccount);
                }, 4 * 1000);
            });
        });

        return p;
    },
};

module.exports = addressmapper;
