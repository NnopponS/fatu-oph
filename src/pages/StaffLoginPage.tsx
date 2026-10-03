import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, User, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { TopHeader } from "@/components/TopHeader";
import { ThemedLoading } from "@/components/ThemedLoading";
import { useAuth } from "@/contexts/AuthContext";

export const StaffLoginPage: React.FC = () => {
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
      const authProfile = await login(username, password);
      navigate(authProfile.role === "staff_pending" ? "/staff/pending" : "/staff/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "ชื่อผู้ใช้หรือรหัสผ่านเจ้าหน้าที่ไม่ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-viewport">
      <TopHeader title="OPH STAFF" />

      <div className="chinese-hero">
        <div style={{ display: "inline-grid", placeItems: "center", width: 50, height: 50, borderRadius: "50%", background: "#fef3c7", border: "1.5px solid var(--color-gold-500)", margin: "0 auto 12px" }}>
          <Shield style={{ width: 26, height: 26, color: "var(--color-gold-700)" }} />
        </div>
        <h1 className="chinese-hero-title" style={{ fontSize: 24 }}>ระบบเจ้าหน้าที่ OPH</h1>
        <div className="chinese-hero-subtitle">STAFF PORTAL</div>
        <p className="chinese-hero-desc">สำหรับทีมงานและผู้ปฏิบัติการประจำจุดกิจกรรม</p>
      </div>

      <div className="ivory-card">
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-red-900)", margin: 0 }}>
            เข้าสู่ระบบ Staff
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-dark-secondary)", marginTop: 4 }}>
            ใช้ชื่อผู้ใช้เจ้าหน้าที่เพื่อเข้าใช้งานระบบ
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
          <div className="chinese-form-group">
            <label className="chinese-form-label">ชื่อผู้ใช้เจ้าหน้าที่</label>
            <div className="chinese-input-wrapper">
              <User className="chinese-input-icon" />
              <input
                type="text"
                required
                placeholder="Staff Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="chinese-input"
              />
            </div>
          </div>

          <div className="chinese-form-group">
            <label className="chinese-form-label">รหัสผ่าน</label>
            <div className="chinese-input-wrapper">
              <Lock className="chinese-input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Staff Password"
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

          <button
            type="submit"
            disabled={loading}
            className="chinese-btn-primary"
            style={{ marginTop: 20 }}
          >
            {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบเจ้าหน้าที่ →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--border-gold-subtle)" }}>
          <span style={{ fontSize: 13, color: "var(--text-dark-muted)" }}>เป็นเจ้าหน้าที่ใหม่? </span>
          <Link
            to="/staff/register"
            style={{ fontSize: 13, color: "var(--color-red-800)", fontWeight: 700, textDecoration: "underline" }}
          >
            ลงทะเบียนเจ้าหน้าที่ที่นี่
          </Link>
        </div>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Link
            to="/login"
            style={{ fontSize: 12, color: "var(--text-dark-secondary)", textDecoration: "none" }}
          >
            ← กลับสู่หน้าเข้าสู่ระบบผู้เข้าร่วม
          </Link>
        </div>
      </div>

      {loading && <ThemedLoading fullscreen message="กำลังเข้าสู่ระบบ Staff..." />}
    </div>
  );
};
