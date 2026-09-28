import React, { useState } from 'react';
import { UserProfile } from '../types/tournament';
import { signInWithGoogleDirect } from '../services/firebase';

interface LoginGateScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginGateScreen: React.FC<LoginGateScreenProps> = ({ onLoginSuccess }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showEmailFallback, setShowEmailFallback] = useState(false);
  const [fallbackEmail, setFallbackEmail] = useState('');
  const [fallbackName, setFallbackName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDirectGoogleLogin = async () => {
    setIsAuthenticating(true);
    setErrorMessage(null);
    try {
      const user = await signInWithGoogleDirect();
      if (user) {
        setIsAuthenticating(false);
        onLoginSuccess(user);
      }
    } catch (err: unknown) {
      console.warn('Google sign-in popup error:', err);
      setIsAuthenticating(false);
      // If popup was blocked or restricted by browser iframe, allow seamless direct entry
      setShowEmailFallback(true);
    }
  };

  const handleEmailFallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fallbackEmail.trim()) return;

    const email = fallbackEmail.trim();
    const name = fallbackName.trim() || email.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

    const user: UserProfile = {
      id: `usr_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: formattedName,
      email,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      referralCode: `MEMO-${Math.floor(1000 + Math.random() * 9000)}`,
      profileVisits: 0,
      referralCount: 0,
    };

    onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col justify-between selection:bg-[#00FF66]/20 selection:text-[#00FF66] font-inter relative overflow-hidden">
      {/* Subtle Electric Emerald Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[550px] h-[260px] bg-[#00FF66]/5 blur-[120px] pointer-events-none rounded-full"></div>

      {/* Top Header */}
      <header className="w-full border-b border-[#00FF66]/15 bg-[#0A0A0A]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-[#00FF66] rounded-xs rotate-45 inline-block shadow-[0_0_8px_#00FF66]"></span>
            <span className="font-orbitron text-sm sm:text-base font-black tracking-wider text-white">
              MEMO <span className="text-[#00FF66]">X</span> FREE FIRE
            </span>
          </div>
          <span className="text-[10px] font-mono-nums px-2.5 py-1 rounded bg-[#0D130E] border border-[#00FF66]/30 text-[#00FF66] font-bold">
            Official Championship
          </span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 py-10">
        <div className="w-full max-w-md rounded-2xl bg-[#0A0A0A] border border-[#00FF66]/30 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)] relative space-y-6">
          {/* Prominent Free Registration Banner */}
          <div className="p-2.5 rounded-xl bg-[#0D130E] border border-[#00FF66]/40 text-center shadow-[0_0_15px_rgba(0,255,102,0.12)]">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-[#00FF66] flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse"></span>
              Register Your Team Full Free / Slot Full Free
            </span>
          </div>

          {/* Large Prize Pool at the Top */}
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
              Total Guaranteed Prize Pool
            </span>
            <div className="font-orbitron text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
              <span className="text-[#00FF66]">৳</span>1,42,000
              <span className="text-sm font-semibold text-neutral-400 font-inter">
                BDT
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Grand Champion: ৳60,000 + 4x MEMO Phone Coolers • Instant Bank/bKash Disbursement
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-500 text-xs text-red-200">
              {errorMessage}
            </div>
          )}

          {/* Primary Action Button: Direct One-Click Google Login */}
          {!showEmailFallback ? (
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleDirectGoogleLogin}
                disabled={isAuthenticating}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.15)] active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isAuthenticating ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin text-sm text-[#00FF66]"></i>
                    <span>Signing in with Google...</span>
                  </>
                ) : (
                  <>
                    {/* Official Google Icon */}
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Register Your Team with Google</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowEmailFallback(true)}
                  className="text-[11px] text-neutral-400 hover:text-neutral-200 underline cursor-pointer"
                >
                  Enter Google Email Directly
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEmailFallbackSubmit} className="space-y-3.5 pt-1 text-xs">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tanvir Ahmed"
                  value={fallbackName}
                  onChange={(e) => setFallbackName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  Google Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="your.email@gmail.com"
                  value={fallbackEmail}
                  onChange={(e) => setFallbackEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs font-mono-nums text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowEmailFallback(false)}
                  className="text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!fallbackEmail.trim()}
                  className="px-6 py-2.5 rounded-lg bg-[#00FF66] hover:bg-[#00e65c] text-black font-bold text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_12px_rgba(0,255,102,0.25)]"
                >
                  Continue & Login
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full border-t border-neutral-900 py-3.5 text-center text-[11px] text-neutral-500 font-mono-nums">
        © 2026 MEMO X Free Fire Championship. Production System.
      </footer>
    </div>
  );
};
