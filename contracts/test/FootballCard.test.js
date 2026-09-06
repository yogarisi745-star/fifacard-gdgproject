const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FootballCard Contract", function () {
  let footballCard;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const FootballCardFactory = await ethers.getContractFactory("FootballCard");
    footballCard = await FootballCardFactory.deploy(owner.address);
    await footballCard.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await footballCard.owner()).to.equal(owner.address);
    });

    it("Should start with 0 total minted cards", async function () {
      expect(await footballCard.totalMinted()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should mint a card successfully and assign correct token ID and owner", async function () {
      const uri = "ipfs://QmTestHashMessi/messi.json";

      const tx = await footballCard.mintCard(addr1.address, uri);
      await tx.wait();

      expect(await footballCard.totalMinted()).to.equal(1);
      expect(await footballCard.ownerOf(1)).to.equal(addr1.address);
      expect(await footballCard.tokenURI(1)).to.equal(uri);
    });

    it("Should assign unique incremental token IDs for multiple cards", async function () {
      const uri1 = "ipfs://QmTestHashMessi/messi.json";
      const uri2 = "ipfs://QmTestHashRonaldo/ronaldo.json";

      await footballCard.mintCard(addr1.address, uri1);
      await footballCard.mintCard(addr2.address, uri2);

      expect(await footballCard.ownerOf(1)).to.equal(addr1.address);
      expect(await footballCard.ownerOf(2)).to.equal(addr2.address);
      expect(await footballCard.totalMinted()).to.equal(2);
    });

    it("Should emit CardMinted event upon minting", async function () {
      const uri = "ipfs://QmTestHashNeymar/neymar.json";

      await expect(footballCard.mintCard(addr1.address, uri))
        .to.emit(footballCard, "CardMinted")
        .withArgs(1, addr1.address, uri);
    });

    it("Should reject minting with empty address or empty metadata URI", async function () {
      await expect(
        footballCard.mintCard(ethers.ZeroAddress, "ipfs://someuri")
      ).to.be.revertedWith("Invalid recipient address");

      await expect(
        footballCard.mintCard(addr1.address, "")
      ).to.be.revertedWith("Metadata URI cannot be empty");
    });
  });
});
