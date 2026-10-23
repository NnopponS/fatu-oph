import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { TopHeader } from "@/components/TopHeader";
import { BottomNavBar } from "@/components/BottomNavBar";

export function AppShell() {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  const wide = ["/", "/schedule", "/explore"].includes(location.pathname);
  return <div className={`mobile-viewport premium-shell ${wide ? "wide-page" : "detail-page"}`}><a className="skip-link" href="#main-content">ข้ามไปเนื้อหา</a><TopHeader /><main className="app-content" id="main-content"><Outlet /></main><BottomNavBar /></div>;
}
