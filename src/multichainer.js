// supported blockchain, network and sidechains
const BLOCKCHAINS = {
    'ethereum'  : 'ethereum',
    'eth'       : 'ethereum'    
};

const NETWORKS = {
    'testnet'   : 'testnet',
    'test'      : 'testnet',
    'privatenet': 'privatenet',
    'private'   : 'privatenet'
};

const SIDECHAINS = {
    'loom'      : 'loom'
};

// Version of the library
const VERSION = 'V.0.0.2';


var Multichainer = function (blockchain, network, sidechain = undefined) {
    if (Multichainer.instance !== undefined) {
        if (Multichainer.instance.blockchain == blockchain && Multichainer.instance.network == network && Multichainer.instance.sidechain == sidechain) {
            return Multichainer.instance;
        }
    }

    if (BLOCKCHAINS[blockchain] === undefined) {
        throw "Unsupported blockchain type: "+blockchain;
    }
    
    if (NETWORKS[network] === undefined) {
        throw "Unsupported network type: "+network;
    }

    if (sidechain !== undefined && SIDECHAINS[sidechain] === undefined) {
        throw "Unsupported sidechain type: "+sidechain;
    }

    this.blockchain = blockchain;
    this.network = network;
    this.sidechain = sidechain;

    this.version = VERSION;

    Multichainer.instance = this;

    return this;
};

// Static reference of Multichain
Multichainer.instance = undefined;


Multichainer.prototype.init = function(loomParams, ethParams) {
            this.loomParams = loomParams;
            this.ethParams = ethParams;

            let promise = new Promise(function(resolve, reject) {

                this.loomWeb3 = this.getProvider(loomParams, ethParams);

                this.Contract.init(loomParams, ethParams, this.loomWeb3).then(function(contracts) {
                
                    this.AddressMapper.init(loomParams, ethParams).then(function(addressMapper) {

                        this.contracts = contracts;
                        this.addressMapper = addressMapper;

                        this.loomParams.gatewayAddress = Utils.addressTypeToHex(contracts.loomGatewayContract.address);
                        this.loomParams.gatewayContract = contracts.loomGatewayContract;
                        this.loomParams.checkInContract = contracts.checkInContract;
                        this.loomParams.heroToken = contracts.loomHeroToken;
                        this.loomParams.itemContract = contracts.loomItemContract;

                        this.ethParams.gatewayContract = contracts.gatewayContract;
                        this.ethParams.gatewayAddress = contracts.gatewayContract.contract.address;
                        this.ethParams.heroToken = contracts.heroToken;

                        this.Item.init (this.loomParams);

                        resolve(this);

                    }.bind(this)).catch(errorAddressMapper => {
                        cc.error(errorAddressMapper);
                        reject(errorAddressMapper);
                    })
                
                }.bind(this)).catch(errorContract => {
                    cc.error(errorContract);
                    reject(errorContract);
                })
            }.bind(this));
            
            return promise;
};

Multichainer.prototype.getProvider = function(loomParams, ethParams) {
            const ethAccount = Utils.generateAccount(ethParams);

            const { privateKey, publicKey } = Utils.generateKeyPair();

            const client = Utils.generateClient(loomParams);

            client.txMiddleware = [
                new loom.NonceTxMiddleware(publicKey, client),
                new loom.SignedTxMiddleware(privateKey)
            ];

            const ethersProvider = new ethers.providers.Web3Provider( ethParams.currentProvider );
            const signer = ethersProvider.getSigner();

            let loomProvider = new loom.LoomProvider(client, privateKey)
            loomProvider.callerChainId = ethParams.chainId;
            loomProvider.setMiddlewaresForAddress(ethAccount.local.toString(), [
                new loom.NonceTxMiddleware(ethAccount, client),
                new loom.SignedEthTxMiddleware(signer)
            ]);

            // this.web3 = new Web3(loomProvider);
            return new Web3(loomProvider);
        };

module.exports = Multichainer;