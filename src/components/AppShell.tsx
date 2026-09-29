import { Compass, Gift, MapPinned } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "หน้าหลัก", icon: Compass, end: true, disabled: false },
  { to: "/explore", label: "สถานที่", icon: MapPinned, end: false, disabled: false },
  { to: "/prizes", label: "ของรางวัล", icon: Gift, end: false, disabled: true },
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
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      <nav className="bottom-nav" aria-label="เมนูหลัก">
        {navItems.map(({ to, label, icon: Icon, end, disabled }) =>
          disabled ? (
            <span className="nav-item nav-item-disabled" key={to} aria-disabled="true">
              <Icon size={20} strokeWidth={1.8} />
              <span>{label}</span>
            </span>
          ) : (
            <NavLink
              className={({ isActive }) => "nav-item" + (isActive ? " nav-item-active" : "")}
              end={end}
              key={to}
              to={to}
            >
              <Icon size={20} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ),
        )}
      </nav>
    </div>
  );
}
