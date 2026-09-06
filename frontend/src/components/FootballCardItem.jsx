import React, { useState } from 'react';
import { ShoppingBag, Tag, Shield, Zap, User, ArrowUpRight, XCircle } from 'lucide-react';
import { ethers } from 'ethers';
import { getPlayerImageUrl } from '../lib/playerImages';

export function FootballCardItem({ card, account, onBuy, onOpenListModal, onCancelListing, actionLoading }) {
  const [imgError, setImgError] = useState(false);
  const isOwner = account && card.owner && account.toLowerCase() === card.owner.toLowerCase();
  const isSeller = account && card.seller && account.toLowerCase() === card.seller.toLowerCase();
  const isListed = card.active;

  // Format price in ETH
  const formattedPrice = card.price ? ethers.formatEther(card.price) : '0';
  const imgUrl = card.imageUrl || getPlayerImageUrl(card.tokenId, card.name);

  const getRarityBadgeColor = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/10';
      case 'epic':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-purple-500/10';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-cyan-500/10';
    }
  };

  return (
    <div className="group relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 flex flex-col justify-between overflow-hidden">
      
      {/* Card Header & Badges */}
      <div className="p-4 pb-2 flex items-center justify-between z-10">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getRarityBadgeColor(card.rarity)}`}>
          {card.rarity || 'RARE'}
        </span>
        {isListed && (
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>FOR SALE</span>
          </span>
        )}
      </div>

      {/* Card Graphic Viewport */}
      <div className="relative px-4 py-2 flex items-center justify-center">
        {card.imageSvg ? (
          <div 
            className="w-full max-w-[240px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] group-hover:scale-[1.03] transition-transform duration-300"
            dangerouslySetInnerHTML={{ __html: card.imageSvg }}
          />
        ) : imgUrl && !imgError ? (
          <div className="relative w-full h-64 rounded-xl overflow-hidden border border-slate-800/80 shadow-inner group">
            <img 
              src={imgUrl} 
              alt={card.name} 
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
            <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-slate-950/80 backdrop-blur border border-amber-500/40 font-black text-amber-400 text-sm">
              {card.overall || 90}
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs font-bold text-white">
              <span className="truncate">{card.name}</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">{card.position || 'ST'}</span>
            </div>
          </div>
        ) : (
          <div className="w-full h-64 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-4">
            <div className="text-4xl font-extrabold text-amber-400 mb-1">{card.overall || '90'}</div>
            <div className="text-slate-200 font-bold uppercase tracking-wider text-center">{card.name || `Token #${card.tokenId}`}</div>
            <div className="text-cyan-400 text-xs mt-1 font-semibold">{card.position || 'ST'}</div>
          </div>
        )}
      </div>

      {/* Info & Stats Summary */}
      <div className="p-4 bg-slate-950/60 border-t border-slate-900 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-white tracking-wide group-hover:text-cyan-300 transition-colors">
              {card.name}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Token ID: <span className="font-mono text-cyan-400">#{card.tokenId}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Overall</div>
            <div className="text-lg font-black text-amber-400 leading-none">{card.overall}</div>
          </div>
        </div>

        {/* Dynamic Action Bar */}
        <div className="pt-2 border-t border-slate-800/80">
          {isListed ? (
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Price</span>
                <div className="text-lg font-black text-white flex items-center space-x-1">
                  <span>{formattedPrice}</span>
                  <span className="text-xs text-cyan-400 font-bold">ETH</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Seller</span>
                <span className="text-[11px] font-mono text-slate-300">
                  {isSeller ? 'You' : `${card.seller?.substring(0, 5)}...`}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-slate-400">Status</span>
              <span className="text-xs font-semibold text-slate-300">
                {isOwner ? 'In Your Collection' : 'Not Listed'}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          {isListed && !isSeller && (
            <button
              onClick={() => onBuy(card)}
              disabled={actionLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Buy Card Now</span>
            </button>
          )}

          {isListed && isSeller && (
            <button
              onClick={() => onCancelListing(card.listingId)}
              disabled={actionLoading}
              className="w-full py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Listing</span>
            </button>
          )}

          {!isListed && isOwner && (
            <button
              onClick={() => onOpenListModal(card)}
              disabled={actionLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Tag className="w-4 h-4" />
              <span>List for Sale</span>
            </button>
          )}

          {!isListed && !isOwner && (
            <div className="w-full py-2 rounded-xl bg-slate-900 text-center text-slate-500 text-xs font-medium">
              Owned by {card.owner ? `${card.owner.substring(0, 6)}...` : 'Unknown'}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
