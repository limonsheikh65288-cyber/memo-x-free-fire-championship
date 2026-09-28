import React, { useState, useEffect } from 'react';
import { UserProfile, CoolerCouponClaim, TournamentReferralConfig } from '../types/tournament';
import {
  getUserProfileVisits,
  subscribeUserProfileVisits,
  submitCoolerCouponClaim,
  getTournamentReferralConfig,
  subscribeTournamentReferralConfig,
} from '../services/firebase';

interface CoolerPageProps {
  user: UserProfile;
}

export const CoolerPage: React.FC<CoolerPageProps> = ({ user }) => {
  const [profileVisits, setProfileVisits] = useState<number>(user.profileVisits || 0);
  const [referralConfig, setReferralConfig] = useState<TournamentReferralConfig>({
    targetReferrals: 20,
    rewardName: 'Free MEMO Semiconductor Phone Cooler Reward',
  });
  const [isCopied, setIsCopied] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [claimSuccessMessage, setClaimSuccessMessage] = useState<string | null>(null);

  // Delivery details form (Full Name, Phone Number, Address)
  const [claimForm, setClaimForm] = useState({
    fullName: user.name || '',
    phone: '',
    address: '',
  });

  const referralCode = user.referralCode || 'MEMO-7842';
  const visitLink = `${window.location.origin}/?visit=${referralCode}`;
  const target = referralConfig.targetReferrals || 20;
  const isUnlocked = profileVisits >= target;
  const progressPercent = Math.min(100, Math.round((profileVisits / target) * 100));

  useEffect(() => {
    // 1. Visits subscription
    getUserProfileVisits(referralCode).then((count) => {
      setProfileVisits(count);
    });

    const unsubVisits = subscribeUserProfileVisits(referralCode, (liveCount) => {
      setProfileVisits(liveCount);
    });

    // 2. Dynamic referral target configuration subscription (Admin controlled)
    getTournamentReferralConfig().then((cfg) => {
      setReferralConfig(cfg);
    });

    const unsubConfig = subscribeTournamentReferralConfig((liveCfg) => {
      setReferralConfig(liveCfg);
    });

    return () => {
      unsubVisits();
      unsubConfig();
    };
  }, [referralCode]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(visitLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimForm.fullName.trim() || !claimForm.phone.trim() || !claimForm.address.trim()) {
      return;
    }

    setIsSubmittingClaim(true);
    const claimData: CoolerCouponClaim = {
      id: `claim_${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      recipientName: claimForm.fullName.trim(),
      recipientPhone: claimForm.phone.trim(),
      shippingAddress: claimForm.address.trim(),
      courierPreference: 'Nationwide Courier (Free Home Delivery)',
      referralCode,
      profileVisits,
      status: 'pending_dispatch',
      claimedAt: new Date().toISOString(),
    };

    await submitCoolerCouponClaim(claimData);
    setIsSubmittingClaim(false);

    setClaimSuccessMessage('আপনার ক্লেইম সফলভাবে জমা হয়েছে! আগামী ২৪ ঘণ্টার মধ্যে প্রসেস করা হবে।');

    setTimeout(() => {
      setIsClaimModalOpen(false);
      setClaimSuccessMessage(null);
    }, 3500);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6 pb-32">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0D130E] border border-[#00FF66]/40 text-xs font-bold text-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.15)]">
          <i className="fa-solid fa-snowflake"></i>
          <span>১০০% ফ্রি গেমিং কুলার ক্যাম্পেইন • Free Cooler Milestone</span>
        </div>
        <h1 className="font-orbitron text-2xl sm:text-3xl font-black text-white">
          Free MEMO Gaming Phone Cooler
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
          আপনার রেফারেল লিংকের মাধ্যমে ২০টি ফ্রেন্ড বা টিম রেফার করে সম্পূর্ণ ফ্রিতে জিতে নিন মেমো সেমিকন্ডাক্টর ফোন কুলার! সারাদেশে ফ্রি কুরিয়ার হোম ডেলিভারি।
        </p>
      </div>

      {/* Official Championship Banner (Displayed on Cooler Page with Full Natural Aspect Ratio, No Crop) */}
      <div className="rounded-2xl overflow-hidden border border-[#00FF66]/40 shadow-[0_8px_30px_rgba(0,255,102,0.15)] bg-black/50">
        <img
          src="https://i.ibb.co/C5ZH7WpF/file-413.jpg"
          alt="MEMO X Free Fire Championship Official Banner"
          className="w-full h-auto object-contain block"
        />
      </div>

      {/* How to Get the Cooler Guide (Bangla + English) */}
      <div className="rounded-2xl bg-[#0A0A0A] border border-[#00FF66]/30 p-5 sm:p-6 shadow-[0_12px_35px_rgba(0,0,0,0.85)] space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-800">
          <div className="w-8 h-8 rounded-lg bg-[#00FF66]/15 border border-[#00FF66]/40 flex items-center justify-center text-[#00FF66] text-sm">
            <i className="fa-solid fa-circle-info"></i>
          </div>
          <div>
            <h2 className="font-orbitron text-sm sm:text-base font-bold text-white">
              কীভাবে ফ্রি গেমিং কুলার পাবেন? (How to get Free Cooler)
            </h2>
            <p className="text-[11px] text-neutral-400">
              সহজ ৫টি ধাপে আপনার ফ্রি ফোন কুলার আনলক করুন:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#0D130E] border border-neutral-800 space-y-1">
            <div className="flex items-center gap-2 text-[#00FF66] font-bold">
              <span className="w-5 h-5 rounded-full bg-[#00FF66] text-black flex items-center justify-center text-[11px] font-mono-nums font-black">1</span>
              <span>লিংক কপি করুন (Copy Invite Link)</span>
            </div>
            <p className="text-neutral-300 text-[11px] leading-relaxed">
              নিচে দেওয়া আপনার নিজস্ব ইউনিক রেফারেল লিংকটি 'Copy Link' বাটনে ক্লিক করে কপি করুন।
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0D130E] border border-neutral-800 space-y-1">
            <div className="flex items-center gap-2 text-[#00FF66] font-bold">
              <span className="w-5 h-5 rounded-full bg-[#00FF66] text-black flex items-center justify-center text-[11px] font-mono-nums font-black">2</span>
              <span>বন্ধুদের সাথে শেয়ার করুন (Share Link)</span>
            </div>
            <p className="text-neutral-300 text-[11px] leading-relaxed">
              লিংকটি বন্ধুদের স্কোয়াড, ফেসবুক গ্রুপ, ইউটিউব, হোয়াটসঅ্যাপ বা টেলিগ্রাম গ্রুপে শেয়ার করুন।
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0D130E] border border-neutral-800 space-y-1">
            <div className="flex items-center gap-2 text-[#00FF66] font-bold">
              <span className="w-5 h-5 rounded-full bg-[#00FF66] text-black flex items-center justify-center text-[11px] font-mono-nums font-black">3</span>
              <span>২০ টিম মাইলস্টোন (20 Referrals)</span>
            </div>
            <p className="text-neutral-300 text-[11px] leading-relaxed">
              আপনার লিংকের মাধ্যমে ২০ জন ভিজিট ও রেজিস্ট্রেশন সম্পন্ন করলেই ফ্রি কুলার ক্লেইম বাটন আনলক হবে।
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0D130E] border border-neutral-800 space-y-1">
            <div className="flex items-center gap-2 text-[#00FF66] font-bold">
              <span className="w-5 h-5 rounded-full bg-[#00FF66] text-black flex items-center justify-center text-[11px] font-mono-nums font-black">4</span>
              <span>ফ্রি হোম ডেলিভারি (Free Delivery)</span>
            </div>
            <p className="text-neutral-300 text-[11px] leading-relaxed">
              ক্লেইম বাটনে ক্লিক করে নাম, মোবাইল নম্বর ও ঠিকানা দিন। কুরিয়ারে ফ্রি হোম ডেলিভারি পাঠানো হবে!
            </p>
          </div>
        </div>
      </div>

      {/* Progress & Referral Link Card */}
      <div className="rounded-2xl bg-[#0A0A0A] border border-[#00FF66]/30 p-5 sm:p-6 shadow-[0_12px_35px_rgba(0,0,0,0.85)] space-y-5">
        {/* Milestone Counter Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800 gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
              ভেরিফায়েড রেফারেল অগ্রগতি • Verified Referrals Progress
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-orbitron text-base sm:text-xl font-bold text-white">
                টিম রেফারেল: <span className="text-[#00FF66] font-mono-nums">{profileVisits}</span> / {target} সম্পন্ন
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked ? (
              <span className="px-3 py-1 rounded-lg bg-[#00FF66]/15 border border-[#00FF66]/50 text-[#00FF66] font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,255,102,0.25)]">
                <i className="fa-solid fa-unlock"></i>
                <span>কুলার ক্লেইম আনলক হয়েছে!</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-lg bg-[#0D130E] border border-neutral-800 text-neutral-300 font-mono-nums text-xs">
                আর মাত্র {target - profileVisits} টি রেফারেল বাকি
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-neutral-400 font-mono-nums">
            <span>অগ্রগতি (Progress): {progressPercent}%</span>
            <span>টার্গেট (Target): {target} ভেরিফায়েড রেফারেল</span>
          </div>
          <div className="w-full bg-[#121A14] h-2.5 rounded-full overflow-hidden border border-[#00FF66]/20">
            <div
              className="bg-[#00FF66] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#00FF66]"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Unique Referral Link Bar with Anti-Fraud IP protection */}
        <div className="p-4 rounded-xl bg-[#0D130E] border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              আপনার পার্সোনাল রেফারেল লিংক (Your Unique Link)
            </span>
            <span className="text-[10px] text-[#00FF66] font-mono-nums flex items-center gap-1">
              <i className="fa-solid fa-shield-halved text-[9px]"></i>
              <span>Anti-Fraud IP Active</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={visitLink}
              className="flex-1 px-3 py-2 rounded-lg glass-input text-xs font-mono-nums text-neutral-200 truncate select-all"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-lg bg-[#00FF66] hover:bg-[#00e65c] text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_10px_rgba(0,255,102,0.25)] flex items-center gap-1.5 shrink-0"
            >
              {isCopied ? (
                <>
                  <i className="fa-solid fa-check text-xs"></i>
                  <span>কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-copy text-xs"></i>
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[10px] text-neutral-500 font-mono-nums leading-tight">
            রেফার কোড: {referralCode} • প্রতিটি রেফারেলের জন্য সিস্টেম ১টি ইউনিক আইপি ও ডিভাইস নিশ্চিত করে।
          </p>
        </div>

        {/* Claim Button */}
        <div className="pt-2 flex justify-center sm:justify-end">
          <button
            onClick={() => setIsClaimModalOpen(true)}
            disabled={!isUnlocked}
            className={`px-6 py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg ${
              isUnlocked
                ? 'bg-[#00FF66] hover:bg-[#00e65c] text-black shadow-[0_0_20px_rgba(0,255,102,0.4)] cursor-pointer active:scale-95'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
            }`}
          >
            <i className={`fa-solid ${isUnlocked ? 'fa-gift' : 'fa-lock'}`}></i>
            <span>{isUnlocked ? 'Claim Free MEMO Cooler' : `${target} রেফারেল পূর্ণ হলে ক্লেইম করুন`}</span>
          </button>
        </div>
      </div>

      {/* Hardware Specifications Card (Clean - No Prices) */}
      <div className="rounded-2xl bg-[#0A0A0A] border border-neutral-800 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-snowflake text-[#00FF66]"></i>
          <h3 className="font-orbitron text-sm font-bold text-white">
            রিওয়ার্ড: MEMO DL05 Semiconductor Phone Cooler
          </h3>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed font-sans">
          MEMO DL05 সেমিকন্ডাক্টর ফোন কুলারে রয়েছে হাই-পারফরম্যান্স পেল্টিয়ার ক্রায়োজেনিক কুলিং প্লেট। এটি মাত্র কয়েক সেকেন্ডে আপনার স্মার্টফোনের তাপমাত্রা ২৫ ডিগ্রি পর্যন্ত কমিয়ে দেয়, যা ফ্রি ফায়ার গেমপ্লেতে ল্যাগ ও ফ্রেমড্রপ দূর করে স্মুথ ৬০/৯০ এফপিএস বজায় রাখে।
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-nums text-neutral-300">
          <div className="p-2.5 rounded-lg bg-[#0D130E] border border-neutral-800">
            <span className="text-[10px] text-neutral-500 block">Technology</span>
            <span className="text-white font-semibold">Peltier Cryo</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0D130E] border border-neutral-800">
            <span className="text-[10px] text-neutral-500 block">Temp Drop</span>
            <span className="text-[#00FF66] font-semibold">-25°C Frost</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0D130E] border border-neutral-800">
            <span className="text-[10px] text-neutral-500 block">Price / Fee</span>
            <span className="text-[#00FF66] font-semibold">100% Free</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0D130E] border border-neutral-800">
            <span className="text-[10px] text-neutral-500 block">Delivery</span>
            <span className="text-white font-semibold">Free Courier</span>
          </div>
        </div>
      </div>

      {/* DELIVERY DETAILS FORM MODAL */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-[#0A0A0A] border border-[#00FF66]/50 p-6 shadow-2xl relative my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00FF66]">
                  রেফারেল মাইলস্টোন অর্জিত!
                </span>
                <h3 className="font-orbitron text-base font-bold text-white">
                  কুলার ডেলিভারি তথ্য (Delivery Details)
                </h3>
              </div>
              <button
                onClick={() => setIsClaimModalOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-base"></i>
              </button>
            </div>

            {claimSuccessMessage ? (
              <div className="p-5 rounded-xl bg-[#0D130E] border border-[#00FF66]/60 text-center space-y-3">
                <i className="fa-solid fa-circle-check text-3xl text-[#00FF66]"></i>
                <div className="font-orbitron text-sm font-bold text-white">
                  Claim Recorded Successfully!
                </div>
                <div className="p-3 rounded-lg bg-black/60 border border-[#00FF66]/30 text-xs text-[#00FF66] font-semibold leading-relaxed">
                  {claimSuccessMessage}
                </div>
                <p className="text-[11px] text-neutral-400">
                  আমাদের টুর্নামেন্ট টিম ডেলিভারির পূর্বে আপনার মোবাইলে কল করে নিশ্চিত করবে।
                </p>
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} className="space-y-3.5 text-xs">
                {/* 1. Full Name */}
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    আপনার পূর্ণ নাম (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="গ্রহীতার পুরো নাম"
                    value={claimForm.fullName}
                    onChange={(e) => setClaimForm({ ...claimForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  />
                </div>

                {/* 2. Phone Number */}
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    মোবাইল নম্বর (Phone Number) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={claimForm.phone}
                    onChange={(e) => setClaimForm({ ...claimForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs font-mono-nums"
                  />
                </div>

                {/* 3. Address */}
                <div>
                  <label className="block font-semibold text-neutral-300 mb-1">
                    সম্পূর্ণ ডেলিভারি ঠিকানা (House, Road, Area, District) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="বাসার নম্বর, রোড, থানা, জেলা সহ স্পষ্ট ঠিকানা লিখুন..."
                    value={claimForm.address}
                    onChange={(e) => setClaimForm({ ...claimForm, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                  ></textarea>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsClaimModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white text-xs cursor-pointer"
                  >
                    বাতিল (Cancel)
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingClaim}
                    className="px-6 py-2 rounded-lg bg-[#00FF66] hover:bg-[#00e65c] text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_12px_rgba(0,255,102,0.3)] flex items-center gap-1.5"
                  >
                    {isSubmittingClaim ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin text-xs"></i>
                        <span>প্রসেসিং...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-paper-plane text-xs"></i>
                        <span>ক্লেইম সাবমিট করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
