import React, { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/anime";

interface Particle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speedY: number;
  speedX: number;
  sway: number;
  swaySpeed: number;
  color: string;
}

/**
 * CelestialDust renders ethereal, floating golden stardust and embers
 * that drift through the celestial realms, creating a magical fantasy atmosphere.
 */
export const CelestialDust: React.FC<{ count?: number; className?: string }> = ({
  count = 25,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Themed fantasy colors: Antique Gold, Celestial Jade, Imperial Crimson
    const colors = [
      "rgba(205, 163, 79,", // Gold
      "rgba(245, 158, 11,", // Bright Amber
      "rgba(161, 26, 26,",  // Cinnabar
      "rgba(22, 101, 52,",  // Jade
    ];

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.7 + 0.2,
      speedY: -(Math.random() * 0.4 + 0.2), // gentle upward float
      speedX: (Math.random() - 0.5) * 0.2,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.02 + 0.01,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.sway += p.swaySpeed;
        p.y += p.speedY;
        p.x += Math.sin(p.sway) * 0.3 + p.speedX;

        // Wrap around boundaries
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${p.alpha})`;
        ctx.shadowBlur = p.radius * 4;
        ctx.shadowColor = "rgba(205, 163, 79, 0.6)";
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={`celestial-dust-canvas ${className}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
        opacity: 0.65,
      }}
    />
  );
};
