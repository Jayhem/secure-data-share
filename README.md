# secure-data-share
Ethereum has a nice property of everyone using it having to have a public/private key pair. 
This infrastucture can be leveraged to share data with multiple parties in an encrypted manner.
In the spirit of minimizing the blockchain computation and storage, this project does not store the content, rather the IPFS hash where the encrypted content can be found.

The modest goal of this project is to enable textual data to be encrypted with AES, using a shared key that is known to all the 'sharees'.
The shared key is encrypted with the Ethereum public key of each sharee, while being stored in the IPFS document.

The blockchain is used to manage the data sharing requests and storage of the public keys.

# Installation instruction
Clone the repository


[![Codacy Badge](https://api.codacy.com/project/badge/Grade/ba01a8bb2d3344f29f98157ccbd14519)](https://app.codacy.com/app/kigawas/eciesjs?utm_sour
ce=github.com&utm_medium=referral&utm_content=kigawas/eciesjs&utm_campaign=Badge_Grade_Dashboard)
[![License](https://img.shields.io/github/license/kigawas/eciesjs.svg)](https://github.com/kigawas/eciesjs)
[![Npm Package](https://img.shields.io/npm/v/eciesjs.svg)](https://www.npmjs.com/package/eciesjs)
[![Circle CI](https://img.shields.io/circleci/project/kigawas/eciesjs/master.svg)](https://circleci.com/gh/kigawas/eciesjs)
[![Codecov](https://img.shields.io/codecov/c/github/kigawas/eciesjs.svg)](https://codecov.io/gh/kigawas/eciesjs)

Elliptic Curve Integrated Encryption Scheme for secp256k1, written in TypeScript with minimal dependencies.

This is the JavaScript/TypeScript version of [eciespy](https://github.com/kigawas/eciespy), you may go there for documentation about detailed mech
anism.

## Install

Install with `npm install eciesjs` ([`secp256k1`](https://github.com/cryptocoinjs/secp256k1-node) is the only dependency).

## Quick Start

```typescript
> import { encrypt, decrypt, PrivateKey, utils } from 'eciesjs'
> const k1 = new PrivateKey()
> const data = Buffer.from('this is a test')
> decrypt(k1.toHex(), encrypt(k1.publicKey.toHex(), data)).toString()
'this is a test'
> utils.sha256(Buffer.from('0')).slice(0, 8)
<Buffer 5f ec eb 66 ff c8 6f 38>
> const k2 = new PrivateKey()
> k1.ecdh(k2.publicKey).equals(k2.ecdh(k1.publicKey))
true
```

## API

### `encrypt(receiverPubhex: string, msg: Buffer): Buffer`

Parameters:
-   **receiverPrvhex** - Receiver's secp256k1 private key hex string
-   **msg** - Data to decrypt

Returns:  **Buffer**

### `PrivateKey`

-   Methods

```typescript
static fromHex(hex: string): PrivateKey;
constructor(secret?: Buffer);
toHex(): string;
ecdh(pub: PublicKey): Buffer;
equals(other: PrivateKey): boolean;
```

-   Properties

```typescript
readonly secret: Buffer;
readonly publicKey: PublicKey;
```

### `PublicKey`

-   Methods

```typescript
static fromHex(hex: string): PublicKey;
constructor(buffer: Buffer);
toHex(compressed?: boolean): string;
equals(other: PublicKey): boolean;
```

-   Properties

```typescript
readonly uncompressed: Buffer;
readonly compressed: Buffer;
```
