import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Lock, Mail, LogOut, CheckCircle, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

export function AuthModal({ isOpen, onClose, account }) {
  const { user, role, adminEmail, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setErrorMsg('');
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to initialize Google Auth');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        alert('Registration successful! Please check your email or proceed to sign in.');
      } else {
        await signInWithEmail(email, password);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-3xl glass-panel border border-slate-800 p-6 md:p-8 space-y-6 bg-slate-950 text-slate-200 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 flex items-center justify-center text-sm font-bold transition-all"
        >
          ✕
        </button>

        {user ? (
          /* User Profile View */
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 p-1 mx-auto shadow-lg shadow-purple-500/20">
                <img
                  src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.email}`}
                  alt="User Avatar"
                  className="w-full h-full rounded-full bg-slate-950 object-cover"
                />
              </div>
              <h3 className="text-xl font-black text-white">{user.user_metadata?.full_name || user.email?.split('@')[0]}</h3>
              <p className="text-slate-400 font-mono text-xs">{user.email}</p>
            </div>

            {/* Account Role Badge */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Account Role</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                  role === 'admin' 
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-400' 
                    : 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                }`}>
                  {role === 'admin' ? '🛡️ AUTHORIZED ADMIN' : '🎮 STANDARD PLAYER'}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {role === 'admin' 
                  ? 'Admin Privileges Active: You have access to Admin Minting and system contract controls.' 
                  : 'Player Account: Standard view displaying Marketplace, Card Collection, and Match Lobbies only.'}
              </p>
            </div>

            {/* Web3 Wallet status */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Linked Web3 Wallet:</span>
              <span className="text-purple-300 font-bold">{account ? `${account.slice(0,6)}...${account.slice(-4)}` : 'Not Connected'}</span>
            </div>

            <button
              onClick={() => { signOut(); onClose(); }}
              className="w-full py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center justify-center space-x-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Account</span>
            </button>
          </div>
        ) : (
          /* Sign In / Sign Up View */
          <div className="space-y-5">
            {/* Sign In / Sign Up Header */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400 mb-2">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-white">{isSignUp ? 'Create Account' : 'Welcome Back'}</h3>
              <p className="text-slate-400 text-xs">Sign in with Email or connect your Web3 wallet to save progress.</p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Google OAuth Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
              <div className="flex items-center space-x-2 font-bold text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>Google Auth (Feature Under Development)</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Google OAuth integration is planned and will be added in a future update. Please register or sign in with your Email address below.
              </p>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="player@fifacards.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.01] flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{isSignUp ? 'Create Player Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-purple-400 font-bold hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
