import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { AnnouncementBell } from "@/components/AnnouncementBell";
import { SoundToggle } from "@/components/SoundToggle";
import { useAuth } from "@/contexts/AuthContext";

interface TopHeaderProps {
  title?: string;
  showBack?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ title, showBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { firebaseUser, profile, isStaff } = useAuth();

  const isHome = location.pathname === "/" || location.pathname === "/home";
  const displayBack = showBack ?? !isHome;

  return (
    <header className="top-nav">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {displayBack && (
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "none",
              border: "none",
              color: "#e2ba6b",
              cursor: "pointer",
              padding: 4,
              display: "grid",
              placeItems: "center",
            }}
            aria-label="ย้อนกลับ"
          >
            <ChevronLeft style={{ width: 24, height: 24 }} />
          </button>
        )}

        <Link to="/" className="top-nav-logo">
          <img
            src="/assets/brand/dragon-seal.svg"
            alt="FATU ตะลุยแดนมังกร"
            className="top-nav-emblem"
          />
          <div className="top-nav-brand">
            <span className="top-nav-title">{title || "FATU"}</span>
            <span className="top-nav-subtitle">OPEN HOUSE 2026</span>
          </div>
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <SoundToggle />
        <AnnouncementBell />
        {isStaff && (
          <Link
            to="/admin"
            style={{
              padding: "4px 8px",
              background: "rgba(205, 163, 79, 0.2)",
              border: "1px solid rgba(205, 163, 79, 0.4)",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              color: "#f1d798",
              textDecoration: "none",
            }}
          >
            Staff
          </Link>
        )}

        {firebaseUser ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link
              to="/profile"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #7d1212, #540c0c)",
                border: "1.5px solid #d4af37",
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 700,
                textDecoration: "none",
                overflow: "hidden",
              }}
            >
              {profile?.displayName ? profile.displayName.slice(0, 1) : "P"}
            </Link>
          </div>
        ) : (
          <Link
            to="/login"
            style={{
              padding: "6px 14px",
              background: "linear-gradient(135deg, #7d1212, #540c0c)",
              border: "1px solid #d4af37",
              borderRadius: 9999,
              color: "#ffffff",
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            เข้าสู่ระบบ
          </Link>
        )}
      </div>
    </header>
  );
};
