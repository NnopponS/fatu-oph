import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/anime";

export function InteractionEffects() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function feedback(event: MouseEvent) {
      if (prefersReducedMotion() || !(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLButtonElement | HTMLAnchorElement>("button, a");
      if (!target || (target instanceof HTMLButtonElement && target.disabled) || !root.current) return;
      const bounds = target.getBoundingClientRect();
      const ring = document.createElement("span"); ring.className = "action-qi-ring";
      for (let index = 0; index < 8; index++) {
        const spark = document.createElement("i"); spark.style.setProperty("--spark", String(index)); ring.appendChild(spark);
      }
      ring.style.left = `${event.detail ? event.clientX : bounds.left + bounds.width / 2}px`;
      ring.style.top = `${event.detail ? event.clientY : bounds.top + bounds.height / 2}px`;
      ring.addEventListener("animationend", () => ring.remove(), { once: true });
      root.current.appendChild(ring);
      while (root.current.childElementCount > 5) root.current.firstElementChild?.remove();
    }
    document.addEventListener("click", feedback);
    return () => document.removeEventListener("click", feedback);
  }, []);
  return <div className="interaction-effects" ref={root} aria-hidden="true" />;
}
