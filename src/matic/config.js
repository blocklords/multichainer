/***********************************************************
 * List of supported Blockchains, Networks and Sidechains,
 * Version of the Multichainer library
 */

// Matic Test-v3 network configurations
let test_v3 = {
	// Matic Test-v3 could be used as sidechain of ethereum ropsten
	'ethereum': {
		// testnet v3 that connected to ropsten is provided by matic.js
		// at https://static.matic.network/network/testnet/v3/index.json
		// everything is as is.
		'ropsten': {
		  	// used to set up matic network
			"network": "testnet",
			"version": "v3"
		}
	}
}

module.exports = {
    'test-v3': test_v3
};