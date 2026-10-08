import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { prefersReducedMotion } from "@/lib/anime";
import { sfx, type StingKind } from "@/lib/sfx";

const STAFF_ROUTE = /^\/(staff|admin|field)(\/|$)/;
function stingFor(path: string): StingKind | null {
  if (path === "/") return "home";
  if (/^\/(explore|map|venues?|activities|activity|schedule|checkin|scan)/.test(path)) return "explore";
  if (/^\/(pass|profile|register|login)/.test(path)) return "pass";
  if (/^\/(rewards|prizes|survey)/.test(path)) return "reward";
  if (/^\/about/.test(path)) return "story";
  if (/^\/lucky-draw/.test(path)) return null; // that page scores its own ceremony
  return "info";
}

/** Short 5–8 s musical cue on participant page changes only. */
function useRouteSting() {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    const staff = STAFF_ROUTE.test(pathname);
    document.body.classList.toggle("staff-mode", staff);
    sfx.setMusicAllowed(!staff);
    if (first.current) { first.current = false; return; }
    if (staff || document.body.classList.contains("story-active")) return;
    const kind = stingFor(pathname);
    if (kind) sfx.sting(kind);
  }, [pathname]);
}

// Elements that fade/slide in once as they enter the viewport. Framer-driven cards are excluded on purpose.
const REVEAL = ".card-mythology,.ivory-card,.venue-mission-card,.schedule-activity,.travel-note,.places-section-heading,.silk-divider,.rank-card,.realm-place-grid>*,.map-place-stop";
const TILT = ".passport-realm-card,.venue-mission-card,.rank-card,.moon-window";

/** Delegated sound and motion feedback. No per-button listeners or render loop. */
export function InteractionEffects() {
  const root = useRef<HTMLDivElement>(null);
  useRouteSting();
  useEffect(() => {
    const unlock = () => {
      sfx.unlock();
      const path = window.location.pathname;
      if (STAFF_ROUTE.test(path) || document.body.classList.contains("story-active")) return;
      const kind = stingFor(path);
      if (kind) setTimeout(() => sfx.sting(kind), 120);
    };
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true });

    function feedback(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLButtonElement | HTMLAnchorElement>("button, a");
      if (!target || (target instanceof HTMLButtonElement && target.disabled)) return;
      const cue = target.dataset.sound;
      if (!target.closest(".sound-toggle,.bell-button") && cue !== "none") {
        if (cue === "page") sfx.page();
        else if (cue === "select" || target.hasAttribute("aria-pressed") || target.getAttribute("role") === "tab") sfx.select();
        else if (target.matches(".ceremony-button,.button-imperial-red,button[type=submit]")) { sfx.select(2); sfx.whoosh(.3, .4); }
        else if (target instanceof HTMLAnchorElement) sfx.page();
        else if (target.getAttribute("aria-expanded") === "true") sfx.chime();
        else sfx.tap();
      }
      if (prefersReducedMotion() || !root.current) return;
      const bounds = target.getBoundingClientRect();
      const ring = document.createElement("span"); ring.className = "action-qi-ring";
      for (let index = 0; index < 8; index++) {
        const spark = document.createElement("i"); spark.style.setProperty("--spark", String(index)); ring.appendChild(spark);
      }
      ring.style.left = `${event.detail ? event.clientX : bounds.left + bounds.width / 2}px`;
      ring.style.top = `${event.detail ? event.clientY : bounds.top + bounds.height / 2}px`;
      ring.addEventListener("animationend", event => { if (event.target === ring) ring.remove(); });
      root.current.appendChild(ring);
      while (root.current.childElementCount > 5) root.current.firstElementChild?.remove();
    }
    document.addEventListener("click", feedback);

    const reduced = prefersReducedMotion();
    let io: IntersectionObserver | null = null;
    let ambient: IntersectionObserver | null = null;
    let mo: MutationObserver | null = null;
    let queued = 0;
    if (!reduced && "IntersectionObserver" in window) {
      io = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        const siblings = el.parentElement ? Array.from(el.parentElement.children).indexOf(el) : 0;
        el.style.setProperty("--reveal-delay", `${Math.min(siblings, 6) * 70}ms`);
        el.classList.add("reveal-in"); io?.unobserve(el);
      }), { rootMargin: "0px 0px -8% 0px", threshold: .08 });
      const scan = () => {
        queued = 0;
        document.querySelectorAll<HTMLElement>(REVEAL).forEach(el => {
          if (el.dataset.reveal || el.closest(".wuxia-opening,.decree-panel")) return;
          el.dataset.reveal = "1"; el.classList.add("reveal-pending"); io!.observe(el);
        });
        document.querySelectorAll<HTMLElement>(".home-cinematic,.chinese-hero,.treasure-art-stage,.dragon-scroll,.moon-window").forEach(el => {
          if (el.dataset.ambient) return;
          el.dataset.ambient = "1"; ambient?.observe(el);
        });
      };
      ambient = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle("motion-offscreen", !entry.isIntersecting)), { rootMargin: "80px" });
      const schedule = () => { if (!queued) queued = requestAnimationFrame(scan); };
      mo = new MutationObserver(schedule); mo.observe(document.body, { childList: true, subtree: true }); schedule();
    }

    let frame = 0; let tiltEl: HTMLElement | null = null;
    function move(event: PointerEvent) {
      if (reduced || event.pointerType === "touch" || !(event.target instanceof Element)) return;
      const el = event.target.closest<HTMLElement>(TILT);
      if (tiltEl && tiltEl !== el) { tiltEl.style.removeProperty("--rx"); tiltEl.style.removeProperty("--ry"); tiltEl.classList.remove("is-tilting"); }
      tiltEl = el; if (!el || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0; const b = el.getBoundingClientRect();
        el.classList.add("is-tilting");
        el.style.setProperty("--ry", `${(((event.clientX - b.left) / b.width) - .5) * 10}deg`);
        el.style.setProperty("--rx", `${-(((event.clientY - b.top) / b.height) - .5) * 8}deg`);
      });
    }
    function leave() { if (tiltEl) { tiltEl.style.removeProperty("--rx"); tiltEl.style.removeProperty("--ry"); tiltEl.classList.remove("is-tilting"); tiltEl = null; } }
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);

    function visibility() { document.documentElement.classList.toggle("motion-sleep", document.hidden); }
    document.addEventListener("visibilitychange", visibility); visibility();

    return () => {
      window.removeEventListener("pointerdown", unlock); window.removeEventListener("keydown", unlock);
      document.removeEventListener("click", feedback); document.removeEventListener("pointermove", move); document.removeEventListener("pointerleave", leave); document.removeEventListener("visibilitychange", visibility);
      io?.disconnect(); ambient?.disconnect(); mo?.disconnect(); cancelAnimationFrame(queued); cancelAnimationFrame(frame);
    };
  }, []);
  return <div className="interaction-effects" ref={root} aria-hidden="true" />;
}
