import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Gift,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  QrCode,
  X,
  ChevronRight,
  Flame,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMedia, usePrizes, resolveMediaUrl } from "@/data/content";

// Rarity styles and metadata
const RARITY_MAP: Record<
  string,
  { label: string; badgeClass: string; border: string; glow: string }
> = {
  legendary: {
    label: "ตำนาน",
    badgeClass: "badge-gold",
    border: "#d4af37",
    glow: "0 0 15px rgba(212, 175, 55, 0.4)",
  },
  epic: {
    label: "มหากาพย์",
    badgeClass: "badge-gold",
    border: "#ba55d3",
    glow: "0 0 15px rgba(186, 85, 211, 0.35)",
  },
  rare: {
    label: "หายาก",
    badgeClass: "badge-gold",
    border: "#38bdf8",
    glow: "0 0 15px rgba(56, 189, 248, 0.3)",
  },
  common: {
    label: "ทั่วไป",
    badgeClass: "badge-gold",
    border: "#4ade80",
    glow: "none",
  },
};

function getDefaultPrizeImage(name: string, index: number): string {
  const lower = name.toLowerCase();
  if (lower.includes("art toy") || lower.includes("ตุ๊กตา") || lower.includes("มังกร") || lower.includes("โมเดล")) {
    return "/images/prize-art-toy.jpg";
  }
  if (lower.includes("พวงกุญแจ") || lower.includes("keychain") || lower.includes("จิ้งจอก")) {
    return "/images/prize-fox-keychain.jpg";
  }
  if (lower.includes("กระเป๋า") || lower.includes("tote") || lower.includes("ถุงผ้า") || lower.includes("bag")) {
    return "/images/prize-tote-bag.jpg";
  }
  if (lower.includes("สติ๊กเกอร์") || lower.includes("sticker")) {
    return "/images/prize-stickers-pack.jpg";
  }
  const fallbackList = [
    "/images/prize-art-toy.jpg",
    "/images/prize-fox-keychain.jpg",
    "/images/prize-tote-bag.jpg",
    "/images/prize-stickers-pack.jpg",
  ];
  return fallbackList[index % fallbackList.length];
}

export function PrizesPage() {
  const { firebaseUser, profile } = useAuth();
  const prizes = usePrizes();
  const media = useMedia();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedPrize, setSelectedPrize] = useState<(typeof prizes.items)[0] | null>(null);

  const isParticipantLoggedIn = Boolean(firebaseUser && profile?.username);
  const userPoints = profile?.pointTotal ?? 0;

  // Filter categories
  const categories = [
    { id: "all", label: "ทั้งหมด" },
    { id: "souvenir", label: "ของที่ระลึก" },
    { id: "lucky", label: "สิทธิ์ลุ้นโชค" },
    { id: "premium", label: "พรีเมียม" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "0 16px 30px" }}>
      {/* ========================================================================= */}
      {/* 1. POINTS BALANCE BANNER (Reference 5)                                    */}
      {/* ========================================================================= */}
      <div
        className="card-mythology"
        style={{
          padding: "24px 20px",
          marginTop: 8,
          position: "relative",
          overflow: "hidden",
          border: "1.5px solid var(--color-gold-500)",
        }}
      >
        <div style={{ position: "absolute", top: -15, right: -15, opacity: 0.1, pointerEvents: "none" }}>
          <img src="/assets/animations/reward-chest.svg" alt="" style={{ width: 150, height: 150 }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Gift style={{ width: 18, height: 18, color: "var(--color-gold-400)" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-gold-400)", letterSpacing: "0.08em" }}>
            REWARDS CATALOG
          </span>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-light-primary)", margin: "0 0 6px" }}>
          คลังของรางวัลแดนมังกร
        </h1>

        {isParticipantLoggedIn ? (
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 10 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: "var(--color-gold-400)", lineHeight: 1 }}>
                {userPoints}
              </span>
              <span style={{ fontSize: 16, fontWeight: 600, color: "var(--color-gold-300)" }}>
                แต้มสะสมคงเหลือ
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-light-secondary)", margin: "8px 0 0", lineHeight: 1.4 }}>
              นำแต้มที่ได้รับจากการพิชิตภารกิจมาแลกรับของรางวัล หรือติดต่อบูธแลกรางวัลกลางคณะศิลปกรรมศาสตร์
            </p>
          </div>
        ) : (
          <div style={{ marginTop: 12 }}>
            <p style={{ fontSize: 13, color: "var(--text-light-secondary)", margin: "0 0 14px", lineHeight: 1.4 }}>
              เข้าสู่ระบบเพื่อดูแต้มสะสมและสิทธิ์ในการแลกรับของรางวัล
            </p>
            <Link
              to="/login"
              className="button-gold-outline"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                fontSize: 13,
              }}
            >
              เข้าสู่ระบบเพื่อแลกของรางวัล
            </Link>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CELESTIAL MYSTERY BOX BANNER (สุ่มของรางวัลสวรรค์)                         */}
      {/* ========================================================================= */}
      <div
        className="card-mythology"
        style={{
          padding: "18px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          background: "linear-gradient(135deg, #fefce8 0%, #ffffff 100%)",
          border: "1.5px solid var(--color-gold-500)",
          borderRadius: 18,
          boxShadow: "0 4px 14px rgba(179, 134, 40, 0.12)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img
            src="/images/celestial-mystery-chest.jpg"
            alt="Celestial Mystery Box"
            style={{
              width: 72,
              height: 72,
              borderRadius: 14,
              objectFit: "cover",
              border: "1.5px solid var(--color-gold-500)",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <span className="badge-gold" style={{ fontSize: 10, padding: "2px 8px" }}>
                สิทธิ์พิเศษ 1 ครั้ง
              </span>
              <span style={{ fontSize: 11, color: "var(--color-gold-700)", fontWeight: 700 }}>
                กล่องสุ่มสวรรค์
              </span>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-red-900)", margin: "0 0 4px" }}>
              สุ่มรับของรางวัลสุดพิเศษ
            </h3>
            <p style={{ fontSize: 11, color: "var(--text-dark-secondary)", margin: 0 }}>
              เช็กอินอย่างน้อย 1 สถานที่ & 1 กิจกรรม เพื่อปลดล็อก
            </p>
          </div>
        </div>

        <Link
          to="/lucky-draw"
          className="button-gold"
          style={{
            textDecoration: "none",
            fontSize: 12,
            fontWeight: 800,
            padding: "8px 14px",
            whiteSpace: "nowrap",
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span>ไปเปิดกล่อง</span>
          <ChevronRight style={{ width: 14, height: 14 }} />
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 2. CATEGORY FILTER CHIPS                                                  */}
      {/* ========================================================================= */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                border: isActive ? "1px solid var(--color-gold-600)" : "1px solid var(--border-gold-subtle)",
                background: isActive ? "#7d1212" : "#ffffff",
                color: isActive ? "#ffffff" : "var(--text-dark-secondary)",
                boxShadow: isActive ? "0 2px 8px rgba(125, 18, 18, 0.25)" : "0 1px 3px rgba(0,0,0,0.04)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. PRIZE ITEMS LIST                                                       */}
      {/* ========================================================================= */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {prizes.loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--color-gold-400)" }}>
            กำลังเปิดหีบสมบัติ...
          </div>
        ) : prizes.items.length === 0 ? (
          <div
            className="ivory-card"
            style={{ textAlign: "center", padding: "30px 20px" }}
          >
            <Gift style={{ width: 40, height: 40, color: "var(--color-gold-600)", margin: "0 auto 10px" }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-red-900)" }}>
              ยังไม่มีของรางวัลที่เปิดให้แลก
            </div>
            <p style={{ fontSize: 12, color: "var(--text-dark-secondary)", margin: "4px 0 0" }}>
              โปรดติดตามประกาศเพิ่มเติมจากสำนักศิลปกรรมศาสตร์
            </p>
          </div>
        ) : (
          prizes.items.map((prize, idx) => {
            const cover = resolveMediaUrl(prize.imageMediaId || "", media.items);
            const pointsRequired = Number(prize.pointsRequired || 0);
            const hasEnough = isParticipantLoggedIn && userPoints >= pointsRequired;
            const isOutOfStock = Number(prize.stock || 0) <= 0;

            // Pick a rarity deterministically for presentation
            const rarityKeys = ["legendary", "epic", "rare", "common"];
            const rarity = RARITY_MAP[rarityKeys[idx % rarityKeys.length]] || RARITY_MAP.rare;

            return (
              <div
                key={prize.id}
                className="ivory-card"
                style={{
                  padding: "16px",
                  display: "flex",
                  gap: 14,
                  position: "relative",
                  borderLeft: `4px solid ${rarity.border}`,
                }}
              >
                {/* Prize Image / Thumbnail */}
                <div
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: 12,
                    background: "rgba(0,0,0,0.06)",
                    border: "1px solid rgba(205, 163, 79, 0.3)",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={cover || getDefaultPrizeImage(prize.name, idx)}
                    alt={prize.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                {/* Prize Info */}
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: rarity.border,
                          letterSpacing: "0.05em",
                        }}
                      >
                        ระดับ: {rarity.label}
                      </span>

                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: isOutOfStock ? "#a11a1a" : "var(--color-jade-800)",
                        }}
                      >
                        {isOutOfStock ? "หมดแล้ว" : `คงเหลือ ${prize.stock} ชิ้น`}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: "var(--color-red-950)",
                        margin: "4px 0 2px",
                      }}
                    >
                      {prize.name}
                    </h3>

                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--text-dark-secondary)",
                        margin: 0,
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {prize.description || "ของรางวัลพิเศษสำหรับผู้เข้าร่วมกิจกรรม FATU Open House"}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: 10,
                    }}
                  >
                    <div style={{ fontSize: 16, fontWeight: 900, color: "var(--color-red-900)" }}>
                      {pointsRequired}{" "}
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-gold-700)" }}>
                        แต้ม
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedPrize(prize)}
                      disabled={isOutOfStock || (!hasEnough && isParticipantLoggedIn)}
                      className={hasEnough && !isOutOfStock ? "button-imperial-red" : "button-gold-outline"}
                      style={{
                        padding: "6px 14px",
                        fontSize: 12,
                        fontWeight: 700,
                        borderRadius: 8,
                        cursor: isOutOfStock ? "not-allowed" : "pointer",
                        opacity: isOutOfStock ? 0.5 : 1,
                      }}
                    >
                      {isOutOfStock
                        ? "ของหมด"
                        : !isParticipantLoggedIn
                        ? "ดูรายละเอียด"
                        : hasEnough
                        ? "แลกรางวัล"
                        : "แต้มไม่พอ"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. REDEMPTION / DETAIL MODAL                                              */}
      {/* ========================================================================= */}
      {selectedPrize && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(4, 13, 15, 0.85)",
            backdropFilter: "blur(8px)",
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
        >
          <div
            className="ivory-card"
            style={{
              width: "100%",
              maxWidth: 380,
              padding: "24px 20px",
              position: "relative",
              border: "2px solid var(--color-gold-500)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
            }}
          >
            <button
              onClick={() => setSelectedPrize(null)}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-dark-muted)",
              }}
            >
              <X style={{ width: 22, height: 22 }} />
            </button>

            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  margin: "0 auto 12px",
                  borderRadius: 16,
                  background: "radial-gradient(circle, #7d1212 0%, #3b0606 100%)",
                  border: "2px solid var(--color-gold-500)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <img
                  src="/assets/animations/reward-chest.svg"
                  alt=""
                  style={{ width: 44, height: 44 }}
                />
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--color-red-950)", margin: 0 }}>
                {selectedPrize.name}
              </h2>
              <p style={{ fontSize: 12, color: "var(--text-dark-secondary)", marginTop: 6, lineHeight: 1.4 }}>
                {selectedPrize.description || "ของรางวัลสำหรับจอมยุทธ์ผู้พิชิตแดนศิลปกรรมศาสตร์"}
              </p>
            </div>

            <div
              style={{
                background: "rgba(0,0,0,0.04)",
                border: "1px solid rgba(205, 163, 79, 0.3)",
                borderRadius: 12,
                padding: "12px",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: "var(--text-dark-secondary)" }}>แต้มที่ต้องใช้:</span>
                <strong style={{ color: "var(--color-red-900)" }}>{selectedPrize.pointsRequired} แต้ม</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: "var(--text-dark-secondary)" }}>แต้มของคุณ:</span>
                <strong>{userPoints} แต้ม</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--text-dark-secondary)" }}>จุดรับรางวัล:</span>
                <strong style={{ color: "var(--color-jade-900)" }}>บูธกลาง ชั้น 1 คณะศิลปกรรมศาสตร์</strong>
              </div>
            </div>

            {isParticipantLoggedIn ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "var(--text-dark-muted)", marginBottom: 12 }}>
                  แสดงหน้าจอนี้ หรือแสดง <strong>ใบเบิกทางจอมยุทธ์</strong> แก่ทีมงานที่บูธเพื่อรับรางวัล
                </div>
                <Link
                  to="/pass"
                  className="button-imperial-red"
                  style={{ textDecoration: "none", width: "100%", justifyContent: "center" }}
                  onClick={() => setSelectedPrize(null)}
                >
                  <QrCode style={{ width: 18, height: 18 }} />
                  เปิดใบเบิกทางจอมยุทธ์เพื่อรับรางวัล
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="button-imperial-red"
                style={{ textDecoration: "none", width: "100%", justifyContent: "center" }}
                onClick={() => setSelectedPrize(null)}
              >
                เข้าสู่ระบบเพื่อแลกรางวัล
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
