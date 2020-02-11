Account:
	TYPE:	- List of supported accounts
		LOOM
		ETHEREUM
	Account.getRandom(accountType)		- generates a new Wallet

	Account.fromPrivateKeyFile(accountType, path) 	- wallet from the privatekey.

	Account.fromPrivateKeyFileWithProvider(accountType, path) 	- wallet from the privatekey and connected to the node.


Multichainer:
	getProvider(network, account=false)
		Gets the provider with optional account as the signer.

	getProviderWithSigner(network, signer, signerType)
		Gets the provider with the account as the signer.
		Differences from the getProvider is that, this method sets 
		the signer as the middleware.

		PS. use this function for the Sidechain connection, by
		providing the signer from the main chain.

		For example, if you want to connect to the Tron
		with the Ethereum account:

			let ethAccount = Account.fromPrivateKey(Account.TYPE.ETHEREUM, './../private/eth.key');

			let mc = new Multichainer('tron', 'testnet');

			// Provider that connected to the Tron Shasta network with your
			// ethereum wallet
			let provider = mc.getProviderWithSigner(ethAccount, Account.TYPE.ETHEREUM);

			let tronAccount = Account.getRandom(Account.TYPE.TRON);

			// Provider connected to the Tron Shasta network with random tron account
			let provider2 = mc.getProvider(tronAccount);

