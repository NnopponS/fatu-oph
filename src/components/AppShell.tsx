import { Outlet, useLocation } from "react-router-dom";
import { TopHeader } from "@/components/TopHeader";
import { BottomNavBar } from "@/components/BottomNavBar";
import { OpeningExperience } from "@/components/OpeningExperience";
import { PageTransition } from "@/components/PageTransition";
import { CelestialDust } from "@/components/CelestialDust";

export function AppShell() {
  const location = useLocation();

  const titles: Record<string, string> = { "/scan": "สแกน QR", "/lucky-draw": "หีบสมบัติ", "/survey": "แบบประเมิน", "/schedule": "กิจกรรม", "/map": "แผนที่" };

  return (
    <div className="mobile-viewport">
      <CelestialDust count={20} />
      <OpeningExperience />
      <TopHeader title={titles[location.pathname]} />
      <main className="app-content">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <BottomNavBar />
    </div>
  );
}
