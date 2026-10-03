import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { TopHeader } from "@/components/TopHeader";
import { BottomNavBar } from "@/components/BottomNavBar";
import { OpeningExperience } from "@/components/OpeningExperience";
import { PageTransition } from "@/components/PageTransition";
import { CelestialDust } from "@/components/CelestialDust";

export function AppShell() {
  const location = useLocation();

  // Hide chrome for immersive scanner and auth pages if routed under shell
  const isScanPage = location.pathname === "/scan";

  return (
    <div className="mobile-viewport">
      <CelestialDust count={20} />
      <OpeningExperience />
      {!isScanPage && <TopHeader />}
      <main
        style={{
          flex: 1,
          paddingBottom: isScanPage ? 0 : "calc(var(--nav-bottom-height, 68px) + 16px)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      {!isScanPage && <BottomNavBar />}
    </div>
  );
}
