import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  MapPin,
  QrCode,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  Navigation,
  Clock,
  Award,
} from "lucide-react";
import { useActivities, useMedia, useVenues, resolveMediaUrl } from "@/data/content";
import { useAuth } from "@/contexts/AuthContext";

const REALM_MAP: Record<
  string,
  {
    mythicalTitle: string;
    venueName: string;
    image: string;
    artImage: string;
    themeColor: string;
    sealStamp: string;
    lore: string;
  }
> = {
  "azure-dragon": {
    mythicalTitle: "สวรรค์แดนมังกรฟ้า",
    venueName: "โรงละคร",
    image: "/src/assets/mythology/azure-dragon.svg",
    artImage: "/images/azure-dragon-art.jpg",
    themeColor: "#1b8a9e",
    sealStamp: "ตรามังกรฟ้า",
    lore: "แดนแห่งแสง สี เสียง และมนตราศิลปะการแสดง ที่ซึ่งทวยเทพศิลปินร่วมรังสรรค์สุนทรียภาพแห่งจักรวาล",
  },
  "white-tiger": {
    mythicalTitle: "เมืองมนุษย์พยัคฆ์ขาว",
    venueName: "ตึกคณะ",
    image: "/src/assets/mythology/white-tiger.svg",
    artImage: "/images/white-tiger-art.jpg",
    themeColor: "#cda34f",
    sealStamp: "ตราพยัคฆ์ขาว",
    lore: "ศูนย์รวมความกล้าหาญ ทักษะเชิงช่าง นิทรรศการผลงานศิลปกรรม และการค้นหาตัวตนแห่งโลกมนุษย์",
  },
  "nine-tailed-fox": {
    mythicalTitle: "ป่าแดนจิ้งจอก 9 หาง",
    venueName: "โรงทอ",
    image: "/src/assets/mythology/nine-tailed-fox.svg",
    artImage: "/images/nine-tailed-fox-art.jpg",
    themeColor: "#ba55d3",
    sealStamp: "ตราจิ้งจอกเก้าหาง",
    lore: "พงไพรลึกลับที่ถักทอเส้นใยแห่งความคิดสร้างสรรค์ แฟชั่นล้ำยุค และนวัตกรรมสิ่งทออันทรงเสน่ห์",
  },
  "red-phoenix": {
    mythicalTitle: "ถ้ำหงส์แดง",
    venueName: "ตึก SC3",
    image: "/src/assets/mythology/red-phoenix.svg",
    artImage: "/images/red-phoenix-art.jpg",
    themeColor: "#d93838",
    sealStamp: "ตราหงส์แดง",
    lore: "ดินแดนแห่งไฟอันไม่มีวันดับมอด หลอมรวมจินตนาการ สื่อผสม และเวทีประชันปัญญาความคิดสร้างสรรค์",
  },
};

export function VenuePage() {
  const { id = "" } = useParams();
  const venues = useVenues();
  const activities = useActivities();
  const media = useMedia();
  const { profile } = useAuth();

  const venue = venues.items.find((item) => item.id === id);

  if (venues.loading || activities.loading) {
    return (
      <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--color-gold-400)" }}>
        กำลังเปิดประตูมิติแดนศักดิ์สิทธิ์...
      </div>
    );
  }

  if (!venue) {
    return (
      <div style={{ padding: "40px 16px", textAlign: "center" }}>
        <h1 style={{ color: "var(--text-light-primary)" }}>ไม่พบแดนศักดิ์สิทธิ์นี้</h1>
        <Link to="/" className="button-gold-outline" style={{ marginTop: 16, display: "inline-block" }}>
          กลับสู่หน้าหลัก
        </Link>
      </div>
    );
  }

  const meta = REALM_MAP[venue.visualIdentityKey] || {
    mythicalTitle: venue.visualLabel || venue.name,
    venueName: venue.name,
    image: "/src/assets/mythology/azure-dragon.svg",
    artImage: "/images/azure-dragon-art.jpg",
    themeColor: "#cda34f",
    sealStamp: "ตราศักดิ์สิทธิ์",
    lore: venue.description,
  };

  const relatedActivities = activities.items.filter((activity) => activity.venueId === id);

  // Check user progress for this venue
  const completedActivityIds = new Set(
    (profile?.transactions || []).map((t) => t.activityId).filter(Boolean),
  );
  const isVenueVisited = Boolean(profile?.visits && profile.visits[venue.id]);

  const completedCount = relatedActivities.filter((act) => completedActivityIds.has(act.id)).length;
  const totalVenuePoints = relatedActivities.reduce((acc, act) => acc + (act.pointsAwarded || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "0 16px 30px" }}>
      {/* Top Back Link */}
      <div style={{ paddingTop: 8 }}>
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "var(--color-gold-400)",
            fontSize: 13,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          <ChevronLeft style={{ width: 18, height: 18 }} />
          กลับสู่แดนหลัก
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* 1. REALM HERO HEADER (Reference 4)                                        */}
      {/* ========================================================================= */}
      <div
        className="card-mythology"
        style={{
          padding: "24px 20px",
          position: "relative",
          overflow: "hidden",
          border: `1.5px solid ${meta.themeColor}`,
          boxShadow: `0 8px 30px -4px rgba(0,0,0,0.6), 0 0 20px ${meta.themeColor}33`,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          {/* Mythological Creature Portrait */}
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 18,
              background: "rgba(0,0,0,0.6)",
              border: `2px solid ${meta.themeColor}`,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              overflow: "hidden",
              boxShadow: `0 0 20px ${meta.themeColor}55`,
            }}
          >
            <img
              src={meta.artImage || meta.image}
              alt={meta.mythicalTitle}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          {/* Title & Lore */}
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  padding: "2px 8px",
                  borderRadius: 10,
                  background: `${meta.themeColor}22`,
                  color: meta.themeColor,
                  border: `1px solid ${meta.themeColor}55`,
                }}
              >
                {venue.name}
              </span>

              {isVenueVisited && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 10,
                    backgroundColor: "rgba(46, 125, 50, 0.25)",
                    color: "#66bb6a",
                    border: "1px solid rgba(102, 187, 106, 0.4)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <CheckCircle2 style={{ width: 10, height: 10 }} />
                  ประทับตราแล้ว
                </span>
              )}
            </div>

            <h1
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "var(--text-light-primary)",
                margin: "6px 0 4px",
              }}
            >
              {venue.visualLabel || meta.mythicalTitle}
            </h1>

            <p style={{ fontSize: 12, color: "var(--text-light-secondary)", margin: 0, lineHeight: 1.45 }}>
              {venue.description || meta.lore}
            </p>
          </div>
        </div>

        {/* Prominent Self QR Check-in CTA Button */}
        <div style={{ marginTop: 20 }}>
          <Link
            to="/scan"
            className="button-imperial-red"
            style={{
              textDecoration: "none",
              padding: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxShadow: "0 4px 16px rgba(125, 18, 18, 0.5)",
            }}
          >
            <QrCode style={{ width: 22, height: 22 }} />
            <span style={{ fontSize: 16, fontWeight: 800 }}>สแกนเช็กอินที่นี่</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REALM PROGRESS & REWARD CHEST (Reference 4)                            */}
      {/* ========================================================================= */}
      <div
        className="ivory-card"
        style={{
          padding: "16px 18px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <img
          src="/src/assets/animations/reward-chest.svg"
          alt="Chest"
          style={{ width: 44, height: 44, flexShrink: 0 }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "var(--color-red-900)" }}>
            ความคืบหน้าประจำแดน ({completedCount}/{relatedActivities.length} ภารกิจ)
          </div>
          <div style={{ fontSize: 11, color: "var(--text-dark-secondary)", marginTop: 2 }}>
            สะสมได้สูงสุด {totalVenuePoints} แต้ม และรับ{meta.sealStamp}เมื่อพิชิตครบ
          </div>
          {/* Progress miniature */}
          <div className="progress-track" style={{ height: 6, marginTop: 8 }}>
            <div
              className="progress-fill"
              style={{
                width: `${relatedActivities.length ? Math.round((completedCount / relatedActivities.length) * 100) : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MISSIONS & ACTIVITIES LIST                                             */}
      {/* ========================================================================= */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--color-red-900)", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles style={{ width: 16, height: 16, color: "var(--color-gold-600)" }} />
            ภารกิจใน{venue.name}
          </h2>
          <span style={{ fontSize: 12, color: "var(--color-gold-700)", fontWeight: 700 }}>
            {relatedActivities.length} รายการ
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {relatedActivities.length > 0 ? (
            relatedActivities.map((activity) => {
              const isDone = completedActivityIds.has(activity.id);

              return (
                <div
                  key={activity.id}
                  style={{
                    background: "#ffffff",
                    border: isDone ? "1.5px solid rgba(46, 125, 50, 0.4)" : "1px solid var(--border-gold-subtle)",
                    borderRadius: 14,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    boxShadow: "0 2px 8px rgba(100, 70, 30, 0.05)",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "var(--text-dark-primary)",
                        }}
                      >
                        {activity.title}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--text-dark-secondary)",
                        margin: "4px 0 6px",
                        lineHeight: 1.4,
                      }}
                    >
                      {activity.shortDescription || activity.description || "เข้าร่วมกิจกรรมเพื่อสะสมแต้ม"}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {activity.pointsEnabled && (
                        <span className="badge-gold" style={{ fontSize: 10, padding: "2px 6px" }}>
                          +{activity.pointsAwarded} แต้ม
                        </span>
                      )}

                      {activity.startAt && (
                        <span style={{ fontSize: 11, color: "var(--text-dark-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                          <Clock style={{ width: 12, height: 12 }} />
                          {activity.startAt} - {activity.endAt || ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    {isDone ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 2,
                          color: "#166534",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        <CheckCircle2 style={{ width: 22, height: 22 }} />
                        <span>สำเร็จแล้ว</span>
                      </div>
                    ) : (
                      <Link
                        to="/scan"
                        className="button-imperial-red"
                        style={{
                          padding: "7px 14px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          boxShadow: "0 2px 8px rgba(125, 18, 18, 0.3)",
                        }}
                      >
                        <QrCode style={{ width: 14, height: 14 }} />
                        สแกน
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: "center", padding: "24px", color: "var(--text-dark-secondary)", fontSize: 13 }}>
              ยังไม่มีกิจกรรมที่เปิดให้เช็กอินในขณะนี้
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. DIRECTIONS & LOCATION INFO                                             */}
      {/* ========================================================================= */}
      <div
        className="card-mythology"
        style={{
          padding: "18px 20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <MapPin style={{ width: 18, height: 18, color: "var(--color-gold-600)" }} />
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-red-900)", margin: 0 }}>
            การเดินทางสู่{venue.name}
          </h3>
        </div>

        <p style={{ fontSize: 13, color: "var(--text-dark-secondary)", margin: "0 0 12px", lineHeight: 1.5 }}>
          {venue.directions || venue.landmarkNotes || "ตั้งอยู่ภายในพื้นที่คณะศิลปกรรมศาสตร์ มหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต"}
        </p>

        <a
          href={venue.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name + " คณะศิลปกรรมศาสตร์ มหาวิทยาลัยธรรมศาสตร์ รังสิต")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="button-gold-outline"
          style={{
            textDecoration: "none",
            padding: "8px 14px",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
          }}
        >
          <Navigation style={{ width: 14, height: 14 }} />
          เปิดแผนที่นำทาง (Google Maps)
        </a>
      </div>
    </div>
  );
}
