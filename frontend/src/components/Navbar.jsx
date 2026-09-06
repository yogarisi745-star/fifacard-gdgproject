import React from 'react';
import { Wallet, ShieldCheck, Trophy, Sparkles, LayoutGrid, Layers, User, LogIn, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Navbar({ activeTab, setActiveTab, account, balance, connectWallet, isSepolia, isLocalhost, chainId, onOpenAuthModal }) {
  const { user, isAdmin } = useAuth();

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('marketplace')}
          className="flex items-center space-x-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rx-xl rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-amber-500 p-[2px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0a0d17] rounded-[10px] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                FIFA CARDZ
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Supabase Live</span>
              </span>
            </div>
            <span className="text-[10px] block font-mono text-cyan-400/80 font-semibold tracking-widest uppercase">
              NFT MARKETPLACE
            </span>
          </div>
        </div>

        {/* Navigation Tabs - View Abstraction applied! */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/60">
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'marketplace'
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Marketplace</span>
          </button>

          <button
            onClick={() => setActiveTab('collection')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'collection'
                ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>My Collection</span>
          </button>

          <button
            onClick={() => setActiveTab('lobby')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'lobby'
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-purple-400 hover:bg-purple-900/20'
            }`}
          >
            <Trophy className="w-4 h-4 text-purple-400" />
            <span>Game Lobby</span>
          </button>

          {/* Admin Mint tab - Only visible if logged in with Admin credentials */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-amber-400 hover:bg-amber-900/20'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Admin Mint</span>
            </button>
          )}
        </nav>

        {/* Right Actions: Google Profile & Web3 Wallet */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Google Auth / Profile Button */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all"
          >
            {user ? (
              <img
                src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.email}`}
                alt="Avatar"
                className="w-5 h-5 rounded-full bg-slate-800"
              />
            ) : (
              <User className="w-4 h-4 text-purple-400" />
            )}
            <span className="hidden sm:inline">
              {user ? (user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]) : 'Sign In'}
            </span>
          </button>

          {/* Web3 Wallet Connect & Live ETH Balance */}
          {account && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs text-emerald-400 font-extrabold">
              <span>💰</span>
              <span>{balance} ETH</span>
            </div>
          )}

          <button
            onClick={connectWallet}
            title={account ? "Click to switch account in MetaMask" : "Connect MetaMask Wallet"}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] group"
          >
            <Wallet className="w-4 h-4" />
            <span>{account ? formatAddress(account) : 'Connect Wallet'}</span>
            {account && <RefreshCw className="w-3 h-3 text-cyan-200 opacity-60 group-hover:opacity-100 group-hover:rotate-180 transition-all ml-1" />}
          </button>
        </div>

      </div>
    </header>
  );
}

