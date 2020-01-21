const Utils = require('./cryptoutils');

var Smartcontract = function(contract, account) {
    this.contract = contract;
    this.account = account;

    return this;
};


// Get some data
Smartcontract.prototype.call = function (arguments) {
    let name = arguments[0];

    let method = this.contract.instance.methods[name];

    // TODO change the function to invoke methods directly from the top smartcontract module
   	if (method === undefined) {
   		console.trace("Unsupported method name "+name);
      process.exit(1);
   	}

   	let parameters = arguments.slice(1);
    if (parameters.length > 0) {
      return method(...parameters).call({ from: this.account.address.toString() });
   	}
    return method().call({ from: this.account.address.toString() });
};

module.exports = Smartcontract;
