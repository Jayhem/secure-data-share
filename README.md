# secure-data-share
## Overview
Ethereum has a nice property of everyone using it having to have a public/private key pair. 
This infrastucture can be leveraged to share data with multiple parties in an encrypted manner.
In the spirit of minimizing the blockchain computation and storage, this project does not store the content, rather the IPFS hash where the encrypted content can be found.

The modest goal of this project is to enable textual data to be encrypted with AES, using a shared key that is known to all the 'sharees'.
The shared key is encrypted with the Ethereum public key of each sharee, while being stored in the IPFS document.

The blockchain is used to manage the data sharing requests and storage of the public keys, as well as the IPFS location of the shared data.

## Installation instruction
Clone this repository

Make sure npm is installed, as well as truffle and ganache-cli.

Have ganache-cli running and listening to port 8545

go to the project root directory

There are a few things needed to make the environment work, as the install on my repo was a little squirly.

The project requires that the hd-wallet be installed (as a dev dependency) in the root directory of the project and creation of the .secret file
```typescript
npm install --save truffle-hdwallet-provider
touch .secret
```

I had installed the OpenZeppelin libraries with NPM from the root directory, which you also need to do

```typescript
npm install openzeppelin-solidity
```
And for some obscure reason the ownable.sol file referenced in my contract is lower case, whereas the one downloaded has upper case Ownable.sol. So from the project root directory do
```typescript
mv node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol node_modules/openzeppelin-solidity/contracts/ownership/ownable.sol 
```
Final squirly thing to fix is a library I had used early on in the project (and decided to set aside) still has a reference to it in the migrations/2_deploy_contracts.js file. In order to make this work (I think this may be a case where the truffle version of Macos is different from Ubuntu), please edit the migrations/2_deploy_contracts.js file, by commenting out line 2. This is what it should look like.

```typescript
//var iterablemap = artifacts.require("iterableMapping");
```
Finally go to the client directory and install the npm packages for the web app
```typescript
cd client
npm install
```

Now that everything is squared away you can compile, test and deploy with truffle.
Go back to the project root directory and fire away

```typescript
truffle compile
truffle test
truffle migrate --reset
```
Launch the web app
```typescript
cd client
npm run start
```

## UI usage
In order for you to test the dapp, you'll want to have a couple of browsers started, one with metamask using the account used to deploy the contract on ganache (you can find the private key at the beginning of the logs, or the seed phrase) and another browser running another account. The account having deployed the contract is the owner and is the only one that can create new content, but it cannot have content shared with them.
The other account is a 'user' account and can request access to specific content by going to the 'To discover' tab and clicking on content that was created by the 'owner'. If you don't see newly created content right away, you can click on the refresh button. Once the request has been made the owner of the content then can either grant the request or refuse it, this is done by clicking on the 'Manage requests' button. Again, if the request made by the user doesn't appear, you can use the refresh button to have it being displayed.
There is one more thing to discuss, which is the pause/unpause button which serves as a demo for the circuit breaker design pattern. When clicking on it the user can forbid further granting of requests. Unpausing the contract will restore the functionality.

## Mea culpa
Unfortunately until very late in the project development, I did not find out that the web3.js spec does not call for data decryption using the account private key. I was in part fooled by the fact that there is a decrypt function in the spec and also because I assumed decryption of generic data would be part of the spec and implementation(s). I looked at using the web.shh (whisper spec for the protocol) which provides some facilities related to this, but unfortunately metamask does not implement it yet.
In the end, this project simply showcases a system that allows sharing data on IPFS, using Ethereum accounts as the source of identity and the repository for requests and shared data location on IPFS.
