import React from "react";
import { Link } from "react-router-dom";
import {
  HelpCircle,
  Bell,
  MessageCircle,
  Phone,
  Mail,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useAnnouncements, useFaq } from "@/data/content";

export function FaqPage() {
  const faq = useFaq();
  const announcements = useAnnouncements();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "0 16px 40px" }}>
      {/* Hero Section */}
      <div
        className="card-mythology"
        style={{
          padding: "24px 20px",
          marginTop: 8,
          border: "1.5px solid var(--color-gold-500)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <HelpCircle style={{ width: 18, height: 18, color: "var(--color-gold-400)" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-gold-400)", letterSpacing: "0.08em" }}>
            FAQ & ANNOUNCEMENTS
          </span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-light-primary)", margin: "0 0 6px" }}>
          ประกาศสำคัญ & คำถามพบบ่อย
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-light-secondary)", margin: 0, lineHeight: 1.5 }}>
          รวมข้อสงสัยเกี่ยวกับการเดินทาง การเช็กอินสะสมคะแนน และการแลกของรางวัล
        </p>
      </div>

      {/* Important Announcements */}
      {announcements.items.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <Bell style={{ width: 16, height: 16, color: "var(--color-red-900)" }} />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-red-900)", margin: 0 }}>
              ประกาศล่าสุดจากกองอำนวยการ
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {announcements.items.map((item) => (
              <div
                key={item.id}
                style={{
                  background: item.level === "important" ? "#fef2f2" : "#ffffff",
                  border: item.level === "important" ? "1px solid #fca5a5" : "1px solid var(--border-gold-subtle)",
                  borderRadius: 14,
                  padding: "14px 16px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  {item.level === "important" && (
                    <span style={{ background: "#dc2626", color: "#ffffff", fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 800 }}>
                      ด่วน
                    </span>
                  )}
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: item.level === "important" ? "#991b1b" : "var(--text-dark-primary)", margin: 0 }}>
                    {item.title}
                  </h3>
                </div>
                {item.body && (
                  <p style={{ fontSize: 12, color: item.level === "important" ? "#7f1d1d" : "var(--text-dark-secondary)", margin: 0, lineHeight: 1.5 }}>
                    {item.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Accordions */}
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-red-900)", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
          <MessageCircle style={{ width: 16, height: 16, color: "var(--color-gold-600)" }} />
          <span>คำถามที่พบบ่อย (FAQ)</span>
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {faq.items.map((item) => (
            <details
              key={item.id}
              style={{
                background: "#ffffff",
                border: "1px solid var(--border-gold-subtle)",
                borderRadius: 14,
                padding: "14px 16px",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              }}
            >
              <summary
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: "var(--text-dark-primary)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  listStyle: "none",
                  userSelect: "none",
                }}
              >
                <span>{item.question}</span>
                <ChevronDown style={{ width: 16, height: 16, color: "var(--color-gold-600)", flexShrink: 0 }} />
              </summary>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-dark-secondary)",
                  margin: "10px 0 0",
                  lineHeight: 1.5,
                  paddingTop: 10,
                  borderTop: "1px solid rgba(205, 163, 79, 0.15)",
                }}
              >
                {item.answer}
              </p>
            </details>
          ))}

          {!faq.loading && faq.items.length === 0 && (
            <div style={{ textAlign: "center", padding: "30px", color: "var(--text-dark-secondary)", fontSize: 13 }}>
              ยังไม่มีคำถามที่เผยแพร่
            </div>
          )}
        </div>
      </div>

      {/* Contact & Support Section */}
      <div
        style={{
          background: "#fbf8f1",
          border: "1px solid var(--border-gold-subtle)",
          borderRadius: 16,
          padding: "18px 20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-red-900)", margin: "0 0 8px" }}>
          ติดต่อสอบถามเพิ่มเติม
        </h3>
        <p style={{ fontSize: 12, color: "var(--text-dark-secondary)", margin: "0 0 14px", lineHeight: 1.5 }}>
          หากพบปัญหาเกี่ยวกับระบบการสแกน หรือต้องการความช่วยเหลือระหว่างงาน สามารถติดต่อเจ้าหน้าที่ประจำจุด หรือกองอำนวยการกลาง
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "var(--text-dark-primary)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Phone style={{ width: 14, height: 14, color: "var(--color-gold-600)" }} />
            <span>โทรศัพท์: 02-564-4440 ต่อ 1234 (กองอำนวยการงาน Open House)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Mail style={{ width: 14, height: 14, color: "var(--color-gold-600)" }} />
            <span>อีเมล: openhouse@fineart.tu.ac.th</span>
          </div>
        </div>
      </div>
    </div>
  );
}
