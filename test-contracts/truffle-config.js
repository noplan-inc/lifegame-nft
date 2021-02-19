const HDWalletProvider = require('truffle-hdwallet-provider');
const fs = require('fs');
const mnemonic = fs.readFileSync('.secret').toString().trim();

const provider = new HDWalletProvider(
    mnemonic,
    `https://data-seed-prebsc-1-s1.binance.org:8545`
);

console.log(provider.getAddress());

module.exports = {
    // Uncommenting the defaults below
    // provides for an easier quick-start with Ganache.
    // You can also follow this format for other networks;
    // see <http://truffleframework.com/docs/advanced/configuration>
    // for more details on how to specify configuration options!
    compilers: {
        solc: {
            version: '^0.6.0',
        },
    },
    networks: {
        testnet: {
            networkCheckTimeout: 5000,
            provider: () => provider,
            network_id: 97,
            confirmations: 10,
            timeoutBlocks: 200,
            skipDryRun: true,
        },
    },
    //
};
