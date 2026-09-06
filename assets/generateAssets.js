const fs = require("fs");
const path = require("path");

const cardsDir = path.join(__dirname, "cards");
const metadataDir = path.join(__dirname, "metadata");

if (!fs.existsSync(cardsDir)) fs.mkdirSync(cardsDir, { recursive: true });
if (!fs.existsSync(metadataDir)) fs.mkdirSync(metadataDir, { recursive: true });

const players = [
  { id: "messi", name: "Lionel Messi", position: "RW", overall: 95, rarity: "Legendary", pace: 89, shooting: 92, passing: 94, dribbling: 95, defending: 35, physical: 68, color: "#e6ad16" },
  { id: "ronaldo", name: "Cristiano Ronaldo", position: "ST", overall: 94, rarity: "Legendary", pace: 87, shooting: 93, passing: 81, dribbling: 88, defending: 34, physical: 77, color: "#e6ad16" },
  { id: "mbappe", name: "Kylian Mbappé", position: "LW", overall: 93, rarity: "Legendary", pace: 97, shooting: 90, passing: 80, dribbling: 92, defending: 36, physical: 78, color: "#e6ad16" },
  { id: "haaland", name: "Erling Haaland", position: "ST", overall: 92, rarity: "Epic", pace: 89, shooting: 93, passing: 66, dribbling: 80, defending: 45, physical: 88, color: "#9333ea" },
  { id: "debruyne", name: "Kevin De Bruyne", position: "CM", overall: 91, rarity: "Epic", pace: 72, shooting: 88, passing: 94, dribbling: 87, defending: 65, physical: 78, color: "#9333ea" },
  { id: "modric", name: "Luka Modrić", position: "CM", overall: 90, rarity: "Epic", pace: 73, shooting: 76, passing: 89, dribbling: 88, defending: 72, physical: 66, color: "#9333ea" },
  { id: "vandijk", name: "Virgil van Dijk", position: "CB", overall: 89, rarity: "Epic", pace: 78, shooting: 60, passing: 71, dribbling: 72, defending: 91, physical: 86, color: "#9333ea" },
  { id: "dias", name: "Rúben Dias", position: "CB", overall: 88, rarity: "Rare", pace: 67, shooting: 39, passing: 68, dribbling: 69, defending: 89, physical: 87, color: "#2563eb" },
  { id: "davies", name: "Alphonso Davies", position: "LB", overall: 87, rarity: "Rare", pace: 95, shooting: 66, passing: 77, dribbling: 84, defending: 76, physical: 77, color: "#2563eb" },
  { id: "hakimi", name: "Achraf Hakimi", position: "RB", overall: 88, rarity: "Rare", pace: 92, shooting: 75, passing: 80, dribbling: 82, defending: 78, physical: 79, color: "#2563eb" },
  { id: "courtois", name: "Thibaut Courtois", position: "GK", overall: 90, rarity: "Epic", pace: 85, shooting: 89, passing: 76, dribbling: 93, defending: 46, physical: 90, color: "#9333ea" },
  { id: "alisson", name: "Alisson Becker", position: "GK", overall: 89, rarity: "Rare", pace: 86, shooting: 85, passing: 85, dribbling: 89, defending: 48, physical: 90, color: "#2563eb" },
  { id: "bellingham", name: "Jude Bellingham", position: "CM", overall: 91, rarity: "Epic", pace: 82, shooting: 86, passing: 87, dribbling: 88, defending: 78, physical: 84, color: "#9333ea" },
  { id: "vinicius", name: "Vinícius Júnior", position: "LW", overall: 90, rarity: "Epic", pace: 95, shooting: 82, passing: 78, dribbling: 92, defending: 29, physical: 68, color: "#9333ea" },
  { id: "rodri", name: "Rodri", position: "CM", overall: 91, rarity: "Epic", pace: 61, shooting: 74, passing: 85, dribbling: 80, defending: 87, physical: 85, color: "#9333ea" }
];

function generateSVG(p) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 500" width="350" height="500">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.color}"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>
  </defs>

  <!-- Card Background -->
  <rect x="10" y="10" width="330" height="480" rx="24" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="4"/>
  <rect x="18" y="18" width="314" height="464" rx="18" fill="none" stroke="${p.color}" stroke-opacity="0.3" stroke-width="1.5"/>

  <!-- Top Info Badge -->
  <text x="45" y="70" font-family="'Outfit', sans-serif" font-weight="900" font-size="44" fill="${p.color}">${p.overall}</text>
  <text x="45" y="96" font-family="'Outfit', sans-serif" font-weight="700" font-size="20" fill="#94a3b8">${p.position}</text>

  <!-- Rarity Pill -->
  <rect x="200" y="45" width="105" height="28" rx="14" fill="${p.color}" fill-opacity="0.2" stroke="${p.color}" stroke-width="1"/>
  <text x="252" y="64" font-family="'Outfit', sans-serif" font-weight="700" font-size="12" fill="${p.color}" text-anchor="middle">${p.rarity.toUpperCase()}</text>

  <!-- Player Avatar Graphic -->
  <circle cx="175" cy="180" r="65" fill="#1e293b" stroke="${p.color}" stroke-width="2"/>
  <text x="175" y="195" font-family="sans-serif" font-size="50" text-anchor="middle">⚽</text>

  <!-- Player Name -->
  <text x="175" y="290" font-family="'Outfit', sans-serif" font-weight="800" font-size="24" fill="#ffffff" text-anchor="middle" letter-spacing="1">${p.name.toUpperCase()}</text>
  <line x1="50" y1="305" x2="300" y2="305" stroke="${p.color}" stroke-opacity="0.5" stroke-width="2"/>

  <!-- Stats Grid -->
  <g font-family="'Outfit', sans-serif" font-size="14" fill="#e2e8f0">
    <text x="75" y="340"><tspan font-weight="bold" fill="${p.color}">${p.pace}</tspan> PAC</text>
    <text x="75" y="375"><tspan font-weight="bold" fill="${p.color}">${p.shooting}</tspan> SHO</text>
    <text x="75" y="410"><tspan font-weight="bold" fill="${p.color}">${p.passing}</tspan> PAS</text>

    <text x="195" y="340"><tspan font-weight="bold" fill="${p.color}">${p.dribbling}</tspan> DRI</text>
    <text x="195" y="375"><tspan font-weight="bold" fill="${p.color}">${p.defending}</tspan> DEF</text>
    <text x="195" y="410"><tspan font-weight="bold" fill="${p.color}">${p.physical}</tspan> PHY</text>
  </g>

  <!-- Footer Tag -->
  <text x="175" y="455" font-family="'Outfit', sans-serif" font-weight="600" font-size="11" fill="#64748b" text-anchor="middle">FIFA BLOCKCHAIN CARD GAME</text>
</svg>`;
}

console.log("Generating 15 player card SVGs and JSON metadata...");

players.forEach((p) => {
  const svgContent = generateSVG(p);
  const cardPath = path.join(cardsDir, `${p.id}.svg`);
  fs.writeFileSync(cardPath, svgContent);

  const metadata = {
    name: p.name,
    description: `Official ${p.rarity} FIFA Football Card for ${p.name}.`,
    image: `ipfs://placeholder/${p.id}.svg`,
    attributes: [
      { trait_type: "Position", value: p.position },
      { trait_type: "Overall", value: p.overall.toString() },
      { trait_type: "Rarity", value: p.rarity },
      { trait_type: "Pace", value: p.pace.toString() },
      { trait_type: "Shooting", value: p.shooting.toString() },
      { trait_type: "Passing", value: p.passing.toString() },
      { trait_type: "Dribbling", value: p.dribbling.toString() },
      { trait_type: "Defending", value: p.defending.toString() },
      { trait_type: "Physical", value: p.physical.toString() }
    ]
  };

  const metadataPath = path.join(metadataDir, `${p.id}.json`);
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
});

console.log("✓ Successfully generated 15 player cards & metadata files!");
