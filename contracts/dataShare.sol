pragma solidity ^0.5.0;
import "../node_modules/openzeppelin-solidity/contracts/ownership/ownable.sol";
import "./iterableMapping.sol";

contract dataShare is Ownable() {
    // defining a struct to hold the public key
    struct pubkey{
        bytes32 x;
        bytes32 y;
    }

    // each datum is identifed by data_id, addressed by IPFS hash
    // datum metadata can be stored in IFPS (title ,description,...)
    uint public data_index = 0;
    mapping (uint => bytes32) data;

    // for each data_id, there is an array of addresses mapping to a bool to signify if it exists
    // when a request for access is made the user is added at the end of the users_by_data array
    // but only if user_indexes_by_data for it is 0, otherwise the index stays the same
    // when a request is rejected, or access is revoked the user index gets set zero
    mapping(uint => mapping(address => uint)) user_indexes_by_data;
    mapping(uint => address[]) users_by_data;

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
    event LogUsers_by_data();

    // event debugInt(uint indexed debugUINT);


    // constructor() public {
    //     // nothing to do except calling ownable constructor
    // }
// no longer needed as the content contains the keys now, which gives no attack surface to any one
    // modifier dataNotExist(bytes32 IPFSaddress) {
    //     require(dataIsShared[IPFSaddress],'Data already being shared');
    //     _;
    // }

    // Add user - in charge of keeping all the data structures in synch
    function addUserByData(uint data_id, address user) internal {
        // if the user is not yet referenced in the index we can try to add it
        if (user_indexes_by_data[data_id][user] == 0) {
            uint nb_users = users_by_data[data_id].length;
            // if no user has been added, we add address 0 to slot 0
            // slot 0 is used in index mapping to designate an unreferenced user
            if ( nb_users == 0) {
                users_by_data[data_id].push(address(0));
                nb_users++;
            }
            // update the index mapping for user to point at the right slot
            user_indexes_by_data[data_id][user] = nb_users;
            // actually create the user entry
            users_by_data[data_id].push(user);
            // update the access list, setting the request status to 'requested' (1)
            access_list[data_id][user] = 1;
        }
    }
    // Remove user - in charge of keeping all the data structures in synch
    function removeUserByData(uint data_id, address user) internal {
        user_indexes_by_data[data_id][user] = 0;
        access_list[data_id][user] = 0;
    }

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
        require((data_id < data_index), "data does not exist");
        require(isPubKeyNotZero(publicKeyX,publicKeyY), "public key cannot be 0");
        // emit debugInt(access_list[data_id][msg.sender]);
        pubkey memory publicKey = pubkey(publicKeyX,publicKeyY);
        user_keys[msg.sender] = publicKey;
        addUserByData(data_id,msg.sender);
        emit LogAccessRequestWithPubKey(msg.sender, data_id, publicKeyX, publicKeyY);
        }

    function requestAccess(uint data_id) public {
        // If the public key is already known, this is used to request access from the data owner
        pubkey memory user_key = user_keys[msg.sender];
        // the mapping should provide the default value if there is no entry for the msg.sender
        require((data_id < data_index), "data does not exist");
        require(isPubKeyNotZero(user_key.x, user_key.y), "public key not provided yet");
        addUserByData(data_id,msg.sender);
        // emit debugInt(access_list[data_id][msg.sender]);
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
        removeUserByData(data_id,user_id);
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
        removeUserByData(data_id,user_id);
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
    // for a given data_id count the number of granted requests
    function countAuthorizedUsers(uint data_id) internal view returns (uint requestCount) {
        uint authorizedCount = 0;
        uint nb_users = users_by_data[data_id].length;
        for (uint i = 0; i < nb_users ; i++)
        {
            address current_user = users_by_data[data_id][i];
            if (user_indexes_by_data[data_id][current_user] != 0) {
                if (access_list[data_id][current_user] == 2) {
                    authorizedCount++;
                }
            }
        }
        return authorizedCount;
    }

    // for a given data_id, the function returns all the addresses that have access
    function getAuthorizedUsersForDatum(uint data_id) public view returns ( address[] memory r_the_users) {
        uint array_index = 0;
        uint array_size = countAuthorizedUsers(data_id);
        uint nb_users = users_by_data[data_id].length;
        address[] memory the_users = new address[](array_size);
        for (uint i = 0; i < nb_users ; i++)
        {
            if (user_indexes_by_data[data_id][users_by_data[data_id][i]] != 0) {
                if (access_list[data_id][users_by_data[data_id][i]] == 2) {
                    the_users[array_index] = (users_by_data[data_id][i]);
                    array_index++;
                }
            }
        }
        return the_users;
    }
        // the function returns the number of requests in 'requested' (i.e. 1) status
    function countPendingRequests() internal view returns (uint) {
        uint count_requested = 0;
        for (uint datum = 0; datum < data_index; datum++)
        {

            uint nb_users = users_by_data[datum].length;
            for (uint i = 0; i < nb_users; i++)
            {
                if (user_indexes_by_data[datum][users_by_data[datum][i]] != 0) {
                    if (access_list[datum][users_by_data[datum][i]] == 1) {
                        count_requested++;
                    }
                }
            }
        }
        return count_requested;
    }

     // The function returns all the pending requests
    function getAllPendingRequests() external view returns ( uint[] memory r_data_ids, address[] memory r_users) {
        for (uint datum = 0; datum < data_index; datum++)
        {
            uint array_index = 0;
            uint array_size = countPendingRequests();
            uint nb_users = users_by_data[datum].length;
            uint[] memory data_ids = new uint[](array_size);
            address[] memory users = new address[](array_size);
            for (uint i = 0; i < nb_users; i++)
            {
                if (user_indexes_by_data[datum][users_by_data[datum][i]] != 0) {
                    if (access_list[datum][users_by_data[datum][i]] == 1) {
                        data_ids[array_index] = (datum);
                        users[array_index] = (users_by_data[datum][i]);
                        array_index++;
                    }
                }
            }
        return (data_ids,users);
        }
    }

    // for a given data_id and user, the function returns the access status
    function getUserStatusForDatum(uint data_id, address user) public view returns (uint status) {
        status = access_list[data_id][user];
        //emit debugInt(status);
        return status;
    }

    // for a given user, return the public key
    function getPublicKey(address user) public view onlyOwner() returns (bytes32 pubx, bytes32 puby) {
        return(user_keys[user].x,user_keys[user].y);
    }

}


