export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  referralCode: string;
  profileVisits: number;
  referralCount?: number;
  isRegistered?: boolean;
}

export interface PlayerInfo {
  name: string;
  ign: string;
  uid: string;
  role?: string;
}

export interface TeamRegistration {
  id: string;
  slotNumber: number;
  registeredAt: string;
  deviceFingerprint: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedAt?: string;
  captain: {
    realName: string;
    ign: string;
    gameUid: string;
    whatsapp: string;
    email: string;
  };
  team: {
    name: string;
    tag: string;
    logoUrl: string;
  };
  squad?: PlayerInfo[];
  referralCodeUsed?: string;
}

export interface TournamentSlotsConfig {
  totalSlots: number;
  bookedSlots: number;
  remainingSlots: number;
  updatedAt?: string;
}

export interface TournamentReferralConfig {
  targetReferrals: number;
  rewardName: string;
  updatedAt?: string;
}

export interface CoolerCouponClaim {
  id: string;
  userId: string;
  userEmail?: string;
  recipientName?: string;
  referrerName?: string;
  recipientPhone: string;
  shippingAddress: string;
  courierPreference?: string;
  referralCode: string;
  profileVisits?: number;
  status: 'pending_dispatch' | 'dispatched' | 'delivered';
  claimedAt: string;
}

export interface InvitedTeam {
  id: string;
  name: string;
  tag?: string;
  badge?: string;
  region?: string;
  captain?: string;
  achievements?: string[];
  logo?: string;
  logoUrl?: string;
  bannerUrl?: string;
  accentColor?: string;
  stats?: {
    winRate: string;
    kdRatio: string;
    majorTitles: number;
  };
  createdAt?: string;
}

export type DynamicInvitedTeam = InvitedTeam;

export interface LeaderboardEntry {
  rank: number;
  name?: string;
  teamName?: string;
  referrerName?: string;
  referralCount: number;
  referralCode?: string;
  avatar?: string;
  coolerClaimed?: boolean;
  city?: string;
  isEligible?: boolean;
}
