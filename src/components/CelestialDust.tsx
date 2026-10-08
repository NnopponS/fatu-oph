import React, { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/anime";

interface Particle { x: number; y: number; size: number; alpha: number; vy: number; vx: number; sway: number; swaySpeed: number; sprite: number; depth: number; spin: number; rot: number }

/** Pre-render a soft glow once; per-frame drawing is a cheap drawImage (no shadowBlur, which is very expensive on phones). */
function makeSprite(color: string, size = 48) {
  const s = document.createElement("canvas"); s.width = s.height = size;
  const c = s.getContext("2d")!; const g = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, `rgba(${color},1)`); g.addColorStop(.25, `rgba(${color},.55)`); g.addColorStop(1, `rgba(${color},0)`);
  c.fillStyle = g; c.fillRect(0, 0, size, size); return s;
}
function makePetal(color: string, size = 32) {
  const s = document.createElement("canvas"); s.width = s.height = size;
  const c = s.getContext("2d")!; c.translate(size / 2, size / 2); c.fillStyle = `rgba(${color},.9)`;
  c.beginPath(); c.moveTo(0, -size * .42); c.bezierCurveTo(size * .42, -size * .2, size * .3, size * .38, 0, size * .42); c.bezierCurveTo(-size * .3, size * .38, -size * .42, -size * .2, 0, -size * .42); c.fill();
  c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -size * .35); c.lineTo(0, size * .3); c.stroke(); return s;
}

/**
 * Ambient layer: golden embers rising + plum-blossom petals drifting down with
 * depth parallax tied to scroll. ~20 sprites at ≤30fps, paused when the tab is hidden.
 */
export const CelestialDust: React.FC<{ count?: number; className?: string }> = ({ count = 25, className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (prefersReducedMotion() || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = 0; let height = 0; let raf = 0; let last = 0; let scrollY = window.scrollY; let running = true;
    const sprites = [makeSprite("245,190,90"), makeSprite("255,120,60"), makeSprite("90,210,190"), makePetal("232,120,150"), makePetal("255,214,220")];
    const resize = () => { width = window.innerWidth; height = window.innerHeight; canvas.width = width * dpr; canvas.height = height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize();
    const spawn = (initial: boolean): Particle => {
      const petal = Math.random() < .3; const depth = .4 + Math.random() * .9;
      return { x: Math.random() * width, y: initial ? Math.random() * height : petal ? -20 : height + 20, size: petal ? 10 + depth * 9 : 8 + depth * 14, alpha: .25 + Math.random() * .6,
        vy: petal ? .35 + Math.random() * .5 : -(.2 + Math.random() * .45), vx: (Math.random() - .5) * .3, sway: Math.random() * 6.28, swaySpeed: .008 + Math.random() * .02,
        sprite: petal ? 3 + Math.round(Math.random()) : Math.floor(Math.random() * 3), depth, spin: (Math.random() - .5) * .04, rot: Math.random() * 6.28 };
    };
    const particles = Array.from({ length: Math.min(count, 28) }, () => spawn(true));
    const onScroll = () => { scrollY = window.scrollY; };
    const onVisibility = () => { cancelAnimationFrame(raf); running = !document.hidden && !document.body.classList.contains("story-active"); if (running) { last = 0; raf = requestAnimationFrame(frame); } };
    function frame(now: number) {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      if (now - last < 33) return; // cap ~30fps
      last = now;
      ctx!.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.sway += p.swaySpeed; p.y += p.vy * p.depth; p.x += Math.sin(p.sway) * .4 * p.depth + p.vx; p.rot += p.spin;
        if (p.y < -30 || p.y > height + 30) { particles[i] = spawn(false); continue; }
        if (p.x < -30) p.x = width + 30; else if (p.x > width + 30) p.x = -30;
        const py = ((p.y - scrollY * .06 * p.depth) % (height + 60) + height + 60) % (height + 60) - 30;
        ctx!.globalAlpha = p.alpha * (.7 + Math.sin(p.sway * 2) * .3);
        if (p.sprite >= 3) { ctx!.save(); ctx!.translate(p.x, py); ctx!.rotate(p.rot); ctx!.drawImage(sprites[p.sprite], -p.size / 2, -p.size / 2, p.size, p.size); ctx!.restore(); }
        else ctx!.drawImage(sprites[p.sprite], p.x - p.size, py - p.size, p.size * 2, p.size * 2);
      }
      ctx!.globalAlpha = 1;
    }
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("fatu_intro_visibility", onVisibility);
    onVisibility();
    return () => { running = false; cancelAnimationFrame(raf); window.removeEventListener("resize", resize); window.removeEventListener("scroll", onScroll); document.removeEventListener("visibilitychange", onVisibility); window.removeEventListener("fatu_intro_visibility", onVisibility); };
  }, [count]);

  return <canvas ref={canvasRef} className={`celestial-dust-canvas ${className}`} aria-hidden="true" style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1, opacity: .8 }} />;
};
