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

Have ganache-cli running and listening to port 8545
go to the project root directory
Deploy the contract on your ganache-cli dev blockchain
```typescript
truffle migrate
```
Launch the web app
```typescript
cd client
npm run start
```
If this doesn't work, try re-installing the node packages
```typescript
cd client
rm -rf ./node_modules
npm install
npm run start
```
## Mea culpa
Unfortunately until very late in the project development, I did not find out that the web3.js spec does not call for data decryption using the account private key. I was in part fooled by the fact that there is a decrypt function in the spec and also because I assumed decryption of generic data would be part of the spec and implementation(s). I looked at using the web.shh (whisper spec for the protocol) which provides some facilities related to this, but unfortunately metamask does not implement it yet.
In the end, this project simply showcases a system that allows sharing data on IPFS, using Ethereum accounts as the source of identity and the repository for requests and shared data location on IPFS.
