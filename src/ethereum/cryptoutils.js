
let cryptoutils = {
    generateAccount(params) {
        // return new loom.Address(
            // params.chainId,
            // loom.LocalAddress.fromHexString(params.walletAddress)
        // )
    },
    generateAccountFromPublicKey(params) {
        // return new loom.Address(
            // params.chainId,
            // loom.LocalAddress.fromPublicKey(params.publicKey)
        // )
    },
    generateAccountFromString(params) {
        // return loom.Address.fromString(`${params.chainId}:${params.walletAddress}`);
    },
    generateKeyPair() {
        // const privateKey = loom.CryptoUtils.generatePrivateKey();
        // const publicKey = loom.CryptoUtils.publicKeyFromPrivateKey(privateKey);
        
        // return {privateKey, publicKey};
    },

    generateClient(params) {
        // return new loom.Client(params.chainId, params.writeUrl, params.readUrl);
    },

    addressTypeToString(address) {
        // return address.toString();
    },

    addressTypeToHex(address) {
        // let prefix_length = address.chainId.length + 1;
        // return address.toString().substr(prefix_length);
    },
    // createLoomProvider(client, privateKey, callerChainId, account, etherNetSigner) {
    //     let loomProvider = new loom.LoomProvider(client, privateKey)
    //     loomProvider.callerChainId = callerChainId
    //     loomProvider.setMiddlewaresForAddress(account.local.toString(), [
    //         new loom.NonceTxMiddleware(account, client),
    //         new loom.SignedEthTxMiddleware(etherNetSigner)
    //     ]);

    //     return loomProvider;
    // },
};

module.exports = cryptoutils;