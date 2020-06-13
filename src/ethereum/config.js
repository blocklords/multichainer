/***********************************************************
 * List of supported Blockchains, Networks and Sidechains,
 * Version of the Multichainer library
 */

// Ropsten network configurations
let ropsten = {
	'endpoint': 'https://ropsten.infura.io/v3/d394db7cebfd490a9c79c81d23849188',
	'daggerEndpoint': 'wss://ropsten.dagger.matic.network'
}

// Goerli network configurations
let goerli = {
	'endpoint': 'https://goerli.infura.io/v3/d394db7cebfd490a9c79c81d23849188',
	'daggerEndpoint': 'wss://goerli.dagger.matic.network'
}


module.exports = {
    'ropsten': ropsten,
    'goerli': goerli
};