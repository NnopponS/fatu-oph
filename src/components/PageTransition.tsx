import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { safeAnimate, createScope, prefersReducedMotion } from "@/lib/anime";

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * PageTransition handles smooth imperial navigation transitions between routes
 * using Anime.js v4. It gently rises and fades in new page content,
 * while automatically staggering any child cards (.ivory-card, .card-mythology).
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll window smoothly to top on route change
    window.scrollTo({ top: 0, behavior: "instant" });

    if (!containerRef.current || prefersReducedMotion()) {
      return;
    }

    const scope = createScope({ root: containerRef.current }).add(() => {
      // 1. Overall page container entrance
      safeAnimate(containerRef.current, {
        opacity: [0.01, 1],
        translateY: [14, 0],
        duration: 380,
        ease: "out(3)",
      });

      // 2. Staggered card entrance safely checking element existence
      safeAnimate(
        ".ivory-card, .card-mythology",
        {
          opacity: [0, 1],
          translateY: [18, 0],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          delay: (_el: any, i: number) => Math.min(i * 50, 200),
          duration: 420,
          ease: "out(3)",
        },
        containerRef.current
      );
    });

    return () => {
      scope.revert();
    };
  }, [location.pathname]);

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        width: "100%",
      }}
    >
      {children}
    </div>
  );
};
