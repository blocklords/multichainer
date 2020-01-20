const Utils = require('./cryptoutils');

let account = {
    init: function(loomParams, ethParams) {

    },
    getTokenIdOnLoom(loomHeroToken, loomWalletAddress) {     // @param addr - loom chain address mapped to ethereum account

        var p = new Promise((resolve, reject) => {

            var onBalance = function(err, balance) {

                if (err) {
                    console.error(err);
                    reject(err);
                }
                else {
                    balance = parseInt(balance.toString());
                    if (!balance) {
                        cc.log("Token Balance: 0");
                        resolve(0);
                    }
                    else {
                        cc.log("Tokens amount: "+balance);
                        const tokens = []
                        // for (let i = 0; i < Math.min(total, 3); i++) {
                            // const tokenId = await contract.methods
                              // .tokenOfOwnerByIndex(addr, i)
                              // .call({ from: addr })
                            // tokens.push(tokenId)
                        // }

                        var onTokenId = function(err, tokenId) {
                            if (err) {
                                console.log(err);
                                reject(err);
                            }
                            else {
                                tokenId = parseInt(tokenId.toString());
                                if (!tokenId) {
                                    resolve("Invalid token id was given: "+tokenId);
                                }
                                else {
                                    console.log("Hero token id is: "+tokenId);
                                    console.log("Switch to hero profile");

                                    resolve(tokenId);
                                }
                            }

                            
                        };
                        loomHeroToken.tokenOfOwnerByIndex(loomWalletAddress, 0, onTokenId);
                    }
                }

            };

            loomHeroToken.balanceOf(loomWalletAddress, onBalance);

        });

        return p;
    },
};

module.exports = account;
