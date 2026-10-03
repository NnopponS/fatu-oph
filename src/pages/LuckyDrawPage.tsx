import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Gift,
  Sparkles,
  CheckCircle,
  AlertCircle,
  QrCode,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Flame,
  Award,
} from "lucide-react";
import QRCode from "qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { TopHeader } from "@/components/TopHeader";
import { BottomNavBar } from "@/components/BottomNavBar";
import { ThemedLoading } from "@/components/ThemedLoading";
import { useAuth } from "@/contexts/AuthContext";

interface LuckyDrawStatus {
  ok: boolean;
  status: {
    eligible: boolean;
    claimed: boolean;
    prize: {
      id: string;
      title: string;
      description?: string;
      tier?: string;
      claimedAt?: string;
      voucherCode?: string;
      redeemed?: boolean;
      redeemedAt?: string;
    } | null;
    conditions: {
      hasVisitedVenue: boolean;
      hasCompletedActivity: boolean;
      visitedVenuesCount: number;
      completedActivitiesCount: number;
    };
    catalogCount: number;
  };
}

function getLuckyPrizeImage(title: string): string {
  const lower = (title || "").toLowerCase();
  if (lower.includes("art toy") || lower.includes("ตุ๊กตา") || lower.includes("มังกร") || lower.includes("โมเดล")) {
    return "/images/prize-art-toy.jpg";
  }
  if (lower.includes("พวงกุญแจ") || lower.includes("keychain") || lower.includes("จิ้งจอก")) {
    return "/images/prize-fox-keychain.jpg";
  }
  if (lower.includes("กระเป๋า") || lower.includes("tote") || lower.includes("ผ้า") || lower.includes("bag")) {
    return "/images/prize-tote-bag.jpg";
  }
  return "/images/prize-stickers-pack.jpg";
}

export const LuckyDrawPage: React.FC = () => {
  const { firebaseUser, profile, refreshProfile } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [drawing, setDrawing] = useState<boolean>(false);
  const [statusData, setStatusData] = useState<LuckyDrawStatus["status"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [celebrateReveal, setCelebrateReveal] = useState<boolean>(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = firebaseUser ? await firebaseUser.getIdToken() : "";
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/lucky-draw", { headers });
      const data: LuckyDrawStatus = await res.json();
      if (!res.ok) {
        throw new Error((data as unknown as { error?: string }).error || "ไม่สามารถโหลดข้อมูลสุ่มรางวัลได้");
      }
      setStatusData(data.status);

      if (data.status?.prize?.voucherCode) {
        const url = await QRCode.toDataURL(data.status.prize.voucherCode, {
          width: 256,
          margin: 2,
          color: {
            dark: "#042f2e",
            light: "#ffffff",
          },
        });
        setQrDataUrl(url);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser]);

  const handleDraw = async () => {
    if (!firebaseUser) return;
    setDrawing(true);
    setError(null);

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch("/api/lucky-draw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "draw" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ไม่สามารถสุ่มรางวัลได้");
      }

      setCelebrateReveal(true);
      await refreshProfile();
      await fetchStatus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการสุ่มรางวัล");
    } finally {
      setDrawing(false);
    }
  };

  const isEligible = statusData?.eligible ?? false;
  const isClaimed = statusData?.claimed ?? false;
  const prize = statusData?.prize;
  const conditions = statusData?.conditions;

  return (
    <div className="mobile-viewport">
      <TopHeader title="กล่องสุ่มสวรรค์" />

      {/* Chinese Mythology Hero Section */}
      <div className="chinese-hero" style={{ paddingBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Sparkles style={{ width: 18, height: 18, color: "var(--color-gold-400)" }} />
          <span className="chinese-hero-tagline">FATU OPEN HOUSE 2026</span>
          <Sparkles style={{ width: 18, height: 18, color: "var(--color-gold-400)" }} />
        </div>
        <h1 className="chinese-hero-title" style={{ fontSize: 26, margin: "4px 0" }}>
          กล่องสุ่มสวรรค์
        </h1>
        <div className="chinese-hero-subtitle" style={{ color: "var(--color-gold-300)" }}>
          CELESTIAL MYSTERY BOX
        </div>
        <p className="chinese-hero-desc">
          พิชิตภารกิจแดนมังกรเพื่อรับสิทธิ์สุ่มของรางวัลสุดพิเศษประจำงาน (ทุกคนมีสิทธิ์ 1 ครั้ง)
        </p>
      </div>

      <div className="ivory-card" style={{ paddingBottom: 110 }}>
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 12,
              color: "#991b1b",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            <AlertCircle style={{ width: 18, height: 18, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Not Logged In Callout */}
        {!firebaseUser && (
          <div
            className="ivory-card-inner"
            style={{
              textAlign: "center",
              padding: "24px 16px",
              marginBottom: 20,
              border: "1.5px dashed var(--border-gold-subtle)",
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                margin: "0 auto 12px",
                borderRadius: 20,
                overflow: "hidden",
                border: "2px solid var(--color-gold-400)",
                boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
              }}
            >
              <img
                src="/images/celestial-mystery-chest.jpg"
                alt="Mystery Box"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-red-900)", margin: "0 0 6px" }}>
              เข้าสู่ระบบเพื่อรับสิทธิ์สุ่มรางวัล
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-dark-secondary)", marginBottom: 16 }}>
              เพียงลงทะเบียนและร่วมกิจกรรมอย่างน้อย 1 จุด เพื่อปลดล็อกกล่องสุ่มสวรรค์
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Link to="/login" className="chinese-btn-primary" style={{ padding: "8px 20px", fontSize: 13 }}>
                เข้าสู่ระบบ
              </Link>
              <Link to="/register" className="chinese-btn-secondary" style={{ padding: "8px 20px", fontSize: 13 }}>
                ลงทะเบียน
              </Link>
            </div>
          </div>
        )}

        {/* Logged in Content */}
        {firebaseUser && (
          <div>
            {/* 1. Main Mystery Box Animation Graphic */}
            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px 0 10px",
              }}
            >
              <motion.div
                animate={
                  drawing
                    ? { scale: [1, 1.15, 0.95, 1.2, 1], rotate: [0, -6, 6, -10, 0] }
                    : { y: [0, -8, 0] }
                }
                transition={
                  drawing
                    ? { duration: 1.5, repeat: Infinity }
                    : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                }
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: 24,
                  overflow: "hidden",
                  border: "3px solid var(--color-gold-400)",
                  boxShadow: "0 12px 36px rgba(205, 163, 79, 0.4)",
                  background: "#081d22",
                }}
              >
                <img
                  src="/images/celestial-mystery-chest.jpg"
                  alt="Celestial Mystery Box"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </motion.div>
            </div>

            {/* 2. State: Already Claimed Prize */}
            {isClaimed && prize && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: "linear-gradient(135deg, #fdfbf7 0%, #fef3c7 100%)",
                  border: "2px solid var(--color-gold-500)",
                  borderRadius: 20,
                  padding: "20px",
                  marginTop: 10,
                  marginBottom: 20,
                  textAlign: "center",
                  boxShadow: "0 10px 30px rgba(212, 175, 55, 0.25)",
                }}
              >
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--color-red-900)", color: "#fef08a", padding: "4px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 800, marginBottom: 12 }}>
                  <Award style={{ width: 14, height: 14 }} />
                  <span>รางวัลที่คุณได้รับ</span>
                </div>

                <div
                  style={{
                    width: 140,
                    height: 140,
                    margin: "0 auto 14px",
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "2px solid var(--color-gold-500)",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
                  }}
                >
                  <img
                    src={getLuckyPrizeImage(prize.title)}
                    alt={prize.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--color-red-950)", margin: "0 0 6px" }}>
                  {prize.title}
                </h2>
                {prize.description && (
                  <p style={{ fontSize: 13, color: "var(--text-dark-secondary)", margin: "0 0 16px" }}>
                    {prize.description}
                  </p>
                )}

                {/* Redemption Status Badge */}
                <div style={{ marginBottom: 16 }}>
                  {prize.redeemed ? (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#dcfce7", color: "#166534", padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, border: "1px solid #86efac" }}>
                      <CheckCircle style={{ width: 16, height: 16 }} />
                      <span>รับของรางวัลแล้วเรียบร้อย ({prize.redeemedAt ? new Date(prize.redeemedAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) : "วันนี้"})</span>
                    </div>
                  ) : (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fef9c3", color: "#854d0e", padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, border: "1px solid #fde047" }}>
                      <ShieldCheck style={{ width: 16, height: 16 }} />
                      <span>รอรับของรางวัล — แสดง Voucher QR นี้แก่เจ้าหน้าที่ที่บูธกลาง</span>
                    </div>
                  )}
                </div>

                {/* Voucher QR Code */}
                {qrDataUrl && !prize.redeemed && (
                  <div style={{ background: "#ffffff", padding: 14, borderRadius: 16, display: "inline-block", border: "1px solid var(--border-gold-subtle)", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", marginBottom: 12 }}>
                    <img src={qrDataUrl} alt="Claim Voucher QR" style={{ width: 180, height: 180, display: "block" }} />
                    <div style={{ fontSize: 12, fontWeight: 800, color: "var(--color-red-900)", marginTop: 8, letterSpacing: 1 }}>
                      {prize.voucherCode}
                    </div>
                  </div>
                )}

                <div style={{ fontSize: 11, color: "var(--text-dark-muted)", marginTop: 4 }}>
                  สิทธิ์การสุ่ม: 1 ครั้งต่อผู้เข้าร่วม (ใช้สิทธิ์แล้ว)
                </div>
              </motion.div>
            )}

            {/* 3. State: Eligible to Draw (Ready!) */}
            {!isClaimed && isEligible && (
              <div style={{ textAlign: "center", marginTop: 10, marginBottom: 20 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#15803d", background: "#dcfce7", padding: "4px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 700, marginBottom: 12, border: "1px solid #86efac" }}>
                  <CheckCircle style={{ width: 14, height: 14 }} />
                  <span>คุณมีสิทธิ์สุ่มกล่องสวรรค์แล้ว 1 ครั้ง!</span>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <button
                    type="button"
                    disabled={drawing}
                    onClick={handleDraw}
                    className="chinese-btn-primary"
                    style={{
                      width: "100%",
                      maxWidth: 320,
                      margin: "0 auto",
                      padding: "14px 24px",
                      fontSize: 16,
                      fontWeight: 800,
                      boxShadow: "0 8px 24px rgba(212, 175, 55, 0.4)",
                    }}
                  >
                    <Gift style={{ width: 20, height: 20 }} />
                    <span>{drawing ? "กำลังเปิดกล่องสวรรค์..." : "เปิดกล่องสุ่มสวรรค์ทันที!"}</span>
                  </button>
                </div>

                <div style={{ fontSize: 11, color: "var(--text-dark-muted)" }}>
                  ของรางวัลของแท้มีจำนวนจำกัด สุ่มได้ 1 ครั้งต่อคนเท่านั้น
                </div>
              </div>
            )}

            {/* 4. State: In Progress (Not Yet Eligible) */}
            {!isClaimed && !isEligible && conditions && (
              <div style={{ marginTop: 10, marginBottom: 20 }}>
                <div className="ivory-card-inner">
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-red-900)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <Flame style={{ width: 16, height: 16, color: "var(--color-gold-600)" }} />
                    <span>เงื่อนไขการปลดล็อกกล่องสุ่มสวรรค์</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-dark-secondary)", margin: "0 0 12px" }}>
                    เข้าร่วมกิจกรรมเพื่อสะสมหลักฐานการผ่านด่านอย่างน้อย 1 สถานที่ และ 1 กิจกรรม
                  </p>

                  <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: conditions.hasVisitedVenue ? "#f0fdf4" : "#fef2f2",
                        border: `1px solid ${conditions.hasVisitedVenue ? "#bbf7d0" : "#fecaca"}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
                        <MapPin style={{ width: 16, height: 16, color: conditions.hasVisitedVenue ? "#16a34a" : "#dc2626" }} />
                        <span>เช็กอินสถานที่จัดงานอย่างน้อย 1 โซน</span>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: conditions.hasVisitedVenue ? "#16a34a" : "#dc2626" }}>
                        {conditions.hasVisitedVenue ? "✓ สำเร็จ" : `${conditions.visitedVenuesCount}/1`}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: conditions.hasCompletedActivity ? "#f0fdf4" : "#fef2f2",
                        border: `1px solid ${conditions.hasCompletedActivity ? "#bbf7d0" : "#fecaca"}`,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
                        <Award style={{ width: 16, height: 16, color: conditions.hasCompletedActivity ? "#16a34a" : "#dc2626" }} />
                        <span>เข้าร่วมกิจกรรม/ซุ้มอย่างน้อย 1 ฐาน</span>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: conditions.hasCompletedActivity ? "#16a34a" : "#dc2626" }}>
                        {conditions.hasCompletedActivity ? "✓ สำเร็จ" : `${conditions.completedActivitiesCount}/1`}
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/scan"
                    className="chinese-btn-primary"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      textDecoration: "none",
                      padding: "10px 16px",
                      fontSize: 13,
                    }}
                  >
                    <QrCode style={{ width: 16, height: 16 }} />
                    <span>ไปหน้าสแกนเพื่อเช็กอิน</span>
                    <ArrowRight style={{ width: 14, height: 14 }} />
                  </Link>
                </div>
              </div>
            )}

            {/* List of Possible Gifts in the Mystery Box */}
            <div style={{ marginTop: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-red-900)", margin: 0 }}>
                  ของขวัญในกล่องสุ่มสวรรค์
                </h3>
                <Link to="/prizes" style={{ fontSize: 12, color: "var(--color-gold-700)", textDecoration: "none", fontWeight: 700 }}>
                  ดูคลังรางวัลทั้งหมด →
                </Link>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "#ffffff", border: "1px solid var(--border-gold-subtle)", borderRadius: 14, padding: 12, textAlign: "center", boxShadow: "var(--shadow-card-ivory)" }}>
                  <img src="/assets/characters/azure-dragon-mascot.svg" alt="" style={{ width: 50, height: 50, margin: "0 auto 6px" }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-dark-primary)" }}>Art Toy สัตว์เทพ</div>
                  <div style={{ fontSize: 10, color: "var(--color-gold-700)", fontWeight: 600 }}>รางวัลระดับตำนาน</div>
                </div>

                <div style={{ background: "#ffffff", border: "1px solid var(--border-gold-subtle)", borderRadius: 14, padding: 12, textAlign: "center", boxShadow: "var(--shadow-card-ivory)" }}>
                  <img src="/assets/characters/nine-tailed-fox-mascot.svg" alt="" style={{ width: 50, height: 50, margin: "0 auto 6px" }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-dark-primary)" }}>พวงกุญแจอะคริลิก</div>
                  <div style={{ fontSize: 10, color: "#9333ea", fontWeight: 600 }}>มหากาพย์</div>
                </div>

                <div style={{ background: "#ffffff", border: "1px solid var(--border-gold-subtle)", borderRadius: 14, padding: 12, textAlign: "center", boxShadow: "var(--shadow-card-ivory)" }}>
                  <img src="/assets/decorations/dragon-seal.svg" alt="" style={{ width: 44, height: 44, margin: "4px auto 6px" }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-dark-primary)" }}>กระเป๋าผ้า OPH 2026</div>
                  <div style={{ fontSize: 10, color: "#0284c7", fontWeight: 600 }}>พรีเมียม</div>
                </div>

                <div style={{ background: "#ffffff", border: "1px solid var(--border-gold-subtle)", borderRadius: 14, padding: 12, textAlign: "center", boxShadow: "var(--shadow-card-ivory)" }}>
                  <img src="/assets/decorations/chinese-cloud.svg" alt="" style={{ width: 50, height: 40, margin: "8px auto 6px" }} />
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-dark-primary)" }}>เซตสติ๊กเกอร์โฮโลแกรม</div>
                  <div style={{ fontSize: 10, color: "#16a34a", fontWeight: 600 }}>ของที่ระลึก</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading && <ThemedLoading fullscreen message="กำลังโหลดข้อมูลกล่องสวรรค์..." />}
      {drawing && <ThemedLoading fullscreen message="กำลังเปิดกล่องสุ่มสวรรค์แดนมังกร..." />}

      <BottomNavBar />
    </div>
  );
};
