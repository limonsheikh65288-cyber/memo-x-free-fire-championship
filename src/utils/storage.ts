import { UserProfile, TeamRegistration } from '../types/tournament';

const STORAGE_KEYS = {
  USER_SESSION: 'memo_ffc_user_session',
  REGISTERED_TEAM: 'memo_ffc_registered_team',
  DEVICE_UUID: 'memo_ffc_device_uuid',
  DEVICE_LOCKED: 'memo_ffc_device_locked',
  REFERRALS_DATA: 'memo_ffc_referral_store',
  SLOTS_BOOKED: 'memo_ffc_slots_booked',
};

const BASE_BOOKED_SLOTS = 27000;
export const TOTAL_TOURNAMENT_SLOTS = 47000;

// Generate or retrieve persistent device fingerprint
export function getOrCreateDeviceFingerprint(): string {
  let deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_UUID);
  if (!deviceId) {
    const screenRes = `${window.screen.width}x${window.screen.height}`;
    const userAgent = navigator.userAgent.slice(0, 30);
    const randomHex = Math.random().toString(36).substring(2, 10);
    deviceId = `DEV-${btoa(`${screenRes}-${userAgent}-${randomHex}`).substring(0, 16).toUpperCase()}`;
    localStorage.setItem(STORAGE_KEYS.DEVICE_UUID, deviceId);
  }
  return deviceId;
}

// Check if device is locked (already completed 1 registration)
export function isDeviceLocked(): boolean {
  return localStorage.getItem(STORAGE_KEYS.DEVICE_LOCKED) === 'true';
}

// Get registered team data for this device
export function getRegisteredTeam(): TeamRegistration | null {
  const data = localStorage.getItem(STORAGE_KEYS.REGISTERED_TEAM);
  if (!data) return null;
  try {
    const team = JSON.parse(data) as TeamRegistration;
    // Ensure slot number conforms to the real 27,000+ series
    if (team.slotNumber && team.slotNumber < BASE_BOOKED_SLOTS) {
      team.slotNumber = BASE_BOOKED_SLOTS + (team.slotNumber % 1000 || 1);
    }
    return team;
  } catch {
    return null;
  }
}

// Save team registration and enforce single device lock
export function saveTeamRegistration(registration: TeamRegistration): void {
  // Ensure registration has slot number starting from 27,001+
  if (!registration.slotNumber || registration.slotNumber <= BASE_BOOKED_SLOTS) {
    registration.slotNumber = getNextSlotNumber();
  }

  localStorage.setItem(STORAGE_KEYS.REGISTERED_TEAM, JSON.stringify(registration));
  localStorage.setItem(STORAGE_KEYS.DEVICE_LOCKED, 'true');

  const currentSlots = getBookedSlotsCount();
  const nextCount = Math.max(currentSlots + 1, registration.slotNumber);
  localStorage.setItem(STORAGE_KEYS.SLOTS_BOOKED, String(nextCount));

  if (registration.referralCodeUsed) {
    incrementReferralCount(registration.referralCodeUsed);
  }
}

export const saveRegisteredTeam = saveTeamRegistration;

export function incrementBookedSlots(): void {
  const currentSlots = getBookedSlotsCount();
  localStorage.setItem(STORAGE_KEYS.SLOTS_BOOKED, String(currentSlots + 1));
}

export function getNextSlotNumber(): number {
  const currentSlots = getBookedSlotsCount();
  return currentSlots + 1; // Starts at 27001
}

// Clear device lock
export function resetDeviceLock(): void {
  localStorage.removeItem(STORAGE_KEYS.DEVICE_LOCKED);
  localStorage.removeItem(STORAGE_KEYS.REGISTERED_TEAM);
}

// User session management
export function getUserSession(): UserProfile | null {
  const data = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveUserSession(user: UserProfile): void {
  localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(user));
}

export function clearUserSession(): void {
  localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
}

// Slots management: Baseline 27,000 booked out of 47,000 total
export function getBookedSlotsCount(): number {
  const saved = localStorage.getItem(STORAGE_KEYS.SLOTS_BOOKED);
  if (saved) {
    const num = parseInt(saved, 10);
    if (!isNaN(num) && num >= BASE_BOOKED_SLOTS) return num;
  }
  return BASE_BOOKED_SLOTS;
}

// Referral tracking system
export function getReferralCount(code: string): number {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.REFERRALS_DATA) || '{}');
    return data[code] || 0;
  } catch {
    return 0;
  }
}

export function incrementReferralCount(code: string): number {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.REFERRALS_DATA) || '{}');
    data[code] = (data[code] || 0) + 1;
    localStorage.setItem(STORAGE_KEYS.REFERRALS_DATA, JSON.stringify(data));

    const currentUser = getUserSession();
    if (currentUser && currentUser.referralCode === code) {
      currentUser.referralCount = data[code];
      saveUserSession(currentUser);
    }
    return data[code];
  } catch {
    return 1;
  }
}
