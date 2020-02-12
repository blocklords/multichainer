const path = require('path')
const { Multichainer, Smartcontract, Account, Contract, Utils } = require('../../src/index.js');
const ethUtil = require('ethereumjs-util');
const ethAbi = require('ethereumjs-abi');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider(`rinkeby.infura.io/v3/d394db7cebfd490a9c79c81d23849188`));
const loom = require('loom-js');
const nacl = require('tweetnacl');
// const ethers = require('ethers');
const { OfflineWeb3Signer } = require('loom-js/dist/solidity-helpers');

web3.currentProvider.isMetaMask = true;
// let ethProvider = new ethers.providers.Web3Provider(web3.currentProvider);
// let ethProvider = ethers.getDefaultProvider('rinkeby');

// Default parameters to test
const blockchain = 'ethereum';
const network = 'privatenet';
const sidechain = 'loom';
const gameOwnerPrivateKeyPath = path.join(__dirname, '../../private/game_owner_private_key');
const testerPrivateKeyPath = path.join(__dirname, '../../private/tester_private_key');
// const samplePrivateKeyPath = path.join(__dirname, '../private/sample_private_key');


// -------------------------------------------
// 	SmartContracts
//		Loom Smartcontract Parameters
// -------------------------------------------

// const walletlessAddress = '0x786e599cA97e726675f37daaDf3a8f1E8D892Ef4';	

const walletlessAddress = '0x458183c8AAc51a33f1391b5405da1Bd8758b79Ed';	
const walletlessAbiPath = path.join(__dirname, '../../abi/Walletless.json');		

// const itemContractAddress = '0x543d3BDbC6c242c6A94AcbACc82CeeA1f181591e';
const itemContractAddress = '0x3b9927cf7bD90318d0774F115Af457Eb4FD04f74';
const itemContractAbiPath = path.join(__dirname, '../../abi/ItemContract.json');

const collectorAddress = '0x6aa286a89FbD9131a09f828e143285D7EBd0Fddf';
const collectorAbiPath = path.join(__dirname, '../../abi/Collector.json');

const heroToken = '0x9eEd56f859E278b4720248EE173A3B7a9124D701';
const heroTokenAbiPath = path.join(__dirname, '../../abi/HeroToken.json');
	

// -------------------------------------------
// 1. Load the Multichainer. Always has to be instantiniated first
// -------------------------------------------
	const mc = new Multichainer(blockchain, network, sidechain);

	console.log("\n");
	console.log("******************************************************************");
	console.log("1. Load the Multichainer. Always has to be instantiniated first");
	console.log("******************************************************************\n");
	console.log("   Loaded successfully. Multichainer Version: "+mc.version);


// --------------------------------------------
// 2. Account that will interact with Blockchain
// --------------------------------------------

	console.log("\n");
	console.log("**********************************************");
	console.log("2. Account that will interact with Blockchain");
	console.log("**********************************************\n");

	const gameOwner = Account.fromPrivateKeyFileWithProvider(gameOwnerPrivateKeyPath, Account.TYPE.ETHEREUM, web3);
	console.log("   Game Developer Account: "+gameOwner.address);

	const account = Account.fromPrivateKeyFile(testerPrivateKeyPath, Account.TYPE.ETHEREUM, web3);
	console.log("   Tester Account: "+account.address);

	const brokerAccount = gameOwner;
	console.log("   Broker Account: (game owner for now) "+brokerAccount.address);

// -------------------------------------------
// 3. Node connection. Loom provider
// -------------------------------------------
	const random = Account.getRandom(Account.TYPE.LOOM);

	// const loomProvider = mc.getProviderWithSigner(gameOwner, Account.TYPE.ETHEREUM);
	const loomProvider = mc.getProvider(random);

// --------------------------------------------
// 4. Load Smartcontract
// --------------------------------------------
const walletless = Contract.fromAbiFile(walletlessAddress, walletlessAbiPath, loomProvider);
const collector = Contract.fromAbiFile(collectorAddress, collectorAbiPath, loomProvider);
const itemContract = Contract.fromAbiFile(itemContractAddress, itemContractAbiPath, loomProvider);
// console.log("\nWalletless contract address: "+walletless.address)

// --------------------------------------------
// 5. ItemContract unit test
// --------------------------------------------
const walletlessInteractor = new Smartcontract(walletless, random);
const itemContractInteractor = new Smartcontract(itemContract, random);

console.log('\n\n');
console.log("*********************************************************");
console.log(' 5. E.g. Unit test of Item Contracts')
console.log("*********************************************************\n");

console.log("	Walletless contract address: "+walletless.address)
console.log("	Item contract address: "+itemContract.address)

let setAddressTypes = [
    'address',
    'uint'
];

let contractOwnerSignValues = [
	gameOwner.address,
	6
];

let contractOwnerHash = ethUtil.bufferToHex(ethAbi.soliditySHA3(
	setAddressTypes,
	contractOwnerSignValues
));

let contractOwnerSign = gameOwner.sign(contractOwnerHash);


let heroTokenValues = [
	heroToken,
	7
];

let heroTokenHash = ethUtil.bufferToHex(ethAbi.soliditySHA3(
	setAddressTypes,
	heroTokenValues
));

let heroTokenSign = gameOwner.sign(heroTokenHash);


let walletlessValues = [
	walletlessAddress,
	8
];

let walletlessHash = ethUtil.bufferToHex(ethAbi.soliditySHA3(
	setAddressTypes,
	walletlessValues
));

let walletlessSign = gameOwner.sign(walletlessHash);


let brokerValues = [
	gameOwner.address,
	9
];

let brokerHash = ethUtil.bufferToHex(ethAbi.soliditySHA3(
	setAddressTypes,
	brokerValues
));

let brokerSign = gameOwner.sign(brokerHash);


let collectorValues = [
	collectorAddress,
	10
];

let collectorHash = ethUtil.bufferToHex(ethAbi.soliditySHA3(
	setAddressTypes,
	collectorValues
));

let collectorSign = gameOwner.sign(collectorHash);

let itemID = 1;
let itemOwnerAddress = account.address;
let itemSettingTypes = [
    'address',		// item owner address
    'uint',			// item ID
    'uint'			// nonce
];
let itemSettingValues = [
	itemOwnerAddress,
	itemID,
	11
];

let itemSettingHash = ethUtil.bufferToHex(ethAbi.soliditySHA3(
	itemSettingTypes,
	itemSettingValues
));

let itemSettingSign = gameOwner.sign(itemSettingHash);



let settings = {
	itemContractInteractor: itemContractInteractor,

	contractOwnerSign: contractOwnerSign,
	heroTokenSign: heroTokenSign,
	walletlessSign: walletlessSign,
	brokerSign: brokerSign,
	collectorSign: collectorSign,
	itemSettingSign: itemSettingSign,

	itemID: itemID,
	itemOwnerAddress: itemOwnerAddress,
	burnID: 0,

	contractOwner: gameOwner.address.toString(),
	heroToken: heroToken,
	walletlessAddress: walletlessAddress,
	brokerAddress: brokerAccount.address,
	collectorAddress: collectorAddress
};
let itemContractTest = require('./itemcontract.js');


function hexToAscii(str1) {
	var hex  = str1.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str;
 }

let txHash = '0x1005e93cb4e37d86218552b29c51ed729d2537e243d429446741b67e7422f0ca';
// console.log(loomProvider.eth);

console.log("Settings Addresses on the Smartcontract: ");
// loomProvider.eth.getTransaction(txHash).then(x => {
itemContractTest.setAddresses(settings).then(x => {
	console.log("All addresses were set");
	console.log(x);
	console.log("------------------------------");
	console.log("Set some item");
	itemContractTest.setItem(settings).then(itemSettingRes => {
		console.log("Some item has been set");
		console.log(itemSettingRes);
	}).catch(e => {
		console.error(e);
	})
// 	// x.from = gameOwner.address;
// 	// loomProvider.eth.call(x, x.blockNumber).then(code => {
// 		// console.log(code);
// 		// console.log(hexToAscii(code.substr(138)));
// 	// }).catch(e => {
// 		// console.error(e);
// 	// });
}).catch(e => {
	console.error(e);
});

// Get Email of the Account

// // let result = walletlessInteractor.call('GetID', account.address.toString());
// let result = walletlessInteractor.call('GetID', '0x407CF07Bbc1A20EC3889bE7881Be34BF089162E9');
let result = itemContractInteractor.call('nonce');
	// ,gameOwner.address.toString()); 
	// 0x1b,
	// contractOwnerSign.r,
	// contractOwnerSign.s
// );
result.then(x => {
	if (x == false) {
		console.log('Digest wasnt returned');
	}
	else {
		console.log(contractOwnerSign);
		console.log('Digest:');
		console.log(x);
	}
})
.catch(e => {
	console.trace(e);
})
