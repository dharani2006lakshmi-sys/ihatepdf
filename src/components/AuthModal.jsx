import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  HeartCrack,
  Sparkles,
  Loader2
} from 'lucide-react';
import { 
  loginUser, 
  signupUser, 
  loginWithGoogleCredential, 
  loginWithCustomGoogle 
} from '../utils/auth';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGoogleInput, setShowGoogleInput] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');

  const googleBtnRef = useRef(null);

  // Initialize Google Identity Services (GIS) if client ID exists
  useEffect(() => {
    if (!isOpen) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    // Load Google Identity Services script
    const loadGis = () => {
      if (window.google?.accounts?.id && clientId) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            try {
              const user = loginWithGoogleCredential(response.credential);
              onAuthSuccess(user);
              onClose();
            } catch (err) {
              setError('Failed to authenticate with Google.');
            }
          },
          auto_select: false,
        });

        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'filled_blue',
            size: 'large',
            shape: 'pill',
            width: 320,
            text: 'continue_with',
          });
        }
      }
    };

    if (window.google?.accounts?.id) {
      loadGis();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = loadGis;
      document.body.appendChild(script);
    }
  }, [isOpen, onAuthSuccess, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    if (!isLogin && !name) {
      setError('Please enter your name.');
      return;
    }

    let user;
    if (isLogin) {
      user = loginUser({ email, password });
    } else {
      user = signupUser({ name, email, password });
    }

    onAuthSuccess(user);
    onClose();
  };

  // Google 1-Click Login Trigger
  const handleGoogleQuickLogin = (e) => {
    e.preventDefault();
    setGoogleLoading(true);
    setError('');

    const targetEmail = googleEmailInput.trim() || 'user.google@gmail.com';
    const targetName = targetEmail.split('@')[0];

    setTimeout(() => {
      const user = loginWithCustomGoogle({
        name: targetName,
        email: targetEmail,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${targetEmail}`
      });
      setGoogleLoading(false);
      onAuthSuccess(user);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#180436] border border-purple-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 via-purple-600 to-pink-600 p-0.5 shadow-lg shadow-purple-900/40 mx-auto flex items-center justify-center mb-3">
            <div className="w-full h-full bg-[#180433] rounded-[14px] flex items-center justify-center">
              <HeartCrack className="w-6 h-6 text-rose-400" />
            </div>
          </div>

          <h3 className="text-xl font-black font-['Outfit'] text-white">
            {isLogin ? 'Log in to I HATE PDF' : 'Create Free Account'}
          </h3>
          <p className="text-xs text-purple-300 mt-1">
            Log in to save and access your files in the 7-Day Vault
          </p>
        </div>

        {/* Feature Highlight Pill */}
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-purple-900/50 border border-purple-500/30 text-xs text-purple-200 mb-6">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>7-Day Cloud File Vault enabled on your account</span>
        </div>

        {/* ======================================================== */}
        {/* PRIMARY GOOGLE LOGIN BUTTON                              */}
        {/* ======================================================== */}
        <div className="space-y-3 mb-5">
          
          {/* Native Google GIS button slot if Client ID is present */}
          <div ref={googleBtnRef} className="flex justify-center empty:hidden"></div>

          {/* Universal Google 1-Click Button */}
          <button
            type="button"
            onClick={() => setShowGoogleInput(prev => !prev)}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm shadow-xl shadow-purple-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 border border-slate-200"
          >
            {/* 4-Color Official Google G SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.29 21.39 7.37 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.61 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Google Email Instant Input Option */}
          {showGoogleInput && (
            <div className="p-3.5 rounded-2xl bg-purple-900/60 border border-purple-400/40 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-xs font-semibold text-purple-200">
                Enter your Gmail / Google Account:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="flex-1 px-3 py-2 rounded-xl bg-white/[0.08] border border-purple-500/40 text-white text-xs placeholder-purple-300/50 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleGoogleQuickLogin}
                  disabled={googleLoading}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs transition-all flex items-center gap-1.5"
                >
                  {googleLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Sign In</span>}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Divider */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-purple-800"></div></div>
          <span className="relative px-3 bg-[#180436] text-[10px] text-purple-400 uppercase tracking-wider font-bold">Or with Email</span>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 rounded-2xl bg-purple-950/80 border border-purple-800 mb-4">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isLogin ? 'bg-purple-600 text-white shadow-md' : 'text-purple-300 hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              !isLogin ? 'bg-purple-600 text-white shadow-md' : 'text-purple-300 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1">Your Name</label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-purple-400 absolute left-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.06] border border-purple-600/40 text-white text-xs placeholder-purple-400/60 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-purple-400 absolute left-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.06] border border-purple-600/40 text-white text-xs placeholder-purple-400/60 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1">Password</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-purple-400 absolute left-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.06] border border-purple-600/40 text-white text-xs placeholder-purple-400/60 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-purple-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-400/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>{isLogin ? 'Log In & Open Vault' : 'Create Free Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security badge */}
        <div className="mt-5 pt-3 border-t border-purple-800/60 flex items-center justify-center gap-2 text-[10px] text-purple-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>256-Bit SSL Encrypted • 100% Free Forever</span>
        </div>

      </div>
    </div>
  );
}
