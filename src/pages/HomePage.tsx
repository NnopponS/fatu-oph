import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  QrCode,
  Gift,
  Compass,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useActivities, useAnnouncements, useSite, useVenues } from "@/data/content";
import { FloatingMythologyAura } from "@/components/AnimatedMythology";

// Canonical mythology data map for fallback & visual metadata
const REALM_MAP: Record<
  string,
  {
    mythicalTitle: string;
    venueName: string;
    image: string;
    artImage: string;
    themeColor: string;
    tagline: string;
  }
> = {
  "azure-dragon": {
    mythicalTitle: "สวรรค์แดนมังกรฟ้า",
    venueName: "โรงละคร",
    image: "/assets/characters/azure-dragon-mascot.svg",
    artImage: "/images/azure-dragon-art.jpg",
    themeColor: "#1b8a9e",
    tagline: "การแสดง แสง สี เสียง และพิธีเปิดสุดตระการตา",
  },
  "white-tiger": {
    mythicalTitle: "เมืองมนุษย์พยัคฆ์ขาว",
    venueName: "ตึกคณะ",
    image: "/assets/characters/white-tiger-mascot.svg",
    artImage: "/images/white-tiger-art.jpg",
    themeColor: "#cda34f",
    tagline: "ศูนย์รวมนิทรรศการ เวิร์กช็อป และหลักสูตรศิลปกรรม",
  },
  "nine-tailed-fox": {
    mythicalTitle: "ป่าแดนจิ้งจอก 9 หาง",
    venueName: "โรงทอ",
    image: "/assets/characters/nine-tailed-fox-mascot.svg",
    artImage: "/images/nine-tailed-fox-art.jpg",
    themeColor: "#ba55d3",
    tagline: "สัมผัสนวัตกรรมสิ่งทอ แฟชั่น และศิลปะร่วมสมัย",
  },
  "red-phoenix": {
    mythicalTitle: "ถ้ำหงส์แดง",
    venueName: "ตึก SC3",
    image: "/assets/characters/red-phoenix-mascot.svg",
    artImage: "/images/red-phoenix-art.jpg",
    themeColor: "#d93838",
    tagline: "การประชันความคิดสร้างสรรค์ เวทีเสวนา และเกมสะสมแต้ม",
  },
};

export function HomePage() {
  const { firebaseUser, profile } = useAuth();
  const site = useSite();
  const venues = useVenues();
  const activities = useActivities();
  const announcements = useAnnouncements();

  const isParticipantLoggedIn = Boolean(firebaseUser && profile?.username);

  const chosenRealmKey = typeof window !== "undefined" ? sessionStorage.getItem("fatu_chosen_realm") : null;

  // Participant calculations
  const pointTotal = profile?.pointTotal ?? 0;
  const visits = profile?.visits || {};
  const visitedLocationIds = new Set(Object.keys(visits));

  const totalVenuesCount = venues.items.length || 4;
  const visitedVenuesCount = venues.items.filter((v) => visitedLocationIds.has(v.id)).length;
  const progressPercent = Math.round((visitedVenuesCount / Math.max(totalVenuesCount, 1)) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "0 0 20px 0" }}>
      {/* ========================================================================= */}
      {/* 1. VISITOR HERO (Logged Out) OR PARTICIPANT HUB BANNER (Logged In)        */}
      {/* ========================================================================= */}
      {!isParticipantLoggedIn ? (
        <section
          className="chinese-hero"
          style={{
            padding: "36px 16px 30px",
            background: "linear-gradient(180deg, rgba(252, 250, 244, 0.88) 0%, rgba(247, 242, 230, 0.97) 100%), url('/images/hero-chinese-landscape.jpg') center top / cover no-repeat",
            borderBottom: "1.5px solid var(--color-gold-400)",
            position: "relative",
          }}
        >
          <div className="chinese-hero-clouds" />
          <div className="chinese-hero-tagline" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Sparkles style={{ width: 14, height: 14, color: "var(--color-gold-700)" }} />
            {site.item?.name || "FATU OPEN HOUSE 2026"}
          </div>

          {/* Lightweight hero artwork; optional Google Flow video can replace this media later. */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "14px 0 10px" }}>
            <FloatingMythologyAura duration={3400} distance={5}>
              <div style={{ width: 116, height: 116, borderRadius: "50%", padding: 3, background: "linear-gradient(135deg, var(--color-gold-400), var(--color-gold-700), var(--color-gold-300))", boxShadow: "0 4px 18px rgba(179, 134, 40, 0.35)" }}>
                <img src="/images/azure-dragon-art.jpg" alt="Azure Dragon" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              </div>
            </FloatingMythologyAura>
          </div>

          <h1 className="chinese-hero-title">{site.item?.theme || "ตะลุยแดนมังกร"}</h1>
          <div className="chinese-hero-subtitle" style={{ color: "var(--color-gold-700)" }}>FACULTY OF FINE AND APPLIED ARTS</div>
          <p className="chinese-hero-desc" style={{ color: "var(--text-dark-secondary)" }}>
            {site.item?.description || "ผจญภัยสู่ 4 แดนศักดิ์สิทธิ์ สแกน QR ทำภารกิจ สะสมคะแนน แลกรับของรางวัลสุดพรีเมียม"}
          </p>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(205, 163, 79, 0.15)",
              border: "1px solid rgba(205, 163, 79, 0.4)",
              borderRadius: 20,
              padding: "6px 14px",
              fontSize: 12,
              color: "var(--color-gold-700)",
              fontWeight: 700,
              margin: "12px auto 20px",
            }}
          >
            <span>{site.item?.dateLabel || "21-22 มีนาคม 2026"}</span>
            <span>·</span>
            <span>{site.item?.locationLabel || "คณะศิลปกรรมศาสตร์ มธ. รังสิต"}</span>
          </div>

          {/* Action CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 360, margin: "0 auto" }}>
            <Link to="/register" className="button-imperial-red" style={{ textDecoration: "none" }}>
              <Sparkles style={{ width: 18, height: 18 }} />
              ลงทะเบียนเข้าร่วมงาน
            </Link>
            <Link to="/login" className="button-gold-outline" style={{ textDecoration: "none" }}>
              <UserCheck style={{ width: 18, height: 18 }} />
              เข้าสู่ระบบด้วยชื่อผู้ใช้
            </Link>

            {/* Replay Story Intro Button */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("replay_story_intro"))}
              style={{
                background: "rgba(205, 163, 79, 0.12)",
                border: "1px dashed var(--color-gold-500)",
                borderRadius: 12,
                color: "var(--color-red-950)",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                marginTop: 4,
                padding: "8px 12px",
              }}
            >
              <Sparkles style={{ width: 14, height: 14, color: "var(--color-gold-600)" }} />
              <span>ชมบทนำตำนาน ๔ แดนศักดิ์สิทธิ์ (Watch Story)</span>
            </button>

            {/* Personalized Roleplay Affinity Badge */}
            {chosenRealmKey && REALM_MAP[chosenRealmKey] && (
              <div
                style={{
                  background: "rgba(125, 18, 18, 0.06)",
                  border: "1px dashed rgba(125, 18, 18, 0.3)",
                  borderRadius: 12,
                  padding: "8px 12px",
                  fontSize: 11,
                  color: "var(--color-red-950)",
                  textAlign: "center",
                  marginTop: 2,
                }}
              >
                🚩 แดนเริ่มต้นที่เจ้าเลือก: <strong>{REALM_MAP[chosenRealmKey].mythicalTitle}</strong> ({REALM_MAP[chosenRealmKey].venueName})
              </div>
            )}
          </div>
        </section>
      ) : (
        /* ========================================================================= */
        /* PARTICIPANT HUB (Reference 3)                                             */
        /* ========================================================================= */
        <section style={{ padding: "16px 16px 0" }}>
          {/* Welcome Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "var(--color-gold-400)", fontWeight: 600, letterSpacing: "0.05em" }}>
                ยินดีต้อนรับจอมยุทธ์
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-light-primary)", margin: "2px 0 0" }}>
                {profile?.displayName || profile?.username}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 12, color: "var(--text-light-secondary)" }}>
                  @{profile?.username} · {profile?.school || "ผู้ร่วมงาน"}
                </span>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent("replay_story_intro"))}
                  style={{
                    background: "rgba(205, 163, 79, 0.2)",
                    border: "1px solid rgba(205, 163, 79, 0.4)",
                    borderRadius: 12,
                    padding: "2px 8px",
                    color: "var(--color-gold-300)",
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                  title="ชมบทนำตำนาน ๔ แดน"
                >
                  <Sparkles style={{ width: 10, height: 10 }} />
                  <span>ชมตำนาน</span>
                </button>
              </div>
            </div>

            <Link
              to="/profile"
              style={{
                display: "grid",
                placeItems: "center",
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "radial-gradient(circle, #7d1212 0%, #3b0606 100%)",
                border: "2px solid var(--color-gold-500)",
                boxShadow: "0 0 12px rgba(205, 163, 79, 0.3)",
              }}
            >
              <img
                src="/assets/decorations/dragon-seal.svg"
                alt="Seal"
                style={{ width: 28, height: 28 }}
              />
            </Link>
          </div>

          {/* Expedition Pass Card */}
          <div className="ivory-card" style={{ padding: "20px 18px", position: "relative", overflow: "hidden" }}>
            <div
              style={{
                position: "absolute",
                top: -10,
                right: -10,
                opacity: 0.08,
                pointerEvents: "none",
              }}
            >
              <img src="/assets/mythology/azure-dragon.svg" alt="" style={{ width: 140, height: 140 }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <span className="badge-gold" style={{ fontSize: 11, padding: "3px 8px" }}>
                  ใบเบิกทางภารกิจ
                </span>
                <div style={{ fontSize: 28, fontWeight: 900, color: "var(--color-red-900)", marginTop: 6 }}>
                  {pointTotal}{" "}
                  <span style={{ fontSize: 15, fontWeight: 600, color: "var(--color-gold-700)" }}>แต้มสะสม</span>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "var(--text-dark-muted)" }}>สำรวจสำเร็จ</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--color-jade-900)" }}>
                  {visitedVenuesCount} / {totalVenuesCount}{" "}
                  <span style={{ fontSize: 13, fontWeight: 500 }}>แดน</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ margin: "12px 0 16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-dark-secondary)",
                  marginBottom: 6,
                }}
              >
                <span>ความคืบหน้าการผจญภัย</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="progress-track" style={{ height: 10 }}>
                <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {/* Quick Self QR Scan CTA */}
            <Link
              to="/scan"
              className="button-imperial-red"
              style={{
                textDecoration: "none",
                padding: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: "0 4px 14px rgba(125, 18, 18, 0.4)",
              }}
            >
              <QrCode style={{ width: 22, height: 22 }} />
              <span style={{ fontSize: 15, fontWeight: 700 }}>สแกน QR เช็กอินภารกิจ</span>
            </Link>

            {/* Quick Action Cards: Mystery Box & Survey */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
              <Link
                to="/lucky-draw"
                style={{
                  textDecoration: "none",
                  background: "#ffffff",
                  border: "1px solid var(--border-gold-subtle)",
                  borderRadius: 14,
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                }}
              >
                <img
                  src="/images/celestial-mystery-chest.jpg"
                  alt="กล่องสวรรค์"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    objectFit: "cover",
                    border: "1.5px solid var(--color-gold-400)",
                    flexShrink: 0,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  }}
                />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--color-jade-900)" }}>
                    กล่องสวรรค์
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-dark-secondary)", marginTop: 1 }}>
                    สุ่มรับรางวัล 1 ครั้ง
                  </div>
                </div>
              </Link>

              <Link
                to="/survey"
                style={{
                  textDecoration: "none",
                  background: "#ffffff",
                  border: "1px solid var(--border-gold-subtle)",
                  borderRadius: 14,
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                }}
              >
                <img
                  src="/assets/animations/reward-chest.svg"
                  alt=""
                  style={{ width: 34, height: 34, flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--color-red-900)" }}>
                    แบบประเมิน
                  </div>
                  <div style={{ fontSize: 10, color: "#16a34a", fontWeight: 700, marginTop: 1 }}>
                    รับโบนัส +10 แต้ม
                  </div>
                </div>
              </Link>
            </div>

            {/* Direct Link to Pass */}
            <div style={{ textAlign: "center", marginTop: 12, paddingTop: 10, borderTop: "1px dashed rgba(205, 163, 79, 0.3)" }}>
              <Link
                to="/profile"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--color-gold-700)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span>เปิดดูใบเบิกทางจอมยุทธ์ (通关文牒)</span>
                <ArrowRight style={{ width: 14, height: 14 }} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. IMPORTANT ANNOUNCEMENTS                                                */}
      {/* ========================================================================= */}
      {announcements.items.length > 0 && (
        <section style={{ padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--color-red-900)", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <Clock style={{ width: 16, height: 16, color: "var(--color-gold-600)" }} />
              ประกาศจากสำนัก
            </h2>
            <Link to="/faq" style={{ fontSize: 12, color: "var(--color-gold-700)", textDecoration: "none", fontWeight: 700 }}>
              ดูข้อมูลงาน
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {announcements.items.slice(0, 2).map((item) => (
              <div
                key={item.id}
                style={{
                  background: item.level === "important" ? "#fef2f2" : "#ffffff",
                  border: item.level === "important" ? "1px solid #fca5a5" : "1px solid var(--border-gold-subtle)",
                  borderRadius: 14,
                  padding: "12px 16px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: item.level === "important" ? "#991b1b" : "var(--text-dark-primary)" }}>
                  {item.title}
                </div>
                {item.body && (
                  <p style={{ fontSize: 12, color: item.level === "important" ? "#7f1d1d" : "var(--text-dark-secondary)", margin: "4px 0 0", lineHeight: 1.5 }}>
                    {item.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. THE 4 SACRED REALMS (EXPEDITION STATIONS)                              */}
      {/* ========================================================================= */}
      <section style={{ padding: "0 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-gold-500)", letterSpacing: "0.08em" }}>
              EXPEDITION REALMS
            </span>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-light-primary)", margin: "2px 0 0" }}>
              4 แดนศักดิ์สิทธิ์
            </h2>
          </div>
          <Link to="/map" style={{ fontSize: 12, color: "var(--color-gold-400)", textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
            แผนที่งาน <ChevronRight style={{ width: 14, height: 14 }} />
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {venues.items.map((venue) => {
            const meta = REALM_MAP[venue.visualIdentityKey] || {
              mythicalTitle: venue.visualLabel || venue.name,
              venueName: venue.name,
              image: "/assets/mythology/azure-dragon.svg",
              artImage: "/images/azure-dragon-art.jpg",
              themeColor: "#cda34f",
              tagline: venue.description,
            };

            const isVisited = visitedLocationIds.has(venue.id);
            const venueActivities = activities.items.filter((a) => a.venueId === venue.id);

            return (
              <Link
                key={venue.id}
                to={`/venue/${venue.id}`}
                style={{
                  textDecoration: "none",
                  background: "#ffffff",
                  border: isVisited ? "1.5px solid var(--color-gold-500)" : "1px solid var(--border-gold-subtle)",
                  borderRadius: 18,
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: isVisited ? "0 4px 18px rgba(179, 134, 40, 0.2)" : "0 3px 12px rgba(100, 70, 30, 0.06)",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Mythological Creature Emblem */}
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 16,
                    background: "#fbf8f1",
                    border: `2px solid ${meta.themeColor}`,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    overflow: "hidden",
                    boxShadow: `0 2px 10px ${meta.themeColor}33`,
                  }}
                >
                  <img
                    src={meta.artImage || meta.image}
                    alt={venue.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                {/* Realm Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: meta.themeColor,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                      }}
                    >
                      {venue.name}
                    </span>

                    {isParticipantLoggedIn && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 10,
                          backgroundColor: isVisited ? "rgba(46, 125, 50, 0.12)" : "rgba(205, 163, 79, 0.15)",
                          color: isVisited ? "#166534" : "var(--color-gold-700)",
                          border: isVisited ? "1px solid rgba(102, 187, 106, 0.5)" : "1px solid rgba(205, 163, 79, 0.4)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        {isVisited ? <CheckCircle2 style={{ width: 10, height: 10 }} /> : null}
                        {isVisited ? "สำรวจแล้ว" : "ยังไม่เช็กอิน"}
                      </span>
                    )}
                  </div>

                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: "var(--text-dark-primary)",
                      margin: "4px 0 2px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {venue.visualLabel || meta.mythicalTitle}
                  </h3>

                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-dark-secondary)",
                      margin: 0,
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {venue.description || meta.tagline}
                  </p>

                  <div style={{ fontSize: 11, color: "var(--color-gold-700)", marginTop: 4, fontWeight: 600 }}>
                    {venueActivities.length} กิจกรรมให้ร่วมสนุก
                  </div>
                </div>

                <ChevronRight style={{ width: 18, height: 18, color: "var(--color-gold-600)", flexShrink: 0 }} />
              </Link>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SHORTCUT NAVIGATION HUB                                                */}
      {/* ========================================================================= */}
      <section style={{ padding: "0 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Link
            to="/prizes"
            style={{
              textDecoration: "none",
              background: "#ffffff",
              border: "1px solid var(--border-gold-subtle)",
              borderRadius: 16,
              padding: "14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 2px 8px rgba(100, 70, 30, 0.05)",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "rgba(205, 163, 79, 0.15)",
                display: "grid",
                placeItems: "center",
                color: "var(--color-gold-700)",
              }}
            >
              <Gift style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-red-900)" }}>ของรางวัล</div>
              <div style={{ fontSize: 11, color: "var(--text-dark-secondary)" }}>แลกของพรีเมียม</div>
            </div>
          </Link>

          <Link
            to="/schedule"
            style={{
              textDecoration: "none",
              background: "#ffffff",
              border: "1px solid var(--border-gold-subtle)",
              borderRadius: 16,
              padding: "14px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 2px 8px rgba(100, 70, 30, 0.05)",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "rgba(205, 163, 79, 0.15)",
                display: "grid",
                placeItems: "center",
                color: "var(--color-gold-700)",
              }}
            >
              <Calendar style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-red-900)" }}>ตารางงาน</div>
              <div style={{ fontSize: 11, color: "var(--text-dark-secondary)" }}>เวลาและเวที</div>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer Branding */}
      <footer style={{ textAlign: "center", padding: "16px", color: "var(--text-dark-muted)", fontSize: 11 }}>
        <img
          src="/assets/decorations/gold-divider.svg"
          alt=""
          style={{ width: 140, height: "auto", margin: "0 auto 12px", opacity: 0.6 }}
        />
        <div>FATU OPEN HOUSE 2026 · คณะศิลปกรรมศาสตร์ มหาวิทยาลัยธรรมศาสตร์</div>
        <div style={{ marginTop: 4 }}>ระบบสนับสนุนโดยฝ่ายเทคโนโลยีและสารสนเทศ</div>
      </footer>
    </div>
  );
}
