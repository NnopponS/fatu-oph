import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, School, GraduationCap, Phone, Mail, Lock, Eye, EyeOff, BookOpen, AlertCircle } from "lucide-react";
import { TopHeader } from "@/components/TopHeader";
import { ThemedLoading } from "@/components/ThemedLoading";
import { checkUsername } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";
import { readRealtime, realtimePaths } from "@/services/realtime";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("มัธยมศึกษาปีที่ 5 (ม.5)");
  const [academicTrack, setAcademicTrack] = useState("วิทย์–คณิต");
  const [academicTrackOther, setAcademicTrackOther] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [consent, setConsent] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState<{ checked: boolean; available: boolean; msg?: string }>({
    checked: false,
    available: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationOpen, setRegistrationOpen] = useState(true);

  // Dynamic config loaded from Realtime Database if available
  const [tracks, setTracks] = useState<Array<{ id: string; label: string }>>([
    { id: "sci-math", label: "วิทย์–คณิต" },
    { id: "arts-math", label: "ศิลป์–คำนวณ" },
    { id: "arts-lang", label: "ศิลป์–ภาษา" },
    { id: "arts-general", label: "ศิลป์–สังคม / ทั่วไป" },
    { id: "vocational", label: "อาชีวศึกษา / ปวช." },
    { id: "other", label: "อื่น ๆ" },
  ]);

  const [gradeOptions, setGradeOptions] = useState<string[]>([
    "ประถมต้น (ป.1 - ป.3)",
    "ประถมปลาย (ป.4 - ป.6)",
    "มัธยมศึกษาปีที่ 1 (ม.1)",
    "มัธยมศึกษาปีที่ 2 (ม.2)",
    "มัธยมศึกษาปีที่ 3 (ม.3)",
    "มัธยมศึกษาปีที่ 4 (ม.4)",
    "มัธยมศึกษาปีที่ 5 (ม.5)",
    "มัธยมศึกษาปีที่ 6 (ม.6)",
    "ประกาศนียบัตรวิชาชีพ (ปวช.)",
    "ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)",
    "บุคคลทั่วไป / ผู้ปกครอง / ครู",
  ]);

  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await readRealtime<{
          academicTracks?: Array<{ id: string; label: string }>;
          grades?: string[];
          registrationOpen?: boolean;
        }>(realtimePaths.public.registrationConfig);
        if (config?.academicTracks?.length) setTracks(config.academicTracks);
        if (config?.grades?.length) setGradeOptions(config.grades);
        if (config?.registrationOpen === false) setRegistrationOpen(false);
      } catch {
        // Fallback to defaults
      }
    }
    loadConfig();
  }, []);

  // Debounced username availability check
  useEffect(() => {
    if (!username || username.trim().length < 3) {
      setUsernameStatus({ checked: false, available: true });
      return;
    }

    const timer = setTimeout(async () => {
      const res = await checkUsername(username);
      setUsernameStatus({
        checked: true,
        available: res.available,
        msg: res.available ? "ชื่อผู้ใช้นี้สามารถใช้งานได้" : (res.reason || "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว"),
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!registrationOpen) {
      setError("ขณะนี้ปิดรับลงทะเบียน กรุณาติดตามประกาศจากผู้จัดงาน");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    if (!consent) {
      setError("กรุณายอมรับข้อกำหนดและเงื่อนไข");
      return;
    }

    if (usernameStatus.checked && !usernameStatus.available) {
      setError("กรุณาเลือกชื่อผู้ใช้อื่นที่ยังว่างอยู่");
      return;
    }

    const isOtherTrack = academicTrack === "อื่น ๆ" || academicTrack.toLowerCase().includes("other");
    if (isOtherTrack && !academicTrackOther.trim()) {
      setError("กรุณาระบุสายการเรียนในช่องที่ระบุ");
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName,
        lastName,
        school,
        grade,
        academicTrack,
        academicTrackOther: isOtherTrack ? academicTrackOther.trim() : undefined,
        phone,
        email,
        username,
        password,
        consent: true,
      });
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลงทะเบียน");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-viewport">
      <TopHeader title="OPH" />

      {/* Hero Section */}
      <div className="chinese-hero">
        <div className="chinese-hero-clouds" />
        <span className="chinese-hero-tagline">ยินดีต้อนรับสู่</span>
        <h1 className="chinese-hero-title">ตะลุยแดน มังกร</h1>
        <div className="chinese-hero-subtitle">OPEN HOUSE 2026</div>
        <p className="chinese-hero-desc">ค้นพบ เรียนรู้ เติบโต ไปด้วยกันที่ OPH</p>
      </div>

      {/* Segmented Auth Switch */}
      <div className="segmented-auth-switch">
        <Link to="/login" className="auth-switch-btn">
          เข้าสู่ระบบ
        </Link>
        <div className="auth-switch-btn active">ลงทะเบียน</div>
      </div>

      {/* Main Ivory Content Card */}
      <div className="ivory-card">
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--color-red-900)", margin: 0 }}>
            เริ่มต้นเส้นทางของคุณ
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-dark-secondary)", marginTop: 4 }}>
            สมัครสมาชิกเพื่อร่วมตะลุยแดนมังกรกับ OPH
          </p>
        </div>

        {!registrationOpen && (
          <div style={{ padding: "12px 14px", backgroundColor: "#fff7ed", border: "1px solid #fdba74", borderRadius: 10, color: "#9a3412", fontSize: 13, marginBottom: 16 }}>
            ขณะนี้ปิดรับลงทะเบียน ผู้ที่มีบัญชีแล้วสามารถเข้าสู่ระบบได้ตามปกติ
          </div>
        )}

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 10,
              color: "#991b1b",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            <AlertCircle style={{ width: 18, height: 18, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* First Name & Last Name */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="chinese-form-group">
              <label className="chinese-form-label">ชื่อ</label>
              <div className="chinese-input-wrapper">
                <User className="chinese-input-icon" />
                <input
                  type="text"
                  required
                  placeholder="ชื่อจริง"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="chinese-input"
                />
              </div>
            </div>

            <div className="chinese-form-group">
              <label className="chinese-form-label">นามสกุล</label>
              <div className="chinese-input-wrapper">
                <input
                  type="text"
                  required
                  placeholder="นามสกุล"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="chinese-input"
                  style={{ paddingLeft: 14 }}
                />
              </div>
            </div>
          </div>

          {/* School */}
          <div className="chinese-form-group">
            <label className="chinese-form-label">โรงเรียน</label>
            <div className="chinese-input-wrapper">
              <School className="chinese-input-icon" />
              <input
                type="text"
                required
                placeholder="ชื่อโรงเรียน หรือสถาบันการศึกษา"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="chinese-input"
              />
            </div>
          </div>

          {/* Grade & Academic Track */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="chinese-form-group">
              <label className="chinese-form-label">ระดับชั้น</label>
              <div className="chinese-input-wrapper">
                <GraduationCap className="chinese-input-icon" />
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="chinese-select"
                >
                  {gradeOptions.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="chinese-form-group">
              <label className="chinese-form-label">สายการเรียน</label>
              <div className="chinese-input-wrapper">
                <BookOpen className="chinese-input-icon" />
                <select
                  value={academicTrack}
                  onChange={(e) => setAcademicTrack(e.target.value)}
                  className="chinese-select"
                >
                  {tracks.map((t) => (
                    <option key={t.id} value={t.label}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Conditional Academic Track Other input */}
          {(academicTrack === "อื่น ๆ" || academicTrack.toLowerCase().includes("other")) && (
            <div className="chinese-form-group">
              <label className="chinese-form-label">
                ระบุสายการเรียน <span style={{ color: "var(--color-red-600)" }}>*</span>
              </label>
              <div className="chinese-input-wrapper">
                <input
                  type="text"
                  required
                  placeholder="กรุณาระบุสายการเรียนของคุณ เช่น ดนตรี, คอมพิวเตอร์, กศน...."
                  value={academicTrackOther}
                  onChange={(e) => setAcademicTrackOther(e.target.value)}
                  className="chinese-input"
                  style={{ paddingLeft: 14 }}
                />
              </div>
            </div>
          )}

          {/* Phone */}
          <div className="chinese-form-group">
            <label className="chinese-form-label">เบอร์โทรศัพท์</label>
            <div className="chinese-input-wrapper">
              <Phone className="chinese-input-icon" />
              <input
                type="tel"
                required
                placeholder="08X-XXX-XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="chinese-input"
              />
            </div>
          </div>

          {/* Email (Contact & Recovery) */}
          <div className="chinese-form-group">
            <label className="chinese-form-label">
              อีเมล <span style={{ fontSize: 11, color: "var(--text-dark-muted)", fontWeight: 400 }}>(สำหรับติดต่อและกู้คืนรหัสผ่าน)</span>
            </label>
            <div className="chinese-input-wrapper">
              <Mail className="chinese-input-icon" />
              <input
                type="email"
                required
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="chinese-input"
              />
            </div>
          </div>

          {/* Username */}
          <div className="chinese-form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="chinese-form-label">ชื่อผู้ใช้ (ใช้เข้าสู่ระบบ)</label>
              {usernameStatus.checked && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: usernameStatus.available ? "#15803d" : "#b91c1c",
                  }}
                >
                  {usernameStatus.msg}
                </span>
              )}
            </div>
            <div className="chinese-input-wrapper">
              <User className="chinese-input-icon" />
              <input
                type="text"
                required
                placeholder="ตั้งชื่อผู้ใช้ภาษาอังกฤษ เช่น dragon_26"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="chinese-input"
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="chinese-form-group">
              <label className="chinese-form-label">รหัสผ่าน</label>
              <div className="chinese-input-wrapper">
                <Lock className="chinese-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="chinese-input"
                />
                <button
                  type="button"
                  className="chinese-input-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>

            <div className="chinese-form-group">
              <label className="chinese-form-label">ยืนยันรหัสผ่าน</label>
              <div className="chinese-input-wrapper">
                <Lock className="chinese-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="พิมพ์ซ้ำอีกครั้ง"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="chinese-input"
                />
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, margin: "16px 0 20px" }}>
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              style={{ marginTop: 3, accentColor: "var(--color-red-800)", width: 18, height: 18 }}
            />
            <label htmlFor="consent" style={{ fontSize: 12, color: "var(--text-dark-secondary)", lineHeight: 1.4 }}>
              ฉันยอมรับ{" "}
              <a href="#terms" style={{ color: "var(--color-red-800)", textDecoration: "underline" }}>
                ข้อกำหนดและเงื่อนไข
              </a>{" "}
              และ{" "}
              <a href="#privacy" style={{ color: "var(--color-red-800)", textDecoration: "underline" }}>
                นโยบายความเป็นส่วนตัว
              </a>{" "}
              ของ OPH
            </label>
          </div>

          {/* Primary CTA */}
          <button type="submit" disabled={loading || !registrationOpen} className="chinese-btn-primary">
            {loading ? "กำลังลงทะเบียน..." : "เริ่มต้นการเดินทาง →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <span style={{ fontSize: 13, color: "var(--text-dark-muted)" }}>มีบัญชีอยู่แล้ว? </span>
          <Link
            to="/login"
            style={{ fontSize: 13, color: "var(--color-red-800)", fontWeight: 700, textDecoration: "underline" }}
          >
            เข้าสู่ระบบ
          </Link>
        </div>

        {/* Benefits Section */}
        <div className="gold-divider">การเดินทางครั้งนี้...คุณจะได้อะไร</div>

        <div className="benefit-grid">
          <div className="benefit-card">
            <img src="/assets/animations/checkin-stamp.svg" alt="" className="benefit-icon" />
            <div className="benefit-title">สะสมตราประทับ</div>
            <div className="benefit-desc">เข้าร่วมกิจกรรม สะสมตราประทับจากดินแดนต่างๆ</div>
          </div>

          <div className="benefit-card">
            <img src="/assets/decorations/dragon-seal.svg" alt="" className="benefit-icon" />
            <div className="benefit-title">ทำภารกิจท้าทาย</div>
            <div className="benefit-desc">เรียนรู้ พัฒนา และทำภารกิจ ปลดล็อกเรื่องราว</div>
          </div>

          <div className="benefit-card">
            <img src="/assets/animations/reward-chest.svg" alt="" className="benefit-icon" />
            <div className="benefit-title">รับรางวัลพิเศษ</div>
            <div className="benefit-desc">สะสมครบตามเงื่อนไข แลกรับของรางวัลจาก OPH</div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 24, color: "var(--color-gold-600)", fontSize: 11, letterSpacing: "0.2em" }}>
          — ONE JOURNEY MANY POSSIBILITIES —
        </div>
      </div>

      {loading && <ThemedLoading fullscreen message="กำลังสร้างบัญชีผู้เดินทาง..." />}
    </div>
  );
};
