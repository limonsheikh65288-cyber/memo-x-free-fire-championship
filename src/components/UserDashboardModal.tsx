import React, { useState, useEffect } from 'react';
import { UserProfile, TeamRegistration } from '../types/tournament';
import { isAdminUser, getTournamentReferralConfig } from '../services/firebase';
import { useNavigation } from '../context/NavigationContext';

interface UserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  registeredTeam: TeamRegistration | null;
  onSignOut: () => void;
}

export const UserDashboardModal: React.FC<UserDashboardModalProps> = ({
  isOpen,
  onClose,
  user,
  registeredTeam,
  onSignOut,
}) => {
  const { navigate } = useNavigation();
  const [copied, setCopied] = useState(false);
  const [target, setTarget] = useState(20);

  useEffect(() => {
    getTournamentReferralConfig().then((cfg) => {
      if (cfg?.targetReferrals) {
        setTarget(cfg.targetReferrals);
      }
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const isAdmin = isAdminUser(user.email);
  const visitUrl = `${window.location.origin}/?visit=${user.referralCode}`;
  const visits = user.profileVisits || 0;
  const progressPercent = Math.min(100, Math.round((visits / target) * 100));

  const handleCopy = () => {
    navigator.clipboard.writeText(visitUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-sm rounded-2xl bg-[#0A0A0A] border border-[#00FF66]/30 shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full border border-[#00FF66]/60 object-cover"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-orbitron text-xs font-bold text-white truncate max-w-[130px]">
                  {user.name}
                </h3>
                {isAdmin ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/40 font-bold">
                    Admin
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-medium">
                    Player
                  </span>
                )}
              </div>
              <span className="text-[10px] text-neutral-400 block font-mono-nums truncate max-w-[170px]">
                {user.email}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-base"></i>
          </button>
        </div>

        {/* Milestone Progress */}
        <div className="p-3 rounded-lg bg-[#0D130E] border border-[#00FF66]/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-neutral-300">
              Cooler Referral Milestone
            </span>
            <span className="font-mono-nums font-bold text-[#00FF66]">
              {visits} / {target} Referrals
            </span>
          </div>

          <div className="w-full bg-[#121A14] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#00FF66] h-full rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Your Referral Link (Anti-Fraud IP Locked)
            </span>
            <div className="flex items-center gap-1.5">
              <span className="flex-1 px-2.5 py-1 rounded bg-black border border-neutral-800 font-mono-nums text-[10px] text-neutral-300 truncate select-all">
                {visitUrl}
              </span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded bg-[#00FF66] hover:bg-[#00e65c] text-black font-bold text-[10px] uppercase cursor-pointer shrink-0"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Quick Links */}
        <div className="space-y-1.5 pt-1">
          {/* Strictly for designated Admin email only */}
          {isAdmin && (
            <button
              onClick={() => {
                onClose();
                navigate('/admin');
              }}
              className="w-full py-2 px-3 rounded-lg bg-[#0D130E] border border-[#00FF66]/40 hover:bg-[#142319] text-[#00FF66] font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-gauge text-xs"></i>
                <span>Admin Dashboard</span>
              </div>
              <i className="fa-solid fa-chevron-right text-[10px]"></i>
            </button>
          )}

          {registeredTeam ? (
            <button
              onClick={() => {
                onClose();
                navigate('/success');
              }}
              className="w-full py-2 px-3 rounded-lg bg-[#0D130E] border border-neutral-800 hover:border-[#00FF66]/30 text-white font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-ticket text-xs text-[#00FF66]"></i>
                <span>View Tournament Pass</span>
              </div>
              <i className="fa-solid fa-chevron-right text-[10px]"></i>
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                navigate('/share-gate');
              }}
              className="w-full py-2 px-3 rounded-lg bg-[#0D130E] border border-neutral-800 hover:border-[#00FF66]/30 text-white font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-clipboard-check text-xs text-[#00FF66]"></i>
                <span>Register Team</span>
              </div>
              <i className="fa-solid fa-chevron-right text-[10px]"></i>
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              navigate('/cooler');
            }}
            className="w-full py-2 px-3 rounded-lg bg-[#0D130E] border border-neutral-800 hover:border-[#00FF66]/30 text-neutral-300 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-snowflake text-xs text-[#00FF66]"></i>
              <span>Free Cooler Campaign</span>
            </div>
            <i className="fa-solid fa-chevron-right text-[10px]"></i>
          </button>
        </div>

        {/* Sign Out */}
        <div className="pt-2 border-t border-neutral-800">
          <button
            onClick={onSignOut}
            className="w-full py-2 rounded-lg bg-red-950/40 hover:bg-red-950/70 border border-red-500/30 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
            <span>Sign Out Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
