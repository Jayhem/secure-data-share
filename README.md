# secure-data-share
Ethereum has a nice property of everyone using it having to have a public/private key pair. 
This infrastucture can be leveraged to share data with multiple parties in an encrypted manner.
In the spirit of minimizing the blockchain computation and storage, this project does not store the content, rather the IPFS hash where the encrypted content can be found.

The modest goal of this project is to enable textual data to be encrypted with AES, using a shared key that is known to all the 'sharees'.
The shared key is encrypted with the Ethereum public key of each sharee, while being stored in the IPFS document.

The blockchain is used to manage the data sharing requests and storage of the public keys.
