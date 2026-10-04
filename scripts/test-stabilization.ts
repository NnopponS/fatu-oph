/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from "node:assert/strict";

process.env.FIREBASE_DATABASE_EMULATOR_HOST = "127.0.0.1:9000";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
process.env.FIREBASE_ADMIN_PROJECT_ID = "demo-fatu-oph-2026";
process.env.FIREBASE_DATABASE_URL = "https://demo-fatu-oph-2026-default-rtdb.firebaseio.com";
process.env.VITE_FIREBASE_API_KEY = "fake-api-key";

const [authModule, checkinModule, adminModule, luckyDrawModule, server] = await Promise.all([
  import("../api/auth.ts"),
  import("../api/checkin.ts"),
  import("../api/admin.ts"),
  import("../api/lucky-draw.ts"),
  import("../api/_lib/server.ts"),
]);

const authHandler = authModule.POST;
const checkinHandler = checkinModule.POST;
const adminHandler = adminModule.POST;
const luckyDrawHandler = luckyDrawModule.POST;
const { adminDb, adminAuth } = server;

async function call(
  handler: (request: Request) => Promise<Response>,
  body: Record<string, unknown>,
  token = "",
) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  const response = await handler(new Request("http://localhost/test", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  }));
  return { status: response.status, data: await response.json() as Record<string, any> };
}

async function idTokenFor(uid: string, role?: string) {
  const customToken = await adminAuth.createCustomToken(uid, role ? { role } : undefined);
  const response = await fetch(
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake-api-key",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    },
  );
  assert.equal(response.status, 200);
  return ((await response.json()) as { idToken: string }).idToken;
}

async function registerParticipant(username: string, email: string) {
  return call(authHandler, {
    action: "register",
    firstName: "ทดสอบ",
    lastName: username,
    school: "โรงเรียนทดสอบ",
    grade: "มัธยมศึกษาปีที่ 6",
    academicTrack: "วิทย์-คณิต",
    phone: "0812345678",
    email,
    username,
    password: "SecurePass123!",
    consent: true,
  });
}

await adminDb.ref().set(null);

const adminUid = "stabilization_admin";
await adminAuth.createUser({ uid: adminUid, email: "stabilization-admin@example.com" }).catch(() => {});
await adminDb.ref(`admin/roles/${adminUid}`).set({ role: "admin" });
await adminAuth.setCustomUserClaims(adminUid, { role: "admin" });
const adminToken = await idTokenFor(adminUid, "admin");

console.log("1. Admin settings payload contract + registration close");
let result = await call(adminHandler, {
  action: "saveSiteConfig",
  name: "FATU OPEN HOUSE 2026",
  eventYear: 2026,
  theme: "ตะลุยแดนมังกร",
  faculty: "คณะศิลปกรรมศาสตร์",
  description: "test",
  dateLabel: "test-date",
  locationLabel: "test-location",
  registrationOpen: false,
}, adminToken);
assert.equal(result.status, 200);

result = await call(adminHandler, {
  action: "saveRegistrationConfig",
  academicTracks: [{ id: "sci", label: "วิทย์-คณิต" }],
  grades: ["ม.6"],
  registrationOpen: false,
}, adminToken);
assert.equal(result.status, 200);

result = await registerParticipant("closed_user", "closed@example.com");
assert.equal(result.status, 403);

await call(adminHandler, {
  action: "saveSiteConfig",
  name: "FATU OPEN HOUSE 2026",
  eventYear: 2026,
  theme: "ตะลุยแดนมังกร",
  faculty: "คณะศิลปกรรมศาสตร์",
  description: "test",
  dateLabel: "test-date",
  locationLabel: "test-location",
  registrationOpen: true,
}, adminToken);
await call(adminHandler, {
  action: "saveRegistrationConfig",
  academicTracks: [{ id: "sci", label: "วิทย์-คณิต" }],
  grades: ["ม.6"],
  registrationOpen: true,
}, adminToken);

console.log("2. Staff pending status is consistent and staff cannot self-check-in");
const staffReg = await call(authHandler, {
  action: "staff-register",
  fullName: "Staff Pending",
  username: "staff_pending_test",
  email: "staff-pending@example.com",
  phone: "0899999999",
  password: "StaffPass123!",
  department: "Ops",
});
assert.equal(staffReg.status, 201);
assert.equal(staffReg.data.status, "staff_pending");
const staffUid = String(staffReg.data.user.uid);
const staffToken = await idTokenFor(staffUid, "staff_pending");

const apps = await call(adminHandler, { action: "staffApplications" }, adminToken);
assert.equal(apps.status, 200);
assert.equal(apps.data.applications.find((x: any) => x.uid === staffUid)?.status, "staff_pending");

await adminDb.ref("public/venues/venue_a").set({
  name: "โรงละคร",
  visualLabel: "แดนทดสอบ",
  isPublished: true,
});
await adminDb.ref("public/activities/paid_a").set({
  title: "Paid A",
  venueId: "venue_a",
  isPublished: true,
  isArchived: false,
  pointsEnabled: true,
  pointsAwarded: 20,
  pointGrantMode: "once",
  completionMethod: "qr",
});
await adminDb.ref("admin/activityQr/paid_a").set({ token: "secure-a" });

result = await call(checkinHandler, { qrPayload: "FATU26:paid_a:secure-a" }, staffToken);
assert.equal(result.status, 403);

console.log("3. Protected activity QR rejects tokenless payload and accepts current token");
const participant = await registerParticipant("participant_a", "participant-a@example.com");
assert.equal(participant.status, 201);
const participantUid = String(participant.data.user.uid);
const participantToken = await idTokenFor(participantUid, "participant");

result = await call(checkinHandler, { qrPayload: "FATU26:ACT:paid_a" }, participantToken);
assert.equal(result.status, 400);

result = await call(checkinHandler, { qrPayload: "FATU26:paid_a:secure-a" }, participantToken);
assert.equal(result.status, 200);
assert.equal(result.data.pointsAdded, 20);
assert.equal(result.data.pointTotal, 20);

console.log("4. Direct venue check-in is idempotent and preserves real point total");
result = await call(checkinHandler, { qrPayload: "FATU26:CHK:venue_a" }, participantToken);
assert.equal(result.status, 200);
assert.equal(result.data.pointTotal, 20);
assert.equal(result.data.duplicate, true, "activity check-in already recorded the venue visit");

await adminDb.ref("public/venues/venue_b").set({ name: "ตึกคณะ", visualLabel: "แดน B", isPublished: true });
result = await call(checkinHandler, { qrPayload: "FATU26:CHK:venue_b" }, participantToken);
assert.equal(result.status, 200);
assert.equal(result.data.duplicate, false);
assert.equal(result.data.pointTotal, 20);
result = await call(checkinHandler, { qrPayload: "FATU26:CHK:venue_b" }, participantToken);
assert.equal(result.status, 200);
assert.equal(result.data.duplicate, true);
assert.equal(result.data.pointTotal, 20);

console.log("5. Staff manual completion uses the same per-venue cap");
await adminDb.ref("public/activities/paid_b").set({
  title: "Paid B",
  venueId: "venue_a",
  isPublished: true,
  isArchived: false,
  pointsEnabled: true,
  pointsAwarded: 40,
  pointGrantMode: "once",
  completionMethod: "staff",
});
result = await call(adminHandler, {
  action: "completeActivity",
  participantId: participantUid,
  activityId: "paid_b",
}, adminToken);
assert.equal(result.status, 200);
assert.equal(result.data.pointsAdded, 0);
assert.equal(result.data.pointTotal, 20);

console.log("6. Zero-point activity does not consume a venue's point entitlement");
const participant2 = await registerParticipant("participant_b", "participant-b@example.com");
assert.equal(participant2.status, 201);
const participant2Uid = String(participant2.data.user.uid);
const participant2Token = await idTokenFor(participant2Uid, "participant");
await adminDb.ref("public/activities/zero_b").set({
  title: "Zero B",
  venueId: "venue_b",
  isPublished: true,
  isArchived: false,
  pointsEnabled: false,
  pointsAwarded: 0,
  pointGrantMode: "once",
  completionMethod: "qr",
});
await adminDb.ref("admin/activityQr/zero_b").set({ token: "zero-token" });
await adminDb.ref("public/activities/paid_c").set({
  title: "Paid C",
  venueId: "venue_b",
  isPublished: true,
  isArchived: false,
  pointsEnabled: true,
  pointsAwarded: 30,
  pointGrantMode: "once",
  completionMethod: "qr",
});
await adminDb.ref("admin/activityQr/paid_c").set({ token: "paid-c-token" });

result = await call(checkinHandler, { qrPayload: "FATU26:zero_b:zero-token" }, participant2Token);
assert.equal(result.status, 200);
assert.equal(result.data.pointsAdded, 0);
result = await call(checkinHandler, { qrPayload: "FATU26:paid_c:paid-c-token" }, participant2Token);
assert.equal(result.status, 200);
assert.equal(result.data.pointsAdded, 30);

console.log("7. Username claim is atomic under concurrent registration");
const [raceA, raceB] = await Promise.all([
  registerParticipant("race_user", "race-a@example.com"),
  registerParticipant("race_user", "race-b@example.com"),
]);
const statuses = [raceA.status, raceB.status].sort((a, b) => a - b);
assert.deepEqual(statuses, [201, 409]);
const raceIndex = (await adminDb.ref("operations/usernames/race_user").get()).val();
assert.ok(raceIndex?.uid);

console.log("8. Lucky Draw status contract, one-time draw, and claimed status");
result = await call(luckyDrawHandler, { action: "status" }, participant2Token);
assert.equal(result.status, 200);
assert.equal(result.data.status.eligible, true);
assert.equal(result.data.status.claimed, false);
assert.equal(result.data.status.conditions.hasVisitedVenue, true);
assert.equal(result.data.status.conditions.hasCompletedActivity, true);

result = await call(luckyDrawHandler, { action: "draw" }, participant2Token);
assert.equal(result.status, 200);
assert.ok(result.data.voucher?.voucherCode);

result = await call(luckyDrawHandler, { action: "status" }, participant2Token);
assert.equal(result.status, 200);
assert.equal(result.data.status.claimed, true);
assert.ok(result.data.status.prize?.title);
assert.ok(result.data.status.prize?.voucherCode);

result = await call(luckyDrawHandler, { action: "draw" }, participant2Token);
assert.ok(result.status === 400 || result.status === 409);

console.log("9. Unified portal username lookup preserves role boundaries");
result = await call(adminHandler, { action: "participantByUsername", username: "PARTICIPANT_A" }, adminToken);
assert.equal(result.status, 200);
assert.equal(result.data.participant.id, participantUid);
assert.equal(result.data.participant.username, "participant_a");
assert.deepEqual(Object.keys(result.data.participant).sort(), ["displayName", "id", "username"]);
result = await call(adminHandler, { action: "participantByUsername", username: participantUid }, adminToken);
assert.equal(result.status, 200);
assert.equal(result.data.participant.id, participantUid);
result = await call(adminHandler, { action: "participantByUsername", username: "participant_a" }, participantToken);
assert.equal(result.status, 403);
result = await call(adminHandler, { action: "participantByUsername", username: "participant_a" }, staffToken);
assert.equal(result.status, 403);
await adminDb.ref(`admin/roles/${staffUid}`).set({ role: "staff" });
const approvedStaffToken = await idTokenFor(staffUid, "staff");
result = await call(adminHandler, { action: "participantByUsername", username: "participant_a" }, approvedStaffToken);
assert.equal(result.status, 200);
assert.equal(result.data.participant.id, participantUid);
await adminDb.ref(`admin/roles/${staffUid}`).set({ role: "editor" });
result = await call(adminHandler, { action: "participantByUsername", username: "participant_a" }, approvedStaffToken);
assert.equal(result.status, 403);
result = await call(adminHandler, { action: "participantByUsername", username: "missing_user" }, adminToken);
assert.equal(result.status, 404);
result = await call(adminHandler, { action: "participantByUsername", username: "../bad/path" }, adminToken);
assert.equal(result.status, 400);

console.log("\nSTABILIZATION REGRESSION SUITE PASSED");
process.exit(0);
