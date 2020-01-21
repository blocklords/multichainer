const path = require('path')
const { Multichainer, Smartcontract, Account, Contract, Utils } = require('../src/index.js');
const { Eth } = require('web3');

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

console.log('\n\n');
console.log('--------------------------');
console.log('  Returning ID of a walletless account from blockchain')
console.log('--------------------------\n');

// Get Email of the Account
// let result = walletlessInteractor.call('GetID', account.address.toString());
// result.then(x => {
// 	if (x == false) {
// 		console.log('No ID found');
// 	}
// 	else {
// 		console.log('ID: '+x);
// 	}
// })
// .catch(e => {
// 	console.trace(e);
// })


// --------------------------------------------
// 6. Offline sign transactions
// --------------------------------------------
let loom = require('loom-js');

let message = 'Sample Message';
messageHex = Buffer.from(message, 'utf8').toString('hex');
messageBytes = loom.CryptoUtils.hexToBytes(messageHex);

console.log(loom.CryptoUtils.sign(messageBytes, deployer.privateKey));



const TXTYPE_HASH_TEMPORARY = '0x626fa3909ffec8617c25e36eb89d32ac3e7acd5bf7238d2c5f269cceed4f2ed1';

const EIP712DOMAINTYPE_HASH = '0xd87cd6ef79d4e2b95e15ce8abf732db51ec771f1ca2edccf22a46c729ac56472';

const NAME_HASH_PRIMARY = '0x01d766ba82427b4e83818bd3a2047efa2184e836a10a9c6dbf489a6b2c81949f'

const VERSION_HASH_PRIMARY = '0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6';

const chainId = 9545242630824;

const SALT = '0xfbbbedd42a3ca2dc0ec761a1d7ca7eaea72b97aa3f7c46c3a7cd20be0ae6c8dc';

// DOMAIN_SEPARATOR_TEMPORARY = keccak256(abi.encode(EIP712DOMAINTYPE_HASH,
                                                // NAME_HASH_PRIMARY,
                                                // VERSION_HASH_PRIMARY,
                                                // chainId,
                                                // walletlessAddress,
                                                // SALT));
console.log(Eth);

// var txInputHash = keccak256(abi.encode(TXTYPE_HASH_TEMPORARY, account, id, nonce));
// var totalHash = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR_TEMPORARY, txInputHash));

// todo remove when scripts will be turned into async methods
// process.exit(0);
