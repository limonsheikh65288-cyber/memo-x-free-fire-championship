import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { UserProfile, TeamRegistration } from '../types/tournament';
import { getRegisteredTeam, saveTeamRegistration } from '../utils/storage';
import { updateTeamStatusInFirebase } from '../services/firebase';
import { RegistrationProofCertificate } from '../components/RegistrationProofCertificate';

interface MyTeamPageProps {
  user: UserProfile | null;
  onOpenAuth?: () => void;
}

export const MyTeamPage: React.FC<MyTeamPageProps> = ({ user, onOpenAuth }) => {
  const { navigate, shareProgress } = useNavigation();
  const [team, setTeam] = useState<TeamRegistration | null>(null);

  useEffect(() => {
    const saved = getRegisteredTeam();
    if (saved) {
      // Instant approval
      const approvedTeam: TeamRegistration = {
        ...saved,
        status: 'Approved',
        approvedAt: saved.approvedAt || new Date().toISOString(),
      };
      setTeam(approvedTeam);
      saveTeamRegistration(approvedTeam);
      updateTeamStatusInFirebase(saved.id, 'Approved').catch(() => {});
    } else {
      setTeam(null);
    }
  }, []);

  const handleRegisterClick = () => {
    if (!user && onOpenAuth) {
      onOpenAuth();
      return;
    }
    if (shareProgress.isComplete) {
      navigate('/register');
    } else {
      navigate('/share-gate');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6 pb-32">
      {/* Page Title */}
      <div className="text-center max-w-lg mx-auto space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#00FF66]">
          টিম সেন্টার ও রেজিস্ট্রেশন প্রুফ • My Team Hub
        </span>
        <h1 className="font-orbitron text-2xl sm:text-3xl font-black text-white">
          Tournament Squad & Proof
        </h1>
        <p className="text-xs text-neutral-400 font-sans">
          আপনার টিমের স্লট স্ট্যাটাস, অফিশিয়াল রেজিস্ট্রেশন সার্টিফিকেট ও গ্রুপ লিংক।
        </p>
      </div>

      {/* STATE 1: NOT REGISTERED */}
      {!team ? (
        <div className="rounded-2xl bg-[#0A0A0A] border border-[#00FF66]/30 p-8 text-center space-y-5 shadow-[0_12px_35px_rgba(0,0,0,0.85)]">
          <div className="w-16 h-16 rounded-2xl bg-[#0D130E] border border-[#00FF66]/40 flex items-center justify-center mx-auto text-[#00FF66] text-2xl shadow-[0_0_20px_rgba(0,255,102,0.2)]">
            <i className="fa-solid fa-users-viewfinder"></i>
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="font-orbitron text-lg sm:text-xl font-bold text-white">
              কোনো রেজিস্টার্ড টিম পাওয়া যায়নি
            </h2>
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              আপনি এখনো MEMO X Free Fire Championship টুর্নামেন্টে আপনার টিম রেজিস্টার করেননি। এখনই সম্পূর্ণ ফ্রিতে স্লট বুকিং করুন!
            </p>
          </div>

          {/* Quick Perks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-lg mx-auto text-left text-xs font-mono-nums">
            <div className="p-3 rounded-xl bg-[#0D130E] border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">এন্ট্রি ফি (Entry)</span>
              <span className="text-[#00FF66] font-bold">১০০% সম্পূর্ণ ফ্রি</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0D130E] border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">প্রাইজপুল (Prize)</span>
              <span className="text-white font-bold">৳১,৪২,০০০ BDT</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0D130E] border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block">অনুমোদন (Status)</span>
              <span className="text-emerald-400 font-bold">ইনস্ট্যান্ট অ্যাপ্রুভড</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleRegisterClick}
              className="px-8 py-3 rounded-xl bg-[#00FF66] hover:bg-[#00e65c] text-black font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(0,255,102,0.35)] cursor-pointer active:scale-95 flex items-center gap-2 mx-auto"
            >
              <span>রেজিস্ট্রেশন করুন (Register Team)</span>
              <i className="fa-solid fa-arrow-right text-xs"></i>
            </button>
          </div>
        </div>
      ) : (
        /* STATE 2: REGISTERED - SHOW SQUAD CARD, PROOF CERTIFICATE & COMMUNITY */
        <div className="space-y-6">
          {/* Live Status Header Bar */}
          <div className="p-4 rounded-xl border transition-all duration-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#06140A] border-[#00FF66]/60 shadow-[0_0_25px_rgba(0,255,102,0.2)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/50 shadow-[0_0_12px_rgba(0,255,102,0.3)]">
                <i className="fa-solid fa-circle-check"></i>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  স্লট ভেরিফিকেশন স্ট্যাটাস • Verification Status
                </span>
                <div className="font-orbitron text-sm sm:text-base font-black text-white">
                  Slot Status: <span className="text-[#00FF66] font-black uppercase">Approved (অনুমোদিত)</span>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="px-3.5 py-1.5 rounded-full bg-[#00FF66]/20 border border-[#00FF66] text-[#00FF66] font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 font-mono-nums shadow-[0_0_15px_rgba(0,255,102,0.25)]">
                <span className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66] animate-pulse"></span>
                <span>অফিসিয়ালি ভেরিফাইড (Approved)</span>
              </span>
            </div>
          </div>

          {/* Mandatory Community Notice Box */}
          <div className="p-5 rounded-2xl bg-[#08150C] border-2 border-[#00FF66] space-y-3.5 shadow-[0_0_30px_rgba(0,255,102,0.2)]">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <i className="fa-solid fa-triangle-exclamation text-base"></i>
              <span>জরুরি ও বাধ্যতামূলক ধাপ (Mandatory Step)</span>
            </div>
            <p className="text-xs text-neutral-200 leading-relaxed font-sans">
              <strong className="text-[#00FF66]">⚠️ বিশেষ বিজ্ঞপ্তি:</strong> টুর্নামেন্টের কাস্টম রুম আইডি ও পাসওয়ার্ড (Room ID & Password) শুধুমাত্র অফিশিয়াল <strong>WhatsApp</strong> এবং <strong>Telegram</strong> গ্রুপে দেওয়া হবে। টুর্নামেন্টে খেলতে হলে উভয় গ্রুপে জয়েন থাকা বাধ্যতামূলক।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <a
                href="https://chat.whatsapp.com/IVxjtQyvceuAq8W9cTbSPW"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,211,102,0.3)] active:scale-95"
              >
                <i className="fa-brands fa-whatsapp text-xl"></i>
                <span>WhatsApp গ্রুপে জয়েন করুন</span>
                <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              </a>

              <a
                href="https://t.me/+gKwVsvRKXrc0NjI1"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl bg-[#0D130E] hover:bg-[#142319] border border-[#00FF66] text-[#00FF66] font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <i className="fa-brands fa-telegram text-xl"></i>
                <span>Telegram গ্রুপে জয়েন করুন</span>
                <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              </a>
            </div>
          </div>

          {/* OFFICIAL REGISTRATION PROOF CERTIFICATE COMPONENT */}
          <div className="pt-2">
            <RegistrationProofCertificate team={team} />
          </div>

          {/* Team Details Breakdown Card */}
          <div className="rounded-2xl bg-[#0A0A0A] border border-[#00FF66]/30 p-5 sm:p-7 shadow-[0_12px_35px_rgba(0,0,0,0.85)] space-y-6">
            {/* Team Identity Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-neutral-800 gap-4">
              <div className="flex items-center gap-4">
                {team.team.logoUrl ? (
                  <img
                    src={team.team.logoUrl}
                    alt={team.team.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-[#00FF66]/50 shadow-[0_0_15px_rgba(0,255,102,0.25)]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-[#0D130E] border-2 border-[#00FF66]/50 flex items-center justify-center font-orbitron font-black text-2xl text-white">
                    {team.team.name.charAt(0)}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-orbitron text-lg sm:text-2xl font-black text-white">
                      {team.team.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-[#0D130E] border border-[#00FF66]/40 text-[#00FF66] font-mono-nums text-xs font-bold">
                      [{team.team.tag}]
                    </span>
                  </div>
                  <span className="text-xs text-neutral-400 font-mono-nums block mt-0.5">
                    বরাদ্দকৃত স্লট: <strong className="text-white">SLOT #{team.slotNumber.toLocaleString()}</strong>
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] text-neutral-500 block uppercase font-mono-nums">
                  রেজিস্ট্রেশন তারিখ
                </span>
                <span className="text-xs font-mono-nums text-neutral-300 font-semibold">
                  {new Date(team.registeredAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Captain & Credentials Grid */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00FF66] block">
                ক্যাপ্টেনের তথ্য ও যোগাযোগ (Captain Info)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono-nums">
                <div className="p-3 rounded-xl bg-[#0D130E] border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block">ক্যাপ্টেনের আসল নাম (Real Name)</span>
                  <span className="text-white font-bold text-sm">{team.captain.realName}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0D130E] border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block">ইন-গেম নেম (IGN)</span>
                  <span className="text-white font-bold text-sm">{team.captain.ign}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0D130E] border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block">Free Fire Game UID</span>
                  <span className="text-neutral-200 font-bold text-sm">{team.captain.gameUid}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0D130E] border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block">WhatsApp (Room ID Contact)</span>
                  <span className="text-neutral-200 font-bold text-sm">{team.captain.whatsapp}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0D130E] border border-neutral-800 sm:col-span-2">
                  <span className="text-[10px] text-neutral-500 block">Verified Google Email</span>
                  <span className="text-neutral-300 text-xs truncate block">{team.captain.email}</span>
                </div>
              </div>
            </div>

            {/* Footer Quick Links */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => navigate('/success')}
                className="px-4 py-2 rounded-lg bg-[#0D130E] hover:bg-[#142319] text-[#00FF66] border border-[#00FF66]/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-ticket text-xs"></i>
                <span>ডিজিটাল পাস দেখুন</span>
              </button>

              <button
                onClick={() => navigate('/cooler')}
                className="px-4 py-2 rounded-lg bg-[#0D130E] hover:bg-[#142319] text-white border border-neutral-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-snowflake text-[#00FF66] text-xs"></i>
                <span>ফ্রি কুলার ক্যাম্পেইন</span>
              </button>

              <button
                onClick={() => navigate('/qa')}
                className="px-4 py-2 rounded-lg bg-[#0D130E] hover:bg-[#142319] text-neutral-300 border border-neutral-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <i className="fa-solid fa-circle-question text-xs text-[#00FF66]"></i>
                <span>প্রশ্ন-উত্তর (Q&A)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

