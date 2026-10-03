import React from "react";
import { Link } from "react-router-dom";
import {
  Info,
  Sparkles,
  School,
  Award,
  Shield,
  Heart,
  ChevronRight,
} from "lucide-react";
import { CelestialGate3D } from "@/components/CelestialGate3D";

export function AboutPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "0 16px 40px" }}>
      {/* Hero Header */}
      <div
        className="card-mythology"
        style={{
          padding: "24px 20px 16px",
          marginTop: 8,
          border: "1.5px solid var(--color-gold-500)",
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          <Info style={{ width: 18, height: 18, color: "var(--color-gold-400)" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-gold-400)", letterSpacing: "0.08em" }}>
            ABOUT FATU OPEN HOUSE
          </span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--color-red-900)", margin: "0 0 6px" }}>
          เกี่ยวกับ FATU Open House 2026
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-dark-secondary)", margin: 0, lineHeight: 1.5 }}>
          ตะลุยแดนมังกร เปิดประตูสู่โลกแห่งศิลปกรรมศาสตร์ มหาวิทยาลัยธรรมศาสตร์
        </p>

        {/* Interactive 3D Celestial Astrolabe */}
        <div style={{ position: "relative", width: 140, height: 140, margin: "12px auto 0" }}>
          <CelestialGate3D size={140} mode="gate" interactive={true} showParticles={true} />
        </div>
      </div>

      {/* Faculty Story Card */}
      <div
        className="card-mythology"
        style={{
          borderRadius: 18,
          padding: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <School style={{ width: 18, height: 18, color: "var(--color-gold-600)" }} />
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-red-900)", margin: 0 }}>
            คณะศิลปกรรมศาสตร์ มหาวิทยาลัยธรรมศาสตร์
          </h2>
        </div>

        <p style={{ fontSize: 13, color: "var(--text-dark-secondary)", lineHeight: 1.6, margin: "0 0 14px" }}>
          คณะศิลปกรรมศาสตร์ มหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต มุ่งเน้นการสร้างสรรค์บัณฑิตที่มีความเป็นเลิศทางศิลปะ ความคิดสร้างสรรค์ นวัตกรรม และจิตวิญญาณแห่งธรรมศาสตร์ที่รับใช้สังคม
        </p>

        <p style={{ fontSize: 13, color: "var(--text-dark-secondary)", lineHeight: 1.6, margin: 0 }}>
          งาน <strong>FATU Open House 2026</strong> จัดขึ้นภายใต้แนวคิด <em>"ตะลุยแดนมังกร (Chinese Mythology)"</em> เพื่อเปิดโอกาสให้นักเรียน ผู้ปกครอง และผู้สนใจ ได้สัมผัสผลงานจริง เวิร์กช็อป และหลักสูตรการศึกษาในบรรยากาศแฟนตาซีสุดสร้างสรรค์
        </p>
      </div>

      {/* The 4 Mythology Realms */}
      <div
        className="card-mythology"
        style={{
          borderRadius: 18,
          padding: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Sparkles style={{ width: 18, height: 18, color: "var(--color-gold-600)" }} />
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-red-900)", margin: 0 }}>
            4 ดินแดนศักดิ์สิทธิ์ประจำงาน
          </h2>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f0fdfa", padding: 12, borderRadius: 14, border: "1px solid #99f6e4" }}>
            <img src="/images/azure-dragon-art.jpg" alt="Azure Dragon" style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover", border: "1.5px solid #0d9488", flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: "#0f766e" }}>สวรรค์แดนมังกรฟ้า (Azure Dragon)</div>
              <div style={{ fontSize: 11, color: "var(--text-dark-secondary)", marginTop: 2 }}>ณ โรงละคร — ละครเวที การแสดง และพิธีเปิด</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#fefce8", padding: 12, borderRadius: 14, border: "1px solid #fef08a" }}>
            <img src="/images/white-tiger-art.jpg" alt="White Tiger" style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover", border: "1.5px solid #d97706", flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: "#92400e" }}>เมืองมนุษย์พยัคฆ์ขาว (White Tiger)</div>
              <div style={{ fontSize: 11, color: "var(--text-dark-secondary)", marginTop: 2 }}>ณ ตึกคณะศิลปกรรมฯ — เวิร์กช็อป และหลักสูตร</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#fdf2f8", padding: 12, borderRadius: 14, border: "1px solid #fbcfe8" }}>
            <img src="/images/nine-tailed-fox-art.jpg" alt="Nine-Tailed Fox" style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover", border: "1.5px solid #db2777", flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: "#9d174d" }}>ป่าแดนจิ้งจอกเก้าหาง (Nine-Tailed Fox)</div>
              <div style={{ fontSize: 11, color: "var(--text-dark-secondary)", marginTop: 2 }}>ณ โรงทอ — ศิลปะสิ่งทอ แฟชั่น นวัตกรรม</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#fef2f2", padding: 12, borderRadius: 14, border: "1px solid #fecaca" }}>
            <img src="/images/red-phoenix-art.jpg" alt="Red Phoenix" style={{ width: 52, height: 52, borderRadius: 12, objectFit: "cover", border: "1.5px solid #dc2626", flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: "#991b1b" }}>ถ้ำหงส์เพลิง (Red Phoenix)</div>
              <div style={{ fontSize: 11, color: "var(--text-dark-secondary)", marginTop: 2 }}>ณ ตึก SC3 — เกมสะสมแต้ม และเวทีประชันไอเดีย</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Links */}
      <div style={{ display: "flex", gap: 10 }}>
        <Link
          to="/explore"
          className="button-gold"
          style={{ flex: 1, textDecoration: "none", textAlign: "center", justifyContent: "center", fontSize: 13 }}
        >
          <span>สำรวจกิจกรรมทั้งหมด</span>
          <ChevronRight style={{ width: 16, height: 16 }} />
        </Link>
        <Link
          to="/survey"
          className="button-gold-outline"
          style={{ flex: 1, textDecoration: "none", textAlign: "center", justifyContent: "center", fontSize: 13 }}
        >
          <span>ทำแบบประเมิน (+10)</span>
          <Heart style={{ width: 14, height: 14 }} />
        </Link>
      </div>
    </div>
  );
}
