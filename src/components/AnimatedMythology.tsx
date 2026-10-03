import React, { useEffect, useRef } from "react";
import { animate, createScope, spring, prefersReducedMotion } from "@/lib/anime";

interface AnimatedSealStampProps {
  image: string;
  sealTitle: string;
  isVisited: boolean;
  size?: number;
  triggerKey?: string | number;
}

/**
 * AnimatedSealStamp creates an authentic imperial seal impression animation
 * using Anime.js v4 when a checkpoint or realm is conquered.
 */
export const AnimatedSealStamp: React.FC<AnimatedSealStampProps> = ({
  image,
  sealTitle,
  isVisited,
  size = 72,
  triggerKey,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisited || prefersReducedMotion() || !containerRef.current) return;

    const scope = createScope({ root: containerRef.current }).add(() => {
      // 1. Heavy imperial seal stamp down with spring impact
      animate(".stamp-ring", {
        scale: [2.0, 1],
        rotate: [-15, 0],
        opacity: [0.2, 1],
        duration: 480,
        ease: spring({ bounce: 0.45 }),
      });

      // 2. Vermilion ink shockwave ripple
      animate(".stamp-ripple", {
        scale: [1, 1.7],
        opacity: [0.75, 0],
        duration: 520,
        ease: "out(3)",
      });

      // 3. Inner creature emblem settles with slight rebound
      animate(".stamp-emblem", {
        scale: [0.6, 1],
        opacity: [0, 1],
        delay: 80,
        duration: 400,
        ease: "out(3)",
      });
    });

    return () => scope.revert();
  }, [isVisited, triggerKey]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: size,
        height: size,
        margin: "0 auto 10px",
        display: "grid",
        placeItems: "center",
      }}
    >
      {isVisited ? (
        <>
          {/* Vermilion Ink Shockwave Ripple */}
          <div
            className="stamp-ripple"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "2px solid var(--color-red-700)",
              pointerEvents: "none",
              opacity: 0,
            }}
          />

          {/* Chinese Seal Stamp Ring */}
          <img
            src="/assets/animations/checkin-stamp.svg"
            alt={sealTitle}
            className="stamp-ring"
            style={{
              width: "100%",
              height: "100%",
              filter: "drop-shadow(0 2px 8px rgba(125, 18, 18, 0.35))",
            }}
          />

          {/* Inner Creature Emblem */}
          <div
            className="stamp-emblem"
            style={{
              position: "absolute",
              inset: Math.round(size * 0.2),
              display: "grid",
              placeItems: "center",
            }}
          >
            <img
              src={image}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        </>
      ) : (
        /* Unvisited Seal Outline */
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: "1.5px dashed rgba(205, 163, 79, 0.35)",
            display: "grid",
            placeItems: "center",
            opacity: 0.35,
          }}
        >
          <img
            src={image}
            alt=""
            style={{ width: "60%", height: "60%", objectFit: "contain", filter: "grayscale(100%)" }}
          />
        </div>
      )}
    </div>
  );
};

/**
 * FloatingMythologyAura creates a gentle celestial floating motion
 * for mythical mascot avatars and dragon seals.
 */
export const FloatingMythologyAura: React.FC<{
  children: React.ReactNode;
  duration?: number;
  distance?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, duration = 3000, distance = 6, className, style }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !containerRef.current) return;

    const scope = createScope({ root: containerRef.current }).add(() => {
      animate(containerRef.current, {
        translateY: [-distance, distance],
        duration,
        alternate: true,
        loop: true,
        ease: "inOut(2)",
      });
    });

    return () => scope.revert();
  }, [distance, duration]);

  return (
    <div ref={containerRef} className={className} style={{ display: "inline-block", ...style }}>
      {children}
    </div>
  );
};
