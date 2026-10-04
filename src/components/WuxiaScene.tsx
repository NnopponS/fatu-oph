import { useState, type CSSProperties } from "react";
import { realms } from "@/lib/realms";
import { CelestialArray } from "@/components/CelestialArray";

export function QiParticles({ count = 12 }: { count?: number }) {
  return <div className="qi-particles" aria-hidden="true">{Array.from({ length: count }, (_, index) => <i key={index} style={{ "--i": index, "--x": `${(index * 37 + 11) % 100}%`, "--delay": `${(index * .47).toFixed(2)}s` } as CSSProperties} />)}</div>;
}

export function Lantern() {
  return <svg viewBox="0 0 90 160" fill="none" aria-hidden="true"><path d="M45 0v26" stroke="#d7b267" strokeWidth="2" /><path d="M23 28h44M23 96h44" stroke="#f5dc9b" strokeWidth="4" /><path d="M25 30C1 43 1 82 25 94h40c24-12 24-51 0-64z" fill="#8e1d20" stroke="#d8ad58" strokeWidth="2" /><path d="M33 31c-12 20-12 40 0 62m24-62c12 20 12 40 0 62M45 31v62" stroke="#e4a755" strokeOpacity=".65" /><path d="M44 101v30m-8-18v25m16-25v25" stroke="#bd812d" strokeWidth="3" /><path d="m36 59 9-10 9 10-9 12z" fill="#e6c479" /></svg>;
}

export function ImperialGate() {
  return <div className="imperial-gate" aria-hidden="true"><div className="gate-roof"><span /> <i /></div><div className="gate-frame"><div className="gate-radiance" /><div className="gate-door gate-door-left"><div className="gate-lattice" /><span className="gate-knocker" /></div><div className="gate-door gate-door-right"><div className="gate-lattice" /><span className="gate-knocker" /></div><div className="gate-pillar left" /><div className="gate-pillar right" /></div><div className="gate-steps"><i /><i /><i /></div></div>;
}

export function SealBurst({ label = "ผ่านด่าน", points }: { label?: string; points?: number }) {
  return <div className="seal-burst"><div className="seal-burst-ring" /><QiParticles count={10} /><img src="/assets/animations/checkin-stamp.svg" alt="" /><strong>{label}</strong>{points !== undefined && points > 0 && <span>+{points} แต้ม</span>}</div>;
}

export function RitualChest({ opened = false, active = false }: { opened?: boolean; active?: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);
  return <div className={`treasure-art-stage ${active ? "active" : ""} ${opened ? "opened" : ""}`} aria-hidden="true">
    <CelestialArray className="treasure-celestial-array" />
    {active && <div className="treasure-spirit-beams">{[0, 1, 2, 3].map(index => <i key={index} style={{ "--beam": index } as CSSProperties} />)}</div>}
    <div className="chest-aura" /><div className="chest-orbit orbit-one" /><div className="chest-orbit orbit-two" />
    {!imageFailed ? <img className="treasure-cinematic-art" src={opened ? "/images/celestial-mystery-chest.webp" : "/images/treasure-chest-sealed.webp"} alt="" onError={() => setImageFailed(true)} /> : <div className="treasure-chest"><div className="chest-lid"><span /><i /></div><div className="chest-body"><img src="/assets/brand/dragon-seal.svg" alt="" /><span className="chest-band left" /><span className="chest-band right" /><i className="chest-lock" /></div><div className="chest-feet" /></div>}
    {active && !opened && <img className="treasure-open-preload" src="/images/celestial-mystery-chest.webp" alt="" />}
    <img className="treasure-lock-seal" src="/assets/brand/dragon-seal.svg" alt="" />
    {opened && active && <div className="treasure-sky-column" />}
    {active && <div className="treasure-guardian-orbit">{Object.values(realms).map(meta => <span key={meta.guardian}><img src={meta.art} alt="" /></span>)}</div>}
    <div className="treasure-rune-track">{["乾", "坤", "震", "巽", "坎", "離", "艮", "兌"].map((rune, index) => <span key={rune} style={{ "--rune": index } as CSSProperties}>{rune}</span>)}</div><QiParticles count={active ? 24 : 12} />
  </div>;
}
