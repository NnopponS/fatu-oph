import React, { useEffect, useState, type FormEvent } from "react";
import {
  Sliders,
  Settings,
  Users,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { siteSchema, useSite } from "@/data/content";
import { AdminAccess, useAdminSession } from "@/pages/AdminPage";
import { adminAction } from "@/services/api";
import { readRealtime, realtimePaths, setRealtime } from "@/services/realtime";
import { rewardPolicy } from "@/lib/reward-policy";

interface StaffRow {
  uid: string;
  email: string;
  role: "admin" | "editor" | "staff" | "viewer";
  disabled: boolean;
}

export function AdminSettingsPage() {
  const session = useAdminSession();
  const site = useSite();

  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Site Settings Form
  const [siteName, setSiteName] = useState("FATU OPEN HOUSE 2026");
  const [theme, setTheme] = useState("ตะลุยแดนมังกร");
  const [faculty, setFaculty] = useState("คณะศิลปกรรมศาสตร์");
  const [description, setDescription] = useState("");
  const [dateLabel, setDateLabel] = useState("21-22 มีนาคม 2026");
  const [locationLabel, setLocationLabel] = useState("คณะศิลปกรรมศาสตร์ มธ. รังสิต");
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [rules, setRules] = useState(() => rewardPolicy());

  // Registration Options Customizer
  const [tracks, setTracks] = useState<Array<{ id: string; label: string }>>([
    { id: "sci-math", label: "วิทย์–คณิต" },
    { id: "arts-math", label: "ศิลป์–คำนวณ" },
    { id: "arts-lang", label: "ศิลป์–ภาษา" },
    { id: "vocational", label: "อาชีวศึกษา" },
    { id: "other", label: "อื่น ๆ" },
  ]);
  const [newTrackLabel, setNewTrackLabel] = useState("");

  const [grades, setGrades] = useState<string[]>([
    "มัธยมศึกษาปีที่ 1 - 3",
    "มัธยมศึกษาปีที่ 4",
    "มัธยมศึกษาปีที่ 5",
    "มัธยมศึกษาปีที่ 6",
    "ปวช. / ปวส.",
    "บุคคลทั่วไป",
  ]);
  const [newGradeLabel, setNewGradeLabel] = useState("");

  // Staff Roles Management
  const [roles, setRoles] = useState<StaffRow[]>([]);

  useEffect(() => {
    if (site.item) {
      setSiteName(site.item.name || "FATU OPEN HOUSE 2026");
      setTheme(site.item.theme || "ตะลุยแดนมังกร");
      setFaculty(site.item.faculty || "คณะศิลปกรรมศาสตร์");
      setDescription(site.item.description || "");
      setDateLabel(site.item.dateLabel || "21-22 มีนาคม 2026");
      setLocationLabel(site.item.locationLabel || "คณะศิลปกรรมศาสตร์ มธ. รังสิต");
      setRegistrationOpen(site.item.registrationOpen !== false);
      setRules(rewardPolicy(site.item.rewardPolicy));
    }
  }, [site.item]);

  useEffect(() => {
    async function loadRegConfig() {
      try {
        const config = await readRealtime<{
          academicTracks?: Array<{ id: string; label: string }>;
          grades?: string[];
        }>(realtimePaths.public.registrationConfig);
        if (config?.academicTracks?.length) setTracks(config.academicTracks);
        if (config?.grades?.length) setGrades(config.grades);
      } catch (err) {
        console.error("Could not read registration config:", err);
      }
    }
    void loadRegConfig();
  }, []);

  const refreshRoles = React.useCallback(async () => {
    if (session.role !== "admin") return;
    try {
      const res = await adminAction<{ roles: StaffRow[] }>("roles");
      setRoles(res.roles || []);
    } catch {
      // Ignore
    }
  }, [session.role]);

  useEffect(() => {
    void refreshRoles();
  }, [refreshRoles]);

  // Save Site Config
  const handleSaveSite = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await adminAction("saveSiteConfig", {
        name: siteName,
        eventYear: 2026,
        theme,
        faculty,
        description,
        dateLabel,
        locationLabel,
        registrationOpen,
        rewardPolicy: rules,
      });
      setMessage("บันทึกการตั้งค่าเว็บไซต์เรียบร้อยแล้ว");
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกเว็บไซต์ไม่สำเร็จ");
    }
  };

  // Save Registration Options Config
  const handleSaveRegistrationConfig = async () => {
    setMessage("");
    setError("");

    try {
      await adminAction("saveRegistrationConfig", {
        academicTracks: tracks,
        grades,
        registrationOpen,
      });
      setMessage("บันทึกตัวเลือกแบบฟอร์มลงทะเบียนเรียบร้อยแล้ว");
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกตัวเลือกไม่สำเร็จ");
    }
  };

  // Add / Remove Track
  const handleAddTrack = () => {
    if (!newTrackLabel.trim()) return;
    const id = "track_" + Date.now();
    setTracks([...tracks, { id, label: newTrackLabel.trim() }]);
    setNewTrackLabel("");
  };

  const handleRemoveTrack = (index: number) => {
    setTracks(tracks.filter((_, i) => i !== index));
  };

  // Add / Remove Grade
  const handleAddGrade = () => {
    if (!newGradeLabel.trim()) return;
    setGrades([...grades, newGradeLabel.trim()]);
    setNewGradeLabel("");
  };

  const handleRemoveGrade = (index: number) => {
    setGrades(grades.filter((_, i) => i !== index));
  };

  // Change staff role
  const handleSetRole = async (uid: string, role: StaffRow["role"]) => {
    try {
      await adminAction("setRole", { uid, role });
      setMessage("อัปเดตสิทธิ์สำเร็จ");
      await refreshRoles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "อัปเดตสิทธิ์ไม่สำเร็จ");
    }
  };

  return (
    <AdminAccess roles={["admin", "editor"]}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "20px" }}>
        <div>
          <span className="section-kicker">CUSTOMIZER & CMS (Ref 10)</span>
          <h1 className="admin-page-title" style={{ margin: "4px 0 6px" }}>
            ปรับแต่งธีม ข้อมูลงาน และแบบฟอร์มลงทะเบียน
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-light-secondary)", margin: 0 }}>
            แก้ไขข้อมูลหน้าเว็บ ข้อความประชาสัมพันธ์ และตัวเลือกสายการเรียน/ระดับชั้นแบบเรียลไทม์
          </p>
        </div>

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

        <div className="admin-settings-grid">
          {/* ======================================================================= */}
          {/* SECTION 1: SITE & HERO CONTENT CMS                                      */}
          {/* ======================================================================= */}
          <div className="card-mythology" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Settings style={{ width: 18, height: 18, color: "var(--color-gold-400)" }} />
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-light-primary)", margin: 0 }}>
                ข้อมูลหลักและส่วนหัวเว็บไซต์ (Hero CMS)
              </h2>
            </div>

            <form onSubmit={handleSaveSite} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <fieldset className="reward-settings"><legend>กติกาคะแนนและรางวัล</legend><p>ค่าเริ่มต้นอ้างอิงระบบปี 2025 · กิจกรรมแรกที่ให้คะแนนในแต่ละสถานที่ · สุ่ม 1 ครั้งต่อคน</p>
                <label htmlFor="rule-venue">แต้มต่อสถานที่ / กิจกรรมแรก</label><input id="rule-venue" type="number" min="0" max="100000" value={rules.pointsPerVenue} onChange={e => setRules({...rules,pointsPerVenue:Number(e.target.value)})} required />
                <label htmlFor="rule-survey">โบนัสแบบประเมิน (ครั้งเดียว)</label><input id="rule-survey" type="number" min="0" max="100000" value={rules.surveyPoints} onChange={e => setRules({...rules,surveyPoints:Number(e.target.value)})} required />
                <label htmlFor="rule-threshold">แต้มที่ใช้ปลดล็อกสิทธิ์สุ่ม</label><input id="rule-threshold" type="number" min="0" max="100000" value={rules.pointsRequired} onChange={e => setRules({...rules,pointsRequired:Number(e.target.value)})} required />
                <label className="reward-setting-check"><input type="checkbox" checked={rules.pointExchangeEnabled} onChange={e => setRules({...rules,pointExchangeEnabled:e.target.checked})} />เปิดการแลกรางวัลด้วยแต้มเพิ่มเติม</label><small>เมื่อเปิด ระบบแลกด้วยแต้มจะเป็นอีกวิธีรับรางวัลและหักแต้มตามรายการ การสุ่มใช้คะแนนเป็นเงื่อนไขและไม่หักแต้ม</small>
              </fieldset>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-dark-primary)" }}>ชื่องานหลัก</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "#fbf8f1",
                    border: "1px solid rgba(205, 163, 79, 0.45)",
                    color: "var(--text-dark-primary)",
                    fontSize: 13,
                    marginTop: 4,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-dark-primary)" }}>ธีมงานประจำปี (Theme)</label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "#fbf8f1",
                    border: "1px solid rgba(205, 163, 79, 0.45)",
                    color: "var(--text-dark-primary)",
                    fontSize: 13,
                    marginTop: 4,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-dark-primary)" }}>คณะ / หน่วยงาน</label>
                <input
                  type="text"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "#fbf8f1",
                    border: "1px solid rgba(205, 163, 79, 0.45)",
                    color: "var(--text-dark-primary)",
                    fontSize: 13,
                    marginTop: 4,
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-dark-primary)" }}>คำบรรยายโปรโมท</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: "#fbf8f1",
                    border: "1px solid rgba(205, 163, 79, 0.45)",
                    color: "var(--text-dark-primary)",
                    fontSize: 13,
                    marginTop: 4,
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-dark-primary)" }}>วันที่จัดงาน</label>
                  <input
                    type="text"
                    value={dateLabel}
                    onChange={(e) => setDateLabel(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: "#fbf8f1",
                      border: "1px solid rgba(205, 163, 79, 0.45)",
                      color: "var(--text-dark-primary)",
                      fontSize: 13,
                      marginTop: 4,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text-dark-primary)" }}>สถานที่จัดงาน</label>
                  <input
                    type="text"
                    value={locationLabel}
                    onChange={(e) => setLocationLabel(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: "#fbf8f1",
                      border: "1px solid rgba(205, 163, 79, 0.45)",
                      color: "var(--text-dark-primary)",
                      fontSize: 13,
                      marginTop: 4,
                    }}
                  />
                </div>
              </div>

              {/* Registration Toggle */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#fdf8ea",
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--border-gold-subtle)",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-red-900)" }}>
                    เปิดรับลงทะเบียนผู้เข้าร่วมงาน
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-dark-secondary)" }}>
                    {registrationOpen ? "เปิดให้สร้างบัญชีผู้เข้าร่วมใหม่ได้ตามปกติ" : "ปิดรับการลงทะเบียนชั่วคราว"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setRegistrationOpen(!registrationOpen)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: registrationOpen ? "#16a34a" : "var(--text-dark-muted)",
                  }}
                >
                  {registrationOpen ? <ToggleRight style={{ width: 36, height: 36 }} /> : <ToggleLeft style={{ width: 36, height: 36 }} />}
                </button>
              </div>

              <button type="submit" className="button-imperial-red" style={{ justifyContent: "center", marginTop: 8 }}>
                <Save style={{ width: 16, height: 16 }} />
                บันทึกการตั้งค่าเว็บไซต์
              </button>
            </form>
          </div>

          {/* ======================================================================= */}
          {/* SECTION 2: REGISTRATION FORM OPTIONS CUSTOMIZER                         */}
          {/* ======================================================================= */}
          <div className="card-mythology" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Sliders style={{ width: 18, height: 18, color: "var(--color-gold-600)" }} />
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-red-900)", margin: 0 }}>
                ปรับแต่งตัวเลือกฟอร์มลงทะเบียน
              </h2>
            </div>

            {/* Academic Tracks Customizer */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dark-primary)" }}>
                แผนการเรียน / สายการเรียน (Academic Tracks)
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 0" }}>
                {tracks.map((t, idx) => (
                  <span
                    key={t.id || idx}
                    style={{
                      background: "#fef3c7",
                      border: "1px solid var(--color-gold-500)",
                      borderRadius: 14,
                      padding: "4px 10px",
                      fontSize: 12,
                      color: "var(--color-gold-700)",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {t.label}
                    <button
                      type="button"
                      onClick={() => handleRemoveTrack(idx)}
                      style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", padding: 0 }}
                    >
                      <Trash2 style={{ width: 12, height: 12 }} />
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="เพิ่มสายการเรียนใหม่..."
                  value={newTrackLabel}
                  onChange={(e) => setNewTrackLabel(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "6px 10px",
                    borderRadius: 6,
                    background: "#fbf8f1",
                    border: "1px solid rgba(205, 163, 79, 0.45)",
                    color: "var(--text-dark-primary)",
                    fontSize: 12,
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTrack}
                  className="button-gold-outline"
                  style={{ padding: "6px 12px", fontSize: 12 }}
                >
                  <Plus style={{ width: 14, height: 14 }} /> เพิ่ม
                </button>
              </div>
            </div>

            {/* Grade Levels Customizer */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dark-primary)" }}>
                ระดับชั้นการศึกษา (Grade Levels)
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 0" }}>
                {grades.map((g, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: "#fef3c7",
                      border: "1px solid var(--color-gold-500)",
                      borderRadius: 14,
                      padding: "4px 10px",
                      fontSize: 12,
                      color: "var(--color-gold-700)",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {g}
                    <button
                      type="button"
                      onClick={() => handleRemoveGrade(idx)}
                      style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", padding: 0 }}
                    >
                      <Trash2 style={{ width: 12, height: 12 }} />
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  placeholder="เพิ่มระดับชั้นใหม่..."
                  value={newGradeLabel}
                  onChange={(e) => setNewGradeLabel(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "6px 10px",
                    borderRadius: 6,
                    background: "#fbf8f1",
                    border: "1px solid rgba(205, 163, 79, 0.45)",
                    color: "var(--text-dark-primary)",
                    fontSize: 12,
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddGrade}
                  className="button-gold-outline"
                  style={{ padding: "6px 12px", fontSize: 12 }}
                >
                  <Plus style={{ width: 14, height: 14 }} /> เพิ่ม
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveRegistrationConfig}
              className="button-imperial-red"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Save style={{ width: 16, height: 16 }} />
              บันทึกตัวเลือกฟอร์มลงทะเบียน
            </button>
          </div>
        </div>
      </div>
    </AdminAccess>
  );
}
