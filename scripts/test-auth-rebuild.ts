/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from "node:assert/strict";

process.env.FIREBASE_DATABASE_EMULATOR_HOST = "127.0.0.1:9000";
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
process.env.FIREBASE_ADMIN_PROJECT_ID = "demo-fatu-oph-2026";
process.env.FIREBASE_DATABASE_URL = "https://demo-fatu-oph-2026-default-rtdb.firebaseio.com";
process.env.VITE_FIREBASE_API_KEY = "fake-api-key";

const [authModule, checkinModule, adminModule, server] = await Promise.all([
  import("../api/auth.ts"),
  import("../api/checkin.ts"),
  import("../api/admin.ts"),
  import("../api/_lib/server.ts"),
]);

const authHandler = authModule.POST;
const checkinHandler = checkinModule.POST;
const adminHandler = adminModule.POST;
const { adminDb, adminAuth } = server;

async function call(handler: (request: Request) => Promise<Response>, body: Record<string, unknown>, token = "") {
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

console.log("--- 1. Testing Username Check ---");
const checkValid = await call(authHandler, { action: "check-username", username: "hero_dragon" });
assert.equal(checkValid.status, 200);
assert.equal(checkValid.data.available, true);

const checkReserved = await call(authHandler, { action: "check-username", username: "admin" });
assert.equal(checkReserved.status, 200);
assert.equal(checkReserved.data.available, false);

console.log("--- 2. Testing Participant Registration (Username + Password) ---");
const regRes = await call(authHandler, {
  action: "register",
  firstName: "สมชาย",
  lastName: "ใจดี",
  school: "สวนกุหลาบวิทยาลัย",
  grade: "มัธยมศึกษาปีที่ 5",
  academicTrack: "วิทย์-คณิต",
  phone: "0812345678",
  email: "somchai@example.com",
  username: "somchai_dragon",
  password: "SecurePassword123!",
  consent: true,
});

assert.equal(regRes.status, 201);
assert.ok(regRes.data.customToken);
assert.equal(regRes.data.user.username, "somchai_dragon");
assert.equal(regRes.data.user.displayName, "สมชาย ใจดี");
assert.equal(regRes.data.user.role, "participant");

const participantUid = regRes.data.user.uid;

// Verify duplicate username rejection
const dupRes = await call(authHandler, {
  action: "register",
  firstName: "สมชาย2",
  lastName: "ใจดี",
  school: "สวนกุหลาบวิทยาลัย",
  grade: "มัธยมศึกษาปีที่ 5",
  academicTrack: "วิทย์-คณิต",
  phone: "0812345679",
  email: "somchai2@example.com",
  username: "somchai_dragon",
  password: "SecurePassword123!",
  consent: true,
});
assert.equal(dupRes.status, 400);
assert.ok(dupRes.data.error.includes("ถูกใช้งานแล้ว"));

console.log("--- 3. Testing Participant Login (Username + Password) ---");
const loginRes = await call(authHandler, {
  action: "login",
  username: "somchai_dragon",
  password: "SecurePassword123!",
});
assert.equal(loginRes.status, 200);
assert.ok(loginRes.data.customToken);
assert.equal(loginRes.data.user.username, "somchai_dragon");

// Wrong password
const badLogin = await call(authHandler, {
  action: "login",
  username: "somchai_dragon",
  password: "WrongPassword!",
});
assert.equal(badLogin.status, 401);

console.log("--- 4. Testing Password Reset Request ---");
const resetRes = await call(authHandler, {
  action: "reset-password",
  identifier: "somchai_dragon",
});
assert.equal(resetRes.status, 200);
assert.ok(resetRes.data.ok);

console.log("--- 5. Testing Staff Registration (staff_pending) ---");
const staffReg = await call(authHandler, {
  action: "staff-register",
  fullName: "เจ้าหน้าที่ สมหวัง",
  username: "staff_somwang",
  email: "somwang@example.com",
  phone: "0898765432",
  password: "StaffPassword123!",
  department: "ฝ่ายสถานที่",
});
assert.equal(staffReg.status, 201);
assert.equal(staffReg.data.user.role, "staff_pending");

const staffUid = staffReg.data.user.uid;

// Verify staff application in RTDB
const appSnap = await adminDb.ref(`operations/staffApplications/${staffUid}`).get();
assert.ok(appSnap.exists());
assert.equal(appSnap.val().status, "pending");

console.log("--- 6. Testing Admin Staff Approval ---");
// Create admin auth user
const adminUid = "test_admin_uid";
await adminAuth.createUser({ uid: adminUid, email: "admin@test.com" }).catch(() => {});
await adminDb.ref(`admin/roles/${adminUid}`).set({ role: "admin" });
await adminAuth.setCustomUserClaims(adminUid, { role: "admin" });

// Exchange custom token for ID token via Auth emulator
const adminCustomToken = await adminAuth.createCustomToken(adminUid, { role: "admin" });
const adminTokenRes = await fetch(
  "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake-api-key",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: adminCustomToken, returnSecureToken: true }),
  },
);
const adminAuthData = (await adminTokenRes.json()) as { idToken: string };

// Admin views staff applications
const appsRes = await call(adminHandler, { action: "staffApplications" }, adminAuthData.idToken);
assert.equal(appsRes.status, 200);
assert.ok(appsRes.data.applications.some((a: any) => a.uid === staffUid && (a.status === "pending" || a.status === "staff_pending")));

// Admin approves staff
const approveRes = await call(
  adminHandler,
  { action: "approveStaff", uid: staffUid, role: "staff" },
  adminAuthData.idToken,
);
assert.equal(approveRes.status, 200);
assert.ok(approveRes.data.ok);

// Verify role in RTDB is now 'staff'
const updatedRoleSnap = await adminDb.ref(`admin/roles/${staffUid}/role`).get();
assert.equal(updatedRoleSnap.val(), "staff");

console.log("--- 7. Testing Participant Self QR Check-in ---");
// Set up venue and activity in RTDB
await adminDb.ref("public/venues/venue_theatre").set({
  name: "โรงละคร",
  visualIdentityKey: "azure-dragon",
  visualLabel: "สวรรค์แดนมังกรฟ้า",
  description: "โรงละครศิลปกรรมศาสตร์",
  displayOrder: 1,
  isPublished: true,
});

await adminDb.ref("public/activities/act_opening").set({
  slug: "act-opening",
  title: "พิธีเปิดแดนมังกรฟ้า",
  description: "ชมการแสดงเปิดตัว",
  venueId: "venue_theatre",
  pointsEnabled: true,
  pointsAwarded: 50,
  pointGrantMode: "once",
  isPublished: true,
});

// Participant signs in to get ID token
const partTokenRes = await fetch(
  "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake-api-key",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: loginRes.data.customToken, returnSecureToken: true }),
  },
);
const partAuthData = (await partTokenRes.json()) as { idToken: string };

// Participant self scans the activity QR code
const checkinRes = await call(
  checkinHandler,
  { qrPayload: "FATU26:ACT:act_opening" },
  partAuthData.idToken,
);

assert.equal(checkinRes.status, 200);
assert.equal(checkinRes.data.ok, true);
assert.equal(checkinRes.data.pointsAdded, 50);
assert.equal(checkinRes.data.pointTotal, 50);
assert.equal(checkinRes.data.duplicate, false);

// Verify atomic location visit was also recorded
const visitSnap = await adminDb.ref(`operations/locationVisits/${participantUid}/venue_theatre`).get();
assert.ok(visitSnap.exists());
assert.equal(visitSnap.val().locationId, "venue_theatre");

// Test duplicate scan prevention
const dupCheckin = await call(
  checkinHandler,
  { qrPayload: "FATU26:ACT:act_opening" },
  partAuthData.idToken,
);
assert.equal(dupCheckin.status, 200);
assert.equal(dupCheckin.data.duplicate, true);
assert.equal(dupCheckin.data.pointsAdded, 0);
assert.equal(dupCheckin.data.pointTotal, 50);

console.log("\nALL REBUILD TEST SUITES PASSED CLEANLY!");
process.exit(0);
