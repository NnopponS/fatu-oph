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

const DEFAULT_LUCKY_PRIZES = [
  {
    id: "lucky_arttoy",
    name: "Art Toy มังกรฟ้า FATU Limited Edition",
    rarity: "legendary",
    rarityLabel: "ระดับตำนาน (ทอง)",
    description: "ฟิกเกอร์มังกรฟ้าสุดพิเศษ ผลิตจำนวนจำกัดสำหรับงาน Open House 2026",
    weight: 10,
    image: "/assets/mythology/azure-dragon.svg",
  },
  {
    id: "lucky_totebag",
    name: "กระเป๋าผ้าแคนวาส ลายสัตว์เทพ 4 ทิศ",
    rarity: "epic",
    rarityLabel: "ระดับมหากาพย์ (ม่วง)",
    description: "กระเป๋าผ้าเนื้อหนา พิมพ์ลายสีทองพรีเมียม สไตล์จีนร่วมสมัย",
    weight: 25,
    image: "/assets/decorations/dragon-seal.svg",
  },
  {
    id: "lucky_keychain",
    name: "พวงกุญแจอะคริลิก สัตว์เทพพิทักษ์",
    rarity: "rare",
    rarityLabel: "ระดับหายาก (ฟ้า)",
    description: "พวงกุญแจอะคริลิกสองด้าน ลายมาสคอตสัตว์เทพประจำแดนศิลปกรรม",
    weight: 35,
    image: "/assets/animations/reward-chest.svg",
  },
  {
    id: "lucky_stickers",
    name: "เซ็ตสติกเกอร์โฮโลแกรม ตะลุยแดนมังกร",
    rarity: "common",
    rarityLabel: "ระดับทั่วไป (เขียว)",
    description: "สติกเกอร์ไดคัทเคลือบโฮโลแกรมกันน้ำ ลวดลายมังกรและตราประทับมงคล",
    weight: 30,
    image: "/assets/decorations/chinese-cloud.svg",
  },
];

const drawSchema = z.object({
  action: z.literal("draw"),
});

const statusSchema = z.object({
  action: z.literal("status"),
});

const redeemSchema = z.object({
  action: z.literal("redeem-voucher"),
  voucherCode: z.string().trim().min(3),
});

export async function POST(request: Request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await readJson(request);

    // 1. Status Check
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
      const [accountSnap, visitsSnap, luckySnap] = await Promise.all([
        adminDb.ref(`operations/accounting/participants/${uid}`).get(),
        adminDb.ref(`operations/locationVisits/${uid}`).get(),
        adminDb.ref(`operations/luckyDraws/${uid}`).get(),
      ]);

      const account = accountSnap.val() || {};
      const visits = visitsSnap.val() || {};
      const transactions = Object.values(account.transactions || {}) as Array<{ activityId?: string }>;
      const completedActivityIds = new Set(transactions.map((t) => t.activityId).filter(Boolean));

      const hasActivity = completedActivityIds.size >= 1;
      const visitedVenuesCount = Object.keys(visits).length;
      const hasVenue = visitedVenuesCount >= 1;
      const eligible = hasActivity && hasVenue;
      const hasDrawn = luckySnap.exists();
      const drawRecord = luckySnap.val() || null;

      let voucher = null;
      if (drawRecord?.voucherId) {
        const vSnap = await adminDb.ref(`operations/luckyVouchers/${drawRecord.voucherId}`).get();
        voucher = vSnap.val() || null;
      }

      const prize = hasDrawn ? {
        id: String(voucher?.prizeId || drawRecord?.prizeId || ""),
        title: String(voucher?.prizeName || drawRecord?.prizeName || ""),
        description: voucher?.description || "",
        tier: String(voucher?.rarity || drawRecord?.rarity || ""),
        claimedAt: drawRecord?.drawnAt || voucher?.createdAt || "",
        voucherCode: String(voucher?.voucherCode || drawRecord?.voucherCode || ""),
        redeemed: voucher?.status === "claimed",
        redeemedAt: voucher?.claimedAt || "",
      } : null;

      return json({
        ok: true,
        status: {
          eligible,
          claimed: hasDrawn,
          prize,
          conditions: {
            hasVisitedVenue: hasVenue,
            hasCompletedActivity: hasActivity,
            visitedVenuesCount,
            completedActivitiesCount: completedActivityIds.size,
          },
          catalogCount: DEFAULT_LUCKY_PRIZES.length,
        },
      });
    }

    // 2. Perform 1-Time Lucky Draw
    if (body.action === "draw") {
      await enforceRateLimit(request, "lucky-draw", 5, 60_000);
      drawSchema.parse(body);
      const token = bearerToken(request);
      if (!token) return json({ error: "กรุณาเข้าสู่ระบบ" }, 401);

      let decoded;
      try {
        decoded = await adminAuth.verifyIdToken(token);
      } catch {
        return json({ error: "เซสชันหมดอายุ" }, 401);
      }

      const uid = decoded.uid;

      // Check eligibility and one-time limit
      const [participantSnap, accountSnap, visitsSnap, existingSnap] = await Promise.all([
        adminDb.ref(`operations/participants/${uid}`).get(),
        adminDb.ref(`operations/accounting/participants/${uid}`).get(),
        adminDb.ref(`operations/locationVisits/${uid}`).get(),
        adminDb.ref(`operations/luckyDraws/${uid}`).get(),
      ]);

      if (existingSnap.exists()) {
        return json({ error: "คุณได้รับสิทธิ์สุ่มกล่องสมบัติครบแล้ว (จำกัด 1 ครั้ง/คน)" }, 400);
      }

      const account = accountSnap.val() || {};
      const visits = visitsSnap.val() || {};
      const transactions = Object.values(account.transactions || {});

      const hasActivity = transactions.some((t) => (t as { activityId?: string }).activityId);
      const hasVenue = Object.keys(visits).length >= 1;

      if (!hasActivity || !hasVenue) {
        return json({
          error: "กรุณาเข้าร่วมกิจกรรมอย่างน้อย 1 กิจกรรมและ 1 สถานที่เพื่อปลดล็อกกล่องสุ่มสมบัติ",
        }, 400);
      }

      const participant = participantSnap.val() || {};

      // Select prize based on random weight
      const totalWeight = DEFAULT_LUCKY_PRIZES.reduce((acc, p) => acc + p.weight, 0);
      let rand = Math.random() * totalWeight;
      let selectedPrize = DEFAULT_LUCKY_PRIZES[DEFAULT_LUCKY_PRIZES.length - 1];
      for (const p of DEFAULT_LUCKY_PRIZES) {
        if (rand < p.weight) {
          selectedPrize = p;
          break;
        }
        rand -= p.weight;
      }

      const voucherId = "LKY-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      const voucherCode = `FATU26LUCKY:${voucherId}`;
      const drawnAt = new Date().toISOString();

      const voucherData = {
        voucherId,
        voucherCode,
        uid,
        username: participant.username || decoded.name || uid.slice(0, 8),
        displayName: participant.displayName || decoded.name || "จอมยุทธ์",
        prizeId: selectedPrize.id,
        prizeName: selectedPrize.name,
        rarity: selectedPrize.rarity,
        rarityLabel: selectedPrize.rarityLabel,
        description: selectedPrize.description,
        status: "pending",
        createdAt: drawnAt,
      };

      const drawRecord = {
        voucherId,
        voucherCode,
        prizeId: selectedPrize.id,
        prizeName: selectedPrize.name,
        rarity: selectedPrize.rarity,
        drawnAt,
      };

      // Atomic write to prevent race conditions
      const drawRef = adminDb.ref(`operations/luckyDraws/${uid}`);
      const tx = await drawRef.transaction((current) => {
        if (current) return; // already drawn
        return drawRecord;
      });

      if (!tx.committed) {
        return json({ error: "คุณได้รับสิทธิ์สุ่มไปแล้ว" }, 409);
      }

      // Save voucher in vouchers index
      await adminDb.ref(`operations/luckyVouchers/${voucherId}`).set(voucherData);

      await appendAudit({
        type: "lucky-draw-win",
        participantId: uid,
        prizeId: selectedPrize.id,
        prizeName: selectedPrize.name,
        voucherId,
      });

      return json({
        ok: true,
        prize: selectedPrize,
        voucher: voucherData,
      });
    }

    // 3. Staff / Admin Redeem Voucher
    if (body.action === "redeem-voucher") {
      const actor = await requireActor(request);
      if (actor.role !== "admin" && actor.role !== "staff" && actor.role !== "editor") {
        return json({ error: "ไม่มีสิทธิ์ดำเนินการแจกรางวัล" }, 403);
      }

      const input = redeemSchema.parse(body);
      const cleanCode = input.voucherCode.replace(/^FATU26LUCKY:/i, "").trim().toUpperCase();

      const vRef = adminDb.ref(`operations/luckyVouchers/${cleanCode}`);
      const vSnap = await vRef.get();
      if (!vSnap.exists()) {
        return json({ error: "ไม่พบรหัสบัตรรับรางวัลนี้ในระบบ" }, 404);
      }

      const voucher = vSnap.val();
      if (voucher.status === "claimed") {
        return json({
          error: `บัตรรางวัลนี้ถูกใช้งานไปแล้วเมื่อ ${new Date(voucher.claimedAt).toLocaleString("th-TH")}`,
          voucher,
        }, 400);
      }

      const claimedAt = new Date().toISOString();
      await vRef.update({
        status: "claimed",
        claimedAt,
        dispensedBy: actor.uid,
      });

      await appendAudit({
        type: "lucky-voucher-claimed",
        staffId: actor.uid,
        voucherId: cleanCode,
        participantUid: voucher.uid,
      });

      return json({
        ok: true,
        message: `จ่ายของรางวัล ${voucher.prizeName} ให้คุณ ${voucher.displayName} สำเร็จ!`,
        voucher: { ...voucher, status: "claimed", claimedAt, dispensedBy: actor.uid },
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
