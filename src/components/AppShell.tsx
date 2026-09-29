import { CalendarDays, Compass, Gift, MapPinned, Ticket } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "หน้าหลัก", icon: Compass, end: true },
  { to: "/explore", label: "สำรวจ", icon: MapPinned, end: false },
  { to: "/schedule", label: "ตาราง", icon: CalendarDays, end: false },
  { to: "/pass", label: "บัตร", icon: Ticket, end: false },
  { to: "/prizes", label: "รางวัล", icon: Gift, end: false },
];

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink to="/" className="brand" aria-label="FATU Open House 2026">
          <span className="brand-mark" aria-hidden="true">FATU</span>
          <span>
            <strong>OPEN HOUSE 2026</strong>
            <small>Faculty of Fine and Applied Arts</small>
          </span>
        </NavLink>
        <div className="header-links">
          <Link to="/faq">ข้อมูล</Link>
          <Link to="/assistant">ผู้ช่วย</Link>
        </div>
      </header>

      <main className="main-content"><Outlet /></main>

      <nav className="bottom-nav" aria-label="เมนูหลัก">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink className={({ isActive }) => "nav-item" + (isActive ? " nav-item-active" : "")} end={end} key={to} to={to}>
            <Icon size={20} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
