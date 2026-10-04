import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gift, QrCode, ShieldCheck, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useMedia, usePrizes, useRewardPolicy, resolveMediaUrl } from "@/data/content";
import { PrizeArtwork } from "@/components/PrizeArtwork";
import { RewardProgress } from "@/components/RewardProgress";
import { ChineseHero, LatticeCorners } from "@/components/ChineseOrnaments";

type Filter = "all" | "affordable" | "stock";
export function PrizesPage() {
  const { firebaseUser, profile } = useAuth();
  const prizes = usePrizes(); const media = useMedia(); const reduced = useReducedMotion();
  const { rules } = useRewardPolicy();
  const [exchange, setExchange] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stock, setStock] = useState<Record<string, number> | null>(null);
  const [stockError, setStockError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const participant = Boolean(firebaseUser && profile?.username);
  const points = profile?.pointTotal ?? 0;
  const pointMode = exchange && rules.pointExchangeEnabled;
  const collection = prizes.items.filter(p => pointMode || p.drawWeight > 0).map(p => ({ ...p, remaining: stock?.[p.id] }));
  const selected = collection.find(prize => prize.id === selectedId);
  const modalVisible = Boolean(selected);
  const needsPoints = participant && selected && points < (pointMode ? selected.pointsRequired : rules.pointsRequired);
  const outOfStock = selected?.remaining === 0;
  const claimPath = outOfStock ? "/rewards" : !participant ? "/register" : needsPoints ? "/schedule" : pointMode ? "/profile" : "/lucky-draw";
  const claimLabel = outOfStock ? "ดูรางวัลที่ยังมีของ" : !participant ? "ลงทะเบียนรับใบเบิกทาง" : needsPoints ? "ไปทำภารกิจสะสมแต้ม" : pointMode ? "แสดง QR ใบเบิกทาง" : profile?.luckyDraw?.claimed ? "ดู Voucher ของฉัน" : "ไปเปิดหีบลุ้นรางวัล";
  const items = collection.filter(prize => filter === "stock" ? (prize.remaining || 0) > 0 : filter === "affordable" ? participant && (prize.remaining || 0) > 0 && points >= prize.pointsRequired : true);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/lucky-draw", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({action:"catalog"}), signal:controller.signal }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ตรวจจำนวนของรางวัลไม่สำเร็จ");
      if (!controller.signal.aborted) setStock(Object.fromEntries((data.prizes as {id:string;stockRemaining:number}[]).map(p => [p.id,p.stockRemaining])));
    }).catch(error => { if (!controller.signal.aborted) setStockError(error instanceof Error ? error.message : "ตรวจจำนวนของรางวัลไม่สำเร็จ"); });
    return () => controller.abort();
  }, []);
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

  return <div className="prizes-expedition places-page reward-hub">
    <ChineseHero className="prizes-heading" tone="crimson" seal="福" kicker={<><Gift size={16} /> TREASURES OF THE FOUR REALMS</>} title={<>รางวัลแห่ง<br /><em>แดนมังกร</em></>} description="สะสมคะแนน เปิดหีบ แล้วรับของรางวัลด้วย Voucher" />
    <RewardProgress />
    {rules.pointExchangeEnabled && <div className="prize-filters" aria-label="วิธีรับรางวัล"><button aria-pressed={!pointMode} onClick={() => {setExchange(false);setFilter("all");}}>ลุ้นรางวัล 1 ครั้ง</button><button aria-pressed={pointMode} onClick={() => {setExchange(true);setFilter("all");}}>แลกด้วยแต้ม</button></div>}
    <section><div className="places-section-heading"><div><span className="section-kicker">REWARD COLLECTION</span><h2>{pointMode ? "ของรางวัลที่เปิดแลก" : "มีอะไรให้ลุ้นบ้าง?"}</h2></div><Gift size={22} /></div>
      <div className="prize-filters" aria-label="กรองของรางวัล"><button aria-pressed={filter === "all"} onClick={() => setFilter("all")}>ทั้งหมด</button>{pointMode && <button aria-pressed={filter === "affordable"} disabled={!participant || !stock} onClick={() => setFilter("affordable")}>แต้มของฉันแลกได้</button>}<button aria-pressed={filter === "stock"} disabled={!stock} onClick={() => setFilter("stock")}>ยังมีของเหลือ</button></div>
      {prizes.loading && <p role="status">กำลังเปิดคลังสมบัติ...</p>}{prizes.error && <p role="alert">{prizes.error}</p>}{stockError && <p className="stock-notice" role="status">ยังตรวจจำนวนคงเหลือไม่ได้ สอบถามเจ้าหน้าที่จุดรับรางวัลได้</p>}
      {!prizes.loading && !prizes.error && !items.length && <div className="prize-empty"><Gift size={28} /><p>{filter === "all" ? "ทีมงานกำลังประกาศรายการของรางวัล" : "ยังไม่มีของรางวัลในกลุ่มนี้ ลองดูรายการทั้งหมด"}</p>{filter !== "all" && <button className="button-gold-outline" onClick={() => setFilter("all")}>ดูสมบัติทั้งหมด</button>}</div>}
      <div className="prize-collection">{items.map((prize,index) => <motion.article key={prize.id} className={`prize-collection-card ${prize.remaining === 0 ? "out-of-stock" : ""}`} initial={{opacity:0,y:reduced ? 0 : 18}} animate={{opacity:1,y:0}} transition={{duration:reduced ? 0 : .35,delay:reduced ? 0 : Math.min(index*.06,.3)}}>
        <div className="prize-collection-art"><LatticeCorners /><PrizeArtwork name={prize.name} source={resolveMediaUrl(prize.imageMediaId,media.items)} /><span className="prize-stock">{prize.remaining === undefined ? stockError ? "รอตรวจจำนวน" : "กำลังตรวจของ..." : prize.remaining > 0 ? `เหลือ ${prize.remaining} ชิ้น` : "หมดแล้ว"}</span></div>
        <div className="prize-collection-copy"><h3>{prize.name}</h3><p>{prize.description || "ของที่ระลึกจากการเดินทางในแดนมังกร"}</p>{pointMode && <div className="prize-cost"><b>{prize.pointsRequired.toLocaleString("th-TH")}</b><span>แต้ม</span></div>}<button className="prize-details-button" aria-label={`ดูวิธีรับ${prize.name}`} onClick={() => setSelectedId(prize.id)}>ดูวิธีรับรางวัล <ArrowRight size={15} /></button></div>
      </motion.article>)}</div>
    </section>
    <aside className="travel-note"><ShieldCheck size={24} /><div><strong>ขั้นตอนรับของรางวัล</strong><p>{pointMode ? "เลือกของที่เปิดแลก แสดง QR ใบเบิกทางให้ Staff ตรวจแต้มและยืนยัน" : `สะสม ${rules.pointsRequired} แต้ม → เปิดหีบ 1 ครั้ง → แสดง Voucher ที่จุดรับรางวัล`}</p><Link to={pointMode ? "/profile" : "/lucky-draw"}>{pointMode ? "เปิดใบเบิกทาง" : "ดูสิทธิ์และ Voucher ของฉัน"} <ArrowRight size={15} /></Link></div></aside>
    <AnimatePresence>{selected && <motion.div ref={dialogRef} tabIndex={-1} className="prize-detail-modal" role="dialog" aria-modal="true" aria-labelledby="prize-detail-title" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced ? 0 : .2}}>
      <div className="prize-detail-sheet"><button className="prize-detail-close" aria-label="ปิดรายละเอียดรางวัล" onClick={() => setSelectedId(null)}><X size={21} /></button><div className="prize-detail-art"><PrizeArtwork name={selected.name} source={resolveMediaUrl(selected.imageMediaId,media.items)} /></div><span className="section-kicker">YOUR TREASURE</span><h2 id="prize-detail-title">{selected.name}</h2><p>{selected.description}</p>
        {pointMode ? <div className="prize-detail-cost"><b>{selected.pointsRequired} แต้ม</b><span>{selected.remaining === undefined ? "รอตรวจจำนวนคงเหลือ" : `เหลือ ${selected.remaining} ชิ้น`}</span></div> : <p className="draw-rule-note">ครบ {rules.pointsRequired} แต้ม เปิดหีบสุ่มได้ 1 ครั้ง ผลรางวัลและ Voucher จะบันทึกไว้ในบัญชีของคุณ</p>}
        <div className="prize-redemption-guide"><QrCode size={21} /><div><strong>{outOfStock ? "ของรางวัลชิ้นนี้หมดแล้ว" : pointMode ? "ให้ Staff ตรวจแต้มก่อนแลก" : "แสดง Voucher ของรางวัลที่ได้รับ"}</strong><p>{outOfStock ? "ดูรายการของรางวัลที่ยังมีอยู่" : pointMode ? "เปิด QR ใบเบิกทางให้เจ้าหน้าที่ตรวจและยืนยันการแลก" : "หลังเปิดหีบ นำ QR Voucher ให้เจ้าหน้าที่จุดรับรางวัลตรวจและยืนยัน"}</p></div></div>
        <Link className="button-imperial-red" to={claimPath} onClick={() => setSelectedId(null)}>{claimLabel}<ArrowRight size={17} /></Link>
      </div>
    </motion.div>}</AnimatePresence>
  </div>;
}
