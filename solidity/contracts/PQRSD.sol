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

    modifier onlyEmitter(uint256 tokenId) {
        require(
            _owners[tokenId] == msg.sender,
            "PQRSD: You are not the emitter of this pqrsd"
        );
        _;
    }

    //Auto increment
    Counters.Counter private _tokenIds;

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

    function create() public returns (uint256) {
        uint256 newItemId = _tokenIds.current();
        _balances[msg.sender] += 1;
        _owners[newItemId] = msg.sender;
        //_currentPQRSD[msg.sender] = newItemId;
        _tokenIds.increment();
        emit StatusChanged(msg.sender, newItemId, "CREATED");
        return newItemId;
    }

    function update(uint256 _tokenId, string memory _newState)
        public
        onlyEmitter(_tokenId)
    {
        emit StatusChanged(msg.sender, _tokenId, stringToBytes32(_newState));
    }

    function close(uint256 _tokenId)
        public
        onlyEmitter(_tokenId)
        returns (bool)
    {
        //reduce balances
        _balances[msg.sender] -= 1;
        //clean owner
        _owners[_tokenId] = address(0);
        emit StatusChanged(msg.sender, _tokenId, "CLOSED");
        return true;
    }
}
