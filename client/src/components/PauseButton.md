```js
import {
  Button,
} from "reactstrap";

  const accounts = ["0x9C7579dB47648468c9e37989e69CC2d9AD03452d"];
  const contract = {"currentProvider":{"_events":{"data":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]},"_eventsCount":2,"_maxListeners":100,"isMetaMask":true,"_state":{"sentWarnings":{"enable":true,"experimentalMethods":true,"send":false,"events":{"chainIdChanged":false,"close":false,"data":true,"networkChanged":false,"notification":false},"autoRefresh":true,"publicConfigStore":false},"isConnected":true,"accounts":["0x9c7579db47648468c9e37989e69cc2d9ad03452d"],"isUnlocked":true},"_metamask":{},"selectedAddress":"0x9c7579db47648468c9e37989e69cc2d9ad03452d","networkVersion":"4","chainId":"0x4","_publicConfigStore":{"_events":{"update":[null,null,null]},"_eventsCount":1,"_state":{"isUnlocked":true,"networkVersion":"4","chainId":"0x4"}},"_rpcEngine":{"_events":{},"_eventsCount":0,"_middleware":[null,null,null]},"autoRefreshOnNetworkChange":true},"_requestManager":{"providers":{},"subscriptions":{}},"options":{"address":"0xfdBE0D57B2ad1a3627129b9205cAf06a746724ad","jsonInterface":[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"data_id","type":"uint256"},{"indexed":false,"internalType":"bytes32","name":"IPFSaddress","type":"bytes32"}],"name":"LogAccessGranted","type":"event","signature":"0x54f0a7ff1c18023c962630facbcb3059a614ef3bc89d62636fadc8368b529f2c"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"data_id","type":"uint256"}],"name":"LogAccessRefused","type":"event","signature":"0x3d0cad026f2ac53250b0fd7dfffb4c4f4800767994b69eb9be1987edb4f26780"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user_id","type":"address"},{"indexed":true,"internalType":"uint256","name":"data_id","type":"uint256"}],"name":"LogAccessRequest","type":"event","signature":"0xa5165aacfe032d6a5ec606938478273abcaa3a1f1b828bf30c97ef556db47b22"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user_id","type":"address"},{"indexed":true,"internalType":"uint256","name":"data_id","type":"uint256"},{"indexed":false,"internalType":"bytes32","name":"publicKeyX","type":"bytes32"},{"indexed":false,"internalType":"bytes32","name":"publicKeyY","type":"bytes32"}],"name":"LogAccessRequestWithPubKey","type":"event","signature":"0x32b0e6b553b04f94f65aacc9ae0278df161d25b21a5d32be77657607e8548b93"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"data_id","type":"uint256"},{"indexed":false,"internalType":"bytes32","name":"IPFSaddress","type":"bytes32"}],"name":"LogAccessRevoked","type":"event","signature":"0x4be698563e7cb077b8572d8a1638cc35f3f48238b327d3d5bd0e2f2c188f13bf"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"data_id","type":"uint256"},{"indexed":false,"internalType":"bytes32","name":"IPFSaddress","type":"bytes32"}],"name":"LogContentAdded","type":"event","signature":"0x2b1a1ef07172cf19cbb5f71c02d0d05c3d50d790f01e035054f26c2018422856"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"data_id","type":"uint256"},{"indexed":true,"internalType":"bytes32","name":"IPFSaddress","type":"bytes32"}],"name":"LogDataUpdated","type":"event","signature":"0x935f9715dd016909ca5676266bde959e3ac2a0bea6fb43abf17870d8077975f8"},{"anonymous":false,"inputs":[],"name":"LogUsers_by_data","type":"event","signature":"0x050122fcee0146e86b9385a3a7eb4cee964832c86c981369e6f0496a9a9bc489"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event","signature":"0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event","signature":"0x62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event","signature":"0x5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"access_list","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function","constant":true,"signature":"0xfb3892d2"},{"inputs":[],"name":"data_index","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x732b4782"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x8da5cb5b"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x5c975abb"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x715018a6"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0xf2fde38b"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"user_keys","outputs":[{"internalType":"bytes32","name":"x","type":"bytes32"},{"internalType":"bytes32","name":"y","type":"bytes32"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x9419b513"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x8456cb59"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x3f4ba83a"},{"inputs":[{"internalType":"uint256","name":"data_id","type":"uint256"},{"internalType":"bytes32","name":"publicKeyX","type":"bytes32"},{"internalType":"bytes32","name":"publicKeyY","type":"bytes32"}],"name":"requestAccessWithKey","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x2cfa4747"},{"inputs":[{"internalType":"uint256","name":"data_id","type":"uint256"}],"name":"requestAccess","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x7fdc2cdc"},{"inputs":[{"internalType":"bytes32","name":"IPFSaddress","type":"bytes32"}],"name":"addContent","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x56536ab2"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"data_id","type":"uint256"},{"internalType":"bytes32","name":"newContentLocation","type":"bytes32"}],"name":"grantAccess","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x329812bd"},{"inputs":[{"internalType":"address","name":"user_id","type":"address"},{"internalType":"uint256","name":"data_id","type":"uint256"}],"name":"refuseAccess","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0x106602c2"},{"inputs":[{"internalType":"address","name":"user_id","type":"address"},{"internalType":"uint256","name":"data_id","type":"uint256"},{"internalType":"bytes32","name":"newContentLocation","type":"bytes32"}],"name":"revokeAccess","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0xb75778b1"},{"inputs":[{"internalType":"uint256","name":"data_id","type":"uint256"}],"name":"getDataLocation","outputs":[{"internalType":"bytes32","name":"hash","type":"bytes32"}],"stateMutability":"view","type":"function","constant":true,"signature":"0xd332bf49"},{"inputs":[{"internalType":"uint256","name":"data_id","type":"uint256"},{"internalType":"bytes32","name":"IPFSaddress","type":"bytes32"}],"name":"updateContent","outputs":[],"stateMutability":"nonpayable","type":"function","signature":"0xb59c6301"},{"inputs":[{"internalType":"uint256","name":"data_id","type":"uint256"}],"name":"getAuthorizedUsersForDatum","outputs":[{"internalType":"address[]","name":"r_the_users","type":"address[]"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x11dc9f1f"},{"inputs":[],"name":"getAllPendingRequests","outputs":[{"internalType":"uint256[]","name":"r_data_ids","type":"uint256[]"},{"internalType":"address[]","name":"r_users","type":"address[]"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x6bd05f35"},{"inputs":[{"internalType":"uint256","name":"data_id","type":"uint256"},{"internalType":"address","name":"user","type":"address"}],"name":"getUserStatusForDatum","outputs":[{"internalType":"uint256","name":"status","type":"uint256"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x6719245d"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getPublicKey","outputs":[{"internalType":"bytes32","name":"pubx","type":"bytes32"},{"internalType":"bytes32","name":"puby","type":"bytes32"}],"stateMutability":"view","type":"function","constant":true,"signature":"0x857cdbb8"}]},"defaultAccount":null,"defaultBlock":"latest","methods":{},"events":{},"_address":"0xfdBE0D57B2ad1a3627129b9205cAf06a746724ad"};
  const contractReady = true;
  const owner = true;
  const paused = false;
  const onWeb3Change = null; 
  const web3 = {"currentProvider":{"_events":{"data":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]}}};
  <PauseButton 
  paused={paused}
  onWeb3Change={null}
  owner={owner}
  web3={web3}
  accounts={accounts}
  contract={contract}
  disabled={owner}
  contractReady={contractReady}
  />
 ```