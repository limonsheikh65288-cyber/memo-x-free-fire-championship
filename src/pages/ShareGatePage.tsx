import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { isDeviceLocked } from '../utils/storage';

export const ShareGatePage: React.FC = () => {
  const { navigate, shareProgress, recordShare } = useNavigation();
  const locked = isDeviceLocked();
  const [feedback, setFeedback] = useState<string | null>(null);

  const { whatsapp, messenger, isComplete } = shareProgress;
  const totalCount = whatsapp + messenger;
  const percentage = Math.round((totalCount / 10) * 100);

  const bannerImgUrl = 'https://i.ibb.co/C5ZH7WpF/file-413.jpg';

  const shareText = encodeURIComponent(
    `🔥 MEMO X Free Fire Championship 2026 is LIVE! ৳1,42,000 Total Prize Pool + Free MEMO Semiconductor Phone Coolers! 100% Free Slot Registration. Register your squad now: ${window.location.origin}`
  );

  const handleWhatsAppShare = () => {
    recordShare('whatsapp');
    const waUrl = `https://api.whatsapp.com/send?text=${shareText}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    setFeedback(`WhatsApp share recorded! (${Math.min(5, whatsapp + 1)}/5)`);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleMessengerShare = () => {
    recordShare('messenger');
    const msgrUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
      window.location.origin
    )}&app_id=291494419107518&redirect_uri=${encodeURIComponent(window.location.href)}`;
    window.open(msgrUrl, '_blank', 'noopener,noreferrer');

    setFeedback(`Messenger share recorded! (${Math.min(5, messenger + 1)}/5)`);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleProceed = () => {
    if (locked) {
      navigate('/success');
      return;
    }
    if (isComplete) {
      navigate('/register');
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 md:py-10 pb-28">
      <div className="rounded-2xl bg-[#0A0A0A] border border-[#00FF66]/25 p-5 sm:p-7 shadow-[0_12px_30px_rgba(0,0,0,0.8)] relative space-y-5">
        {/* Anti-Bot Badge */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_6px_#00FF66]"></span>
            <span className="font-orbitron text-xs font-bold tracking-wider text-white uppercase">
              Community Share Verification Gate
            </span>
          </div>
          <span className="text-[10px] font-mono-nums text-neutral-400 font-bold px-2 py-0.5 rounded bg-[#0D130E] border border-[#00FF66]/30 text-[#00FF66]">
            100% Free Slot Entry
          </span>
        </div>

        {/* Official Tournament Share Banner */}
        <div className="rounded-xl overflow-hidden border border-[#00FF66]/30 shadow-[0_0_20px_rgba(0,255,102,0.15)] bg-black/40">
          <img
            src={bannerImgUrl}
            alt="MEMO X Free Fire Championship Official Banner"
            className="w-full h-auto object-contain block"
          />
        </div>

        <div className="text-center max-w-md mx-auto space-y-1.5">
          <h1 className="font-orbitron text-xl sm:text-2xl font-extrabold text-white">
            Share to Unlock Registration
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            To prevent bot spam and verify genuine esports squads, share this tournament link to at least <strong className="text-white">5 WhatsApp Groups</strong> and <strong className="text-white">5 Messenger Groups</strong>.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="p-4 rounded-xl bg-[#0D130E] border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-300">
            <span>Verification Progress</span>
            <span className="font-mono-nums text-[#00FF66] font-bold">{percentage}% Complete</span>
          </div>

          <div className="w-full h-2.5 bg-[#142319] rounded-full overflow-hidden border border-[#00FF66]/20">
            <div
              className="h-full bg-[#00FF66] rounded-full transition-all duration-300 shadow-[0_0_8px_#00FF66]"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#25D366]"></span>
              <span>
                WhatsApp: <strong className="text-white font-mono-nums">{whatsapp} / 5</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00FF66]"></span>
              <span>
                Messenger: <strong className="text-white font-mono-nums">{messenger} / 5</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Live Feedback Toast */}
        {feedback && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-[#00FF66]/40 text-xs text-[#00FF66] flex items-center justify-center gap-2">
            <i className="fa-solid fa-circle-check"></i>
            <span className="font-semibold">{feedback}</span>
          </div>
        )}

        {/* Share Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* WhatsApp Share Button */}
          <button
            onClick={handleWhatsAppShare}
            className="p-3.5 rounded-xl bg-[#0D130E] hover:bg-[#142319] border border-[#25D366]/40 hover:border-[#25D366] text-white flex items-center gap-3 transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-9 h-9 rounded-lg bg-[#25D366]/20 text-[#25D366] flex items-center justify-center text-lg shrink-0">
              <i className="fa-brands fa-whatsapp"></i>
            </div>
            <div className="text-left">
              <div className="font-bold text-xs flex items-center gap-1.5 text-white">
                <span>Share to WhatsApp</span>
                <span className="font-mono-nums text-[10px] text-[#25D366]">({whatsapp}/5)</span>
              </div>
              <span className="text-[10px] text-neutral-400">5 Groups Required</span>
            </div>
          </button>

          {/* Messenger Share Button */}
          <button
            onClick={handleMessengerShare}
            className="p-3.5 rounded-xl bg-[#0D130E] hover:bg-[#142319] border border-[#00FF66]/30 hover:border-[#00FF66] text-white flex items-center gap-3 transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-9 h-9 rounded-lg bg-[#00FF66]/15 text-[#00FF66] flex items-center justify-center text-lg shrink-0">
              <i className="fa-brands fa-facebook-messenger"></i>
            </div>
            <div className="text-left">
              <div className="font-bold text-xs flex items-center gap-1.5 text-white">
                <span>Share to Messenger</span>
                <span className="font-mono-nums text-[10px] text-[#00FF66]">({messenger}/5)</span>
              </div>
              <span className="text-[10px] text-neutral-400">5 Groups Required</span>
            </div>
          </button>
        </div>

        {/* Community Group Direct Links */}
        <div className="pt-2 border-t border-neutral-800 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block text-center">
            Official Championship Community Channels
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <a
              href="https://chat.whatsapp.com/IVxjtQyvceuAq8W9cTbSPW"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] font-bold flex items-center justify-center gap-2 transition-all"
            >
              <i className="fa-brands fa-whatsapp"></i>
              <span>Official WhatsApp Group</span>
            </a>
            <a
              href="https://t.me/+gKwVsvRKXrc0NjI1"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-lg bg-[#0D130E] hover:bg-[#142319] border border-[#00FF66]/40 text-[#00FF66] font-bold flex items-center justify-center gap-2 transition-all"
            >
              <i className="fa-brands fa-telegram"></i>
              <span>Official Telegram Group</span>
            </a>
          </div>
        </div>

        {/* Unlock Action */}
        <div className="pt-2 text-center">
          <button
            onClick={handleProceed}
            disabled={!isComplete && !locked}
            className={`w-full py-3.5 px-6 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              isComplete || locked
                ? 'bg-[#00FF66] hover:bg-[#00e65c] text-black shadow-[0_0_20px_rgba(0,255,102,0.35)] cursor-pointer active:scale-95'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
            }`}
          >
            <i className={`fa-solid ${isComplete || locked ? 'fa-unlock' : 'fa-lock'} text-xs`}></i>
            <span>
              {locked
                ? 'View Registered Entry Pass'
                : isComplete
                ? 'Unlock Team Registration Form'
                : `Complete ${10 - totalCount} More Shares to Unlock`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
