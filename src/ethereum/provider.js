const Web3 = require('web3');
var Dagger = require("@maticnetwork/eth-dagger");

var Provider = function (multichainer) {
    this.multichainer = multichainer;

    if ( this.multichainer.config.endpoint === undefined ) {
        throw `No node endpoint was given for ${this.multichainer.name}-${this.multichainer.network}`;
    }

    this.web3 = new Web3(new Web3.providers.HttpProvider(this.multichainer.config.endpoint))

    this.setEventStreamer();

    return this;
};

Provider.prototype.setSigner = function(account) {
    this.web3.eth.accounts.wallet.add(account.defaultSigningKey);
    this.web3.eth.defaultAccount = account.address;
};

Provider.prototype.setEventStreamer = function() {
	this.eventStreamer = new Dagger(this.multichainer.config.daggerEndpoint); // dagger server
};

Provider.prototype.getEventStreamer = function() {
	return this.eventStreamer;
};

Provider.prototype.get = function() {
    return this.web3;
};

module.exports = Provider;