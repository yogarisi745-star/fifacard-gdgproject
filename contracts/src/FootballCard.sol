// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FootballCard
 * @dev ERC-721 Token contract representing unique FIFA Football Cards.
 * Each card features dynamic attributes, rarity, position, overall rating, and IPFS metadata URI.
 */
contract FootballCard is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    event CardMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string tokenURI
    );

    constructor(address initialOwner)
        ERC721("FIFA Football Card", "FIFACARD")
        Ownable(initialOwner)
    {
        _nextTokenId = 1;
    }

    /**
     * @dev Mints a new football card NFT to the specified recipient address.
     * @param recipient Address to receive the minted NFT.
     * @param metadataURI IPFS CID metadata URI (e.g. ipfs://Qm.../messi.json)
     * @return tokenId The ID of the newly minted NFT.
     */
    function mintCard(address recipient, string memory metadataURI)
        public
        returns (uint256)
    {
        require(recipient != address(0), "Invalid recipient address");
        require(bytes(metadataURI).length > 0, "Metadata URI cannot be empty");

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, metadataURI);

        emit CardMinted(tokenId, recipient, metadataURI);

        return tokenId;
    }

    /**
     * @dev Returns total number of cards minted so far.
     */
    function totalMinted() public view returns (uint256) {
        return _nextTokenId - 1;
    }
}
