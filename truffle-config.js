const path = require("path");
const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraURL = 'https://rinkeby.infura.io/v3/2f52a94b4f7d43df999437fb4f94d8c7'
const infuraKey = "2f52a94b4f7d43df999437fb4f94d8c7";

const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();


module.exports = {
  plugins: [ "truffle-security" ],
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks:  {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
      rinkeby: {
        provider: () => new HDWalletProvider(mnemonic, infuraURL),
        network_id: 4,          // Rinkeby's network id
        gas: 5500000,        
      },
  },
  compilers: {
    solc: {
      version: "0.7.1", // A version or constraint - Ex. "^0.5.0"
                         // Can also be set to "native" to use a native solc
      docker: false, // Use a version obtained through docker
      parser: "solcjs",  // Leverages solc-js purely for speedy parsing
      settings: {
        optimizer: {
          enabled: true,
          runs: 100000   // Optimize for how many times you intend to run the code
        },
        evmVersion: "berlin" // Default: "petersburg"
      }
    }
  }

};
