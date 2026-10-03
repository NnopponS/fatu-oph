import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { TopHeader } from "@/components/TopHeader";
import { ThemedLoading } from "@/components/ThemedLoading";
import { requestPasswordReset } from "@/services/auth";

export const ForgotPasswordPage: React.FC = () => {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const resMsg = await requestPasswordReset(identifier);
      setMessage(resMsg);
      setSubmitted(true);
    } catch {
      setMessage("หากพบบัญชีที่ตรงกับข้อมูล ระบบจะส่งวิธีกู้คืนบัญชีไปยังอีเมลที่ลงทะเบียนไว้");
      setSubmitted(true);
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
        <h1 className="chinese-hero-title">กู้คืนรหัสผ่าน</h1>
        <p className="chinese-hero-desc">ระบบความปลอดภัยและกู้คืนบัญชีผู้เดินทาง</p>
      </div>

      <div className="ivory-card">
        {submitted ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                backgroundColor: "#ecfdf5",
                border: "2px solid #10b981",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 16px",
                color: "#059669",
              }}
            >
              <CheckCircle style={{ width: 32, height: 32 }} />
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-red-900)", margin: 0 }}>
              ส่งคำขอเรียบร้อยแล้ว
            </h2>

            <p style={{ fontSize: 14, color: "var(--text-dark-secondary)", marginTop: 10, lineHeight: 1.6 }}>
              {message}
            </p>

            <Link
              to="/login"
              className="chinese-btn-primary"
              style={{ marginTop: 28 }}
            >
              กลับสู่หน้าเข้าสู่ระบบ
            </Link>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-red-900)", margin: 0 }}>
                ระบุข้อมูลบัญชีของคุณ
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-dark-secondary)", marginTop: 4 }}>
                กรอกชื่อผู้ใช้ หรืออีเมลที่ลงทะเบียนไว้เพื่อรับลิงก์ตั้งรหัสผ่านใหม่
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="chinese-form-group">
                <label className="chinese-form-label">ชื่อผู้ใช้ หรือ อีเมล</label>
                <div className="chinese-input-wrapper">
                  <Mail className="chinese-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="เช่น dragon_26 หรือ student@email.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="chinese-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="chinese-btn-primary"
                style={{ marginTop: 20 }}
              >
                {loading ? "กำลังส่งคำขอ..." : "ส่งลิงก์กู้คืนรหัสผ่าน →"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Link
                to="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  color: "var(--color-gold-700)",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <ArrowLeft style={{ width: 16, height: 16 }} />
                <span>กลับสู่หน้าเข้าสู่ระบบ</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {loading && <ThemedLoading fullscreen message="กำลังส่งคำขอ..." />}
    </div>
  );
};
