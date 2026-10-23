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
    () => {
      let active = true;
      let revision = 0;
      const unsubscribe = subscribeToAuthState((user) => {
        const currentRevision = ++revision;
        if (!user) return setSession({ status: "signed-out" });
        setSession({ status: "loading" });
        void getStaffRole(user)
          .then((role) => {
            if (!active || currentRevision !== revision) return;
            if (role === "staff_pending") {
              navigate("/admin/pending", { replace: true });
              return;
            }
            setSession(role ? { status: "ready", user, role } : { status: "forbidden" });
          })
          .catch(() => { if (active && currentRevision === revision) setSession({ status: "forbidden" }); });
      });
      return () => { active = false; unsubscribe(); };
    },
    [navigate],
  );

  if (session.status === "loading") return <main className="standalone-page"><section className="admin-card">กำลังตรวจสอบสิทธิ์...</section></main>;
  if (session.status === "signed-out") return <Navigate to="/admin/login" replace />;
  if (session.status === "forbidden") return <main className="standalone-page"><section className="admin-card"><h1>ไม่มีสิทธิ์</h1><button className="text-button" onClick={() => void signOutAdmin().then(() => navigate("/admin/login"))}>ออกจากระบบ</button></section></main>;

  if (session.status !== "ready") return null;

  const modules = [
    { href: "/admin", label: "ภาพรวม", roles: ["admin", "editor", "staff", "viewer"] },
    { href: "/admin/field", label: "เช็กอิน / จ่ายรางวัล", roles: ["admin", "staff"] },
    { href: "/admin/activities", label: "กิจกรรม", roles: ["admin", "editor"] },
    { href: "/admin/venues", label: "สถานที่", roles: ["admin", "editor"] },
    { href: "/admin/prizes", label: "ของรางวัล", roles: ["admin", "editor"] },
    { href: "/admin/faq", label: "FAQ", roles: ["admin", "editor"] },
    { href: "/admin/announcements", label: "ประกาศ", roles: ["admin", "editor"] },
    { href: "/admin/operations", label: "ผู้เข้าร่วม / แต้ม", roles: ["admin", "staff"] },
    { href: "/admin/media", label: "สื่อ", roles: ["admin", "editor"] },
    { href: "/admin/audit", label: "Audit", roles: ["admin"] },
    { href: "/admin/settings", label: "ตั้งค่า / Staff", roles: ["admin", "editor"] },
  ];
  const links = modules.filter((item) => item.roles.includes(session.role));
  const pageModule = modules.find(item => location.pathname === item.href || location.pathname.startsWith(`${item.href}/`));
  // Select the exact route before the root /admin module when checking direct URLs.
  const requestedModule = modules.find(item => location.pathname === item.href) || pageModule;
  const allowed = !requestedModule || requestedModule.roles.includes(session.role);
  const roleLabels: Record<StaffRole, string> = { admin: "ผู้ดูแลระบบ", editor: "ผู้ดูแลเนื้อหา", staff: "เจ้าหน้าที่", viewer: "ผู้สังเกตการณ์", staff_pending: "รออนุมัติ" };

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div><strong>ศูนย์บัญชาการ · FATU OPH 2026</strong><small>{session.user.email} · {roleLabels[session.role]}</small></div>
        <div className="portal-topbar-actions"><Link to="/">ดูหน้าเว็บ</Link><button className="text-button" onClick={() => void signOutAdmin().then(() => navigate("/admin/login"))}>ออกจากระบบ</button></div>
      </header>
      <nav className="admin-nav" aria-label="เมนูทีมงานตามสิทธิ์">
        {links.map(({ href, label }) => <Link className={location.pathname === href ? "active" : ""} key={href} to={href}>{label}</Link>)}
      </nav>
      <div className="admin-content">{allowed ? <Outlet context={{ user: session.user, role: session.role } satisfies AdminSession} /> : <section className="admin-card" role="alert"><h1 className="admin-page-title">ไม่มีสิทธิ์เข้าหน้านี้</h1><p>บัญชี{roleLabels[session.role]}ไม่สามารถใช้เมนูนี้ได้</p><Link className="button-imperial-red" to="/admin">กลับหน้าทำงาน</Link></section>}</div>
    </main>
  );
}

export function AdminDashboardPage() {
  const { role } = useAdminSession();
  if (role === "staff") return <Navigate to="/admin/field" replace />;
  const modules = [
    ["กิจกรรม", "สร้าง/แก้ไขกิจกรรม เวลา คะแนน และ QR", "/admin/activities", ["admin", "editor"]],
    ["สถานที่", "แก้ข้อมูลสถานที่จริงและการเดินทาง", "/admin/venues", ["admin", "editor"]],
    ["ผู้เข้าร่วม", "ค้นหา ปรับแต้ม และแลกรางวัล", "/admin/operations", ["admin", "staff"]],
    ["ปฏิบัติงานหน้างาน", "บันทึกกิจกรรมและตรวจ Voucher รับรางวัล", "/admin/field", ["admin", "staff"]],
    ["สื่อ", "อัปโหลดรูป/วิดีโอเมื่อ Vercel Blob พร้อม", "/admin/media", ["admin", "editor"]],
  ].filter(([, , , roles]) => (roles as string[]).includes(role));
  return (
    <section>
      <span className="section-kicker">TEAM PORTAL</span>
      <h1 className="admin-page-title">ระบบจัดการ Open House</h1>
      <p>เลือกงานที่ต้องการทำ เมนูด้านบนแสดงเฉพาะสิทธิ์ของบัญชีคุณ</p>
      <div className="admin-dashboard-grid">
        {modules.map(([title, text, href]) => <Link className="admin-module-card" to={href as string} key={href as string}><h2>{title}</h2><p>{text}</p></Link>)}
      </div>
    </section>
  );
}
