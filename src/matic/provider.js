const Network = require("@maticnetwork/meta/network");
const Matic = require("@maticnetwork/maticjs").default;

var Provider = function (multichainer) {
    this.multichainer = multichainer;
    return this;
};

Provider.prototype.get = function() {
    return this.web3;
};


Provider.prototype.init = async function () {
    const network = new Network(this.multichainer.config.network, this.multichainer.config.version);

    const MaticNetwork = network.Matic;
    const MainNetwork = network.Main;

    // const from = config.from; // from address
    this.matic = new Matic({
      maticProvider: MaticNetwork.RPC,
      parentProvider: MainNetwork.RPC,
      rootChain: MainNetwork.Contracts.RootChain,
      withdrawManager: MainNetwork.Contracts.WithdrawManagerProxy,
      depositManager: MainNetwork.Contracts.DepositManagerProxy,
      registry: MainNetwork.Contracts.Registry
    });

    // establish a connection. this is an asynchronous function.
    // therefore has to be invoked from outside of constructor
    await this.matic.initialize();
    // await matic.setWallet(config.privateKey);

    return this;
};

Provider.prototype.setWallet = async function(privateKey) {
    await this.matic.setWallet(privateKey);
};

module.exports = Provider;