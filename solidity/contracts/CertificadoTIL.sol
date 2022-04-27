//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @dev https://eips.ethereum.org/EIPS/eip-721
contract CertificadoTIL is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    /// @dev TODO: move these to IPFS storage
    struct CertificadoMetadata {
        //No. Matricula
        string enrollNumber;
        string description;
        uint256 area;
        uint256 areaDecimals;
        // Estado folio
        bool invoiceState;
        string[] actorIds;
    }

    mapping(uint256 => CertificadoMetadata) private tokenMetadata;

    constructor() ERC721("Certificado", "O") {}

    function addCertificado(
        address _owner,
        CertificadoMetadata memory _metadata,
        string memory tokenURI
    ) external returns (uint256) {
        uint256 newItemId = _tokenIds.current();
        _mint(_owner, newItemId);
        _setTokenURI(newItemId, tokenURI);
        tokenMetadata[newItemId] = _metadata;
        _tokenIds.increment();
        return newItemId;
    }

    function updateCertificado(
        uint256 _tokenId,
        CertificadoMetadata memory _newMetadata
    ) external returns (bool) {
        tokenMetadata[_tokenId] = _newMetadata;
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
