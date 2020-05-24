const Web3 = require('web3');

var Provider = function (multichainer) {
    this.multichainer = multichainer;

    if ( this.multichainer.config.endpoint === undefined ) {
        throw `No node endpoint was given for ${this.multichainer.name}-${this.multichainer.network}`;
    }

    this.web3 = new Web3(new Web3.providers.HttpProvider(this.multichainer.config.endpoint))

    return this;
};

Provider.prototype.get = function() {
    return this.web3;
};

module.exports = Provider;