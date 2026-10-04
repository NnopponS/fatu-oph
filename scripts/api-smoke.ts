/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from "node:assert/strict";

process.env.FIREBASE_DATABASE_EMULATOR_HOST = "127.0.0.1:9000";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
process.env.FIREBASE_ADMIN_PROJECT_ID = "demo-fatu-oph-2026";
process.env.FIREBASE_DATABASE_URL =
  "https://demo-fatu-oph-2026-default-rtdb.firebaseio.com";

const [participantModule, checkinModule, adminModule, server] =
  await Promise.all([
    import("../api/participant.ts"),
    import("../api/checkin.ts"),
    import("../api/admin.ts"),
    import("../api/_lib/server.ts"),
  ]);

const participantHandler = participantModule.POST;
const checkinHandler = checkinModule.POST;
const adminHandler = adminModule.POST;

const { adminDb } = server;

async function call(
  handler: (request: Request) => Promise<Response>,
  body: Record<string, unknown>,
  token = "",
) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  const response = await handler(
    new Request("http://localhost/test", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }),
  );
  const data = (await response.json()) as Record<string, any>;
  return { status: response.status, data };
}

async function createAuthUser(email: string, password: string) {
  const response = await fetch(
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-key",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );
  assert.equal(response.status, 200);
  return (await response.json()) as { localId: string; idToken: string };
}

await adminDb.ref().set(null);
await adminDb.ref().update({
  "public/venues/theater": {
    name: "โรงละคร",
    visualIdentityKey: "azure-dragon",
    visualLabel: "Azure Dragon",
    description: "โรงละครสำหรับกิจกรรมการแสดง",
    directions: "อยู่ภายในมหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต",
    displayOrder: 1,
    isPublished: true,
  },
  "public/activities/demo-activity": {
    slug: "demo-activity",
    title: "กิจกรรมทดสอบ",
    shortDescription: "กิจกรรมสำหรับ smoke test",
    description: "ทดสอบการเช็กอินและสะสมแต้ม",
    venueId: "theater",
    startAt: "2026-10-01T09:00",
    endAt: "2026-10-01T10:00",
    registrationMode: "none",
    registrationUrl: "",
    capacity: 100,
    availabilityStatus: "open",
    tags: ["test"],
    displayOrder: 1,
    isPublished: true,
    isArchived: false,
    pointsEnabled: true,
    pointsAwarded: 100,
    pointGrantMode: "once",
    repeatLimit: null,
    completionMethod: "qr",
    requiresStaffVerification: false,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  "admin/activityQr/demo-activity": {
    token: "smoke-qr-token",
    updatedAt: new Date().toISOString(),
  },
  "public/prizes/demo-prize": {
    name: "รางวัลทดสอบ",
    description: "Smoke test prize",
    stock: 2,
    pointsRequired: 50,
    claimLimit: 1,
    displayOrder: 1,
    isPublished: true,
  },
  "public/faq/demo": {
    question: "โรงละครอยู่ไหน",
    answer: "ดูเส้นทางได้จากหน้าสถานที่โรงละคร",
    displayOrder: 1,
    isPublished: true,
  },
});

const publicRead = await fetch(
  "http://127.0.0.1:9000/public/venues.json?ns=demo-fatu-oph-2026-default-rtdb",
);
assert.equal(publicRead.status, 200);

const blockedWrite = await fetch(
  "http://127.0.0.1:9000/operations/probe.json?ns=demo-fatu-oph-2026-default-rtdb",
  {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ unsafe: true }),
  },
);
assert.equal(blockedWrite.status, 401);

const registered = await call(participantHandler, {
  action: "register",
  displayName: "ผู้ทดสอบ ระบบ",
  school: "Thammasat Test School",
});
assert.equal(registered.status, 201);
assert.ok(registered.data.participantId);
assert.ok(registered.data.passToken);
const participantId = String(registered.data.participantId);
const passToken = String(registered.data.passToken);

const operationsJson = JSON.stringify((await adminDb.ref("operations").get()).val());
assert.ok(!operationsJson.includes(passToken), "plaintext pass token must not be stored");

const before = await call(participantHandler, { action: "me", passToken });
assert.equal(before.status, 200);
assert.equal(before.data.pointTotal, 0);

const firstCheckin = await call(checkinHandler, {
  passToken,
  qrPayload: "FATU26:demo-activity:smoke-qr-token",
});
assert.equal(firstCheckin.status, 200);
assert.equal(firstCheckin.data.pointsAdded, 100);
assert.equal(firstCheckin.data.pointTotal, 100);

const duplicateCheckin = await call(checkinHandler, {
  passToken,
  qrPayload: "FATU26:demo-activity:smoke-qr-token",
});
assert.equal(duplicateCheckin.status, 200);
assert.equal(duplicateCheckin.data.pointsAdded, 0);
assert.equal(duplicateCheckin.data.pointTotal, 100);
assert.equal(duplicateCheckin.data.duplicate, true);

const runId = Date.now();
const authUser = await createAuthUser(`admin-smoke-${runId}@example.com`, "SmokePass123!");
await adminDb.ref(`admin/roles/${authUser.localId}`).set({ role: "admin" });

const adminRoleRead = await fetch(
  `http://127.0.0.1:9000/admin/roles/${authUser.localId}/role.json?ns=demo-fatu-oph-2026-default-rtdb&auth=${encodeURIComponent(authUser.idToken)}`,
);
assert.equal(adminRoleRead.status, 200);
assert.equal(await adminRoleRead.json(), "admin");

const adminPublicWrite = await fetch(
  `http://127.0.0.1:9000/public/announcements/smoke-admin.json?ns=demo-fatu-oph-2026-default-rtdb&auth=${encodeURIComponent(authUser.idToken)}`,
  {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: "Admin rule probe",
      body: "ok",
      level: "info",
      isPublished: false,
      displayOrder: 999,
    }),
  },
);
assert.equal(adminPublicWrite.status, 200);

const participants = await call(adminHandler, { action: "participants" }, authUser.idToken);
assert.equal(participants.status, 200);
assert.equal(participants.data.participants.length, 1);

const detailBefore = await call(
  adminHandler,
  { action: "participantDetail", participantId },
  authUser.idToken,
);
assert.equal(detailBefore.status, 200);
assert.equal(detailBefore.data.pointTotal, 100);
assert.equal(detailBefore.data.transactions.length, 1);

const entryCheckin = await call(
  adminHandler,
  { action: "entryCheckin", participantId },
  authUser.idToken,
);
assert.equal(entryCheckin.status, 200);
assert.equal(entryCheckin.data.duplicate, false);

const duplicateEntryCheckin = await call(
  adminHandler,
  { action: "entryCheckin", participantId },
  authUser.idToken,
);
assert.equal(duplicateEntryCheckin.status, 200);
assert.equal(duplicateEntryCheckin.data.duplicate, true);

const adjustment = await call(
  adminHandler,
  {
    action: "adjustPoints",
    participantId,
    points: -10,
    reason: "smoke adjustment",
  },
  authUser.idToken,
);
if (adjustment.status !== 200) console.error("adjustment", adjustment);
assert.equal(adjustment.status, 200);
assert.equal(adjustment.data.pointTotal, 90);

const detailAfterAdjustment = await call(
  adminHandler,
  { action: "participantDetail", participantId },
  authUser.idToken,
);
assert.equal(detailAfterAdjustment.status, 200);
const adjustmentTx = (detailAfterAdjustment.data.transactions as Array<{ id: string; source?: string }>).find(
  (tx) => tx.source === "staff-adjustment",
);
assert.ok(adjustmentTx?.id);

const staffCompletion = await call(
  adminHandler,
  {
    action: "completeActivity",
    participantId,
    activityId: "demo-activity",
  },
  authUser.idToken,
);
assert.equal(staffCompletion.status, 200);
assert.equal(staffCompletion.data.pointsAdded, 0);
assert.equal(staffCompletion.data.duplicate, true);
assert.equal(staffCompletion.data.pointTotal, 90);

const redemption = await call(
  adminHandler,
  {
    action: "redeemPrize",
    participantId,
    prizeId: "demo-prize",
  },
  authUser.idToken,
);
assert.equal(redemption.status, 200);
assert.equal(redemption.data.pointTotal, 40);
assert.equal(redemption.data.stockRemaining, 1);

const duplicateRedemption = await call(
  adminHandler,
  {
    action: "redeemPrize",
    participantId,
    prizeId: "demo-prize",
  },
  authUser.idToken,
);
assert.equal(duplicateRedemption.status, 409);

const reversal = await call(
  adminHandler,
  {
    action: "reverseTransaction",
    participantId,
    transactionId: adjustmentTx!.id,
    reason: "smoke reversal",
  },
  authUser.idToken,
);
assert.equal(reversal.status, 200);
assert.equal(reversal.data.pointTotal, 50);

const duplicateReversal = await call(
  adminHandler,
  {
    action: "reverseTransaction",
    participantId,
    transactionId: adjustmentTx!.id,
    reason: "duplicate reversal",
  },
  authUser.idToken,
);
assert.equal(duplicateReversal.status, 409);

const newStaff = await call(
  adminHandler,
  {
    action: "createStaff",
    email: `staff-smoke-${runId}@example.com`,
    password: "StaffPass123!",
    role: "staff",
  },
  authUser.idToken,
);
assert.equal(newStaff.status, 201);
assert.equal(newStaff.data.role, "staff");

const roles = await call(adminHandler, { action: "roles" }, authUser.idToken);
assert.equal(roles.status, 200);
assert.ok(
  (roles.data.roles as Array<{ email: string }>).some(
    (row) => row.email === `staff-smoke-${runId}@example.com`,
  ),
);

const editorUser = await createAuthUser(`editor-smoke-${runId}@example.com`, "EditorPass123!");
await adminDb.ref(`admin/roles/${editorUser.localId}`).set({ role: "editor" });

const editorPublicWrite = await fetch(
  `http://127.0.0.1:9000/public/faq/smoke-editor.json?ns=demo-fatu-oph-2026-default-rtdb&auth=${encodeURIComponent(editorUser.idToken)}`,
  {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      question: "Editor rule probe",
      answer: "ok",
      displayOrder: 999,
      isPublished: false,
    }),
  },
);
assert.equal(editorPublicWrite.status, 200);

const editorOperationsWrite = await fetch(
  `http://127.0.0.1:9000/operations/editor-probe.json?ns=demo-fatu-oph-2026-default-rtdb&auth=${encodeURIComponent(editorUser.idToken)}`,
  {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ unsafe: true }),
  },
);
assert.equal(editorOperationsWrite.status, 401);

const editorParticipants = await call(
  adminHandler,
  { action: "participants" },
  editorUser.idToken,
);
assert.equal(editorParticipants.status, 403);

const editorAdjust = await call(
  adminHandler,
  { action: "adjustPoints", participantId, points: 1, reason: "not allowed" },
  editorUser.idToken,
);
assert.equal(editorAdjust.status, 403);

const editorContentAudit = await call(
  adminHandler,
  { action: "contentAudit", kind: "faq", id: "demo", operation: "save" },
  editorUser.idToken,
);
assert.equal(editorContentAudit.status, 200);

const editorAudit = await call(adminHandler, { action: "audit" }, editorUser.idToken);
assert.equal(editorAudit.status, 403);

const after = await call(participantHandler, { action: "me", passToken });
assert.equal(after.status, 200);
assert.equal(after.data.pointTotal, 50);
assert.equal(after.data.claims.length, 1);
assert.ok(after.data.transactions.length >= 4);

const audit = await call(adminHandler, { action: "audit" }, authUser.idToken);
assert.equal(audit.status, 200);
assert.ok(audit.data.entries.length >= 3);

console.log(
  JSON.stringify(
    {
      ok: true,
      participantId,
      finalPoints: after.data.pointTotal,
      transactions: after.data.transactions.length,
      auditEntries: audit.data.entries.length,
      checks: [
        "public-read",
        "anonymous-operations-write-blocked",
        "admin-role-read",
        "admin-public-write",
        "editor-public-write",
        "editor-operations-write-blocked",
        "opaque-pass-registration",
        "qr-points",
        "duplicate-prevention",
        "participant-detail",
        "entry-checkin-idempotency",
        "staff-adjustment",
        "staff-completion-idempotency",
        "prize-redemption",
        "claim-limit",
        "point-reversal",
        "editor-role-boundaries",
        "content-audit",
        "staff-creation",
      ],
    },
    null,
    2,
  ),
);

process.exit(0);
