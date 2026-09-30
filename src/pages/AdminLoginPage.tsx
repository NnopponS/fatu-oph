import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import {
  getAdminAuthErrorMessage,
  getStaffRole,
  sendAdminPasswordReset,
  signInAdmin,
  signOutAdmin,
} from "@/services/auth";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (auth.currentUser) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const credential = await signInAdmin(email.trim(), password);
      const role = await getStaffRole(credential.user);

      if (!role) {
        await signOutAdmin();
        setError("บัญชีนี้ไม่มีสิทธิ์เข้าระบบจัดการ");
        return;
      }

      navigate("/admin", { replace: true });
    } catch (loginError) {
      await signOutAdmin().catch(() => undefined);
      setError(getAdminAuthErrorMessage(loginError));
    } finally {
      setSubmitting(false);
    }
  }

  async function resetPassword() {
    const target = email.trim();
    setError(null);
    setNotice(null);
    if (!target) {
      setError("กรอกอีเมล Admin ก่อนขอรีเซ็ตรหัสผ่าน");
      return;
    }

    try {
      await sendAdminPasswordReset(target);
      setNotice("ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว หากอีเมลนี้มีบัญชี Admin กรุณาตรวจกล่องจดหมาย");
    } catch (resetError) {
      setError(getAdminAuthErrorMessage(resetError));
    }
  }

  return (
    <main className="standalone-page">
      <section className="admin-card admin-login-card">
        <span className="section-kicker">ADMIN</span>
        <h1>เข้าสู่ระบบจัดการ</h1>
        <p>สำหรับทีมงาน FATU Open House 2026 เท่านั้น</p>

        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            <span>อีเมล</span>
            <input
              autoComplete="username"
              inputMode="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label>
            <span>รหัสผ่าน</span>
            <input
              autoComplete="current-password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {error ? <p className="form-error" role="alert">{error}</p> : null}
          {notice ? <p className="success-message" role="status">{notice}</p> : null}

          <button className="admin-submit" disabled={submitting} type="submit">
            {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
          <button className="text-button" disabled={submitting} onClick={() => void resetPassword()} type="button">
            ลืมรหัสผ่าน / ส่งลิงก์รีเซ็ต
          </button>
        </form>
      </section>
    </main>
  );
}
