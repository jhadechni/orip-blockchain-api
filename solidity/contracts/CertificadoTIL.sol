//SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @dev https://eips.ethereum.org/EIPS/eip-721
contract CertificadoTIL is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    //Emitido cuando un certificado se actualiza
    event Anotacion(uint256 indexed tokenId, string newTokenURI);
    event CompraVenta(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId,
        string tokenUri
    );
    event AdminAdded(address indexed actor, address newAdmin);
    event AdminRemoved(address indexed actor, address oldAdmin);
    //Auto increment
    Counters.Counter private _tokenIds;

    mapping(address => bool) public admins;

    modifier onlyAdmins() {
        require(
            admins[msg.sender] || msg.sender == owner(),
            "You are not an admin"
        );
        _;
    }

    modifier onlyApprovedOrOwner(uint256 tokenId) {
        require(
            _isApprovedOrOwner(msg.sender, tokenId) || isAdmin(_msgSender()),
            "CertificadoTIL: Caller is not token owner nor approved nor an admin"
        );
        _;
    }

    constructor(address[] memory _otherAdmins) ERC721("Certificado", "O") {
        admins[msg.sender] = true;
        for (uint256 i = 0; i < _otherAdmins.length; i++) {
            admins[_otherAdmins[i]] = true;
        }
    }

    /// @dev emits the Transfer event
    function addCertificado(address _owner, string memory tokenURI)
        external
        onlyAdmins
        returns (uint256)
    {
        uint256 newItemId = _tokenIds.current();
        _mint(_owner, newItemId);
        _setTokenURI(newItemId, tokenURI);
        _tokenIds.increment();
        return newItemId;
    }

    /// @dev update the tokenUri metadata because IPFS is content-addressed so any change to the data
    /// changes its address
    function anotacion(uint256 _tokenId, string memory _newTokenURI)
        external
        onlyAdmins
        returns (bool)
    {
        _setTokenURI(_tokenId, _newTokenURI);
        emit Anotacion(_tokenId, _newTokenURI);
        return true;
    }

    /// @dev transfers a certificate and also update its data
    function compraVenta(
        address _from,
        address _to,
        uint256 _tokenId,
        string memory _newTokenURI
    ) public onlyApprovedOrOwner(_tokenId) returns (bool) {
        /// give temporary permission to the admin to handle the token
        if (ERC721.ownerOf(_tokenId) != _msgSender()) {
            _approve(_msgSender(), _tokenId);
        }
        _transfer(_from, _to, _tokenId);
        _setTokenURI(_tokenId, _newTokenURI);
        emit CompraVenta(_from, _to, _tokenId, _newTokenURI);
        return true;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        super._afterTokenTransfer(from, to, tokenId);
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
