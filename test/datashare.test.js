let IPFSUtil = require ('../client/src/utils/multihash');
let catchRevert = require("./exceptionsHelpers.js").catchRevert
let catchZeroPubKey = require("./exceptionsHelpers.js").catchZeroPubKey
let catchNoPubKey = require("./exceptionsHelpers.js").catchNoPubKey

const BN = web3.utils.BN
const dataShare = artifacts.require("dataShare");
const ethjsutil = require('ethjs-util');
var ecRecover = require("ethereumjs-util").ecrecover

var EC = require('elliptic').ec;
var ec = new EC('secp256k1');

var G = ec.g; // Generator point
var pk = new BN('1'); // private key as big number
var pubPoint=G.mul(pk); // EC multiplication to determine public point 


const x = pubPoint.getX().toBuffer(); //32 bit x co-ordinate of public point 
const y = pubPoint.getY().toBuffer(); //32 bit y co-ordinate of public point 

var publicKey =Buffer.concat([x,y])

// console.log("pub key::"+publicKey.toString('hex'))


contract('dataShare', function(accounts) {

    const deployAccount = accounts[0]
    const firstAccount = accounts[3]
    const secondAccount = accounts[4]
    const thirdAccount = accounts[5]

    const clearData = "this is private data"

    const bs58content1 = "QmarHSr9aSNaPSR6G9KFPbuLV9aEqJfTk1y9B8pdwqK4Rq"
    const bs58content2 = "QmarHSr9aSAaPSR6G9KFPbuLV9aEqJfTk1y9B8pdwqqqqq"

    const content1 = IPFSUtil.getBytes32FromMultiash(bs58content1).digest
    const content2 = IPFSUtil.getBytes32FromMultiash(bs58content2).digest
    // const hashType = IPFSUtil.getBytes32FromMultiash(bs58content1).hashFunction
    // const hashSize = IPFSUtil.getBytes32FromMultiash(bs58content1).size
    // console.log('hash function' + hashType)
    // console.log('hash size' + hashSize)

    const fakeTx = {
        from: firstAccount,
        to: '0x3535353535353535353535353535353535353535',
        value: "0000000000000000001"}
    // const v =
    // const r = 
    // const s = 
    // const hash = 
    // console.log(ecRecover(hash,v,r,s))
    // const publicKey1 = privateToPublic(privateKeyBuff);
    const pub1X = `0x${x.toString('hex')}`;
    const pub1Y = `0x${y.toString('hex')}`;
    const nullpoint = '0x0000000000000000000000000000000000000000000000000000000000000000'
    console.log('pub1X : ' + pub1X);
    let instance

    beforeEach(async () => {
        instance = await dataShare.new()
    })

    describe.only("Setup", async() => {

        it("OWNER should be set to the deploying address", async() => {
            const owner = await instance.owner()
            assert.equal(owner, deployAccount, "the deploying address should be the owner")
        })
    })

    describe.only("Functions", () => {
        describe("addContent()", async() =>{
            it("only the owner should be able to add content to share", async() => {
                await instance.addContent(content1, {from: deployAccount} )
                await catchRevert(instance.addContent(content1, {from: firstAccount}))
            })

            it("adding a content should emit an event with the content details ", async() => {
                const tx = await instance.addContent(content2, {from: deployAccount} )
                const eventData = tx.logs[0].args

                assert.equal(eventData.data_id, 0, "the added content should use index 1")
                assert.equal(eventData.IPFSaddress, content2, "the added content should match")
            })
        })

        describe("requestAccess()", async() =>{
            it("The request to access content should be recorded as well as the public key", async() => {
                web3.eth.signTransaction(fakeTx, async(receipt) =>{
                    console.log(receipt);
                    // pubkey = ecRecover(receipt.hash, receipt.v, receipt.r, receipt.s);
                    // console.log(pubkey);
                });
                await instance.addContent(content1, {from: deployAccount} )
                await instance.requestAccessWithKey(content1, pub1X, pub1Y, {from: firstAccount} )


            })
        })

        describe("getDataLocation()", async() =>{
            it("Data location should be retrievable for all contents", async() => {
                // deploy two contents
                await instance.addContent(content1, {from: deployAccount} )
                await instance.addContent(content2, {from: deployAccount} )
                
                // retrieve data_index
                const data_index = await instance.data_index()
                console.log('data_index : ' + data_index)
                
                // loop on the data_id and retrieve all data their locations
                var content_array = []
                for (var i = 0;  i<data_index; i++) {
                    bytes32hash = await instance.getDataLocation(i)
                    // console.log('hash from contract : ' + bytes32hash)
                    multihash = IPFSUtil.getMultihashFromContractResponse(bytes32hash)
                    // console.log('multihash : ' + multihash)
                    content_array[i] = multihash;
                 }
                
                // compare values to the original IPFS multihash
                assert.equal(content_array[0], bs58content1, `The content should be ${bs58content1} instead it was ${content_array[0]}`)
                assert.equal(content_array[1], bs58content2, `The content should be ${bs58content2} instead it was ${content_array[1]}`)

            })
        })

        describe("Manage requests()", async() =>{
            it.only("Only the owner can grant requests", async() => {
                // deploy two contents
                await instance.addContent(content1, {from: deployAccount} )
                await instance.addContent(content2, {from: deployAccount} )

                // first account request access to content1
                await instance.requestAccessWithKey(0, pub1X, pub1Y, {from: firstAccount} )
                
                // now first account tries to grant access
                await catchRevert(instance.grantAccess(firstAccount, 0, content1, {from: firstAccount}))
                
                // now owner grants access, logs show access was granted and data too
                const tx = await instance.grantAccess(firstAccount, 0, content1, {from: deployAccount})
                const eventData = tx.logs[0]
                const status = await instance.getUserStatusForDatum(0,firstAccount)
                
                assert.equal(status,2,`Access status should be 2(granted) instead it was ${status}`)
                assert.equal(eventData.event, "LogAccessGranted", "the event should be called LogAccessGranted")
                assert.equal(eventData.args.user, firstAccount, "the firstAccount should be the 'grantee'")
            })

            it.only("Only the owner can refuse requests", async() => {
                // deploy two contents
                await instance.addContent(content1, {from: deployAccount} )
                await instance.addContent(content2, {from: deployAccount} )

                // first account request access to content1
                await instance.requestAccessWithKey(0, pub1X, pub1Y, {from: firstAccount} )
                
                // now first account tries to refuse access
                await catchRevert(instance.refuseAccess(firstAccount, 0, {from: firstAccount}))
                
                // now owner refuses access, logs show access was refused and data too
                const tx = await instance.refuseAccess(firstAccount, 0, {from: deployAccount})
                const eventData = tx.logs[0]
                const status = await instance.getUserStatusForDatum(0,firstAccount)
                
                assert.equal(status,0,`Access status should be 0(refused/inexistent) instead it was ${status}`)
                assert.equal(eventData.event, "LogAccessRefused", "the event should be called LogAccessRefused")
                assert.equal(eventData.args.user, firstAccount, "the firstAccount should be the 'refusee'")
            })
            it.only("Only the owner can revoke access", async() => {
                // deploy two contents
                await instance.addContent(content1, {from: deployAccount} )
                await instance.addContent(content2, {from: deployAccount} )

                // first account request access to content1
                await instance.requestAccessWithKey(0, pub1X, pub1Y, {from: firstAccount} )
                
                // first account request access to content2
                await instance.requestAccess(1, {from: firstAccount} )
                
                // now owner grants access to content 1 and 2
                await instance.grantAccess(firstAccount, 0, content1, {from: deployAccount})
                await instance.grantAccess(firstAccount, 0, content2, {from: deployAccount})

                // now first account tries to revoke access
                await catchRevert(instance.revokeAccess(firstAccount, 1, content1, {from: firstAccount}))
                
                // now owner revokes access to content2, change IPFS location to content1, logs show access was revoked and data too
                const tx  = await instance.revokeAccess(firstAccount, 1, content1,  {from: deployAccount})
                const eventData = tx.logs[0]
                const status = await instance.getUserStatusForDatum(1,firstAccount)
                const NewIPFSaddress = await instance.getDataLocation(1)
                
                assert.equal(status,0,`Access status should be 0(refused/inexistent) instead it was ${status}`)
                assert.equal(eventData.event, "LogAccessRevoked", "the event should be called LogAccessRevoked")
                assert.equal(eventData.args.user, firstAccount, "the firstAccount should be the 'revoked'")
                assert.equal(eventData.args.IPFSaddress, content1, `${content1} should be the new address, instead it was ${eventData.args.IPFSaddress}`)
                assert.equal(NewIPFSaddress, content1, `${content1} should be the new address, instead it was ${NewIPFSaddress}`)
            })
        })

        describe.only("Public Keys management", async() =>{
            it("If the user provides a pubkey with all zeros, it should fail", async() => {
                // deploy two contents
                await instance.addContent(content1, {from: deployAccount} )
                await instance.addContent(content2, {from: deployAccount} )

                // first account request access to content1, keys are 0
                await catchZeroPubKey(instance.requestAccessWithKey(0, nullpoint, nullpoint, {from: firstAccount} ))
                
                // first account requests accesss without having provided a public key
                await catchRevert(instance.requestAccess(0, {from: firstAccount} ))

                // first account request access to content1, key is non-zero
                await instance.requestAccessWithKey(0, pub1X, pub1Y, {from: firstAccount} )
                const result = await instance.getPublicKey(firstAccount, {from:deployAccount})

                assert.equal(result.pubx, pub1X, "pointx of pub key should be the same ")
                assert.equal(result.puby, pub1Y, "pointy of pub key should be the same ")

            })
        })

        describe("endSale()", async() => {
            it("only the owner should be able to end the sale and mark it as closed", async() => {
                await instance.addEvent(event1.description, event1.website, event1.ticketsAvailable, {from: deployAccount} )
                await catchRevert(instance.endSale(0, {from: firstAccount}))
                const txResult = await instance.endSale(0, {from: deployAccount})
                const eventData = await instance.readEvent(0)

                assert.equal(eventData['4'], false, "The event isOpen variable should be marked false.")
            })

            it("endSale() should emit an event with information about how much ETH was sent to the contract owner", async() => {
                const numberToPurchase = 3

                await instance.addEvent(event1.description, event1.website, event1.ticketsAvailable, {from: deployAccount} )
                await instance.buyTickets(0, numberToPurchase, {from: secondAccount, value: ticketPrice*numberToPurchase})
                const txResult = await instance.endSale(0, {from: deployAccount})
                
                const amount = txResult.logs[0].args['1'].toString()

                assert.equal(amount, ticketPrice*numberToPurchase, "the first emitted event should contain the tranferred amount as the second parameter")
            })
        })
    })
})
