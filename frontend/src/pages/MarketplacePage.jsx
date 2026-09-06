import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, Sparkles, RefreshCw } from 'lucide-react';
import { FootballCardItem } from '../components/FootballCardItem';

export function MarketplacePage({ listings, account, onBuy, onOpenListModal, onCancelListing, actionLoading, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('ALL');
  const [selectedRarity, setSelectedRarity] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  const positions = ['ALL', 'GK', 'CB', 'LB', 'RB', 'CM', 'LW', 'RW', 'ST'];
  const rarities = ['ALL', 'Legendary', 'Epic', 'Rare'];

  const filteredListings = useMemo(() => {
    return listings.filter(card => {
      if (card.active === false) return false;
      const matchesSearch = card.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            card.position?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition = selectedPosition === 'ALL' || card.position?.toUpperCase() === selectedPosition;
      const matchesRarity = selectedRarity === 'ALL' || card.rarity?.toLowerCase() === selectedRarity.toLowerCase();
      return matchesSearch && matchesPosition && matchesRarity;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
      if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
      if (sortBy === 'rating-high') return Number(b.overall) - Number(a.overall);
      return Number(b.tokenId) - Number(a.tokenId);
    });
  }, [listings, searchTerm, selectedPosition, selectedRarity, sortBy]);

  return (
    <div className="space-y-6">
      
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-800 p-8 lg:p-12">
        <div className="absolute -right-12 -bottom-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -top-12 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Decentralized Ethereum Marketplace</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Collect, Trade & Build Your <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-amber-400 bg-clip-text text-transparent">Ultimate Squad</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Trade ERC-721 football card NFTs verified on the Ethereum blockchain. Filter by player position, overall rating, and rarity to build a championship team.
          </p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-slate-800/80">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search player name or position (e.g. Messi, RW)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Position Selector */}
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold text-slate-300 focus:border-cyan-500 outline-none cursor-pointer"
          >
            {positions.map(p => (
              <option key={p} value={p}>Position: {p}</option>
            ))}
          </select>

          {/* Rarity Selector */}
          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold text-slate-300 focus:border-cyan-500 outline-none cursor-pointer"
          >
            {rarities.map(r => (
              <option key={r} value={r}>Rarity: {r}</option>
            ))}
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold text-slate-300 focus:border-cyan-500 outline-none cursor-pointer"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating-high">Overall Rating: High to Low</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh Listings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Cards Grid */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredListings.map((card) => (
            <FootballCardItem
              key={card.listingId || card.tokenId}
              card={card}
              account={account}
              onBuy={onBuy}
              onOpenListModal={onOpenListModal}
              onCancelListing={onCancelListing}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 rounded-3xl glass-panel border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Sparkles className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-300">No Cards Available</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            {searchTerm || selectedPosition !== 'ALL' || selectedRarity !== 'ALL'
              ? 'No active card listings match your search parameters. Try adjusting your filters.'
              : 'There are currently no active listings on the marketplace. Visit "Admin Mint" to mint initial cards or list cards from "My Collection".'}
          </p>
        </div>
      )}

    </div>
  );
}
