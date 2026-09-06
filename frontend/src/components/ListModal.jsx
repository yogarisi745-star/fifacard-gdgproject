import React, { useState } from 'react';
import { X, Tag, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ethers } from 'ethers';

export function ListModal({ card, onClose, onConfirmList }) {
  const [price, setPrice] = useState('');
  const [step, setStep] = useState('idle'); // idle, approving, listing, success, error
  const [errorMsg, setErrorMsg] = useState('');

  if (!card) return null;

  const ovr = Number(card.overall || 88);
  const baseFairPrice = (ovr / 100) * 0.1;
  const maxAllowedPrice = parseFloat((baseFairPrice * 5).toFixed(3)); // Max 5x multiplier cap

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numericPrice = parseFloat(price);
    
    if (!price || numericPrice <= 0) {
      setErrorMsg('Please enter a valid ETH price (> 0)');
      return;
    }

    if (numericPrice > maxAllowedPrice) {
      setErrorMsg(`Market Economy Cap: Maximum allowed price for an ${ovr} OVR Card is ${maxAllowedPrice} ETH to prevent hyper-inflation.`);
      return;
    }

    try {
      setErrorMsg('');
      const priceWei = ethers.parseEther(price);
      await onConfirmList(card.tokenId, priceWei, setStep);
    } catch (err) {
      console.error("Listing error:", err);
      setErrorMsg(err.message || 'Failed to list card on marketplace.');
      setStep('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700/80 p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Tag className="w-5 h-5 text-cyan-400" />
            <h3 className="font-extrabold text-lg text-white">List Card for Sale</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Info Summary */}
        <div className="flex items-center space-x-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="w-14 h-14 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-amber-400 text-xl border border-slate-800">
            {card.overall || '90'}
          </div>
          <div>
            <h4 className="font-extrabold text-white">{card.name}</h4>
            <p className="text-xs text-slate-400">Position: <span className="text-cyan-400 font-semibold">{card.position}</span> | Token ID: <span className="font-mono text-cyan-400">#{card.tokenId}</span></p>
          </div>
        </div>

        {/* Progressive Value Appreciation Banner (x -> x+y -> x+y+z) */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-cyan-950/40 border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between font-bold text-xs text-emerald-400">
            <span>📈 Progressive Value Growth</span>
            <span className="font-mono text-[10px] text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded">x ➔ (x + y) ➔ (x + y + z)</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-snug">
            As cards are traded and used to win Game Lobby tournaments, proven performance drives market demand and resale appreciation!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Listing Price (ETH)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.000000000000000001"
                placeholder="0.05"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={step === 'approving' || step === 'listing'}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white font-mono placeholder:text-slate-600 outline-none transition-all"
              />
              <span className="absolute right-4 top-3.5 text-xs font-bold text-cyan-400 font-mono">
                ETH
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-1.5 px-1">
              <span>Fair Market Range:</span>
              <span className="text-purple-300 font-bold">0.01 ETH - {maxAllowedPrice} ETH</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step Indicator */}
          {(step === 'approving' || step === 'listing') && (
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>
                {step === 'approving'
                  ? 'Step 1/2: Please approve Marketplace contract in MetaMask...'
                  : 'Step 2/2: Confirming listing transaction in MetaMask...'}
              </span>
            </div>
          )}

          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={step === 'approving' || step === 'listing'}
              className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={step === 'approving' || step === 'listing'}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-1 disabled:opacity-50"
            >
              {step === 'approving' || step === 'listing' ? (
                <span>Processing...</span>
              ) : (
                <span>Confirm & List</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
