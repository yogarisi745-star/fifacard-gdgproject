const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("----------------------------------------------------");
  console.log("Deploying contracts with account:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  console.log("----------------------------------------------------");

  // 1. Deploy FootballCard contract
  const FootballCard = await ethers.getContractFactory("FootballCard");
  const footballCard = await FootballCard.deploy(deployer.address);
  await footballCard.waitForDeployment();
  const footballCardAddress = await footballCard.getAddress();
  console.log("✓ FootballCard deployed to:", footballCardAddress);

  // 2. Deploy Marketplace contract
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✓ Marketplace deployed to:", marketplaceAddress);

  console.log("----------------------------------------------------");

  // Save contract addresses and ABIs to frontend configuration
  const frontendContractsDir = path.join(__dirname, "../../frontend/src/contracts");
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  const addresses = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    FootballCard: footballCardAddress,
    Marketplace: marketplaceAddress
  };

  fs.writeFileSync(
    path.join(frontendContractsDir, "addresses.json"),
    JSON.stringify(addresses, null, 2)
  );

  const FootballCardArtifact = await artifacts.readArtifact("FootballCard");
  fs.writeFileSync(
    path.join(frontendContractsDir, "FootballCard.json"),
    JSON.stringify(FootballCardArtifact, null, 2)
  );

  const MarketplaceArtifact = await artifacts.readArtifact("Marketplace");
  fs.writeFileSync(
    path.join(frontendContractsDir, "Marketplace.json"),
    JSON.stringify(MarketplaceArtifact, null, 2)
  );

  console.log("✓ Successfully saved contract addresses & ABIs to frontend/src/contracts/");
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
