const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Minting initial football cards with account:", deployer.address);

  const addressesPath = path.join(__dirname, "../../frontend/src/contracts/addresses.json");
  if (!fs.existsSync(addressesPath)) {
    throw new Error("addresses.json not found! Please run deploy.js first.");
  }

  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
  const footballCard = await ethers.getContractAt("FootballCard", addresses.FootballCard);

  const metadataFiles = [
    { file: "messi.json", name: "Lionel Messi" },
    { file: "ronaldo.json", name: "Cristiano Ronaldo" },
    { file: "mbappe.json", name: "Kylian Mbappé" },
    { file: "haaland.json", name: "Erling Haaland" },
    { file: "debruyne.json", name: "Kevin De Bruyne" },
    { file: "modric.json", name: "Luka Modrić" },
    { file: "vandijk.json", name: "Virgil van Dijk" },
    { file: "dias.json", name: "Rúben Dias" },
    { file: "davies.json", name: "Alphonso Davies" },
    { file: "hakimi.json", name: "Achraf Hakimi" },
    { file: "courtois.json", name: "Thibaut Courtois" },
    { file: "alisson.json", name: "Alisson Becker" },
    { file: "bellingham.json", name: "Jude Bellingham" },
    { file: "vinicius.json", name: "Vinícius Júnior" },
    { file: "rodri.json", name: "Rodri" }
  ];

  for (let i = 0; i < metadataFiles.length; i++) {
    const item = metadataFiles[i];
    // Form standard token URI
    const tokenURI = `ipfs://QmFIFAFootballCardCollectionCid/${item.file}`;
    console.log(`Minting card ${i + 1}/${metadataFiles.length}: ${item.name}...`);
    
    const tx = await footballCard.mintCard(deployer.address, tokenURI);
    await tx.wait();
  }

  console.log("----------------------------------------------------");
  console.log(`✓ Successfully minted ${metadataFiles.length} cards to deployer wallet (${deployer.address})!`);
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
