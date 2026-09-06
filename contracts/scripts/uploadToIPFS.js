const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const PINATA_JWT = process.env.PINATA_JWT;

async function uploadFileToIPFS(filePath, fileName) {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  const data = new FormData();
  data.append("file", fs.createReadStream(filePath));

  const metadata = JSON.stringify({ name: fileName });
  data.append("pinataMetadata", metadata);

  const response = await axios.post(url, data, {
    maxBodyLength: "Infinity",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
      Authorization: `Bearer ${PINATA_JWT}`
    }
  });

  return response.data.IpfsHash;
}

async function uploadJSONToIPFS(jsonObject, jsonName) {
  const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
  const data = JSON.stringify({
    pinataContent: jsonObject,
    pinataMetadata: { name: jsonName }
  });

  const response = await axios.post(url, data, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`
    }
  });

  return response.data.IpfsHash;
}

async function main() {
  if (!PINATA_JWT || PINATA_JWT === "YOUR_PINATA_JWT_BEARER_TOKEN") {
    console.log("------------------------------------------------------------------");
    console.log("⚠️ PINATA_JWT environment variable is missing or using placeholder.");
    console.log("To upload assets to real IPFS automatically:");
    console.log("1. Create a free account at https://www.pinata.cloud");
    console.log("2. Generate a API JWT key in Pinata settings");
    console.log("3. Add PINATA_JWT=your_jwt_key to .env file in project root.");
    console.log("------------------------------------------------------------------");
    return;
  }

  console.log("Starting automated upload of 15 card images & metadata to Pinata IPFS...");

  const cardsDir = path.join(__dirname, "../../assets/cards");
  const metadataDir = path.join(__dirname, "../../assets/metadata");
  const outputCids = {};

  const files = fs.readdirSync(metadataDir).filter(f => f.endsWith(".json"));

  for (const file of files) {
    const playerId = file.replace(".json", "");
    const imagePath = path.join(cardsDir, `${playerId}.svg`);
    const jsonPath = path.join(metadataDir, file);

    console.log(`Uploading ${playerId} image to IPFS...`);
    const imageCid = await uploadFileToIPFS(imagePath, `${playerId}.svg`);
    console.log(`✓ Image CID: ipfs://${imageCid}`);

    // Update metadata image CID
    const rawMeta = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    rawMeta.image = `ipfs://${imageCid}`;

    console.log(`Uploading ${playerId} metadata to IPFS...`);
    const metaCid = await uploadJSONToIPFS(rawMeta, file);
    console.log(`✓ Metadata CID: ipfs://${metaCid}`);

    outputCids[playerId] = {
      imageCid: `ipfs://${imageCid}`,
      metadataCid: `ipfs://${metaCid}`
    };
  }

  const outputPath = path.join(__dirname, "../../assets/pinnedCids.json");
  fs.writeFileSync(outputPath, JSON.stringify(outputCids, null, 2));

  console.log("------------------------------------------------------------------");
  console.log("✓ All 15 cards successfully uploaded to IPFS via Pinata!");
  console.log(`Saved CIDs to ${outputPath}`);
  console.log("------------------------------------------------------------------");
}

main().catch((error) => {
  console.error("IPFS Upload Error:", error?.response?.data || error.message);
  process.exitCode = 1;
});
