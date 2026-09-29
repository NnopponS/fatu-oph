import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
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
