import { z } from "zod";
import { adminAuth, adminDb, grantActivityPoints, json, publicError, randomToken, readJson, requireStaff, resolveParticipant } from "./_lib/server.js";

const adjustSchema = z.object({
  action: z.literal("adjustPoints"),
  participantId: z.string().min(1),
  points: z.number().int().refine((value) => value !== 0),
  reason: z.string().trim().min(2).max(200),
});

const redeemSchema = z.object({
  action: z.literal("redeemPrize"),
  participantId: z.string().min(1),
  prizeId: z.string().min(1),
});

const qrSchema = z.object({
  action: z.literal("activityQr"),
  activityId: z.string().min(1),
  rotate: z.boolean().optional().default(false),
});

const passLookupSchema = z.object({
  action: z.literal("participantByPass"),
  passToken: z.string().min(20),
});

const completeSchema = z.object({
  action: z.literal("completeActivity"),
  participantId: z.string().min(1),
  activityId: z.string().min(1),
});

const participantDetailSchema = z.object({
  action: z.literal("participantDetail"),
  participantId: z.string().min(1),
});

const entryCheckinSchema = z.object({
  action: z.literal("entryCheckin"),
  participantId: z.string().min(1),
});

const reverseTransactionSchema = z.object({
  action: z.literal("reverseTransaction"),
  participantId: z.string().min(1),
  transactionId: z.string().min(1),
  reason: z.string().trim().min(2).max(200),
});

const contentAuditSchema = z.object({
  action: z.literal("contentAudit"),
  kind: z.enum(["activities", "venues", "prizes", "faq", "announcements", "site", "media"]),
  id: z.string().min(1).max(200),
  operation: z.enum(["save", "delete", "upload"]),
});

const staffSchema = z.object({
  action: z.literal("createStaff"),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "editor", "staff", "viewer"]),
});

const roleSchema = z.object({
  action: z.literal("setRole"),
  uid: z.string().min(1),
  role: z.enum(["admin", "editor", "staff", "viewer"]),
});

const disableSchema = z.object({
  action: z.literal("setStaffDisabled"),
  uid: z.string().min(1),
  disabled: z.boolean(),
});

const approveStaffSchema = z.object({
  action: z.literal("approveStaff"),
  uid: z.string().min(1),
  role: z.enum(["admin", "editor", "staff", "viewer"]),
});

const rejectStaffSchema = z.object({
  action: z.literal("rejectStaff"),
  uid: z.string().min(1),
  reason: z.string().max(200).optional().default(""),
});

const saveRegistrationConfigSchema = z.object({
  action: z.literal("saveRegistrationConfig"),
  academicTracks: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
  })).min(1),
  grades: z.array(z.string().min(1)).min(1),
  consentText: z.string().optional().default(""),
  registrationOpen: z.boolean().optional(),
});

const saveSiteConfigSchema = z.object({
  action: z.literal("saveSiteConfig"),
  name: z.string().trim().min(1).max(120),
  eventYear: z.number().int().min(2026).max(2100).optional().default(2026),
  theme: z.string().trim().min(1).max(160),
  faculty: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1000).optional().default(""),
  dateLabel: z.string().trim().max(120).optional().default(""),
  locationLabel: z.string().trim().max(200).optional().default(""),
  registrationOpen: z.boolean().optional().default(true),
});

async function appendAudit(entry: Record<string, unknown>) {
  const id = adminDb.ref("operations/audit").push().key;
  if (id) await adminDb.ref(`operations/audit/${id}`).set({ ...entry, createdAt: new Date().toISOString() });
}

async function participantRows() {
  const [participantsSnap, accountingSnap] = await Promise.all([
    adminDb.ref("operations/participants").get(),
    adminDb.ref("operations/accounting/participants").get(),
  ]);
  const participants = participantsSnap.val() || {};
  const accounting = accountingSnap.val() || {};

  return Object.entries(participants)
    .map(([id, value]) => {
      const participant = value as Record<string, unknown>;
      return {
        id,
        displayName: participant.displayName || "",
        school: participant.school || "",
        phone: participant.phone || "",
        email: participant.email || "",
        createdAt: participant.createdAt || "",
        pointTotal: Number(accounting[id]?.pointTotal || 0),
      };
    })
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export async function POST(request: Request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const actor = await requireStaff(request);
    const body = await readJson(request);

    if (body.action === "roles") {
      if (actor.role !== "admin") return json({ error: "ไม่มีสิทธิ์จัดการ Staff" }, 403);
      const snap = await adminDb.ref("admin/roles").get();
      const roles = snap.val() || {};
      const rows = await Promise.all(Object.entries(roles).map(async ([uid, value]) => {
        try {
          const user = await adminAuth.getUser(uid);
          return { uid, role: (value as { role?: string }).role || "viewer", email: user.email || "", disabled: user.disabled };
        } catch {
          return { uid, role: (value as { role?: string }).role || "viewer", email: "", disabled: true };
        }
      }));
      return json({ roles: rows });
    }

    if (body.action === "createStaff") {
      if (actor.role !== "admin") return json({ error: "ไม่มีสิทธิ์จัดการ Staff" }, 403);
      const input = staffSchema.parse(body);
      const user = await adminAuth.createUser({
        email: input.email,
        password: input.password,
        emailVerified: false,
      });
      await adminDb.ref(`admin/roles/${user.uid}`).set({ role: input.role });
      await appendAudit({
        type: "staff-create",
        staffId: actor.uid,
        targetUid: user.uid,
        targetEmail: input.email,
        role: input.role,
      });
      return json({ ok: true, uid: user.uid, email: input.email, role: input.role }, 201);
    }

    if (body.action === "setRole") {
      if (actor.role !== "admin") return json({ error: "ไม่มีสิทธิ์จัดการ Staff" }, 403);
      const input = roleSchema.parse(body);
      await adminDb.ref(`admin/roles/${input.uid}`).set({ role: input.role });
      await appendAudit({ type: "staff-role-change", staffId: actor.uid, targetUid: input.uid, role: input.role });
      return json({ ok: true });
    }

    if (body.action === "setStaffDisabled") {
      if (actor.role !== "admin") return json({ error: "ไม่มีสิทธิ์จัดการ Staff" }, 403);
      const input = disableSchema.parse(body);
      if (input.uid === actor.uid && input.disabled) return json({ error: "ปิดบัญชีตัวเองไม่ได้" }, 400);
      await adminAuth.updateUser(input.uid, { disabled: input.disabled });
      await appendAudit({ type: "staff-disabled-change", staffId: actor.uid, targetUid: input.uid, disabled: input.disabled });
      return json({ ok: true });
    }

    if (body.action === "participants") {
      if (actor.role !== "admin" && actor.role !== "staff") return json({ error: "ไม่มีสิทธิ์ดูข้อมูลผู้เข้าร่วม" }, 403);
      return json({ participants: await participantRows() });
    }

    if (body.action === "participantByPass") {
      if (actor.role !== "admin" && actor.role !== "staff") return json({ error: "ไม่มีสิทธิ์ดูข้อมูลผู้เข้าร่วม" }, 403);
      const input = passLookupSchema.parse(body);
      const resolved = await resolveParticipant(input.passToken);
      if (!resolved) return json({ error: "ไม่พบบัตรผู้เข้าร่วม" }, 404);
      const [participantSnap, accountSnap] = await Promise.all([
        adminDb.ref(`operations/participants/${resolved.participantId}`).get(),
        adminDb.ref(`operations/accounting/participants/${resolved.participantId}`).get(),
      ]);
      return json({
        participant: {
          id: resolved.participantId,
          ...(participantSnap.val() || {}),
          pointTotal: Number(accountSnap.val()?.pointTotal || 0),
        },
      });
    }

    if (body.action === "participantDetail") {
      if (actor.role !== "admin" && actor.role !== "staff") return json({ error: "ไม่มีสิทธิ์ดูข้อมูลผู้เข้าร่วม" }, 403);
      const input = participantDetailSchema.parse(body);
      const [participantSnap, accountSnap, entrySnap, completionsSnap] = await Promise.all([
        adminDb.ref(`operations/participants/${input.participantId}`).get(),
        adminDb.ref(`operations/accounting/participants/${input.participantId}`).get(),
        adminDb.ref(`operations/eventCheckins/${input.participantId}`).get(),
        adminDb.ref("operations/activityCompletions").orderByChild("participantId").equalTo(input.participantId).get(),
      ]);
      if (!participantSnap.exists()) return json({ error: "ไม่พบผู้เข้าร่วม" }, 404);

      const account = accountSnap.val() || {};
      const transactions = Object.entries(account.transactions || {})
        .map(([id, value]) => ({ id, ...(value as Record<string, unknown>) }))
        .sort((a, b) => String((b as Record<string, unknown>).createdAt || "").localeCompare(String((a as Record<string, unknown>).createdAt || "")));
      const claims = Object.entries(account.claims || {})
        .map(([id, value]) => ({ id, ...(value as Record<string, unknown>) }))
        .sort((a, b) => String((b as Record<string, unknown>).createdAt || "").localeCompare(String((a as Record<string, unknown>).createdAt || "")));
      const completions = Object.entries(completionsSnap.val() || {})
        .map(([id, value]) => ({ id, ...(value as Record<string, unknown>) }))
        .sort((a, b) => String((b as Record<string, unknown>).createdAt || "").localeCompare(String((a as Record<string, unknown>).createdAt || "")));

      return json({
        participant: { id: input.participantId, ...(participantSnap.val() || {}) },
        pointTotal: Number(account.pointTotal || 0),
        transactions,
        claims,
        completions,
        entryCheckin: entrySnap.val() || null,
      });
    }

    if (body.action === "entryCheckin") {
      if (actor.role !== "admin" && actor.role !== "staff") return json({ error: "ไม่มีสิทธิ์เช็กอินผู้เข้าร่วม" }, 403);
      const input = entryCheckinSchema.parse(body);
      const participantSnap = await adminDb.ref(`operations/participants/${input.participantId}`).get();
      if (!participantSnap.exists()) return json({ error: "ไม่พบผู้เข้าร่วม" }, 404);
      const createdAt = new Date().toISOString();
      const ref = adminDb.ref(`operations/eventCheckins/${input.participantId}`);
      const result = await ref.transaction((current) => {
        if (current) return;
        return { participantId: input.participantId, staffId: actor.uid, createdAt };
      });
      if (result.committed) {
        await appendAudit({ type: "event-checkin", participantId: input.participantId, staffId: actor.uid });
      }
      return json({ ok: true, duplicate: !result.committed, entryCheckin: result.snapshot.val() });
    }

    if (body.action === "completeActivity") {
      if (actor.role !== "admin" && actor.role !== "staff") return json({ error: "ไม่มีสิทธิ์บันทึกกิจกรรม" }, 403);
      const input = completeSchema.parse(body);
      const [activitySnap, participantSnap] = await Promise.all([
        adminDb.ref(`public/activities/${input.activityId}`).get(),
        adminDb.ref(`operations/participants/${input.participantId}`).get(),
      ]);
      const activity = activitySnap.val();
      if (!participantSnap.exists()) return json({ error: "ไม่พบผู้เข้าร่วม" }, 404);
      if (!activity?.isPublished || activity?.isArchived) return json({ error: "กิจกรรมนี้ไม่เปิดใช้งาน" }, 400);

      const grant = await grantActivityPoints({
        participantId: input.participantId,
        activityId: input.activityId,
        activity,
        source: "staff-completion",
        staffId: actor.uid,
        venueId: activity.venueId || activity.locationId,
      });
      if (grant.committed && grant.transactionId) {
        await adminDb.ref(`operations/activityCompletions/${grant.transactionId}`).set({
          participantId: input.participantId,
          activityId: input.activityId,
          staffId: actor.uid,
          pointsAdded: grant.pointsAdded,
          createdAt: grant.createdAt,
        });
        await appendAudit({
          type: "activity-completion",
          participantId: input.participantId,
          activityId: input.activityId,
          pointsAdded: grant.pointsAdded,
          staffId: actor.uid,
        });
      }
      return json({ ok: true, pointsAdded: grant.pointsAdded, pointTotal: grant.pointTotal, duplicate: !grant.committed });
    }

    if (body.action === "adjustPoints") {
      if (actor.role !== "admin" && actor.role !== "staff") return json({ error: "ไม่มีสิทธิ์ปรับแต้ม" }, 403);
      const input = adjustSchema.parse(body);
      const participantSnap = await adminDb.ref(`operations/participants/${input.participantId}`).get();
      if (!participantSnap.exists()) return json({ error: "ไม่พบผู้เข้าร่วม" }, 404);

      const accountRef = adminDb.ref(`operations/accounting/participants/${input.participantId}`);
      const accountSnapshot = await accountRef.get();
      if (!accountSnapshot.exists()) return json({ error: "ไม่พบบัญชีคะแนนผู้เข้าร่วม" }, 404);
      const transactionSeed = accountSnapshot.val();
      const txId = adminDb.ref().push().key || crypto.randomUUID();
      const createdAt = new Date().toISOString();

      const result = await accountRef.transaction((current) => {
        const next = current || structuredClone(transactionSeed);
        next.transactions ||= {};
        const nextTotal = Number(next.pointTotal || 0) + input.points;
        if (nextTotal < 0) return;
        next.pointTotal = nextTotal;
        next.transactions[txId] = {
          points: input.points,
          reason: input.reason,
          source: "staff-adjustment",
          staffId: actor.uid,
          createdAt,
        };
        return next;
      });

      if (!result.committed) return json({ error: "ปรับแต้มไม่ได้ ตรวจสอบยอดแต้มผู้เข้าร่วม" }, 409);
      await appendAudit({
        type: "point-adjustment",
        participantId: input.participantId,
        points: input.points,
        reason: input.reason,
        staffId: actor.uid,
      });
      return json({ ok: true, pointTotal: Number(result.snapshot.val()?.pointTotal || 0) });
    }

    if (body.action === "reverseTransaction") {
      if (actor.role !== "admin") return json({ error: "เฉพาะ Admin เท่านั้นที่ย้อนรายการคะแนนได้" }, 403);
      const input = reverseTransactionSchema.parse(body);
      const accountRef = adminDb.ref(`operations/accounting/participants/${input.participantId}`);
      const accountSnapshot = await accountRef.get();
      if (!accountSnapshot.exists()) return json({ error: "ไม่พบบัญชีคะแนนผู้เข้าร่วม" }, 404);
      const transactionSeed = accountSnapshot.val();
      const reversalId = adminDb.ref().push().key || crypto.randomUUID();
      const reversedAt = new Date().toISOString();

      const result = await accountRef.transaction((current) => {
        const next = current || structuredClone(transactionSeed);
        next.transactions ||= {};
        next.grantCounts ||= {};
        const original = next.transactions[input.transactionId];
        if (!original || original.reversedAt) return;
        if (original.source === "prize-redemption" || original.source === "prize-refund" || original.source === "reversal") return;

        const reversalPoints = -Number(original.points || 0);
        const nextTotal = Number(next.pointTotal || 0) + reversalPoints;
        if (nextTotal < 0) return;

        original.reversedAt = reversedAt;
        original.reversedBy = actor.uid;
        original.reversalReason = input.reason;

        if (original.grantKey && Number(next.grantCounts[original.grantKey] || 0) > 0) {
          next.grantCounts[original.grantKey] = Number(next.grantCounts[original.grantKey]) - 1;
        }

        next.pointTotal = nextTotal;
        next.transactions[reversalId] = {
          points: reversalPoints,
          reason: `ย้อนรายการ: ${original.reason || input.transactionId}`,
          source: "reversal",
          reversedTransactionId: input.transactionId,
          staffId: actor.uid,
          createdAt: reversedAt,
        };
        return next;
      });

      if (!result.committed) return json({ error: "ย้อนรายการนี้ไม่ได้ หรือรายการถูกย้อนแล้ว" }, 409);
      await appendAudit({
        type: "point-reversal",
        participantId: input.participantId,
        transactionId: input.transactionId,
        reason: input.reason,
        staffId: actor.uid,
      });
      return json({ ok: true, pointTotal: Number(result.snapshot.val()?.pointTotal || 0), reversalId });
    }

    if (body.action === "contentAudit") {
      if (actor.role !== "admin" && actor.role !== "editor") return json({ error: "ไม่มีสิทธิ์บันทึก Audit เนื้อหา" }, 403);
      const input = contentAuditSchema.parse(body);
      await appendAudit({
        type: `content-${input.operation}`,
        contentKind: input.kind,
        contentId: input.id,
        staffId: actor.uid,
      });
      return json({ ok: true });
    }

    if (body.action === "activityQr") {
      const input = qrSchema.parse(body);
      if (input.rotate && actor.role !== "admin" && actor.role !== "editor") {
        return json({ error: "ไม่มีสิทธิ์เปลี่ยน QR Code" }, 403);
      }
      const activitySnap = await adminDb.ref(`public/activities/${input.activityId}`).get();
      if (!activitySnap.exists()) return json({ error: "ไม่พบกิจกรรม" }, 404);

      const ref = adminDb.ref(`admin/activityQr/${input.activityId}`);
      let config = (await ref.get()).val();
      if (!config?.token || input.rotate) {
        config = { token: randomToken(24), updatedAt: new Date().toISOString(), updatedBy: actor.uid };
        await ref.set(config);
        await appendAudit({ type: "activity-qr-rotate", activityId: input.activityId, staffId: actor.uid });
      }

      return json({ qrPayload: `FATU26:${input.activityId}:${config.token}`, updatedAt: config.updatedAt });
    }

    if (body.action === "redeemPrize") {
      if (actor.role !== "admin" && actor.role !== "staff") return json({ error: "ไม่มีสิทธิ์แลกรางวัล" }, 403);
      const input = redeemSchema.parse(body);
      const [prizeSnap, participantSnap] = await Promise.all([
        adminDb.ref(`public/prizes/${input.prizeId}`).get(),
        adminDb.ref(`operations/participants/${input.participantId}`).get(),
      ]);
      const prize = prizeSnap.val();
      if (!participantSnap.exists()) return json({ error: "ไม่พบผู้เข้าร่วม" }, 404);
      if (!prize?.isPublished) return json({ error: "ของรางวัลนี้ยังไม่เปิดแลก" }, 400);

      const pointsRequired = Math.max(0, Number(prize.pointsRequired || 0));
      const claimLimit = Math.max(1, Number(prize.claimLimit || 1));
      const participantRef = adminDb.ref(`operations/accounting/participants/${input.participantId}`);
      const participantAccountSnapshot = await participantRef.get();
      if (!participantAccountSnapshot.exists()) return json({ error: "ไม่พบบัญชีคะแนนผู้เข้าร่วม" }, 404);
      const participantSeed = participantAccountSnapshot.val();
      const claimId = adminDb.ref().push().key || crypto.randomUUID();
      const debitTxId = adminDb.ref().push().key || crypto.randomUUID();
      const createdAt = new Date().toISOString();

      const debit = await participantRef.transaction((current) => {
        const next = current || structuredClone(participantSeed);
        if (Number(next.pointTotal || 0) < pointsRequired) return;
        next.transactions ||= {};
        next.claims ||= {};
        const used = Object.values(next.claims).filter(
          (claim) => (claim as { prizeId?: string; status?: string }).prizeId === input.prizeId &&
            (claim as { status?: string }).status !== "cancelled",
        ).length;
        if (used >= claimLimit) return;

        next.pointTotal = Number(next.pointTotal || 0) - pointsRequired;
        next.transactions[debitTxId] = {
          points: -pointsRequired,
          reason: `แลกรางวัล ${prize.name}`,
          source: "prize-redemption",
          prizeId: input.prizeId,
          staffId: actor.uid,
          createdAt,
        };
        next.claims[claimId] = {
          prizeId: input.prizeId,
          pointsSpent: pointsRequired,
          status: "pending",
          staffId: actor.uid,
          createdAt,
        };
        return next;
      });

      if (!debit.committed) return json({ error: "แต้มไม่พอหรือเกินจำนวนครั้งที่แลกได้" }, 409);

      const stockRef = adminDb.ref(`operations/prizeRuntime/${input.prizeId}`);
      const stockResult = await stockRef.transaction((current) => {
        const configuredStock = Math.max(0, Number(prize.stock || 0));
        const migratedClaimed = current
          ? Math.max(
              0,
              Number(
                current.claimedCount ??
                  Math.max(
                    0,
                    Number(current.configuredStock || 0) -
                      Number(current.stockRemaining || 0),
                  ),
              ),
            )
          : 0;
        const available = configuredStock - migratedClaimed;
        if (available <= 0) return;
        return {
          configuredStock,
          claimedCount: migratedClaimed + 1,
          stockRemaining: available - 1,
          updatedAt: createdAt,
        };
      });

      if (!stockResult.committed) {
        const refundId = adminDb.ref().push().key || crypto.randomUUID();
        await participantRef.transaction((current) => {
          if (!current) return current;
          current.transactions ||= {};
          current.claims ||= {};
          current.pointTotal = Number(current.pointTotal || 0) + pointsRequired;
          current.transactions[refundId] = {
            points: pointsRequired,
            reason: `คืนแต้ม: ${prize.name} หมด`,
            source: "prize-refund",
            prizeId: input.prizeId,
            staffId: actor.uid,
            createdAt: new Date().toISOString(),
          };
          if (current.claims[claimId]) current.claims[claimId].status = "cancelled";
          return current;
        });
        return json({ error: "ของรางวัลหมด" }, 409);
      }

      await participantRef.child(`claims/${claimId}/status`).set("completed");
      await adminDb.ref(`operations/prizeClaims/${claimId}`).set({
        participantId: input.participantId,
        prizeId: input.prizeId,
        prizeName: prize.name,
        pointsSpent: pointsRequired,
        staffId: actor.uid,
        createdAt,
      });
      await appendAudit({
        type: "prize-redemption",
        participantId: input.participantId,
        prizeId: input.prizeId,
        pointsSpent: pointsRequired,
        staffId: actor.uid,
      });

      const accountSnap = await participantRef.get();
      return json({
        ok: true,
        claimId,
        pointTotal: Number(accountSnap.val()?.pointTotal || 0),
        stockRemaining: Number(stockResult.snapshot.val()?.stockRemaining || 0),
      });
    }

    if (body.action === "staffApplications") {
      if (actor.role !== "admin") return json({ error: "ไม่มีสิทธิ์จัดการ Staff" }, 403);
      const snap = await adminDb.ref("operations/staffApplications").get();
      const raw = snap.val() || {};
      const applications = Object.entries(raw).map(([uid, val]) => {
        const application = val as Record<string, unknown>;
        return {
          uid,
          ...application,
          status: application.status === "pending" ? "staff_pending" : application.status,
        };
      }).sort((a, b) => String((b as Record<string, unknown>).appliedAt || "").localeCompare(String((a as Record<string, unknown>).appliedAt || "")));
      return json({ applications });
    }

    if (body.action === "approveStaff") {
      if (actor.role !== "admin") return json({ error: "ไม่มีสิทธิ์จัดการ Staff" }, 403);
      const input = approveStaffSchema.parse(body);
      const approvedAt = new Date().toISOString();

      const appSnap = await adminDb.ref(`operations/staffApplications/${input.uid}`).get();
      const app = appSnap.val() || {};

      await adminDb.ref().update({
        [`admin/roles/${input.uid}`]: {
          role: input.role,
          approvedBy: actor.uid,
          approvedAt,
        },
        [`operations/staffApplications/${input.uid}/status`]: "approved",
        [`operations/staffApplications/${input.uid}/approvedAt`]: approvedAt,
        [`operations/staffApplications/${input.uid}/approvedBy`]: actor.uid,
        [`operations/staffApplications/${input.uid}/role`]: input.role,
      });

      if (app.username) {
        await adminDb.ref(`operations/usernames/${app.username}/role`).set(input.role);
      }

      await adminAuth.setCustomUserClaims(input.uid, { role: input.role });
      await appendAudit({
        type: "staff-approval",
        staffId: actor.uid,
        targetUid: input.uid,
        role: input.role,
      });

      return json({ ok: true });
    }

    if (body.action === "rejectStaff") {
      if (actor.role !== "admin") return json({ error: "ไม่มีสิทธิ์จัดการ Staff" }, 403);
      const input = rejectStaffSchema.parse(body);
      const rejectedAt = new Date().toISOString();

      await adminDb.ref().update({
        [`admin/roles/${input.uid}`]: {
          role: "rejected",
          rejectedBy: actor.uid,
          rejectedAt,
          reason: input.reason,
        },
        [`operations/staffApplications/${input.uid}/status`]: "rejected",
        [`operations/staffApplications/${input.uid}/rejectedAt`]: rejectedAt,
        [`operations/staffApplications/${input.uid}/rejectedBy`]: actor.uid,
        [`operations/staffApplications/${input.uid}/rejectionReason`]: input.reason,
      });

      await adminAuth.setCustomUserClaims(input.uid, { role: "rejected" });
      await appendAudit({
        type: "staff-rejection",
        staffId: actor.uid,
        targetUid: input.uid,
        reason: input.reason,
      });

      return json({ ok: true });
    }

    if (body.action === "saveRegistrationConfig") {
      if (actor.role !== "admin" && actor.role !== "editor") return json({ error: "ไม่มีสิทธิ์ตั้งค่าแบบฟอร์ม" }, 403);
      const input = saveRegistrationConfigSchema.parse(body);
      const { action: _action, ...configData } = input;
      await adminDb.ref("public/registrationConfig").set(configData);
      await appendAudit({ type: "config-registration-save", staffId: actor.uid });
      return json({ ok: true });
    }

    if (body.action === "saveSiteConfig") {
      if (actor.role !== "admin" && actor.role !== "editor") return json({ error: "ไม่มีสิทธิ์ตั้งค่าเว็บไซต์" }, 403);
      const input = saveSiteConfigSchema.parse(body);
      const { action: _action, ...siteData } = input;
      await adminDb.ref("public/site").update(siteData);
      await appendAudit({ type: "config-site-save", staffId: actor.uid });
      return json({ ok: true });
    }

    if (body.action === "audit") {
      if (actor.role !== "admin") return json({ error: "ไม่มีสิทธิ์ดู Audit" }, 403);
      const snap = await adminDb.ref("operations/audit").limitToLast(200).get();
      const entries = Object.entries(snap.val() || {})
        .map(([id, value]) => ({ id, ...(value as Record<string, unknown>) }))
        .sort((a, b) => String((b as Record<string, unknown>).createdAt || "").localeCompare(String((a as Record<string, unknown>).createdAt || "")));
      return json({ entries });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    if (error instanceof z.ZodError) return json({ error: "ข้อมูลไม่ถูกต้อง" }, 400);
    return publicError(error);
  }
}
