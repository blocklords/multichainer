const Network = require("@maticnetwork/meta/network");
const Matic = require("@maticnetwork/maticjs").default;
const Web3 = require('web3');
var Dagger = require("@maticnetwork/eth-dagger");


/**
 * Sidechains are initiated manually. Because sidechains rely on privatekeys
 * @param {[type]} multichainer [description]
 */
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

    this.web3 = new Web3(new Web3.providers.HttpProvider(MaticNetwork.RPC))

    // const from = config.from; // from address
    this.matic = new Matic({
      maticProvider: this.web3,
      parentProvider: MainNetwork.RPC,
      rootChain: MainNetwork.Contracts.RootChain,
      withdrawManager: MainNetwork.Contracts.WithdrawManagerProxy,
      depositManager: MainNetwork.Contracts.DepositManagerProxy,
      registry: MainNetwork.Contracts.Registry
    });

    this.multichainer.config.maticNetwork = MaticNetwork;
    this.multichainer.config.mainNetwork = MainNetwork;

    // establish a connection. this is an asynchronous function.
    // therefore has to be invoked from outside of constructor
    await this.matic.initialize();

    this.setEventStreamer();

    return this;
};

Provider.prototype.setWallet = async function(privateKey) {
    await this.matic.setWallet(privateKey);
};


Provider.prototype.setEventStreamer = function() {
  let dagger = new Dagger(this.multichainer.config.daggerEndpoint); // dagger server

  this.eventStreamer = dagger;
};

Provider.prototype.getEventStreamer = function() {
  return this.eventStreamer;
};


module.exports = Provider;