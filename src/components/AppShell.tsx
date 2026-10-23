import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { prefersReducedMotion } from "@/lib/anime";
import { TopHeader } from "@/components/TopHeader";
import { BottomNavBar } from "@/components/BottomNavBar";
import { OpeningExperience } from "@/components/OpeningExperience";
import { PageTransition } from "@/components/PageTransition";
import { CelestialDust } from "@/components/CelestialDust";

export function AppShell() {
  const location = useLocation();
  const first = useRef(true);
  useEffect(() => {
    first.current = false;
  }, []);

  const titles: Record<string, string> = { "/scan": "สแกน QR", "/lucky-draw": "หีบสมบัติ", "/survey": "แบบประเมิน", "/schedule": "กิจกรรม", "/map": "แผนที่" };

  return (
    <div className="mobile-viewport">
      <CelestialDust count={24} />
      {!first.current && !prefersReducedMotion() && <div className="ink-wipe" key={location.pathname} aria-hidden="true" />}
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
