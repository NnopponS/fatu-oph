import { NavLink } from "react-router-dom";
import { Home, CalendarDays, MapPin, QrCode, UserRound } from "lucide-react";
export function BottomNavBar() {
  return <nav className="premium-bottom-nav" aria-label="เมนูหลักบนมือถือ">{[{to:"/",label:"หน้าหลัก",icon:Home},{to:"/schedule",label:"กิจกรรม",icon:CalendarDays},{to:"/scan",label:"เช็กอิน",icon:QrCode},{to:"/map",label:"แผนที่",icon:MapPin},{to:"/profile",label:"ใบเบิกทาง",icon:UserRound}].map(({to,label,icon:Icon}) => <NavLink key={to} to={to} end={to==="/"} className={({isActive}) => isActive ? "active" : ""}><Icon size={21} strokeWidth={1.7} /><span>{label}</span></NavLink>)}</nav>;
}
