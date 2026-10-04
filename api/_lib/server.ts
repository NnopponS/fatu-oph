import crypto from "node:crypto";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { activityAward, rewardPolicy } from "../../src/lib/reward-policy.js";

function initAdmin() {
  if (getApps().length) return getApps()[0];

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "fatu-oph-2026";
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const databaseURL =
    process.env.FIREBASE_DATABASE_URL ||
    process.env.VITE_FIREBASE_DATABASE_URL ||
    "https://fatu-oph-2026-default-rtdb.asia-southeast1.firebasedatabase.app";

  if (process.env.FIREBASE_DATABASE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    return initializeApp({ projectId, databaseURL });
  }

  const credential =
    clientEmail && privateKey
      ? cert({ projectId, clientEmail, privateKey })
      : applicationDefault();

  return initializeApp({ credential, projectId, databaseURL });
}

export const adminApp = initAdmin();
export const adminAuth = getAuth(adminApp);
export const adminDb = getDatabase(adminApp);

export function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export async function readJson(request: Request) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    throw new Error("INVALID_JSON");
  }
}

export function bearerToken(request: Request) {
  const value = request.headers.get("authorization") || "";
  return value.startsWith("Bearer ") ? value.slice(7) : "";
}

export async function requireStaff(
  request: Request,
  allowed: string[] = ["admin", "editor", "staff"],
) {
  const token = bearerToken(request);
  if (!token) throw new Error("UNAUTHORIZED");

  const decoded = await adminAuth.verifyIdToken(token);
  const roleSnap = await adminDb.ref(`admin/roles/${decoded.uid}/role`).get();
  const role = roleSnap.val();

  if (typeof role !== "string" || !allowed.includes(role)) {
    throw new Error("FORBIDDEN");
  }

  return { uid: decoded.uid, role, email: decoded.email || "" };
}

export function randomToken(bytes = 24) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export async function enforceRateLimit(
  request: Request,
  bucket: string,
  limit: number,
  windowMs = 60_000,
) {
  const forwarded = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "local";
  const ip = forwarded.split(",")[0]?.trim() || "local";
  const window = Math.floor(Date.now() / windowMs);
  const key = sha256(`${bucket}:${ip}:${window}`).slice(0, 32);
  const ref = adminDb.ref(`operations/rateLimits/${bucket}/${key}`);

  const result = await ref.transaction((current) => {
    const count = Number(current?.count || 0);
    if (count >= limit) return;
    return {
      count: count + 1,
      expiresAt: (window + 1) * windowMs,
    };
  });

  if (!result.committed) throw new Error("RATE_LIMITED");
}

export async function resolveParticipant(passToken: string) {
  if (!passToken || passToken.length < 20) return null;
  const hash = sha256(passToken);
  const snap = await adminDb.ref(`operations/passIndex/${hash}/participantId`).get();
  const participantId = snap.val();
  return typeof participantId === "string" ? { participantId, hash } : null;
}

interface GrantActivity {
  title?: string;
  startAt?: string;
  pointGrantMode?: string;
  repeatLimit?: number;
  pointsEnabled?: boolean;
  pointsAwarded?: number;
}

export async function grantActivityPoints(input: {
  participantId: string;
  activityId: string;
  activity: GrantActivity;
  source: "activity-qr" | "staff-completion";
  staffId?: string;
  venueId?: string;
}) {
  const accountRef = adminDb.ref(`operations/accounting/participants/${input.participantId}`);
  const txId = adminDb.ref().push().key || crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const mode = String(input.activity.pointGrantMode || "once");
  const scope =
    mode === "per-session"
      ? `${input.activityId}:${input.activity.startAt || createdAt.slice(0, 10)}`
      : input.activityId;
  const grantKey = sha256(scope).slice(0, 32);
  const limit =
    mode === "repeat-limited"
      ? Math.max(1, Number(input.activity.repeatLimit || 1))
      : mode === "once" || mode === "per-session" || mode === "manual-only"
        ? 1
        : Number.POSITIVE_INFINITY;
  let pointsAdded = 0;
  let venueCapped = false;
  const rules = rewardPolicy((await adminDb.ref("public/site/rewardPolicy").get()).val());

  const result = await accountRef.transaction((current) => {
    const next = current || { pointTotal: 0, grantCounts: {}, transactions: {}, claims: {} };
    next.grantCounts ||= {};
    next.transactions ||= {};
    next.venueGrantCounts ||= {};
    next.venueVisits ||= {};

    const count = Number(next.grantCounts[grantKey] || 0);
    if (count >= limit) return; // duplicate activity checkin

    // Venue cap applies only to activities that actually award points.
    const award = activityAward(input.activity, rules);
    if (input.venueId && award > 0) {
      const venueCount = Number(next.venueGrantCounts[input.venueId] || 0);
      if (venueCount >= 1) {
        venueCapped = true;
        pointsAdded = 0;
      } else {
        next.venueGrantCounts[input.venueId] = 1;
        pointsAdded = award;
      }
    } else {
      pointsAdded = award;
    }

    next.grantCounts[grantKey] = count + 1;
    if (input.venueId) next.venueVisits[input.venueId] = true;
    next.pointTotal = Number(next.pointTotal || 0) + pointsAdded;
    next.transactions[txId] = {
      points: pointsAdded,
      reason: venueCapped
        ? `เข้าร่วมกิจกรรม ${input.activity.title || input.activityId} (รับแต้มจากแดนนี้ครบแล้ว)`
        : `เข้าร่วมกิจกรรม ${input.activity.title || input.activityId}`,
      activityId: input.activityId,
      venueId: input.venueId || "",
      grantKey,
      source: input.source,
      ...(input.staffId ? { staffId: input.staffId } : {}),
      createdAt,
    };
    return next;
  });

  const account = result.snapshot.val() || {};
  return {
    committed: result.committed,
    transactionId: result.committed ? txId : null,
    createdAt,
    pointsAdded: result.committed ? pointsAdded : 0,
    pointTotal: Number(account.pointTotal || 0),
    venueCapped,
  };
}

export async function grantVenuePoints(participantId: string, venueId: string, venueName: string, alreadyVisited: boolean) {
  const rules = rewardPolicy((await adminDb.ref("public/site/rewardPolicy").get()).val());
  const accountRef = adminDb.ref(`operations/accounting/participants/${participantId}`);
  const txId = adminDb.ref().push().key || crypto.randomUUID();
  const createdAt = new Date().toISOString();
  if (alreadyVisited) {
    const existing = await accountRef.get();
    return { pointsAdded: 0, pointTotal: Number(existing.val()?.pointTotal || 0), createdAt };
  }
  const result = await accountRef.transaction(current => {
    const next = current || { pointTotal: 0, transactions: {} };
    next.venueVisits ||= {};
    if (next.venueVisits[venueId]) return;
    next.venueVisits[venueId] = true;
    next.transactions ||= {};
    next.pointTotal = Number(next.pointTotal || 0) + rules.pointsPerVenue;
    next.transactions[txId] = { points: rules.pointsPerVenue, reason: `เช็กอิน ${venueName}`, venueId, source: "venue-qr", createdAt };
    return next;
  });
  return { pointsAdded: result.committed ? rules.pointsPerVenue : 0, pointTotal: Number(result.snapshot.val()?.pointTotal || 0), createdAt };
}

export function publicError(error: unknown) {
  const message = error instanceof Error ? error.message : "UNKNOWN";
  if (message === "UNAUTHORIZED") return json({ error: "กรุณาเข้าสู่ระบบ" }, 401);
  if (message === "FORBIDDEN") return json({ error: "ไม่มีสิทธิ์ทำรายการนี้" }, 403);
  if (message === "INVALID_JSON") return json({ error: "ข้อมูลไม่ถูกต้อง" }, 400);
  if (message === "RATE_LIMITED") return json({ error: "ทำรายการถี่เกินไป กรุณาลองใหม่อีกครั้ง" }, 429);
  console.error(error);
  return json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, 500);
}

export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase();
}

export const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "staff",
  "support",
  "root",
  "system",
  "moderator",
  "oph",
  "fatu",
  "null",
  "undefined",
  "official",
  "help",
  "security",
  "api",
  "dev",
  "developer",
  "guest",
]);

export function isValidUsername(username: string): boolean {
  return /^[a-z0-9_.-]{3,30}$/.test(username) && !RESERVED_USERNAMES.has(username);
}

export async function verifyFirebasePassword(email: string, password: string): Promise<boolean> {
  const apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || "";
  const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const url = authHost
    ? `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`
    : `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });
    return res.ok;
  } catch (err) {
    console.error("verifyFirebasePassword error:", err);
    return false;
  }
}

export async function appendAudit(entry: Record<string, unknown>) {
  const auditId = adminDb.ref("operations/audit").push().key;
  if (!auditId) return;
  await adminDb.ref(`operations/audit/${auditId}`).set({
    ...entry,
    createdAt: new Date().toISOString(),
  });
}

export const requireActor = requireStaff;

export async function sendFirebasePasswordReset(email: string): Promise<boolean> {
  const apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || "";
  const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const url = authHost
    ? `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`
    : `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestType: "PASSWORD_RESET", email }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

