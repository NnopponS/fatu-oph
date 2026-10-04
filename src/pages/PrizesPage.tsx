import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gift, QrCode, ShieldCheck, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useMedia, usePrizes, resolveMediaUrl } from "@/data/content";
import { PrizeArtwork } from "@/components/PrizeArtwork";
import { RitualChest } from "@/components/WuxiaScene";

type Filter = "all" | "affordable" | "stock";
export function PrizesPage() {
  const { firebaseUser, profile } = useAuth();
  const prizes = usePrizes(); const media = useMedia(); const reduced = useReducedMotion();
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const participant = Boolean(firebaseUser && profile?.username);
  const points = profile?.pointTotal ?? 0;
  const selected = prizes.items.find(prize => prize.id === selectedId);
  const modalVisible = Boolean(selected);
  const needsPoints = participant && selected && points < selected.pointsRequired;
  const claimPath = selected?.stock === 0 ? "/prizes" : !participant ? "/login" : needsPoints ? "/schedule" : "/profile";
  const claimLabel = selected?.stock === 0 ? "เลือกสมบัติชิ้นอื่น" : !participant ? "เข้าสู่ระบบเพื่อรับรางวัล" : needsPoints ? "ไปทำภารกิจสะสมแต้ม" : "แสดง QR ใบเบิกทาง";
  const items = prizes.items.filter(prize => filter === "stock" ? prize.stock > 0 : filter === "affordable" ? participant && prize.stock > 0 && points >= prize.pointsRequired : true);
  useEffect(() => {
    if (!modalVisible) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; dialogRef.current?.focus({ preventScroll: true });
    function keys(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedId(null);
      if (event.key !== "Tab") return;
      const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button, a[href]") || []);
      const first = controls[0]; const last = controls[controls.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", keys);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", keys); previousFocus?.focus({ preventScroll: true }); };
  }, [modalVisible]);

  return <div className="prizes-expedition places-page">
    <header className="prizes-heading"><span className="section-kicker"><Gift size={16} /> TREASURES OF THE FOUR REALMS</span><h1>สมบัติรอ<br /><em>จอมยุทธคนใหม่</em></h1><p>ทำกิจกรรม เก็บตราประทับ แล้วนำแต้มมาแลกของที่ระลึก</p><div className="prizes-points"><ShieldCheck size={22} /><span>{participant ? <><strong>{points.toLocaleString("th-TH")}</strong> แต้มในใบเบิกทาง</> : <Link to="/login">เข้าสู่ระบบเพื่อดูแต้มของคุณ <ArrowRight size={17} /></Link>}</span></div></header>
    <Link className="prizes-draw-link" to="/lucky-draw"><div><Sparkles size={19} /><span className="section-kicker">ONE CHANCE · YOUR DESTINY</span><h2>เปิดหีบ<br />ลุ้นสมบัติพิเศษ</h2><p>เช็กอินสถานที่และร่วมกิจกรรม<br />เพื่อปลดล็อกสิทธิ์ลุ้นรางวัล</p><span className="prizes-draw-action">ดูสิทธิ์เปิดหีบ <ArrowRight size={16} /></span></div><RitualChest /></Link>
    <section><div className="places-section-heading"><div><span className="section-kicker">REWARD COLLECTION</span><h2>เลือกสมบัติที่คุณชอบ</h2></div><Gift size={22} /></div><div className="prize-filters" aria-label="กรองของรางวัล">{([{ id: "all", label: "ทั้งหมด" }, { id: "affordable", label: "แต้มของฉันแลกได้" }, { id: "stock", label: "ยังมีของเหลือ" }] as const).map(option => <button key={option.id} aria-pressed={filter === option.id} disabled={option.id === "affordable" && !participant} onClick={() => setFilter(option.id)}>{option.label}</button>)}</div>
      {prizes.loading && <p role="status">กำลังเปิดคลังสมบัติ...</p>}{prizes.error && <p role="alert">{prizes.error}</p>}{!prizes.loading && !prizes.error && !items.length && <div className="prize-empty"><Gift size={28} /><p>{filter === "all" ? "ติดตามรายการของรางวัลได้เร็ว ๆ นี้" : "ยังไม่มีของรางวัลในกลุ่มนี้ ลองดูรายการทั้งหมด"}</p>{filter !== "all" && <button className="button-gold-outline" onClick={() => setFilter("all")}>ดูสมบัติทั้งหมด</button>}</div>}
      <div className="prize-collection">{items.map((prize, index) => <motion.article key={prize.id} className={`prize-collection-card ${prize.stock === 0 ? "out-of-stock" : ""}`} initial={{ opacity: 0, y: reduced ? 0 : 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .35, delay: reduced ? 0 : Math.min(index * .06, .3) }}>
        <div className="prize-collection-art"><PrizeArtwork name={prize.name} source={resolveMediaUrl(prize.imageMediaId, media.items)} /><span className="prize-stock">{prize.stock > 0 ? `เหลือ ${prize.stock} ชิ้น` : "หมดแล้ว"}</span></div><div className="prize-collection-copy"><h3>{prize.name}</h3><p>{prize.description || "ของที่ระลึกจากการเดินทางในแดนมังกร"}</p><div className="prize-cost"><b>{prize.pointsRequired.toLocaleString("th-TH")}</b><span>แต้ม</span></div><button className="prize-details-button" aria-label={`ดูวิธีรับ${prize.name}`} onClick={() => setSelectedId(prize.id)}>ดูวิธีรับรางวัล <ArrowRight size={15} /></button></div>
      </motion.article>)}</div>
    </section>
    <aside className="travel-note"><ShieldCheck size={24} /><div><strong>รับของรางวัลที่บูธกลาง</strong><p>แสดง QR ในใบเบิกทางให้เจ้าหน้าที่ตรวจสอบแต้มและบันทึกการรับของรางวัล</p><Link to="/profile">เปิดใบเบิกทาง <ArrowRight size={16} /></Link></div></aside>
    <AnimatePresence>{selected && <motion.div ref={dialogRef} tabIndex={-1} className="prize-detail-modal" role="dialog" aria-modal="true" aria-labelledby="prize-detail-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .2 }}><div className="prize-detail-sheet"><button className="prize-detail-close" aria-label="ปิดรายละเอียดรางวัล" onClick={() => setSelectedId(null)}><X size={21} /></button><span className="section-kicker">YOUR NEXT TREASURE</span><PrizeArtwork name={selected.name} source={resolveMediaUrl(selected.imageMediaId, media.items)} /><h2 id="prize-detail-title">{selected.name}</h2><p>{selected.description || "ของที่ระลึกแห่งแดนมังกร"}</p><dl><div><dt>ใช้แต้ม</dt><dd>{selected.pointsRequired.toLocaleString("th-TH")} แต้ม</dd></div><div><dt>จำนวนคงเหลือ</dt><dd>{selected.stock} ชิ้น</dd></div><div><dt>สิทธิ์ต่อคน</dt><dd>{selected.claimLimit} ชิ้น</dd></div></dl>{selected.stock === 0 ? <p className="prize-detail-notice">ของรางวัลรายการนี้หมดแล้ว เลือกสมบัติชิ้นอื่นได้จากคลังรางวัล</p> : participant && points < selected.pointsRequired ? <p className="prize-detail-notice">สะสมอีก {selected.pointsRequired - points} แต้ม แล้วกลับมารับสมบัติชิ้นนี้</p> : <p className="prize-detail-notice">นำใบเบิกทางไปให้เจ้าหน้าที่ที่บูธรับของรางวัลตรวจสอบและบันทึกการแลก</p>}<Link className="button-imperial-red" to={claimPath} onClick={() => setSelectedId(null)}><QrCode size={19} />{claimLabel}</Link></div></motion.div>}</AnimatePresence>
  </div>;
}
