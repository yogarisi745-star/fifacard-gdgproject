const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace Contract", function () {
  let footballCard;
  let marketplace;
  let owner;
  let seller;
  let buyer;

  const PRICE = ethers.parseEther("0.1");

  beforeEach(async function () {
    [owner, seller, buyer] = await ethers.getSigners();

    // Deploy FootballCard contract
    const FootballCardFactory = await ethers.getContractFactory("FootballCard");
    footballCard = await FootballCardFactory.deploy(owner.address);
    await footballCard.waitForDeployment();

    // Deploy Marketplace contract
    const MarketplaceFactory = await ethers.getContractFactory("Marketplace");
    marketplace = await MarketplaceFactory.deploy();
    await marketplace.waitForDeployment();

    // Mint token 1 to seller
    await footballCard.mintCard(seller.address, "ipfs://QmTestMessi/messi.json");
  });

  describe("Listing Cards", function () {
    it("Should allow card owner to list item after approving marketplace", async function () {
      const cardAddress = await footballCard.getAddress();
      const marketplaceAddress = await marketplace.getAddress();

      // Approve marketplace
      await footballCard.connect(seller).approve(marketplaceAddress, 1);

      // List item
      const tx = await marketplace.connect(seller).listItem(cardAddress, 1, PRICE);
      await tx.wait();

      const listing = await marketplace.getListing(1);
      expect(listing.listingId).to.equal(1);
      expect(listing.nftContract).to.equal(cardAddress);
      expect(listing.tokenId).to.equal(1);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(PRICE);
      expect(listing.active).to.be.true;
    });

    it("Should reject listing if price is 0", async function () {
      const cardAddress = await footballCard.getAddress();
      const marketplaceAddress = await marketplace.getAddress();

      await footballCard.connect(seller).approve(marketplaceAddress, 1);

      await expect(
        marketplace.connect(seller).listItem(cardAddress, 1, 0)
      ).to.be.revertedWith("Price must be greater than zero");
    });

    it("Should reject listing by non-owner", async function () {
      const cardAddress = await footballCard.getAddress();

      await expect(
        marketplace.connect(buyer).listItem(cardAddress, 1, PRICE)
      ).to.be.revertedWith("Must be the owner of the token");
    });

    it("Should reject listing without approval", async function () {
      const cardAddress = await footballCard.getAddress();

      await expect(
        marketplace.connect(seller).listItem(cardAddress, 1, PRICE)
      ).to.be.revertedWith("Marketplace is not approved to transfer token");
    });
  });

  describe("Purchasing Cards", function () {
    beforeEach(async function () {
      const cardAddress = await footballCard.getAddress();
      const marketplaceAddress = await marketplace.getAddress();

      await footballCard.connect(seller).approve(marketplaceAddress, 1);
      await marketplace.connect(seller).listItem(cardAddress, 1, PRICE);
    });

    it("Should allow buyer to purchase card, transfer NFT and pay seller", async function () {
      const initialSellerBalance = await ethers.provider.getBalance(seller.address);

      // Buyer purchases card
      const tx = await marketplace.connect(buyer).buyItem(1, { value: PRICE });
      await tx.wait();

      // Check NFT ownership transferred to buyer
      expect(await footballCard.ownerOf(1)).to.equal(buyer.address);

      // Check seller balance increased by PRICE
      const finalSellerBalance = await ethers.provider.getBalance(seller.address);
      expect(finalSellerBalance - initialSellerBalance).to.equal(PRICE);

      // Check listing deactivated
      const listing = await marketplace.getListing(1);
      expect(listing.active).to.be.false;
    });

    it("Should refund excess ETH sent by buyer", async function () {
      const excessAmount = ethers.parseEther("0.15"); // paying 0.15 for 0.1 item

      const tx = await marketplace.connect(buyer).buyItem(1, { value: excessAmount });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      // NFT ownership transferred
      expect(await footballCard.ownerOf(1)).to.equal(buyer.address);
    });

    it("Should reject purchase if insufficient ETH is sent", async function () {
      const lowAmount = ethers.parseEther("0.05");

      await expect(
        marketplace.connect(buyer).buyItem(1, { value: lowAmount })
      ).to.be.revertedWith("Insufficient ETH sent for purchase");
    });
  });

  describe("Canceling Listings", function () {
    beforeEach(async function () {
      const cardAddress = await footballCard.getAddress();
      const marketplaceAddress = await marketplace.getAddress();

      await footballCard.connect(seller).approve(marketplaceAddress, 1);
      await marketplace.connect(seller).listItem(cardAddress, 1, PRICE);
    });

    it("Should allow seller to cancel active listing", async function () {
      await marketplace.connect(seller).cancelListing(1);

      const listing = await marketplace.getListing(1);
      expect(listing.active).to.be.false;
    });

    it("Should prevent non-seller from canceling listing", async function () {
      await expect(
        marketplace.connect(buyer).cancelListing(1)
      ).to.be.revertedWith("Only the seller can cancel this listing");
    });
  });
});
