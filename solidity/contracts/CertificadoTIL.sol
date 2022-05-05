//SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @dev https://eips.ethereum.org/EIPS/eip-721
contract CertificadoTIL is ERC721URIStorage {
    using Counters for Counters.Counter;

    //Emitido cuando un certificado se actualiza
    event TokenUpdated(uint256 indexed tokenId, string newTokenURI);
    //Auto increment
    Counters.Counter private _tokenIds;

    constructor() ERC721("Certificado", "O") {}

    /// @dev emits the Transfer event
    function addCertificado(address _owner, string memory tokenURI)
        external
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
    function updateCertificado(uint256 _tokenId, string memory _newTokenURI)
        external
        returns (bool)
    {
        _setTokenURI(_tokenId, _newTokenURI);
        emit TokenUpdated(_tokenId, _newTokenURI);
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
}
