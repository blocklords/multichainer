const Utils = require('./cryptoutils');
const Multichainer = require('./multichainer.js');

/**
 *  Smartcontract module is used to interact with Smartcontract methods and properties
 *
 */
var Smartcontract =  function (blockchain, network, sidechain = undefined) {
    this.main = new Multichainer(blockchain, network, sidechain);

    this.waitItemAppearance = function(itemId, timeOut) {     // @param addr - loom chain address mapped to ethereum account
            if ( timeOut === undefined ) {
                timeOut = 180;  // 3 mins
            }

            let counter = 0;

            
            let _this = this;

            var p = new Promise(function(resolve, reject){
                if (_this.timer != undefined) {
                    reject(false);
                }
                _this.timer = setInterval(function() {
                    var onResponse = function(err, isExist) {
                        if (err) {
                            console.error(err);
                            reject(err);
                        }
                        else {
                            if (!isExist) {
                                if (counter >= timeOut) {
                                    clearInterval(_this.timer);
                                    _this.timer = undefined;
                                    cc.log("Timeout while waiting for checking for item existence");
                                    reject(false);
                                }
                                else {
                                    cc.log("Item doesn't exists yet, "+counter+"/"+timeOut);
                                    counter++;
                                }
                            }
                            else {
                                console.log("Item exists");
                                clearInterval(_this.timer);
                                _this.timer = undefined;
                                resolve(true);
                            }
                        }

                    };

                    if (_this.contract == undefined) {
                        clearInterval(_this.timer);
                        _this.timer = undefined;
                        reject("Item contract has is not initialized in Item Contract Interactor");
                    }
                    this.contract.isItemExist(itemId, onResponse);
                }.bind(this), 1000);
            }.bind(this));

            return p;
    };

    return this;
}

module.exports = Smartcontract;
