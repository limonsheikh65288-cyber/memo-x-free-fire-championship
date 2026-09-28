import React, { useState } from 'react';
import { UserProfile } from '../types/tournament';
import { signInWithGoogleDirect } from '../services/firebase';

interface GoogleAuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const GoogleAuthDialog: React.FC<GoogleAuthDialogProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  if (!isOpen) return null;

  const handleOAuthPopup = async () => {
    setIsAuthenticating(true);
    try {
      const user = await signInWithGoogleDirect();
      if (user) {
        setIsAuthenticating(false);
        onLoginSuccess(user);
        onClose();
      }
    } catch (err: unknown) {
      console.warn('OAuth popup fallback:', err);
      setIsAuthenticating(false);
      setShowEmailInput(true);
    }
  };

  const handleDirectEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    const email = emailInput.trim();
    const name = nameInput.trim() || email.split('@')[0].replace(/[._-]/g, ' ');
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-sm rounded-2xl bg-[#0A0A0A] border border-[#00FF66]/40 p-6 shadow-2xl space-y-5 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF66]"></span>
            <span className="font-orbitron text-xs font-bold text-white uppercase tracking-wider">
              Google Account Sign-In
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        {/* Brand Banner */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-xl bg-[#0D130E] border border-[#00FF66]/30 flex items-center justify-center mx-auto text-[#00FF66] text-xl mb-2 shadow-[0_0_15px_rgba(0,255,102,0.2)]">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <h3 className="font-orbitron text-base font-bold text-white uppercase">
            Sign In with Google
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
            Authenticate your player profile to register your squad and access live championship passes.
          </p>
        </div>

        {/* Primary Action Button: Official Google Sign-In */}
        {!showEmailInput ? (
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={handleOAuthPopup}
              disabled={isAuthenticating}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-[0_4px_20px_rgba(255,255,255,0.15)] active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isAuthenticating ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin text-sm text-[#00FF66]"></i>
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setShowEmailInput(true)}
                className="text-[11px] text-neutral-400 hover:text-neutral-200 underline cursor-pointer"
              >
                Enter Google Email Directly
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleDirectEmailSubmit} className="space-y-3 pt-1 text-xs">
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Tanvir Ahmed"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
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
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass-input text-xs font-mono-nums text-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowEmailInput(false)}
                className="text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!emailInput.trim()}
                className="px-5 py-2 rounded-lg bg-[#00FF66] hover:bg-[#00e65c] text-black font-bold text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_12px_rgba(0,255,102,0.25)]"
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
