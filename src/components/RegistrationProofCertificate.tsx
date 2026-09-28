import React, { useState, useRef } from 'react';
import { TeamRegistration } from '../types/tournament';

interface RegistrationProofCertificateProps {
  team: TeamRegistration;
}

export const RegistrationProofCertificate: React.FC<RegistrationProofCertificateProps> = ({ team }) => {
  const [hideEmail, setHideEmail] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const formattedDate = team.registeredAt
    ? new Date(team.registeredAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '28 Sep 2026';

  const formattedTime = team.registeredAt
    ? new Date(team.registeredAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : '10:00 AM';

  const registrationId = team.id.startsWith('reg_')
    ? `MEMO-FF-${team.id.replace('reg_', '').slice(-6).toUpperCase()}`
    : team.id;

  const handleCopyId = () => {
    navigator.clipboard.writeText(registrationId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownloadPNG = async () => {
    setIsGenerating(true);
    try {
      // High resolution HTML5 Canvas rendering
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 1200;
      const height = 750;
      canvas.width = width;
      canvas.height = height;

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#040B06');
      bgGrad.addColorStop(0.5, '#08140B');
      bgGrad.addColorStop(1, '#020503');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Cyberpunk grid pattern
      ctx.strokeStyle = 'rgba(0, 255, 102, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Outer glowing borders
      ctx.strokeStyle = '#00FF66';
      ctx.lineWidth = 4;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      ctx.strokeStyle = 'rgba(0, 255, 102, 0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(28, 28, width - 56, height - 56);

      // Corner tech accents
      const cornerSize = 25;
      ctx.fillStyle = '#00FF66';
      // Top Left
      ctx.fillRect(16, 16, cornerSize, 6);
      ctx.fillRect(16, 16, 6, cornerSize);
      // Top Right
      ctx.fillRect(width - 16 - cornerSize, 16, cornerSize, 6);
      ctx.fillRect(width - 22, 16, 6, cornerSize);
      // Bottom Left
      ctx.fillRect(16, height - 22, cornerSize, 6);
      ctx.fillRect(16, height - 16 - cornerSize, 6, cornerSize);
      // Bottom Right
      ctx.fillRect(width - 16 - cornerSize, height - 22, cornerSize, 6);
      ctx.fillRect(width - 22, height - 16 - cornerSize, 6, cornerSize);

      // Header Banner Box
      ctx.fillStyle = '#0D1E10';
      ctx.fillRect(40, 40, width - 80, 110);
      ctx.strokeStyle = 'rgba(0, 255, 102, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(40, 40, width - 80, 110);

      // Header Title
      ctx.fillStyle = '#00FF66';
      ctx.font = 'bold 16px "Orbitron", sans-serif';
      ctx.fillText('OFFICIAL ESPORTS TOURNAMENT ENTRY PASS', 65, 75);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 32px "Orbitron", sans-serif';
      ctx.fillText('MEMO X FREE FIRE CHAMPIONSHIP 2026', 65, 115);

      // Slot Badge (Top Right)
      ctx.fillStyle = '#00FF66';
      ctx.fillRect(width - 290, 55, 235, 75);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('CONFIRMED SLOT', width - 265, 78);
      ctx.font = '900 24px "Orbitron", monospace';
      ctx.fillText(`SLOT #${team.slotNumber.toLocaleString()}`, width - 270, 112);

      // Left Column: Team Details Box
      const leftBoxWidth = 530;
      ctx.fillStyle = '#09150C';
      ctx.fillRect(40, 170, leftBoxWidth, 420);
      ctx.strokeStyle = 'rgba(0, 255, 102, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(40, 170, leftBoxWidth, 420);

      // Team Header
      ctx.fillStyle = '#00FF66';
      ctx.font = 'bold 14px "Orbitron", sans-serif';
      ctx.fillText('TEAM INFORMATION • টিমের বিবরণ', 65, 205);

      // Team Name & Tag
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 28px sans-serif';
      const teamDisplayName = team.team.name.length > 20 ? team.team.name.slice(0, 20) + '...' : team.team.name;
      ctx.fillText(teamDisplayName, 65, 250);

      ctx.fillStyle = '#00FF66';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`TAG: [${team.team.tag}]`, 65, 275);

      // Divider
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.moveTo(65, 295);
      ctx.lineTo(65 + leftBoxWidth - 50, 295);
      ctx.stroke();

      // Team Reg Info Row
      ctx.fillStyle = '#888888';
      ctx.font = '13px sans-serif';
      ctx.fillText('Registration ID:', 65, 330);
      ctx.fillStyle = '#00FF66';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(registrationId, 220, 330);

      ctx.fillStyle = '#888888';
      ctx.font = '13px sans-serif';
      ctx.fillText('Registration Date:', 65, 370);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`${formattedDate} at ${formattedTime}`, 220, 370);

      ctx.fillStyle = '#888888';
      ctx.font = '13px sans-serif';
      ctx.fillText('Tournament Status:', 65, 410);
      ctx.fillStyle = '#00FF66';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('APPROVED (অনুমোদিত)', 220, 410);

      ctx.fillStyle = '#888888';
      ctx.font = '13px sans-serif';
      ctx.fillText('Prize Pool Entry:', 65, 450);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('৳১,৪২,০০০ BDT Grand Pool', 220, 450);

      ctx.fillStyle = '#888888';
      ctx.font = '13px sans-serif';
      ctx.fillText('Free Cooler Offer:', 65, 490);
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('MEMO Phone Cooler Claimable', 220, 490);

      // Right Column: Captain & Verification Box
      const rightBoxX = 590;
      const rightBoxWidth = width - rightBoxX - 40;
      ctx.fillStyle = '#09150C';
      ctx.fillRect(rightBoxX, 170, rightBoxWidth, 420);
      ctx.strokeStyle = 'rgba(0, 255, 102, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(rightBoxX, 170, rightBoxWidth, 420);

      // Captain Header
      ctx.fillStyle = '#00FF66';
      ctx.font = 'bold 14px "Orbitron", sans-serif';
      ctx.fillText('CAPTAIN CREDENTIALS • ক্যাপ্টেনের তথ্য', rightBoxX + 25, 205);

      // Captain Details
      ctx.fillStyle = '#888888';
      ctx.font = '13px sans-serif';
      ctx.fillText('Real Name:', rightBoxX + 25, 245);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(team.captain.realName, rightBoxX + 170, 245);

      ctx.fillStyle = '#888888';
      ctx.font = '13px sans-serif';
      ctx.fillText('In-Game Name (IGN):', rightBoxX + 25, 285);
      ctx.fillStyle = '#00FF66';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(team.captain.ign, rightBoxX + 170, 285);

      ctx.fillStyle = '#888888';
      ctx.font = '13px sans-serif';
      ctx.fillText('Free Fire UID:', rightBoxX + 25, 325);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(team.captain.gameUid, rightBoxX + 170, 325);

      ctx.fillStyle = '#888888';
      ctx.font = '13px sans-serif';
      ctx.fillText('WhatsApp Number:', rightBoxX + 25, 365);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(team.captain.whatsapp, rightBoxX + 170, 365);

      ctx.fillStyle = '#888888';
      ctx.font = '13px sans-serif';
      ctx.fillText('Captain Email:', rightBoxX + 25, 405);
      ctx.fillStyle = hideEmail ? '#666666' : '#FFFFFF';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(
        hideEmail ? '•••••••••••••••••@••••.com (Hidden)' : (team.captain.email || 'N/A'),
        rightBoxX + 170,
        405
      );

      // Official Stamp / Hologram box inside Captain box
      ctx.fillStyle = 'rgba(0, 255, 102, 0.08)';
      ctx.fillRect(rightBoxX + 25, 435, rightBoxWidth - 50, 130);
      ctx.strokeStyle = '#00FF66';
      ctx.lineWidth = 1;
      ctx.strokeRect(rightBoxX + 25, 435, rightBoxWidth - 50, 130);

      // Holographic seal text
      ctx.fillStyle = '#00FF66';
      ctx.font = 'bold 12px "Orbitron", monospace';
      ctx.fillText('★ VERIFIED ESPORTS COMPETITOR ENTRY ★', rightBoxX + 50, 465);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '11px sans-serif';
      ctx.fillText('Custom Room ID & Password will be provided to verified captains via', rightBoxX + 50, 490);
      ctx.fillText('Official WhatsApp & Telegram groups. Entry guaranteed by MEMO.', rightBoxX + 50, 510);

      ctx.fillStyle = '#00FF66';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('MEMO ESPORTS BANGLADESH • TOURNAMENT COMMITTEE', rightBoxX + 50, 545);

      // Bottom Footer Bar
      ctx.fillStyle = '#050E07';
      ctx.fillRect(40, 610, width - 80, 95);
      ctx.strokeStyle = 'rgba(0, 255, 102, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(40, 610, width - 80, 95);

      // Instructions in Footer
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('⚠️ জরুরি নির্দেশনা:', 65, 642);

      ctx.fillStyle = '#DDDDDD';
      ctx.font = '12px sans-serif';
      ctx.fillText(
        'এই রেজিস্ট্রেশন প্রুফটি ডাউনলোড করে সংরক্ষণ করুন। কাস্টম রুমে জয়েন করার সময় প্রুফ চাওয়া হতে পারে।',
        185,
        642
      );

      ctx.fillStyle = '#00FF66';
      ctx.font = '11px monospace';
      ctx.fillText(
        'Official Portal: memo-freefire-championship.app • WhatsApp Group: bit.ly/memo-ff-wa • Telegram: bit.ly/memo-ff-tg',
        65,
        680
      );

      // Trigger Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const safeTag = team.team.tag ? team.team.tag.replace(/[^a-zA-Z0-9]/g, '') : 'PASS';
      link.download = `MEMO_FF_Registration_Proof_${safeTag}_Slot${team.slotNumber}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to generate certificate:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#08150C] border border-[#00FF66]/40 shadow-[0_0_20px_rgba(0,255,102,0.15)]">
        <div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-certificate text-[#00FF66] text-lg"></i>
            <h3 className="font-orbitron text-sm sm:text-base font-black text-white">
              অফিসিয়াল রেজিস্ট্রেশন প্রুফ সার্টিফিকেট
            </h3>
          </div>
          <p className="text-[11px] text-neutral-300 mt-0.5 font-sans">
            আপনার টিমের সকল তথ্যসহ অফিশিয়াল ভেরিফাইড প্রুফ ইমেজ ডাউনলোড করুন।
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          {/* Email Privacy Toggle */}
          <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer select-none bg-black/50 px-3 py-1.5 rounded-lg border border-neutral-700 hover:border-[#00FF66]/50 transition-all">
            <input
              type="checkbox"
              checked={hideEmail}
              onChange={(e) => setHideEmail(e.target.checked)}
              className="accent-[#00FF66] w-3.5 h-3.5 cursor-pointer rounded"
            />
            <span className="text-[11px] font-sans">
              {hideEmail ? '🔒 ইমেইল গোপন করা হয়েছে' : '👁️ ইমেইল দেখাচ্ছে'}
            </span>
          </label>

          {/* Instant PNG Download Button */}
          <button
            onClick={handleDownloadPNG}
            disabled={isGenerating}
            className="px-4 py-2 rounded-lg bg-[#00FF66] hover:bg-[#00e65c] text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)] flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <i className="fa-solid fa-spinner fa-spin text-xs"></i>
                <span>ডাউনলোড হচ্ছে...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-download text-xs"></i>
                <span>প্রুফ ডাউনলোড (PNG)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visual Esports Pass Preview Card */}
      <div
        ref={cardRef}
        className="rounded-2xl bg-gradient-to-b from-[#06150A] via-[#08190D] to-[#040C06] border-2 border-[#00FF66] p-5 sm:p-7 shadow-[0_0_35px_rgba(0,255,102,0.25)] relative overflow-hidden text-left font-sans"
      >
        {/* Background Cyber Grid Accent */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#00FF66 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Top Pass Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#00FF66]/30 gap-4">
          <div className="flex items-center gap-3.5">
            {team.team.logoUrl ? (
              <img
                src={team.team.logoUrl}
                alt={team.team.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border-2 border-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.4)]"
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-black border-2 border-[#00FF66] flex items-center justify-center font-orbitron font-black text-2xl text-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.4)]">
                {team.team.name.charAt(0)}
              </div>
            )}

            <div>
              <span className="text-[10px] font-orbitron font-bold uppercase tracking-widest text-[#00FF66]">
                OFFICIAL ESPORTS ENTRY PASS
              </span>
              <h2 className="font-orbitron text-base sm:text-xl font-black text-white leading-tight">
                {team.team.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-mono-nums font-bold text-[#00FF66] bg-[#00FF66]/10 px-2 py-0.5 rounded border border-[#00FF66]/30">
                  [{team.team.tag}]
                </span>
                <span className="text-[11px] text-neutral-400 font-mono-nums">
                  {registrationId}
                </span>
              </div>
            </div>
          </div>

          {/* Slot Number Display */}
          <div className="flex items-center sm:flex-col items-end justify-between sm:justify-center bg-black/60 px-4 py-2.5 rounded-xl border border-[#00FF66]/40 shadow-inner">
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider font-mono-nums">
              Assigned Slot
            </span>
            <span className="font-orbitron text-lg sm:text-2xl font-black text-[#00FF66] tracking-wider">
              SLOT #{team.slotNumber.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Certificate Details Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 my-5 text-xs font-mono-nums">
          {/* Column 1: Tournament & Registration details */}
          <div className="space-y-2.5 p-4 rounded-xl bg-black/50 border border-neutral-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#00FF66] pb-1 border-b border-neutral-800">
              টুর্নামেন্ট বিবরণ (Tournament Details)
            </div>

            <div className="flex justify-between py-1 border-b border-neutral-900">
              <span className="text-neutral-400 font-sans">টুর্নামেন্ট:</span>
              <span className="text-white font-bold font-orbitron text-[11px]">
                MEMO X FF Championship
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-neutral-900">
              <span className="text-neutral-400 font-sans">রেজিস্ট্রেশন স্ট্যাটাস:</span>
              <span className="text-[#00FF66] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_8px_#00FF66]"></span>
                APPROVED (অনুমোদিত)
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-neutral-900">
              <span className="text-neutral-400 font-sans">তারিখ ও সময়:</span>
              <span className="text-neutral-200">
                {formattedDate} • {formattedTime}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-neutral-900">
              <span className="text-neutral-400 font-sans">প্রাইজপুল এক্সেস:</span>
              <span className="text-white font-bold">৳১,৪২,০০০ BDT</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-neutral-400 font-sans">গেমিং কুলার অফার:</span>
              <span className="text-sky-400 font-bold">Claimable via Referral</span>
            </div>
          </div>

          {/* Column 2: Captain Information */}
          <div className="space-y-2.5 p-4 rounded-xl bg-black/50 border border-neutral-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#00FF66] pb-1 border-b border-neutral-800">
              ক্যাপ্টেনের তথ্য (Captain Credentials)
            </div>

            <div className="flex justify-between py-1 border-b border-neutral-900">
              <span className="text-neutral-400 font-sans">ক্যাপ্টেন নাম:</span>
              <span className="text-white font-bold">{team.captain.realName}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-neutral-900">
              <span className="text-neutral-400 font-sans">ইন-গেম নেম (IGN):</span>
              <span className="text-[#00FF66] font-bold">{team.captain.ign}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-neutral-900">
              <span className="text-neutral-400 font-sans">Free Fire Game UID:</span>
              <span className="text-white font-bold">{team.captain.gameUid}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-neutral-900">
              <span className="text-neutral-400 font-sans">হোয়াটসঅ্যাপ নম্বর:</span>
              <span className="text-neutral-200">{team.captain.whatsapp}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-neutral-400 font-sans">ক্যাপ্টেন ইমেইল:</span>
              <span className="text-neutral-300 truncate max-w-[180px]">
                {hideEmail ? '••••••••••@••••.com (Hidden)' : team.captain.email}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Holographic Seal Banner */}
        <div className="relative z-10 p-3 rounded-xl bg-[#00FF66]/10 border border-[#00FF66]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00FF66]/20 border border-[#00FF66] flex items-center justify-center text-[#00FF66] text-sm">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <div className="font-orbitron font-bold text-white text-[11px]">
                OFFICIAL VERIFIED ENTRY • MEMO ESPORTS
              </div>
              <div className="text-[10px] text-neutral-300 font-sans">
                কাস্টম রুম আইডি ও পাসওয়ার্ড শুধুমাত্র অফিশিয়াল গ্রুপে দেওয়া হবে।
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyId}
              className="px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-900 border border-neutral-700 text-[11px] font-bold text-neutral-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-copy text-[10px] text-[#00FF66]"></i>
              <span>{copySuccess ? 'কপি হয়েছে!' : 'Copy ID'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-900 border border-neutral-700 text-[11px] font-bold text-neutral-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-print text-[10px] text-[#00FF66]"></i>
              <span>প্রিন্ট</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
