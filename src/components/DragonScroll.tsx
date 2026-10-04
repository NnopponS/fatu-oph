import { Sparkles } from "lucide-react";
import { QiParticles } from "@/components/WuxiaScene";
import { realmFor } from "@/lib/realms";
import { CelestialArray } from "@/components/CelestialArray";

export function DragonScroll({ empowered = false, identity = "azure-dragon" }: { empowered?: boolean; identity?: string }) {
  const meta = realmFor(identity);
  return <div className={`dragon-scroll ${empowered ? "empowered" : ""}`} aria-hidden="true">
    <CelestialArray className="scroll-celestial-array" color={empowered ? meta.color : "#e8c982"} />
    <div className="scroll-spirit-ring" /><div className="scroll-roll left" /><div className="scroll-paper"><span className="scroll-cloud-pattern" /><img className="scroll-dragon-mark" src="/assets/brand/dragon-seal.svg" alt="" /><span className="scroll-inscription">คัมภีร์แดนมังกร</span><i /><Sparkles size={16} /></div><div className="scroll-roll right" />
    {empowered && <><div className="scroll-energy-column" /><div className="scroll-guardian"><img src={meta.art} alt="" /></div><QiParticles count={14} /></>}
  </div>;
}

export function PointMedallion({ points, completed = false }: { points: number; completed?: boolean }) {
  return <span className={`point-medallion ${completed ? "completed" : ""}`}><i /><b>{completed ? "✓" : `+${points}`}</b><small>{completed ? "สำเร็จ" : "แต้ม"}</small></span>;
}
