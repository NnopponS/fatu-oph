import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCustomToken,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";
import { readRealtime, realtimePaths } from "@/services/realtime";

export const staffRoles = ["admin", "editor", "staff", "staff_pending", "viewer"] as const;
export type StaffRole = (typeof staffRoles)[number];

export interface ParticipantRegistrationData {
  firstName: string;
  lastName: string;
  school: string;
  grade: string;
  academicTrack: string;
  academicTrackOther?: string;
  phone: string;
  email: string;
  username: string;
  password: string;
  consent: boolean;
}

export interface StaffRegistrationData {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  department?: string;
}

export interface AuthUserProfile {
  uid: string;
  username: string;
  displayName: string;
  role: string;
  email?: string;
  school?: string;
  grade?: string;
  academicTrack?: string;
  academicTrackOther?: string;
  phone?: string;
  status?: string;
  pointTotal?: number;
  transactions?: Array<{
    id: string;
    points: number;
    activityId?: string;
    activityTitle?: string;
    venueId?: string;
    venueName?: string;
    createdAt?: string;
  }>;
  claims?: Array<{
    id: string;
    prizeId?: string;
    prizeName?: string;
    pointsCost?: number;
    status?: string;
    createdAt?: string;
  }>;
  visits?: Record<
    string,
    {
      locationId: string;
      locationName?: string;
      visitedAt: string;
      byActivityId?: string;
    }
  >;
  luckyDraw?: {
    claimed: boolean;
    prizeId?: string;
    prizeName?: string;
    voucherCode?: string;
    claimedAt?: string;
    redeemed?: boolean;
    redeemedAt?: string;
    redeemedBy?: string;
  };
  surveyCompleted?: boolean;
  surveyCompletedAt?: string;
}

// 1. Participant Username + Password Registration
export async function participantRegister(data: ParticipantRegistrationData) {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "register", ...data }),
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.error || "ลงทะเบียนไม่สำเร็จ");
  }

  // Sign into Firebase Auth via Custom Token
  const userCredential = await signInWithCustomToken(auth, payload.customToken);
  return { user: userCredential.user, profile: payload.user };
}

// 2. Universal Username + Password Login (Participant or Staff)
export async function usernameLogin(username: string, password: string) {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", username, password }),
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.error || "เข้าสู่ระบบไม่สำเร็จ");
  }

  const userCredential = await signInWithCustomToken(auth, payload.customToken);
  return { user: userCredential.user, profile: payload.user };
}

// 3. Staff Registration (Enters staff_pending status)
export async function staffRegister(data: StaffRegistrationData) {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "staff-register", ...data }),
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.error || "ลงทะเบียนเจ้าหน้าที่ไม่สำเร็จ");
  }

  const userCredential = await signInWithCustomToken(auth, payload.customToken);
  return { user: userCredential.user, profile: payload.user, message: payload.message };
}

// 4. Check Username Availability
export async function checkUsername(username: string): Promise<{ available: boolean; reason?: string }> {
  if (!username || username.trim().length < 3) {
    return { available: false, reason: "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร" };
  }

  try {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "check-username", username }),
    });
    return await res.json();
  } catch {
    return { available: false, reason: "ไม่สามารถตรวจสอบชื่อผู้ใช้ได้ในขณะนี้" };
  }
}

// 5. Password Reset Request
export async function requestPasswordReset(identifier: string): Promise<string> {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reset-password", identifier }),
  });

  const payload = await res.json();
  if (!res.ok) {
    throw new Error(payload.error || "ไม่สามารถส่งคำขอกู้คืนรหัสผ่านได้");
  }

  return payload.message || "ระบบได้ส่งขั้นตอนการกู้คืนรหัสผ่านไปยังอีเมลของคุณแล้ว";
}

// 6. Fetch Current User Profile
export async function fetchCurrentUserProfile(): Promise<AuthUserProfile | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  try {
    const token = await currentUser.getIdToken();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "me" }),
    });

    if (!res.ok) return null;
    const payload = await res.json();
    if (!payload.user) return null;
    return {
      ...payload.user,
      pointTotal: Number(payload.pointTotal || 0),
      transactions: payload.transactions || [],
      claims: payload.claims || [],
      visits: payload.visits || {},
      luckyDraw: { claimed: Boolean(payload.luckyDraw?.hasDrawn), voucherCode: payload.luckyDraw?.record?.voucherCode },
      surveyCompleted: Boolean(payload.surveyCompleted),
    };
  } catch {
    return null;
  }
}

// Legacy Admin Helpers (Preserved for compatibility)
export function signInAdmin(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signOutAdmin() {
  return signOut(auth);
}

export function signOutUser() {
  return signOut(auth);
}

export function sendAdminPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export function getAdminAuthErrorMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) return "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่";
  if (["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"].includes(error.code)) return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  if (error.code === "auth/too-many-requests") return "ลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่";
  if (error.code === "auth/user-disabled") return "บัญชีนี้ถูกปิดการใช้งาน";
  if (error.code === "auth/network-request-failed") return "เชื่อมต่อ Firebase ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ต";
  return "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่";
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getStaffRole(user: User): Promise<StaffRole | null> {
  const role = await readRealtime<unknown>(
    `${realtimePaths.admin.roles}/${user.uid}/role`,
  );

  return typeof role === "string" &&
    (staffRoles as readonly string[]).includes(role)
    ? (role as StaffRole)
    : null;
}
