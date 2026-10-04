import { useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check, MapPin, Sparkles, X } from "lucide-react";
import { resolveMediaUrl, useMedia, type Venue } from "@/data/content";
import { realmFor } from "@/lib/realms";
import { CelestialArray } from "@/components/CelestialArray";

export function VenuePhoto({ identity, name, cover = "", priority = false }: { identity: string; name: string; cover?: string; priority?: boolean }) {
  const meta = realmFor(identity);
  const [failed, setFailed] = useState<string[]>([]);
  const source = !failed.includes(meta.photo) ? meta.photo : cover && !failed.includes(cover) ? cover : meta.photo;
  return <div className="venue-photograph" data-venue-photo={identity}>
    {!failed.includes(source) ? <img src={source} alt={`${meta.photoLabel} · ${name}`} loading={priority ? "eager" : "lazy"} decoding="async" style={{ objectPosition: meta.position }} onError={() => setFailed(previous => [...previous, source])} /> : <div className="venue-photo-unavailable"><MapPin size={30} /><span>{name}</span></div>}
  </div>;
}

export function GuardianButton({ identity, children, className = "" }: { identity: string; children?: ReactNode; className?: string }) {
  const meta = realmFor(identity); const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  return <div className={`guardian-interaction ${className}`} style={{ "--realm-color": meta.color } as CSSProperties}>
    <button className="guardian-summon" type="button" aria-expanded={visible} aria-label={`${visible ? "เก็บ" : "เรียก"}ผู้พิทักษ์${meta.guardian}`} onClick={() => setVisible(!visible)} onKeyDown={event => { if (event.key === "Escape") setVisible(false); }}>
      <img src={meta.art} alt="" /><span>{children || "เรียกผู้พิทักษ์"}</span>{visible ? <X size={14} /> : <Sparkles size={14} />}
    </button>
    <AnimatePresence>{visible && <motion.div className="guardian-manifestation" initial={{ opacity: 0, y: reduced ? 0 : 20, scale: reduced ? 1 : .5 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: reduced ? 1 : .8 }} transition={{ type: "spring", damping: 16 }}>
      <CelestialArray color={meta.color} /><div className="guardian-manifest-ring" /><img src={meta.art} alt={`ผู้พิทักษ์${meta.guardian}`} /><strong>{meta.guardian}</strong><small>{meta.title}</small>
    </motion.div>}</AnimatePresence>
  </div>;
}

export function RealmPlaceCard({ venue, count = 0, visited = false, index = 0 }: { venue: Venue; count?: number; visited?: boolean; index?: number }) {
  const media = useMedia(); const meta = realmFor(venue.visualIdentityKey);
  const cover = resolveMediaUrl(venue.coverMediaId, media.items);
  return <article className={`realm-place-card ${visited ? "visited" : ""}`} style={{ "--realm-color": meta.color } as CSSProperties}>
    <Link to={`/venue/${venue.id}`} className="realm-place-image-link" aria-label={`สำรวจ${venue.name}`}>
      <VenuePhoto identity={venue.visualIdentityKey} name={venue.name} cover={cover} />
      <span className="realm-place-number">{String(index + 1).padStart(2, "0")}</span>
      {visited && <span className="realm-place-visited"><Check size={13} />ประทับตราแล้ว</span>}
    </Link>
    <div className="realm-place-copy"><span className="realm-place-theme">{meta.title}</span><Link to={`/venue/${venue.id}`} className="realm-place-title"><h3>{venue.name}</h3><ArrowUpRight size={22} /></Link><p>{venue.description || "เลือกกิจกรรมที่ชอบ แล้วออกเดินทางไปสัมผัสด้วยตัวเอง"}</p>
      <div className="realm-place-actions"><span>{count} กิจกรรม</span><GuardianButton identity={venue.visualIdentityKey} /></div>
    </div>
  </article>;
}
