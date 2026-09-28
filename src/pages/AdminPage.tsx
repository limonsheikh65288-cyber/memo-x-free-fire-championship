import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  TeamRegistration,
  DynamicInvitedTeam,
  TournamentSlotsConfig,
  TournamentReferralConfig,
  CoolerCouponClaim,
} from '../types/tournament';
import {
  isAdminUser,
  getTournamentSlots,
  updateTournamentSlots,
  getTournamentReferralConfig,
  updateTournamentReferralConfig,
  getDynamicInvitedTeams,
  addDynamicInvitedTeam,
  deleteDynamicInvitedTeam,
  getAllRegisteredTeams,
  deleteTeamInFirebase,
  getAllCoolerCouponClaims,
  updateCoolerCouponClaimStatus,
  getLiveAnalyticsData,
} from '../services/firebase';
import { useNavigation } from '../context/NavigationContext';

interface AdminPageProps {
  user: UserProfile | null;
}

export const AdminPage: React.FC<AdminPageProps> = ({ user }) => {
  const { navigate } = useNavigation();

  // Strict Admin Access Check
  const isAuthorized = isAdminUser(user?.email);

  const [activeTab, setActiveTab] = useState<
    'analytics' | 'slots' | 'referrals' | 'teams_manage' | 'roster' | 'claims'
  >('analytics');

  // Dynamic Slots State
  const [slotsConfig, setSlotsConfig] = useState<TournamentSlotsConfig>({
    totalSlots: 47000,
    bookedSlots: 27000,
    remainingSlots: 20000,
  });
  const [isSavingSlots, setIsSavingSlots] = useState(false);

  // Dynamic Referral Target State
  const [referralConfig, setReferralConfig] = useState<TournamentReferralConfig>({
    targetReferrals: 20,
    rewardName: '$40 MEMO Phone Cooler Coupon',
  });
  const [newTargetInput, setNewTargetInput] = useState<number>(20);
  const [isSavingReferral, setIsSavingReferral] = useState(false);

  // Dynamic Invited Teams State (STRICT: ONLY 3 attributes: name, logoUrl, bannerUrl)
  const [invitedTeams, setInvitedTeams] = useState<DynamicInvitedTeam[]>([]);
  const [newTeam, setNewTeam] = useState({
    name: '',
    logoUrl: '',
    bannerUrl: '',
  });
  const [logoUploadStatus, setLogoUploadStatus] = useState<'' | 'Uploading...' | 'Uploaded'>('');
  const [bannerUploadStatus, setBannerUploadStatus] = useState<'' | 'Uploading...' | 'Uploaded'>('');
  const [isAddingTeam, setIsAddingTeam] = useState(false);

  // Real-time Analytics State
  const [analytics, setAnalytics] = useState({
    totalTeams: 0,
    totalReferrals: 0,
    totalUsers: 1,
    totalSubmissions: 0,
  });

  // Registered Teams and Claims State
  const [registeredTeams, setRegisteredTeams] = useState<TeamRegistration[]>([]);
  const [claims, setClaims] = useState<CoolerCouponClaim[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // If unauthorized, redirect to home immediately with notice
  useEffect(() => {
    if (!isAuthorized) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthorized, navigate]);

  // Load all dynamic admin data
  useEffect(() => {
    if (isAuthorized) {
      loadAllAdminData();
    }
  }, [isAuthorized]);

  const loadAllAdminData = async () => {
    setLoading(true);
    const [slotsData, refData, teamsData, regData, claimsData, analyticsData] = await Promise.all([
      getTournamentSlots(),
      getTournamentReferralConfig(),
      getDynamicInvitedTeams(),
      getAllRegisteredTeams(),
      getAllCoolerCouponClaims(),
      getLiveAnalyticsData(),
    ]);
    setSlotsConfig(slotsData);
    setReferralConfig(refData);
    setNewTargetInput(refData.targetReferrals || 20);
    setInvitedTeams(teamsData);
    setRegisteredTeams(regData);
    setClaims(claimsData);
    setAnalytics(analyticsData);
    setLoading(false);
  };

  const showNotification = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  // ImageBB Upload Helper (API Key: d573d28ad9bc128aaf8b146c90466d1b)
  // Shows ONLY "Uploading..." / "Uploaded"
  const handleImageBBUpload = async (
    file: File,
    type: 'logo' | 'banner'
  ) => {
    if (type === 'logo') setLogoUploadStatus('Uploading...');
    else setBannerUploadStatus('Uploading...');

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
        if (type === 'logo') {
          setNewTeam((prev) => ({ ...prev, logoUrl: data.data.url }));
          setLogoUploadStatus('Uploaded');
        } else {
          setNewTeam((prev) => ({ ...prev, bannerUrl: data.data.url }));
          setBannerUploadStatus('Uploaded');
        }
      } else {
        if (type === 'logo') setLogoUploadStatus('');
        else setBannerUploadStatus('');
        showNotification('Image upload failed. Try again.');
      }
    } catch (err) {
      console.error('ImageBB upload error:', err);
      if (type === 'logo') setLogoUploadStatus('');
      else setBannerUploadStatus('');
      showNotification('Network upload error.');
    }
  };

  // Save Dynamic Slots
  const handleSaveSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSlots(true);
    const total = Number(slotsConfig.totalSlots) || 96;
    const booked = Number(slotsConfig.bookedSlots) || 0;
    const remaining = Math.max(0, total - booked);

    const updated: TournamentSlotsConfig = {
      totalSlots: total,
      bookedSlots: booked,
      remainingSlots: remaining,
      updatedAt: new Date().toISOString(),
    };

    await updateTournamentSlots(updated);
    setSlotsConfig(updated);
    setIsSavingSlots(false);
    showNotification('Slots updated in Firestore and globally synced.');
  };

  // Save Dynamic Referral Target (Global Sync)
  const handleSaveReferralTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingReferral(true);
    const target = Math.max(1, Number(newTargetInput) || 20);

    await updateTournamentReferralConfig(target);
    setReferralConfig({
      targetReferrals: target,
      rewardName: '$40 MEMO Phone Cooler Coupon',
      updatedAt: new Date().toISOString(),
    });
    setIsSavingReferral(false);
    showNotification(`Referral target updated to ${target}. Synced globally!`);
  };

  // Add Dynamic Invited Team (STRICT: ONLY 3 attributes)
  const handleAddInvitedTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name.trim()) {
      showNotification('Team Name is required.');
      return;
    }
    if (!newTeam.logoUrl.trim()) {
      showNotification('Team Logo is required.');
      return;
    }

    setIsAddingTeam(true);
    await addDynamicInvitedTeam({
      name: newTeam.name.trim(),
      logoUrl: newTeam.logoUrl.trim(),
      bannerUrl: newTeam.bannerUrl.trim() || undefined,
    });

    const refreshedTeams = await getDynamicInvitedTeams();
    setInvitedTeams(refreshedTeams);
    setNewTeam({ name: '', logoUrl: '', bannerUrl: '' });
    setLogoUploadStatus('');
    setBannerUploadStatus('');
    setIsAddingTeam(false);
    showNotification('Invited Team published to live roster.');
  };

  // Delete Dynamic Invited Team
  const handleDeleteInvitedTeam = async (id: string, name: string) => {
    if (confirm(`Remove invited team "${name}"?`)) {
      await deleteDynamicInvitedTeam(id);
      setInvitedTeams((prev) => prev.filter((t) => t.id !== id));
      showNotification(`Invited team "${name}" removed.`);
    }
  };

  // Delete Registered Team
  const handleDeleteRegisteredTeam = async (id: string, name: string) => {
    if (confirm(`Revoke registration for squad "${name}"?`)) {
      await deleteTeamInFirebase(id);
      setRegisteredTeams((prev) => prev.filter((t) => t.id !== id));
      showNotification(`Registration for "${name}" revoked.`);
    }
  };

  // Update Claim Status
  const handleUpdateClaimStatus = async (
    claimId: string,
    newStatus: 'pending_dispatch' | 'dispatched' | 'delivered'
  ) => {
    await updateCoolerCouponClaimStatus(claimId, newStatus);
    setClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, status: newStatus } : c))
    );
    showNotification(`Claim status updated to ${newStatus}.`);
  };

  // Access Denied Screen (Strictly for unauthorized users)
  if (!isAuthorized) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20 text-center pb-24">
        <div className="p-6 rounded-2xl bg-[#0A0A0A] border border-red-500/40 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-red-950/40 border border-red-500/50 flex items-center justify-center mx-auto text-red-400 text-xl mb-3">
            <i className="fa-solid fa-lock"></i>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
            Security Gate
          </span>
          <h1 className="font-orbitron text-xl font-black text-white mt-1">
            Access Denied
          </h1>
          <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
            Admin access is restricted exclusively to designated tournament administrator accounts.
          </p>
          <div className="mt-3 p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400 font-mono-nums truncate">
            {user?.email || 'Unauthenticated'}
          </div>
          <p className="mt-3 text-[10px] text-neutral-500">
            Redirecting to home...
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-5 py-2 rounded-xl bg-[#00FF66] hover:bg-[#00e65c] text-black font-bold text-xs cursor-pointer"
          >
            Return Home Now
          </button>
        </div>
      </div>
    );
  }

  const filteredTeams = registeredTeams.filter(
    (t) =>
      t.team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.captain.realName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.captain.ign.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6 pb-24">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#00FF66]/20 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00FF66]">
              Admin Control Center
            </span>
          </div>
          <h1 className="font-orbitron text-xl sm:text-2xl font-black text-white mt-0.5">
            Tournament Management Panel
          </h1>
          <span className="text-[11px] text-neutral-400 font-mono-nums block">
            Admin Session: {user?.email}
          </span>
        </div>

        <button
          onClick={loadAllAdminData}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-xl bg-[#0D130E] hover:bg-[#142319] border border-[#00FF66]/30 text-white text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <i className={`fa-solid fa-arrows-rotate text-[#00FF66] ${loading ? 'fa-spin' : ''}`}></i>
          <span>Sync Live Firestore</span>
        </button>
      </div>

      {/* Admin Action Feedback Notification */}
      {feedback && (
        <div className="p-3 rounded-xl bg-[#0D130E] border border-[#00FF66]/40 text-xs text-[#00FF66] flex items-center gap-2">
          <i className="fa-solid fa-circle-check"></i>
          <span>{feedback}</span>
        </div>
      )}

      {/* Nav Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-[#00FF66] text-black font-bold'
              : 'bg-[#0A0A0A] text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <i className="fa-solid fa-chart-line mr-1.5"></i>
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('slots')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'slots'
              ? 'bg-[#00FF66] text-black font-bold'
              : 'bg-[#0A0A0A] text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <i className="fa-solid fa-layer-group mr-1.5"></i>
          Slot Manager
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'referrals'
              ? 'bg-[#00FF66] text-black font-bold'
              : 'bg-[#0A0A0A] text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <i className="fa-solid fa-bullseye mr-1.5"></i>
          Referral Target ({referralConfig.targetReferrals})
        </button>
        <button
          onClick={() => setActiveTab('teams_manage')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'teams_manage'
              ? 'bg-[#00FF66] text-black font-bold'
              : 'bg-[#0A0A0A] text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <i className="fa-solid fa-users mr-1.5"></i>
          Invited Teams ({invitedTeams.length})
        </button>
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'roster'
              ? 'bg-[#00FF66] text-black font-bold'
              : 'bg-[#0A0A0A] text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <i className="fa-solid fa-address-book mr-1.5"></i>
          Registered Squads ({registeredTeams.length})
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'claims'
              ? 'bg-[#00FF66] text-black font-bold'
              : 'bg-[#0A0A0A] text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <i className="fa-solid fa-box mr-1.5"></i>
          Cooler Claims ({claims.length})
        </button>
      </div>

      {/* 1. ANALYTICS DASHBOARD */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#00FF66]/20">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                Total Teams
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono-nums text-white mt-1 block">
                {analytics.totalTeams}
              </span>
              <span className="text-[10px] text-neutral-500">Live Registrations</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#00FF66]/20">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                Total Referrals
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono-nums text-[#00FF66] mt-1 block">
                {analytics.totalReferrals}
              </span>
              <span className="text-[10px] text-neutral-500">Verified IP Hits</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#00FF66]/20">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                Daily Users
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono-nums text-white mt-1 block">
                {analytics.totalUsers}
              </span>
              <span className="text-[10px] text-neutral-500">Active Accounts</span>
            </div>

            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#00FF66]/20">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                Submissions
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono-nums text-white mt-1 block">
                {analytics.totalSubmissions}
              </span>
              <span className="text-[10px] text-neutral-500">Teams + Claims</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#0A0A0A] border border-[#00FF66]/20 space-y-2">
            <h3 className="font-orbitron text-sm font-bold text-white">
              Tournament Slot Status
            </h3>
            <div className="flex justify-between text-xs text-neutral-300">
              <span>Total Capacity: {slotsConfig.totalSlots}</span>
              <span>Booked: {slotsConfig.bookedSlots}</span>
              <span className="text-[#00FF66] font-bold">Remaining: {slotsConfig.remainingSlots}</span>
            </div>
            <div className="w-full bg-[#121A14] h-2 rounded-full overflow-hidden mt-1">
              <div
                className="bg-[#00FF66] h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (slotsConfig.bookedSlots / (slotsConfig.totalSlots || 1)) * 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DYNAMIC SLOT MANAGEMENT VIEW */}
      {activeTab === 'slots' && (
        <div className="max-w-xl mx-auto rounded-xl bg-[#0A0A0A] border border-[#00FF66]/25 p-5 sm:p-6 space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00FF66]">
              Capacity Control
            </span>
            <h2 className="font-orbitron text-base sm:text-lg font-black text-white mt-0.5">
              Dynamic Slot Configuration
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Edit total slots, booked count, and remaining slots. Updates synchronize live in Firestore across all clients.
            </p>
          </div>

          <form onSubmit={handleSaveSlots} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                Total Slots Number (e.g. 47,000)
              </label>
              <input
                type="number"
                min={1}
                max={100000}
                required
                value={slotsConfig.totalSlots}
                onChange={(e) =>
                  setSlotsConfig({
                    ...slotsConfig,
                    totalSlots: parseInt(e.target.value, 10) || 0,
                    remainingSlots: Math.max(
                      0,
                      (parseInt(e.target.value, 10) || 0) - slotsConfig.bookedSlots
                    ),
                  })
                }
                className="w-full px-3 py-2 rounded-lg glass-input font-mono-nums text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                Booked Slots Count (e.g. 27,000)
              </label>
              <input
                type="number"
                min={0}
                max={slotsConfig.totalSlots}
                required
                value={slotsConfig.bookedSlots}
                onChange={(e) =>
                  setSlotsConfig({
                    ...slotsConfig,
                    bookedSlots: parseInt(e.target.value, 10) || 0,
                    remainingSlots: Math.max(
                      0,
                      slotsConfig.totalSlots - (parseInt(e.target.value, 10) || 0)
                    ),
                  })
                }
                className="w-full px-3 py-2 rounded-lg glass-input font-mono-nums text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                Remaining Slots (Auto-Calculated)
              </label>
              <input
                type="text"
                readOnly
                value={Math.max(0, slotsConfig.totalSlots - slotsConfig.bookedSlots).toLocaleString()}
                className="w-full px-3 py-2 rounded-lg glass-input font-mono-nums text-xs bg-[#0D130E] text-[#00FF66] font-bold"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSavingSlots}
                className="px-6 py-2 rounded-lg bg-[#00FF66] hover:bg-[#00e65c] text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,102,0.25)] flex items-center gap-1.5"
              >
                {isSavingSlots ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin text-xs"></i>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-cloud-arrow-up text-xs"></i>
                    <span>Save Slots Live</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. DYNAMIC REFERRAL TARGET VIEW (Global Sync) */}
      {activeTab === 'referrals' && (
        <div className="max-w-xl mx-auto rounded-xl bg-[#0A0A0A] border border-[#00FF66]/25 p-5 sm:p-6 space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00FF66]">
              Milestone Engine
            </span>
            <h2 className="font-orbitron text-base sm:text-lg font-black text-white mt-0.5">
              Dynamic Referral Target Control
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Change the required referral count to unlock the free MEMO Cooler Coupon (e.g., change from 20 to 10). Instantly updates globally across all players and database!
            </p>
          </div>

          <form onSubmit={handleSaveReferralTarget} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-lg bg-[#0D130E] border border-neutral-800">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-1">
                Current Active Target Across App
              </span>
              <div className="font-orbitron text-xl font-black text-[#00FF66]">
                {referralConfig.targetReferrals} Referrals Required
              </div>
              <span className="text-[11px] text-neutral-400">
                Reward: {referralConfig.rewardName}
              </span>
            </div>

            <div>
              <label className="block font-semibold text-neutral-300 mb-1">
                New Target Referrals Limit
              </label>
              <input
                type="number"
                min={1}
                max={100}
                required
                value={newTargetInput}
                onChange={(e) => setNewTargetInput(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 rounded-lg glass-input font-mono-nums text-xs"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">
                Quick Presets:
              </span>
              <div className="flex gap-2 mt-1.5">
                {[5, 10, 15, 20, 25].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNewTargetInput(preset)}
                    className="px-2.5 py-1 rounded bg-[#0D130E] border border-neutral-800 hover:border-[#00FF66] text-[#00FF66] font-mono-nums text-xs cursor-pointer"
                  >
                    {preset} Referrals
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSavingReferral}
                className="px-6 py-2 rounded-lg bg-[#00FF66] hover:bg-[#00e65c] text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,102,0.25)] flex items-center gap-1.5"
              >
                {isSavingReferral ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin text-xs"></i>
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-arrows-rotate text-xs"></i>
                    <span>Update & Global Sync</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. DYNAMIC INVITED TEAMS MANAGEMENT VIEW (STRICT: ONLY 3 ATTRIBUTES) */}
      {activeTab === 'teams_manage' && (
        <div className="space-y-6">
          {/* Add Form */}
          <div className="rounded-xl bg-[#0A0A0A] border border-[#00FF66]/25 p-5">
            <h2 className="font-orbitron text-base font-bold text-white mb-0.5">
              Add New Invited Team
            </h2>
            <p className="text-xs text-neutral-400 mb-4">
              Enter ONLY Team Name, Team Logo, and Team Banner. No captain or player credentials required.
            </p>

            <form onSubmit={handleAddInvitedTeam} className="space-y-3 text-xs">
              {/* Attribute a: Team Name */}
              <div>
                <label className="block font-semibold text-neutral-300 mb-1">
                  a) Team Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangladesh Top 1"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg glass-input text-xs"
                />
              </div>

              {/* Attribute b: Team Logo */}
              <div className="p-3 rounded-lg bg-[#0D130E] border border-neutral-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-neutral-300">
                    Team Logo *
                  </span>
                  {logoUploadStatus && (
                    <span
                      className={`font-mono-nums font-bold text-[11px] ${
                        logoUploadStatus === 'Uploaded'
                          ? 'text-[#00FF66]'
                          : 'text-amber-400'
                      }`}
                    >
                      {logoUploadStatus === 'Uploading...' && (
                        <i className="fa-solid fa-spinner fa-spin mr-1"></i>
                      )}
                      {logoUploadStatus}
                    </span>
                  )}
                </div>
                <label className="px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-900 border border-[#00FF66]/30 text-xs font-semibold text-[#00FF66] cursor-pointer inline-flex items-center gap-1.5 transition-all">
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <span>Upload Logo File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImageBBUpload(f, 'logo');
                    }}
                    className="hidden"
                  />
                </label>
                {newTeam.logoUrl && (
                  <span className="text-[10px] text-neutral-400 font-mono-nums truncate block mt-1">
                    {newTeam.logoUrl}
                  </span>
                )}
              </div>

              {/* Attribute c: Team Banner */}
              <div className="p-3 rounded-lg bg-[#0D130E] border border-neutral-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-neutral-300">
                    Team Banner (Optional)
                  </span>
                  {bannerUploadStatus && (
                    <span
                      className={`font-mono-nums font-bold text-[11px] ${
                        bannerUploadStatus === 'Uploaded'
                          ? 'text-[#00FF66]'
                          : 'text-amber-400'
                      }`}
                    >
                      {bannerUploadStatus === 'Uploading...' && (
                        <i className="fa-solid fa-spinner fa-spin mr-1"></i>
                      )}
                      {bannerUploadStatus}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-900 border border-[#00FF66]/30 text-xs font-semibold text-[#00FF66] cursor-pointer inline-flex items-center gap-1.5 transition-all">
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    <span>Upload Banner File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleImageBBUpload(f, 'banner');
                      }}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="url"
                    placeholder="Or enter banner image URL"
                    value={newTeam.bannerUrl}
                    onChange={(e) => setNewTeam({ ...newTeam, bannerUrl: e.target.value })}
                    className="flex-1 px-3 py-1.5 rounded-lg glass-input text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isAddingTeam || !newTeam.name || !newTeam.logoUrl}
                  className="px-6 py-2 rounded-lg bg-[#00FF66] hover:bg-[#00e65c] text-black font-extrabold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_12px_rgba(0,255,102,0.25)] flex items-center gap-1.5"
                >
                  {isAddingTeam ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin text-xs"></i>
                      <span>Adding Team...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-plus text-xs"></i>
                      <span>Publish Invited Team</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* List of Published Invited Teams */}
          <div className="space-y-3">
            <h3 className="font-orbitron text-sm font-bold text-white">
              Currently Published Invited Teams ({invitedTeams.length})
            </h3>

            {invitedTeams.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#0A0A0A] border border-neutral-800 text-center text-xs text-neutral-400">
                No invited teams published yet. Use the form above to add one.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {invitedTeams.map((team) => (
                  <div
                    key={team.id}
                    className="p-3.5 rounded-xl bg-[#0A0A0A] border border-neutral-800 hover:border-[#00FF66]/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {team.bannerUrl && (
                        <div className="h-16 w-full rounded-lg overflow-hidden bg-neutral-900 mb-2.5">
                          <img
                            src={team.bannerUrl}
                            alt={team.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2.5">
                        <img
                          src={team.logoUrl}
                          alt={team.name}
                          className="w-9 h-9 rounded-lg object-cover border border-[#00FF66]/40"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="truncate">
                          <span className="font-orbitron text-xs font-bold text-white block truncate">
                            {team.name}
                          </span>
                          <span className="text-[10px] text-[#00FF66] font-mono-nums">
                            Invited VIP Contender
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-neutral-800 flex justify-end">
                      <button
                        onClick={() => handleDeleteInvitedTeam(team.id, team.name)}
                        className="text-red-400 hover:text-red-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <i className="fa-solid fa-trash-can text-[10px]"></i>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. REGISTERED SQUADS ROSTER VIEW */}
      {activeTab === 'roster' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              placeholder="Search team or captain..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs px-3 py-1.5 rounded-lg glass-input text-xs"
            />
            <span className="text-xs text-neutral-400 font-mono-nums">
              Total Squads: {registeredTeams.length}
            </span>
          </div>

          {filteredTeams.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#0A0A0A] border border-neutral-800 text-center text-xs text-neutral-400">
              No registered squads found in Firestore.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTeams.map((team) => (
                <div
                  key={team.id}
                  className="p-4 rounded-xl bg-[#0A0A0A] border border-neutral-800 hover:border-[#00FF66]/30 transition-all text-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <div>
                      <span className="font-orbitron font-bold text-white text-sm">
                        {team.team.name}
                      </span>
                      <span className="text-[10px] text-[#00FF66] font-mono-nums ml-2">
                        [{team.team.tag}]
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#0D130E] border border-[#00FF66]/30 text-[#00FF66] font-mono-nums text-[10px] font-bold">
                      SLOT #{team.slotNumber.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px] font-mono-nums text-neutral-400">
                    <div>
                      <span className="text-neutral-500 block">Captain:</span>
                      <span className="text-white font-semibold">{team.captain.realName}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">IGN:</span>
                      <span className="text-white">{team.captain.ign}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Game UID:</span>
                      <span className="text-neutral-300">{team.captain.gameUid}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">WhatsApp:</span>
                      <span className="text-neutral-300">{team.captain.whatsapp}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px]">
                    <span className="text-neutral-500 font-mono-nums">
                      {new Date(team.registeredAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDeleteRegisteredTeam(team.id, team.team.name)}
                      className="text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                    >
                      Revoke Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. COOLER COUPON CLAIMS VIEW */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-orbitron text-sm font-bold text-white">
              Free Cooler Delivery Address Submissions ({claims.length})
            </h3>
          </div>

          {claims.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#0A0A0A] border border-neutral-800 text-center text-xs text-neutral-400">
              No cooler coupon claims submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="p-4 rounded-xl bg-[#0A0A0A] border border-neutral-800 hover:border-[#00FF66]/30 transition-all text-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <div>
                      <span className="font-bold text-white text-xs">
                        Recipient: {claim.recipientName || 'Player'}
                      </span>
                      <span className="text-[10px] text-neutral-400 ml-2 font-mono-nums">
                        ({claim.recipientPhone})
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono-nums font-bold uppercase ${
                        claim.status === 'delivered'
                          ? 'bg-emerald-950 text-[#00FF66] border border-[#00FF66]/30'
                          : claim.status === 'dispatched'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {claim.status}
                    </span>
                  </div>

                  <div className="mt-2 text-neutral-300 text-[11px] space-y-1">
                    <div>
                      <span className="text-neutral-500 font-semibold">Address:</span>{' '}
                      {claim.shippingAddress}
                    </div>
                    <div className="flex items-center gap-4 text-neutral-400 font-mono-nums text-[10px]">
                      <span>Ref Code: {claim.referralCode}</span>
                      <span>Verified Referrals: {claim.profileVisits || 20}</span>
                      {claim.courierPreference && (
                        <span>Courier: {claim.courierPreference}</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px]">
                    <span className="text-neutral-500 font-mono-nums text-[10px]">
                      Claimed: {new Date(claim.claimedAt).toLocaleString()}
                    </span>
                    <div className="flex gap-2">
                      {claim.status === 'pending_dispatch' && (
                        <button
                          onClick={() => handleUpdateClaimStatus(claim.id, 'dispatched')}
                          className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-semibold text-[10px] cursor-pointer"
                        >
                          Mark Dispatched
                        </button>
                      )}
                      {claim.status !== 'delivered' && (
                        <button
                          onClick={() => handleUpdateClaimStatus(claim.id, 'delivered')}
                          className="px-2.5 py-1 rounded bg-[#00FF66]/20 text-[#00FF66] hover:bg-[#00FF66]/30 font-semibold text-[10px] cursor-pointer"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
