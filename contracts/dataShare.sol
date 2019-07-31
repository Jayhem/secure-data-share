pragma solidity ^0.5.0;
import "../node_modules/openzeppelin-solidity/contracts/ownership/ownable.sol";
import "../node_modules/openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

/// @title A secure data sharing apparatus
/// @author Jean-Marc Henry
/// @notice You can use this contract for sharing data between multiple parties
/// @dev This contract inherits from Ownable from Zeppelin
contract dataShare is Ownable(), Pausable() {
    /// @dev defining a struct to hold the public key
    struct pubkey{
        bytes32 x;
        bytes32 y;
    }

    /** @dev each datum is identifed by data_id, addressed by IPFS hash
    datum metadata can be stored in IFPS (title ,description,...)
    then data_index is used to keep track of how many data items exist
    */
    uint public data_index = 0;
    mapping (uint => bytes32) data;

    /** @dev for each data_id, there is an array of addresses mapping to a bool to signify if it exists
    when a request for access is made the user is added at the end of the users_by_data array
    but only if user_indexes_by_data for it is 0, otherwise the index stays the same
    when a request is rejected, or access is revoked the user index gets set to zero
    special care was taken when retrieving the users, as some may be there twice but no longer referenced
    */
    mapping(uint => mapping(address => uint)) user_indexes_by_data;
    mapping(uint => address[]) users_by_data;

    /** @dev access list for a given datum, by a given user
    (0 does not exist or was rejected, 1 was requested, 2 granted)
    */
    mapping (uint => mapping(address => uint8)) public access_list;

    /// @dev user keys store, from where admin client will retrieve pub keys
    mapping (address => pubkey) public user_keys;

    /// @notice Events declarations
    event LogAccessRequest(address indexed user_id, uint indexed data_id);
    event LogAccessRequestWithPubKey(address indexed user_id, uint indexed data_id, bytes32 publicKeyX,bytes32 publicKeyY);
    event LogAccessGranted(address indexed user, uint indexed data_id, bytes32 IPFSaddress);
    event LogAccessRevoked(address indexed user, uint indexed data_id, bytes32 IPFSaddress);
    event LogAccessRefused(address indexed user, uint indexed data_id);
    event LogContentAdded(uint indexed data_id, bytes32 IPFSaddress);
    event LogDataUpdated(uint indexed data_id, bytes32 indexed IPFSaddress);
    event LogUsers_by_data();

    /// @author Jean-Marc Henry
    /// @notice Internal function used to grant a user access to a datum
    /// @dev Keeps consistency between user_indexes_by_data, users_by_data and access_list
    /// @param data_id The datum identifier to which the user is granted acces
    /// @param user The user(ethereum address) granted acces to the datum
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
    /// @author Jean-Marc Henry
    /// @notice Request access for a user to a datum, providing his/her her public key
    /** @dev This function needs to be called only the first time a requests access.
    Subsequently, the client dapp can call the less gas hungry requestAccess() function.
    It stores the public key, counting on js client to provide the correct key.
    After all, no on is harmed except user if it is wrong, therefore there is no need
    to waste gas on verifying the key is valid. The exception is made here is to check that
    the key is not 0, as in a mapping this is the equivalent of no entry.
    */
    /// @param data_id The datum identifier to which the user is granted acces
    /// @param publicKeyX The Ethereum's public key's X coordinate
    /// @param publicKeyY The Ethereum's public key's Y coordinate
    function requestAccessWithKey(uint data_id, bytes32 publicKeyX, bytes32 publicKeyY) public {
        require((data_id < data_index), "data does not exist");
        require(isPubKeyNotZero(publicKeyX,publicKeyY), "public key cannot be 0");
        // emit debugInt(access_list[data_id][msg.sender]);
        pubkey memory publicKey = pubkey(publicKeyX,publicKeyY);
        user_keys[msg.sender] = publicKey;
        addUserByData(data_id,msg.sender);
        emit LogAccessRequestWithPubKey(msg.sender, data_id, publicKeyX, publicKeyY);
        }

    /// @author Jean-Marc Henry
    /// @notice Request access for a user to a datum
    /** @dev This function should be called only once the client dapp has provided the public key
    through the requestAccessWithKey() function.
    */
    /// @param data_id The datum identifier to which the user is granted acces
    function requestAccess(uint data_id) public {
        pubkey memory user_key = user_keys[msg.sender];
        // the mapping should provide the default value if there is no entry for the msg.sender
        require((data_id < data_index), "data does not exist");
        require(isPubKeyNotZero(user_key.x, user_key.y), "public key not provided yet");
        addUserByData(data_id,msg.sender);
        // emit debugInt(access_list[data_id][msg.sender]);
        emit LogAccessRequest(msg.sender, data_id);
        }
    /// @author Jean-Marc Henry
    /// @notice The owner of the contract can add some new content to share
    /**  @dev The owner creates content to share, stores it on IPFS. The IPFS hash is stored
    in the contract. In fact it is only the digest of the multihash that is stored.
    This has the advantage of saving quite a bit of gas, as only a single block is used
    to store the digest. On the client side, the multihash needs to be reconstructed.
    To be noted, that this is NOT forward compatible. If IPFS were to start using a different hash function,
    it would break the functionality. So far, nothing has changed sinced the project started however.
    */
    /// @param IPFSaddress The IPFS digest, allowing to retrieve the encrypted data
    function addContent(bytes32 IPFSaddress) public onlyOwner() {
        uint data_id = data_index;
        data[data_id] = IPFSaddress;
        data_index++;
        emit LogContentAdded(data_id, IPFSaddress);
    }

    /// @author Jean-Marc Henry
    /// @notice The data owner grants a user access to a particular datum, if the contract is paused this critical function is disabled
    /**  @dev The owner grants access to request. The reason a new IPFS location is required,
    is because the data is encrypted with a symmetric key, shared by all users.
    However, it is encrypted uniquely with each user's public key.
    Storing the shared key encrypted for each user would be prohibitive on the blockchain.
    The solution then is to store them on IPFS, thus every time a user is added or removed,
    the IPFS address will be updated (i.e. because it is the hash of the data it contains).
    */
    /// @param user The user(ethereum address) granted acces to the datum
    /// @param data_id The datum identifier to which the user is granted acces
    /// @param newContentLocation The IPFS digest, allowing to retrieve the encrypted data
    function grantAccess(address user, uint data_id, bytes32 newContentLocation) public onlyOwner() whenNotPaused() {
        access_list[data_id][user] = 2; // 2 means access granted
        data[data_id] = newContentLocation; // because the client has added the sharedKey for user, the content is updated
        emit LogAccessGranted(user, data_id, newContentLocation);
    }
    /// @author Jean-Marc Henry
    /// @notice The owner has decided to reject a user's request to share data
    /**  @dev The owner refuses to grand access to the request. No need to update
    the IPFS address as no new key added or content modified. Note the use of
    the internal removeUserByData() function to keep everything in synch.
    */
    /// @param user_id The user(ethereum address) being refused acces to the datum
    /// @param data_id The datum identifier to which the user is refused acces
    function refuseAccess(address user_id, uint data_id) public onlyOwner(){
        removeUserByData(data_id,user_id);
        emit LogAccessRefused(user_id, data_id);
    }

    /// @author Jean-Marc Henry
    /// @notice The owner has decided to revoke a user's access to data
    /**  @dev The owner revokes the access of user to some data. This, of course does not mean the user no longer
    has access to the data, as it is on IPFS, rather it means that any new content added to that shared data will not be accessible.
    The way it is done is by having the Dapp client generate a new shared key and encrypt it for the remaining users.
    Since, we do not store the encrypted shared keys on the blockchain, it is not a costly operation.
    */
    /// @param user_id The user(ethereum address) whose access to the datum is being revoked
    /// @param data_id The datum identifier for which the user's access is revoked
    /// @param newContentLocation The IPFS digest, allowing to retrieve the encrypted data
    function revokeAccess(address user_id, uint data_id, bytes32 newContentLocation) public onlyOwner() {
        removeUserByData(data_id,user_id);
        data[data_id] = newContentLocation; // because the web client has removed the sharedKey for user, the content is updated
        emit LogAccessRevoked(user_id, data_id, newContentLocation);
    }

    /// @author Jean-Marc Henry
    /// @notice Retrieve the IPFS location
    /**  @dev As described above, this will allow retriving the IPFS hash by means of base58 encoding and
    adding the constants describing the size and hash function used.
    */
    /// @param data_id The datum identifier for which we are retrieving the IPFS location
    /// @return the bytes32 value of the digest of the ipfs hash
    function getDataLocation(uint data_id) public view returns (bytes32 hash) {
        return data[data_id];
    }

    /// @author Jean-Marc Henry
    /// @notice update encrypted content and/or metadata, but not the keys
    /**  @dev To be used when the owner changes something in the data, which will change the ipfs location
    */
    /// @param data_id The datum identifier for which we are changing the IPFS location
    /// @param IPFSaddress The new IPFS digest, allowing to retrieve the encrypted data
    function updateContent(uint data_id, bytes32 IPFSaddress) public onlyOwner() {
        data[data_id] = IPFSaddress;
        emit LogDataUpdated(data_id, IPFSaddress);
    }
    /// @dev for a given data_id count the number of granted requests
    function countAuthorizedUsers(uint data_id) internal view returns (uint requestCount) {
        uint authorizedCount = 0;
        uint nb_users = users_by_data[data_id].length;
        for (uint i = 0; i < nb_users ; i++)
        {
            address current_user = users_by_data[data_id][i];
            // tricky next line - since the user is not removed from the array
            // you need to verify that the index matches that of user_indexes_by_data[data_id][current_user
            if (user_indexes_by_data[data_id][current_user] == i) {
                if (access_list[data_id][current_user] == 2) {
                    authorizedCount++;
                }
            }
        }
        return authorizedCount;
    }

    // for a given data_id, the function returns all the addresses that have access
    /// @author Jean-Marc Henry
    /// @notice For a given datum, retrive all authorized users
    /**  @dev Useful to show who has access to what in the UI.
    */
    /// @param data_id The datum identifier for which we are retrieving the authorized users
    /// @return an array of addresses, reprenting the users having access the content
    function getAuthorizedUsersForDatum(uint data_id) public view returns ( address[] memory r_the_users) {
        uint array_index = 0;
        uint array_size = countAuthorizedUsers(data_id);
        uint nb_users = users_by_data[data_id].length;
        address[] memory the_users = new address[](array_size);
        for (uint i = 0; i < nb_users ; i++)
        {
            if (user_indexes_by_data[data_id][users_by_data[data_id][i]] == i) {
                if (access_list[data_id][users_by_data[data_id][i]] == 2) {
                    the_users[array_index] = (users_by_data[data_id][i]);
                    array_index++;
                }
            }
        }
        return the_users;
    }
    function countPendingRequests() internal view returns (uint) {
        uint count_requested = 0;
        for (uint datum = 0; datum < data_index; datum++)
        {

            uint nb_users = users_by_data[datum].length;
            for (uint i = 0; i < nb_users; i++)
            {
                if (user_indexes_by_data[datum][users_by_data[datum][i]] == i) {
                    if (access_list[datum][users_by_data[datum][i]] == 1) {
                        count_requested++;
                    }
                }
            }
        }
        return count_requested;
    }

    /// @author Jean-Marc Henry
    /// @notice returns all the pending requests
    /**  @dev To be used to tell the owner who requested access to what. To be noted, that the data is only
    meaningful if interpreted as an array of tuples. The (data_id,user) tuple tells you that the user has
    requested access to the data_id.
    */
    /// @return r_data_ids in conjunction with r_users returns an array of tuples (data_id, user)
    /// @return r_data_ids in conjunction with r_users returns an array of tuples (data_id, user)
    function getAllPendingRequests() external view returns ( uint[] memory r_data_ids, address[] memory r_users) {
        uint array_index = 0;
        uint array_size = countPendingRequests();
        uint[] memory data_ids = new uint[](array_size);
        address[] memory users = new address[](array_size);

        for (uint datum = 0; datum < data_index; datum++)
        {
            uint nb_users = users_by_data[datum].length;
            for (uint i = 0; i < nb_users; i++)
            {
                if (user_indexes_by_data[datum][users_by_data[datum][i]] == i) {
                    if (access_list[datum][users_by_data[datum][i]] == 1) {
                        data_ids[array_index] = (datum);
                        users[array_index] = (users_by_data[datum][i]);
                        array_index++;
                    }
                }
            }
        }
        return (data_ids,users);

    }


    /// @author Jean-Marc Henry
    /// @notice for a given data_id and user, the function returns the access status
    /**  @dev Returns the access status, which can be used to display appropriate info in the UI.
    The app may want to listen to events, to capture the rejection, approval of access and thus update the UI in
    a timely manner.
    */
    /**  @return status can be requested (1), or granted(2). The value 0 means no access, but it will not be returned as
    it is the equivalent of no value in a mapping, which is what the data structure uses*/
    function getUserStatusForDatum(uint data_id, address user) public view returns (uint status) {
        status = access_list[data_id][user];
        return status;
    }

    /// @author Jean-Marc Henry
    /// @notice For a given user, returns the public key
    /**  @dev The public key can then be used to encrypt the shared symmetric key.
    */
    ///  @return pubx returns the X coordinate of the public key
    ///  @return puby returns the Y coordinate of the public key
    function getPublicKey(address user) public view returns (bytes32 pubx, bytes32 puby) {
        return(user_keys[user].x,user_keys[user].y);
    }

}


