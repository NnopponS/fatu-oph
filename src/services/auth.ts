import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";
import { readRealtime, realtimePaths } from "@/services/realtime";

export const staffRoles = ["admin", "editor", "staff", "viewer"] as const;
export type StaffRole = (typeof staffRoles)[number];

export function signInAdmin(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signOutAdmin() {
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
