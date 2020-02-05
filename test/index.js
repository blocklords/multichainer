const path = require('path')
const { Multichainer, Smartcontract, Account, Contract, Utils } = require('../src/index.js');
const ethUtil = require('ethereumjs-util');
const ethAbi = require('ethereumjs-abi');
var Web3 = require('web3');
var web3 = new Web3(Web3.givenProvider || "ws://localhost:8546");
const loom = require('loom-js');
const nacl = require('tweetnacl');

// Default parameters to test
const blockchain = 'ethereum';
const network = 'privatenet';
const sidechain = 'loom';
const deployerPrivateKeyPath = path.join(__dirname, '../private/deployer_private_key');
const samplePrivateKeyPath = path.join(__dirname, '../private/sample_private_key');

// LOOM testnet address of Walletless.sol contract
// const walletlessAddress = '0x786e599cA97e726675f37daaDf3a8f1E8D892Ef4';	
walletlessAddress = '0xD1a5D66C749EA7bF61fDDB1d75f623C36321BBC0';	
// LOOM abi of Walletless.sol contract
const walletlessAbiPath = path.join(__dirname, '../abi/Walletless.json');		

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

const deployer = Account.fromPrivateKeyFile(deployerPrivateKeyPath, Account.TYPE.LOOM);
console.log("   Contract Deployer: "+deployer.address);

// const account = Account.getRandom(Account.TYPE.LOOM);
// console.log("   Random Account: "+account.address);

const account = Account.fromPrivateKeyFile(samplePrivateKeyPath, Account.TYPE.LOOM);
console.log("   Sample account: "+account.address);


// -------------------------------------------
// 3. Node connection. Loom provider
// -------------------------------------------
const loomProvider = mc.getProvider(account);


// --------------------------------------------
// 4. Load Smartcontract
// --------------------------------------------
const walletless = Contract.fromAbiFile(walletlessAddress, walletlessAbiPath, loomProvider);
// console.log("\nWalletless contract address: "+walletless.address)

// --------------------------------------------
// 5. Get Contract information: for example player id
// --------------------------------------------
const walletlessInteractor = new Smartcontract(walletless, account);

console.log('\n\n');
console.log("*********************************************************");
console.log(' 5. E.g. Return ID of a walletless account from blockchain')
console.log("*********************************************************\n");

console.log("    Walletless contract address: "+walletless.address)

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


// --------------------------------------------
// 6. Offline sign transactions
// --------------------------------------------
// let loom = require('loom-js');

// let message = 'Sample Message';
// messageHex = Buffer.from(message, 'utf8').toString('hex');
// messageBytes = loom.CryptoUtils.hexToBytes(messageHex);

// console.log(loom.CryptoUtils.sign(messageBytes, deployer.privateKey));


/* Matching with the Log Hash */

/* 1. EIP-712 title: keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)")  */
let EIP_712_DOMAIN_PROTOTYPE 	= "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)";
let EIP_712_DOMAIN_TYPE 		= ethUtil.bufferToHex(ethUtil.keccak256(EIP_712_DOMAIN_PROTOTYPE));


/*------------------------------------*/
/* DOMAIN SEPARATOR */
/*------------------------------------*/

/* 2. Name of the function keccak256('"Update Primary Address"') */
let UPDATING_TEMPORARY_NAME 		= "Update Temporary Address";
let UPDATING_TEMPORARY_NAME_HASH 	= ethUtil.bufferToHex(ethUtil.keccak256(UPDATING_TEMPORARY_NAME));

/* 3. Version: keccak256('1') */
let VERSION 					= "1";
var VERSION_HASH 				= ethUtil.bufferToHex(ethUtil.keccak256(VERSION));

/* 4. */
var chainId = 9545242630824;

/* 5. */
var contractAddress = walletlessAddress;

/* Define Domain Separator */
let EIP_712_DOMAIN_SCHEME = [
	'bytes32',
    'bytes32',
    'bytes32',
    'uint256',
    'address',
];

let separatorValues = [
	EIP_712_DOMAIN_TYPE, 
	UPDATING_TEMPORARY_NAME_HASH, 
	VERSION_HASH, 
	chainId, 
	// contractAddress
	'0x5E72914535f202659083Db3a02C984188Fa26e9f'
];

var separatorAbi = ethAbi.rawEncode(EIP_712_DOMAIN_SCHEME, separatorValues);
let DOMAIN_SEPARATOR 				= ethUtil.bufferToHex(ethUtil.keccak256(separatorAbi));


/*------------------------------------*/
/* AT THE SAME TIME:  */
/* message  */
/*------------------------------------*/

/* 1. Temporary account */
let signer = account.address.toString();

/* 2. ID */
let ID = 'ahmetson@zoho.com';
let ID_HASH = ethUtil.bufferToHex(ethUtil.keccak256(ID));

/*------------------------------------*/
/* message  */
/*------------------------------------*/

let TEMPORARY_TXTYPE = "UpdateTemporary(address temporary,string memory id)";
let TEMPORARY_TXTYPE_HASH = ethUtil.bufferToHex(ethUtil.keccak256(TEMPORARY_TXTYPE));

// message to be signed:
// 1. funcNameHash,  2. signer address,  3. idHash
// message bytes are generated by abi encoding in the format:
// bytes32,address,bytes32
let temporaryTypes = [
    'bytes32',
    'address',
    'bytes32'
];

let temporaryValues = [
	TEMPORARY_TXTYPE_HASH,
	signer, 
	ID_HASH 
];

var temporaryAbi 				= ethAbi.rawEncode(temporaryTypes, temporaryValues);
let TEMPORARY_HASH 				= ethUtil.bufferToHex(ethUtil.keccak256(temporaryAbi));

/*------------------------------------*/
/* Epopeya  */
/*------------------------------------*/

// message that will given to privatekey.
// Hash of 3 parameters:
// 0x1901,  domain separator, message hash

let prefix = 0x1901;
let prefixAbi = '0x1901';

let digestTypes = [
	'bytes2',
    'bytes32',
    'bytes32'
];

let digestValues = [
	prefixAbi, 
	DOMAIN_SEPARATOR, 
	TEMPORARY_HASH 
];


let DIGEST = ethAbi.soliditySHA3(
	digestTypes,
	digestValues
);

var digestAbi 				= ethAbi.rawEncode(digestTypes, digestValues);
let DIGEST_2 				= ethUtil.bufferToHex(ethUtil.keccak256(digestAbi));


console.log("\n");
console.log("***************************************");
console.log("6. Offline signing messages");
console.log("***************************************\n");

console.log('   Signing address: '+account.address);
console.log('');
console.log('   Domain separator parameters (domainHash, nameHash, versionHash, chainId, contractAddress):');
console.log('   1. EIP-712 Type:     '+EIP_712_DOMAIN_TYPE)
console.log('   2. Name:             '+UPDATING_TEMPORARY_NAME_HASH)
console.log('   3. Version:          '+VERSION_HASH)
console.log('   4. Chain ID:         '+chainId)
console.log('   5. Contract Address: '+contractAddress);
console.log('');

console.log('   Encoded using ABI: '+ethUtil.bufferToHex(separatorAbi));
console.log('   Domain Separator Hash 1: '+DOMAIN_SEPARATOR)
console.log('')

console.log('   Temporary Message (temporary tx type hash, address, ID hash):');
console.log('   1. Temporary Tx type Hash: '+TEMPORARY_TXTYPE_HASH)
console.log('   2. Address:                '+signer)
console.log('   2. ID:                     "'+ID+'"  '+ID_HASH)
console.log('')

console.log('   Temporary Message Abi:  '+ethUtil.bufferToHex(temporaryAbi));
console.log('   Temporary Message Hash: '+TEMPORARY_HASH);
console.log('')

console.log('   Digest (Prefix, Domain Separator, Temporary Message');
console.log('   Digest  Hash:            '+ethUtil.bufferToHex(DIGEST));
console.log('   Digest2 Hash:            '+DIGEST_2);
console.log('')

// let signingKey = loom.CryptoUtils.bytesToHex(account.privateKey);
// console.log(signingKey);

// const sig = ethUtil.ecsign(DIGEST, Buffer.from(signingKey, 'hex'));

// var signedObject = web3.eth.sign(digestHex.substr(2), signingKey);
// console.log(signedObject);
// console.log(sig);
// console.log('Signer:', web3.eth.accounts.recover(signedObject));

// console.log(loom.CryptoUtils.bytesToHexAddr(account.publicKey));


// console.log(digestHex.substr(2));
// console.log(ethUtil.bufferToHex(ethUtil.keccak256(DIGEST)));

let sampleSign = loom.CryptoUtils.sign(DIGEST, account.privateKey);
let deployerSign = loom.CryptoUtils.sign(DIGEST, deployer.privateKey);
// converting buffer to bytes will result a same signature
// let digestHex = ethUtil.bufferToHex(DIGEST);
// let digestBytes = loom.CryptoUtils.hexToBytes(digestHex);
// let signedMessage = loom.CryptoUtils.sign(digestBytes, account.privateKey);

// returns signature with a message data
// signedMessage = nacl.sign(DIGEST, account.privateKey);
// returns signed public key of the signature with a message data
// console.log(loom.CryptoUtils.bytesToHex(nacl.sign.open(signedMessage, account.publicKey)));


// returns signature without a message
// let signedMessage = nacl.sign.detached(DIGEST, account.privateKey);
// console.log(loom.CryptoUtils.bytesToHex(signedMessage));

// console.log('Signer:', web3.eth.accounts.recover(DIGEST, signedObject));
// let verified = nacl.sign.detached.verify(DIGEST, signedMessage, account.publicKey);

let sampleSignString = "0x"+loom.CryptoUtils.bytesToHex(sampleSign)+"1c";
let deployerSignString = "0x"+loom.CryptoUtils.bytesToHex(deployerSign)+"1c";
let signedSampleObject = ethUtil.fromRpcSig(sampleSignString);
let deployerSampleObject = ethUtil.fromRpcSig(deployerSignString);



console.log("\n");
console.log("***************************************");
// console.log("7. Invoke a multisig method");
console.log("7. Debug the signing message:");
console.log("***************************************\n");


// todo remove when scripts will be turned into async methods
// process.exit(0);

let sigV = signedSampleObject.v;//, deployerSampleObject.v];
let sigR = signedSampleObject.r;//, deployerSampleObject.r];
let sigS = signedSampleObject.s;//, deployerSampleObject.s];

// address temporary, string memory ID, uint8[] memory sigV, bytes32[] memory sigR, bytes32[] memory sigS
result = walletlessInteractor.send('UpdateTemporary', account.address.toString(), ID, sigV, sigR, sigS);
result.then(tx => {
	if (tx == false) {
		console.log('Failed:');
		console.log(tx);
	}
	else {
		console.log(tx);
		console.log('Success: (Message Digest)');
		console.log(tx.events.logBytes32.returnValues);
	}
})
.catch(e => {
	console.trace(e);
})
