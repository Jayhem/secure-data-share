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
  }
};
