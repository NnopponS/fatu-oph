import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Compass, Gift, Scroll, QrCode } from "lucide-react";

export const BottomNavBar: React.FC = () => {
  return (
    <nav className="bottom-nav">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}
      >
        <Home className="bottom-nav-icon" />
        <span>หน้าหลัก</span>
      </NavLink>

      <NavLink
        to="/map"
        className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}
      >
        <Compass className="bottom-nav-icon" />
        <span>แผนที่</span>
      </NavLink>

      <NavLink
        to="/scan"
        className="scanner-nav-button"
        title="สแกนเช็กอิน"
      >
        <QrCode style={{ width: 24, height: 24 }} />
      </NavLink>

      <NavLink
        to="/rewards"
        className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}
      >
        <Gift className="bottom-nav-icon" />
        <span>รางวัล</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}
      >
        <Scroll className="bottom-nav-icon" />
        <span>ใบเบิกทาง</span>
      </NavLink>
    </nav>
  );
};
