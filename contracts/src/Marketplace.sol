// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Marketplace
 * @dev Decentralized Marketplace for listing and purchasing Football Card NFTs.
 */
contract Marketplace is ReentrancyGuard {
    struct Listing {
        uint256 listingId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        uint256 price;
        bool active;
    }

    uint256 private _nextListingId;
    
    // listingId => Listing
    mapping(uint256 => Listing) private _listings;

    // nftContract => tokenId => listingId
    mapping(address => mapping(uint256 => uint256)) private _activeTokenListing;

    event ItemListed(
        uint256 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 price
    );

    event ItemBought(
        uint256 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );

    event ListingCanceled(
        uint256 indexed listingId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller
    );

    constructor() {
        _nextListingId = 1;
    }

    /**
     * @dev List an NFT on the marketplace.
     * @param nftContract Address of the ERC721 NFT contract.
     * @param tokenId ID of the token to list.
     * @param price Listing price in wei.
     */
    function listItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant returns (uint256) {
        require(price > 0, "Price must be greater than zero");
        IERC721 nft = IERC721(nftContract);

        require(
            nft.ownerOf(tokenId) == msg.sender,
            "Must be the owner of the token"
        );
        require(
            nft.isApprovedForAll(msg.sender, address(this)) ||
                nft.getApproved(tokenId) == address(this),
            "Marketplace is not approved to transfer token"
        );
        
        // Ensure not already listed actively
        uint256 existingListingId = _activeTokenListing[nftContract][tokenId];
        if (existingListingId > 0) {
            require(!_listings[existingListingId].active, "Item is already actively listed");
        }

        uint256 listingId = _nextListingId;
        _nextListingId++;

        _listings[listingId] = Listing({
            listingId: listingId,
            nftContract: nftContract,
            tokenId: tokenId,
            seller: payable(msg.sender),
            price: price,
            active: true
        });

        _activeTokenListing[nftContract][tokenId] = listingId;

        emit ItemListed(listingId, nftContract, tokenId, msg.sender, price);

        return listingId;
    }

    /**
     * @dev Buy a listed NFT.
     * @param listingId ID of the listing to purchase.
     */
    function buyItem(uint256 listingId) external payable nonReentrant {
        Listing storage listing = _listings[listingId];
        require(listing.active, "Listing is not active");
        require(msg.value >= listing.price, "Insufficient ETH sent for purchase");

        listing.active = false;
        _activeTokenListing[listing.nftContract][listing.tokenId] = 0;

        // Transfer NFT to buyer
        IERC721(listing.nftContract).safeTransferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId
        );

        // Pay seller
        (bool success, ) = listing.seller.call{value: listing.price}("");
        require(success, "ETH transfer to seller failed");

        // Refund excess ETH if buyer sent more than price
        if (msg.value > listing.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{
                value: msg.value - listing.price
            }("");
            require(refundSuccess, "ETH refund to buyer failed");
        }

        emit ItemBought(
            listingId,
            listing.nftContract,
            listing.tokenId,
            listing.seller,
            msg.sender,
            listing.price
        );
    }

    /**
     * @dev Cancel an active listing.
     * @param listingId ID of the listing to cancel.
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = _listings[listingId];
        require(listing.active, "Listing is not active");
        require(
            listing.seller == msg.sender,
            "Only the seller can cancel this listing"
        );

        listing.active = false;
        _activeTokenListing[listing.nftContract][listing.tokenId] = 0;

        emit ListingCanceled(
            listingId,
            listing.nftContract,
            listing.tokenId,
            msg.sender
        );
    }

    /**
     * @dev Get details of a specific listing.
     */
    function getListing(uint256 listingId)
        external
        view
        returns (Listing memory)
    {
        return _listings[listingId];
    }

    /**
     * @dev Get active listing ID for a specific token if available.
     */
    function getActiveListingForToken(address nftContract, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        uint256 listingId = _activeTokenListing[nftContract][tokenId];
        if (listingId > 0 && _listings[listingId].active) {
            return _listings[listingId];
        }
        return Listing(0, address(0), 0, payable(address(0)), 0, false);
    }

    /**
     * @dev Returns total number of listings created.
     */
    function totalListings() external view returns (uint256) {
        return _nextListingId - 1;
    }

    /**
     * @dev Returns array of all active listings.
     */
    function getActiveListings() external view returns (Listing[] memory) {
        uint256 total = _nextListingId - 1;
        uint256 activeCount = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (_listings[i].active) {
                activeCount++;
            }
        }

        Listing[] memory items = new Listing[](activeCount);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= total; i++) {
            if (_listings[i].active) {
                items[currentIndex] = _listings[i];
                currentIndex++;
            }
        }

        return items;
    }
}
