import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { TopHeader } from "@/components/TopHeader";
import { ThemedLoading } from "@/components/ThemedLoading";
import { useAuth } from "@/contexts/AuthContext";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const account = await login(username, password);
      navigate(account.role === "staff_pending" ? "/admin/pending" : ["admin", "editor", "staff", "viewer"].includes(account.role) ? "/admin" : "/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
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
        <p className="chinese-hero-desc">เข้าสู่ระบบเพื่อสำรวจภารกิจและสะสมแต้มรางวัล</p>
      </div>

      {/* Segmented Auth Switch */}
      <div className="segmented-auth-switch">
        <div className="auth-switch-btn active">เข้าสู่ระบบ</div>
        <Link to="/register" className="auth-switch-btn">
          ลงทะเบียน
        </Link>
      </div>

      {/* Main Ivory Content Card */}
      <div className="ivory-card">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--color-red-900)", margin: 0 }}>
            เข้าสู่ระบบผู้ร่วมงาน
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-dark-secondary)", marginTop: 4 }}>
            ใช้ชื่อผู้ใช้และรหัสผ่านเพื่อเริ่มการผจญภัย
          </p>
        </div>

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
          {/* Username */}
          <div className="chinese-form-group">
            <label className="chinese-form-label">ชื่อผู้ใช้</label>
            <div className="chinese-input-wrapper">
              <User className="chinese-input-icon" />
              <input
                type="text"
                required
                placeholder="ชื่อผู้ใช้ของคุณ"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="chinese-input"
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div className="chinese-form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label className="chinese-form-label">รหัสผ่าน</label>
              <Link
                to="/forgot-password"
                style={{ fontSize: 12, color: "var(--color-gold-700)", textDecoration: "none" }}
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>
            <div className="chinese-input-wrapper">
              <Lock className="chinese-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="รหัสผ่านของคุณ"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="chinese-input"
                autoComplete="current-password"
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

          {/* Primary CTA */}
          <button
            type="submit"
            disabled={loading}
            className="chinese-btn-primary"
            style={{ marginTop: 20 }}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ fontSize: 13, color: "var(--text-dark-muted)" }}>ยังไม่มีบัญชีผู้เดินทาง? </span>
          <Link
            to="/register"
            style={{ fontSize: 13, color: "var(--color-red-800)", fontWeight: 700, textDecoration: "underline" }}
          >
            ลงทะเบียนที่นี่
          </Link>
        </div>

        {/* Staff portal shortcut */}
        <div style={{ textAlign: "center", marginTop: 28, paddingTop: 16, borderTop: "1px dashed rgba(205, 163, 79, 0.3)" }}>
          <span style={{ fontSize: 12, color: "var(--text-dark-muted)" }}>สำหรับเจ้าหน้าที่และสตาฟ: </span>
          <Link
            to="/admin/login"
            style={{ fontSize: 12, color: "var(--color-gold-700)", fontWeight: 600, textDecoration: "none" }}
          >
            เข้าสู่ระบบ Staff →
          </Link>
        </div>

        {/* Benefits Section */}
        <div className="gold-divider" style={{ marginTop: 32 }}>
          สิทธิประโยชน์ผู้เข้าร่วม
        </div>

        <div className="benefit-grid">
          <div className="benefit-card">
            <img src="/assets/animations/checkin-stamp.svg" alt="" className="benefit-icon" />
            <div className="benefit-title">สะสมตราประทับ</div>
            <div className="benefit-desc">เช็กอิน 4 ดินแดนรับแต้มสะสม</div>
          </div>

          <div className="benefit-card">
            <img src="/assets/decorations/dragon-seal.svg" alt="" className="benefit-icon" />
            <div className="benefit-title">บันทึกเส้นทาง</div>
            <div className="benefit-desc">ตรวจดูประวัติการร่วมกิจกรรม</div>
          </div>

          <div className="benefit-card">
            <img src="/assets/animations/reward-chest.svg" alt="" className="benefit-icon" />
            <div className="benefit-title">แลกของรางวัล</div>
            <div className="benefit-desc">รับของที่ระลึกสุดพิเศษ</div>
          </div>
        </div>
      </div>

      {loading && <ThemedLoading fullscreen message="กำลังตรวจสอบข้อมูล..." />}
    </div>
  );
};
