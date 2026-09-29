import { useEffect, useState, type ReactNode } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate, useOutletContext } from "react-router-dom";
import type { User } from "firebase/auth";
import { getStaffRole, signOutAdmin, subscribeToAuthState, type StaffRole } from "@/services/auth";

export interface AdminSession {
  user: User;
  role: StaffRole;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminSession() {
  return useOutletContext<AdminSession>();
}

export function AdminAccess({
  roles,
  children,
}: {
  roles: StaffRole[];
  children: ReactNode;
}) {
  const session = useAdminSession();
  if (!roles.includes(session.role)) {
    return (
      <section>
        <span className="section-kicker">ACCESS</span>
        <h1 className="admin-page-title">ไม่มีสิทธิ์เข้าหน้านี้</h1>
      </section>
    );
  }
  return <>{children}</>;
}

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<
    { status: "loading" | "signed-out" | "forbidden" } | ({ status: "ready" } & AdminSession)
  >({ status: "loading" });

  useEffect(
    () =>
      subscribeToAuthState((user) => {
        if (!user) return setSession({ status: "signed-out" });
        void getStaffRole(user)
          .then((role) => setSession(role ? { status: "ready", user, role } : { status: "forbidden" }))
          .catch(() => setSession({ status: "forbidden" }));
      }),
    [],
  );

  if (session.status === "loading") return <main className="standalone-page"><section className="admin-card">กำลังตรวจสอบสิทธิ์...</section></main>;
  if (session.status === "signed-out") return <Navigate to="/admin/login" replace />;
  if (session.status === "forbidden") return <main className="standalone-page"><section className="admin-card"><h1>ไม่มีสิทธิ์</h1><button className="text-button" onClick={() => void signOutAdmin().then(() => navigate("/admin/login"))}>ออกจากระบบ</button></section></main>;

  if (session.status !== "ready") return null;

  const links = [
    { href: "/admin", label: "ภาพรวม", roles: ["admin", "editor", "staff", "viewer"] },
    { href: "/admin/activities", label: "กิจกรรม", roles: ["admin", "editor"] },
    { href: "/admin/venues", label: "สถานที่", roles: ["admin", "editor"] },
    { href: "/admin/prizes", label: "ของรางวัล", roles: ["admin", "editor"] },
    { href: "/admin/faq", label: "FAQ", roles: ["admin", "editor"] },
    { href: "/admin/announcements", label: "ประกาศ", roles: ["admin", "editor"] },
    { href: "/admin/operations", label: "ผู้เข้าร่วม / แต้ม", roles: ["admin", "staff"] },
    { href: "/admin/media", label: "สื่อ", roles: ["admin", "editor"] },
    { href: "/admin/audit", label: "Audit", roles: ["admin"] },
    { href: "/admin/settings", label: "ตั้งค่า / Staff", roles: ["admin", "editor"] },
  ].filter((item) => item.roles.includes(session.role));

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div><strong>FATU OPH 2026</strong><small>{session.user.email} · {session.role}</small></div>
        <button className="text-button" onClick={() => void signOutAdmin().then(() => navigate("/admin/login"))}>ออกจากระบบ</button>
      </header>
      <nav className="admin-nav" aria-label="Admin navigation">
        {links.map(({ href, label }) => <Link className={location.pathname === href ? "active" : ""} key={href} to={href}>{label}</Link>)}
      </nav>
      <div className="admin-content"><Outlet context={{ user: session.user, role: session.role } satisfies AdminSession} /></div>
    </main>
  );
}

export function AdminDashboardPage() {
  const modules = [
    ["กิจกรรม", "สร้าง/แก้ไขกิจกรรม เวลา คะแนน และ QR", "/admin/activities"],
    ["สถานที่", "แก้ข้อมูลสถานที่จริงและการเดินทาง", "/admin/venues"],
    ["ผู้เข้าร่วม", "ค้นหา ปรับแต้ม และแลกรางวัล", "/admin/operations"],
    ["สื่อ", "อัปโหลดรูป/วิดีโอเมื่อ Vercel Blob พร้อม", "/admin/media"],
  ];
  return (
    <section>
      <span className="section-kicker">ADMIN</span>
      <h1 className="admin-page-title">ระบบจัดการ Open House</h1>
      <div className="admin-dashboard-grid">
        {modules.map(([title, text, href]) => <Link className="admin-module-card" to={href} key={href}><h2>{title}</h2><p>{text}</p></Link>)}
      </div>
    </section>
  );
}
