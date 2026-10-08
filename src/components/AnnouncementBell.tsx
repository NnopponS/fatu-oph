import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, ScrollText, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAnnouncements } from "@/data/content";
import { sfx } from "@/lib/sfx";

const seenKey = "fatu_seen_announcements";
function readSeen(): string[] {
  try { const v: unknown = JSON.parse(localStorage.getItem(seenKey) || "[]"); return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []; }
  catch { return []; }
}

/** Replaces the previously dead bell icon: a real imperial-decree drawer fed by Admin announcements. */
export function AnnouncementBell() {
  const announcements = useAnnouncements();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(readSeen);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = useMemo(() => [...announcements.items].sort((a, b) => (b.level === "important" ? 1 : 0) - (a.level === "important" ? 1 : 0) || a.displayOrder - b.displayOrder), [announcements.items]);
  const unread = items.filter(item => !seen.includes(item.id)).length;

  function close() {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }
  function toggle() {
    if (open) { close(); return; }
    sfx.gong(); setOpen(true);
    const next = [...new Set([...seen, ...items.map(item => item.id)])];
    setSeen(next);
    try { localStorage.setItem(seenKey, JSON.stringify(next)); } catch { /* storage may be blocked */ }
  }
  useEffect(() => {
    if (!open) return;
    panel.current?.focus({ preventScroll: true });
    const previous = document.body.style.overflow; document.body.style.overflow = "hidden";
    function keys(event: KeyboardEvent) { if (event.key === "Escape") close(); }
    document.addEventListener("keydown", keys);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", keys); };
  }, [open]);

  return <>
    <button ref={trigger} type="button" className={`bell-button ${unread ? "has-unread" : ""}`} onClick={toggle} aria-haspopup="dialog" aria-expanded={open} aria-label={unread ? `ประกาศจากทีมงาน ${unread} รายการใหม่` : "ประกาศจากทีมงาน"}>
      <Bell size={18} />{unread > 0 && <b>{unread > 9 ? "9+" : unread}</b>}
    </button>
    <AnimatePresence>{open && <motion.div className="decree-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .25 }} onClick={close}>
      <motion.div ref={panel} tabIndex={-1} className="decree-panel" role="dialog" aria-modal="true" aria-labelledby="decree-title" onClick={event => event.stopPropagation()}
        initial={{ y: reduced ? 0 : -40, opacity: 0, scaleY: reduced ? 1 : .6 }} animate={{ y: 0, opacity: 1, scaleY: 1 }} exit={{ y: reduced ? 0 : -30, opacity: 0, scaleY: reduced ? 1 : .7 }} transition={{ type: "spring", damping: 24, stiffness: 240 }}>
        <span className="decree-roll top" aria-hidden="true" />
        <header><ScrollText size={20} /><div><small>IMPERIAL DECREES</small><h2 id="decree-title">ประกาศจากทีมงาน</h2></div><button type="button" onClick={close} aria-label="ปิดประกาศ"><X size={20} /></button></header>
        <div className="decree-list">
          {announcements.loading && <p role="status">กำลังอัญเชิญประกาศ...</p>}
          {!announcements.loading && !items.length && <p className="decree-empty">ยังไม่มีประกาศใหม่ ทีมงานจะแจ้งข่าวสำคัญที่นี่</p>}
          {items.map((item, index) => <motion.article key={item.id} className={`decree-item ${item.level}`} initial={{ opacity: 0, x: reduced ? 0 : -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: reduced ? 0 : .08 + index * .06 }}>
            {item.level === "important" && <span className="decree-tag">ด่วน</span>}
            <h3>{item.title}</h3>{item.body && <p>{item.body}</p>}
          </motion.article>)}
        </div>
        <span className="decree-roll bottom" aria-hidden="true" />
      </motion.div>
    </motion.div>}</AnimatePresence>
  </>;
}
