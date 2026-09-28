import React from 'react';
import { useNavigation } from '../context/NavigationContext';

export const Footer: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <footer className="bg-[#050806] border-t border-[#00FF66]/15 text-neutral-400 text-xs py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="font-orbitron text-lg font-black tracking-wider text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#00FF66] rounded-xs rotate-45 inline-block shadow-[0_0_8px_#00FF66]"></span>
              <span>
                MEMO<span className="text-[#00FF66] font-normal">X</span> FFC
              </span>
            </div>
            <p className="text-xs text-neutral-400 max-w-md font-inter leading-relaxed">
              The premier competitive tournament for Free Fire squad champions across Bangladesh. Powered by MEMO semiconductor cooling technology for peak tournament hardware performance.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://chat.whatsapp.com/IVxjtQyvceuAq8W9cTbSPW"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#0D130E] border border-[#00FF66]/20 hover:border-[#00FF66] text-[#00FF66] flex items-center justify-center transition-colors shadow-sm"
                title="Official WhatsApp Group"
              >
                <i className="fa-brands fa-whatsapp"></i>
              </a>
              <a
                href="https://t.me/+gKwVsvRKXrc0NjI1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-[#0D130E] border border-[#00FF66]/20 hover:border-[#00FF66] text-[#00FF66] flex items-center justify-center transition-colors shadow-sm"
                title="Official Telegram Group"
              >
                <i className="fa-brands fa-telegram"></i>
              </a>
            </div>
          </div>

          {/* Quick Page Links */}
          <div className="space-y-2">
            <h4 className="font-orbitron text-xs font-bold text-white uppercase tracking-wider">
              Tournament Links
            </h4>
            <ul className="space-y-1.5 text-xs text-neutral-400">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="hover:text-[#00FF66] transition-colors cursor-pointer"
                >
                  Championship Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/my-team')}
                  className="hover:text-[#00FF66] transition-colors cursor-pointer"
                >
                  My Squad / Live Status
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/cooler')}
                  className="hover:text-[#00FF66] transition-colors cursor-pointer"
                >
                  Free Cooler Campaign
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/qa')}
                  className="hover:text-[#00FF66] transition-colors cursor-pointer"
                >
                  প্রশ্ন ও উত্তর (Q&A)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/teams')}
                  className="hover:text-[#00FF66] transition-colors cursor-pointer"
                >
                  Invited Teams
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/share-gate')}
                  className="hover:text-[#00FF66] transition-colors cursor-pointer"
                >
                  Register Team Full Free
                </button>
              </li>
            </ul>
          </div>

          {/* Tournament Administration */}
          <div className="space-y-2">
            <h4 className="font-orbitron text-xs font-bold text-white uppercase tracking-wider">
              Administration
            </h4>
            <div className="text-xs text-neutral-400 space-y-1">
              <div>Dhaka, Bangladesh</div>
              <div>support@memo-ffc.gg</div>
              <div className="font-mono-nums text-[11px] text-neutral-500 mt-2">
                Custom Room IDs dispatched via official WhatsApp group only.
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div>
            © 2026 MEMO X Free Fire Championship. All rights reserved.
          </div>
          <div>
            Free Fire is a registered trademark of Garena. Independent competitive tournament.
          </div>
        </div>
      </div>
    </footer>
  );
};
