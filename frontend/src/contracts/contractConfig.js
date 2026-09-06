import addressesJson from './addresses.json';

export const CONTRACT_ADDRESSES = {
  FootballCard: addressesJson.FootballCard,
  Marketplace: addressesJson.Marketplace,
  chainId: addressesJson.chainId || "31337"
};

export const FOOTBALL_CARD_ABI = [
  "function mintCard(address recipient, string memory metadataURI) public returns (uint256)",
  "function totalMinted() public view returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function approve(address to, uint256 tokenId) public",
  "function getApproved(uint256 tokenId) public view returns (address)",
  "function isApprovedForAll(address owner, address operator) public view returns (bool)",
  "function setApprovalForAll(address operator, bool approved) public",
  "event CardMinted(uint256 indexed tokenId, address indexed owner, string tokenURI)"
];

export const MARKETPLACE_ABI = [
  "function listItem(address nftContract, uint256 tokenId, uint256 price) external returns (uint256)",
  "function buyItem(uint256 listingId) external payable",
  "function cancelListing(uint256 listingId) external",
  "function getListing(uint256 listingId) external view returns (tuple(uint256 listingId, address nftContract, uint256 tokenId, address seller, uint256 price, bool active))",
  "function getActiveListings() external view returns (tuple(uint256 listingId, address nftContract, uint256 tokenId, address seller, uint256 price, bool active)[])",
  "function getActiveListingForToken(address nftContract, uint256 tokenId) external view returns (tuple(uint256 listingId, address nftContract, uint256 tokenId, address seller, uint256 price, bool active))",
  "event ItemListed(uint256 indexed listingId, address indexed nftContract, uint256 indexed tokenId, address seller, uint256 price)",
  "event ItemBought(uint256 indexed listingId, address indexed nftContract, uint256 indexed tokenId, address seller, address buyer, uint256 price)",
  "event ListingCanceled(uint256 indexed listingId, address indexed nftContract, uint256 indexed tokenId, address seller)"
];
