import {
  get,
  onValue,
  push,
  ref,
  set,
  update,
  type Unsubscribe,
} from "firebase/database";
import { isFirebaseConfigured, requireDatabase } from "@/lib/firebase";
import plan from "@/data/open-house-plan.json";

function previewValue(path: string): unknown {
  if (path === "public") return plan;
  if (!path.startsWith("public/")) return null;
  return path.slice(7).split("/").reduce<unknown>((value, key) =>
    value && typeof value === "object" ? (value as Record<string, unknown>)[key] ?? null : null, plan);
}

export const realtimePaths = {
  public: {
    site: "public/site",
    announcements: "public/announcements",
    venues: "public/venues",
    activities: "public/activities",
    schedule: "public/schedule",
    prizes: "public/prizes",
    faq: "public/faq",
    assistantKnowledge: "public/assistantKnowledge",
    media: "public/media",
    settings: "public/settings",
    registrationConfig: "public/registrationConfig",
  },
  operations: {
    participants: "operations/participants",
    registrations: "operations/registrations",
    passes: "operations/passes",
    checkins: "operations/checkins",
    activityCompletions: "operations/activityCompletions",
    pointTransactions: "operations/pointTransactions",
    pointTotals: "operations/pointTotals",
    prizeClaims: "operations/prizeClaims",
    audit: "operations/audit",
  },
  admin: {
    roles: "admin/roles",
  },
} as const;

export async function readRealtime<T>(path: string): Promise<T | null> {
  if (!isFirebaseConfigured) return previewValue(path) as T | null;
  const snapshot = await get(ref(requireDatabase(), path));
  return snapshot.exists() ? (snapshot.val() as T) : null;
}

export function subscribeRealtime<T>(
  path: string,
  callback: (value: T | null) => void,
): Unsubscribe {
  if (!isFirebaseConfigured) {
    callback(previewValue(path) as T | null);
    return () => {};
  }
  return onValue(ref(requireDatabase(), path), (snapshot) => {
    callback(snapshot.exists() ? (snapshot.val() as T) : null);
  });
}

export async function setRealtime<T>(path: string, value: T): Promise<void> {
  await set(ref(requireDatabase(), path), value);
}

export async function updateRealtime(
  path: string,
  value: Record<string, unknown>,
): Promise<void> {
  await update(ref(requireDatabase(), path), value);
}

export async function pushRealtime<T>(
  path: string,
  value: T,
): Promise<string> {
  const target = push(ref(requireDatabase(), path));
  await set(target, value);

  if (!target.key) {
    throw new Error("Realtime Database did not return a key.");
  }

  return target.key;
}
