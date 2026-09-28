import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  setDoc,
  collection,
  onSnapshot,
} from 'firebase/firestore';

import firebaseConfig from '../../firebase-applet-config.json';
import {
  UserProfile,
  TeamRegistration,
  DynamicInvitedTeam,
  TournamentSlotsConfig,
  TournamentReferralConfig,
  CoolerCouponClaim,
  LeaderboardEntry,
} from '../types/tournament';

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore with force long polling to bypass WebSocket/gRPC proxy timeouts
export const db = (() => {
  try {
    return initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true,
        ignoreUndefinedProperties: true,
      },
      firebaseConfig.firestoreDatabaseId || '(default)'
    );
  } catch {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
  }
})();

// Standard error handler conforming to Firebase skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  if (
    errMessage.includes('offline') ||
    errMessage.includes('unavailable') ||
    errMessage.includes('Could not reach Cloud Firestore backend') ||
    errMessage.includes("didn't respond")
  ) {
    console.info(`Firestore network connection issue / offline fallback (${operationType} on ${path}):`, errMessage);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path,
  };
  console.warn('Firebase / Firestore Log: ', JSON.stringify(errInfo));
}

// Designated Admin Emails: STRICT ACCESS RESTRICTION
export const ADMIN_EMAILS = [
  'habibaakter5yh6@gmail.com',
  'limonsheikh65288@gmail.com',
  'admin@memox.gg',
];

export function isAdminUser(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === email.trim().toLowerCase());
}

/**
 * 1. MANDATORY SINGLE IP / DEVICE LOCK ENFORCEMENT & ANTI-FRAUD
 */
export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'server_device';
  let stored = localStorage.getItem('memo_device_uid');
  if (!stored) {
    const raw = `${navigator.userAgent}_${screen.width}x${screen.height}_${new Date().getTimezoneOffset()}`;
    stored = 'dev_' + btoa(raw).replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);
    localStorage.setItem('memo_device_uid', stored);
  }
  return stored;
}

// Fetch visitor's external IP safely
export async function getClientIp(): Promise<string> {
  try {
    const res = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
    const data = await res.json();
    if (data?.ip) return data.ip.replace(/[^a-zA-Z0-9.:_-]/g, '_');
  } catch {
    // fallback to browser fingerprint
  }
  return getDeviceFingerprint();
}

/**
 * Check and bind IP / Device login
 * If the same IP attempts another login/registration with a different email, block access with:
 * "Multiple logins from this network/device are strictly prohibited."
 */
export async function checkAndBindDeviceLogin(
  user: UserProfile
): Promise<{ allowed: boolean; message?: string }> {
  // Designated admins are exempt
  if (isAdminUser(user.email)) {
    return { allowed: true };
  }

  try {
    const clientIp = await getClientIp();
    const deviceId = getDeviceFingerprint();
    const lockKey = clientIp.replace(/[^a-zA-Z0-9_-]/g, '_');

    // Check local cache first
    const localBound = localStorage.getItem('memo_device_bound_account');
    if (localBound) {
      try {
        const parsed = JSON.parse(localBound);
        if (
          parsed.email &&
          parsed.email.toLowerCase() !== user.email.toLowerCase() &&
          !isAdminUser(parsed.email)
        ) {
          return {
            allowed: false,
            message: 'Multiple logins from this network/device are strictly prohibited.',
          };
        }
      } catch {
        // ignore
      }
    }

    // Check Firestore device_logins registry
    try {
      const docRef = doc(db, 'device_logins', lockKey);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        if (
          data.email &&
          data.email.toLowerCase() !== user.email.toLowerCase() &&
          !isAdminUser(data.email)
        ) {
          return {
            allowed: false,
            message: 'Multiple logins from this network/device are strictly prohibited.',
          };
        }
      } else {
        // Bind this network IP/device to this user
        await setDoc(docRef, {
          lockKey,
          deviceId,
          clientIp,
          userId: user.id,
          email: user.email,
          boundAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `device_logins/${lockKey}`);
    }

    // Persist locally
    localStorage.setItem(
      'memo_device_bound_account',
      JSON.stringify({ deviceId, clientIp, email: user.email, userId: user.id })
    );

    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

/**
 * 2. GOOGLE AUTHENTICATION (OAuth 2.0)
 */
export async function signInWithGoogleDirect(): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  const result = await signInWithPopup(auth, provider);
  const fbUser = result.user;

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const referralCode = `MEMO-${randomSuffix}`;

  const profile: UserProfile = {
    id: fbUser.uid,
    name: fbUser.displayName || 'Tournament Player',
    email: fbUser.email || 'player@gmail.com',
    avatar:
      fbUser.photoURL ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fbUser.uid)}`,
    referralCode,
    profileVisits: 0,
    referralCount: 0,
  };

  try {
    const userRef = doc(db, 'users', fbUser.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const existingData = userSnap.data();
      profile.profileVisits = existingData.profileVisits || 0;
      profile.referralCode = existingData.referralCode || profile.referralCode;
    } else {
      await setDoc(userRef, {
        ...profile,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
  }

  return profile;
}

export async function signInWithGoogle(): Promise<UserProfile> {
  return signInWithGoogleDirect();
}

/**
 * 3. DYNAMIC TOURNAMENT SLOTS MANAGEMENT
 */
const DEFAULT_SLOTS: TournamentSlotsConfig = {
  totalSlots: 47000,
  bookedSlots: 27000,
  remainingSlots: 20000,
  updatedAt: new Date().toISOString(),
};

export async function getTournamentSlots(): Promise<TournamentSlotsConfig> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'slots'));
    if (snap.exists()) {
      const data = snap.data() as TournamentSlotsConfig;
      // Normalize to 47,000 baseline if older small number config exists
      const total = Number(data.totalSlots) >= 1000 ? Number(data.totalSlots) : 47000;
      const booked = Math.max(27000, Number(data.bookedSlots) || 27000);
      return {
        totalSlots: total,
        bookedSlots: booked,
        remainingSlots: Math.max(0, total - booked),
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'settings/slots');
  }

  const local = localStorage.getItem('memo_tournament_slots');
  if (local) {
    try {
      const parsed = JSON.parse(local);
      const total = Number(parsed.totalSlots) >= 1000 ? Number(parsed.totalSlots) : 47000;
      const booked = Math.max(27000, Number(parsed.bookedSlots) || 27000);
      return {
        totalSlots: total,
        bookedSlots: booked,
        remainingSlots: Math.max(0, total - booked),
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      };
    } catch {
      // ignore
    }
  }
  return DEFAULT_SLOTS;
}

export async function updateTournamentSlots(
  config: TournamentSlotsConfig
): Promise<boolean> {
  const total = Number(config.totalSlots) || 47000;
  const booked = Math.max(27000, Number(config.bookedSlots) || 27000);
  const payload: TournamentSlotsConfig = {
    totalSlots: total,
    bookedSlots: booked,
    remainingSlots: Math.max(0, total - booked),
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem('memo_tournament_slots', JSON.stringify(payload));

  try {
    await setDoc(doc(db, 'settings', 'slots'), payload, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'settings/slots');
    return true;
  }
}

export function subscribeTournamentSlots(
  callback: (slots: TournamentSlotsConfig) => void
) {
  const docRef = doc(db, 'settings', 'slots');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as TournamentSlotsConfig;
        const total = Number(data.totalSlots) >= 1000 ? Number(data.totalSlots) : 47000;
        const booked = Math.max(27000, Number(data.bookedSlots) || 27000);
        callback({
          totalSlots: total,
          bookedSlots: booked,
          remainingSlots: Math.max(0, total - booked),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      } else {
        callback(DEFAULT_SLOTS);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'settings/slots');
      callback(DEFAULT_SLOTS);
    }
  );
}

/**
 * 4. DYNAMIC REFERRAL TARGET SYSTEM
 */
const DEFAULT_REFERRAL_CONFIG: TournamentReferralConfig = {
  targetReferrals: 20,
  rewardName: 'Free MEMO Semiconductor Phone Cooler Reward',
  updatedAt: new Date().toISOString(),
};

export async function getTournamentReferralConfig(): Promise<TournamentReferralConfig> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'referrals'));
    if (snap.exists()) {
      return snap.data() as TournamentReferralConfig;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'settings/referrals');
  }

  const local = localStorage.getItem('memo_referral_config');
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      // ignore
    }
  }
  return DEFAULT_REFERRAL_CONFIG;
}

export async function updateTournamentReferralConfig(
  target: number
): Promise<boolean> {
  const cleanTarget = Math.max(1, Number(target) || 20);
  const payload: TournamentReferralConfig = {
    targetReferrals: cleanTarget,
    rewardName: 'Free MEMO Semiconductor Phone Cooler Reward',
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem('memo_referral_config', JSON.stringify(payload));

  try {
    await setDoc(doc(db, 'settings', 'referrals'), payload, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'settings/referrals');
    return true;
  }
}

export function subscribeTournamentReferralConfig(
  callback: (config: TournamentReferralConfig) => void
) {
  const docRef = doc(db, 'settings', 'referrals');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as TournamentReferralConfig;
        callback(data);
      } else {
        callback(DEFAULT_REFERRAL_CONFIG);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, 'settings/referrals');
      callback(DEFAULT_REFERRAL_CONFIG);
    }
  );
}

/**
 * 5. DYNAMIC INVITED TEAMS MANAGEMENT (STRICT: ONLY 3 ATTRIBUTES)
 * a) Team Name
 * b) Team Logo (Uploaded via ImageBB API: d573d28ad9bc128aaf8b146c90466d1b)
 * c) Team Banner
 */
export async function getDynamicInvitedTeams(): Promise<DynamicInvitedTeam[]> {
  try {
    const snap = await getDocs(collection(db, 'invited_teams'));
    if (!snap.empty) {
      const items: DynamicInvitedTeam[] = [];
      snap.forEach((d) => items.push(d.data() as DynamicInvitedTeam));
      return items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'invited_teams');
  }

  const local = localStorage.getItem('memo_invited_teams');
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      // ignore
    }
  }
  return [];
}

export async function addDynamicInvitedTeam(
  team: { name: string; logoUrl: string; bannerUrl?: string }
): Promise<boolean> {
  const teamId = `team_inv_${Date.now()}`;
  const record: DynamicInvitedTeam = {
    id: teamId,
    name: team.name.trim(),
    logoUrl: team.logoUrl.trim(),
    bannerUrl: team.bannerUrl ? team.bannerUrl.trim() : '',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'invited_teams', teamId), record);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `invited_teams/${teamId}`);
  }

  const current = await getDynamicInvitedTeams();
  const updated = [record, ...current.filter((t) => t.id !== teamId)];
  localStorage.setItem('memo_invited_teams', JSON.stringify(updated));
  return true;
}

export async function deleteDynamicInvitedTeam(teamId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'invited_teams', teamId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `invited_teams/${teamId}`);
  }

  const current = await getDynamicInvitedTeams();
  const updated = current.filter((t) => t.id !== teamId);
  localStorage.setItem('memo_invited_teams', JSON.stringify(updated));
  return true;
}

export function subscribeDynamicInvitedTeams(
  callback: (teams: DynamicInvitedTeam[]) => void
) {
  const colRef = collection(db, 'invited_teams');
  return onSnapshot(
    colRef,
    (snap) => {
      if (!snap.empty) {
        const items: DynamicInvitedTeam[] = [];
        snap.forEach((d) => items.push(d.data() as DynamicInvitedTeam));
        callback(items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
      } else {
        callback([]);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'invited_teams');
      callback([]);
    }
  );
}

/**
 * 6. ANTI-FRAUD IP TRACKING & REFERRAL SYSTEM
 */
export async function recordProfileVisit(
  referralCode: string,
  visitorUserId?: string
): Promise<number> {
  if (!referralCode) return 0;

  const currentSession = localStorage.getItem('memo_ffc_user_session');
  if (currentSession) {
    try {
      const parsed = JSON.parse(currentSession);
      if (parsed.referralCode === referralCode) {
        return getUserProfileVisits(referralCode);
      }
    } catch {
      // ignore
    }
  }

  const visitorIp = await getClientIp();
  const deviceId = getDeviceFingerprint();
  const visitorKey = `${visitorIp}_${deviceId}`.replace(/[^a-zA-Z0-9_-]/g, '_');

  const localVisitKey = `visited_ref_${referralCode}_${visitorKey}`;
  if (localStorage.getItem(localVisitKey)) {
    return getUserProfileVisits(referralCode);
  }
  localStorage.setItem(localVisitKey, '1');

  try {
    const visitorDocRef = doc(db, 'profile_visits', referralCode, 'unique_visitors', visitorKey);
    const visitorSnap = await getDoc(visitorDocRef);

    if (visitorSnap.exists()) {
      return getUserProfileVisits(referralCode);
    }

    await setDoc(visitorDocRef, {
      visitorKey,
      ip: visitorIp,
      deviceId,
      visitorUserId: visitorUserId || null,
      visitedAt: new Date().toISOString(),
    });

    const refDoc = doc(db, 'profile_visits', referralCode);
    const snap = await getDoc(refDoc);
    const currentCount = snap.exists() ? snap.data().count || 0 : 0;
    const newCount = currentCount + 1;

    await setDoc(
      refDoc,
      {
        referralCode,
        count: newCount,
        lastVisitAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return newCount;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `profile_visits/${referralCode}`);
    const localCount = parseInt(localStorage.getItem(`memo_visits_${referralCode}`) || '0', 10) + 1;
    localStorage.setItem(`memo_visits_${referralCode}`, String(localCount));
    return localCount;
  }
}

export async function getUserProfileVisits(referralCode: string): Promise<number> {
  if (!referralCode) return 0;
  try {
    const snap = await getDoc(doc(db, 'profile_visits', referralCode));
    if (snap.exists()) {
      return snap.data().count || 0;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `profile_visits/${referralCode}`);
  }
  return parseInt(localStorage.getItem(`memo_visits_${referralCode}`) || '0', 10);
}

export function subscribeUserProfileVisits(
  referralCode: string,
  callback: (count: number) => void
) {
  if (!referralCode) return () => {};
  const docRef = doc(db, 'profile_visits', referralCode);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data().count || 0);
      } else {
        callback(0);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, `profile_visits/${referralCode}`);
      callback(parseInt(localStorage.getItem(`memo_visits_${referralCode}`) || '0', 10));
    }
  );
}

/**
 * 7. COOLER COUPON CLAIMS MANAGEMENT
 */
export async function submitCoolerCouponClaim(
  claim: CoolerCouponClaim
): Promise<boolean> {
  try {
    await setDoc(doc(db, 'cooler_coupon_claims', claim.id), claim);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `cooler_coupon_claims/${claim.id}`);
  }

  const localClaims = JSON.parse(localStorage.getItem('memo_cooler_claims') || '[]');
  localClaims.unshift(claim);
  localStorage.setItem('memo_cooler_claims', JSON.stringify(localClaims));
  return true;
}

export async function getAllCoolerCouponClaims(): Promise<CoolerCouponClaim[]> {
  try {
    const snap = await getDocs(collection(db, 'cooler_coupon_claims'));
    if (!snap.empty) {
      const claims: CoolerCouponClaim[] = [];
      snap.forEach((d) => claims.push(d.data() as CoolerCouponClaim));
      return claims.sort((a, b) => (b.claimedAt || '').localeCompare(a.claimedAt || ''));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'cooler_coupon_claims');
  }

  const local = localStorage.getItem('memo_cooler_claims');
  if (local) {
    try {
      return JSON.parse(local);
    } catch {
      // ignore
    }
  }

  return [];
}

export async function updateCoolerCouponClaimStatus(
  claimId: string,
  newStatus: 'pending_dispatch' | 'dispatched' | 'delivered'
): Promise<boolean> {
  try {
    await setDoc(
      doc(db, 'cooler_coupon_claims', claimId),
      { status: newStatus, updatedAt: new Date().toISOString() },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `cooler_coupon_claims/${claimId}`);
  }

  const local = await getAllCoolerCouponClaims();
  const updated = local.map((c) => (c.id === claimId ? { ...c, status: newStatus } : c));
  localStorage.setItem('memo_cooler_claims', JSON.stringify(updated));
  return true;
}

/**
 * 8. TEAM REGISTRATION IN FIRESTORE WITH INSTANT REAL-TIME APPROVAL
 */
export async function registerTeamInFirebase(
  registration: TeamRegistration
): Promise<boolean> {
  const teamPath = `teams/${registration.id}`;
  const devicePath = `device_locks/${registration.deviceFingerprint}`;

  // Always save locally immediately
  try {
    localStorage.setItem('memo_ffc_registered_team', JSON.stringify(registration));
    localStorage.setItem('memo_ffc_device_locked', 'true');
  } catch {
    // ignore
  }

  try {
    await setDoc(doc(db, 'teams', registration.id), registration);
  } catch (err) {
    console.warn('Firestore team creation fallback:', err);
    handleFirestoreError(err, OperationType.CREATE, teamPath);
  }

  try {
    await setDoc(doc(db, 'device_locks', registration.deviceFingerprint), {
      deviceFingerprint: registration.deviceFingerprint,
      teamId: registration.id,
      teamName: registration.team.name,
      status: registration.status || 'Approved',
      lockedAt: registration.registeredAt,
    });
  } catch (err) {
    console.warn('Firestore device lock fallback:', err);
    handleFirestoreError(err, OperationType.CREATE, devicePath);
  }

  try {
    const currentSlots = await getTournamentSlots();
    await updateTournamentSlots({
      ...currentSlots,
      bookedSlots: currentSlots.bookedSlots + 1,
    });
  } catch (err) {
    console.warn('Firestore slot update skipped:', err);
  }

  return true;
}

export async function updateTeamStatusInFirebase(
  teamId: string,
  status: 'Pending' | 'Approved' | 'Rejected'
): Promise<boolean> {
  try {
    await setDoc(
      doc(db, 'teams', teamId),
      { status, approvedAt: new Date().toISOString() },
      { merge: true }
    );
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `teams/${teamId}`);
    return false;
  }
}

export async function checkDeviceLockInFirebase(fingerprint: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'device_locks', fingerprint);
    const snap = await getDoc(docRef);
    return snap.exists();
  } catch (err) {
    return false;
  }
}

export async function getAllRegisteredTeams(): Promise<TeamRegistration[]> {
  try {
    const snapshot = await getDocs(collection(db, 'teams'));
    if (!snapshot.empty) {
      const teams: TeamRegistration[] = [];
      snapshot.forEach((d) => teams.push(d.data() as TeamRegistration));
      return teams.sort((a, b) => (a.slotNumber || 0) - (b.slotNumber || 0));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'teams');
  }

  const local = localStorage.getItem('memo_ffc_registered_team');
  if (local) {
    try {
      const parsed = JSON.parse(local);
      return [parsed];
    } catch {
      // ignore
    }
  }

  return [];
}

export async function deleteTeamInFirebase(teamId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'teams', teamId));
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `teams/${teamId}`);
    return false;
  }
}

/**
 * 9. REAL-TIME ANALYTICS COUNTERS
 */
export async function getLiveAnalyticsData(): Promise<{
  totalTeams: number;
  totalReferrals: number;
  totalUsers: number;
  totalSubmissions: number;
}> {
  try {
    const [teamsSnap, usersSnap, claimsSnap, visitsSnap] = await Promise.all([
      getDocs(collection(db, 'teams')).catch(() => null),
      getDocs(collection(db, 'users')).catch(() => null),
      getDocs(collection(db, 'cooler_coupon_claims')).catch(() => null),
      getDocs(collection(db, 'profile_visits')).catch(() => null),
    ]);

    const totalTeams = teamsSnap ? teamsSnap.size : 0;
    const totalUsers = usersSnap ? Math.max(usersSnap.size, 1) : 1;
    const claimsCount = claimsSnap ? claimsSnap.size : 0;

    let totalReferrals = 0;
    if (visitsSnap) {
      visitsSnap.forEach((d) => {
        totalReferrals += (d.data().count || 0);
      });
    }

    return {
      totalTeams,
      totalReferrals,
      totalUsers,
      totalSubmissions: totalTeams + claimsCount,
    };
  } catch (err) {
    return {
      totalTeams: 0,
      totalReferrals: 0,
      totalUsers: 1,
      totalSubmissions: 0,
    };
  }
}

// Compatibility exports
export { type DynamicInvitedTeam } from '../types/tournament';
export { MEMO_COOLER_SPECS } from '../data/tournamentData';
export type CoolerClaimSubmission = CoolerCouponClaim;

export async function submitCoolerClaimToFirebase(claim: CoolerCouponClaim): Promise<boolean> {
  return submitCoolerCouponClaim(claim);
}

export function subscribeDailyTop20Referrals(callback: (entries: LeaderboardEntry[]) => void) {
  return () => {};
}
