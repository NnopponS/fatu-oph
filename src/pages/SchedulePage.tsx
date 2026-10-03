import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Award,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useActivities, useVenues } from "@/data/content";

function formatTime(raw?: string) {
  if (!raw) return "";
  if (raw.includes("T")) {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    }
  }
  return raw.slice(0, 5);
}

export function SchedulePage() {
  const activities = useActivities();
  const venues = useVenues();
  const [filterPeriod, setFilterPeriod] = useState<"all" | "morning" | "afternoon">("all");

  const sorted = [...activities.items]
    .filter((item) => item.startAt)
    .sort((a, b) => a.startAt.localeCompare(b.startAt));

  const filtered = sorted.filter((act) => {
    if (filterPeriod === "all") return true;
    const timeStr = formatTime(act.startAt);
    const hour = parseInt(timeStr.split(":")[0] || "0", 10);
    if (filterPeriod === "morning") return hour < 12;
    if (filterPeriod === "afternoon") return hour >= 12;
    return true;
  });

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
          <Calendar style={{ width: 18, height: 18, color: "var(--color-gold-400)" }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-gold-400)", letterSpacing: "0.08em" }}>
            EVENT TIMELINE
          </span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-light-primary)", margin: "0 0 6px" }}>
          ตารางเวลาและกิจกรรม
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-light-secondary)", margin: 0, lineHeight: 1.5 }}>
          กำหนดการเวิร์กช็อป การแสดง และกิจกรรมสำคัญประจำวัน อัปเดตสดจากระบบส่วนกลาง
        </p>
      </div>

      {/* Period Filter Chips */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { id: "all", label: "กิจกรรมทั้งหมด" },
          { id: "morning", label: "ช่วงเช้า (09:00 - 12:00)" },
          { id: "afternoon", label: "ช่วงบ่าย (12:00 - 17:00)" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterPeriod(f.id as "all" | "morning" | "afternoon")}
            style={{
              padding: "8px 14px",
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              border: filterPeriod === f.id ? "1px solid var(--color-gold-600)" : "1px solid var(--border-gold-subtle)",
              background: filterPeriod === f.id ? "#7d1212" : "#ffffff",
              color: filterPeriod === f.id ? "#ffffff" : "var(--text-dark-secondary)",
              boxShadow: filterPeriod === f.id ? "0 2px 8px rgba(125, 18, 18, 0.25)" : "0 1px 3px rgba(0,0,0,0.04)",
              transition: "all 0.15s ease",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {activities.loading && (
        <p style={{ color: "var(--text-dark-secondary)", textAlign: "center" }}>กำลังโหลดตารางกิจกรรม...</p>
      )}

      {/* Timeline List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.length > 0 ? (
          filtered.map((activity) => {
            const venue = venues.items.find((item) => item.id === activity.venueId);
            return (
              <Link
                key={activity.id}
                to={`/activity/${activity.id}`}
                style={{ textDecoration: "none" }}
              >
                <article
                  className="card-mythology"
                  style={{
                    padding: "16px 18px",
                    border: "1px solid var(--border-gold-subtle)",
                    borderRadius: 16,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 14,
                    transition: "border-color 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {/* Time Badge */}
                    <div
                      style={{
                        background: "#fbf8f1",
                        border: "1px solid var(--border-gold-subtle)",
                        borderRadius: 10,
                        padding: "8px 10px",
                        textAlign: "center",
                        minWidth: 64,
                        flexShrink: 0,
                      }}
                    >
                      <Clock style={{ width: 14, height: 14, color: "var(--color-gold-600)", margin: "0 auto 2px" }} />
                      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--color-red-900)" }}>
                        {formatTime(activity.startAt)}
                      </div>
                      {activity.endAt && (
                        <div style={{ fontSize: 10, color: "var(--text-dark-secondary)" }}>
                          - {formatTime(activity.endAt)}
                        </div>
                      )}
                    </div>

                    {/* Activity Info */}
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-dark-primary)", margin: "0 0 4px" }}>
                        {activity.title}
                      </h3>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: 11, color: "var(--text-dark-secondary)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <MapPin style={{ width: 12, height: 12, color: "var(--color-gold-600)" }} />
                          <span>{venue?.name || "จุดจัดงาน"}</span>
                        </span>
                        {Boolean(activity.pointsAwarded && activity.pointsAwarded > 0) && (
                          <span
                            style={{
                              background: "#dcfce7",
                              color: "#166534",
                              border: "1px solid #bbf7d0",
                              padding: "1px 6px",
                              borderRadius: 4,
                              fontWeight: 700,
                            }}
                          >
                            +{activity.pointsAwarded} แต้ม
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <ChevronRight style={{ width: 18, height: 18, color: "var(--color-gold-600)", flexShrink: 0 }} />
                </article>
              </Link>
            );
          })
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px 16px",
              background: "#ffffff",
              borderRadius: 16,
              border: "1px dashed var(--border-gold-subtle)",
              color: "var(--text-dark-secondary)",
              fontSize: 13,
            }}
          >
            ยังไม่มีตารางกิจกรรมที่เผยแพร่ในช่วงเวลานี้
          </div>
        )}
      </div>
    </div>
  );
}
