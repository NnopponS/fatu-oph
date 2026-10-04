import { type CSSProperties, type ReactNode } from "react";
import { Lantern } from "@/components/WuxiaScene";

/** Decorative art stays outside the accessibility tree and never captures input. */
export function LatticeCorners({ className = "" }: { className?: string }) {
  return <div className={`lattice-corners ${className}`} aria-hidden="true">{[0,1,2,3].map(index => <svg key={index} viewBox="0 0 72 72"><path d="M3 69V3h66M12 55V12h43M21 42V21h21v12H33v9H21M3 24h9M24 3v9" /><path d="m51 12 9-9 9 9-9 9z" /></svg>)}</div>;
}

export function FortuneKnot({ className = "" }: { className?: string }) {
  return <svg className={`fortune-knot ${className}`} viewBox="0 0 70 110" fill="none" aria-hidden="true"><path d="M35 0v15m0 54v26M26 76v23m18-23v23" stroke="currentColor" strokeWidth="2" /><path d="m35 12 25 25-25 25L10 37z" stroke="currentColor" strokeWidth="3" /><path d="m35 21 16 16-16 16-16-16zM21 23c-15-7-16 15-5 15m33-15c15-7 16 15 5 15M21 51c-15 7-16-15-5-15m33 15c15 7 16-15 5-15" stroke="currentColor" strokeWidth="2" /><rect x="29" y="31" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="2" /><path d="M23 80h24M28 96h14" stroke="currentColor" strokeWidth="4" /></svg>;
}

export function Cloudscape({ className = "" }: { className?: string }) {
  return <div className={`chinese-cloudscape ${className}`} aria-hidden="true">
    <svg className="cloudscape-mountains" viewBox="0 0 800 230" preserveAspectRatio="xMidYMax slice"><path d="M0 230V165l49-28 44 18 78-83 70 97 83-35 91 46 87-116 60 82 39-11 74 47 56-51 69 41v58z" fill="currentColor" opacity=".2" /><path d="M0 230v-28l61-21 80 17 70-39 70 34 57-15 54 20 74-41 66 39 71-24 100 26 69-31 78 25v38z" fill="currentColor" opacity=".3" /><path d="m149 113 22-41 33 46m237 0 61-54 26 35M570 145l31-10 37 26" stroke="currentColor" strokeWidth="1" fill="none" opacity=".6" /></svg>
    <svg className="cloudscape-cloud cloudscape-near" viewBox="0 0 800 180" preserveAspectRatio="xMidYMax slice"><path d="M-20 135h163c37 0 35-37 11-37-21 0-28 28-9 28h74c24 0 25-23 9-23-14 0-16 16-6 16h101m185 25h116c30 0 28-28 7-28-18 0-20 20-7 20h196M-10 155h246m68-20h150c33 0 32-34 8-34-20 0-22 24-9 24h55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" /><path d="M0 180v-22c79-44 128 3 201-15s89-6 175 3 123-41 197-17 151-27 227 10v41z" fill="currentColor" opacity=".12" /></svg>
    <svg className="cloudscape-cloud cloudscape-far" viewBox="0 0 800 150" preserveAspectRatio="xMidYMax slice"><path d="M60 90h171c31 0 30-31 8-31-21 0-19 24-7 24h35m65 24h143c39 0 39-35 13-35-20 0-24 25-8 25h200m-41-40h124c25 0 24-25 7-25-14 0-15 19-5 19h50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" /></svg>
    <svg className="cloudscape-pavilion" viewBox="0 0 160 140"><path d="M15 53c36 1 55-11 65-27 10 16 29 28 65 27l-13 12H28zM29 91h102l16 12H13zM37 66v25m86-25v25M60 66v25m40-25v25M31 103v28m98-28v28M20 132h120M80 26V12" fill="none" stroke="currentColor" strokeWidth="3" /><path d="M32 65h96v26H32z" fill="currentColor" opacity=".12" /></svg>
    <svg className="cloudscape-cranes" viewBox="0 0 120 80"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M15 39c17-7 29-3 38 7-5-22-9-26-25-33 15 1 28 12 30 28 3-18 20-26 35-27-14 8-22 20-25 34l16 5 9-3-6 8-20-1-13-11-10 2-12 14 8-19z" strokeWidth="1.5" /><path d="m83 67 10-6 8 1-1-10 9 10 8 1m-60-7 9 12" strokeWidth="1" /></g></svg>
  </div>;
}

export function SilkDivider({ label = "ตะลุยแดนมังกร", className = "" }: { label?: string; className?: string }) {
  return <div className={`silk-divider ${className}`}><span aria-hidden="true" /><span className="silk-divider-word"><b aria-hidden="true">龍</b>{label}</span><span aria-hidden="true" /></div>;
}

export function MoonWindow({ source, className = "" }: { source: string; className?: string }) {
  return <div className={`moon-window ${className}`} aria-hidden="true"><div className="moon-window-halo" /><div className="moon-window-rim"><img src={source} alt="" /><span className="moon-window-light" /></div><svg className="moon-window-branches" viewBox="0 0 230 230" fill="none"><path d="M5 169c31 1 43-18 55-36m-29 20-4-31m26 20 28-2M216 58c-19 2-33 16-37 42m15-27 14-4m-20 16-6-12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /><g fill="currentColor">{[[27,122],[60,132],[81,139],[208,69],[182,74]].map(([x,y],index)=><g key={index} transform={`translate(${x} ${y})`}>{[0,72,144,216,288].map(deg=><ellipse key={deg} cx="0" cy="-4" rx="2.8" ry="4" transform={`rotate(${deg})`} />)}</g>)}</g></svg><span className="moon-window-plaque">青龍 <small>มังกรฟ้า</small></span></div>;
}

export function ChineseHero({ title, kicker, description, children, className = "", tone = "jade", seal = "龍" }: {
  title: ReactNode; kicker: ReactNode; description: ReactNode; children?: ReactNode; className?: string; tone?: "jade" | "crimson"; seal?: string;
}) {
  return <section className={`chinese-palace-hero ${className}`} data-tone={tone}>
    <Cloudscape /><LatticeCorners />
    <div className="palace-lantern palace-lantern-left" aria-hidden="true"><Lantern /></div><div className="palace-lantern palace-lantern-right" aria-hidden="true"><Lantern /></div>
    <div className="palace-hero-content"><span className="section-kicker">{kicker}</span><span className="imperial-square-seal" aria-hidden="true">{seal}</span><h1>{title}</h1><p>{description}</p>{children}</div>
  </section>;
}

export function ImperialCouplet({ side = "left" }: { side?: "left" | "right" }) {
  return <div className={`imperial-couplet ${side}`} aria-hidden="true"><i /><span>{side === "left" ? "藝啟新章" : "龍騰四境"}</span><i /></div>;
}

export function ScrollRolls({ className = "" }: { className?: string }) {
  return <div className={`scroll-rolls ${className}`} aria-hidden="true"><i /><i /></div>;
}

export function SealSpark({ color }: { color: string }) {
  return <div className="guardian-seal-spark" style={{"--spark-color":color} as CSSProperties} aria-hidden="true">{Array.from({length:8},(_,i)=><span key={i} style={{"--spark-index":i} as CSSProperties} />)}<svg viewBox="0 0 200 200" fill="none"><path d="M100 6 194 100 100 194 6 100zM100 23 177 100 100 177 23 100z" stroke="currentColor" /><path d="M70 2h60m68 68v60M70 198h60M2 70v60" stroke="currentColor" strokeWidth="2" /></svg></div>;
}
