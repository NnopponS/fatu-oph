import { z } from "zod";
import { loadRewardPolicy } from "./_lib/rewards.js";
import {
  adminAuth,
  adminDb,
  appendAudit,
  bearerToken,
  enforceRateLimit,
  json,
  publicError,
  readJson,
  requireActor,
} from "./_lib/server.js";

const submitSchema = z.object({
  action: z.literal("submit"),
  overallRating: z.number().int().min(1).max(5),
  venueRating: z.number().int().min(1).max(5),
  activityRating: z.number().int().min(1).max(5),
  staffRating: z.number().int().min(1).max(5),
  favoriteVenue: z.string().trim().max(100).optional().default(""),
  feedback: z.string().trim().max(1000).optional().default(""),
});

const statusSchema = z.object({
  action: z.literal("status"),
});

const summarySchema = z.object({
  action: z.literal("summary"),
});

export async function POST(request: Request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await readJson(request);

    // 1. Check Submission Status
    if (body.action === "status") {
      statusSchema.parse(body);
      const token = bearerToken(request);
      if (!token) return json({ error: "กรุณาเข้าสู่ระบบ" }, 401);

      let decoded;
      try {
        decoded = await adminAuth.verifyIdToken(token);
      } catch {
        return json({ error: "เซสชันหมดอายุ" }, 401);
      }

      const uid = decoded.uid;
      const snap = await adminDb.ref(`operations/surveys/${uid}`).get();
      const savedBonus = (await adminDb.ref(`operations/accounting/participants/${uid}/surveyBonus`).get()).val();
      return json({
        submitted: snap.exists() || Boolean(savedBonus),
        record: snap.val() || savedBonus || null,
      });
    }

    // 2. Submit Survey
    if (body.action === "submit") {
      await enforceRateLimit(request, "survey-submit", 5, 60_000);
      const input = submitSchema.parse(body);
      const token = bearerToken(request);
      if (!token) return json({ error: "กรุณาเข้าสู่ระบบ" }, 401);

      let decoded;
      try {
        decoded = await adminAuth.verifyIdToken(token);
      } catch {
        return json({ error: "เซสชันหมดอายุ" }, 401);
      }

      const uid = decoded.uid;
      const existingSnap = await adminDb.ref(`operations/surveys/${uid}`).get();
      if (existingSnap.exists()) {
        return json({ error: "คุณได้ส่งแบบประเมินความพึงพอใจไปแล้ว ขอบคุณสำหรับความคิดเห็น" }, 400);
      }

      const participantSnap = await adminDb.ref(`operations/participants/${uid}`).get();
      if (!participantSnap.exists()) return json({ error: "บัญชีนี้ไม่ใช่ผู้เข้าร่วมงาน" }, 403);
      const participant = participantSnap.val() || {};
      const createdAt = new Date().toISOString();

      const surveyRecord = {
        uid,
        username: participant.username || decoded.name || uid.slice(0, 8),
        displayName: participant.displayName || decoded.name || "ผู้ร่วมงาน",
        school: participant.school || "",
        overallRating: input.overallRating,
        venueRating: input.venueRating,
        activityRating: input.activityRating,
        staffRating: input.staffRating,
        favoriteVenue: input.favoriteVenue,
        feedback: input.feedback,
        createdAt,
      };

      const rules = await loadRewardPolicy();
      const bonusTxId = adminDb.ref().push().key || crypto.randomUUID();
      const accountRef = adminDb.ref(`operations/accounting/participants/${uid}`);
      const bonus = await accountRef.transaction((current) => {
        const next = current || { pointTotal: 0, grantCounts: {}, transactions: {} };
        next.transactions ||= {};
        if (next.surveyBonus || Object.values(next.transactions).some(t => (t as { source?: string }).source === "survey-bonus")) return;
        next.surveyBonus = surveyRecord;
        next.pointTotal = Number(next.pointTotal || 0) + rules.surveyPoints;
        next.transactions[bonusTxId] = {
          points: rules.surveyPoints,
          reason: "โบนัสตอบแบบประเมินความพึงพอใจ Open House",
          source: "survey-bonus",
          createdAt,
        };
        return next;
      });
      if (!bonus.committed) return json({ error: "บันทึกแบบประเมินนี้แล้ว ไม่เพิ่มโบนัสซ้ำ" }, 409);
      await adminDb.ref(`operations/surveys/${uid}`).set(surveyRecord);

      await appendAudit({
        type: "survey-submitted",
        participantId: uid,
        overallRating: input.overallRating,
      });

      return json({
        ok: true,
        message: `บันทึกแบบประเมินสำเร็จ! คุณได้รับโบนัส ${rules.surveyPoints} คะแนน`,
        pointsAdded: rules.surveyPoints,
        pointTotal: Number(bonus.snapshot.val()?.pointTotal || 0),
        record: surveyRecord,
      });
    }

    // 3. Admin Summary & Analytics
    if (body.action === "summary") {
      summarySchema.parse(body);
      const actor = await requireActor(request);
      if (actor.role !== "admin" && actor.role !== "editor" && actor.role !== "staff") {
        return json({ error: "ไม่มีสิทธิ์ดูผลสรุปแบบประเมิน" }, 403);
      }

      const snap = await adminDb.ref("operations/surveys").get();
      const allSurveys = Object.values(snap.val() || {}) as Array<{
        overallRating?: number;
        venueRating?: number;
        activityRating?: number;
        staffRating?: number;
        favoriteVenue?: string;
        feedback?: string;
        createdAt?: string;
        displayName?: string;
        school?: string;
      }>;

      const totalCount = allSurveys.length;
      if (totalCount === 0) {
        return json({
          totalCount: 0,
          avgOverall: 0,
          avgVenue: 0,
          avgActivity: 0,
          avgStaff: 0,
          surveys: [],
        });
      }

      const sum = allSurveys.reduce(
        (acc, s) => ({
          overall: acc.overall + Number(s.overallRating || 0),
          venue: acc.venue + Number(s.venueRating || 0),
          activity: acc.activity + Number(s.activityRating || 0),
          staff: acc.staff + Number(s.staffRating || 0),
        }),
        { overall: 0, venue: 0, activity: 0, staff: 0 },
      );

      return json({
        totalCount,
        avgOverall: +(sum.overall / totalCount).toFixed(2),
        avgVenue: +(sum.venue / totalCount).toFixed(2),
        avgActivity: +(sum.activity / totalCount).toFixed(2),
        avgStaff: +(sum.staff / totalCount).toFixed(2),
        surveys: allSurveys.slice(-100).reverse(),
      });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json({ error: error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง" }, 400);
    }
    return publicError(error);
  }
}
