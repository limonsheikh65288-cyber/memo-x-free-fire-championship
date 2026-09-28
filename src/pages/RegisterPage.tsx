import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { UserProfile, TeamRegistration } from '../types/tournament';
import {
  isDeviceLocked,
  saveRegisteredTeam,
  getBookedSlotsCount,
  getNextSlotNumber,
} from '../utils/storage';
import {
  registerTeamInFirebase,
  getDeviceFingerprint,
} from '../services/firebase';

interface RegisterPageProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ user, onOpenAuth }) => {
  const { navigate, shareProgress } = useNavigation();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if device is locked
  const [deviceLocked, setDeviceLocked] = useState<boolean>(() => isDeviceLocked());

  // Logo upload state
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<'' | 'Uploading...' | 'Uploaded'>('');

  // Step 1: Captain Info
  const [captainInfo, setCaptainInfo] = useState({
    realName: '',
    ign: '',
    gameUid: '',
    whatsapp: '',
    email: user?.email || '',
  });

  // Step 2: Streamlined Team Details
  const [teamDetails, setTeamDetails] = useState({
    name: '',
    tag: '',
  });

  const [referralCodeInput, setReferralCodeInput] = useState('');

  // Auto-fill email from Google
  useEffect(() => {
    if (user?.email && !captainInfo.email) {
      setCaptainInfo((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  // Ensure user completed share gate
  useEffect(() => {
    if (!shareProgress.isComplete && !deviceLocked) {
      navigate('/share-gate');
    }
  }, [shareProgress.isComplete, deviceLocked, navigate]);

  // Handle Logo Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('Uploading...');
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(
        'https://api.imgbb.com/1/upload?key=d573d28ad9bc128aaf8b146c90466d1b',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      if (data?.data?.url) {
        setLogoUrl(data.data.url);
        setUploadStatus('Uploaded');
      } else {
        setUploadStatus('');
        setErrorMessage('লোগো আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
      }
    } catch (err) {
      console.error('Logo upload error:', err);
      setUploadStatus('');
      setErrorMessage('ইন্টারনেট সংযোগ চেক করে আবার চেষ্টা করুন।');
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!captainInfo.realName.trim()) {
      setErrorMessage('ক্যাপ্টেনের আসল নাম (Real Name) দিন।');
      return;
    }
    if (!captainInfo.ign.trim()) {
      setErrorMessage('ক্যাপ্টেনের ইন-গেম নেম (IGN) দিন।');
      return;
    }
    if (!captainInfo.gameUid.trim() || !/^\d{6,14}$/.test(captainInfo.gameUid.trim())) {
      setErrorMessage('সঠিক ফ্রি ফায়ার গেম UID (৮-১২ ডিজিট) দিন।');
      return;
    }
    if (!captainInfo.whatsapp.trim()) {
      setErrorMessage('রুম আইডি ও পাসওয়ার্ড পাওয়ার জন্য হোয়াটসঅ্যাপ নম্বর দেওয়া বাধ্যতামূলক।');
      return;
    }
    if (!captainInfo.email.trim()) {
      setErrorMessage('একটি সঠিক ইমেইল অ্যাড্রেস দিন।');
      return;
    }

    setErrorMessage(null);
    setCurrentStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamDetails.name.trim()) {
      setErrorMessage('দয়া করে আপনার টিমের নাম দিন।');
      return;
    }
    if (!teamDetails.tag.trim()) {
      setErrorMessage('টিম ট্যাগ (যেমন: VSE, BD7) দিন।');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const fingerprint = getDeviceFingerprint();
    const nextSlot = getNextSlotNumber();

    // Immediately create with Approved status (No Pending)
    const registrationRecord: TeamRegistration = {
      id: `reg_${Date.now()}`,
      slotNumber: nextSlot,
      registeredAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      deviceFingerprint: fingerprint,
      status: 'Approved', // Instant Approval
      captain: {
        realName: captainInfo.realName.trim(),
        ign: captainInfo.ign.trim(),
        gameUid: captainInfo.gameUid.trim(),
        whatsapp: captainInfo.whatsapp.trim(),
        email: captainInfo.email.trim(),
      },
      team: {
        name: teamDetails.name.trim(),
        tag: teamDetails.tag.trim().toUpperCase(),
        logoUrl: logoUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=200&q=80',
      },
      referralCodeUsed: referralCodeInput.trim() || undefined,
    };

    try {
      await registerTeamInFirebase(registrationRecord);
      saveRegisteredTeam(registrationRecord);
      setDeviceLocked(true);
      setIsSubmitting(false);

      // Navigate directly to success page with instant congratulations & community links
      navigate('/success');
    } catch (err) {
      console.warn('Registration fallback local saving:', err);
      saveRegisteredTeam(registrationRecord);
      setDeviceLocked(true);
      setIsSubmitting(false);
      navigate('/success');
    }
  };

  if (deviceLocked) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center pb-28">
        <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-[#00FF66]/30 shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#0D130E] border border-[#00FF66]/40 flex items-center justify-center mx-auto text-[#00FF66] text-xl shadow-[0_0_15px_rgba(0,255,102,0.2)]">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div>
            <h2 className="font-orbitron text-lg font-bold text-white">
              রেজিস্ট্রেশন সম্পন্ন হয়েছে • Team Registered
            </h2>
            <p className="mt-1 text-xs text-neutral-300 font-sans">
              আপনার টিম সফলভাবে অনুমোদিত (Approved) হয়ে স্লট রিজার্ভ করা হয়েছে।
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/success')}
              className="px-5 py-2.5 rounded-lg bg-[#00FF66] hover:bg-[#00e65c] text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.3)]"
            >
              ডিজিটাল পাস ও গ্রুপ লিংক
            </button>
            <button
              onClick={() => navigate('/my-team')}
              className="px-4 py-2.5 rounded-lg bg-[#0D130E] hover:bg-[#142319] text-[#00FF66] border border-[#00FF66]/30 font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              My Team
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-6 md:py-10 pb-28">
      <div className="rounded-2xl bg-[#0A0A0A] border border-[#00FF66]/25 p-5 sm:p-7 shadow-[0_12px_30px_rgba(0,0,0,0.8)]">
        {/* Step Indicator */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse"></span>
            <span className="font-orbitron text-xs font-bold text-white uppercase tracking-wider">
              ধাপ {currentStep}/২: {currentStep === 1 ? 'ক্যাপ্টেন তথ্য (Captain)' : 'টিমের তথ্য (Team)'}
            </span>
          </div>
          <span className="text-[10px] font-mono-nums text-[#00FF66] font-bold px-2 py-0.5 rounded bg-[#0D130E] border border-[#00FF66]/30">
            ১০০% ফ্রি স্লট বুকিং
          </span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/60 text-xs text-red-200 flex items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation text-red-400"></i>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Captain Information */}
        {currentStep === 1 && (
          <form onSubmit={handleNextStep} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                ক্যাপ্টেনের আসল নাম (Captain Real Name) *
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: তানভীর আহমেদ"
                value={captainInfo.realName}
                onChange={(e) => setCaptainInfo({ ...captainInfo, realName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg glass-input text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  ইন-গেম নাম (In-Game Name - IGN) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: VIPER・TNV"
                  value={captainInfo.ign}
                  onChange={(e) => setCaptainInfo({ ...captainInfo, ign: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg glass-input text-xs font-mono-nums text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  ফ্রি ফায়ার গেম UID (Numeric UID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: 284910284"
                  value={captainInfo.gameUid}
                  onChange={(e) => setCaptainInfo({ ...captainInfo, gameUid: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg glass-input text-xs font-mono-nums text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  হোয়াটসঅ্যাপ নম্বর (WhatsApp for Room ID) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+88017..."
                  value={captainInfo.whatsapp}
                  onChange={(e) => setCaptainInfo({ ...captainInfo, whatsapp: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg glass-input text-xs font-mono-nums text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  ক্যাপ্টেনের ইমেইল (Google Email) *
                </label>
                <input
                  type="email"
                  required
                  value={captainInfo.email}
                  onChange={(e) => setCaptainInfo({ ...captainInfo, email: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg glass-input text-xs font-mono-nums text-white"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-[#00FF66] hover:bg-[#00e65c] text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,102,0.25)] flex items-center gap-1.5 active:scale-95"
              >
                <span>পরবর্তী ধাপ (Step 2)</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: STREAMLINED TEAM DETAILS */}
        {currentStep === 2 && (
          <form onSubmit={handleFinalSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  টিমের পুরো নাম (Team Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: Viper Strike Esports"
                  value={teamDetails.name}
                  onChange={(e) => setTeamDetails({ ...teamDetails, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg glass-input text-xs text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  টিম ট্যাগ (Team Tag - Max 5 chars) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="VSE"
                  value={teamDetails.tag}
                  onChange={(e) => setTeamDetails({ ...teamDetails, tag: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2.5 rounded-lg glass-input text-xs font-mono-nums uppercase text-white"
                />
              </div>
            </div>

            {/* Official Team Logo Upload */}
            <div className="p-3.5 rounded-xl bg-[#0D130E] border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-300">
                  টিম লোগো (Team Logo - Optional)
                </span>
                {uploadStatus && (
                  <span
                    className={`font-mono-nums font-bold text-[11px] ${
                      uploadStatus === 'Uploaded' ? 'text-[#00FF66]' : 'text-amber-400'
                    }`}
                  >
                    {uploadStatus === 'Uploading...' && (
                      <i className="fa-solid fa-spinner fa-spin mr-1"></i>
                    )}
                    {uploadStatus}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="w-12 h-12 rounded-lg object-cover border border-[#00FF66]/40 shadow-[0_0_10px_rgba(0,255,102,0.2)]"
                  />
                )}
                <label className="px-3.5 py-2 rounded-lg bg-black hover:bg-neutral-900 border border-[#00FF66]/30 text-xs font-semibold text-[#00FF66] cursor-pointer inline-flex items-center gap-1.5 transition-all">
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <span>লোগো সিলেক্ট করুন</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Captain Summary Confirmation Box */}
            <div className="p-3.5 rounded-xl bg-[#0D130E] border border-neutral-800 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                ক্যাপ্টেন তথ্যের বিবরণ (Captain Summary)
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono-nums text-neutral-300">
                <div>
                  <span className="text-neutral-500 block">Captain:</span>
                  <span className="text-white font-semibold">{captainInfo.realName}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">IGN:</span>
                  <span className="text-white">{captainInfo.ign}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">UID:</span>
                  <span>{captainInfo.gameUid}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">WhatsApp:</span>
                  <span>{captainInfo.whatsapp}</span>
                </div>
              </div>
            </div>

            {/* Referral Code (Optional) */}
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                বন্ধুর রেফারেল কোড (Referral Code - Optional)
              </label>
              <input
                type="text"
                placeholder="যেমন: MEMO-7842"
                value={referralCodeInput}
                onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                className="w-full px-3 py-2.5 rounded-lg glass-input text-xs font-mono-nums uppercase text-white"
              />
            </div>

            <div className="pt-3 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 rounded-lg text-neutral-400 hover:text-white text-xs cursor-pointer"
              >
                আগের ধাপে ফিরুন
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-7 py-2.5 rounded-lg bg-[#00FF66] hover:bg-[#00e65c] text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(0,255,102,0.3)] flex items-center gap-1.5 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin text-xs"></i>
                    <span>স্লট বুকিং হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check text-xs"></i>
                    <span>রেজিস্ট্রেশন নিশ্চিত করুন (Submit)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
