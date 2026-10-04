import crypto from "node:crypto";
import { z } from "zod";
import { adminAuth, adminDb, appendAudit, bearerToken, enforceRateLimit, json, publicError, readJson, requireActor } from "./_lib/server.js";
import { loadRewardPolicy } from "./_lib/rewards.js";
import { rewardProgress } from "../src/lib/reward-policy.js";

interface DrawPrize { id: string; name: string; description: string; rarity: string; weight: number; stock: number; imageMediaId: string }
interface DrawReceipt { draw: Record<string, string>; voucher: Record<string, string>; prize: DrawPrize }
interface PrizeRuntime { claimedCount?: number; configuredStock?: number; stockRemaining?: number }

function usedStock(runtime?: PrizeRuntime) {
  return Math.max(0, Number(runtime?.claimedCount ?? (Number(runtime?.configuredStock || 0) - Number(runtime?.stockRemaining || 0))));
}

async function catalog() {
  const [prizesSnap, runtimeSnap] = await Promise.all([adminDb.ref("public/prizes").get(), adminDb.ref("operations/prizeRuntime").get()]);
  const runtime = runtimeSnap.val() || {};
  const prizes = Object.entries(prizesSnap.val() || {}).flatMap(([id, value]) => {
    const p = value as Record<string, unknown>;
    const weight = Number(p.drawWeight ?? 1);
    if (!p.isPublished || !Number.isFinite(weight) || weight <= 0) return [];
    return [{ id, name: String(p.name || "ของรางวัล"), description: String(p.description || ""), rarity: String(p.rarity || "common"), weight, stock: Math.max(0, Number(p.stock || 0)), imageMediaId: String(p.imageMediaId || "") }];
  });
  return { prizes, runtime, available: prizes.map(p => ({ ...p, stockRemaining: Math.max(0, p.stock - usedStock(runtime[p.id])) })) };
}

// The stock reservation and the participant's single draw are committed together.
// Derived voucher indexes can be recovered after a lost network response.
async function restoreReceipt(uid: string, receipt: DrawReceipt) {
  const voucherRef = adminDb.ref(`operations/luckyVouchers/${receipt.voucher.voucherId}`);
  await voucherRef.transaction(current => current ? undefined : receipt.voucher);
  await adminDb.ref(`operations/luckyDraws/${uid}`).transaction(current => current ? undefined : receipt.draw);
}

const voucherInput = z.object({ voucherCode: z.string().trim().min(3).max(160).regex(/^(?:FATU26LUCKY:)?[A-Z0-9-]+$/i) });
function voucherId(code: string) {
  const id = code.replace(/^FATU26LUCKY:/i, "").trim().toUpperCase();
  if (!/^[A-Z0-9-]+$/.test(id)) throw new Error("รหัสบัตรรับรางวัลไม่ถูกต้อง");
  return id;
}

export async function POST(request: Request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const body = await readJson(request);
    if (body.action === "catalog") {
      const pool = await catalog();
      return json({ prizes: pool.available.map(({ weight: _weight, stock: _stock, ...prize }) => prize) });
    }

    if (body.action === "peek-voucher" || body.action === "redeem-voucher") {
      const actor = await requireActor(request);
      if (actor.role !== "admin" && actor.role !== "staff") return json({ error: "ไม่มีสิทธิ์จ่ายของรางวัล" }, 403);
      const id = voucherId(voucherInput.parse(body).voucherCode);
      const ref = adminDb.ref(`operations/luckyVouchers/${id}`);
      const snap = await ref.get();
      if (!snap.exists()) return json({ error: "ไม่พบบัตรรับรางวัล กรุณาตรวจรหัสอีกครั้ง" }, 404);
      const voucher = snap.val();
      const preview = (v: typeof voucher) => ({ voucherCode: v.voucherCode, displayName: v.displayName, username: v.username, prizeName: v.prizeName, status: v.status, claimedAt: v.claimedAt || "" });
      if (body.action === "peek-voucher") return json({ ok: true, voucher: preview(voucher) });
      const claimedAt = new Date().toISOString();
      const claim = await ref.transaction(current => {
        // Firebase may invoke the first callback with an empty local cache.
        // A conflict retries against server state, including another staff's claim.
        const next = current || voucher;
        if (next.status !== "pending") return;
        return { ...next, status: "claimed", claimedAt, dispensedBy: actor.uid };
      });
      if (!claim.committed) return json({ error: "บัตรนี้รับของรางวัลแล้ว กรุณาอย่าจ่ายซ้ำ", voucher: preview(claim.snapshot.val() || voucher) }, 409);
      await appendAudit({ type: "lucky-voucher-claimed", staffId: actor.uid, voucherId: id, participantUid: voucher.uid });
      return json({ ok: true, message: `จ่าย ${voucher.prizeName} ให้คุณ ${voucher.displayName} สำเร็จ`, voucher: preview(claim.snapshot.val()) });
    }

    if (body.action !== "status" && body.action !== "draw") return json({ error: "Unknown action" }, 400);
    const token = bearerToken(request);
    if (!token) return json({ error: "กรุณาเข้าสู่ระบบ" }, 401);
    let decoded;
    try { decoded = await adminAuth.verifyIdToken(token); }
    catch { return json({ error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง" }, 401); }
    const uid = decoded.uid;
    const [participantSnap, accountSnap, visitsSnap, drawSnap, receiptSnap, rules, pool] = await Promise.all([
      adminDb.ref(`operations/participants/${uid}`).get(),
      adminDb.ref(`operations/accounting/participants/${uid}`).get(),
      adminDb.ref(`operations/locationVisits/${uid}`).get(),
      adminDb.ref(`operations/luckyDraws/${uid}`).get(),
      adminDb.ref(`operations/prizeRuntime/__luckyDraws/${uid}`).get(),
      loadRewardPolicy(), catalog(),
    ]);
    if (!participantSnap.exists()) return json({ error: "บัญชีนี้ไม่ใช่ผู้เข้าร่วมงาน" }, 403);
    const receipt = receiptSnap.val() as DrawReceipt | null;
    if (receipt && !drawSnap.exists()) await restoreReceipt(uid, receipt);
    const draw = drawSnap.val() || receipt?.draw || null;
    const account = accountSnap.val() || {};
    const progress = rewardProgress(Number(account.pointTotal || 0), rules);

    if (body.action === "status") {
      if (receipt) await restoreReceipt(uid, receipt);
      const voucher = draw?.voucherId ? (await adminDb.ref(`operations/luckyVouchers/${draw.voucherId}`).get()).val() || receipt?.voucher : null;
      const completed = new Set(Object.values(account.transactions || {}).map(t => (t as { activityId?: string }).activityId).filter(Boolean));
      return json({ ok: true, status: {
        eligible: progress.eligible, claimed: Boolean(draw),
        prize: draw ? { id: voucher?.prizeId || draw.prizeId, title: voucher?.prizeName || draw.prizeName, description: voucher?.description || "", tier: voucher?.rarity || draw.rarity, claimedAt: draw.drawnAt, voucherCode: voucher?.voucherCode || draw.voucherCode, redeemed: voucher?.status === "claimed", redeemedAt: voucher?.claimedAt || "" } : null,
        progress, rules,
        conditions: { visitedVenuesCount: Object.keys(visitsSnap.val() || {}).length, completedActivitiesCount: completed.size },
        catalogCount: pool.available.filter(p => p.stockRemaining > 0).length,
      } });
    }

    await enforceRateLimit(request, "lucky-draw", 5, 60_000);
    if (draw) return json({ error: "คุณใช้สิทธิ์สุ่มแล้ว เปิดบัตรรางวัลเดิมได้ทุกเมื่อ" }, 409);
    if (!progress.eligible) return json({ error: `สะสมอีก ${progress.remaining} แต้มให้ครบ ${rules.pointsRequired} แต้มเพื่อเปิดหีบ` }, 400);
    const participant = participantSnap.val();
    const id = `LKY-${crypto.randomUUID().toUpperCase()}`;
    const code = `FATU26LUCKY:${id}`;
    const drawnAt = new Date().toISOString();
    const fraction = crypto.randomInt(0, 0x100000000) / 0x100000000;
    const stockRef = adminDb.ref("operations/prizeRuntime");
    let duplicate = false;
    const result = await stockRef.transaction(current => {
      const next = current || structuredClone(pool.runtime);
      next.__luckyDraws ||= {};
      duplicate = Boolean(next.__luckyDraws[uid]);
      if (duplicate) return;
      const candidates = pool.prizes.filter(p => p.stock - usedStock(next[p.id]) > 0);
      const totalWeight = candidates.reduce((sum, p) => sum + p.weight, 0);
      if (!candidates.length || !Number.isFinite(totalWeight)) return;
      let roll = fraction * totalWeight;
      const prize = candidates.find(p => { roll -= p.weight; return roll < 0; }) || candidates[candidates.length - 1];
      const used = usedStock(next[prize.id]) + 1;
      next[prize.id] = { ...next[prize.id], configuredStock: prize.stock, claimedCount: used, stockRemaining: prize.stock - used, updatedAt: drawnAt };
      const voucher = { voucherId: id, voucherCode: code, uid, username: participant.username || "", displayName: participant.displayName || "ผู้ร่วมงาน", prizeId: prize.id, prizeName: prize.name, rarity: prize.rarity, description: prize.description, status: "pending", createdAt: drawnAt };
      const record = { voucherId: id, voucherCode: code, prizeId: prize.id, prizeName: prize.name, rarity: prize.rarity, drawnAt };
      next.__luckyDraws[uid] = { draw: record, voucher, prize };
      return next;
    });
    if (!result.committed) return json({ error: duplicate ? "คุณใช้สิทธิ์สุ่มไปแล้ว กรุณาดูบัตรรางวัลเดิม" : "รางวัลหมดชั่วคราว คะแนนและสิทธิ์ของคุณยังอยู่" }, 409);
    const winner = result.snapshot.val().__luckyDraws[uid] as DrawReceipt;
    await restoreReceipt(uid, winner);
    await appendAudit({ type: "lucky-draw-win", participantId: uid, prizeId: winner.prize.id, voucherId: id });
    return json({ ok: true, prize: winner.prize, voucher: winner.voucher });
  } catch (error) {
    if (error instanceof z.ZodError) return json({ error: "ข้อมูลไม่ถูกต้อง" }, 400);
    return publicError(error);
  }
}
