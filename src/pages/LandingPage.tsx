import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { UserProfile, TournamentSlotsConfig, DynamicInvitedTeam } from '../types/tournament';
import { isDeviceLocked } from '../utils/storage';
import { PRIZE_DISTRIBUTION } from '../data/tournamentData';
import {
  subscribeTournamentSlots,
  subscribeDynamicInvitedTeams,
  getTournamentSlots,
  getDynamicInvitedTeams,
  isAdminUser,
  signInWithGoogleDirect,
} from '../services/firebase';
import { GoogleAuthDialog } from '../components/GoogleAuthDialog';

interface LandingPageProps {
  user: UserProfile | null;
  onLoginSuccess?: (user: UserProfile) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ user, onLoginSuccess }) => {
  const { navigate, shareProgress } = useNavigation();
  const locked = isDeviceLocked();

  const [slotsConfig, setSlotsConfig] = useState<TournamentSlotsConfig>({
    totalSlots: 47000,
    bookedSlots: 27000,
    remainingSlots: 20000,
  });

  const [invitedTeams, setInvitedTeams] = useState<DynamicInvitedTeam[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    getTournamentSlots().then((slots) => setSlotsConfig(slots));
    getDynamicInvitedTeams().then((teams) => setInvitedTeams(teams));

    const unsubSlots = subscribeTournamentSlots((slots) => {
      setSlotsConfig(slots);
    });
    const unsubTeams = subscribeDynamicInvitedTeams((teams) => {
      setInvitedTeams(teams);
    });

    return () => {
      unsubSlots();
      unsubTeams();
    };
  }, []);

  const handleRegisterCTA = async () => {
    if (!user) {
      try {
        const authedUser = await signInWithGoogleDirect();
        if (authedUser) {
          if (onLoginSuccess) {
            onLoginSuccess(authedUser);
          }
          if (isAdminUser(authedUser.email)) {
            navigate('/admin');
          }
        }
      } catch (err) {
        console.warn('Direct sign-in popup fallback to modal:', err);
        setIsAuthModalOpen(true);
      }
      return;
    }

    if (locked) {
      navigate('/my-team');
    } else if (shareProgress.isComplete) {
      navigate('/register');
    } else {
      navigate('/share-gate');
    }
  };

  const bookedPercent = Math.min(
    100,
    Math.round((slotsConfig.bookedSlots / (slotsConfig.totalSlots || 1)) * 100)
  );

  return (
    <div className="space-y-10 sm:space-y-14 pb-32">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 pb-10 md:pt-12 md:pb-16 overflow-hidden text-center">
        {/* Subtle Ambient Emerald Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[280px] bg-[#00FF66]/5 blur-[140px] pointer-events-none rounded-full"></div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 relative z-10 space-y-5">
          {/* Prominent Banner: "Register Your Team Full Free / Slot Full Free" */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D130E] border border-[#00FF66]/50 text-xs sm:text-sm font-extrabold text-[#00FF66] shadow-[0_0_20px_rgba(0,255,102,0.2)] animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#00FF66]"></span>
            <span>Register Your Team Full Free / Slot Full Free</span>
          </div>

          {/* Large Prize Pool Displayed at the Top */}
          <div className="mx-auto max-w-md p-5 rounded-2xl bg-[#0A0A0A] border border-[#00FF66]/40 shadow-[0_12px_40px_rgba(0,0,0,0.9)] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block">
              সর্বমোট প্রাইজপুল • Total Guaranteed Prize Pool
            </span>
            <div className="font-orbitron text-3xl sm:text-5xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              <span className="text-[#00FF66]">৳</span>1,42,000
              <span className="text-sm sm:text-base font-semibold text-neutral-400 font-inter">
                BDT
              </span>
            </div>
            <p className="text-[11px] text-neutral-300">
              চ্যাম্পিয়ন: ৳60,000 + 4x মেমো সেমিকন্ডাক্টর ফোন কুলার • সরাসরি নগদ পেমেন্ট
            </p>
          </div>

          {/* Main Tournament Heading */}
          <div>
            <h1 className="font-orbitron text-2xl sm:text-4xl font-black tracking-tight text-white uppercase leading-tight max-w-3xl mx-auto">
              MEMO <span className="text-[#00FF66]">X</span> FREE FIRE
              <br />
              <span className="text-neutral-200 text-xl sm:text-3xl font-extrabold tracking-normal">
                CHAMPIONSHIP 2026
              </span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
              বাংলাদেশের সকল ফ্রি ফায়ার টিমের জন্য ১০০% ফ্রি স্লট রেজিস্ট্রেশন! ক্যাশ প্রাইজ, ট্রফি এবং ফ্রি মেমো গেমিং কুলার জিতে নেওয়ার সুযোগ।
            </p>
          </div>

          {/* LIVE SLOT TRACKER */}
          <div className="mt-4 max-w-lg mx-auto p-4 rounded-xl bg-[#0A0A0A] border border-[#00FF66]/30 shadow-lg text-left space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-ping"></span>
                <span className="font-orbitron text-xs font-bold text-white uppercase tracking-wider">
                  Live Slot Tracker
                </span>
              </div>
              <span className="text-[10px] font-mono-nums text-[#00FF66] font-bold px-2 py-0.5 rounded bg-[#0D130E] border border-[#00FF66]/30">
                Live Cloud Sync
              </span>
            </div>

            {/* Metrics 4-Col Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-lg bg-[#0D130E] border border-neutral-800">
                <span className="text-[9px] uppercase font-semibold text-neutral-400 block">
                  Prize Pool
                </span>
                <span className="font-mono-nums text-xs font-black text-[#00FF66] block">
                  ৳1,42,000
                </span>
              </div>

              <div className="p-2 rounded-lg bg-[#0D130E] border border-neutral-800">
                <span className="text-[9px] uppercase font-semibold text-neutral-400 block">
                  Total Slots
                </span>
                <span className="font-mono-nums text-xs font-black text-white block">
                  {slotsConfig.totalSlots.toLocaleString()}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-[#0D130E] border border-neutral-800">
                <span className="text-[9px] uppercase font-semibold text-neutral-400 block">
                  Booked Slots
                </span>
                <span className="font-mono-nums text-xs font-black text-white block">
                  {slotsConfig.bookedSlots.toLocaleString()}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-[#0D130E] border border-[#00FF66]/40">
                <span className="text-[9px] uppercase font-semibold text-neutral-400 block">
                  Remaining
                </span>
                <span className="font-mono-nums text-xs font-black text-[#00FF66] block">
                  {slotsConfig.remainingSlots.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-neutral-400 font-mono-nums">
                <span>Slots Reserved: {bookedPercent}% ({slotsConfig.bookedSlots.toLocaleString()})</span>
                <span>{slotsConfig.remainingSlots.toLocaleString()} Slots Available</span>
              </div>
              <div className="w-full h-2 bg-[#121A14] rounded-full overflow-hidden border border-[#00FF66]/20">
                <div
                  className="h-full bg-[#00FF66] rounded-full transition-all duration-500 shadow-[0_0_8px_#00FF66]"
                  style={{ width: `${bookedPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Primary Action Button: "Register Your Team" */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {!user ? (
              <button
                onClick={handleRegisterCTA}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-[0_4px_25px_rgba(255,255,255,0.2)] active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
              >
                {/* Official Google Icon (OAuth 2.0) */}
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
              </button>
            ) : (
              <button
                onClick={handleRegisterCTA}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#00FF66] hover:bg-[#00e65c] text-black font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(0,255,102,0.4)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{locked ? 'View My Team' : 'Register Your Team'}</span>
                <i className="fa-solid fa-arrow-right text-xs"></i>
              </button>
            )}

            <button
              onClick={() => navigate('/cooler')}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-[#0D130E] hover:bg-[#142319] text-[#00FF66] border border-[#00FF66]/30 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-snowflake text-xs"></i>
              <span>Free Cooler Campaign</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. PRIZE BREAKDOWN SECTION */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="text-center max-w-md mx-auto mb-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#00FF66]">
            Guaranteed Distribution
          </span>
          <h2 className="font-orbitron text-lg sm:text-xl font-bold text-white mt-0.5">
            Tournament Prize Pool Breakdown
          </h2>
          <p className="text-xs text-neutral-400">
            Official payout schedule disbursed immediately after the Grand Finals.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRIZE_DISTRIBUTION.map((prize, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl bg-[#0A0A0A] border transition-all ${
                prize.highlight
                  ? 'border-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.15)]'
                  : 'border-neutral-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-neutral-400">{prize.rank}</span>
                {prize.highlight && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#00FF66] text-black">
                    Champion
                  </span>
                )}
              </div>
              <div className="mt-2 font-orbitron text-lg sm:text-xl font-bold text-white">
                {prize.bdt}
              </div>
              <p className="mt-1 text-[11px] text-neutral-400 leading-snug">
                {prize.reward}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. COOLER CAMPAIGN HIGHLIGHT (PURE FREE MILESTONE REWARD - NO PRICE TAGS) */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="p-5 sm:p-7 rounded-2xl bg-[#0A0A0A] border border-[#00FF66]/30 relative overflow-hidden">
          <div className="max-w-xl space-y-3">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/30 inline-block">
              Free Cooler Campaign
            </span>
            <h3 className="font-orbitron text-lg sm:text-2xl font-bold text-white">
              Win a Free MEMO Semiconductor Phone Cooler
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Complete the required number of verified team referrals using your personal invite link. Once you hit the referral target, unlock the Claim button to submit your shipping details for 24-hour courier dispatch!
            </p>

            <div className="pt-2">
              <button
                onClick={() => navigate('/cooler')}
                className="px-5 py-2.5 rounded-lg bg-[#00FF66] hover:bg-[#00e65c] text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.25)]"
              >
                <span>Enter Cooler Campaign</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INVITED TEAMS SHOWCASE */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#00FF66]">
              VIP Roster
            </span>
            <h2 className="font-orbitron text-lg sm:text-xl font-bold text-white mt-0.5">
              Invited Esports Squads
            </h2>
          </div>
          <button
            onClick={() => navigate('/teams')}
            className="text-xs font-bold text-[#00FF66] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <i className="fa-solid fa-chevron-right text-[10px]"></i>
          </button>
        </div>

        {invitedTeams.length === 0 ? (
          <div className="p-6 rounded-xl bg-[#0A0A0A] border border-neutral-800 text-center text-xs text-neutral-400">
            Invited rosters are being updated live by tournament administration.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {invitedTeams.slice(0, 6).map((team, i) => (
              <div
                key={team.id || i}
                className="p-3 rounded-xl bg-[#0A0A0A] border border-neutral-800 text-center hover:border-[#00FF66]/40 transition-all flex flex-col justify-between"
              >
                <span className="text-[9px] font-mono-nums text-[#00FF66] block font-bold">
                  SEED #{String(i + 1).padStart(2, '0')}
                </span>
                <div className="my-2 flex justify-center">
                  {team.logoUrl ? (
                    <img
                      src={team.logoUrl}
                      alt={team.name}
                      className="w-10 h-10 rounded-lg object-cover border border-[#00FF66]/30"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-[#0D130E] border border-[#00FF66]/30 flex items-center justify-center font-orbitron font-bold text-white text-xs">
                      {team.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="font-orbitron font-bold text-xs text-white truncate">
                  {team.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Google Auth Dialog */}
      <GoogleAuthDialog
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(authedUser) => {
          if (onLoginSuccess) {
            onLoginSuccess(authedUser);
          }
          if (isAdminUser(authedUser.email)) {
            navigate('/admin');
          }
        }}
      />
    </div>
  );
};
