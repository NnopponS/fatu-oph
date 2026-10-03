import { z } from "zod";
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
      return json({
        submitted: snap.exists(),
        record: snap.val() || null,
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

      await adminDb.ref(`operations/surveys/${uid}`).set(surveyRecord);

      // Award 10 bonus points for survey completion
      const bonusTxId = adminDb.ref().push().key || crypto.randomUUID();
      const accountRef = adminDb.ref(`operations/accounting/participants/${uid}`);
      await accountRef.transaction((current) => {
        const next = current || { pointTotal: 0, grantCounts: {}, transactions: {} };
        next.transactions ||= {};
        next.pointTotal = Number(next.pointTotal || 0) + 10;
        next.transactions[bonusTxId] = {
          points: 10,
          reason: "โบนัสตอบแบบประเมินความพึงพอใจ Open House",
          source: "survey-bonus",
          createdAt,
        };
        return next;
      });

      await appendAudit({
        type: "survey-submitted",
        participantId: uid,
        overallRating: input.overallRating,
      });

      return json({
        ok: true,
        message: "บันทึกแบบประเมินสำเร็จ! คุณได้รับโบนัส 10 คะแนน",
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
