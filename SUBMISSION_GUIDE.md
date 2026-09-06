# 🚀 SUBMISSION GUIDE — FIFA CARDZ Web3 DApp

This document details how to submit the **FIFA CARDZ** project to evaluators/judges and how evaluators can test and review the codebase.

---

## 📌 Recommended Submission Method

### **Option 1: GitHub Repository Link (RECOMMENDED & STANDARD FOR WEB3 SUBMISSIONS)**
Submitting a **GitHub Repository Link** is the recommended format for Web3/Smart Contract evaluations because:
1. Evaluators can inspect the **Solidity Smart Contracts** (`FootballCard.sol`, `Marketplace.sol`).
2. Evaluators can run the **15 Hardhat Unit Tests** (`npm test` in `contracts/`).
3. Evaluators can review the **Supabase Database Migration** (`supabase/schema.sql`).
4. Evaluators can launch the local Hardhat test network (`npx hardhat node`) and test Web3 transactions locally.

### **Option 2: Live Deployed App URL + GitHub Link**
You can also provide a live deployed frontend URL (e.g. Vercel/Netlify) alongside your GitHub link:
- **Frontend URL**: `https://your-app-name.vercel.app`
- **GitHub Repository**: `https://github.com/your-username/fifa-blockchain-card-game`

---

## 📋 Steps to Create Your GitHub Repository & Submit

1. **Initialize Git & Commit Files**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - FIFA CARDZ ERC-721 Web3 DApp & Game Engine"
   ```
2. **Create Remote Repository on GitHub**:
   - Go to [GitHub](https://github.com/new) and create a public repository named `fifa-blockchain-card-game`.
3. **Push Code to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/fifa-blockchain-card-game.git
   git branch -M main
   git push -u origin main
   ```
4. **Submit URL**:
   - Submit your repository URL (`https://github.com/YOUR_USERNAME/fifa-blockchain-card-game`) in the submission portal.

---

## 🔎 Evaluator Testing Checklist

When the evaluator opens your repository, they can follow these steps:

### 1. **Run Smart Contract Unit Tests (15 Passing Tests)**
```bash
cd contracts
npm install
npm test
```
*Output: 15 passing unit tests covering deployment, card minting, access control, marketplace listings, ETH transfers, and listing cancellations.*

### 2. **Run Local Blockchain & Frontend App**
```bash
# Terminal 1: Start Hardhat Node
cd contracts
npx hardhat node

# Terminal 2: Deploy Contracts & Mint Initial 15 Cards
cd contracts
npx hardhat run scripts/deploy.js --network localhost
npx hardhat run scripts/mintInitialCards.js --network localhost

# Terminal 3: Start Frontend App
cd frontend
npm install
npm run dev
```
Open **`http://localhost:3000`** in browser.

### 3. **Features to Evaluate**
- 🛒 **Marketplace Page**: Filter cards by position, rating, or rarity. Buy cards with 1 click.
- 📦 **My Collection Page**: View owned cards, calculate squad rating, list cards for sale.
- 👑 **Admin Mint Portal**: Mint new player cards using player presets or custom IPFS URIs.
- 🏆 **Game Lobby (Draft Game Engine)**: Host or join rooms, add test players (`+ Connect Test Player`), play 4 quiz/draft rounds, and see winner calculation.

---

## 📁 Finalized Directory Structure

```text
fifa-blockchain-card-game/
├── contracts/               # Smart contract suite & Hardhat test framework
│   ├── contracts/           # Solidity smart contracts
│   │   ├── FootballCard.sol # ERC-721 Token contract
│   │   └── Marketplace.sol  # NFT Marketplace contract
│   ├── scripts/             # deploy.js & mintInitialCards.js
│   ├── test/                # FootballCard.test.js (15 passing tests)
│   └── hardhat.config.js
├── frontend/                # React 18 + Vite + Tailwind CSS app
│   ├── src/
│   │   ├── components/      # Navbar, FootballCardItem, ListModal, AuthModal
│   │   ├── context/         # AuthContext.jsx
│   │   ├── contracts/       # Contract ABIs & addresses.json
│   │   ├── hooks/           # useWeb3.js
│   │   ├── lib/             # playerImages.js, lobbySyncEngine.js, supabaseClient.js
│   │   ├── pages/           # MarketplacePage, CollectionPage, AdminMintPage, GameLobbyPage
│   │   ├── App.jsx          # Root component
│   │   └── index.css        # Tailwind styling & Glassmorphism design tokens
│   ├── package.json
│   └── vite.config.js
├── assets/                  # Metadata JSON files for 15 initial cards
├── supabase/                # PostgreSQL schema & migration script (schema.sql)
├── SUBMISSION_GUIDE.md      # Submission & evaluation guide
├── .env.example             # Environment variables template
├── .gitignore               # Ignored build outputs and credentials
└── README.md                # Comprehensive project documentation
```
