# ⚽ FIFA CARDZ — Decentralized ERC-721 NFT Marketplace & 4-Round Game Engine
**GDG Blockchain Team Recruitment — Submission Documentation**

FIFA CARDZ is a decentralized Web3 application for minting, listing, buying, and trading unique FIFA Football Card NFTs on the Ethereum blockchain, paired with an interactive 4-round provably fair multiplayer draft game.

> 📄 **Submission & Evaluator Guide**: For step-by-step submission instructions and evaluation procedures, see [`SUBMISSION_GUIDE.md`](file:///c:/gdgtask/SUBMISSION_GUIDE.md).

---

## 📋 Table of Contents
1. [📥 How to Submit & Evaluator Quick Start](#1-📥-how-to-submit--evaluator-quick-start)
2. [🌟 Project Overview & Core Features](#2-🌟-project-overview--core-features)
3. [🛠 Tech Stack](#3-🛠-tech-stack)
4. [📁 Folder & File Structure](#4-📁-folder--file-structure)
5. [🚀 Setup & Running Instructions](#5-🚀-setup--running-instructions)
6. [🔒 Gitignore & Environment Configuration](#6-🔒-gitignore--environment-configuration)
7. [🛒 Marketplace Buy & Sell System](#7-🛒-marketplace-buy--sell-system)
8. [🗄️ Supabase Connection & Setup](#8-🗄️-supabase-connection--setup)
9. [🔐 Authentication Note (Google Auth Notice)](#9-🔐-authentication-note-google-auth-notice)
10. [🏆 Game Engine, Lobby & Multiplayer Testing](#10-🏆-game-engine-lobby--multiplayer-testing)

---

## 1. 📥 How to Submit & Evaluator Quick Start

### **Submission Format Options**
- **Option A: GitHub Repository Link (Recommended)**: Push this codebase to a public GitHub repository (e.g. `https://github.com/YOUR_USERNAME/fifa-blockchain-card-game`) and submit the URL.
- **Option B: Live Deployment + GitHub Link**: Deploy frontend to Vercel or Netlify and submit both the live link and GitHub repository URL.

### **Quick Evaluator Test Steps**
1. **Run 15 Smart Contract Unit Tests**: `cd contracts && npm test`
2. **Start Local Blockchain**: `npx hardhat node`
3. **Deploy & Mint Cards**: `npx hardhat run scripts/deploy.js --network localhost && npx hardhat run scripts/mintInitialCards.js --network localhost`
4. **Start Web App**: `cd frontend && npm run dev` (Open `http://localhost:3000`)
5. **Test Multiplayer Game**: Open **Game Lobby** tab and click **`+ Connect Test Player`** to play all 4 tournament rounds instantly!

## 1. 🌟 Project Overview & Core Features

- **ERC-721 Smart Contract (`FootballCard.sol`)**: Mint unique game cards with unique token IDs, stored on-chain with metadata URIs pointing to IPFS or standard JSON metadata.
- **Decentralized Marketplace Contract (`Marketplace.sol`)**:
  - `listItem()`: Set price in ETH and list owned cards for sale. Enforces `setApprovalForAll` approval before listing.
  - `buyItem()`: Direct purchase with instant NFT transfer to buyer and ETH payout to seller.
  - `cancelListing()`: Seller can remove active marketplace listings anytime.
  - Protected with OpenZeppelin `ReentrancyGuard`.
- **Marketplace Gallery**: Browse, search by player name/position, filter by position/rarity, and sort by price or rating with live updates.
- **My Collection**: Track cards owned by the connected wallet, view squad rating, and list cards for sale.
- **Admin Mint Portal**: Restrict minting capabilities to designated platform admins to mint new cards using presets or custom IPFS URIs.
- **4-Round Quiz & Draft Tournament Game**:
  - 4 Position Rounds: Goalkeeper (**GK**), Defender (**DEF**), Midfielder (**MID**), Attacker (**FWD**).
  - 5 MCQs per round with live stopwatch timer determining 1st, 2nd, and 3rd turn priority based on accuracy and speed.
  - **Strict ERC-721 Uniqueness**: Drafts actual unique NFT tokens — no two players can ever hold duplicate cards!

---

## 2. 🛠 Tech Stack

- **Smart Contracts**: Solidity `^0.8.24`, Hardhat, OpenZeppelin (`ERC721URIStorage`, `Ownable`, `ReentrancyGuard`).
- **Frontend Framework**: React 18, Vite 5, Tailwind CSS, Lucide React icons.
- **Web3 Integration**: Ethers.js v6, MetaMask Browser Wallet Provider.
- **Decentralized Storage**: IPFS (Pinata API Integration & standard `ipfs://` URIs).
- **Backend / Realtime Sync**: Supabase (Realtime PostgreSQL & Auth) + Cross-tab Broadcast Channel.

---

## 3. 📁 Folder & File Structure

```text
fifa-blockchain-card-game/
├── contracts/               # Hardhat smart contracts, 15 unit tests & deployment scripts
│   ├── contracts/           # Solidity source code
│   │   ├── FootballCard.sol # ERC-721 Smart Contract with URI storage
│   │   └── Marketplace.sol  # Decentralized NFT Marketplace contract
│   ├── scripts/             # Deployment & minting scripts
│   │   ├── deploy.js        # Compiles & deploys contracts to network
│   │   └── mintInitialCards.js # Mints initial 15 player NFT card batch
│   ├── test/                # Hardhat test suite (15 passing unit tests)
│   │   └── FootballCard.test.js
│   └── hardhat.config.js    # Hardhat configuration
├── frontend/                # React 18 + Vite + Tailwind CSS SPA
│   ├── public/              # Static public assets
│   ├── src/
│   │   ├── components/      # Navbar, FootballCardItem, ListModal, AuthModal
│   │   ├── context/         # AuthContext.jsx (Supabase authentication provider)
│   │   ├── contracts/       # Auto-generated ABIs & addresses.json
│   │   ├── hooks/           # useWeb3.js (MetaMask provider integration)
│   │   ├── lib/             # playerImages.js, lobbySyncEngine.js, supabaseClient.js
│   │   ├── pages/           # MarketplacePage, CollectionPage, AdminMintPage, GameLobbyPage
│   │   ├── App.jsx          # Main application component & tab routing
│   │   └── index.css        # Tailwind styling & Glassmorphism design tokens
│   └── package.json         # Frontend dependencies
├── assets/                  # 15 Player metadata JSON files & graphics generator
│   ├── metadata/            # messi.json, ronaldo.json, mbappe.json, etc.
│   └── generateAssets.js    # Asset generator script
├── supabase/                # PostgreSQL schema & migration script
│   └── schema.sql           # Database tables, RLS policies & Realtime publication
├── .env.example             # Template environment variables
├── .gitignore               # Excluded files & directories
└── README.md                # Submission documentation
```

---

## 4. 🚀 Setup & Running Instructions

### **Step 1: Install Dependencies**
```bash
# Install smart contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### **Step 2: Run Unit Tests**
```bash
cd contracts
npm test
```
*Runs all 15 unit tests covering contract deployment, minting, access control, marketplace listings, ETH transfers, and cancellations.*

### **Step 3: Start Local Blockchain & App**
```bash
# Terminal 1: Start Hardhat Local Ethereum Node (chainId: 31337)
cd contracts
npx hardhat node

# Terminal 2: Deploy Contracts & Mint Initial 15 Cards
cd contracts
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/mintInitialCards.js --network localhost

# Terminal 3: Start Frontend App
cd frontend
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 5. 🔒 Gitignore & Environment Configuration

The repository `.gitignore` ensures sensitive credentials and build artifacts are excluded:

```gitignore
# Excluded Dependencies
node_modules/

# Excluded Build & Artifact Output
frontend/dist/
frontend/build/
contracts/artifacts/
contracts/cache/

# Excluded Environment Files (Contains private keys & API credentials)
.env
.env.local
.env.development.local

# Operating System & IDE Files
.DS_Store
.vscode/
.idea/
```

---

## 6. 🛒 Marketplace Buy & Sell System

The marketplace allows users to buy and sell ERC-721 Football Cards seamlessly:

### **Listing a Card for Sale (Sell)**
1. Navigate to **My Collection** tab.
2. Click **List for Sale** on an owned card.
3. Enter listing price in **ETH** (subject to fair-market economy safety checks).
4. Step 1 approves the Marketplace contract (`setApprovalForAll`).
5. Step 2 creates the on-chain listing (`listItem()`).
6. The listing is broadcasted in real time to all connected users and saved in Supabase.

### **Purchasing a Card (Buy)**
1. Navigate to **Marketplace** tab.
2. Click **Buy Card Now** on any active listing.
3. Confirm the ETH payment transaction in MetaMask (`buyItem()`).
4. The NFT is instantly transferred on-chain to the buyer's address, ETH is transferred to the seller, and the item moves from Marketplace to **My Collection**.

---

## 7. 🗄️ Supabase Connection & Setup

Supabase PostgreSQL & Realtime enable multi-account state synchronization across browser windows:

1. **Schema Script Execution**:
   - Run [`supabase/schema.sql`](file:///c:/gdgtask/supabase/schema.sql) in the Supabase SQL Editor.
   - Tables created: `profiles`, `marketplace_listings`, `user_cards`, `game_rooms`.
2. **Client Integration**:
   - Managed in [`frontend/src/lib/supabaseClient.js`](file:///c:/gdgtask/frontend/src/lib/supabaseClient.js).
   - Functions `saveMarketplaceListingToSupabase`, `completePurchaseInSupabase`, and `subscribeToSupabaseMarketplace` keep frontend UI in sync with the database.

---

## 8. 🔐 Authentication Note (Google Auth Notice)

> [!IMPORTANT]
> **Google Auth Feature Notice**:
> Google OAuth authentication is **currently under development** and will be integrated in a future release. In the interim, users can sign up and sign in using **Email / Password** or connect directly using their **Web3 MetaMask Wallet**.

---

## 9. 🏆 Game Engine, Lobby & Multiplayer Testing

### **Game Logic & Tournament System**

The **FIFA CARDZ Draft Tournament** is a 4-round competitive game:

1. **4 Position Rounds**:
   - **Round 1**: Goalkeepers (GK)
   - **Round 2**: Defenders (DEF)
   - **Round 3**: Midfielders (MID)
   - **Round 4**: Attackers (FWD)
2. **Speed & Accuracy MCQ Quiz**:
   - Each round presents 5 football MCQs with a live stopwatch timer.
   - Player score is calculated based on:
     1. **Accuracy** (number of correct answers).
     2. **Speed** (lowest elapsed time in seconds).
   - Turn priority rank (1st, 2nd, 3rd pick) is awarded to the player with the highest accuracy and fastest time.
3. **Strict Zero-Duplicate ERC-721 Draft Rule**:
   - In each draft round, players select cards sequentially according to turn rank.
   - Once a card token is claimed, it is locked and unavailable to subsequent players — guaranteeing no duplicate cards exist across squads.
4. **Squad Rating & Collection Bonus**:
   - At the end of 4 rounds, each player's 4-card squad overall rating is calculated.
   - Players holding cards in **My Collection** receive a **Collection Bonus** (+2 overall rating per owned NFT card).
   - The player with the highest total squad score wins the tournament!

### **Testing Multiplayer via "Connect Test Player"**

To test the game engine locally without needing 3 separate devices or browser windows:

1. Click **Game Lobby** in the top navigation bar.
2. Select **Host a Game** or **Join a Game**.
3. In the room control panel, click **`+ Connect Test Player`**.
4. Test player slots will be added to the room instantly.
5. Click **Launch Tournament Match** to play through all 4 quiz and draft rounds seamlessly!
