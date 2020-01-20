const path = require('path')
const { Multichainer, Smartcontract, Account, Contract, Utils } = require('../src/index.js');

// Default parameters to test
const blockchain = 'ethereum';
const network = 'privatenet';
const sidechain = 'loom';
const deployerPrivateKeyPath = path.join(__dirname, '../private/extdev_private_key');

// LOOM testnet address of Walletless.sol contract
const walletlessAddress = '0x4D451Bb0492D3099f5D65c244a4a6534cb9e6DB1';		
// LOOM abi of Walletless.sol contract
const walletlessAbiPath = path.join(__dirname, '../abi/Walletless.json');		

// -------------------------------------------
// 1. Load the Multichainer. Always has to be instantiniated first
// -------------------------------------------
const mc = new Multichainer(blockchain, network, sidechain);
console.log("Multichainer Version: "+mc.version);


// --------------------------------------------
// 2. Account that will interact with Blockchain
// --------------------------------------------
const deployer = Account.fromPrivateKeyFile(deployerPrivateKeyPath, Account.TYPE.LOOM);
console.log("Contract Deployer: "+deployer.address);

const account = Account.getRandom(Account.TYPE.LOOM);
console.log("Random Account: "+account.address);


// -------------------------------------------
// 3. Node connection. Loom provider
// -------------------------------------------
const loomProvider = mc.getProvider();


// --------------------------------------------
// 4. Load Smartcontract
// --------------------------------------------
const walletless = Contract.fromAbiFile(walletlessAddress, walletlessAbiPath, loomProvider);
console.log("Walletless contract address: "+walletless.address)

// --------------------------------------------
// 5. Get Contract information: for example player id
// --------------------------------------------
const walletlessInteractor = new Smartcontract(walletless, account);

// Get Email of the Account
let result = walletlessInteractor.call('GetID', account.address.toString());
result.then(x => {
	if (x == false) {
		console.log('No ID found');
	}
	else {
		console.log('ID: '+x);
	}
})
.catch(e => {
	console.trace(e);
})

// todo remove when scripts will be turned into async methods
// process.exit(0);
