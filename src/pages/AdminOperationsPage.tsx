import React, { useEffect, useMemo, useState, type FormEvent } from "react";
import QRCode from "qrcode";
import {
  QrCode,
  Users,
  UserCheck,
  CheckCircle2,
  XCircle,
  Search,
  Printer,
  Download,
  ShieldAlert,
  Sparkles,
  MapPin,
  Clock,
  ChevronRight,
  Filter,
  Heart,
  Star,
} from "lucide-react";
import { useActivities, useVenues } from "@/data/content";
import { AdminAccess, useAdminSession } from "@/pages/AdminPage";
import { adminAction } from "@/services/api";

interface StaffApplication {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  department: string;
  status: "staff_pending" | "approved" | "rejected";
  role: string;
  appliedAt: string;
}

interface ParticipantRow {
  id: string;
  displayName: string;
  username?: string;
  school: string;
  phone: string;
  email: string;
  createdAt: string;
  pointTotal: number;
}

interface ParticipantDetail {
  pointTotal: number;
  entryCheckin: { createdAt?: string; staffId?: string } | null;
  transactions: Array<{
    id: string;
    points: number;
    reason: string;
    source?: string;
    createdAt: string;
  }>;
  claims: Array<{
    id: string;
    prizeId?: string;
    pointsSpent?: number;
    status?: string;
    createdAt?: string;
  }>;
  completions: Array<{
    id: string;
    activityId?: string;
    pointsAdded?: number;
    createdAt?: string;
  }>;
}

export function AdminOperationsPage() {
  const session = useAdminSession();
  const venues = useVenues();
  const activities = useActivities();

  const [activeTab, setActiveTab] = useState<"checkpoints" | "staff" | "participants" | "survey">("checkpoints");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Checkpoints State
  const [selectedQrItem, setSelectedQrItem] = useState<{
    title: string;
    subtitle: string;
    payload: string;
    points?: number;
    venueName?: string;
    qrDataUrl?: string;
  } | null>(null);

  // Staff State
  const [applications, setApplications] = useState<StaffApplication[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);

  // Participants State
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState("");
  const [participantDetail, setParticipantDetail] = useState<ParticipantDetail | null>(null);
  const [participantQuery, setParticipantQuery] = useState("");

  // Survey Feedback State
  interface SurveySummary {
    totalSubmissions: number;
    averages: {
      overall: number;
      venues: number;
      activities: number;
      staff: number;
      totalAverage: number;
    };
    comments: Array<{
      id: string;
      userId: string;
      username: string;
      ratingOverall: number;
      comment: string;
      createdAt: string;
    }>;
  }
  const [surveySummary, setSurveySummary] = useState<SurveySummary | null>(null);
  const [surveyLoading, setSurveyLoading] = useState(false);

  const refreshSurvey = async () => {
    setSurveyLoading(true);
    try {
      const token = session?.user ? await session.user.getIdToken() : "";
      const authHeader = token ? `Bearer ${token}` : "";
      const res = await fetch("/api/survey?action=summary", {
        headers: { Authorization: authHeader },
      });
      const data = await res.json();
      if (res.ok) {
        setSurveySummary(data.summary);
      }
    } catch (err) {
      console.error("Failed to load survey summary:", err);
    } finally {
      setSurveyLoading(false);
    }
  };

  const refreshStaff = async () => {
    setStaffLoading(true);
    try {
      const res = await adminAction<{ applications: StaffApplication[] }>("staffApplications");
      setApplications(res.applications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลดข้อมูล Staff ไม่สำเร็จ");
    } finally {
      setStaffLoading(false);
    }
  };

  const refreshParticipants = async () => {
    try {
      const res = await adminAction<{ participants: ParticipantRow[] }>("participants");
      setParticipants(res.participants || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลดข้อมูลผู้เข้าร่วมไม่สำเร็จ");
    }
  };

  useEffect(() => {
    void refreshStaff();
    void refreshParticipants();
  }, []);

  useEffect(() => {
    if (activeTab === "survey") {
      void refreshSurvey();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (!selectedParticipantId) {
      setParticipantDetail(null);
      return;
    }
    void adminAction<ParticipantDetail>("participantDetail", { participantId: selectedParticipantId })
      .then(setParticipantDetail)
      .catch((err) => setError(err instanceof Error ? err.message : "โหลดประวัติไม่สำเร็จ"));
  }, [selectedParticipantId]);

  // Generate QR modal
  const openQrModal = async (title: string, subtitle: string, payload: string, points?: number, venueName?: string) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(payload, {
        width: 400,
        margin: 2,
        color: {
          dark: "#040d0f",
          light: "#ffffff",
        },
      });
      setSelectedQrItem({ title, subtitle, payload, points, venueName, qrDataUrl });
    } catch {
      setError("ไม่สามารถสร้าง QR Code ได้");
    }
  };

  // Print signage poster
  const handlePrint = () => {
    if (!selectedQrItem) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedQrItem.title} - จุดเช็กอิน OPH 2026</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;700;900&display=swap');
            body {
              font-family: 'Noto Sans Thai', sans-serif;
              margin: 0;
              padding: 40px;
              text-align: center;
              background: #fff;
              color: #1c1917;
            }
            .poster {
              border: 12px double #8c6715;
              padding: 40px 30px;
              border-radius: 24px;
              max-width: 600px;
              margin: 0 auto;
              background: #fcfaf4;
            }
            .header-tag {
              font-size: 16px;
              font-weight: 700;
              color: #a11a1a;
              letter-spacing: 2px;
            }
            h1 {
              font-size: 32px;
              font-weight: 900;
              margin: 8px 0;
              color: #540c0c;
            }
            .venue {
              font-size: 20px;
              color: #8c6715;
              margin-bottom: 24px;
            }
            .qr-wrap {
              background: #fff;
              padding: 16px;
              display: inline-block;
              border: 3px solid #cda34f;
              border-radius: 16px;
              box-shadow: 0 4px 16px rgba(0,0,0,0.1);
            }
            .qr-wrap img {
              width: 320px;
              height: 320px;
              display: block;
            }
            .instructions {
              margin-top: 24px;
              font-size: 16px;
              font-weight: 700;
              color: #1c1917;
            }
            .code-text {
              margin-top: 8px;
              font-family: monospace;
              font-size: 14px;
              color: #575249;
            }
            .points-tag {
              display: inline-block;
              margin-top: 16px;
              background: #7d1212;
              color: #fff;
              padding: 8px 24px;
              border-radius: 20px;
              font-size: 18px;
              font-weight: 900;
            }
          </style>
        </head>
        <body>
          <div class="poster">
            <div class="header-tag">FATU OPEN HOUSE 2026 · ตะลุยแดนมังกร</div>
            <h1>${selectedQrItem.title}</h1>
            <div class="venue">${selectedQrItem.venueName || selectedQrItem.subtitle}</div>
            <div class="qr-wrap">
              <img src="${selectedQrItem.qrDataUrl}" alt="QR" />
            </div>
            ${selectedQrItem.points ? `<div class="points-tag">+${selectedQrItem.points} แต้ม</div>` : ""}
            <div class="instructions">เปิดแอปและกดปุ่ม "สแกน QR" เพื่อเช็กอิน</div>
            <div class="code-text">${selectedQrItem.payload}</div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Staff Approval Actions
  const handleApproveStaff = async (uid: string, role: string = "staff") => {
    setMessage("");
    setError("");
    try {
      await adminAction("approveStaff", { uid, role });
      setMessage("อนุมัติทีมงาน Staff เรียบร้อยแล้ว");
      await refreshStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : "อนุมัติไม่สำเร็จ");
    }
  };

  const handleRejectStaff = async (uid: string) => {
    const reason = window.prompt("ระบุเหตุผลในการปฏิเสธคำขอ (ระบุหรือไม่ก็ได้):", "คุณสมบัติไม่ตรงตามที่กำหนด");
    if (reason === null) return;

    setMessage("");
    setError("");
    try {
      await adminAction("rejectStaff", { uid, reason: reason || "ไม่อนุมัติ" });
      setMessage("ปฏิเสธคำขอเรียบร้อยแล้ว");
      await refreshStaff();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ปฏิเสธไม่สำเร็จ");
    }
  };

  // Participant Adjust Points
  const handleAdjustPoints = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedParticipantId) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const points = Number(data.get("points") || 0);
    const reason = String(data.get("reason") || "");

    try {
      const res = await adminAction<{ pointTotal: number }>("adjustPoints", {
        participantId: selectedParticipantId,
        points,
        reason,
      });
      setMessage(`ปรับคะแนนสำเร็จ ยอดคะแนนใหม่คือ ${res.pointTotal} แต้ม`);
      form.reset();
      await refreshParticipants();
      if (selectedParticipantId) {
        setParticipantDetail(await adminAction<ParticipantDetail>("participantDetail", { participantId: selectedParticipantId }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "ปรับคะแนนไม่สำเร็จ");
    }
  };

  const filteredParticipants = useMemo(() => {
    const q = participantQuery.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter((p) =>
      [p.displayName, p.username, p.school, p.phone, p.email, p.id].join(" ").toLowerCase().includes(q),
    );
  }, [participants, participantQuery]);

  const selectedParticipant = participants.find((p) => p.id === selectedParticipantId);

  return (
    <AdminAccess roles={["admin", "editor", "staff"]}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "20px" }}>
        {/* Page Title & Navigation Tabs */}
        <div>
          <span className="section-kicker">OPERATIONS & CMS</span>
          <h1 className="admin-page-title" style={{ margin: "4px 0 16px" }}>
            ระบบปฏิบัติการและศูนย์ควบคุม
          </h1>

          <div style={{ display: "flex", gap: 10, borderBottom: "1px solid rgba(205, 163, 79, 0.2)", paddingBottom: 8 }}>
            <button
              onClick={() => setActiveTab("checkpoints")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                border: activeTab === "checkpoints" ? "1px solid var(--color-gold-400)" : "1px solid transparent",
                background: activeTab === "checkpoints" ? "rgba(205, 163, 79, 0.15)" : "transparent",
                color: activeTab === "checkpoints" ? "var(--color-gold-300)" : "var(--text-dark-muted)",
              }}
            >
              <QrCode style={{ width: 16, height: 16 }} />
              จุดเช็กอิน & QR Code (Ref 8)
            </button>

            <button
              onClick={() => setActiveTab("staff")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                border: activeTab === "staff" ? "1px solid var(--color-gold-400)" : "1px solid transparent",
                background: activeTab === "staff" ? "rgba(205, 163, 79, 0.15)" : "transparent",
                color: activeTab === "staff" ? "var(--color-gold-300)" : "var(--text-dark-muted)",
              }}
            >
              <Users style={{ width: 16, height: 16 }} />
              จัดการทีมงาน Staff (Ref 9)
              {applications.filter((a) => a.status === "staff_pending").length > 0 && (
                <span style={{ background: "#a11a1a", color: "#fff", fontSize: 11, padding: "1px 6px", borderRadius: 10 }}>
                  {applications.filter((a) => a.status === "staff_pending").length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("participants")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                border: activeTab === "participants" ? "1px solid var(--color-gold-400)" : "1px solid transparent",
                background: activeTab === "participants" ? "rgba(205, 163, 79, 0.15)" : "transparent",
                color: activeTab === "participants" ? "var(--color-gold-300)" : "var(--text-dark-muted)",
              }}
            >
              <UserCheck style={{ width: 16, height: 16 }} />
              ผู้เข้าร่วม & แต้มสะสม
            </button>

            <button
              onClick={() => setActiveTab("survey")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                border: activeTab === "survey" ? "1px solid var(--color-gold-400)" : "1px solid transparent",
                background: activeTab === "survey" ? "rgba(205, 163, 79, 0.15)" : "transparent",
                color: activeTab === "survey" ? "var(--color-gold-300)" : "var(--text-dark-muted)",
              }}
            >
              <Heart style={{ width: 16, height: 16 }} />
              ผลประเมิน & Feedback
              {surveySummary && surveySummary.totalSubmissions > 0 && (
                <span style={{ background: "rgba(205, 163, 79, 0.25)", color: "var(--color-gold-300)", fontSize: 11, padding: "1px 6px", borderRadius: 10 }}>
                  {surveySummary.totalSubmissions}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {message && (
          <div style={{ background: "rgba(46, 125, 50, 0.2)", border: "1px solid #4caf50", color: "#a5d6a7", padding: "10px 16px", borderRadius: 8, fontSize: 13 }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{ background: "rgba(198, 40, 40, 0.2)", border: "1px solid #ef5350", color: "#ef9a9a", padding: "10px 16px", borderRadius: 8, fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 1: CHECKPOINTS & QR MANAGER (Reference 8)                           */}
        {/* ======================================================================= */}
        {activeTab === "checkpoints" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-gold-400)", margin: "0 0 6px" }}>
                จุดเช็กอินประจำ 4 แดนศักดิ์สิทธิ์
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-light-secondary)", margin: 0 }}>
                QR Code ประจำสถานที่หลัก เมื่อผู้เข้าร่วมสแกนจะถือว่าได้สำรวจแดนนั้นทันที
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {venues.items.map((venue) => {
                const payload = `FATU26:CHK:${venue.id}`;
                return (
                  <div
                    key={venue.id}
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--border-gold-subtle)",
                      borderRadius: 14,
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div>
                      <span className="badge-gold" style={{ fontSize: 10 }}>จุดเช็กอินแดน</span>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-red-900)", margin: "6px 0 2px" }}>
                        {venue.visualLabel || venue.name}
                      </h3>
                      <div style={{ fontSize: 12, color: "var(--color-gold-700)", fontWeight: 600 }}>{venue.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-dark-secondary)", marginTop: 6, fontFamily: "monospace" }}>
                        Payload: {payload}
                      </div>
                    </div>

                    <button
                      onClick={() => openQrModal(venue.visualLabel || venue.name, venue.name, payload, undefined, venue.name)}
                      className="button-gold-outline"
                      style={{ marginTop: 14, width: "100%", justifyContent: "center", fontSize: 12 }}
                    >
                      <QrCode style={{ width: 14, height: 14 }} />
                      ดู & พิมพ์ป้าย QR
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-red-900)", margin: "0 0 6px" }}>
                จุดเช็กอินกิจกรรมและภารกิจ (+แต้มสะสม)
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-dark-secondary)", margin: 0 }}>
                QR Code ประจำกิจกรรม เมื่อผู้เข้าร่วมสแกนจะได้รับแต้มสะสมทันที และบันทึกแดนที่เกี่ยวข้องโดยอัตโนมัติ
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {activities.items.map((activity) => {
                const venue = venues.items.find((v) => v.id === activity.venueId);
                const payload = `FATU26:ACT:${activity.id}`;
                return (
                  <div
                    key={activity.id}
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--border-gold-subtle)",
                      borderRadius: 14,
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span className="badge-gold" style={{ fontSize: 10 }}>+{activity.pointsAwarded} แต้ม</span>
                        <span style={{ fontSize: 11, color: "var(--text-light-secondary)" }}>{venue?.name || "ไม่ระบุ"}</span>
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-light-primary)", margin: "6px 0 2px" }}>
                        {activity.title}
                      </h3>
                      <div style={{ fontSize: 11, color: "var(--text-dark-muted)", marginTop: 6, fontFamily: "monospace" }}>
                        {payload}
                      </div>
                    </div>

                    <button
                      onClick={() => openQrModal(activity.title, `ณ ${venue?.name || "คณะศิลปกรรมศาสตร์"}`, payload, activity.pointsAwarded, venue?.name)}
                      className="button-gold-outline"
                      style={{ marginTop: 14, width: "100%", justifyContent: "center", fontSize: 12 }}
                    >
                      <QrCode style={{ width: 14, height: 14 }} />
                      ดู & พิมพ์ป้าย QR
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 2: STAFF APPLICATIONS & APPROVALS (Reference 9)                     */}
        {/* ======================================================================= */}
        {activeTab === "staff" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-gold-400)", margin: "0 0 6px" }}>
                คำขอลงทะเบียนทีมงาน Staff (รอการอนุมัติ)
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-light-secondary)", margin: 0 }}>
                ผู้ลงทะเบียนเป็นทีมงานต้องได้รับการตรวจสอบและอนุมัติจากผู้ดูแลระบบก่อนเข้าใช้งานแดชบอร์ด
              </p>
            </div>

            {staffLoading ? (
              <div style={{ padding: "30px", textAlign: "center", color: "var(--color-gold-400)" }}>กำลังโหลด...</div>
            ) : applications.filter((a) => a.status === "staff_pending").length === 0 ? (
              <div className="ivory-card" style={{ padding: "24px", textAlign: "center" }}>
                <CheckCircle2 style={{ width: 36, height: 36, color: "#4caf50", margin: "0 auto 8px" }} />
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-red-900)" }}>
                  ไม่มีคำขอ Staff ที่รอดำเนินการ
                </div>
                <div style={{ fontSize: 12, color: "var(--text-dark-muted)", marginTop: 2 }}>
                  คำขอทั้งหมดได้รับการตรวจสอบแล้ว
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {applications
                  .filter((a) => a.status === "staff_pending")
                  .map((app) => (
                    <div
                      key={app.uid}
                      className="ivory-card"
                      style={{
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 16,
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: "var(--color-red-950)" }}>
                            {app.fullName}
                          </span>
                          <span className="badge-gold" style={{ fontSize: 11 }}>
                            @{app.username}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-dark-secondary)", marginTop: 4 }}>
                          ฝ่าย/แผนก: <strong>{app.department || "ทั่วไป"}</strong> · อีเมล: {app.email} · โทร: {app.phone}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-dark-muted)", marginTop: 2 }}>
                          สมัครเมื่อ: {app.appliedAt ? new Date(app.appliedAt).toLocaleString("th-TH") : "ไม่ระบุ"}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleApproveStaff(app.uid, "staff")}
                          className="button-imperial-red"
                          style={{ padding: "8px 16px", fontSize: 12 }}
                        >
                          <CheckCircle2 style={{ width: 14, height: 14 }} />
                          อนุมัติ Staff
                        </button>
                        <button
                          onClick={() => handleRejectStaff(app.uid)}
                          className="button-gold-outline"
                          style={{ padding: "8px 16px", fontSize: 12 }}
                        >
                          <XCircle style={{ width: 14, height: 14 }} />
                          ปฏิเสธ
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Approved Staff History */}
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-light-primary)", margin: "0 0 10px" }}>
                รายชื่อทีมงานที่ได้รับอนุมัติแล้ว
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {applications
                  .filter((a) => a.status === "approved")
                  .map((app) => (
                    <div
                      key={app.uid}
                      style={{
                        background: "#ffffff",
                        border: "1px solid var(--border-gold-subtle)",
                        borderRadius: 10,
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
                      }}
                    >
                      <div>
                        <strong style={{ color: "var(--text-dark-primary)" }}>{app.fullName}</strong>
                        <span style={{ color: "var(--color-gold-700)", marginLeft: 8, fontSize: 12, fontWeight: 700 }}>
                          @{app.username}
                        </span>
                        <div style={{ fontSize: 11, color: "var(--text-dark-secondary)", marginTop: 2 }}>
                          {app.department || "Staff"} · {app.email}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: "#166534", fontWeight: 700 }}>✓ อนุมัติแล้ว</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 3: PARTICIPANTS & POINTS DIRECTORY                                  */}
        {/* ======================================================================= */}
        {activeTab === "participants" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
            {/* Left Column: Search & Participant List */}
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <Search style={{ position: "absolute", left: 12, top: 10, width: 16, height: 16, color: "var(--color-gold-600)" }} />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อ, username, โรงเรียน, เบอร์โทร..."
                    value={participantQuery}
                    onChange={(e) => setParticipantQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px 8px 36px",
                      borderRadius: 8,
                      background: "#fbf8f1",
                      border: "1px solid rgba(205, 163, 79, 0.45)",
                      color: "var(--text-dark-primary)",
                      fontSize: 13,
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 600, overflowY: "auto" }}>
                {filteredParticipants.map((p) => {
                  const isSelected = p.id === selectedParticipantId;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedParticipantId(p.id)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 10,
                        background: isSelected ? "#fef3c7" : "#ffffff",
                        border: isSelected ? "1.5px solid var(--color-gold-600)" : "1px solid var(--border-gold-subtle)",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-light-primary)" }}>
                          {p.displayName}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--color-gold-400)" }}>
                          @{p.username || p.id.slice(0, 8)} · {p.school || "ไม่ระบุโรงเรียน"}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: "var(--color-gold-300)" }}>
                          {p.pointTotal} แต้ม
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Participant Detail & Manual Point Adjustment */}
            <div>
              {selectedParticipant ? (
                <div className="ivory-card" style={{ padding: "20px" }}>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: "var(--color-red-950)", margin: 0 }}>
                    {selectedParticipant.displayName}
                  </h3>
                  <div style={{ fontSize: 13, color: "var(--color-gold-700)", fontWeight: 700 }}>
                    @{selectedParticipant.username || selectedParticipant.id}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-dark-secondary)", margin: "4px 0 16px" }}>
                    โรงเรียน: {selectedParticipant.school || "-"} · โทร: {selectedParticipant.phone || "-"}
                  </div>

                  <div style={{ background: "rgba(0,0,0,0.04)", padding: "12px", borderRadius: 8, marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: "var(--text-dark-muted)" }}>ยอดคะแนนสะสม</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: "var(--color-red-900)" }}>
                      {selectedParticipant.pointTotal} แต้ม
                    </div>
                  </div>

                  {/* Manual Adjustment Form */}
                  <form onSubmit={handleAdjustPoints} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-red-950)", margin: 0 }}>
                      ปรับแก้คะแนนด้วยตนเอง
                    </h4>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dark-secondary)" }}>
                        คะแนนที่ต้องการเพิ่มหรือลด (ใส่เครื่องหมายลบหากต้องการลด)
                      </label>
                      <input
                        name="points"
                        type="number"
                        required
                        placeholder="เช่น 20 หรือ -10"
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: 6,
                          border: "1px solid #ccc",
                          fontSize: 13,
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-dark-secondary)" }}>
                        เหตุผลในการปรับแก้ (บันทึกลง Audit Log)
                      </label>
                      <input
                        name="reason"
                        required
                        placeholder="เช่น รางวัลตอบคำถามพิเศษบนเวที"
                        style={{
                          width: "100%",
                          padding: "8px",
                          borderRadius: 6,
                          border: "1px solid #ccc",
                          fontSize: 13,
                        }}
                      />
                    </div>
                    <button type="submit" className="button-imperial-red" style={{ justifyContent: "center" }}>
                      บันทึกการปรับคะแนน
                    </button>
                  </form>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-light-secondary)" }}>
                  เลือกผู้เข้าร่วมทางซ้ายเพื่อดูรายละเอียดและปรับคะแนน
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* TAB 4: SURVEY FEEDBACK & RATINGS ANALYTICS                              */}
        {/* ======================================================================= */}
        {activeTab === "survey" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", margin: 0 }}>
                  รายงานผลแบบประเมินความพึงพอใจ
                </h2>
                <div style={{ fontSize: 13, color: "var(--text-light-secondary)", marginTop: 2 }}>
                  รวบรวมคะแนนความพึงพอใจและข้อเสนอแนะจากผู้เข้าร่วมงาน Open House 2026
                </div>
              </div>
              <button
                onClick={refreshSurvey}
                className="button-gold-outline"
                style={{ fontSize: 12, padding: "6px 14px" }}
              >
                {surveyLoading ? "กำลังรีเฟรช..." : "รีเฟรชข้อมูล"}
              </button>
            </div>

            {/* Metrics Overview Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
              <div style={{ background: "#ffffff", border: "1px solid var(--border-gold-subtle)", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div style={{ fontSize: 12, color: "var(--color-gold-700)", fontWeight: 700 }}>จำนวนผู้ตอบแบบประเมิน</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: "var(--color-red-900)", marginTop: 4 }}>
                  {surveySummary?.totalSubmissions ?? 0} <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-dark-secondary)" }}>คน</span>
                </div>
              </div>

              <div style={{ background: "#ffffff", border: "1px solid var(--border-gold-subtle)", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div style={{ fontSize: 12, color: "var(--color-gold-700)", fontWeight: 700 }}>คะแนนเฉลี่ยรวมทุกมิติ</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: "var(--color-red-900)" }}>
                    {surveySummary?.averages.totalAverage ? surveySummary.averages.totalAverage.toFixed(2) : "5.00"}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-dark-secondary)" }}>/ 5.00</span>
                </div>
              </div>

              <div style={{ background: "#ffffff", border: "1px solid var(--border-gold-subtle)", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div style={{ fontSize: 12, color: "var(--color-gold-700)", fontWeight: 700 }}>ภาพรวมการจัดงาน</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-red-900)", marginTop: 4 }}>
                  ⭐ {surveySummary?.averages.overall ? surveySummary.averages.overall.toFixed(2) : "5.00"}
                </div>
              </div>

              <div style={{ background: "#ffffff", border: "1px solid var(--border-gold-subtle)", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                <div style={{ fontSize: 12, color: "var(--color-gold-700)", fontWeight: 700 }}>การดูแลของทีมงาน Staff</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--color-red-900)", marginTop: 4 }}>
                  ⭐ {surveySummary?.averages.staff ? surveySummary.averages.staff.toFixed(2) : "5.00"}
                </div>
              </div>
            </div>

            {/* Category Dimension Breakdown */}
            <div style={{ background: "#ffffff", border: "1px solid var(--border-gold-subtle)", borderRadius: 16, padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-red-900)", margin: "0 0 16px" }}>
                คะแนนแยกตาม 4 มิติการประเมิน
              </h3>

              <div style={{ display: "grid", gap: 14 }}>
                {[
                  { label: "1. ภาพรวมการจัดงาน FATU Open House", score: surveySummary?.averages.overall ?? 5.0 },
                  { label: "2. สถานที่ & บรรยากาศแดนมังกร", score: surveySummary?.averages.venues ?? 5.0 },
                  { label: "3. กิจกรรม & สาระความรู้", score: surveySummary?.averages.activities ?? 5.0 },
                  { label: "4. การต้อนรับของพี่ ๆ เจ้าหน้าที่", score: surveySummary?.averages.staff ?? 5.0 },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: "var(--text-dark-primary)", fontWeight: 600 }}>{item.label}</span>
                      <span style={{ color: "var(--color-red-900)", fontWeight: 800 }}>{item.score.toFixed(2)} / 5.00</span>
                    </div>
                    <div style={{ height: 8, background: "#f5f5f4", borderRadius: 9999, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${(item.score / 5) * 100}%`,
                          background: "linear-gradient(90deg, var(--color-gold-600), var(--color-gold-400))",
                          borderRadius: 9999,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendee Feedback & Comments List */}
            <div style={{ background: "#ffffff", border: "1px solid var(--border-gold-subtle)", borderRadius: 16, padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-red-900)", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <Heart style={{ width: 16, height: 16, color: "var(--color-red-800)" }} />
                <span>ข้อเสนอแนะและความคิดเห็นจากผู้เข้าร่วม ({surveySummary?.comments.length ?? 0})</span>
              </h3>

              {!surveySummary?.comments || surveySummary.comments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 10px", color: "var(--text-light-secondary)", fontSize: 13 }}>
                  ยังไม่มีข้อเสนอแนะที่ส่งเข้ามา เมื่อมีผู้เข้าร่วมทำแบบประเมินจะแสดงที่นี่โดยอัตโนมัติ
                </div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {surveySummary.comments.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        background: "#040d0f",
                        border: "1px solid rgba(205, 163, 79, 0.2)",
                        borderRadius: 12,
                        padding: "14px 16px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: "var(--color-gold-300)" }}>
                            @{c.username || "ผู้ร่วมงาน"}
                          </span>
                          <span style={{ fontSize: 11, background: "rgba(234, 179, 8, 0.2)", color: "#fef08a", padding: "2px 8px", borderRadius: 6, fontWeight: 700 }}>
                            ⭐ {c.ratingOverall} / 5
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-light-secondary)" }}>
                          {c.createdAt ? new Date(c.createdAt).toLocaleString("th-TH") : "วันนี้"}
                        </div>
                      </div>
                      <div style={{ fontSize: 13, color: "#ffffff", lineHeight: 1.5 }}>
                        {c.comment || "(ไม่ได้ระบุข้อความเพิ่มเติม)"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* QR MODAL & PRINT PREVIEW                                                */}
        {/* ======================================================================= */}
        {selectedQrItem && (
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
              padding: 20,
            }}
          >
            <div
              className="ivory-card"
              style={{
                width: "100%",
                maxWidth: 440,
                padding: "28px 24px",
                position: "relative",
                border: "2px solid var(--color-gold-500)",
                textAlign: "center",
              }}
            >
              <span className="badge-gold" style={{ fontSize: 11, marginBottom: 8, display: "inline-block" }}>
                FATU OPEN HOUSE 2026
              </span>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--color-red-950)", margin: "0 0 4px" }}>
                {selectedQrItem.title}
              </h2>
              <div style={{ fontSize: 13, color: "var(--color-gold-700)", fontWeight: 700 }}>
                {selectedQrItem.subtitle}
              </div>

              {selectedQrItem.points && (
                <div style={{ fontSize: 16, fontWeight: 900, color: "var(--color-red-900)", marginTop: 8 }}>
                  +{selectedQrItem.points} แต้ม
                </div>
              )}

              <div
                style={{
                  margin: "16px auto",
                  padding: 12,
                  background: "#fff",
                  borderRadius: 16,
                  border: "2px solid var(--color-gold-500)",
                  display: "inline-block",
                }}
              >
                <img
                  src={selectedQrItem.qrDataUrl}
                  alt="QR Code"
                  style={{ width: 240, height: 240, display: "block" }}
                />
              </div>

              <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-dark-muted)", marginBottom: 20 }}>
                {selectedQrItem.payload}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={handlePrint}
                  className="button-imperial-red"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  <Printer style={{ width: 16, height: 16 }} />
                  พิมพ์ป้ายตั้งจุดเช็กอิน
                </button>
                <button
                  onClick={() => setSelectedQrItem(null)}
                  className="button-gold-outline"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminAccess>
  );
}
