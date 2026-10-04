import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, User, Mail, Phone, Lock, Eye, EyeOff, Briefcase, AlertCircle } from "lucide-react";
import { TopHeader } from "@/components/TopHeader";
import { ThemedLoading } from "@/components/ThemedLoading";
import { useAuth } from "@/contexts/AuthContext";

export const StaffRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerStaff } = useAuth();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("จุดเช็กอินและกิจกรรม");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    if (password.length < 8) {
      setError("รหัสผ่านเจ้าหน้าที่ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    setLoading(true);
    try {
      await registerStaff({
        fullName,
        username,
        email,
        phone,
        password,
        department,
      });
      navigate("/admin/pending");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลงทะเบียนเจ้าหน้าที่");
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
        <h1 className="chinese-hero-title" style={{ fontSize: 22 }}>ลงทะเบียนเจ้าหน้าที่</h1>
        <p className="chinese-hero-desc">คำขอจะต้องได้รับการอนุมัติจากผู้ดูแลระบบก่อนเริ่มปฏิบัติงาน</p>
      </div>

      <div className="ivory-card">
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-red-900)", margin: 0 }}>
            กรอกข้อมูลสตาฟ
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-dark-secondary)", marginTop: 4 }}>
            กรุณาใช้ข้อมูลจริงเพื่อการตรวจสอบและติดต่อประสานงาน
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
          {/* Full Name */}
          <div className="chinese-form-group">
            <label className="chinese-form-label">ชื่อ - นามสกุลจริง</label>
            <div className="chinese-input-wrapper">
              <User className="chinese-input-icon" />
              <input
                type="text"
                required
                placeholder="เช่น นาย สมชาย ใจดี"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="chinese-input"
              />
            </div>
          </div>

          {/* Username */}
          <div className="chinese-form-group">
            <label className="chinese-form-label">ชื่อผู้ใช้ (Staff Username)</label>
            <div className="chinese-input-wrapper">
              <User className="chinese-input-icon" />
              <input
                type="text"
                required
                placeholder="เช่น staff_somchai (3-30 ตัวอักษร a-z, 0-9)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="chinese-input"
              />
            </div>
          </div>

          {/* Email */}
          <div className="chinese-form-group">
            <label className="chinese-form-label">อีเมลสำหรับติดต่อ</label>
            <div className="chinese-input-wrapper">
              <Mail className="chinese-input-icon" />
              <input
                type="email"
                required
                placeholder="staff@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="chinese-input"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="chinese-form-group">
            <label className="chinese-form-label">เบอร์โทรศัพท์ที่ติดต่อได้</label>
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

          {/* Department */}
          <div className="chinese-form-group">
            <label className="chinese-form-label">ฝ่าย / จุดประจำการ</label>
            <div className="chinese-input-wrapper">
              <Briefcase className="chinese-input-icon" />
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="chinese-select"
              >
                <option value="จุดเช็กอินและกิจกรรม">จุดเช็กอินและกิจกรรม</option>
                <option value="โรงละคร (แดนมังกรฟ้า)">โรงละคร (แดนมังกรฟ้า)</option>
                <option value="ตึกคณะ (เมืองพยัคฆ์ขาว)">ตึกคณะ (เมืองพยัคฆ์ขาว)</option>
                <option value="โรงทอ (ป่าจิ้งจอกเก้าหาง)">โรงทอ (ป่าจิ้งจอกเก้าหาง)</option>
                <option value="ตึก SC3 (ถ้ำหงส์แดง)">ตึก SC3 (ถ้ำหงส์แดง)</option>
                <option value="จุดแลกของรางวัล">จุดแลกของรางวัล</option>
                <option value="ส่วนกลาง / ประชาสัมพันธ์">ส่วนกลาง / ประชาสัมพันธ์</option>
              </select>
            </div>
          </div>

          {/* Password & Confirm */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="chinese-form-group">
              <label className="chinese-form-label">รหัสผ่าน</label>
              <div className="chinese-input-wrapper">
                <Lock className="chinese-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="≥ 8 ตัวอักษร"
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

          <button
            type="submit"
            disabled={loading}
            className="chinese-btn-primary"
            style={{ marginTop: 20 }}
          >
            {loading ? "กำลังส่งข้อมูล..." : "ส่งคำขอลงทะเบียนเจ้าหน้าที่ →"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ fontSize: 13, color: "var(--text-dark-muted)" }}>มีบัญชีเจ้าหน้าที่แล้ว? </span>
          <Link
            to="/admin/login"
            style={{ fontSize: 13, color: "var(--color-red-800)", fontWeight: 700, textDecoration: "underline" }}
          >
            เข้าสู่ระบบ Staff
          </Link>
        </div>
      </div>

      {loading && <ThemedLoading fullscreen message="กำลังบันทึกข้อมูลสตาฟ..." />}
    </div>
  );
};
