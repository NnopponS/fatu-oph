import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Star,
  MessageSquare,
  Award,
  CheckCircle,
  AlertCircle,
  Send,
  Heart,
  HelpCircle,
} from "lucide-react";
import { TopHeader } from "@/components/TopHeader";
import { BottomNavBar } from "@/components/BottomNavBar";
import { ThemedLoading } from "@/components/ThemedLoading";
import { useAuth } from "@/contexts/AuthContext";

export const SurveyPage: React.FC = () => {
  const { firebaseUser, refreshProfile } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Ratings 1 to 5
  const [ratingOverall, setRatingOverall] = useState<number>(5);
  const [ratingVenues, setRatingVenues] = useState<number>(5);
  const [ratingActivities, setRatingActivities] = useState<number>(5);
  const [ratingStaff, setRatingStaff] = useState<number>(5);
  const [comment, setComment] = useState<string>("");

  useEffect(() => {
    async function checkSurvey() {
      try {
        setLoading(true);
        const token = firebaseUser ? await firebaseUser.getIdToken() : "";
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch("/api/survey", { headers });
        const data = await res.json();
        if (res.ok) {
          setCompleted(Boolean(data.completed));
          setCompletedAt(data.completedAt || null);
        }
      } catch (err: unknown) {
        console.warn("Survey check error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (firebaseUser) {
      void checkSurvey();
    } else {
      setLoading(false);
    }
  }, [firebaseUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    setSubmitting(true);
    setError(null);

    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "submit",
          ratingOverall,
          ratingVenues,
          ratingActivities,
          ratingStaff,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ไม่สามารถส่งแบบประเมินได้");
      }

      setCompleted(true);
      setCompletedAt(data.completedAt || new Date().toISOString());
      setSuccessMessage(data.message || "ส่งแบบประเมินสำเร็จและได้รับคะแนนโบนัส +10 แต้ม!");
      await refreshProfile();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการส่งแบบประเมิน");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarInput = (
    label: string,
    value: number,
    onChange: (val: number) => void
  ) => {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dark-primary)" }}>{label}</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: "var(--color-gold-700)" }}>{value} / 5</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
                color: star <= value ? "#eab308" : "#cbd5e1",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <Star
                style={{
                  width: 28,
                  height: 28,
                  fill: star <= value ? "#eab308" : "none",
                }}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mobile-viewport">
      <TopHeader title="แบบประเมิน" />

      {/* Hero Section */}
      <div className="chinese-hero" style={{ paddingBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Heart style={{ width: 18, height: 18, color: "var(--color-gold-400)" }} />
          <span className="chinese-hero-tagline">FATU OPEN HOUSE 2026</span>
        </div>
        <h1 className="chinese-hero-title" style={{ fontSize: 24 }}>
          แบบประเมินความพึงพอใจ
        </h1>
        <p className="chinese-hero-desc">
          ความคิดเห็นของคุณมีค่ามาก เพื่อนำไปพัฒนาการจัดงานในครั้งต่อไป (รับแต้มโบนัส +10 แต้ม)
        </p>
      </div>

      <div className="ivory-card" style={{ paddingBottom: 110 }}>
        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 12,
              color: "#991b1b",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            <AlertCircle style={{ width: 18, height: 18, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Not Logged In */}
        {!firebaseUser && (
          <div
            className="ivory-card-inner"
            style={{ textAlign: "center", padding: "24px 16px", marginBottom: 20 }}
          >
            <img
              src="/src/assets/characters/nine-tailed-fox-mascot.svg"
              alt=""
              style={{ width: 90, height: 90, margin: "0 auto 12px" }}
            />
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-red-900)", margin: "0 0 6px" }}>
              เข้าสู่ระบบเพื่อทำแบบประเมิน
            </h3>
            <p style={{ fontSize: 13, color: "var(--text-dark-secondary)", marginBottom: 16 }}>
              กรุณาเข้าสู่ระบบเพื่อรับคะแนนโบนัส +10 แต้มหลังทำแบบประเมินเสร็จสิ้น
            </p>
            <Link to="/login" className="chinese-btn-primary" style={{ padding: "8px 20px", fontSize: 13, textDecoration: "none" }}>
              เข้าสู่ระบบ
            </Link>
          </div>
        )}

        {/* Completed State */}
        {firebaseUser && completed && (
          <div
            style={{
              textAlign: "center",
              padding: "24px 16px",
              background: "#f0fdf4",
              border: "1.5px solid #86efac",
              borderRadius: 16,
              boxShadow: "0 4px 16px rgba(22, 101, 52, 0.08)",
            }}
          >
            <CheckCircle style={{ width: 48, height: 48, color: "#16a34a", margin: "0 auto 12px" }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#14532d", margin: "0 0 6px" }}>
              คุณได้ทำแบบประเมินเรียบร้อยแล้ว
            </h2>
            <p style={{ fontSize: 13, color: "#166534", margin: "0 0 16px" }}>
              {successMessage || "ขอบคุณสำหรับข้อเสนอแนะอันมีค่า และได้รับโบนัส +10 แต้มสะสมแล้ว"}
            </p>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#ffffff",
                padding: "8px 16px",
                borderRadius: 9999,
                border: "1px solid #bbf7d0",
                fontSize: 12,
                fontWeight: 700,
                color: "#15803d",
              }}
            >
              <Award style={{ width: 16, height: 16 }} />
              <span>โบนัส +10 แต้มถูกเพิ่มในใบเบิกทางของคุณแล้ว</span>
            </div>

            <div style={{ marginTop: 20 }}>
              <Link to="/prizes" className="chinese-btn-primary" style={{ textDecoration: "none", fontSize: 13, padding: "10px 20px" }}>
                ไปที่คลังของรางวัล →
              </Link>
            </div>
          </div>
        )}

        {/* Survey Form */}
        {firebaseUser && !completed && (
          <form onSubmit={handleSubmit}>
            <div className="ivory-card-inner" style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Award style={{ width: 20, height: 20, color: "var(--color-gold-600)" }} />
                <span style={{ fontSize: 14, fontWeight: 800, color: "var(--color-red-900)" }}>
                  ทำแบบประเมินรับโบนัสทันที +10 แต้ม
                </span>
              </div>

              {renderStarInput("1. ภาพรวมการจัดงาน FATU Open House 2026", ratingOverall, setRatingOverall)}
              {renderStarInput("2. สถานที่ การจัดนิทรรศการ และบรรยากาศแดนมังกร", ratingVenues, setRatingVenues)}
              {renderStarInput("3. กิจกรรม การแสดง และการให้ความรู้", ratingActivities, setRatingActivities)}
              {renderStarInput("4. การต้อนรับและการดูแลของพี่ ๆ เจ้าหน้าที่", ratingStaff, setRatingStaff)}
            </div>

            <div className="chinese-form-group" style={{ marginBottom: 20 }}>
              <label className="chinese-form-label">
                ข้อเสนอแนะเพิ่มเติม / ความประทับใจ <span style={{ fontSize: 11, color: "var(--text-dark-muted)" }}>(ถ้ามี)</span>
              </label>
              <div className="chinese-input-wrapper" style={{ height: "auto" }}>
                <textarea
                  rows={4}
                  placeholder="บอกเล่าความรู้สึก หรือสิ่งที่อยากให้พัฒนาในงานครั้งถัดไป..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="chinese-input"
                  style={{
                    padding: "12px",
                    height: "auto",
                    resize: "vertical",
                    minHeight: 100,
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="chinese-btn-primary"
              style={{
                width: "100%",
                padding: "14px",
                fontSize: 15,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Send style={{ width: 18, height: 18 }} />
              <span>{submitting ? "กำลังส่งแบบประเมิน..." : "ส่งแบบประเมิน & รับ +10 แต้ม"}</span>
            </button>
          </form>
        )}
      </div>

      {loading && <ThemedLoading fullscreen message="กำลังโหลดแบบประเมิน..." />}
      {submitting && <ThemedLoading fullscreen message="กำลังบันทึกความคิดเห็น..." />}

      <BottomNavBar />
    </div>
  );
};
