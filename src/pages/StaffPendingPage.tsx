import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, ShieldCheck, RefreshCw, LogOut } from "lucide-react";
import { TopHeader } from "@/components/TopHeader";
import { useAuth } from "@/contexts/AuthContext";

export const StaffPendingPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, role, isStaff, refreshProfile, logout } = useAuth();

  useEffect(() => {
    if (isStaff && role !== "staff_pending") {
      navigate("/staff/dashboard");
    }
  }, [isStaff, role, navigate]);

  return (
    <div className="mobile-viewport">
      <TopHeader title="OPH STAFF" />

      <div className="chinese-hero">
        <div
          style={{
            display: "inline-grid",
            placeItems: "center",
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "#fef3c7",
            border: "2px solid var(--color-gold-500)",
            margin: "0 auto 12px",
          }}
        >
          <Clock style={{ width: 32, height: 32, color: "var(--color-gold-700)" }} />
        </div>
        <h1 className="chinese-hero-title" style={{ fontSize: 22 }}>รอการอนุมัติสิทธิ์ Staff</h1>
        <div className="chinese-hero-subtitle">STATUS: PENDING APPROVAL</div>
      </div>

      <div className="ivory-card">
        <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
          <span
            style={{
              display: "inline-block",
              padding: "4px 14px",
              backgroundColor: "#fef9c3",
              color: "#854d0e",
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 700,
              border: "1px solid #fde047",
              marginBottom: 16,
            }}
          >
            สถานะ: รอผู้ดูแลระบบตรวจสอบ
          </span>

          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--color-red-900)", margin: 0 }}>
            คำขอของคุณถูกบันทึกเรียบร้อยแล้ว
          </h2>

          <p style={{ fontSize: 13, color: "var(--text-dark-secondary)", marginTop: 10, lineHeight: 1.6 }}>
            บัญชีของคุณได้รับการลงทะเบียนในระบบเจ้าหน้าที่แล้ว แต่ยังไม่สามารถเข้าถึงเครื่องมือจัดการหน้างานได้จนกว่าจะได้รับการอนุมัติจากผู้ดูแลระบบหลัก
          </p>
        </div>

        {profile && (
          <div className="ivory-card-inner" style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-gold-700)", marginBottom: 12 }}>
              ข้อมูลการสมัครของคุณ
            </div>
            <div style={{ display: "grid", gap: 8, fontSize: 13 }}>
              <div>
                <strong style={{ color: "var(--text-dark-primary)" }}>ชื่อ-นามสกุล: </strong>
                <span style={{ color: "var(--text-dark-secondary)" }}>{profile.displayName}</span>
              </div>
              <div>
                <strong style={{ color: "var(--text-dark-primary)" }}>ชื่อผู้ใช้: </strong>
                <span style={{ color: "var(--text-dark-secondary)" }}>{profile.username}</span>
              </div>
              <div>
                <strong style={{ color: "var(--text-dark-primary)" }}>สถานะบัญชี: </strong>
                <span style={{ color: "#854d0e", fontWeight: 600 }}>staff_pending (รออนุมัติ)</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
          <button
            onClick={() => refreshProfile()}
            className="button-imperial-red"
          >
            <RefreshCw style={{ width: 18, height: 18 }} />
            <span>ตรวจสอบสถานะอีกครั้ง</span>
          </button>

          <button
            onClick={async () => {
              await logout();
              navigate("/staff/login");
            }}
            className="chinese-btn-secondary"
          >
            <LogOut style={{ width: 16, height: 16 }} />
            <span>ออกจากระบบ</span>
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link to="/" style={{ fontSize: 12, color: "var(--color-gold-700)", textDecoration: "none" }}>
            ← กลับสู่หน้าหลักของงาน OPH
          </Link>
        </div>
      </div>
    </div>
  );
};
