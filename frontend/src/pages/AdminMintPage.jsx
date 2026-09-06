import React, { useState } from 'react';
import { Sparkles, Send, CheckCircle2, AlertCircle, Loader2, Info, Link2, FileJson, ShieldAlert, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AdminMintPage({ account, onMintCard, actionLoading }) {
  const { isAdmin, adminEmail } = useAuth();

  const [recipient, setRecipient] = useState(account || '');
  const [selectedPreset, setSelectedPreset] = useState('messi');
  const [customURI, setCustomURI] = useState('');
  const [customName, setCustomName] = useState('');
  const [mintType, setMintType] = useState('preset'); // 'preset', 'ipfs', 'web'
  const [status, setStatus] = useState('idle'); // idle, minting, success, error
  const [txHash, setTxHash] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAdmin) {
    return (
      <div className="py-20 rounded-3xl glass-panel border border-slate-800 text-center space-y-5 max-w-lg mx-auto p-8">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white">Admin Privileges Required</h3>
          <p className="text-slate-400 text-xs leading-relaxed px-4">
            The Admin Mint Portal is restricted strictly to authorized platform administrators. Standard player accounts only have access to Marketplace, Card Collection, and Game Lobbies.
          </p>
        </div>

        <div className="pt-2 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-amber-400 font-bold">
            <Lock className="w-4 h-4" />
            <span>Admin Sign-In Required</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            To unlock Admin Mint capabilities, sign in using your designated Administrator credentials (<code className="text-amber-300">{adminEmail}</code>).
          </p>
        </div>
      </div>
    );
  }

  const PRESETS = [
    { id: 'messi', name: 'Lionel Messi', pos: 'RW', rating: 95, rarity: 'Legendary', uri: 'ipfs://QmFIFAFootballCardCollectionCid/messi.json' },
    { id: 'ronaldo', name: 'Cristiano Ronaldo', pos: 'ST', rating: 94, rarity: 'Legendary', uri: 'ipfs://QmFIFAFootballCardCollectionCid/ronaldo.json' },
    { id: 'mbappe', name: 'Kylian Mbappé', pos: 'LW', rating: 93, rarity: 'Legendary', uri: 'ipfs://QmFIFAFootballCardCollectionCid/mbappe.json' },
    { id: 'haaland', name: 'Erling Haaland', pos: 'ST', rating: 92, rarity: 'Epic', uri: 'ipfs://QmFIFAFootballCardCollectionCid/haaland.json' },
    { id: 'debruyne', name: 'Kevin De Bruyne', pos: 'CM', rating: 91, rarity: 'Epic', uri: 'ipfs://QmFIFAFootballCardCollectionCid/debruyne.json' },
    { id: 'modric', name: 'Luka Modrić', pos: 'CM', rating: 90, rarity: 'Epic', uri: 'ipfs://QmFIFAFootballCardCollectionCid/modric.json' },
    { id: 'vandijk', name: 'Virgil van Dijk', pos: 'CB', rating: 89, rarity: 'Epic', uri: 'ipfs://QmFIFAFootballCardCollectionCid/vandijk.json' },
    { id: 'dias', name: 'Rúben Dias', pos: 'CB', rating: 88, rarity: 'Rare', uri: 'ipfs://QmFIFAFootballCardCollectionCid/dias.json' },
    { id: 'davies', name: 'Alphonso Davies', pos: 'LB', rating: 87, rarity: 'Rare', uri: 'ipfs://QmFIFAFootballCardCollectionCid/davies.json' },
    { id: 'hakimi', name: 'Achraf Hakimi', pos: 'RB', rating: 88, rarity: 'Rare', uri: 'ipfs://QmFIFAFootballCardCollectionCid/hakimi.json' },
    { id: 'courtois', name: 'Thibaut Courtois', pos: 'GK', rating: 90, rarity: 'Epic', uri: 'ipfs://QmFIFAFootballCardCollectionCid/courtois.json' },
    { id: 'alisson', name: 'Alisson Becker', pos: 'GK', rating: 89, rarity: 'Rare', uri: 'ipfs://QmFIFAFootballCardCollectionCid/alisson.json' },
    { id: 'bellingham', name: 'Jude Bellingham', pos: 'CM', rating: 91, rarity: 'Epic', uri: 'ipfs://QmFIFAFootballCardCollectionCid/bellingham.json' },
    { id: 'vinicius', name: 'Vinícius Júnior', pos: 'LW', rating: 90, rarity: 'Epic', uri: 'ipfs://QmFIFAFootballCardCollectionCid/vinicius.json' },
    { id: 'rodri', name: 'Rodri', pos: 'CM', rating: 91, rarity: 'Epic', uri: 'ipfs://QmFIFAFootballCardCollectionCid/rodri.json' }
  ];

  const handleMint = async (e) => {
    e.preventDefault();
    const targetRecipient = recipient || account;
    if (!targetRecipient) {
      setErrorMsg('Please enter a recipient wallet address or connect your wallet.');
      return;
    }

    let tokenURI = '';
    if (mintType === 'preset') {
      const selectedItem = PRESETS.find(p => p.id === selectedPreset);
      tokenURI = selectedItem?.uri;
    } else {
      tokenURI = customURI.trim();
    }

    if (!tokenURI) {
      setErrorMsg('Please provide a valid URI or select a preset player card.');
      return;
    }

    try {
      setErrorMsg('');
      setStatus('minting');
      const hash = await onMintCard(targetRecipient, tokenURI);
      setTxHash(hash);
      setStatus('success');
    } catch (err) {
      console.error("Mint error:", err);
      setErrorMsg(err.message || 'Failed to mint NFT card.');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div className="rounded-3xl glass-panel border border-slate-800 p-8 space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Admin Mint Portal</h2>
            <p className="text-slate-400 text-xs">Mint new ERC-721 Football Cards to any Ethereum wallet address.</p>
          </div>
        </div>

        {/* Informational Guidance Alert */}
        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs space-y-2">
          <div className="flex items-center space-x-2 font-bold text-cyan-300">
            <Info className="w-4 h-4 shrink-0" />
            <span>Understanding NFT Metadata URIs vs Web Image URLs</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            In Ethereum ERC-721 NFTs, a <strong>Metadata URI</strong> points to a structured <code>.json</code> file (containing player name, stats, and image links), rather than a raw webpage or Wikipedia link. 
            For best results, use a <strong>Preset Player</strong> or an IPFS JSON link (e.g. <code>ipfs://Qm.../messi.json</code>).
          </p>
        </div>

        <form onSubmit={handleMint} className="space-y-5">
          
          {/* Recipient Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Recipient Wallet Address
            </label>
            <input
              type="text"
              placeholder="0x..."
              value={recipient || account || ''}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:border-cyan-500 outline-none"
            />
            {account && (
              <button
                type="button"
                onClick={() => setRecipient(account)}
                className="text-[10px] text-cyan-400 font-mono mt-1 hover:underline"
              >
                Use Connected Wallet ({account.substring(0, 6)}...{account.substring(account.length - 4)})
              </button>
            )}
          </div>

          {/* Mint Option Selector */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Select Card Source Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMintType('preset')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                  mintType === 'preset'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Player Preset</span>
              </button>

              <button
                type="button"
                onClick={() => setMintType('ipfs')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                  mintType === 'ipfs'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <FileJson className="w-3.5 h-3.5" />
                <span>IPFS Metadata JSON</span>
              </button>

              <button
                type="button"
                onClick={() => setMintType('web')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                  mintType === 'web'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Direct Image / Web Link</span>
              </button>
            </div>
          </div>

          {mintType === 'preset' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Player Card Preset (Includes Pre-Built Graphics & Stats)
              </label>
              <select
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-semibold text-xs focus:border-cyan-500 outline-none cursor-pointer"
              >
                {PRESETS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.pos} | Rating: {p.rating} | {p.rarity})
                  </option>
                ))}
              </select>
            </div>
          )}

          {mintType === 'ipfs' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                IPFS JSON Metadata URI
              </label>
              <input
                type="text"
                placeholder="ipfs://QmFIFA.../messi.json"
                value={customURI}
                onChange={(e) => setCustomURI(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:border-cyan-500 outline-none"
              />
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                Must point to an IPFS JSON metadata CID.
              </p>
            </div>
          )}

          {mintType === 'web' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Direct Image or Custom Web Link
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/messi-card.png"
                  value={customURI}
                  onChange={(e) => setCustomURI(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs focus:border-cyan-500 outline-none"
                />
                <p className="text-[10px] text-amber-400/90 font-mono mt-1">
                  Note: Web links are automatically wrapped as token metadata for Ethereum compatibility.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
              <div className="flex items-center space-x-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Card Minted Successfully!</span>
              </div>
              {txHash && (
                <p className="font-mono text-[11px] text-emerald-400/80 truncate">
                  Tx Hash: {txHash}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'minting' || actionLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {status === 'minting' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Minting NFT Card on Blockchain...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Mint Football Card NFT</span>
              </>
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
