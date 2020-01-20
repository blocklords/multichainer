const Utils = require('./cryptoutils');

var gateway = {
    init: function(loomParams, ethParams) {
        // returns the gateway contract and gateway contract addresses
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
    },
    waitApproveConfirmation: function(loomParams, ethParams, otherParams) {
    // waitApproveConfirmation: function(tokenId, loomGatewayAddress, loomWalletAddress, ethWalletAddress) {
        let mod = this;

        let p = new Promise((resolve, reject) => {
            var onReturn = function(err, owner) {
                if (err) {
                    // mod.waitApproveConfirmation(tokenId, loomGatewayAddress, loomWalletAddress, ethWalletAddress);
                    console.error("Occured an error while returning a token owner address from Blockchain");
                    console.error(err);
                    reject(err);
                }
                else {
                    // if (owner == loomWalletAddress || owner == ethWalletAddress) {
                    if (owner != loomParams.gatewayAddress) {
                        return mod.waitApproveConfirmation(loomParams, ethParams, otherParams);
                    }
                    else {
                        resolve(owner);
                    }
                };
            };
            
            setTimeout(function(){
                loomParams.heroToken.getApproved(otherParams.tokenId, onReturn);
                // cc.zz.loomInteractor.loomContract.ownerOf(tokenId, onOwner);
            }, 1000);
        });

        return p;
    },

    // Required parameters
    // client, tokenId,
    // ownerExtdevAddress, ethWalletAccountess,
    // tokenExtdevAddress, tokenRinkebyAddress, timeout
    depositTokenToGateway: function(loomParams, ethParams, otherParams ) {
    
      let mod = this;

      var p = new Promise((resolve, reject) => {

        var onApprove = function(err, tx){
        
            if (err) {
                cc.error(err);
                console.error("You rejected to transfer Token to Gateway!");
                reject(err);
            }
            else {
                console.warn("TODO: get gateway contract address");
                cc.zz.net.send(8004,[cc.zz.LoginData.getWallet(), otherParams.tokenId, 0, 1]);

                mod.waitApproveConfirmation(loomParams, ethParams, otherParams)
                .then(approved => {
                    try {
                        const { privateKey, publicKey } = Utils.generateKeyPair();

                        let loomAccount = Utils.generateAccountFromPublicKey({ chainId: loomParams.chainId, publicKey: publicKey});

                        let client = Utils.generateClient(loomParams);

                        const ethersProvider = new ethers.providers.Web3Provider(ethParams.currentProvider);
                        const signer = ethersProvider.getSigner()

                        const ethAccount = Utils.generateAccount(ethParams);

                        client.txMiddleware = [
                            new loom.NonceTxMiddleware(ethAccount, client), 
                            new loom.SignedEthTxMiddleware(signer) 
                        ];

                        const receiveSignedWithdrawalEvent = new Promise((resolve, reject) => {
                            let timer = setTimeout(
                                () => reject(new Error('Timeout while waiting for withdrawal to be signed')),
                                otherParams.timeOut
                            )
                            const listener = event => {
                                const ethTokenAccount = Utils.generateAccountFromString({ chainId: ethParams.chainId, walletAddress: ethParams.heroTokenAddress});
                                const ethWalletAccount = Utils.generateAccountFromString(ethParams);

                                if (
                                    event.tokenContract.toString() === ethTokenAccount.toString() &&
                                    event.tokenOwner.toString() === ethWalletAccount.toString()
                                ) {
                                    clearTimeout(timer)
                                    timer = null
                                    loomParams.gatewayContract.removeAllListeners(loom.Contracts.TransferGateway.EVENT_TOKEN_WITHDRAWAL)
                                    resolve(event)
                                }
                            }
                            loomParams.gatewayContract.on(loom.Contracts.TransferGateway.EVENT_TOKEN_WITHDRAWAL, listener)
                        });

                        let loomTokenAccount = Utils.generateAccountFromString({ chainId: loomParams.chainId, walletAddress: loomParams.heroTokenAddress });
                        // const tokenExtdevAddr = loom.Address.fromString(`${client.chainId}:${tokenExtdevAddress}`);

                        loomParams.gatewayContract.withdrawERC721Async(new BN(otherParams.tokenId), loomTokenAccount, ethAccount)
                        .then((tok)=>{
                            // Move progress bar to Step 2
                            cc.zz.net.send(8004,[cc.zz.LoginData.getWallet(), otherParams.tokenId, 0, 2]);
                            cc.zz.fire.fire(EventType.INCREMENT_POP_UP_PROGRESS);

                            receiveSignedWithdrawalEvent
                            .then(event => {
                                // resolve(loom.CryptoUtils.bytesToHexAddr(event.sig));
                                console.log(event);

                                mod.getSignatureFromGateway(loomParams, ethParams)
                                .then(receipt => {
                                    resolve(receipt);
                                })
                                .catch(e => {
                                    cc.error(e);
                                    // cc.zz.net.send(8004,[cc.zz.LoginData.getWallet(), tokenId, 0, 0]);
                                    reject(e);
                                })
                            })
                            .catch(e => {
                                reject(e);
                            });

                        })
                        .catch(e => {
                            console.error(e);
                            reject(e);
                        })
                    }
                    catch (e) {
                        console.error(e);
                        reject(e);
                    }
                })
                .catch(e => {
                    cc.error(e);
                    reject();
                });
            }
        };

        // get gatewayContract address
        // console.warn("Get gateway contract address");
        // console.error(gatewayContract);
        loomParams.heroToken.approve(loomParams.gatewayAddress, otherParams.tokenId, onApprove);
      });

      return p;
    },
    getSignatureFromGateway: function(loomParams, ethParams) {
      let mod = this;

      var p = new Promise((resolve, reject) => {
        try {
            // let chainId = cc.zz.LoginData.getCurrentBlockchainNetworkData().chainId;
            // const ownerAddr = loom.Address.fromString(`${chainId}:${ownerExtdevAddress}`)

            let loomAccount = Utils.generateAccountFromString(loomParams);

            loomParams.gatewayContract.withdrawalReceiptAsync(loomAccount)
            .then(receipt => {
                // Move progress bar to Step 2
                // cc.zz.fire.fire(EventType.INCREMENT_POP_UP_PROGRESS);
                let signatureHex = loom.CryptoUtils.bytesToHexAddr(receipt.oracleSignature)
                resolve(receipt);
            })
            .catch(e => {
                reject(e);
            });
        }
        catch (e) {
            console.error(e);
            reject(e);
        }
      });

      return p;
    },

    transferFromGateway: function(loomParams, ethParams, otherParams) {
        let _this = this;
        // console.log(parseInt(tokenId.toString()));
        // console.log(signature);

        let p = new Promise(function(resolve, reject){

            _this.withdrawTokenFromGateway( ethParams, { receipt: otherParams.receipt, gas: 350000 } )
            .then(tx => {
                // Note that tx may be not a valid
                if (tx != undefined) {
                    cc.zz.net.send(8004,[ethParams.walletAddress, 0, 0, 0]);

                    cc.zz.fire.fire(EventType.INCREMENT_POP_UP_PROGRESS);
                    cc.warn(`Token had been withdrawn from Ethereum Gateway. Switch to Login Scene from the outer world`)
                    console.warn(`ether tx hash: ${tx}`);

                    // alert("Token had been transferred. Game will restart to reset all data!");
                    // window.document.location.reload();
                    cc.director.preloadScene('login',(function(completedCount,totalCount){
                        // this.loadingProgress.string = "Loading scenes: "+completedCount+"/"+totalCount;
                    }).bind(this),(function(){
                        // this.loadingProgress.string = "Entering Main Scene"
                        cc.director.loadScene('login');
                    }).bind(this))
                    resolve('Exported successfully');
                }
                else {
                    reject('Rejected Fail');
                    console.error("Tx failed");
                    // cc.zz.fire.fire(EventType.POP_UP, cc.zz.Popup.TYPE.FAIL_WALLET_REJECTED.id, {});
                }
            })
            .catch(e => {
                reject('Rejected');
                // cc.zz.net.send(8004,[cc.zz.LoginData.getWallet(), tokenId, 0, 0]);
                // cc.error(e);
                // cc.zz.fire.fire(EventType.POP_UP, cc.zz.Popup.TYPE.FAIL_WALLET_REJECTED.id, {});
            })
        });

        return p;
    },
    resumeWithdrawal: function(loomParams, ethParams) {
        let _this = this;

        let p = new Promise(function(resolve, reject){

            _this.getSignatureFromGateway(loomParams, ethParams)
            .then(function(receipt) {
                return _this.transferFromGateway(loomParams, ethParams, { receipt });
            })
            .catch(e => {
                cc.error(e);
                reject(e);
                // cc.zz.net.send(8004,[cc.zz.LoginData.getWallet(), tokenId, 0, 0]);
                // cc.zz.fire.fire(EventType.POP_UP, cc.zz.Popup.TYPE.FAIL_WALLET_REJECTED.id, {});
            })
        });

        return p;
    },
    withdrawToken: function({ tokenId }, loomParams, ethParams ) {       // transfers token from loom to ethereum and restarts game
        try {
            // client = extdev.client

            // let tokenId = cc.zz.LoginData.getHeroID();

            let mod = this;

            cc.zz.fire.fire(EventType.POP_UP, cc.zz.Popup.TYPE.EXPORT_TOKEN.id, {});

            this.depositTokenToGateway(loomParams, ethParams, { tokenId: tokenId, timeOut: 120000})
            .then(receipt => {
                cc.zz.net.send(8004,[ethParams.walletAddress, tokenId, 0, 3]);
                cc.zz.fire.fire(EventType.INCREMENT_POP_UP_PROGRESS);
                mod.transferFromGateway(loomParams, ethParams, { receipt });
            })
            .catch(e => {
                cc.error(e);
                cc.zz.net.send(8004,[cc.zz.LoginData.getWallet(), tokenId, 1, 1]);
                setTimeout(function(){
                    cc.zz.net.send(8004,[cc.zz.LoginData.getWallet(), 0, 0, 0]);                    
                }, 1000);
                cc.zz.fire.fire(EventType.POP_UP, cc.zz.Popup.TYPE.FAIL_WALLET_REJECTED.id, {});
            });
        } 
        catch (err) {
          console.error(err)
          cc.zz.fire.fire(EventType.POP_UP, cc.zz.Popup.TYPE.FAIL_WALLET_REJECTED.id, {});
        } 
    },
    withdrawTokenFromGateway: function(ethParams, otherParams) {
      let mod = this;

      var p = new Promise((resolve, reject) => {
        ethParams.gatewayContract.withdrawAsync(otherParams.receipt, { gasLimit: otherParams.gas }).then(data => {
            console.log("Withdtawn");
            console.log(data);
            resolve(data);
        })
        .catch(e => {
            // if (e.toString() == "TypeError: Cannot read property 'local' of undefined") {
                // resolve("warning");
            // }
            // else {
                // console.log(e.toString());
                console.error(e);
                reject(e);
            // }
        });
      });

      return p;
    },

};

module.exports = gateway;