import { z } from "zod";
import {
  adminAuth,
  adminDb,
  bearerToken,
  enforceRateLimit,
  isValidUsername,
  json,
  normalizeUsername,
  publicError,
  readJson,
  sendFirebasePasswordReset,
  verifyFirebasePassword,
} from "./_lib/server.js";

const participantRegisterSchema = z.object({
  action: z.literal("register"),
  firstName: z.string().trim().min(1, "กรุณากรอกชื่อ").max(60),
  lastName: z.string().trim().min(1, "กรุณากรอกนามสกุล").max(60),
  displayName: z.string().trim().max(120).optional(),
  school: z.string().trim().min(1, "กรุณากรอกหรือเลือกโรงเรียน").max(160),
  grade: z.string().trim().min(1, "กรุณาเลือกระดับชั้น").max(60),
  academicTrack: z.string().trim().min(1, "กรุณาเลือกสายการเรียน").max(80),
  academicTrackOther: z.string().trim().max(120).optional().default(""),
  phone: z.string().trim().min(9, "กรุณากรอกเบอร์โทรศัพท์ที่ถูกต้อง").max(25),
  email: z.string().trim().email("รูปแบบอีเมลไม่ถูกต้อง"),
  username: z.string().trim().min(3, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร").max(30, "ชื่อผู้ใช้ต้องไม่เกิน 30 ตัวอักษร"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร").max(100),
  consent: z.literal(true, {
    errorMap: () => ({ message: "กรุณายอมรับเงื่อนไขและนโยบายความเป็นส่วนตัว" }),
  }),
});

const loginSchema = z.object({
  action: z.literal("login"),
  username: z.string().trim().min(2, "กรุณากรอกชื่อผู้ใช้").max(50),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

const staffRegisterSchema = z.object({
  action: z.literal("staff-register"),
  fullName: z.string().trim().min(2, "กรุณากรอกชื่อ-นามสกุล").max(120),
  username: z.string().trim().min(3, "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร").max(30),
  email: z.string().trim().email("รูปแบบอีเมลไม่ถูกต้อง"),
  phone: z.string().trim().min(9, "กรุณากรอกเบอร์โทรศัพท์").max(25),
  password: z.string().min(8, "รหัสผ่านเจ้าหน้าที่ต้องมีอย่างน้อย 8 ตัวอักษร").max(100),
  department: z.string().trim().max(100).optional().default(""),
});

const resetPasswordSchema = z.object({
  action: z.literal("reset-password"),
  identifier: z.string().trim().min(2, "กรุณากรอกชื่อผู้ใช้หรืออีเมล").max(100),
});

const checkUsernameSchema = z.object({
  action: z.literal("check-username"),
  username: z.string().trim().min(1).max(50),
});

export async function POST(request: Request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await readJson(request);

    // 1. Check Username Availability
    if (body.action === "check-username") {
      const input = checkUsernameSchema.parse(body);
      const normalized = normalizeUsername(input.username);

      if (!isValidUsername(normalized)) {
        return json({
          available: false,
          normalized,
          reason: "ชื่อผู้ใช้ต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข ขีดล่าง หรือจุด 3-30 ตัวอักษร และไม่ใช่คำสงวน",
        });
      }

      const snap = await adminDb.ref(`operations/usernames/${normalized}`).get();
      return json({
        available: !snap.exists(),
        normalized,
      });
    }

    // 2. Participant Registration
    if (body.action === "register") {
      await enforceRateLimit(request, "auth-register", 10, 60_000);
      const input = participantRegisterSchema.parse(body);
      const normalized = normalizeUsername(input.username);

      if (!isValidUsername(normalized)) {
        return json({
          error: "ชื่อผู้ใช้ไม่ถูกต้อง (อนุญาตเฉพาะตัวอักษร a-z, 0-9, _, -, . ความยาว 3-30 ตัวอักษร)",
        }, 400);
      }

      // Check username collision
      const usernameSnap = await adminDb.ref(`operations/usernames/${normalized}`).get();
      if (usernameSnap.exists()) {
        return json({ error: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาเลือกชื่อผู้ใช้อื่น" }, 400);
      }

      // Check email collision in Firebase Auth
      const contactEmail = input.email.toLowerCase();
      try {
        await adminAuth.getUserByEmail(contactEmail);
        return json({ error: "อีเมลนี้ถูกลงทะเบียนไว้ในระบบแล้ว กรุณาใช้อีเมลอื่นหรือกู้คืนรหัสผ่าน" }, 400);
      } catch (err: unknown) {
        // Expected if email is not in use
        const code = (err as { code?: string }).code;
        if (code && code !== "auth/user-not-found") throw err;
      }

      const fullName = `${input.firstName} ${input.lastName}`.trim();
      const displayName = input.displayName?.trim() || fullName;

      // Create Firebase Auth User with contact email & password
      const user = await adminAuth.createUser({
        email: contactEmail,
        password: input.password,
        displayName,
        emailVerified: false,
      });

      // Set custom claims for role
      await adminAuth.setCustomUserClaims(user.uid, { role: "participant" });

      const createdAt = new Date().toISOString();
      const participantProfile = {
        id: user.uid,
        username: normalized,
        firstName: input.firstName,
        lastName: input.lastName,
        displayName,
        school: input.school,
        grade: input.grade,
        academicTrack:
          (input.academicTrack === "other" || input.academicTrack === "อื่น ๆ" || input.academicTrack === "อื่นๆ") && input.academicTrackOther
            ? input.academicTrackOther
            : input.academicTrack,
        academicTrackOther: input.academicTrackOther || "",
        phone: input.phone,
        email: contactEmail,
        consent: true,
        createdAt,
        status: "active",
      };

      // Atomic commit to RTDB
      await adminDb.ref().update({
        [`operations/usernames/${normalized}`]: {
          uid: user.uid,
          role: "participant",
          createdAt,
        },
        [`operations/participants/${user.uid}`]: participantProfile,
        [`operations/accounting/participants/${user.uid}`]: {
          pointTotal: 0,
          grantCounts: {},
          transactions: {},
          claims: {},
        },
      });

      // Issue custom token for instant login
      const customToken = await adminAuth.createCustomToken(user.uid, { role: "participant" });

      return json({
        ok: true,
        customToken,
        user: {
          uid: user.uid,
          username: normalized,
          displayName,
          role: "participant",
        },
      }, 201);
    }

    // 3. User Login (Participant or Staff via Username + Password)
    if (body.action === "login") {
      await enforceRateLimit(request, "auth-login", 15, 60_000);
      const input = loginSchema.parse(body);
      const normalized = normalizeUsername(input.username);

      // Resolve username -> uid
      const usernameSnap = await adminDb.ref(`operations/usernames/${normalized}`).get();
      if (!usernameSnap.exists()) {
        return json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, 401);
      }

      const usernameEntry = usernameSnap.val() as { uid: string; role?: string };
      const uid = usernameEntry.uid;

      // Fetch user from Firebase Auth
      let authUser;
      try {
        authUser = await adminAuth.getUser(uid);
      } catch {
        return json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, 401);
      }

      if (authUser.disabled) {
        return json({ error: "บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ" }, 403);
      }

      if (!authUser.email) {
        return json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, 401);
      }

      // Verify password securely against Firebase Auth
      const validPassword = await verifyFirebasePassword(authUser.email, input.password);
      if (!validPassword) {
        return json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, 401);
      }

      // Determine authoritative role
      const roleSnap = await adminDb.ref(`admin/roles/${uid}/role`).get();
      const assignedRole = roleSnap.val();
      const role = typeof assignedRole === "string" ? assignedRole : (usernameEntry.role || "participant");

      // Generate custom token
      const customToken = await adminAuth.createCustomToken(uid, { role });

      return json({
        ok: true,
        customToken,
        user: {
          uid,
          username: normalized,
          displayName: authUser.displayName || normalized,
          role,
        },
      });
    }

    // 4. Staff Registration (Creates account in 'staff_pending' status)
    if (body.action === "staff-register") {
      await enforceRateLimit(request, "auth-staff-reg", 5, 60_000);
      const input = staffRegisterSchema.parse(body);
      const normalized = normalizeUsername(input.username);

      if (!isValidUsername(normalized)) {
        return json({ error: "ชื่อผู้ใช้ไม่ถูกต้อง (3-30 ตัวอักษร a-z, 0-9, _, -, .)" }, 400);
      }

      const usernameSnap = await adminDb.ref(`operations/usernames/${normalized}`).get();
      if (usernameSnap.exists()) {
        return json({ error: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" }, 400);
      }

      const contactEmail = input.email.toLowerCase();
      try {
        await adminAuth.getUserByEmail(contactEmail);
        return json({ error: "อีเมลนี้ถูกลงทะเบียนไว้ในระบบแล้ว" }, 400);
      } catch (err: unknown) {
        const code = (err as { code?: string }).code;
        if (code && code !== "auth/user-not-found") throw err;
      }

      const user = await adminAuth.createUser({
        email: contactEmail,
        password: input.password,
        displayName: input.fullName,
        emailVerified: false,
      });

      // Role is strictly staff_pending - NO immediate privileges!
      await adminAuth.setCustomUserClaims(user.uid, { role: "staff_pending" });

      const createdAt = new Date().toISOString();
      await adminDb.ref().update({
        [`operations/usernames/${normalized}`]: {
          uid: user.uid,
          role: "staff_pending",
          createdAt,
        },
        [`admin/roles/${user.uid}`]: {
          role: "staff_pending",
          createdAt,
        },
        [`operations/staffApplications/${user.uid}`]: {
          uid: user.uid,
          username: normalized,
          fullName: input.fullName,
          email: contactEmail,
          phone: input.phone,
          department: input.department || "",
          status: "pending",
          appliedAt: createdAt,
        },
      });

      const customToken = await adminAuth.createCustomToken(user.uid, { role: "staff_pending" });

      return json({
        ok: true,
        customToken,
        status: "pending",
        user: {
          uid: user.uid,
          username: normalized,
          displayName: input.fullName,
          role: "staff_pending",
        },
        message: "ลงทะเบียนเจ้าหน้าที่สำเร็จ กรุณารอผู้ดูแลระบบอนุมัติการใช้งาน",
      }, 201);
    }

    // 5. Password Reset (Forgot Password)
    if (body.action === "reset-password") {
      await enforceRateLimit(request, "auth-reset", 5, 60_000);
      const input = resetPasswordSchema.parse(body);
      const raw = input.identifier.trim();

      let targetEmail: string | null = null;
      if (raw.includes("@")) {
        targetEmail = raw.toLowerCase();
      } else {
        const normalized = normalizeUsername(raw);
        const usernameSnap = await adminDb.ref(`operations/usernames/${normalized}/uid`).get();
        const uid = usernameSnap.val();
        if (typeof uid === "string") {
          try {
            const user = await adminAuth.getUser(uid);
            targetEmail = user.email || null;
          } catch {
            // ignore
          }
        }
      }

      if (targetEmail) {
        await sendFirebasePasswordReset(targetEmail);
      }

      // Always return a generic success message to prevent account enumeration
      return json({
        ok: true,
        message: "หากพบบัญชีที่ตรงกับข้อมูล ระบบจะส่งวิธีกู้คืนบัญชีไปยังอีเมลที่ลงทะเบียนไว้",
      });
    }

    // 6. Current User Profile / Status
    if (body.action === "me") {
      const token = bearerToken(request);
      if (!token) return json({ error: "กรุณาเข้าสู่ระบบ" }, 401);

      let decoded;
      try {
        decoded = await adminAuth.verifyIdToken(token);
      } catch {
        return json({ error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" }, 401);
      }

      const uid = decoded.uid;
      const [
        participantSnap,
        roleSnap,
        accountSnap,
        visitsSnap,
        appSnap,
        luckySnap,
        surveySnap,
      ] = await Promise.all([
        adminDb.ref(`operations/participants/${uid}`).get(),
        adminDb.ref(`admin/roles/${uid}/role`).get(),
        adminDb.ref(`operations/accounting/participants/${uid}`).get(),
        adminDb.ref(`operations/locationVisits/${uid}`).get(),
        adminDb.ref(`operations/staffApplications/${uid}`).get(),
        adminDb.ref(`operations/luckyDraws/${uid}`).get(),
        adminDb.ref(`operations/surveys/${uid}`).get(),
      ]);

      const participant = participantSnap.val();
      const role = roleSnap.val() || decoded.role || (participant ? "participant" : "viewer");
      const account = accountSnap.val() || {};
      const visits = visitsSnap.val() || {};

      const transactions = Object.entries(account.transactions || {})
        .map(([id, val]) => ({ id, ...(val as Record<string, unknown>) }))
        .sort((a, b) => String((b as Record<string, unknown>).createdAt || "").localeCompare(String((a as Record<string, unknown>).createdAt || "")));

      const claims = Object.entries(account.claims || {})
        .filter(([, val]) => (val as { status?: string }).status !== "cancelled")
        .map(([id, val]) => ({ id, ...(val as Record<string, unknown>) }))
        .sort((a, b) => String((b as Record<string, unknown>).createdAt || "").localeCompare(String((a as Record<string, unknown>).createdAt || "")));

      // Lucky draw qualification: at least 1 completed activity and at least 1 location visit
      const hasCompletedActivity = transactions.some((t) => (t as { activityId?: string }).activityId);
      const hasCompletedVenue = Object.keys(visits).length >= 1;
      const luckyEligible = hasCompletedActivity && hasCompletedVenue;

      return json({
        user: {
          uid,
          role,
          email: decoded.email || "",
          displayName: participant?.displayName || decoded.name || "",
          username: participant?.username || "",
          school: participant?.school || "",
          grade: participant?.grade || "",
          academicTrack: participant?.academicTrack || "",
          phone: participant?.phone || "",
          staffApplication: appSnap.val() || null,
        },
        participant,
        pointTotal: Number(account.pointTotal || 0),
        transactions,
        claims,
        visits,
        luckyDraw: {
          eligible: luckyEligible,
          hasDrawn: luckySnap.exists(),
          record: luckySnap.val() || null,
        },
        surveyCompleted: surveySnap.exists(),
      });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      return json({ error: firstIssue?.message || "ข้อมูลไม่ถูกต้อง" }, 400);
    }
    return publicError(error);
  }
}
