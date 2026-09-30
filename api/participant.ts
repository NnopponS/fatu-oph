import { z } from "zod";
import { adminDb, enforceRateLimit, json, publicError, randomToken, readJson, resolveParticipant, sha256 } from "./_lib/server.js";

const registerSchema = z.object({
  action: z.literal("register"),
  displayName: z.string().trim().min(2).max(100),
  school: z.string().trim().max(160).optional().default(""),
  phone: z.string().trim().max(30).optional().default(""),
  email: z.string().trim().email().or(z.literal("")).optional().default(""),
});

const meSchema = z.object({
  action: z.literal("me"),
  passToken: z.string().min(20),
});

export async function POST(request: Request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await readJson(request);

    if (body.action === "register") {
      await enforceRateLimit(request, "register", 10);
      const input = registerSchema.parse(body);
      const participantId = adminDb.ref("operations/participants").push().key;
      if (!participantId) throw new Error("PARTICIPANT_ID_FAILED");

      const passToken = randomToken(32);
      const passHash = sha256(passToken);
      const createdAt = new Date().toISOString();
      const participant = {
        id: participantId,
        displayName: input.displayName,
        school: input.school,
        phone: input.phone,
        email: input.email,
        createdAt,
        status: "active",
      };

      await adminDb.ref().update({
        [`operations/participants/${participantId}`]: participant,
        [`operations/passIndex/${passHash}`]: { participantId, createdAt },
        [`operations/accounting/participants/${participantId}`]: {
          pointTotal: 0,
          grantCounts: {},
          transactions: {},
          claims: {},
        },
      });

      return json({ participantId, passToken, displayName: input.displayName }, 201);
    }

    if (body.action === "me") {
      const input = meSchema.parse(body);
      const resolved = await resolveParticipant(input.passToken);
      if (!resolved) return json({ error: "ไม่พบบัตรผู้เข้าร่วม" }, 404);

      const [participantSnap, accountSnap, prizesSnap] = await Promise.all([
        adminDb.ref(`operations/participants/${resolved.participantId}`).get(),
        adminDb.ref(`operations/accounting/participants/${resolved.participantId}`).get(),
        adminDb.ref("public/prizes").get(),
      ]);

      const participant = participantSnap.val();
      if (!participant) return json({ error: "ไม่พบผู้เข้าร่วม" }, 404);

      const account = accountSnap.val() || {};
      const prizes = prizesSnap.val() || {};
      const transactions = Object.entries(account.transactions || {})
        .map(([id, value]) => ({ id, ...(value as Record<string, unknown>) }))
        .sort((a, b) => String((b as Record<string, unknown>).createdAt || "").localeCompare(String((a as Record<string, unknown>).createdAt || "")));
      const claims = Object.entries(account.claims || {})
        .filter(([, value]) => (value as { status?: string }).status !== "cancelled")
        .map(([id, value]) => {
          const claim = value as Record<string, unknown>;
          const prize = prizes[String(claim.prizeId)] || {};
          return { id, ...claim, prizeName: prize.name || "ของรางวัล" };
        })
        .sort((a, b) => String((b as Record<string, unknown>).createdAt || "").localeCompare(String((a as Record<string, unknown>).createdAt || "")));

      return json({
        participant: {
          id: participant.id,
          displayName: participant.displayName,
          school: participant.school || "",
          phone: participant.phone || "",
          email: participant.email || "",
          createdAt: participant.createdAt,
        },
        pointTotal: Number(account.pointTotal || 0),
        transactions,
        claims,
      });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    if (error instanceof z.ZodError) return json({ error: "ข้อมูลลงทะเบียนไม่ครบหรือไม่ถูกต้อง" }, 400);
    return publicError(error);
  }
}
