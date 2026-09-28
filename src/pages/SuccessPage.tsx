import React, { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { getRegisteredTeam } from '../utils/storage';
import { TeamRegistration } from '../types/tournament';
import { RegistrationProofCertificate } from '../components/RegistrationProofCertificate';

export const SuccessPage: React.FC = () => {
  const { navigate } = useNavigation();
  const [team, setTeam] = useState<TeamRegistration | null>(null);

  useEffect(() => {
    const saved = getRegisteredTeam();
    if (saved) {
      setTeam({
        ...saved,
        status: 'Approved',
        approvedAt: saved.approvedAt || new Date().toISOString(),
      });
    }
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 md:py-10 pb-32 space-y-6 text-center">
      {/* Success Hero Badge */}
      <div className="space-y-3">
        <div className="w-16 h-16 rounded-full bg-[#00FF66]/15 border-2 border-[#00FF66] flex items-center justify-center mx-auto text-[#00FF66] text-3xl shadow-[0_0_25px_rgba(0,255,102,0.4)] animate-bounce">
          <i className="fa-solid fa-circle-check"></i>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#00FF66] block">
            রেজিস্ট্রেশন সফল ও সরাসরি অনুমোদিত • Status: APPROVED
          </span>
          <h1 className="font-orbitron text-2xl sm:text-3xl font-black text-white mt-1">
            🎉 অভিনন্দন! আপনার টিম রেজিস্ট্রেশন সম্পন্ন হয়েছে!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-neutral-300 max-w-lg mx-auto leading-relaxed font-sans">
            আপনার টিমের স্লট সরাসরি কনফার্ম ও অনুমোদিত (Approved) করা হয়েছে। নিচে প্রদত্ত অফিশিয়াল হোয়াটসঅ্যাপ এবং টেলিগ্রাম গ্রুপে অবশ্যই জয়েন থাকুন।
          </p>
        </div>
      </div>

      {/* MANDATORY COMMUNITY JOIN SECTION */}
      <div className="rounded-2xl bg-[#08150C] border-2 border-[#00FF66] p-5 sm:p-7 text-left shadow-[0_0_35px_rgba(0,255,102,0.25)] space-y-4">
        <div className="flex items-center gap-2.5">
          <i className="fa-solid fa-triangle-exclamation text-amber-400 text-lg"></i>
          <span className="font-orbitron text-sm sm:text-base font-black text-white uppercase tracking-wider">
            জরুরি ও বাধ্যতামূলক ধাপ (Mandatory Action)
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-black/70 border border-[#00FF66]/40 text-xs text-neutral-200 leading-relaxed font-sans">
          <strong className="text-[#00FF66]">⚠️ বিশেষ নিয়মাবলী:</strong> টুর্নামেন্টের সকল ম্যাচের <strong>কাস্টম রুম আইডি ও পাসওয়ার্ড (Room ID & Password)</strong> শুধুমাত্র নিচের অফিশিয়াল <strong>WhatsApp</strong> এবং <strong>Telegram</strong> গ্রুপে দেওয়া হবে। গ্রুপে জয়েন না থাকলে টুর্নামেন্টে অংশ নেওয়া যাবে না!
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* 1. Join Official WhatsApp Group */}
          <a
            href="https://chat.whatsapp.com/IVxjtQyvceuAq8W9cTbSPW"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(37,211,102,0.4)] flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <i className="fa-brands fa-whatsapp text-2xl"></i>
            <span>অফিসিয়াল WhatsApp গ্রুপ</span>
            <i className="fa-solid fa-arrow-up-right-from-square text-xs opacity-80"></i>
          </a>

          {/* 2. Join Official Telegram Group */}
          <a
            href="https://t.me/+gKwVsvRKXrc0NjI1"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl bg-[#0D130E] hover:bg-[#142319] border border-[#00FF66] text-[#00FF66] font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,255,102,0.2)] flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <i className="fa-brands fa-telegram text-2xl"></i>
            <span>অফিসিয়াল Telegram গ্রুপ</span>
            <i className="fa-solid fa-arrow-up-right-from-square text-xs opacity-80"></i>
          </a>
        </div>
      </div>

      {/* REGISTRATION PROOF CERTIFICATE EMBED */}
      {team && (
        <div className="pt-2">
          <RegistrationProofCertificate team={team} />
        </div>
      )}

      {/* Quick Navigation Action Buttons */}
      <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => navigate('/my-team')}
          className="px-5 py-2.5 rounded-xl bg-[#00FF66] hover:bg-[#00e65c] text-black text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.3)] active:scale-95"
        >
          <i className="fa-solid fa-shield-halved text-xs"></i>
          <span>My Team Hub</span>
        </button>

        <button
          onClick={() => navigate('/cooler')}
          className="px-5 py-2.5 rounded-xl bg-[#0D130E] hover:bg-[#142319] text-[#00FF66] border border-[#00FF66]/40 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          <i className="fa-solid fa-snowflake text-xs"></i>
          <span>Free Cooler Rewards</span>
        </button>

        <button
          onClick={() => navigate('/qa')}
          className="px-5 py-2.5 rounded-xl bg-[#0D130E] hover:bg-[#142319] text-neutral-300 border border-neutral-800 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          <i className="fa-solid fa-circle-question text-xs text-[#00FF66]"></i>
          <span>প্রশ্ন-উত্তর (Q&A)</span>
        </button>
      </div>
    </div>
  );
};

