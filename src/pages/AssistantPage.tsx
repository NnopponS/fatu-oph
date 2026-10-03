import React, { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Search,
  MessageSquare,
  Send,
  HelpCircle,
  ArrowRight,
  Compass,
} from "lucide-react";
import { askAssistant } from "@/services/api";

export function AssistantPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [links, setLinks] = useState<Array<{ label: string; href: string }>>([]);
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    "โรงละครมีกิจกรรมอะไรบ้าง",
    "กล่องสุ่มสวรรค์ต้องทำอย่างไรถึงจะได้สิทธิ์",
    "จุดแลกของรางวัลอยู่ที่ไหน",
    "คณะศิลปกรรมศาสตร์ มธ. มีกี่สาขา",
  ];

  async function handleAsk(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setAnswer("");
    setLinks([]);

    try {
      const result = await askAssistant(q.trim());
      setAnswer(result.answer);
      setLinks(result.links || []);
    } catch {
      setAnswer("ขออภัย ระบบไม่สามารถค้นหาคำตอบได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง หรือดูที่หน้า FAQ");
      setLinks([{ label: "ดูหน้าคำถามที่พบบ่อย (FAQ)", href: "/faq" }]);
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void handleAsk(question);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "0 16px 40px" }}>
      {/* Hero Header */}
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
          <Sparkles style={{ width: 18, height: 18, color: "var(--color-gold-400)" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-gold-400)", letterSpacing: "0.08em" }}>
            CELESTIAL ASSISTANT
          </span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-light-primary)", margin: "0 0 6px" }}>
          ผู้ช่วยจอมยุทธ์ OPH
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-light-secondary)", margin: 0, lineHeight: 1.5 }}>
          สอบถามข้อมูลกิจกรรม ตารางเวลา กติกา และสถานที่จัดงานได้ทันที
        </p>
      </div>

      {/* Question Form */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid var(--border-gold-subtle)",
          borderRadius: 18,
          padding: "18px 20px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
        }}
      >
        <form onSubmit={submit} style={{ display: "flex", gap: 10 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search style={{ position: "absolute", left: 12, top: 12, width: 18, height: 18, color: "var(--color-gold-600)" }} />
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="พิมพ์คำถาม เช่น โรงละครมีกิจกรรมอะไร..."
              style={{
                width: "100%",
                padding: "11px 14px 11px 40px",
                background: "#fbf8f1",
                border: "1px solid rgba(205, 163, 79, 0.45)",
                borderRadius: 10,
                color: "var(--text-dark-primary)",
                fontSize: 13,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="button-gold"
            style={{
              padding: "0 18px",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            <Send style={{ width: 16, height: 16 }} />
            <span>{loading ? "กำลังค้น..." : "ถาม"}</span>
          </button>
        </form>

        {/* Suggested Quick Question Chips */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, color: "var(--color-red-900)", fontWeight: 700, marginBottom: 8 }}>
            คำถามแนะนำ:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {suggestedQuestions.map((sq, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuestion(sq);
                  void handleAsk(sq);
                }}
                style={{
                  background: "#fdf8ea",
                  border: "1px solid rgba(205, 163, 79, 0.45)",
                  borderRadius: 9999,
                  padding: "4px 12px",
                  fontSize: 11,
                  color: "var(--color-gold-700)",
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                  fontWeight: 600,
                }}
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Answer Display */}
      {answer && (
        <div
          style={{
            background: "#ffffff",
            border: "1.5px solid var(--color-gold-500)",
            borderRadius: 18,
            padding: "20px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Compass style={{ width: 18, height: 18, color: "var(--color-gold-600)" }} />
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-red-900)", margin: 0 }}>
              คำตอบจากผู้ช่วยจอมยุทธ์
            </h3>
          </div>

          <div style={{ fontSize: 13, color: "var(--text-dark-primary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
            {answer}
          </div>

          {links.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(205, 163, 79, 0.2)" }}>
              <div style={{ fontSize: 11, color: "var(--color-gold-700)", fontWeight: 700, marginBottom: 8 }}>
                ลิงก์ที่เกี่ยวข้อง:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {links.map((link, idx) => (
                  <Link
                    key={idx}
                    to={link.href}
                    className="button-gold-outline"
                    style={{
                      textDecoration: "none",
                      fontSize: 12,
                      padding: "6px 12px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span>{link.label}</span>
                    <ArrowRight style={{ width: 12, height: 12 }} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
