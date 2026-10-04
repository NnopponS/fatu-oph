import { z } from "zod";
import {
  adminAuth,
  adminDb,
  bearerToken,
  enforceRateLimit,
  grantActivityPoints,
  grantVenuePoints,
  json,
  publicError,
  readJson,
  resolveParticipant,
  safeEqual,
} from "./_lib/server.js";

const inputSchema = z.object({
  qrPayload: z.string().trim().min(6).max(500),
  passToken: z.string().optional(),
});

interface ParsedQr {
  type: "activity" | "checkpoint" | "location";
  targetId: string;
  token?: string;
}

function parseQr(value: string): ParsedQr | null {
  const trimmed = value.trim();

  // Format 1: FATU26:CHK:<targetId>:<token> or FATU26:CHK:<targetId>
  const chkTokenMatch = /^FATU26:CHK:([^:]+):(.+)$/i.exec(trimmed);
  if (chkTokenMatch) return { type: "checkpoint", targetId: chkTokenMatch[1], token: chkTokenMatch[2] };

  const chkDirectMatch = /^FATU26:CHK:([^:]+)$/i.exec(trimmed);
  if (chkDirectMatch) return { type: "checkpoint", targetId: chkDirectMatch[1] };

  // Format 2: FATU26:ACT:<activityId>:<token> or FATU26:ACT:<activityId>
  const actTokenMatch = /^FATU26:ACT:([^:]+):(.+)$/i.exec(trimmed);
  if (actTokenMatch) return { type: "activity", targetId: actTokenMatch[1], token: actTokenMatch[2] };

  const actDirectMatch = /^FATU26:ACT:([^:]+)$/i.exec(trimmed);
  if (actDirectMatch) return { type: "activity", targetId: actDirectMatch[1] };

  // Format 3: FATU26:<activityId>:<token> or FATU26:<activityId>
  const stdTokenMatch = /^FATU26:([^:]+):(.+)$/i.exec(trimmed);
  if (stdTokenMatch) return { type: "activity", targetId: stdTokenMatch[1], token: stdTokenMatch[2] };

  const stdDirectMatch = /^FATU26:([^:]+)$/i.exec(trimmed);
  if (stdDirectMatch) return { type: "activity", targetId: stdDirectMatch[1] };

  return null;
}

export async function POST(request: Request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    await enforceRateLimit(request, "self-checkin", 45, 60_000);
    const body = await readJson(request);
    const input = inputSchema.parse(body);

    // 1. Authenticate Participant: via Bearer token (preferred) or passToken (legacy)
    let participantId: string | null = null;
    const token = bearerToken(request);

    if (token) {
      try {
        const decoded = await adminAuth.verifyIdToken(token);
        const participantSnap = await adminDb.ref(`operations/participants/${decoded.uid}`).get();
        if (!participantSnap.exists()) {
          return json({ error: "บัญชีนี้ไม่ใช่บัญชีผู้เข้าร่วมงาน" }, 403);
        }
        participantId = decoded.uid;
      } catch {
        return json({ error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" }, 401);
      }
    } else if (input.passToken) {
      const resolved = await resolveParticipant(input.passToken);
      if (resolved) participantId = resolved.participantId;
    }

    if (!participantId) {
      return json({ error: "กรุณาเข้าสู่ระบบก่อนสแกนเช็กอิน" }, 401);
    }

    // 2. Parse and Validate QR Payload
    const qr = parseQr(input.qrPayload);
    if (!qr) {
      return json({ error: "QR Code ไม่ถูกต้องหรือไม่ใช่จุดเช็กอินของงาน" }, 400);
    }

    let activityId = qr.targetId;
    let expectedToken = "";
    let checkpointLocationId: string | null = null;

    if (qr.type === "checkpoint") {
      const chkSnap = await adminDb.ref(`operations/checkpoints/${qr.targetId}`).get();
      const checkpoint = chkSnap.val();
      if (checkpoint && checkpoint.status === "active") {
        activityId = checkpoint.activityId;
        expectedToken = String(checkpoint.token || "");
        checkpointLocationId = checkpoint.locationId || null;
      } else {
        // Direct venue checkpoint check
        const venueSnap = await adminDb.ref(`public/venues/${qr.targetId}`).get();
        if (venueSnap.exists()) {
          const venue = venueSnap.val();
          const config = (await adminDb.ref(`admin/venueQr/${qr.targetId}`).get()).val();
          if (!venue.isPublished || !config?.token || !qr.token || !safeEqual(qr.token, config.token)) {
            return json({ error: "QR สถานที่ไม่ถูกต้อง กรุณาสแกนป้ายล่าสุดจากเจ้าหน้าที่" }, 400);
          }
          const visitRef = adminDb.ref(`operations/locationVisits/${participantId}/${qr.targetId}`);
          const visitSnapshot = await visitRef.get();
          const grant = await grantVenuePoints(participantId, qr.targetId, venue.name, visitSnapshot.exists());
          // Record venue visit idempotently and preserve the first visit timestamp.
          const visitedAt = new Date().toISOString();
          const visitResult = await visitRef.transaction((current) => {
            if (current) return;
            return {
              locationId: qr.targetId,
              locationName: venue.visualLabel || venue.name,
              visitedAt,
            };
          });
          return json({
            ok: true,
            activityTitle: "สำรวจแดนศักดิ์สิทธิ์",
            locationId: qr.targetId,
            locationName: venue.name,
            pointsAdded: grant.pointsAdded,
            pointTotal: grant.pointTotal,
            newlyVisitedLocation: visitResult.committed,
            duplicate: !visitResult.committed,
            message: visitResult.committed
              ? `เช็กอินสำรวจ ${venue.visualLabel || venue.name} สำเร็จ!`
              : `คุณเคยเช็กอิน ${venue.visualLabel || venue.name} แล้ว`,
          });
        }
      }
    } else {
      const qrSnap = await adminDb.ref(`admin/activityQr/${activityId}`).get();
      const qrConfig = qrSnap.val();
      expectedToken = String(qrConfig?.token || "");
      if (!expectedToken) {
        return json({ error: "QR ของกิจกรรมนี้ยังไม่ถูกเปิดใช้งาน กรุณาติดต่อเจ้าหน้าที่" }, 400);
      }
    }

    if (expectedToken && (!qr.token || !safeEqual(expectedToken, qr.token))) {
      return json({ error: "QR Code หมดอายุหรือไม่ถูกต้อง" }, 400);
    }

    // 3. Retrieve Activity & Venue Data
    const activitySnap = await adminDb.ref(`public/activities/${activityId}`).get();
    const activity = activitySnap.val();
    if (!activity || !activity.isPublished || activity.isArchived) {
      return json({ error: "กิจกรรมนี้ยังไม่เปิดให้ร่วมสนุก" }, 400);
    }

    if (activity.completionMethod !== "qr" && activity.pointGrantMode === "manual-only") {
      return json({ error: "กิจกรรมนี้ต้องให้เจ้าหน้าที่ประจำจุดตรวจบันทึก" }, 400);
    }

    // Determine associated location
    const locationId = checkpointLocationId || activity.venueId || activity.locationId || "theater";

    // 4. Fetch Venue Details for display
    const [venueSnap, locSnap] = await Promise.all([
      adminDb.ref(`public/venues/${locationId}`).get(),
      adminDb.ref(`public/locations/${locationId}`).get(),
    ]);
    const venue = venueSnap.val() || locSnap.val() || {};
    const locationName = venue.name || "จุดกิจกรรม";
    const realmTitle = venue.realmTitle || venue.visualLabel || "";

    // 5. Authoritative Point Grant (Atomic, Duplicate-Protected & Venue-Capped)
    const grant = await grantActivityPoints({
      participantId,
      activityId,
      activity,
      source: "activity-qr",
      venueId: locationId,
    });

    // 6. Record Location Visit (Idempotent: does not duplicate if already visited)
    let newlyVisitedLocation = false;
    if (locationId) {
      const visitRef = adminDb.ref(`operations/locationVisits/${participantId}/${locationId}`);
      const visitRes = await visitRef.transaction((current) => {
        if (current) return; // already visited
        return {
          locationId,
          visitedAt: grant.createdAt,
          triggerActivityId: activityId,
        };
      });
      newlyVisitedLocation = Boolean(visitRes.committed);
    }

    // 7. Record Check-in Log if newly committed
    if (grant.committed && grant.transactionId) {
      await Promise.all([
        adminDb.ref(`operations/checkins/${grant.transactionId}`).set({
          participantId,
          activityId,
          locationId,
          pointsAdded: grant.pointsAdded,
          createdAt: grant.createdAt,
          method: "qr",
        }),
        adminDb.ref(`operations/activityCompletions/${grant.transactionId}`).set({
          participantId,
          activityId,
          locationId,
          pointsAdded: grant.pointsAdded,
          createdAt: grant.createdAt,
        }),
      ]);
    }

    const isDuplicate = !grant.committed;

    let responseMessage = "";
    if (isDuplicate) {
      responseMessage = "คุณเคยเช็กอินกิจกรรมนี้แล้ว";
    } else if (grant.venueCapped) {
      responseMessage = `บันทึกการร่วมกิจกรรม ${activity.title} สำเร็จ! (คุณได้รับแต้มจากแดนนี้ครบแล้ว สามารถร่วมกิจกรรมอื่น ๆ ได้อย่างสนุกสนาน)`;
    } else {
      responseMessage = `เช็กอินสำเร็จ! +${grant.pointsAdded} คะแนน${newlyVisitedLocation ? ` และเยี่ยมชม ${locationName} สำเร็จ` : ""}`;
    }

    return json({
      ok: true,
      activityId,
      activityTitle: activity.title || "กิจกรรม OPH",
      locationId,
      locationName,
      realmTitle,
      pointsAdded: grant.pointsAdded,
      pointTotal: grant.pointTotal,
      duplicate: isDuplicate,
      venueCapped: grant.venueCapped,
      newlyVisitedLocation,
      message: responseMessage,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json({ error: "ข้อมูลเช็กอินไม่ถูกต้อง" }, 400);
    }
    return publicError(error);
  }
}
