//#############################
// Unit Tests of Item Contract:
// 		
// 		SetContractOwner(address contractOwner) external;
//		SetManager(address manager) external;
//		SetHeroToken(address heroToken) external;
//		SetWalletless(address walletless) external;
//		SetBroker(address broker) external;
//		SetCollector(address collector) external;
//
//  	SetItem(address ownerAddr, uint id, uint burnId) public returns(bool);
// 		Check the owner
//    
//		SetLockedItems(uint[5] memory ids, uint heroID) public returns (bool);
// 		Check the owner
//
// 		Grant ownership over items
//
//		GrantOwnership(address ownerAddr, uint id, uint8 sigV, bytes32 sigR, bytes32 sigS) public;
// 		Check the owner.
//
//		RefuseOwnership(address ownerAddr, uint id, uint8 sigV, bytes32 sigR, bytes32 sigS) public;
// 		Check the owner
//
//    	ReturnOwnership(address newOwner, uint id) public;
// 		Check the owner
//
//    	IsItemOwner(uint id, address owner) external view returns(bool);
//    	IsItemExist(uint id) external view returns(bool);
//
//    	LockItems(uint[5] memory ids, uint heroID) public;
// 		Get locked items
//
//    	UnlockItems(uint heroId) public;
//    	GetLockedItems(uint heroID) public view returns(address, uint, uint, uint, uint, uint);
//
//    	GiveBack(uint itemID, address ownerAddr, uint8 memory sigV, bytes32 memory sigR, bytes32 memory sigS) public;
// 		Check item owner (Should be equal to 0)


//#############################
// const 	path 					= require('path')
// const 	{ Multichainer, Smartcontract, Account, Contract, Utils } = require('../../src/index.js');
// const 	ethUtil 				= require('ethereumjs-util');
// const 	ethAbi 					= require('ethereumjs-abi');
// var 	Web3 					= require('web3');
// var 	web3 					= new Web3(Web3.givenProvider || "ws://localhost:8546");
// const 	loom 					= require('loom-js');
// const 	nacl 					= require('tweetnacl');


let setAddresses = function (settings) {
	var p = new Promise(function(resolve, reject) {
		setContractOwner(settings).then (x => {
			console.log("	1. Contract Owner address set");

			setHeroToken(settings).then (x => {
				console.log("	2. Hero Token Address set");

				setWalletless(settings).then (x => {
					console.log("	3. Walletless address set");

					setBroker(settings).then (x => {
						console.log("	4. Broker address set");
			
						setCollector(settings).then (x => {
							console.log("	5. Collector address set");

							resolve(x);	
						}).catch(x => {
							console.error("Failed to set collector address");
							console.trace(x);
							reject(x);			
						})				
					}).catch(x => {
						console.error("Failed to set Broker address:");
						console.trace(x);
						reject(x);			
					})			
				}).catch(x => {
					console.error("Failed to set walletless address:");
					console.trace(x);
					reject(x);			
				})		
			}).catch(x => {
				console.error("Failed to set hero Token address:");
				console.trace(x);
				reject(x);			
			})
		}).catch(x => {
			console.log("   2. Failed to set contract owner:");
			reject(x);			
		})
	});

	return p;
}
// Required parameters:
//		settings.contractOwner 			(address)
//		settings.itemContractInteractor (object)
let setContractOwner = function (settings) {
	var p = new Promise(function(resolve, reject) {
		if (typeof(settings) !== "object") {
			reject("Settings were not given");
			return;
		}

		if (settings.itemContractInteractor == null || 
			settings.itemContractInteractor == undefined) {
			reject("Item Contract not set");
			return;
		}

		// validate the existance of the address
		if (typeof(settings.contractOwner) !== "string") {
			reject("settings.contractOwner address not found");
			return;
		}

		let result = settings.itemContractInteractor.send('SetContractOwner', settings.contractOwner,
			settings.contractOwnerSign.v,
			settings.contractOwnerSign.r,
			settings.contractOwnerSign.s);
		result.then(x => {resolve(x);}).catch(x => {
			reject(x);
		});
	});

	return p;
};
// Required parameters:
//		settings.heroToken 				(address)
//		settings.itemContractInteractor (object)
let setHeroToken = function (settings) {
	var p = new Promise(function(resolve, reject) {
		if (typeof(settings) !== "object") {
			reject("Settings were not given");
			return;
		}

		if (settings.itemContractInteractor == null || 
			settings.itemContractInteractor == undefined) {
			reject("Item Contract not set");
			return;
		}

		// validate the existance of the address
		if (typeof(settings.heroToken) !== "string") {
			reject("settings.heroToken address not found");
			return;
		}

		let result = settings.itemContractInteractor.send('SetHeroToken', settings.heroToken,
			settings.heroTokenSign.v,
			settings.heroTokenSign.r,
			settings.heroTokenSign.s);
		result.then(x => {resolve(x);}).catch(x => {reject(x);});
	});

	return p;
};
// Required parameters:
//		settings.walletlessAddress		(address)
//		settings.itemContractInteractor (object)
let setWalletless = function (settings) {
	var p = new Promise(function(resolve, reject) {
		if (typeof(settings) !== "object") {
			reject("Settings were not given");
			return;
		}

		if (settings.itemContractInteractor == null || 
			settings.itemContractInteractor == undefined) {
			reject("Item Contract not set");
			return;
		}

		// validate the existance of the address
		if (typeof(settings.walletlessAddress) !== "string") {
			reject("settings.walletlessAddress address not found");
			return;
		}

		let result = settings.itemContractInteractor.send('SetWalletless', settings.walletlessAddress,
			settings.walletlessSign.v,
			settings.walletlessSign.r,
			settings.walletlessSign.s);
		result.then(x => {resolve(x);}).catch(x => {reject(x);});
	});

	return p;
};
// Required parameters:
//		settings.brokerAddress			(address)
//		settings.itemContractInteractor (object)
let setBroker = function (settings) {
	var p = new Promise(function(resolve, reject) {
		if (typeof(settings) !== "object") {
			reject("Settings were not given");
			return;
		}

		if (settings.itemContractInteractor == null || 
			settings.itemContractInteractor == undefined) {
			reject("Item Contract not set");
			return;
		}

		// validate the existance of the address
		if (typeof(settings.brokerAddress) !== "string") {
			reject("settings.brokerAddress address not found");
			return;
		}

		let result = settings.itemContractInteractor.send('SetBroker', settings.brokerAddress,
			settings.brokerSign.v,
			settings.brokerSign.r,
			settings.brokerSign.s);
		result.then(x => {resolve(x);}).catch(x => {reject(x);});
	});

	return p;
};
// Required parameters:
//		settings.collectorAddress 		(address)
//		settings.itemContractInteractor (object)
let setCollector = function (settings) {
	var p = new Promise(function(resolve, reject) {
		if (typeof(settings) !== "object") {
			reject("Settings were not given");
			return;
		}

		if (settings.itemContractInteractor == null || 
			settings.itemContractInteractor == undefined) {
			reject("Item Contract not set");
			return;
		}

		// validate the existance of the address
		if (typeof(settings.collectorAddress) !== "string") {
			reject("settings.collectorAddress address not found");
			return;
		}

		let result = settings.itemContractInteractor.send('SetCollector', settings.collectorAddress,
			settings.collectorSign.v,
			settings.collectorSign.r,
			settings.collectorSign.s);
		result.then(x => {resolve(x);}).catch(x => {reject(x);});
	});

	return p;
};

// Second batch of Item Contract Tests
// // Set items

//     function SetItem(address ownerAddr, uint id, uint burnId) public returns(bool);
// // Check the owner
//     function SetLockedItems(uint[5] memory ids, uint heroID) public returns (bool);
// // Check the owner

// // Grant ownership over items

//     function GrantOwnership(address ownerAddr, uint id, uint8 sigV, bytes32 sigR, bytes32 sigS) public;
// // Check the owner.
//     function RefuseOwnership(address ownerAddr, uint id, uint8 sigV, bytes32 sigR, bytes32 sigS) public;
// // Check the owner
//     function ReturnOwnership(address newOwner, uint id) public;
// // Check the owner
//     function IsItemOwner(uint id, address owner) external view returns(bool);
//     function IsItemExist(uint id) external view returns(bool);

//     function LockItems(uint[5] memory ids, uint heroID) public;
// // Get locked items
//     function UnlockItems(uint heroId) public;
// // Get locke items
//     function GetLockedItems(uint heroID) public view returns(address, uint, uint, uint, uint, uint);

//     function GiveBack(uint itemID, address ownerAddr, uint8 memory sigV, bytes32 memory sigR, bytes32 memory sigS) public;
// // Check item owner (Should be equal to 0)

module.exports = {
	setAddresses: 		setAddresses,	
	setContractOwner: 	setContractOwner,	
	setHeroToken: 		setHeroToken,	
	setBroker: 			setBroker,	
	setCollector: 		setCollector,	
};
