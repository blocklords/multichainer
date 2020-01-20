const Utils = require('./cryptoutils');

let contract = {
    init: function(loomParams, ethParams, loomWeb3) {
        
        let promise = new Promise(function(resolve, reject){

            this.loadHeroToken(ethParams).then(function(heroToken){
            
                this.loadGatewayContract(ethParams).then(function(gatewayContract){
            
                    this.loadLoomContract(CHECK_IN_ABI_PATH, loomParams.checkInAddress, loomWeb3).then(function(checkInContract){

                        this.loadLoomContract(LOOM_HERO_TOKEN_PATH, loomParams.heroTokenAddress, loomWeb3).then(function(loomHeroToken){

                            this.loadLoomGatewayContract(GATEWAY_ABI_PATH, loomParams, ethParams, loomWeb3).then(function(loomGatewayContract){

                                this.loadLoomContract(ITEM_ABI_PATH, loomParams.itemAddress, loomWeb3).then(function(loomItemContract){

                                    resolve({heroToken, gatewayContract, checkInContract, loomHeroToken, loomGatewayContract, loomItemContract});

                                }.bind(this)).catch(errorLoomGatewayAddress => {
                                    cc.error(errorLoomGatewayAddress);
                                    reject(errorLoomGatewayAddress);
                                });

                            }.bind(this)).catch(errorLoomGatewayAddress => {
                                cc.error(errorLoomGatewayAddress);
                                reject(errorLoomGatewayAddress);
                            });

                        }.bind(this)).catch(errorLoomHeroToken => {
                            cc.error(errorLoomHeroToken);
                            reject(errorLoomHeroToken);
                        });

                    }.bind(this)).catch(errorCheckIn => {
                        cc.error(errorCheckIn);
                        reject(errorCheckIn);
                    });
            
                }.bind(this)).catch(errorGateway => {
                    cc.error(errorGateway);
                    reject(errorGateway);
                });

            }.bind(this)).catch(errorToken => {
                cc.error(errorToken);
                reject(errorToken);
            });
        }.bind(this));
        
        return promise;
    
    },
      

    loadToken: function(abi, ethParams) {
        // TODO check whether the given abi is a valid String or an object.
        // if it is a string, means a path.
        // If it is a path, try to check whether the given file exists and readable.
        // Also if the file is parsable json.

        // maybe add the checker of a valid abi file?

        let promise = new Promise(function(resolve, reject){
            cc.loader.loadRes(abi, function (err, data) {
                if (err) {
                    // cc.zz.fire.fire(EventType.POP_UP, cc.zz.Popup.TYPE.FAIL_UNEXPTECTED_BLOCKCHAIN_ISSUE.id, {});
                    resolve('Failed to load Hero Contract Definition')
                }
                else {

                    if (web3.version.getNetwork !== undefined) {
                        web3.version.getNetwork(function(err, networkId) { 
                            if (err) {
                                cc.error(err);
                                reject(err);
                            }
                            else {
                                let res = this.validateNetwork(networkId, ethParams);

                                if (res === true) {
                                    resolve(web3.eth.contract(data.json.abiDefinition).at(ethParams.heroTokenAddress));
                                }
                                else {
                                    reject(res);
                                }
                            }
                        }.bind(this));
                    }
                    else {
                        web3.eth.net.getId(function(error, networkId){
                            if (err) {
                                cc.error(err);
                                reject(err);
                            }
                            else {
                                let res = this.validateNetwork(networkId, ethParams);

                                if (res === true) {
                                    resolve(new web3.eth.Contract(data.json.abiDefinition, ethParams.heroTokenAddress));
                                }
                                else {
                                    reject(res);
                                }
                            }
                        }.bind(this));
                    }
                }
                // https://ethereum.stackexchange.com/questions/47833/typeerror-web3-eth-contract-is-not-a-constructor-what-is-the-reason
            }.bind(this));
        }.bind(this));
        
        return promise;
    },

    validateNetwork (networkId, ethParams) {
        let version
        switch (parseInt(networkId)) {
        case 1: // Ethereum Mainnet
            version = 1
            break

        case 4: // Rinkeby
            version = 2
            break
                                      
        default:
            return ("Ethereum Gateway is not deployed on the network "+networkId);
            // throw new Error('Ethereum Gateway is not deployed on network ' + networkId)
        }
        if (ethParams.netType == 'testnet' && version != 2) {
            alert('Please change the network to rinkeby on Metamask!');
            return ('Not on Rinkeby');
        }
        else if (ethParams.netType == 'mainnet' && version != 1) {
            alert('Please change the network to "Mainnet" on Metamask!');
            return ('Not on Mainnet');
        }
        
        return true;      
    },

    loadLoomContract: function(jsonPath, contractAddress, loomWeb3) {
        var mod = this;

        var p = new Promise((resolve, reject) => {
          cc.loader.loadRes(jsonPath, function (err, data) {
                // cc.loader.load({url: 'http://example.com/getImageREST?file=a.png', type: 'png'}, function (err, tex) {
                if (err) {
                    reject('Failed to load Hero Contract Definition');
                }
                else {
                    // mod.loomContract = mod.web3.eth.contract(data.json.abi).at(contractAddress);
                    // console.warn("Load contract");
                    // console.warn(data.json.abi);
                    if (web3.version.getNetwork !== undefined) {
                        resolve(loomWeb3.eth.contract(data.json.abi).at(contractAddress));
                    }
                    else {
                        resolve(new loomWeb3.eth.Contract(data.json.abi, contractAddress));
                    }
                }
            }.bind(this));
        });
      
        return p;
    },
    // let gatewayAddress = cc.zz.LoginData.getCurrentBlockchainNetworkData().gateway;
    loadGatewayContract(ethParams) {
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
    },

    loadLoomGatewayContract(apiPath, loomParams, ethParams, loomWeb3) {

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
    }
};

module.exports = contract;
