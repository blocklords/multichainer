const Utils = require('./cryptoutils');
const Multichainer = require('./multichainer.js');
const { Smartcontract: LoomSmartcontract } = require('./loom/index.js');

var Smartcontract = function(instance, account) {
    if (Multichainer.instance === undefined) {
        throw "Multichainer not instantiniated";
    }

    if (Multichainer.instance.blockchain == 'ethereum' && Multichainer.instance.sidechain == 'loom') {
        this.instance = new LoomSmartcontract(instance, account);

        return this;
    }
};


// Get some data from the Blockchain
Smartcontract.prototype.call = function () {
    if (this.instance === undefined) {
        throw "Smartcontract not instantiniated";
    }

    if (arguments.length == 0) {
        throw "Calling function name was not given";
    }

    // turn to real array
    let args = Array.from(arguments);

    return this.instance.call(args);
};


// Get some data from the Blockchain
Smartcontract.prototype.send = function () {
    if (this.instance === undefined) {
        throw "Smartcontract not instantiniated";
    }

    if (arguments.length == 0) {
        throw "Calling function name was not given";
    }

    // turn to real array
    let args = Array.from(arguments);

    return this.instance.send(args);
};

module.exports = Smartcontract;
