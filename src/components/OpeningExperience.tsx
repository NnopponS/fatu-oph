import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Gift, MapPin, ScrollText, Sparkles, Swords, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useVenues, useRewardPolicy } from "@/data/content";
import { VenuePhoto } from "@/components/RealmPlaces";
import { realmFor } from "@/lib/realms";
import { ImperialGate, Lantern, QiParticles } from "@/components/WuxiaScene";
import { CelestialArray } from "@/components/CelestialArray";
import { sfx } from "@/lib/sfx";
import { SoundToggle } from "@/components/SoundToggle";
import { Cloudscape, ImperialCouplet, LatticeCorners } from "@/components/ChineseOrnaments";

const guardians = [
  { key: "azure-dragon", title: "มังกรฟ้า", place: "โรงละคอน", art: "/images/azure-dragon-art.webp", color: "#54c9d3", copy: "ปลุกพลังแห่งการแสดง" },
  { key: "white-tiger", title: "พยัคฆ์ขาว", place: "ตึกคณะศิลปกรรมศาสตร์", art: "/images/white-tiger-art.webp", color: "#ebcc89", copy: "เปิดโลกศิลปะและการออกแบบ" },
  { key: "nine-tailed-fox", title: "จิ้งจอกเก้าหาง", place: "โรงทอ", art: "/images/nine-tailed-fox-art.webp", color: "#ef9bcd", copy: "ค้นพบวิชาแห่งเส้นใย" },
  { key: "red-phoenix", title: "หงส์แดง", place: "ตึก SC3", art: "/images/red-phoenix-art.webp", color: "#ff987d", copy: "จุดประกายความคิดสร้างสรรค์" },
];

export function OpeningExperience() {
  const navigate = useNavigate(); const venues = useVenues(); const reduced = useReducedMotion();
  const { rules } = useRewardPolicy();
  const [show, setShow] = useState(false);
  const [stage, setStage] = useState(0);
  const [opening, setOpening] = useState(false);
  const [selected, setSelected] = useState(guardians[0].key);
  const [summoned, setSummoned] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(() => document.hidden);
  const rootRef = useRef<HTMLDivElement>(null);
  const chosen = guardians.find(guardian => guardian.key === selected)!;

  const awaken = useCallback(() => {
    setOpening(true);
    sfx.rise(1.6);
  }, []);

  useEffect(() => {
    if (!sessionStorage.getItem("fatu_story_intro_seen") && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) setShow(true);
    function replay() { setStage(0); setOpening(false); setSummoned(null); setPaused(false); setShow(true); }
    function visibility() { setHidden(document.hidden); }
    window.addEventListener("replay_story_intro", replay);
    document.addEventListener("visibilitychange", visibility);
    return () => { window.removeEventListener("replay_story_intro", replay); document.removeEventListener("visibilitychange", visibility); };
  }, []);

  useEffect(() => {
    if (!show || !opening || hidden || paused) return;
    const impact = setTimeout(() => sfx.impact(1), reduced ? 0 : 1100);
    const transition = setTimeout(() => { setStage(1); setOpening(false); }, reduced ? 0 : 1800);
    return () => { clearTimeout(impact); clearTimeout(transition); };
  }, [show, opening, reduced, hidden, paused]);

  useEffect(() => {
    if (!show) return;
    const scroll = document.body.style.overflow;
    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    document.body.classList.add("story-active");
    window.dispatchEvent(new CustomEvent("fatu_intro_visibility", { detail: true }));
    const siblings = Array.from(rootRef.current?.parentElement?.children || []).filter((el): el is HTMLElement => el instanceof HTMLElement && el !== rootRef.current);
    const inert = siblings.map(el => el.inert);
    siblings.forEach(el => { el.inert = true; });
    rootRef.current?.focus({ preventScroll: true });
    function keys(event: KeyboardEvent) {
      if (event.key === "Escape") { sessionStorage.setItem("fatu_story_intro_seen", "1"); setShow(false); }
      if (event.key !== "Tab") return;
      const buttons = Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") || []);
      const first = buttons[0]; const last = buttons[buttons.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === rootRef.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", keys);
    return () => {
      document.body.style.overflow = scroll; document.body.classList.remove("story-active");
      window.dispatchEvent(new CustomEvent("fatu_intro_visibility", { detail: false }));
      siblings.forEach((el, index) => { el.inert = inert[index]; });
      document.removeEventListener("keydown", keys); previous?.focus();
    };
  }, [show]);

  function close(destination?: string) {
    sessionStorage.setItem("fatu_story_intro_seen", "1");
    sessionStorage.setItem("fatu_chosen_realm", selected);
    window.dispatchEvent(new CustomEvent("fatu_realm_changed",{detail:selected}));
    const venue = venues.items.find(item => item.visualIdentityKey === selected);
    if (venue) sessionStorage.setItem("fatu_first_venue", venue.id);
    setShow(false);
    if (destination) navigate(destination);
  }
  return <AnimatePresence>{show && <motion.div className={`wuxia-opening opening-stage-${stage} ${opening ? "gate-awakening" : ""} ${paused || hidden ? "cinema-paused" : ""}`} ref={rootRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="opening-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: reduced ? 1 : 1.04 }} transition={{ duration: reduced ? 0 : .35 }}>
    <div className="opening-atmosphere" aria-hidden="true"><div className="opening-landscape" /><div className="cinema-moon" /><div className="cinema-mountain mountain-back" /><div className="cinema-mountain mountain-front" /><Cloudscape /><i className="opening-aurora" /><i className="opening-cloud cloud-near" /><i className="opening-cloud cloud-far" /><i className="opening-horizon" /><div className="cinema-light-shafts"><i /><i /><i /></div></div>
    <QiParticles count={24} />
    <div className="opening-lantern left"><Lantern /></div><div className="opening-lantern right"><Lantern /></div>
    <div className="opening-topline"><span>FATU OPEN HOUSE 2026</span><div className="opening-controls"><SoundToggle /><button data-sound="page" onClick={() => close()} aria-label="ข้ามบทนำ">ข้ามบทนำ <X size={16} /></button></div></div>
    <div className="opening-chapter"><span>ตะลุยแดนมังกร</span><div>{[0, 1, 2].map(step => <i key={step} className={step === stage ? "active" : step < stage ? "done" : ""} />)}</div></div>
    <AnimatePresence mode="wait">
      {stage === 0 && <motion.section key="gate" className="opening-act gate-act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .25 }}>
        <ImperialCouplet /><ImperialCouplet side="right" />
        <div className="cinema-tableau" aria-hidden="true">
          <div className="cinema-orbit" />
          {guardians.map((guardian, index) => <div className={`cinema-guardian guardian-${index}`} key={guardian.key} style={{ "--guardian-color": guardian.color, "--entrance": `${1.1 + index * .65}s` } as React.CSSProperties}><div className="cinema-guardian-frame"><img src={guardian.art} alt="" fetchPriority={index === 0 ? "high" : "auto"} /><span>{guardian.title}</span></div><i /></div>)}
          <div className={`opening-gate ${opening ? "is-opening" : ""}`}><LatticeCorners /><CelestialArray className="gate-celestial-array" /><ImperialGate /><div className="gate-spirit"><img src="/assets/brand/dragon-seal.svg" alt="" /></div><div className="gate-pathway" /></div>
          <div className="cinema-shockwave" /><div className="cinema-portal-flash" />
        </div>
        <span className="opening-overline"><Swords size={16} /> THE FOUR GUARDIANS</span>
        <h1 id="opening-title" className="kinetic-title" aria-label="สี่ผู้พิทักษ์ หนึ่งการผจญภัย">
          <i className="kinetic-ink" aria-hidden="true" />
          <KineticLine text="สี่ผู้พิทักษ์" delay={0.75} className="cinema-title-line" />
          <KineticLine text="หนึ่งการผจญภัย" delay={1.45} className="cinema-title-line" as="em" />
          <svg className="kinetic-brush" viewBox="0 0 300 24" aria-hidden="true" preserveAspectRatio="none"><path d="M6 15 C 60 4, 120 22, 170 12 S 260 6, 294 13" /></svg>
        </h1>
        <p className="cinema-narration kinetic-narration">
          <KineticLine text="ก้าวผ่านประตูมังกร" delay={2.5} step={0.035} />
          <KineticLine text="สู่โลกศิลปะที่คุณเป็นผู้เลือกเส้นทาง" delay={3.0} step={0.022} />
        </p>
        <button className="ceremony-button" data-sound="none" onClick={() => { sfx.unlock(); setPaused(false); awaken(); }} disabled={opening}><Sparkles size={18} />{opening ? "ประตูมังกรกำลังเปิด..." : "เปิดประตูมังกร"}<ArrowRight size={18} /></button>
        {!reduced && <div className="cinema-playback"><span className="cinema-timeline"><i onAnimationEnd={() => { if (!opening) awaken(); }} /></span><button data-sound="select" onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={paused ? "เล่นบทเปิดต่อ" : "พักบทเปิด"}>{paused ? "เล่นต่อ" : "พักบทเปิด"}</button></div>}
        <span className="opening-hint">สำรวจสถานที่ · ทำภารกิจ · รับของรางวัล</span>
      </motion.section>}
      {stage === 1 && <motion.section key="guardians" className="opening-act guardian-act" initial={{ opacity: 0, y: reduced ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .35 }}>
        <span className="opening-overline">CHOOSE YOUR FIRST DESTINATION</span><h1 id="opening-title">คุณจะเริ่ม<br /><em>ที่ไหนก่อน?</em></h1><p>เลือกสถานที่เริ่มต้น แล้วสำรวจตามความสนใจ</p>
        <div className="guardian-grid">{guardians.map((guardian, index) => <button key={guardian.key} data-sound="none" className={`guardian-choice ${selected === guardian.key ? "selected" : ""}`} onClick={() => { setSelected(guardian.key); setSummoned(guardian.key); sfx.select(index); sfx.whoosh(.5, .6); }} aria-pressed={selected === guardian.key} style={{ "--guardian-color": guardian.color } as React.CSSProperties}>
          <VenuePhoto identity={guardian.key} name={guardian.place} priority />
          <span className="guardian-location-index">0{index + 1}</span>
          <div className="guardian-location-copy"><small>{realmFor(guardian.key).title}</small><strong>{venues.items.find(venue => venue.visualIdentityKey === guardian.key)?.name || guardian.place}</strong></div>
          <AnimatePresence mode="wait">{selected === guardian.key && <motion.span key={guardian.key} className="guardian-choice-spirit" initial={{ opacity: 0, scale: reduced ? 1 : .3, y: reduced ? 0 : 26 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .6, transition: { duration: .2 } }} transition={{ type: "spring", damping: 20, stiffness: 240 }}><CelestialArray color={guardian.color} /><img src={guardian.art} alt={`ผู้พิทักษ์${guardian.title}`} /></motion.span>}</AnimatePresence>
          {selected === guardian.key && <span className="guardian-check"><Check size={16} /></span>}
        </button>)}</div>
        <button className="ceremony-button" data-sound="none" onClick={() => { setStage(2); sfx.fanfare(); }}>เลือกเส้นทางนี้ <ArrowRight size={18} /></button>
      </motion.section>}
      {stage === 2 && <motion.section key="passport" className="opening-act passport-act" initial={{ opacity: 0, scale: reduced ? 1 : .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", damping: 22 }}>
        <div className="opening-guardian-seal" style={{ "--guardian-color": chosen.color } as React.CSSProperties}><img src={chosen.art} alt="" /><img className="guardian-seal-stamp" src="/assets/animations/checkin-stamp.svg" alt="" /><CelestialArray color={chosen.color} /></div>
        <span className="opening-overline">YOUR JOURNEY BEGINS</span><h1 id="opening-title">พร้อมแล้ว<br /><em>จอมยุทธคนใหม่</em></h1><p>เริ่มที่ {venues.items.find(venue => venue.visualIdentityKey === selected)?.name || chosen.place}<br />{chosen.copy}</p>
        <ol className="opening-mission-steps"><li><ScrollText size={19} /><span>ลงทะเบียนรับใบเบิกทาง</span></li><li><MapPin size={19} /><span>สแกน QR และเก็บตราประทับ</span></li><li><Gift size={19} /><span>ครบ {rules.pointsRequired} แต้ม เปิดหีบได้ 1 ครั้ง</span></li></ol>
        <button className="ceremony-button" onClick={() => close("/explore")}>เริ่มออกเดินทาง <ArrowRight size={18} /></button><button className="opening-text-button" onClick={() => close("/register")}>ลงทะเบียนรับใบเบิกทางก่อน</button>
      </motion.section>}
    </AnimatePresence>
    <div className="opening-bottom-mark" aria-hidden="true">ศิลปกรรมศาสตร์ · มหาวิทยาลัยธรรมศาสตร์</div>
  </motion.div>}</AnimatePresence>;
}

const segmenter = typeof Intl !== "undefined" && "Segmenter" in (Intl as Record<string, unknown>)
  ? new ((Intl as unknown as { Segmenter: new (loc: string, opt: { granularity: string }) => { segment: (s: string) => Iterable<{ segment: string }> } }).Segmenter)("th", { granularity: "grapheme" })
  : null;

/** Splits text into graphemes so each one can ink in, ripple and float on its own beat. */
function KineticLine({ text, delay, step = 0.06, className = "", as = "span" }: { text: string; delay: number; step?: number; className?: string; as?: "span" | "em" }) {
  const parts = segmenter ? Array.from(segmenter.segment(text), s => s.segment) : [text];
  const Tag = as;
  return <Tag className={`kinetic-line ${className}`} aria-hidden="true" style={{ "--line-delay": `${delay}s` } as React.CSSProperties}>
    {parts.map((ch, i) => <span key={i} className="kinetic-char" style={{ "--i": i, "--d": `${delay + i * step}s` } as React.CSSProperties}>{ch === " " ? "\u00a0" : ch}</span>)}
  </Tag>;
}
