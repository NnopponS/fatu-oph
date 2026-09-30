import { z } from "zod";
import { adminDb, enforceRateLimit, grantActivityPoints, json, publicError, readJson, resolveParticipant, safeEqual } from "./_lib/server.js";

const inputSchema = z.object({
  passToken: z.string().min(20),
  qrPayload: z.string().min(8).max(500),
});

function parseQr(value: string) {
  const match = /^FATU26:([^:]+):(.+)$/.exec(value.trim());
  return match ? { activityId: match[1], token: match[2] } : null;
}

export async function POST(request: Request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    await enforceRateLimit(request, "checkin", 60);
    const input = inputSchema.parse(await readJson(request));
    const participant = await resolveParticipant(input.passToken);
    if (!participant) return json({ error: "ไม่พบบัตรผู้เข้าร่วม" }, 404);

    const qr = parseQr(input.qrPayload);
    if (!qr) return json({ error: "QR Code ไม่ถูกต้อง" }, 400);

    const [activitySnap, qrSnap] = await Promise.all([
      adminDb.ref(`public/activities/${qr.activityId}`).get(),
      adminDb.ref(`admin/activityQr/${qr.activityId}`).get(),
    ]);
    const activity = activitySnap.val();
    const qrConfig = qrSnap.val();

    if (!activity?.isPublished || activity?.isArchived) return json({ error: "กิจกรรมนี้ไม่เปิดใช้งาน" }, 400);
    if (!qrConfig?.token || !safeEqual(String(qrConfig.token), qr.token)) return json({ error: "QR Code หมดอายุหรือไม่ถูกต้อง" }, 400);
    if (activity.completionMethod !== "qr" || activity.requiresStaffVerification || activity.pointGrantMode === "manual-only") {
      return json({ error: "กิจกรรมนี้ต้องให้เจ้าหน้าที่ตรวจสอบ" }, 400);
    }

    const grant = await grantActivityPoints({
      participantId: participant.participantId,
      activityId: qr.activityId,
      activity,
      source: "activity-qr",
    });

    if (grant.committed && grant.transactionId) {
      await adminDb.ref(`operations/checkins/${grant.transactionId}`).set({
        participantId: participant.participantId,
        activityId: qr.activityId,
        pointsAdded: grant.pointsAdded,
        createdAt: grant.createdAt,
        method: "qr",
      });
    }

    return json({
      ok: true,
      activityTitle: activity.title,
      pointsAdded: grant.pointsAdded,
      pointTotal: grant.pointTotal,
      duplicate: !grant.committed,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return json({ error: "ข้อมูลเช็กอินไม่ถูกต้อง" }, 400);
    return publicError(error);
  }
}
