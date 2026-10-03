import React from "react";
import { useAnimeScope, safeAnimate, stagger } from "@/lib/anime";

interface ThemedLoadingProps {
  message?: string;
  fullscreen?: boolean;
}

export const ThemedLoading: React.FC<ThemedLoadingProps> = ({
  message = "กำลังเปิดตำนานแดนมังกร...",
  fullscreen = false,
}) => {
  const { rootRef } = useAnimeScope(() => {
    const root = rootRef.current;
    if (!root) return;

    // 1. Slow, majestic rotation of the sacred dragon seal
    safeAnimate(".anime-seal-rotator", {
      rotate: 360,
      duration: 12000,
      loop: true,
      ease: "linear",
    }, root);

    // 2. Breathing scale pulse on the inner seal
    safeAnimate(".anime-seal-pulse", {
      scale: [0.92, 1.05, 0.92],
      duration: 2200,
      loop: true,
      ease: "inOut(2)",
    }, root);

    // 3. Golden celestial aura ring pulse
    safeAnimate(".anime-aura-ring", {
      scale: [0.85, 1.15, 0.85],
      opacity: [0.25, 0.65, 0.25],
      duration: 2600,
      loop: true,
      ease: "inOut(2)",
    }, root);

    // 4. Staggered celestial pearls bouncing
    safeAnimate(".anime-dot", {
      translateY: [-5, 2],
      opacity: [0.4, 1, 0.4],
      delay: stagger(140),
      duration: 800,
      loop: true,
      alternate: true,
      ease: "inOut(2)",
    }, root);

    // 5. Subtle calligraphy text breathing
    safeAnimate(".anime-loading-text", {
      opacity: [0.7, 1, 0.7],
      duration: 1800,
      loop: true,
      ease: "inOut(2)",
    }, root);
  }, []);

  if (fullscreen) {
    return (
      <div ref={rootRef} className="loading-overlay" style={{ background: "rgba(252, 250, 244, 0.96)", backdropFilter: "blur(8px)" }}>
        <div style={{ position: "relative", width: 110, height: 110, display: "grid", placeItems: "center" }}>
          {/* Outer Golden Halo Ring */}
          <div
            className="anime-aura-ring"
            style={{
              position: "absolute",
              inset: -8,
              borderRadius: "50%",
              border: "2px dashed var(--color-gold-500)",
              pointerEvents: "none",
            }}
          />

          {/* Rotating Seal Container */}
          <div className="anime-seal-rotator" style={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}>
            <img
              src="/src/assets/animations/loading-seal.svg"
              alt=""
              className="anime-seal-pulse"
              style={{
                width: 80,
                height: 80,
                filter: "drop-shadow(0 4px 14px rgba(125, 18, 18, 0.25))",
              }}
            />
          </div>
        </div>

        {/* Themed Calligraphy Message */}
        <div
          className="anime-loading-text"
          style={{
            marginTop: 20,
            color: "var(--color-red-950)",
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textAlign: "center",
          }}
        >
          {message}
        </div>

        {/* 3 Staggered Celestial Dots */}
        <div style={{ display: "flex", gap: 6, marginTop: 10, justifyContent: "center" }}>
          <span className="anime-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-gold-600)" }} />
          <span className="anime-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-red-800)" }} />
          <span className="anime-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-jade-700)" }} />
        </div>
      </div>
    );
  }

  // Inline Loading (for inside cards / sections)
  return (
    <div
      ref={rootRef}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "36px 20px",
        gap: 12,
      }}
    >
      <div style={{ position: "relative", width: 56, height: 56, display: "grid", placeItems: "center" }}>
        <div
          className="anime-aura-ring"
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: "50%",
            border: "1.5px dashed var(--color-gold-400)",
          }}
        />
        <div className="anime-seal-rotator" style={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}>
          <img
            src="/src/assets/animations/loading-seal.svg"
            alt=""
            className="anime-seal-pulse"
            style={{ width: 44, height: 44 }}
          />
        </div>
      </div>

      <div
        className="anime-loading-text"
        style={{
          color: "var(--color-gold-700)",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.04em",
        }}
      >
        {message}
      </div>

      <div style={{ display: "flex", gap: 5 }}>
        <span className="anime-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-gold-600)" }} />
        <span className="anime-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-red-700)" }} />
        <span className="anime-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--color-gold-600)" }} />
      </div>
    </div>
  );
};
