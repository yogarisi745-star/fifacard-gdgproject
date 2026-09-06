import React from 'react';
import { Layers, Shield, Trophy, Tag, AlertCircle } from 'lucide-react';
import { FootballCardItem } from '../components/FootballCardItem';

export function CollectionPage({ userCards, account, onOpenListModal, onCancelListing, actionLoading, connectWallet }) {
  if (!account) {
    return (
      <div className="py-24 rounded-3xl glass-panel border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-black text-white">Connect Your Wallet</h3>
        <p className="text-slate-400 text-xs leading-relaxed px-4">
          Connect your Web3 wallet (MetaMask) to view your owned football card NFTs, monitor squad stats, and list cards for sale on the marketplace.
        </p>
        <button
          onClick={connectWallet}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
        >
          Connect MetaMask Wallet
        </button>
      </div>
    );
  }

  // Calculate statistics
  const totalCards = userCards.length;
  const topRatedPlayer = userCards.reduce((prev, curr) => (Number(curr.overall) > Number(prev.overall ? prev.overall : 0) ? curr : prev), {});
  const avgRating = totalCards > 0 
    ? Math.round(userCards.reduce((acc, curr) => acc + Number(curr.overall || 0), 0) / totalCards)
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Header Summary */}
      <div className="rounded-3xl glass-panel border border-slate-800 p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-mono mb-2">
            <span>Owner Address: {account}</span>
          </div>
          <h2 className="text-3xl font-black text-white">My Card Collection</h2>
          <p className="text-slate-400 text-xs mt-1">Manage your digital football card assets and list cards for sale.</p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center space-x-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 shrink-0">
          <div className="text-center px-3 border-r border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Total Cards</span>
            <span className="text-2xl font-black text-cyan-400">{totalCards}</span>
          </div>
          <div className="text-center px-3 border-r border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Avg Rating</span>
            <span className="text-2xl font-black text-amber-400">{avgRating}</span>
          </div>
          <div className="text-center px-3">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">Best Card</span>
            <span className="text-2xl font-black text-purple-400">{topRatedPlayer.overall || '-'}</span>
          </div>
        </div>
      </div>

      {/* Game Lobby Relation Banner */}
      {userCards.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/60 to-cyan-950/40 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 font-bold">
              🎮
            </div>
            <div>
              <h4 className="text-xs font-black text-white flex items-center space-x-2">
                <span>Game Lobby Synergy Active!</span>
                <span className="text-[10px] text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded font-mono">+{userCards.length * 2} Squad Rating Bonus</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Cards bought from Marketplace & stored in My Collection boost your match rating in the 4-Round Game Lobby Tournament.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Collection Cards Grid */}
      {userCards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {userCards.map((card) => (
            <FootballCardItem
              key={card.tokenId}
              card={card}
              account={account}
              onOpenListModal={onOpenListModal}
              onCancelListing={onCancelListing}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 rounded-3xl glass-panel border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Layers className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-300">No Owned Cards Found</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            You do not currently own any FIFA Football Cards on this wallet. Visit "Marketplace" to purchase cards or "Admin Mint" to mint new cards.
          </p>
        </div>
      )}

    </div>
  );
}
