pragma solidity ^0.5.0;
import "../node_modules/openzeppelin-solidity/contracts/ownership/ownable.sol";
import "./iterableMapping.sol";

contract dataShare is Ownable() {
    // using a library for an iterable mapping
    using IterableMapping for IterableMapping.itmap;
    // defining a struct to hold the public key
    struct pubkey{
        bytes32 x;
        bytes32 y;
    }

    // each datum is identifed by data_id, addressed by IPFS hash
    // datum metadata can be stored in IFPS (title ,description,...)
    uint public data_index = 0;
    mapping (uint => bytes32) data;

    // Keep track of which data is shared
    // mapping (bytes32 => bool) dataIsShared;

    // Each datum is shared with a number of users, which can be iterated on
    // This is because we want to know all users that have content
    // the data_id is the first key
    // then the iterable mapping goes from address to bool, to specify if a user has access to the content
    mapping(uint => IterableMapping.itmap) users;

    // access list for a given datum, by a given user (0 does not exist or was rejected, 1 was requested, 2 granted)
    mapping (uint => mapping(address => uint8)) public access_list;

    // user keys store, from where admin client will retrieve pub keys
    mapping (address => pubkey) public user_keys;

    // Events declarations
    event LogAccessRequest(address indexed user_id, uint indexed data_id);
    event LogAccessRequestWithPubKey(address indexed user_id, uint indexed data_id, bytes32 publicKeyX,bytes32 publicKeyY);
    event LogAccessGranted(address indexed user, uint indexed data_id, bytes32 IPFSaddress);
    event LogAccessRevoked(address indexed user, uint indexed data_id, bytes32 IPFSaddress);
    event LogAccessRefused(address indexed user, uint indexed data_id);
    event LogContentAdded(uint indexed data_id, bytes32 IPFSaddress);
    event LogDataUpdated(uint indexed data_id, bytes32 indexed IPFSaddress);


    // constructor() public {
    //     // nothing to do except calling ownable constructor
    // }
// no longer needed as the content contains the keys now, which gives no attack surface to any one
    // modifier dataNotExist(bytes32 IPFSaddress) {
    //     require(dataIsShared[IPFSaddress],'Data already being shared');
    //     _;
    // }

    function isPubKeyNotZero(bytes32 publicKeyX, bytes32 publicKeyY) internal pure returns (bool) {
        // function checks if the public key is different from 0
        bytes32 nopubkey = bytes32(0x0000000000000000000000000000000000000000000000000000000000000000);
        if (publicKeyX != nopubkey || publicKeyY != nopubkey) {
            return true;
        }
    }

    function requestAccessWithKey(uint data_id, bytes32 publicKeyX, bytes32 publicKeyY) public {
        // This is needed to provide the public key the first time and to notify owner
        // store pubkey, counting on js client to provide correct key.
        // After all, no on is harmed except user if it is wrong
        require(isPubKeyNotZero(publicKeyX,publicKeyY), "public key cannot be 0");
        access_list[data_id][msg.sender] = 1;
        pubkey memory publicKey = pubkey(publicKeyX,publicKeyY);
        user_keys[msg.sender] = publicKey;
        users[data_id].insert(msg.sender,true);
        emit LogAccessRequestWithPubKey(msg.sender, data_id, publicKeyX, publicKeyY);
        }

    function requestAccess(uint data_id) public {
        // If the public key is already known, this is used to request access from the data owner
        pubkey memory user_key = user_keys[msg.sender];
        // the mapping should provide the default value if there is no entry for the msg.sender
        require(isPubKeyNotZero(user_key.x, user_key.y), "public key not provided yet");
        access_list[data_id][msg.sender] = 1;
        users[data_id].insert(msg.sender,true);
        emit LogAccessRequest(msg.sender, data_id);
        }

    // The owner adds content to be shared with others
    function addContent(bytes32 IPFSaddress) public onlyOwner() {
        uint data_id = data_index;
        data[data_id] = IPFSaddress;
        data_index++;
        emit LogContentAdded(data_id, IPFSaddress);
    }

    // grant access to a particular datum, update request entry
    // because the shared key is stored on IPFS, it will result in a new location
    // this means the web client has already done all the computation and simply
    // records it here to share with the users
    function grantAccess(address user, uint data_id, bytes32 newContentLocation) public onlyOwner() {
        access_list[data_id][user] = 2; // 2 means access granted
        data[data_id] = newContentLocation; // because the client has added the sharedKey for user, the content is updated
        emit LogAccessGranted(user, data_id, newContentLocation);
    }

    // the owner has decided to reject a user's request to share data
    function refuseAccess(address user_id, uint data_id) public onlyOwner(){
        access_list[data_id][user_id] = 0; // 0 means access not granted
        emit LogAccessRefused(user_id, data_id);
    }

    // revoke a given user his access to a datum
    // this is the most complex function, as every one needs a new key
    // maybe the best way is to have the users each pay/request access again?
    // then what they do is call the grant access again, or instead I can use broadcast encryption!
    // This is a great idea I think - how does it work again?
    // after thinking about it more, I think the better solution is to store the sharedKey in the IPFS document directly
    // so this means, the only thing that changes is the access list and the IPFS address for the content
    function revokeAccess(address user_id, uint data_id, bytes32 newContentLocation) public onlyOwner() {
        access_list[data_id][user_id] = 0; // 0 means access not granted
        data[data_id] = newContentLocation; // because the web client has removed the sharedKey for user, the content is updated
        emit LogAccessRevoked(user_id, data_id, newContentLocation);
    }
    // function getSharedKey(address user_id, uint data_id) public view returns (bytes32 sharedKey) {
    //     return sharedKeys[data_id][user_id];
    // }
    function getDataLocation(uint data_id) public view returns (bytes32 hash) {
        return data[data_id];
    }

    // update encrypted content and/or metadata, but not the keys
    function updateContent(uint data_id, bytes32 IPFSaddress) public onlyOwner() {
        data[data_id] = IPFSaddress;
        emit LogDataUpdated(data_id, IPFSaddress);
    }

    // for a given data_id, the function returns all the addresses that have access
    function getUsersForDatum(uint data_id) public view returns ( address[] memory) {
        address[] memory the_users;
        for (uint i = users[data_id].iterate_start(); users[data_id].iterate_valid(i); i = users[data_id].iterate_next(i))
        {
            (address user, bool status) = users[data_id].iterate_get(i);
            if (status == true) {
               the_users[i] = user;
            }
        return the_users;
        }
    }
    // for a given data_id and user, the function returns the access status
    function getUserStatusForDatum(uint data_id, address user) public view returns (uint) {
        return access_list[data_id][user];
    }

    // for a given user, return the public key
    function getPublicKey(address user) public view onlyOwner() returns (bytes32 pubx, bytes32 puby) {
        return(user_keys[user].x,user_keys[user].y);
    }

}


