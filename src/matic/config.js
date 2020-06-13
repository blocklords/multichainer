/***********************************************************
 * List of supported Blockchains, Networks and Sidechains,
 * Version of the Multichainer library
 */

// Matic Test-v3 network configurations
let mumbai = {
	// Matic Test-v3 could be used as sidechain of ethereum ropsten
	'ethereum': {
		// testnet v3 that connected to ropsten is provided by matic.js
		// at https://static.matic.network/network/testnet/v3/index.json
		// everything is as is.
		'goerli': {
		  	// used to set up matic network
			"network": "testnet",
			"version": "mumbai",
			'daggerEndpoint': 'https://mumbai-dagger.matic.today',
			'NFT_abi': 'ChildERC721',
			'TOKEN_abi': 'ChildERC20'
		}
	}
}

module.exports = {
    'mumbai': mumbai
};