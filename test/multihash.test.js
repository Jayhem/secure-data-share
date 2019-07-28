const ipfsHash = require('../client/src/utils/multihash');

describe('multihash', () => {
  it('should be able convert IPFS hash back and forth', async () => {
    const multihash = 'QmahqCsAUAw7zMv6P6Ae8PjCTck7taQA6FgGQLnWdKG7U8';

    assert.isTrue(multihash === ipfsHash.getMultihashFromBytes32(ipfsHash.getBytes32FromMultiash(multihash)));
  });
  it('should work with contract data', async () => {
    const bs58content1 = "QmarHSr9aSNaPSR6G9KFPbuLV9aEqJfTk1y9B8pdwqK4Rq"
    const content1 = ipfsHash.getBytes32FromMultiash(bs58content1).digest

    assert.equal(bs58content1, ipfsHash.getMultihashFromContractResponse(content1),`The content should be ${content1}`);
  });
});
