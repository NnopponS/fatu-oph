import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Users, MapPin, CheckCircle, Award, Settings, Search, LogOut, Gift, QrCode } from "lucide-react";
import { TopHeader } from "@/components/TopHeader";
import { ThemedLoading } from "@/components/ThemedLoading";
import { useAuth } from "@/contexts/AuthContext";
import { readRealtime, realtimePaths } from "@/services/realtime";

export const StaffDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { firebaseUser, profile, role, isStaff, isPendingStaff, loading: authLoading, logout } = useAuth();

  const [venues, setVenues] = useState<Record<string, { name: string; realmTitle?: string; isPublished?: boolean }>>({});
  const [activities, setActivities] = useState<Record<string, { title: string; venueId?: string; isPublished?: boolean }>>({});
  const [loading, setLoading] = useState(true);

  // Manual Check-in Override Form State
  const [targetUsername, setTargetUsername] = useState("");
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [overrideResult, setOverrideResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // Lucky Draw Voucher Redemption State
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherResult, setVoucherResult] = useState<{ ok: boolean; msg: string; prize?: string; participant?: string } | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (isPendingStaff) {
        navigate("/staff/pending");
      } else if (!isStaff) {
        navigate("/staff/login");
      }
    }
  }, [authLoading, isStaff, isPendingStaff, navigate]);

  useEffect(() => {
    async function loadData() {
      try {
        const [vSnap, aSnap] = await Promise.all([
          readRealtime<Record<string, { name: string; realmTitle?: string; isPublished?: boolean }>>(realtimePaths.public.venues),
          readRealtime<Record<string, { title: string; venueId?: string; isPublished?: boolean }>>(realtimePaths.public.activities),
        ]);
        if (vSnap) setVenues(vSnap);
        if (aSnap) {
          setActivities(aSnap);
          const firstActKey = Object.keys(aSnap)[0];
          if (firstActKey) setSelectedActivityId(firstActKey);
        }
      } catch (err) {
        console.error("Error loading staff data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleManualOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUsername.trim() || !selectedActivityId) return;

    setOverrideLoading(true);
    setOverrideResult(null);

    try {
      const token = firebaseUser ? await firebaseUser.getIdToken() : "";
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "completeActivity",
          participantId: targetUsername.trim(),
          activityId: selectedActivityId,
          reason: overrideReason.trim() || "เจ้าหน้าที่บันทึกผ่าน Staff Portal",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ไม่สามารถบันทึกกิจกรรมได้");
      }

      setOverrideResult({
        ok: true,
        msg: data.duplicate
          ? "ผู้เข้าร่วมเคยบันทึกกิจกรรมนี้แล้ว (ไม่เพิ่มแต้มซ้ำ)"
          : `บันทึกกิจกรรมสำเร็จ! ได้รับ +${data.pointsAdded} คะแนน`,
      });
      setTargetUsername("");
    } catch (err: unknown) {
      setOverrideResult({
        ok: false,
        msg: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึก",
      });
    } finally {
      setOverrideLoading(false);
    }
  };

  const handleRedeemVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;

    setVoucherLoading(true);
    setVoucherResult(null);

    try {
      const token = firebaseUser ? await firebaseUser.getIdToken() : "";
      const res = await fetch("/api/lucky-draw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "redeem-voucher",
          voucherCode: voucherCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ไม่สามารถตัดสิทธิ์รับของรางวัลได้");
      }

      setVoucherResult({
        ok: true,
        msg: data.message || "ตัดรับของรางวัลเรียบร้อยแล้ว",
        prize: data.prize?.title,
        participant: data.prize?.participantUsername,
      });
      setVoucherCode("");
    } catch (err: unknown) {
      setVoucherResult({
        ok: false,
        msg: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการตัดสิทธิ์",
      });
    } finally {
      setVoucherLoading(false);
    }
  };

  if (authLoading || loading) {
    return <ThemedLoading fullscreen message="กำลังโหลดข้อมูลแดชบอร์ดเจ้าหน้าที่..." />;
  }

  const venueList = Object.entries(venues);
  const activityList = Object.entries(activities);

  return (
    <div className="mobile-viewport allow-desktop">
      <TopHeader title="STAFF OPS" />

      {/* Staff Header Bar */}
      <div
        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #fcfaf4 100%)",
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-gold-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: "#fef3c7",
              border: "1.5px solid var(--color-gold-500)",
              display: "grid",
              placeItems: "center",
              color: "var(--color-gold-700)",
            }}
          >
            <Shield style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <div style={{ color: "var(--color-red-900)", fontWeight: 800, fontSize: 16 }}>
              {profile?.displayName || "Staff Member"}
            </div>
            <div style={{ color: "var(--color-gold-700)", fontSize: 12, fontWeight: 600 }}>
              บทบาท: <span style={{ textTransform: "uppercase" }}>{role}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {role === "admin" && (
            <Link
              to="/admin"
              className="button-imperial-red"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              <Settings style={{ width: 14, height: 14 }} />
              <span>Admin Panel</span>
            </Link>
          )}

          <button
            onClick={async () => {
              await logout();
              navigate("/staff/login");
            }}
            className="button-gold-outline"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 12px",
              borderRadius: 8,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            <LogOut style={{ width: 14, height: 14 }} />
            <span>ออก</span>
          </button>
        </div>
      </div>

      <div style={{ padding: "20px 16px 80px" }}>
        {/* KPI Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 20 }}>
          <div
            style={{
              background: "#ffffff",
              border: "1px solid var(--border-gold-subtle)",
              borderRadius: 14,
              padding: "14px 12px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <MapPin style={{ width: 20, height: 20, color: "var(--color-gold-600)", margin: "0 auto 6px" }} />
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--color-red-900)" }}>{venueList.length}</div>
            <div style={{ fontSize: 11, color: "var(--text-dark-secondary)", fontWeight: 600 }}>ดินแดน / จุดจัดงาน</div>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid var(--border-gold-subtle)",
              borderRadius: 14,
              padding: "14px 12px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <Award style={{ width: 20, height: 20, color: "#0284c7", margin: "0 auto 6px" }} />
            <div style={{ fontSize: 20, fontWeight: 900, color: "var(--color-red-900)" }}>{activityList.length}</div>
            <div style={{ fontSize: 11, color: "var(--text-dark-secondary)", fontWeight: 600 }}>กิจกรรมเปิดให้บริการ</div>
          </div>

          <div
            style={{
              background: "#ffffff",
              border: "1px solid var(--border-gold-subtle)",
              borderRadius: 14,
              padding: "14px 12px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            <CheckCircle style={{ width: 20, height: 20, color: "#16a34a", margin: "0 auto 6px" }} />
            <div style={{ fontSize: 20, fontWeight: 900, color: "#16a34a" }}>ปกติ</div>
            <div style={{ fontSize: 11, color: "var(--text-dark-secondary)", fontWeight: 600 }}>สถานะระบบ Self-QR</div>
          </div>
        </div>

        {/* Operational Notice */}
        <div
          style={{
            background: "#fdf8ea",
            border: "1px solid rgba(205, 163, 79, 0.45)",
            borderRadius: 12,
            padding: 14,
            marginBottom: 24,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <CheckCircle style={{ width: 20, height: 20, color: "var(--color-gold-700)", flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12, color: "var(--text-dark-primary)", lineHeight: 1.5 }}>
            <strong>คำแนะนำสำหรับ Staff:</strong> ผู้เข้าร่วมงานสามารถเปิดหน้า{" "}
            <strong>/scan</strong> บนโทรศัพท์ของตนเองเพื่อสแกน QR ประจำจุดกิจกรรมได้ทันที
            เจ้าหน้าที่ไม่ต้องเดินสแกนรหัสผู้เข้าร่วม ยกเว้นกรณีใช้อุปกรณ์บันทึกรับรองพิเศษ
          </div>
        </div>

        {/* Active Locations & Status */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-red-900)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <MapPin style={{ width: 18, height: 18, color: "var(--color-gold-600)" }} />
            <span>สถานะดินแดนและอาคารจัดกิจกรรม</span>
          </h3>

          <div style={{ display: "grid", gap: 10 }}>
            {venueList.map(([vId, v]) => (
              <div
                key={vId}
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--border-gold-subtle)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
                }}
              >
                <div>
                  <div style={{ color: "var(--text-dark-primary)", fontWeight: 700, fontSize: 14 }}>{v.name}</div>
                  <div style={{ color: "var(--color-gold-700)", fontSize: 12 }}>{v.realmTitle || vId}</div>
                </div>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: 9999,
                    fontSize: 11,
                    fontWeight: 600,
                    background: v.isPublished ? "#dcfce7" : "#f1f5f9",
                    color: v.isPublished ? "#166534" : "#64748b",
                    border: `1px solid ${v.isPublished ? "#bbf7d0" : "#cbd5e1"}`,
                  }}
                >
                  {v.isPublished ? "เปิดบริการ" : "ปิดชั่วคราว"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Manual Check-in Override Tool (Staff authorized) */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--border-gold-subtle)",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-red-900)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 6 }}>
            <Users style={{ width: 18, height: 18, color: "var(--color-gold-600)" }} />
            <span>เครื่องมือบันทึกกิจกรรมสำรอง (Manual Override)</span>
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-dark-secondary)", marginBottom: 16 }}>
            ใช้เฉพาะกรณีผู้เข้าร่วมกล้องขัดข้อง ไม่สามารถสแกน QR ได้เอง (บันทึก Audit ประวัติการทำรายการทุกครั้ง)
          </p>

          {overrideResult && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                fontSize: 13,
                marginBottom: 14,
                backgroundColor: overrideResult.ok ? "#ecfdf5" : "#fef2f2",
                color: overrideResult.ok ? "#065f46" : "#991b1b",
                border: `1px solid ${overrideResult.ok ? "#a7f3d0" : "#fecaca"}`,
              }}
            >
              {overrideResult.msg}
            </div>
          )}

          <form onSubmit={handleManualOverride}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", color: "var(--text-dark-primary)", fontSize: 12, marginBottom: 4, fontWeight: 700 }}>
                รหัสประจำตัว หรือ UID ผู้เข้าร่วม
              </label>
              <div style={{ position: "relative" }}>
                <Search style={{ position: "absolute", left: 12, top: 11, width: 16, height: 16, color: "var(--color-gold-600)" }} />
                <input
                  type="text"
                  required
                  placeholder="เช่น participant UID"
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 38px",
                    background: "#fbf8f1",
                    border: "1px solid rgba(205, 163, 79, 0.45)",
                    borderRadius: 8,
                    color: "var(--text-dark-primary)",
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", color: "var(--text-dark-primary)", fontSize: 12, marginBottom: 4, fontWeight: 700 }}>
                กิจกรรมที่ต้องการบันทึก
              </label>
              <select
                value={selectedActivityId}
                onChange={(e) => setSelectedActivityId(e.target.value)}
                style={{
                  width: "100%",
                  padding: 10,
                  background: "#fbf8f1",
                  border: "1px solid rgba(205, 163, 79, 0.45)",
                  borderRadius: 8,
                  color: "var(--text-dark-primary)",
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              >
                {activityList.map(([aId, a]) => (
                  <option key={aId} value={aId}>
                    {a.title} ({venues[a.venueId || ""]?.name || "ไม่ระบุจุด"})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "var(--text-dark-primary)", fontSize: 12, marginBottom: 4, fontWeight: 700 }}>
                เหตุผลการบันทึกแทน (สำหรับ Audit Log)
              </label>
              <input
                type="text"
                placeholder="เช่น ผู้เข้าร่วมกล้องเสีย, ตรวจสอบผลงานหน้างานแล้ว"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                style={{
                  width: "100%",
                  padding: 10,
                  background: "#fbf8f1",
                  border: "1px solid rgba(205, 163, 79, 0.45)",
                  borderRadius: 8,
                  color: "var(--text-dark-primary)",
                  fontSize: 13,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={overrideLoading}
              className="button-imperial-red"
              style={{ fontSize: 13, padding: "10px 18px", width: "100%", cursor: "pointer" }}
            >
              {overrideLoading ? "กำลังบันทึก..." : "ยืนยันการบันทึกกิจกรรมให้ผู้เข้าร่วม"}
            </button>
          </form>
        </div>

        {/* Lucky Draw Voucher Redemption Tool */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--border-gold-subtle)",
            borderRadius: 16,
            padding: 18,
            marginTop: 20,
            boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-red-900)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 6 }}>
            <Gift style={{ width: 18, height: 18, color: "var(--color-gold-600)" }} />
            <span>ตรวจและตัดสิทธิ์รับของรางวัลกล่องสุ่มสวรรค์ (Voucher Redemption)</span>
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-dark-secondary)", marginBottom: 16 }}>
            เมื่อผู้เข้าร่วมนำ QR หรือรหัส Voucher มาแสดงที่บูธของรางวัล ให้กรอกหรือสแกนรหัสเพื่อยืนยันการมอบรางวัล
          </p>

          {voucherResult && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                fontSize: 13,
                marginBottom: 14,
                backgroundColor: voucherResult.ok ? "#ecfdf5" : "#fef2f2",
                color: voucherResult.ok ? "#065f46" : "#991b1b",
                border: `1px solid ${voucherResult.ok ? "#a7f3d0" : "#fecaca"}`,
              }}
            >
              <div style={{ fontWeight: 700 }}>{voucherResult.msg}</div>
              {voucherResult.prize && (
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  ของรางวัล: <strong>{voucherResult.prize}</strong> | ผู้รับ: <strong>@{voucherResult.participant}</strong>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleRedeemVoucher}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "var(--text-dark-primary)", fontSize: 12, marginBottom: 4, fontWeight: 700 }}>
                รหัส Voucher (Voucher Code)
              </label>
              <div style={{ position: "relative" }}>
                <QrCode style={{ position: "absolute", left: 12, top: 11, width: 16, height: 16, color: "var(--color-gold-600)" }} />
                <input
                  type="text"
                  required
                  placeholder="เช่น FATU26LUCKY:usr_xxxx หรือสแกน QR"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 38px",
                    background: "#fbf8f1",
                    border: "1px solid rgba(205, 163, 79, 0.45)",
                    borderRadius: 8,
                    color: "var(--text-dark-primary)",
                    fontSize: 13,
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={voucherLoading}
              className="button-gold"
              style={{ fontSize: 13, padding: "10px 18px", width: "100%", cursor: "pointer" }}
            >
              {voucherLoading ? "กำลังตรวจสอบ..." : "ตรวจสอบและตัดรับรางวัลให้ผู้เข้าร่วม"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
