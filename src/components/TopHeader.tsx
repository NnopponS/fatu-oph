import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function TopHeader({ title, showBack }: { title?: string; showBack?: boolean }) {
  const { profile, firebaseUser, isStaff } = useAuth(); const location = useLocation(); const navigate = useNavigate();
  return <header className="premium-nav"><div className="premium-nav-inner">
    {(showBack || location.pathname.startsWith("/activity/")) && <button className="nav-back" aria-label="ย้อนกลับ" onClick={() => navigate(-1)}><ArrowLeft size={20} /></button>}
    <Link to="/" className="premium-brand" aria-label="FATU Open House 2026 หน้าหลัก"><img src="/assets/brand/dragon-seal.svg" alt="" /><strong>FATU<span>OPEN HOUSE 2026</span></strong></Link>
    <nav className="desktop-navigation" aria-label="เมนูหลัก"><NavLink to="/" end>หน้าหลัก</NavLink><NavLink to="/schedule">กิจกรรมและกำหนดการ</NavLink><NavLink to="/explore">สถานที่</NavLink><NavLink to="/map">แผนที่</NavLink><NavLink to="/prizes">รางวัล</NavLink><NavLink to="/faq">ข้อมูลงาน</NavLink></nav>
    <Link className="nav-account" to={isStaff ? "/admin" : firebaseUser ? "/profile" : "/login"}>{isStaff ? "สำหรับทีมงาน" : firebaseUser ? profile?.displayName || "ใบเบิกทาง" : "เข้าสู่ระบบ"}<ArrowUpRight size={15} /></Link>
    {title && <span className="sr-only">{title}</span>}
  </div></header>;
}
