import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import {
  User,
  School,
  GraduationCap,
  Sparkles,
  QrCode,
  CheckCircle2,
  Calendar,
  Clock,
  ChevronRight,
  LogOut,
  Award,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useVenues } from "@/data/content";
import { VenuePhoto, GuardianButton } from "@/components/RealmPlaces";
import { placeName, realmFor } from "@/lib/realms";
import { RewardProgress } from "@/components/RewardProgress";
import { RankCard } from "@/components/RankCard";
import { LatticeCorners, ScrollRolls } from "@/components/ChineseOrnaments";

export function PassPage() {
  const { firebaseUser, profile, logout } = useAuth();
  const venues = useVenues();
  const [passportQr, setPassportQr] = useState<string>("");

  const isParticipantLoggedIn = Boolean(firebaseUser && profile?.username);

  // Generate Passport QR Data URL
  useEffect(() => {
    if (firebaseUser?.uid) {
      const payload = `FATU26PASS:${firebaseUser.uid}`;
      void QRCode.toDataURL(payload, {
        width: 280,
        margin: 1,
        color: {
          dark: "#3b0606",
          light: "#fcfaf4",
        },
      }).then(setPassportQr);
    }
  }, [firebaseUser]);

  if (!isParticipantLoggedIn) {
    return (
      <div style={{ padding: "40px 16px", textAlign: "center" }}>
        <div
          className="ivory-card"
          style={{ padding: "36px 20px", border: "2px solid var(--color-gold-500)" }}
        >
          <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 8px" }}>
            <img src="/assets/brand/dragon-seal.svg" alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "var(--color-red-950)", margin: 0 }}>
            ใบเบิกทางจอมยุทธ์
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-dark-secondary)", margin: "8px 0 24px", lineHeight: 1.5 }}>
            กรุณาเข้าสู่ระบบด้วยชื่อผู้ใช้ของคุณ หรือลงทะเบียนใหม่เพื่อเปิดใช้งานใบเบิกทางสะสมแต้มและตราประทับศักดิ์สิทธิ์
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 280, margin: "0 auto" }}>
            <Link to="/login" className="button-imperial-red" style={{ textDecoration: "none", justifyContent: "center" }}>
              เข้าสู่ระบบ
            </Link>
            <Link to="/register" className="button-gold-outline" style={{ textDecoration: "none", justifyContent: "center" }}>
              ลงทะเบียนใหม่
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate progress & stamps
  const visits = profile?.visits || {};
  const visitedVenueIds = new Set(Object.keys(visits));
  const totalVenuesCount = venues.items.length || 4;
  const visitedVenuesCount = venues.items.filter((v) => visitedVenueIds.has(v.id)).length;
  const completionPercent = Math.round((visitedVenuesCount / Math.max(totalVenuesCount, 1)) * 100);

  const transactions = profile?.transactions || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "0 16px 30px" }}>
      {/* ========================================================================= */}
      {/* 1. PARTICIPANT PASS IDENTITY CARD (Reference 6)                           */}
      {/* ========================================================================= */}
      <div
        className="ivory-card passport-imperial-card"
        style={{
          marginTop: 8,
          padding: "24px 20px",
          position: "relative",
          border: "2px solid var(--color-gold-500)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
        }}
      >
        {/* Background watermark */}
        <LatticeCorners /><ScrollRolls />
        <div style={{ position: "absolute", top: -10, right: -10, opacity: 0.05, pointerEvents: "none" }}>
          <img src="/assets/brand/dragon-seal.svg" alt="" style={{ width: 180, height: 180 }} />
        </div>

        {/* Top Pass Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(205, 163, 79, 0.4)",
            paddingBottom: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--color-gold-700)", letterSpacing: "0.1em" }}>
              OFFICIAL EXPEDITION PASS · 通关文牒
            </span>
            <div style={{ fontSize: 16, fontWeight: 900, color: "var(--color-red-950)", marginTop: 2 }}>
              ใบเบิกทางจอมยุทธ์ 2026
            </div>
          </div>

          <div
            style={{
              padding: "4px 10px",
              background: "rgba(125, 18, 18, 0.1)",
              border: "1px solid var(--color-red-700)",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 800,
              color: "var(--color-red-800)",
            }}
          >
            NO. {profile?.username?.toUpperCase() || "PASS"}
          </div>
        </div>

        {/* Identity Details */}
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--color-red-950)", margin: 0 }}>
              {profile?.displayName || profile?.username}
            </h2>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-gold-700)", marginTop: 2 }}>
              @{profile?.username}
            </div>

            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--text-dark-secondary)" }}>
              {profile?.school && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <School style={{ width: 14, height: 14, color: "var(--color-gold-600)" }} />
                  <span>{profile.school}</span>
                </div>
              )}
              {profile?.academicTrack && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <GraduationCap style={{ width: 14, height: 14, color: "var(--color-gold-600)" }} />
                  <span>{profile.academicTrack} {profile.grade ? `(${profile.grade})` : ""}</span>
                </div>
              )}
            </div>
          </div>

          {/* Personal QR Code */}
          {passportQr && (
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div
                style={{
                  padding: 4,
                  background: "#ffffff",
                  borderRadius: 10,
                  border: "1px solid rgba(205, 163, 79, 0.5)",
                  display: "inline-block",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <img src={passportQr} alt="Expedition Pass QR" style={{ width: 84, height: 84, display: "block" }} />
              </div>
              <div style={{ fontSize: 9, color: "var(--text-dark-muted)", marginTop: 4, fontWeight: 600 }}>
                รหัสประจำตัว
              </div>
            </div>
          )}
        </div>

        {/* Points & Stats Footer */}
        <div
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: "1px dashed rgba(205, 163, 79, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span style={{ fontSize: 11, color: "var(--text-dark-muted)" }}>แต้มสะสมทั้งหมด</span>
            <div style={{ fontSize: 24, fontWeight: 900, color: "var(--color-red-900)" }}>
              {profile?.pointTotal ?? 0}{" "}
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-gold-700)" }}>แต้ม</span>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 11, color: "var(--text-dark-muted)" }}>พิชิตแดนศักดิ์สิทธิ์</span>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-jade-900)" }}>
              {visitedVenuesCount} / {totalVenuesCount}{" "}
              <span style={{ fontSize: 12, fontWeight: 600 }}>แดน</span>
            </div>
          </div>
        </div>
      </div>

      <RankCard name={profile?.displayName || profile?.username || ""} username={profile?.username || ""} points={profile?.pointTotal ?? 0} visited={visitedVenuesCount} total={totalVenuesCount} venueNames={venues.items.map((v) => v.name)} visitedFlags={venues.items.map((v) => visitedVenueIds.has(v.id))} />

      {/* ========================================================================= */}
      {/* 2. 4 MYTHOLOGICAL REALM STAMPS MATRIX (Reference 6)                       */}
      {/* ========================================================================= */}
      <RewardProgress />
      <div className="card-mythology" style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, color: "var(--color-gold-400)", letterSpacing: "0.08em" }}>
              SACRED REALM SEALS
            </span>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-light-primary)", margin: "2px 0 0" }}>
              4 ตราประทับเทพศักดิ์สิทธิ์
            </h3>
          </div>

          <div
            style={{
              padding: "4px 10px",
              borderRadius: 14,
              background: "rgba(205, 163, 79, 0.15)",
              border: "1px solid var(--color-gold-500)",
              color: "var(--color-gold-300)",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {completionPercent}% สำเร็จ
          </div>
        </div>

        {/* 2x2 Stamp Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {venues.items.map((venue) => {
            const isVisited = visitedVenueIds.has(venue.id);
            const stampMeta = realmFor(venue.visualIdentityKey);

            return (
              <div
                key={venue.id}
                className="passport-realm-card"
                style={{
                  background: isVisited
                    ? "radial-gradient(circle, rgba(125, 18, 18, 0.06) 0%, #ffffff 100%)"
                    : "#ffffff",
                  border: isVisited ? "1.5px solid var(--color-gold-500)" : "1.5px dashed rgba(205, 163, 79, 0.35)",
                  borderRadius: 16,
                  padding: "16px 12px",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: isVisited ? "0 4px 12px rgba(179, 134, 40, 0.15)" : "0 2px 6px rgba(0,0,0,0.03)",
                }}
              >
                <Link className="passport-photo" to={`/venue/${venue.id}`} aria-label={`สำรวจ${venue.name}`}><VenuePhoto identity={venue.visualIdentityKey} name={venue.name} /></Link>
                <h3 className="passport-place-name">{venue.name}</h3>
                <small className="passport-realm-name">{stampMeta.title}</small>
                <GuardianButton identity={venue.visualIdentityKey} className="passport-guardian-button">ผู้พิทักษ์</GuardianButton>

                <div style={{ marginTop: 8 }}>
                  {isVisited ? (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#166534",
                        backgroundColor: "#dcfce7",
                        padding: "2px 8px",
                        borderRadius: 10,
                        border: "1px solid #bbf7d0",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <CheckCircle2 style={{ width: 10, height: 10 }} />
                      ประทับตราแล้ว
                    </span>
                  ) : (
                    <Link
                      to={`/venue/${venue.id}`}
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "var(--color-gold-600)",
                        textDecoration: "none",
                      }}
                    >
                      ไปสำรวจแดนนี้ &gt;
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. EXPEDITION HISTORY & TIMELINE                                          */}
      {/* ========================================================================= */}
      <div className="card-mythology" style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Clock style={{ width: 16, height: 16, color: "var(--color-gold-600)" }} />
          <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-dark-primary)", margin: 0 }}>
            บันทึกการเดินทาง
          </h3>
        </div>

        {transactions.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {transactions.map((tx) => (
              <div
                key={tx.id}
                style={{
                  background: "#fbf8f1",
                  border: "1px solid var(--border-gold-subtle)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dark-primary)" }}>
                    {tx.activityTitle || "ภารกิจแดนมังกร"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-dark-secondary)", marginTop: 2 }}>
                        {placeName(tx.venueName || "คณะศิลปกรรมศาสตร์")} · {tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) : ""}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: tx.points > 0 ? "var(--color-gold-600)" : "#b91c1c",
                  }}
                >
                  {tx.points > 0 ? `+${tx.points}` : tx.points} แต้ม
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "20px", color: "var(--text-dark-secondary)", fontSize: 13 }}>
            ยังไม่มีประวัติการเช็กอิน ออกสำรวจแดนแรกและสแกน QR เพื่อสะสมแต้ม!
          </div>
        )}
      </div>

      {/* Account Logout Action */}
      <div style={{ textAlign: "center", marginTop: 8 }}>
        <button
          onClick={logout}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-dark-muted)",
            fontSize: 13,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <LogOut style={{ width: 14, height: 14 }} />
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}
