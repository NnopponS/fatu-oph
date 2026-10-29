/**
 * One-time prelaunch maintenance for FATU Open House 2026.
 *
 * Dry run: node scripts/prepare-production-2026.mjs
 * Apply:   FATU_ADMIN_PASSWORD and FATU_RESET_CONFIRM must be set in the
 *          execution environment; then pass --apply.
 *
 * Never run against an unexpected Firebase project.
 * Never commit backups, QR payloads, or credentials.
 */
import crypto from "node:crypto";
import { homedir } from "node:os";
import { join } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";

const PROJECT_ID = "fatu-oph-2026";
const DATABASE_URL = "https://fatu-oph-2026-default-rtdb.asia-southeast1.firebasedatabase.app";
const ADMIN_USERNAME = "admin-fatu2026";
const ADMIN_EMAIL = "admin-fatu2026@staff.fatu-oph.local";
const ROUND4_ID = "theatre-design-round-4";
const CONFIRMATION = "RESET-FATU-OPH-2026";
const apply = process.argv.includes("--apply");

if (process.argv.some((arg) => arg.startsWith("--") && arg !== "--apply")) {
  throw new Error("Unknown flag. Use --apply or no flags for a dry run.");
}
if (process.env.FIREBASE_DATABASE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  throw new Error("Refusing to treat a Firebase emulator as production.");
}
if (process.env.FIREBASE_ADMIN_PROJECT_ID && process.env.FIREBASE_ADMIN_PROJECT_ID !== PROJECT_ID) {
  throw new Error("Unexpected Firebase project ID.");
}
const databaseURL = process.env.FIREBASE_DATABASE_URL || DATABASE_URL;
if (databaseURL.replace(/\/$/, "") !== DATABASE_URL) {
  throw new Error("Unexpected Firebase database URL.");
}
if (apply && process.env.FATU_RESET_CONFIRM !== CONFIRMATION) {
  throw new Error("Set FATU_RESET_CONFIRM=" + CONFIRMATION + " to authorize the reset.");
}
const adminPassword = process.env.FATU_ADMIN_PASSWORD || "";
if (apply && adminPassword.length < 8) {
  throw new Error("FATU_ADMIN_PASSWORD must be provided securely and contain at least 8 characters.");
}

const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
const credential = clientEmail && privateKey
  ? cert({ projectId: PROJECT_ID, clientEmail, privateKey })
  : applicationDefault();
const app = initializeApp({ credential, projectId: PROJECT_ID, databaseURL });
const auth = getAuth(app);
const db = getDatabase(app);
const now = new Date().toISOString();
const backupDir = process.env.FATU_BACKUP_DIR || join(homedir(), "fatu-oph-private-backups");

function roundNumber(record) {
  const text = String(record?.title || "") + " " + String(record?.slug || "");
  const match = /(?:รอบ(?:ที่)?\s*|round\s*#?\s*|session\s*#?\s*)(\d+)/i.exec(text);
  return match ? Number(match[1]) : null;
}

function theatreDesignActivities(activities) {
  return Object.entries(activities).filter(([, value]) =>
    value?.venueId === "theater" &&
    /theat(?:re|er)[\s_-]*design/i.test(
      String(value.title || "") + " " + String(value.slug || ""),
    )
  ).map(([id, value]) => ({ id, value }));
}

function round4Draft(activities, existingRounds) {
  const reference = existingRounds.find((item) => roundNumber(item.value) === 3)?.value ||
    existingRounds.sort((a, b) => String(b.value?.startAt || "").localeCompare(String(a.value?.startAt || "")))[0]?.value ||
    {};
  const positions = Object.values(activities)
    .filter((value) => value?.venueId === "theater")
    .map((value) => Number(value?.displayOrder || 0));
  const title = String(reference.title || "").replace(
    /(?:รอบ(?:ที่)?\s*|round\s*#?\s*|session\s*#?\s*)3\b/i,
    (match) => match.replace(/3\b/, "4"),
  );
  return {
    ...reference,
    slug: ROUND4_ID,
    title: title !== String(reference.title || "") && title.trim()
      ? title
      : "Workshop Theatre Design รอบที่ 4",
    shortDescription: String(reference.shortDescription || "Workshop Theatre Design รอบที่ 4"),
    description: String(reference.description || ""),
    venueId: "theater",
    startAt: "",
    endAt: "",
    registrationMode: reference.registrationMode === "external"
      ? "none" : (reference.registrationMode || "on-site"),
    registrationUrl: "",
    availabilityStatus: "coming-soon",
    displayOrder: Math.max(0, ...positions) + 1,
    isPublished: false,
    isArchived: false,
    pointsEnabled: Boolean(reference.pointsEnabled),
    pointsAwarded: Math.max(0, Number(reference.pointsAwarded || 0)),
    pointGrantMode: reference.pointGrantMode || "once",
    repeatLimit: reference.repeatLimit ?? null,
    completionMethod: "qr",
    requiresStaffVerification: false,
    tags: [...new Set([...(Array.isArray(reference.tags) ? reference.tags : []), "Theatre Design", "Workshop"])],
    createdAt: now,
    updatedAt: now,
  };
}

async function listAllUsers() {
  const users = [];
  let pageToken;
  do {
    const page = await auth.listUsers(1000, pageToken);
    users.push(...page.users);
    pageToken = page.pageToken;
  } while (pageToken);
  return users;
}

function backupName(prefix, ext) {
  return prefix + "-" + now.replace(/[:.]/g, "-") + ext;
}

async function preparePrivateDirectory() {
  await mkdir(backupDir, { recursive: true, mode: 0o700 });
  return backupDir;
}

async function main() {
  // Read all operational and administrative state before touching the database.
  const [rootSnapshot, users] = await Promise.all([
    db.ref("/").get(),
    listAllUsers(),
  ]);
  const root = rootSnapshot.val() || {};
  const operations = root.operations || {};
  const roles = root.admin?.roles || {};
  const activities = root.public?.activities || {};
  const rounds = theatreDesignActivities(activities);
  const existingRound4 = rounds.find((item) => roundNumber(item.value) === 4) ||
    (activities[ROUND4_ID] ? { id: ROUND4_ID, value: activities[ROUND4_ID] } : null);
  const activityId = existingRound4?.id || ROUND4_ID;
  const activity = existingRound4?.value || round4Draft(activities, rounds);
  const index = operations.usernames?.[ADMIN_USERNAME];
  const indexedAdmin = index?.uid && roles[index.uid]?.role === "admin"
    ? users.find((user) => user.uid === index.uid)
    : null;
  const emailAdmin = users.find((user) =>
    user.email?.toLowerCase() === ADMIN_EMAIL &&
    roles[user.uid]?.role === "admin"
  );
  const keepUser = indexedAdmin || emailAdmin || null;
  const deleteCount = users.length - (keepUser ? 1 : 0);
  const claimedCount = Object.keys(operations.prizeClaims || {}).length;
  const drawCount = Object.keys(operations.luckyDraws || {}).length;
  const voucherCount = Object.keys(operations.luckyVouchers || {}).length;
  console.log(JSON.stringify({
    mode: apply ? "APPLY" : "DRY RUN - nothing changed",
    project: PROJECT_ID,
    participants: Object.keys(operations.participants || {}).length,
    authUsersToDelete: deleteCount,
    staffRolesToRemove: Object.keys(roles).filter((uid) => uid !== keepUser?.uid).length,
    prizeClaimsToClear: claimedCount,
    luckyDrawsToClear: drawCount,
    luckyVouchersToClear: voucherCount,
    prizeRuntimeToClear: Object.keys(operations.prizeRuntime || {}).length,
    theatreDesignRoundsFound: rounds.map((item) => ({
      id: item.id, title: item.value.title, round: roundNumber(item.value),
    })),
    round4ActivityId: activityId,
    round4Existing: Boolean(existingRound4),
    round4Published: activity.isPublished === true,
    round4HasSchedule: Boolean(activity.startAt && activity.endAt),
    round4QrExists: Boolean(root.admin?.activityQr?.[activityId]?.token),
    note: "All operations records reset; public content, prize definitions and existing venue/activity QRs remain.",
  }, null, 2));
  if (!apply) return;

  // Back up the exact pre-reset database, including its secure admin QR tokens.
  await preparePrivateDirectory();
  const backupPath = join(backupDir, backupName("database-before-launch", ".json"));
  await writeFile(backupPath, JSON.stringify({
    projectId: PROJECT_ID,
    exportedAt: now,
    database: root,
  }), { flag: "wx", mode: 0o600 });

  // Generate QR locally before any destructive operation. This stays outside Git.
  const priorQr = root.admin?.activityQr?.[activityId];
  const qr = priorQr?.token ? priorQr : {
    token: crypto.randomBytes(24).toString("base64url"),
    updatedAt: now,
    updatedBy: "production-launch-preparation",
  };
  const qrPayload = "FATU26:" + activityId + ":" + qr.token;
  const { default: QRCode } = await import("qrcode");
  const qrPath = join(backupDir, backupName("theatre-design-round-4-qr", ".png"));
  await QRCode.toFile(qrPath, qrPayload, { width: 1100, margin: 3 });

  // Freeze participant registration before deleting accounts. The API checks
  // both flags and will reject new participant accounts while either is false.
  const previousSiteOpen = root.public?.site?.registrationOpen;
  const previousConfigOpen = root.public?.registrationConfig?.registrationOpen;
  await db.ref("/").update({
    "public/site/registrationOpen": false,
    "public/registrationConfig/registrationOpen": false,
    "public/settings/staffRegistrationOpen": false,
  });

  let adminUser = keepUser;
  if (!adminUser) {
    // Use a synthetic Firebase email because the staff UI authenticates by username.
    adminUser = await auth.createUser({
      email: ADMIN_EMAIL,
      password: adminPassword,
      displayName: ADMIN_USERNAME,
      disabled: false,
    });
  } else {
    await auth.updateUser(adminUser.uid, {
      password: adminPassword,
      disabled: false,
      displayName: ADMIN_USERNAME,
    });
  }
  await auth.setCustomUserClaims(adminUser.uid, { role: "admin" });

  // Delete all other Firebase Auth accounts, including test participants and
  // previously approved/pending staff. A failed batch aborts before DB cleanup.
  const nonAdmin = (await listAllUsers()).filter((user) => user.uid !== adminUser.uid);
  for (let i = 0; i < nonAdmin.length; i += 1000) {
    const batch = nonAdmin.slice(i, i + 1000);
    const result = await auth.deleteUsers(batch.map((user) => user.uid));
    if (result.failureCount) {
      throw new Error("Auth deletion failed for " + result.failureCount +
        " accounts; database not wiped. Backup at: " + backupPath);
    }
  }

  // Multi-location RTDB update: clear participants, points, attendance,
  // prize redemptions, lucky draws/vouchers and pending staff applications.
  // Preserve all authored public content and existing QR tokens.
  const updates = {
    operations: {
      usernames: {
        [ADMIN_USERNAME]: {
          uid: adminUser.uid, role: "admin", createdAt: now,
        },
      },
    },
    "admin/roles": {
      [adminUser.uid]: { role: "admin", updatedAt: now },
    },
    "public/settings/staffRegistrationOpen": false,
    "public/site/registrationOpen": previousSiteOpen === undefined ? null : previousSiteOpen,
    "public/registrationConfig/registrationOpen": previousConfigOpen === undefined
      ? null : previousConfigOpen,
  };
  if (!existingRound4) updates["public/activities/" + activityId] = activity;
  if (!priorQr?.token) updates["admin/activityQr/" + activityId] = qr;
  await db.ref("/").update(updates);

  const [rolesAfter, operationsAfter, qrAfter, activityAfter] = await Promise.all([
    db.ref("admin/roles").get(),
    db.ref("operations").get(),
    db.ref("admin/activityQr/" + activityId).get(),
    db.ref("public/activities/" + activityId).get(),
  ]);
  const rolesValue = rolesAfter.val() || {};
  const operationValue = operationsAfter.val() || {};
  if (
    Object.keys(rolesValue).length !== 1 ||
    rolesValue[adminUser.uid]?.role !== "admin" ||
    Object.keys(operationValue.participants || {}).length ||
    Object.keys(operationValue.prizeRuntime || {}).length ||
    !qrAfter.val()?.token ||
    !activityAfter.exists()
  ) {
    throw new Error("Post-reset verification failed. Inspect production before opening registration.");
  }

  console.log(JSON.stringify({
    outcome: "READY",
    adminUsername: ADMIN_USERNAME,
    staffAccountsRemaining: 1,
    participantRecordsRemaining: 0,
    claimedPrizesRemaining: 0,
    qrActivityId: activityId,
    qrFile: qrPath,
    backupFile: backupPath,
    round4NeedsScheduleAndPublishing: !existingRound4,
    password: "Configured in Firebase Authentication (not printed or committed)",
  }, null, 2));
}

main().catch((error) => {
  console.error("PREPARATION FAILED:", error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
