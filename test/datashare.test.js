let IPFSUtil = require ('../client/src/utils/multihash');
let catchRevert = require("./exceptionsHelpers.js").catchRevert
const BN = web3.utils.BN
const dataShare = artifacts.require("dataShare");
const ethjsutil = require('ethjs-util');
var ecRecover = require("ethereumjs-util").ecrecover

var EC = require('elliptic').ec;
var ec = new EC('secp256k1');

var G = ec.g; // Generator point
var pk = new BN('1'); // private key as big number
var pubPoint=G.mul(pk); // EC multiplication to determine public point 


const pub1X = pubPoint.getX().toBuffer(); //32 bit x co-ordinate of public point 
const pub1Y = pubPoint.getY().toBuffer(); //32 bit y co-ordinate of public point 

var publicKey =Buffer.concat([pub1X,pub1Y])

console.log("pub key::"+publicKey.toString('hex'))


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
    // const pub1X = publicKey1.slice(0,32);
    // const pub1Y = publicKey1.slice(32,64);

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
            it.only("Only the owner can grant or refuse requests", async() => {
                // deploy two contents
                await instance.addContent(content1, {from: deployAccount} )
                await instance.addContent(content2, {from: deployAccount} )

                // first account request access to content1
                await instance.requestAccessWithKey(0, pub1X.toString('hex'), pub1Y.toString('hex'), {from: firstAccount} )
                
                // now first account tries to grant access
                await catchRevert(instance.grantAccess(0, {from: firstAccount}))
                
                // now owner grants access, logs show access was granted and data too
                const tx = await instance.grantAccess(0, {from: deployAccount})
                assert.equal() 
                const eventData = tx.logs[0]

                assert.equal(eventData.event, "LogGetRefund", "the event should be called LogGetRefund")
                assert.equal(eventData.args.accountRefunded, firstAccount, "the firstAccount should be the 'accountRefunded'")
            })

            it("account requesting a refund should be credited the appropriate amount", async() => {
                const preSaleAmount = await web3.eth.getBalance(secondAccount)
                await instance.addEvent(event1.description, event1.website, event1.ticketsAvailable, {from: deployAccount} )
                const buyReceipt = await instance.buyTickets(0, 1, {from: secondAccount, value: ticketPrice})
                const refundReceipt =await instance.getRefund(0, {from: secondAccount})
                const postSaleAmount = await web3.eth.getBalance(secondAccount) 
                
                const buyTx = await web3.eth.getTransaction(buyReceipt.tx)
                let buyTxCost = Number(buyTx.gasPrice) * buyReceipt.receipt.gasUsed

                const refundTx = await web3.eth.getTransaction(refundReceipt.tx)
                let refundTxCost = Number(refundTx.gasPrice) * refundReceipt.receipt.gasUsed

                assert.equal(postSaleAmount, (new BN(preSaleAmount).sub(new BN(buyTxCost)).sub(new BN(refundTxCost))).toString(), "buyer should be fully refunded when calling getRefund()")             
            })
        })

        describe("getBuyerNumberTickets()", async() =>{
            it("providing an event id to getBuyerNumberTickets() should tell an account how many tickets they have purchased", async() => {
                const numberToPurchase = 3

                await instance.addEvent(event1.description, event1.website, event1.ticketsAvailable, {from: deployAccount} )
                await instance.buyTickets(0, numberToPurchase, {from: secondAccount, value: ticketPrice*numberToPurchase})
                let result = await instance.getBuyerNumberTickets(0, {from: secondAccount})

                assert.equal(result, numberToPurchase, "getBuyerNumberTickets() should return the number of tickets the msg.sender has purchased.")
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
