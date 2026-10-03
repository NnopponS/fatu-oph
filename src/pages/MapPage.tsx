import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Navigation,
  ExternalLink,
  Bus,
  Car,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useVenues } from "@/data/content";

const REALM_GRAPHICS: Record<string, { mascot: string; artImage: string; emblemColor: string }> = {
  "azure-dragon": {
    mascot: "/src/assets/characters/azure-dragon-mascot.svg",
    artImage: "/images/azure-dragon-art.jpg",
    emblemColor: "#0f766e",
  },
  "white-tiger": {
    mascot: "/src/assets/characters/white-tiger-mascot.svg",
    artImage: "/images/white-tiger-art.jpg",
    emblemColor: "#a16207",
  },
  "nine-tailed-fox": {
    mascot: "/src/assets/characters/nine-tailed-fox-mascot.svg",
    artImage: "/images/nine-tailed-fox-art.jpg",
    emblemColor: "#e11d48",
  },
  "red-phoenix": {
    mascot: "/src/assets/characters/red-phoenix-mascot.svg",
    artImage: "/images/red-phoenix-art.jpg",
    emblemColor: "#dc2626",
  },
};

export function MapPage() {
  const { items, loading } = useVenues();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "0 16px 40px" }}>
      {/* Hero Header */}
      <div
        className="card-mythology"
        style={{
          padding: "22px 20px",
          marginTop: 8,
          border: "1.5px solid var(--color-gold-400)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <MapPin style={{ width: 18, height: 18, color: "var(--color-gold-600)" }} />
          <span style={{ fontSize: 12, fontWeight: 800, color: "var(--color-gold-700)", letterSpacing: "0.08em" }}>
            EXPEDITION MAP
          </span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "var(--color-red-900)", margin: "0 0 6px" }}>
          แผนที่ & ดินแดนศักดิ์สิทธิ์
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-dark-secondary)", margin: 0, lineHeight: 1.5 }}>
          สำรวจ 4 ดินแดนจัดงาน คณะศิลปกรรมศาสตร์ มหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต พร้อมระบบนำทางจริง
        </p>
      </div>

      {loading && <p style={{ color: "var(--text-dark-secondary)", textAlign: "center" }}>กำลังโหลดข้อมูลสถานที่...</p>}

      {/* 4 Sacred Realms Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {items.map((venue) => {
          const graphic = REALM_GRAPHICS[venue.visualIdentityKey] || {
            mascot: "/src/assets/characters/azure-dragon-mascot.svg",
            artImage: "/images/azure-dragon-art.jpg",
            emblemColor: "#0f766e",
          };
          const mapsQuery = venue.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name + " คณะศิลปกรรมศาสตร์ มหาวิทยาลัยธรรมศาสตร์ รังสิต")}`;

          return (
            <article
              key={venue.id}
              className="card-mythology"
              style={{
                padding: "18px 20px",
                border: "1px solid var(--border-gold-subtle)",
                borderRadius: 18,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <Link to={`/venue/${venue.id}`} style={{ flexShrink: 0 }}>
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 16,
                      overflow: "hidden",
                      border: `2px solid ${graphic.emblemColor}`,
                      boxShadow: "0 3px 10px rgba(100, 70, 30, 0.12)",
                      background: "#fbf8f1",
                    }}
                  >
                    <img
                      src={graphic.artImage || graphic.mascot}
                      alt={venue.visualLabel || venue.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </Link>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span className="badge-gold" style={{ fontSize: 11, padding: "2px 8px" }}>
                      {venue.visualLabel || "ดินแดนจัดงาน"}
                    </span>
                  </div>

                  <Link
                    to={`/venue/${venue.id}`}
                    style={{
                      textDecoration: "none",
                      color: "var(--text-dark-primary)",
                      fontSize: 17,
                      fontWeight: 800,
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    {venue.name}
                  </Link>

                  <p style={{ fontSize: 12, color: "var(--text-dark-secondary)", margin: "0 0 12px", lineHeight: 1.4 }}>
                    {venue.directions || venue.description || "กดเปิดแผนที่นำทางไปยังอาคาร"}
                  </p>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <a
                      href={mapsQuery}
                      target="_blank"
                      rel="noreferrer"
                      className="button-gold"
                      style={{
                        textDecoration: "none",
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "7px 14px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Navigation style={{ width: 14, height: 14 }} />
                      <span>เปิด Google Maps นำทาง</span>
                      <ExternalLink style={{ width: 12, height: 12 }} />
                    </a>

                    <Link
                      to={`/venue/${venue.id}`}
                      className="button-gold-outline"
                      style={{
                        textDecoration: "none",
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "7px 12px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span>ดูกิจกรรมในจุดนี้</span>
                      <ChevronRight style={{ width: 14, height: 14 }} />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Transit & Campus Transport Info */}
      <div
        className="card-mythology"
        style={{
          borderRadius: 18,
          padding: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Bus style={{ width: 18, height: 18, color: "var(--color-gold-600)" }} />
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-red-900)", margin: 0 }}>
            การเดินทางภายใน มธ. รังสิต
          </h3>
        </div>

        <div style={{ display: "grid", gap: 10, fontSize: 12, color: "var(--text-dark-secondary)", lineHeight: 1.5 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ color: "var(--color-gold-700)", fontWeight: 700, flexShrink: 0 }}>รถ TU Around:</span>
            <span>บริการรถ EV ไฟฟ้าฟรีรอบมหาวิทยาลัย ขึ้นได้ทุกป้าย แนะนำสาย 1 และสาย 2 ผ่านหน้าคณะศิลปกรรมศาสตร์</span>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ color: "var(--color-gold-700)", fontWeight: 700, flexShrink: 0 }}>รถตู้ / รถเมล์:</span>
            <span>ลงที่จุดจอดรถตู้ศูนย์อาหารทียูโดม หรือป้ายหน้าสวทช. แล้วต่อรถ EV เข้ามายังโซนศิลปกรรมศาสตร์</span>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ color: "var(--color-gold-700)", fontWeight: 700, flexShrink: 0 }}>ที่จอดรถยนต์:</span>
            <span>สามารถจอดได้ที่ลานจอดรถตึก SC3 และลานจอดข้างอาคารยิมเนเซียม 4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
