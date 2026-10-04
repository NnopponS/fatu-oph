import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { getAdminAuthErrorMessage, getStaffRole, signInAdmin, signOutAdmin, usernameLogin } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";
import { Lantern } from "@/components/WuxiaScene";

export function AdminLoginPage() {
  const navigate = useNavigate(); const { firebaseUser, loading: authLoading, refreshProfile } = useAuth();
  const [identity, setIdentity] = useState(""); const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!firebaseUser || authLoading || submitting) return;
    let active = true;
    void getStaffRole(firebaseUser).then(role => {
      if (active && role) navigate(role === "staff_pending" ? "/admin/pending" : "/admin", { replace: true });
    }).catch(() => undefined);
    return () => { active = false; };
  }, [firebaseUser, authLoading, submitting, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setError(null);
    try {
      const user = identity.includes("@") ? (await signInAdmin(identity.trim(), password)).user : (await usernameLogin(identity.trim(), password)).user;
      const role = await getStaffRole(user);
      if (!role) { await signOutAdmin(); setError("บัญชีนี้ไม่มีสิทธิ์เจ้าหน้าที่ กรุณาใช้ทางเข้าผู้เข้าร่วมงาน"); return; }
      await refreshProfile();
      navigate(role === "staff_pending" ? "/admin/pending" : "/admin", { replace: true });
    } catch (loginError) {
      await signOutAdmin().catch(() => undefined);
      setError(loginError instanceof Error && !("code" in loginError) ? loginError.message : getAdminAuthErrorMessage(loginError));
    } finally { setSubmitting(false); }
  }

  return <main className="portal-login">
    <div className="portal-login-art"><div className="portal-lantern"><Lantern /></div><span className="eyebrow">FATU OPEN HOUSE 2026</span><ShieldCheck size={42} /><h1>ศูนย์บัญชาการ<br /><em>แดนมังกร</em></h1><p>ทางเข้าเดียวสำหรับ Staff และ Admin<br />เมนูทำงานจะแสดงตามสิทธิ์ของบัญชีคุณ</p><Link to="/">กลับหน้าเว็บไซต์ <ArrowRight size={16} /></Link></div>
    <section className="portal-login-form"><span className="eyebrow">TEAM PORTAL</span><h2>เข้าสู่ระบบจัดการ</h2><p>ใช้ชื่อผู้ใช้เจ้าหน้าที่ หรืออีเมลบัญชี Admin</p>
      <form onSubmit={handleSubmit} className="admin-form">
        <label><span>ชื่อผู้ใช้หรืออีเมล</span><div className="portal-input"><UserRound size={18} /><input name="identity" autoComplete="username" required value={identity} onChange={event => setIdentity(event.target.value)} placeholder="Staff username / Admin email" /></div></label>
        <label><span>รหัสผ่าน</span><div className="portal-input"><LockKeyhole size={18} /><input name="password" autoComplete="current-password" required type={showPassword ? "text" : "password"} value={password} onChange={event => setPassword(event.target.value)} /><button type="button" aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button-imperial-red" disabled={submitting || authLoading} type="submit">{submitting ? "กำลังตรวจสอบสิทธิ์..." : "เข้าสู่ศูนย์บัญชาการ"}<ArrowRight size={18} /></button>
      </form>
      <Link className="portal-forgot" to="/forgot-password">ลืมรหัสผ่าน</Link>
      <div className="portal-signup"><span>ยังไม่มีบัญชีทีมงาน?</span><Link to="/admin/register">สมัครเจ้าหน้าที่</Link></div>
      <Link className="portal-participant-link" to="/login">เข้าสู่ระบบสำหรับผู้เข้าร่วมงาน</Link>
    </section>
  </main>;
}
