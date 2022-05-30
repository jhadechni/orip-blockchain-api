//SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PQRSD is Ownable {
    using Counters for Counters.Counter;
    //mapping(address => uint256) private _currentPQRSD;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _owners;

    event StatusChanged(
        address indexed owner,
        uint256 indexed tokenId,
        bytes32 indexed newStatus
    );
    event AdminAdded(address indexed actor, address newAdmin);
    event AdminRemoved(address indexed actor, address oldAdmin);

    modifier onlyAdminOrEmitter(uint256 tokenId) {
        require(
            _isEmitterOrAdmin(tokenId),
            "PQRSD: You are not the emitter of this pqrsd or an admin"
        );
        _;
    }

    mapping(address => bool) public admins;

    modifier onlyAdmins() {
        require(
            admins[msg.sender] || msg.sender == owner(),
            "You are not an admin"
        );
        _;
    }

    //Auto increment
    Counters.Counter private _tokenIds;

    function _isEmitterOrAdmin(uint256 tokenId) internal view returns (bool) {
        return
            _owners[tokenId] == msg.sender ||
            admins[msg.sender] ||
            msg.sender == owner();
    }

    /// @dev given
    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        require(
            owner != address(0),
            "PQRSD: owner query for nonexistent pqrsd"
        );
        return owner;
    }

    //Amount of pqrsds a person has active
    function balanceOf(address _wallet) public view returns (uint256) {
        return _balances[_wallet];
    }

    function stringToBytes32(string memory source)
        public
        pure
        returns (bytes32 result)
    {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }

    function create(address _tokenOwner) public onlyAdmins returns (uint256) {
        uint256 newItemId = _tokenIds.current();
        _balances[_tokenOwner] += 1;
        _owners[newItemId] = _tokenOwner;
        //_currentPQRSD[msg.sender] = newItemId;
        _tokenIds.increment();
        emit StatusChanged(_tokenOwner, newItemId, "CREATED");
        return newItemId;
    }

    function update(uint256 _tokenId, string memory _newState)
        public
        onlyAdminOrEmitter(_tokenId)
    {
        address _owner = _owners[_tokenId];
        emit StatusChanged(_owner, _tokenId, stringToBytes32(_newState));
    }

    function close(uint256 _tokenId)
        public
        onlyAdminOrEmitter(_tokenId)
        returns (bool)
    {
        address _owner = _owners[_tokenId];
        //reduce balances
        _balances[_owner] -= 1;
        //clean owner
        _owners[_tokenId] = address(0);
        emit StatusChanged(_owner, _tokenId, "CLOSED");
        return true;
    }

    /// @dev adds a new wallet to the admin map
    function addAdmin(address _newAdmin) public onlyOwner {
        admins[_newAdmin] = true;
        emit AdminAdded(_msgSender(), _newAdmin);
    }

    /// @dev removes a wallet from the admin map
    function removeAdmin(address _admin) public onlyOwner {
        require(
            _admin != owner(),
            "CertificadoTIL: Owner cannot be removed as admin"
        );
        admins[_admin] = false;
        emit AdminRemoved(_msgSender(), _admin);
    }

    /// @dev checks if wallet is an admin
    function isAdmin(address _admin) public view returns (bool) {
        return admins[_admin];
    }
}
