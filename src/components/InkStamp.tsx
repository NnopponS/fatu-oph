import { useEffect, useRef } from "react";
import { sfx } from "@/lib/sfx";
import { prefersReducedMotion } from "@/lib/anime";

/**
 * Vermilion seal slams onto the page: ink droplets splatter on a single
 * short-lived canvas (≈700ms, then the loop stops), the seal settles with a
 * spring rotation (CSS), and the impact SFX fires on the exact contact frame.
 */
export function InkStamp({ label = "ประทับตราสำเร็จ", points }: { label?: string; points?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const timer = setTimeout(() => sfx.success(), reduced ? 0 : 330);
    const el = canvas.current; const c = el?.getContext("2d");
    if (!el || !c || reduced) return () => clearTimeout(timer);
    const size = 320; const dpr = Math.min(window.devicePixelRatio || 1, 2);
    el.width = size * dpr; el.height = size * dpr; c.scale(dpr, dpr);
    const drops = Array.from({ length: 46 }, () => {
      const angle = Math.random() * Math.PI * 2; const speed = 1.4 + Math.random() * 4.2;
      return { x: size / 2, y: size / 2, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: 1 + Math.random() * 4.2, life: 1, hue: Math.random() < .25 ? "212,163,79" : "176,26,26" };
    });
    let raf = 0; let start = 0;
    const draw = (now: number) => {
      if (!start) start = now;
      const elapsed = now - start;
      c.clearRect(0, 0, size, size);
      if (elapsed < 330) { raf = requestAnimationFrame(draw); return; }
      let alive = false;
      for (const d of drops) {
        d.x += d.vx; d.y += d.vy; d.vx *= .9; d.vy *= .9; d.life -= .018;
        if (d.life <= 0) continue; alive = true;
        c.beginPath(); c.fillStyle = `rgba(${d.hue},${Math.max(0, d.life * .85)})`; c.arc(d.x, d.y, d.r * (.4 + d.life * .6), 0, Math.PI * 2); c.fill();
      }
      const wave = Math.min(1, (elapsed - 330) / 420);
      c.strokeStyle = `rgba(212,163,79,${(1 - wave) * .7})`; c.lineWidth = 3 * (1 - wave) + .5;
      c.beginPath(); c.arc(size / 2, size / 2, 40 + wave * 110, 0, Math.PI * 2); c.stroke();
      if (alive || wave < 1) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); clearTimeout(timer); };
  }, []);

  return <div className="ink-stamp-stage">
    <canvas ref={canvas} className="ink-splash" aria-hidden="true" />
    <span className="ink-shock" aria-hidden="true" />
    <img className="ink-seal" src="/assets/animations/checkin-stamp.svg" alt="" />
    <strong className="ink-label">{label}</strong>
    {points !== undefined && points > 0 && <span className="ink-points">+{points} แต้ม</span>}
  </div>;
}
