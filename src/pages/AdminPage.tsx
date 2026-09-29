import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import type { User } from "firebase/auth";
import {
  getStaffRole,
  signOutAdmin,
  subscribeToAuthState,
  type StaffRole,
} from "@/services/auth";

type SessionState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "forbidden" }
  | { status: "ready"; user: User; role: StaffRole };

export function AdminPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionState>({ status: "loading" });

  useEffect(
    () =>
      subscribeToAuthState((user) => {
        if (!user) {
          setSession({ status: "signed-out" });
          return;
        }

        void getStaffRole(user)
          .then((role) => {
            setSession(
              role
                ? { status: "ready", user, role }
                : { status: "forbidden" },
            );
          })
          .catch(() => setSession({ status: "forbidden" }));
      }),
    [],
  );

  if (session.status === "loading") {
    return (
      <main className="standalone-page">
        <section className="admin-card">
          <p>กำลังตรวจสอบสิทธิ์...</p>
        </section>
      </main>
    );
  }

  if (session.status === "signed-out") {
    return <Navigate to="/admin/login" replace />;
  }

  if (session.status === "forbidden") {
    return (
      <main className="standalone-page">
        <section className="admin-card">
          <span className="section-kicker">ACCESS DENIED</span>
          <h1>บัญชีนี้ไม่มีสิทธิ์</h1>
          <button
            className="text-button"
            onClick={() => void signOutAdmin().then(() => navigate("/admin/login"))}
            type="button"
          >
            กลับไปหน้าเข้าสู่ระบบ
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div>
          <span className="section-kicker">ADMIN</span>
          <h1>FATU Open House 2026</h1>
          <p>{session.user.email} · {session.role}</p>
        </div>
        <button
          className="text-button"
          onClick={() => void signOutAdmin().then(() => navigate("/admin/login"))}
          type="button"
        >
          ออกจากระบบ
        </button>
      </header>

      <section className="admin-dashboard-grid">
        <article className="admin-module-card">
          <span>CONTENT</span>
          <h2>สถานที่และกิจกรรม</h2>
          <p>Firebase พร้อมแล้ว ขั้นถัดไปคือ Activity CRUD แบบ dynamic</p>
        </article>
        <article className="admin-module-card">
          <span>OPERATIONS</span>
          <h2>แต้มและ Check-in</h2>
          <p>จะใช้ trusted server mutation ก่อนเปิดการเขียน transaction จริง</p>
        </article>
        <article className="admin-module-card">
          <span>MEDIA</span>
          <h2>รูปและวิดีโอ</h2>
          <p>รอ Vercel Blob provisioning สำหรับไฟล์ที่ Admin อัปโหลด</p>
        </article>
      </section>
    </main>
  );
}
