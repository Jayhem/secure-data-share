# Design pattern decisions

## Security
### Ownership
The main security pattern that was required was that of the owner. The content is owned by the contract deployer and can only be shared by the owner. In order to implement it, I used Open Zeppelin's ownable contract. My contract extends ownable, thus uses code that was audited and should provide a secure way of handling the functions that manage the content access requests and the content creation.

Note that I tried installing the Open Zeppelin contracts with ethpm, but if fails, so I resorted to the npm install method.

## Gas saving patterns
When implementing a data sharing scheme on the blockchain, one needs to be really careful about how much each action is going to cost, as well as which actions should be taken on the blockchain vs in the dapp client.
Two main things were made clear early in the design process:
* The encryption and decryption of data needs to happen off-chain
* The data cannot be stored on the blockchain

### Off chain encryption
The idea is to use the web3 client(Metamask) and have it decrypt securely the data, whereas the encryption can be done by the dapp javascript using the public keys of each user. For more information on the overall functionality, see the [README]( README.MD) file.

### Off chain data storage
The once the data has been encrypted it is then stored on IPFS, along with the shared key encrypted for each user. The IPFS hash is then the only piece of data that is stored on the blockchain. Furthermore, in an effort to save gas, only the multishash digest is stored, the size and hash funtion being assumed constant. This trick allows using only one block of storage (bytes32).

### Mappings over dynamic arrays
When one needs to access uniquely identified data, using mappings is the most efficent data structure. This is why I chose to represent all of my data with mappings.
The downside of mappings is the fact that one cannot iterate through the values. As I needed to be able to retrieve all the users of a particular data_id, I used a representation similar to what is in [iterable_mapping](https://github.com/ethereum/dapp-bin/blob/master/library/iterable_mapping.sol).


