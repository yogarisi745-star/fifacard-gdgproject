# ⚽ FIFA CARDZ — Decentralized ERC-721 NFT Marketplace & Draft Game

FIFA CARDZ is a Web3 application built for minting, listing, buying, and trading unique FIFA Football Card NFTs on the Ethereum blockchain. It includes an interactive 4-round multiplayer draft game where players answer football trivia to gain draft priority for unique player cards.

---

## 📋 Project Overview & Features

- **ERC-721 Smart Contracts (`FootballCard.sol`)**: Mint unique player card NFTs with token IDs and IPFS/JSON metadata.
- **Marketplace Contract (`Marketplace.sol`)**:
  - `listItem()`: List owned cards for sale with an ETH price (handles `setApprovalForAll` approvals).
  - `buyItem()`: Purchase cards directly; automatically transfers the NFT to the buyer and sends ETH to the seller.
  - `cancelListing()`: Cancel active card listings anytime.
  - Reentrancy protection via OpenZeppelin `ReentrancyGuard`.
- **Marketplace Gallery**: Search cards by player name, filter by position/rarity, and sort by price or rating.
- **My Collection**: Displays cards owned by the connected wallet and squad overall rating.
- **Admin Mint Portal**: Admin interface for minting new cards via presets or IPFS URIs.
- **4-Round Quiz & Draft Game**:
  - 4 position rounds: Goalkeeper (GK), Defender (DEF), Midfielder (MID), Attacker (FWD).
  - Trivia quiz with a live timer determining 1st, 2nd, and 3rd draft priority based on accuracy and speed.
  - **Strict Unique Token Draft**: Players draft actual unique NFT card tokens so no two players get duplicate cards.

---

## 🛠 Tech Stack

- **Smart Contracts**: Solidity `^0.8.24`, Hardhat, OpenZeppelin (`ERC721URIStorage`, `Ownable`, `ReentrancyGuard`).
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide icons.
- **Web3 Provider**: Ethers.js v6, MetaMask.
- **Backend / Realtime**: Supabase (PostgreSQL & Realtime updates).

---

## 🌐 Testnet & Contract Addresses

### Localhost Network (`chainId: 31337`)
- **FootballCard Contract**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Marketplace Contract**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

### Sepolia Testnet (`chainId: 11155111`)
To deploy to Sepolia:
1. Configure `SEPOLIA_RPC_URL` and `PRIVATE_KEY` in `contracts/.env`.
2. Run `npx hardhat run scripts/deploy.js --network sepolia`.

---

## 📦 IPFS Implementation

Card metadata files adhere strictly to the ERC-721 Metadata Standard:
- **Card Graphics & JSON Schema**: Card metadata is formatted as JSON containing `name`, `description`, `image` (`ipfs://...`), and `attributes` (Position, Overall, Rarity, Pace, Shooting, etc.).
- **Metadata Storage**: Referenced via IPFS URIs (e.g. `ipfs://QmFIFAFootballCardCollectionCid/messi.json`).
- **Upload Script**: Automated uploading utility located at [`contracts/scripts/uploadToIPFS.js`](file:///c:/gdgtask/contracts/scripts/uploadToIPFS.js).

---

## 📸 Screenshots

### Marketplace Gallery & Listings
![FIFA CARDZ Marketplace](assets/screenshots/marketplace.png)

### My Collection & MetaMask Wallet Connection
![FIFA CARDZ My Collection](assets/screenshots/my_collection.png)

---

## 🔗 Deployed Link

- **Local Development App**: `http://localhost:3000`
- **GitHub Repository**: `https://github.com/yogarisi745-star/fifacard-gdgproject`

---

## 🚀 Setup Instructions

### 1. Install dependencies

```bash
# Contract dependencies
cd contracts
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Run smart contract unit tests

```bash
cd contracts
npm test
```
*Runs all 15 unit tests covering minting, marketplace approvals, ETH transfers, and listing cancellations.*

### 3. Start local Hardhat node & deploy contracts

```bash
# Terminal 1: Start local node
cd contracts
npx hardhat node

# Terminal 2: Deploy contracts and mint initial cards
cd contracts
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/mintInitialCards.js --network localhost
```

### 4. Start frontend dev server

```bash
# Terminal 3: Start Vite app
cd frontend
npm run dev
```

Open **`http://localhost:3000`** in your browser.

---

## 🎮 How to Test the Game Engine (Multiplayer Mode)

To test the draft game locally without needing 3 separate browser windows:

1. Open the **Game Lobby** tab.
2. Select **Host a Game** or **Join a Game**.
3. Click the **`+ Connect Test Player`** button in the room lobby to fill player slots.
4. Click **Start Match** to go through all 4 quiz rounds and card draft selections.

---

## 🔐 Note on Authentication

> **Note**: Google OAuth sign-in is currently under development. For testing, please register/sign in using **Email & Password** or connect directly via **MetaMask Wallet**.

---

## 📁 Repository Structure

```text
fifa-blockchain-card-game/
├── contracts/
│   ├── contracts/
│   │   ├── FootballCard.sol
│   │   └── Marketplace.sol
│   ├── scripts/
│   │   ├── deploy.js
│   │   ├── mintInitialCards.js
│   │   └── uploadToIPFS.js
│   ├── test/
│   │   └── FootballCard.test.js
│   └── hardhat.config.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── contracts/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
├── assets/
│   └── metadata/
├── supabase/
│   └── schema.sql
└── README.md
```
