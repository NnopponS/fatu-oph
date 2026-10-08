import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gift, RefreshCw, ShieldCheck, Sparkles, Volume2, VolumeX } from "lucide-react";
import QRCode from "qrcode";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { QiParticles, RitualChest } from "@/components/WuxiaScene";
import { Cloudscape, ImperialCouplet, LatticeCorners } from "@/components/ChineseOrnaments";
import { PrizeArtwork } from "@/components/PrizeArtwork";
import { resolveMediaUrl, useMedia, usePrizes, useRewardPolicy } from "@/data/content";
import { rewardProgress, type RewardPolicy } from "@/lib/reward-policy";
import { sfx } from "@/lib/sfx";

interface DrawPrize {
  id: string; title: string; description?: string; tier?: string; claimedAt?: string;
  voucherCode?: string; redeemed?: boolean; redeemedAt?: string;
}
interface DrawStatus {
  eligible: boolean; claimed: boolean; prize: DrawPrize | null;
  conditions: { visitedVenuesCount: number; completedActivitiesCount: number };
  progress: ReturnType<typeof rewardProgress>;
  rules: RewardPolicy;
  catalogCount: number;
}
type Phase = "idle" | "charging" | "summoning" | "opening" | "revealed";
const rarityLabels: Record<string, string> = { legendary: "ระดับตำนาน", epic: "มหากาพย์", rare: "หายาก", uncommon: "พิเศษ", common: "ของขวัญมงคล" };

export function LuckyDrawPage() {
  const { firebaseUser, refreshProfile, loading: authLoading } = useAuth();
  const prizes = usePrizes(); const media = useMedia(); const { rules } = useRewardPolicy();
  const reduced = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<DrawStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [qr, setQr] = useState("");
  const [sound, setSound] = useState(false);
  const [needsRecovery, setNeedsRecovery] = useState(false);
  const [drawBusy, setDrawBusy] = useState(false);
  const drawing = useRef(false);
  const mounted = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const audio = useRef<AudioContext | null>(null);
  const drawAbort = useRef<AbortController | null>(null);
  const skipAnimation = useRef(false);
  const releaseReveal = useRef<(() => void) | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const ceremonyVisible = phase !== "idle";

  const getStatus = useCallback(async (signal?: AbortSignal): Promise<DrawStatus | null> => {
    if (!firebaseUser) return null;
    const token = await firebaseUser.getIdToken();
    const response = await fetch("/api/lucky-draw", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ action: "status" }), signal });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "โหลดข้อมูลรางวัลไม่สำเร็จ");
    if (!data.status?.progress || !data.status?.rules) throw new Error("ระบบรางวัลกำลังปรับปรุงกติกา กรุณาลองใหม่หรือติดต่อเจ้าหน้าที่");
    return data.status;
  }, [firebaseUser]);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; releaseReveal.current?.(); timers.current.forEach(clearTimeout); drawAbort.current?.abort(); void audio.current?.close(); audio.current = null; };
  }, []);
  useEffect(() => {
    if (authLoading) return;
    const controller = new AbortController(); let active = true;
    setLoading(true); setStatus(null); setQr("");
    void getStatus(controller.signal).then(data => { if (active) { setStatus(data); setError(null); } }).catch(err => { if (active) setError(err instanceof Error ? err.message : "โหลดข้อมูลรางวัลไม่สำเร็จ"); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [authLoading, getStatus]);
  useEffect(() => {
    let active = true; setQr("");
    if (status?.prize?.voucherCode) void QRCode.toDataURL(status.prize.voucherCode, { width: 280, margin: 3, color: { dark: "#103b3b", light: "#ffffff" } }).then(url => { if (active) setQr(url); }).catch(() => { if (active) setError("สร้างรูป QR ไม่สำเร็จ ใช้รหัส Voucher ด้านล่างรับของรางวัลได้"); });
    return () => { active = false; };
  }, [status?.prize?.voucherCode]);
  useEffect(() => {
    if (!ceremonyVisible) return;
    const previous = document.body.style.overflow; document.body.style.overflow = "hidden";
    const previousFocus = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus({ preventScroll: true });
    function keys(event: KeyboardEvent) {
      if (event.key === "Escape") { skipAnimation.current = true; releaseReveal.current?.(); setPhase("idle"); }
      if (event.key !== "Tab") return;
      const buttons = Array.from(dialogRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") || []);
      if (!buttons.length) { event.preventDefault(); return; }
      const first = buttons[0]; const last = buttons[buttons.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", keys);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", keys); previousFocus?.focus({ preventScroll: true }); };
  }, [ceremonyVisible]);

  function tone(frequency: number, delay: number, duration = .28) {
    const context = audio.current; if (!context || context.state === "closed") return;
    const oscillator = context.createOscillator(); const gain = context.createGain();
    oscillator.type = "sine"; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.001, context.currentTime + delay); gain.gain.exponentialRampToValueAtTime(.12, context.currentTime + delay + .02); gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + delay + duration);
    oscillator.connect(gain); gain.connect(context.destination); oscillator.start(context.currentTime + delay); oscillator.stop(context.currentTime + delay + duration);
  }
  function stopTimers() { timers.current.forEach(clearTimeout); timers.current = []; }
  function showPrize(data: DrawStatus) {
    if (!mounted.current) return;
    stopTimers(); setStatus(data); setPhase(skipAnimation.current ? "idle" : "revealed"); setNeedsRecovery(false);
    if (sound) { [587, 740, 880, 1174].forEach((frequency, index) => tone(frequency, index * .13, .45)); }
    if (!skipAnimation.current) sfx.fanfare();
    if (!reduced) navigator.vibrate?.([60, 30, 90]);
  }
  async function recover() {
    setLoading(true); setError(null);
    try { const data = await getStatus(); if (mounted.current) { setStatus(data); setNeedsRecovery(false); } }
    catch (err) { if (mounted.current) setError(err instanceof Error ? err.message : "กรุณาตรวจสอบผลอีกครั้ง"); }
    finally { if (mounted.current) setLoading(false); }
  }
  async function handleDraw() {
    if (!firebaseUser || drawing.current || !status?.eligible || status.claimed || needsRecovery) return;
    drawing.current = true; skipAnimation.current = false; setDrawBusy(true); setError(null); setPhase("charging"); sfx.unlock(); sfx.rise(3);
    const startedAt = performance.now();
    const controller = new AbortController(); drawAbort.current = controller;
    if (sound) {
      try { audio.current = new AudioContext(); void audio.current.resume(); [220, 294, 440, 587].forEach((frequency, index) => tone(frequency, index * .35, .4)); } catch { /* Sound is optional. */ }
    }
    if (!reduced) {
      timers.current.push(setTimeout(() => { if (mounted.current && !skipAnimation.current) { setPhase("summoning"); sfx.whoosh(1.1); } }, 1200));
      timers.current.push(setTimeout(() => { if (mounted.current && !skipAnimation.current) { setPhase("opening"); sfx.impact(1.3); } }, 3000));
    }
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch("/api/lucky-draw", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ action: "draw" }), signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "เปิดหีบไม่สำเร็จ");
      // The server's persisted voucher is the source of the revealed reward.
      const voucher = data.voucher;
      if (!voucher?.voucherCode) throw new Error("กำลังตรวจสอบบัตรรางวัลที่บันทึกในระบบ");
      const awarded: DrawPrize = { id: voucher.prizeId || data.prize?.id, title: voucher.prizeName || data.prize?.name, description: voucher.description || data.prize?.description, tier: voucher.rarity || data.prize?.rarity, claimedAt: voucher.createdAt, voucherCode: voucher.voucherCode, redeemed: voucher.status === "claimed" };
      if (!reduced && !skipAnimation.current) await new Promise<void>(resolve => {
        releaseReveal.current = resolve;
        timers.current.push(setTimeout(resolve, Math.max(0, 4700 - (performance.now() - startedAt))));
      });
      releaseReveal.current = null;
      showPrize({ ...status, claimed: true, prize: awarded });
      void refreshProfile().catch(() => undefined);
    } catch (err) {
      stopTimers();
      if (!mounted.current) return;
      // A lost response may still have committed a draw. Recover its voucher before offering another attempt.
      try {
        const data = await getStatus(controller.signal);
        if (!mounted.current) return;
        if (data?.claimed) { showPrize(data); return; }
        setStatus(data); setNeedsRecovery(false);
      } catch { if (mounted.current) setNeedsRecovery(true); }
      if (mounted.current) { setPhase("idle"); setError(err instanceof Error ? err.message : "เชื่อมต่อขัดข้อง กรุณาตรวจสอบผลล่าสุด"); }
    } finally { drawing.current = false; if (mounted.current) setDrawBusy(false); }
  }
  const prize = status?.prize;
  const catalogPrize = prize && prizes.items.find(item => item.id === prize.id || item.name === prize.title);
  const image = catalogPrize ? resolveMediaUrl(catalogPrize.imageMediaId, media.items) : "";
  const stageText: Record<Exclude<Phase, "idle" | "revealed">, string> = { charging: "รวมพลังผู้พิทักษ์", summoning: "ชะตากำลังเลือกคุณ", opening: "สมบัติกำลังเผยตัว" };

  return <div className="treasure-page">
    <section className="treasure-hero">
      <Cloudscape /><LatticeCorners /><ImperialCouplet side="left" /><ImperialCouplet side="right" />
      <QiParticles count={10} /><span className="eyebrow"><Sparkles size={15} /> THE DRAGON'S TREASURE</span>
      <h1>หีบสมบัติ<br /><em>แห่งแดนมังกร</em></h1><p>ภารกิจของคุณ อาจนำไปสู่สมบัติชิ้นพิเศษ</p>
      <RitualChest opened={Boolean(prize)} />
      <div className="treasure-hero-caption"><span /><small>{prize ? "สมบัติของคุณถูกบันทึกแล้ว" : "หนึ่งโอกาส · หนึ่งสมบัติ · สำหรับคุณ"}</small><span /></div>
    </section>
    <div className="treasure-content">
      {loading || authLoading ? <div className="treasure-notice" role="status"><img src="/assets/animations/loading-seal.svg" alt="" width={54} /><p>กำลังตรวจสอบใบเบิกทาง...</p></div> : !firebaseUser ? <section className="treasure-notice"><Gift size={26} /><h2>เริ่มภารกิจเพื่อเปิดหีบ</h2><p>ลงทะเบียน แล้วสะสมให้ครบ {rules.pointsRequired} แต้ม<br />เพื่อสุ่มรางวัลหนึ่งครั้ง โดยไม่หักคะแนน</p><Link className="button-imperial-red" to="/register">รับใบเบิกทาง <ArrowRight size={17} /></Link><Link className="treasure-text-link" to="/login">มีบัญชีแล้ว · เข้าสู่ระบบ</Link></section> : prize ? <section className="reward-voucher" aria-label="บัตรรับรางวัล">
        <span className="reward-rarity">{rarityLabels[prize.tier || ""] || "สมบัติของคุณ"}</span><div className="reward-voucher-art"><PrizeArtwork name={prize.title} source={image} /></div><h2>{prize.title}</h2>{prize.description && <p>{prize.description}</p>}
        <div className={`voucher-state ${prize.redeemed ? "redeemed" : ""}`}><ShieldCheck size={17} />{prize.redeemed ? "รับของรางวัลเรียบร้อยแล้ว" : "แสดง Voucher นี้กับเจ้าหน้าที่จุดรับรางวัล"}</div>
        {!prize.redeemed && qr && <img className="voucher-qr" src={qr} alt="QR Voucher สำหรับรับของรางวัล" />}
        {!prize.redeemed && prize.voucherCode && <code className="voucher-code">{prize.voucherCode}</code>}
        <small>กลับมาที่หน้านี้เพื่อดูบัตรรับรางวัลได้ทุกเมื่อ</small>
        <Link className="button-gold-outline" to="/schedule">ออกเดินทางต่อ <ArrowRight size={16} /></Link>
      </section> : status && <section className="treasure-notice">
        <span className="eyebrow">YOUR QUEST PROGRESS</span><h2>{status.eligible ? "ผู้พิทักษ์ยอมรับคุณแล้ว" : "อีกนิดเดียว สมบัติรออยู่"}</h2><p>{status.eligible ? "พร้อมเปิดหีบและลุ้นรางวัลของคุณ" : "ทำภารกิจต่อไปนี้เพื่อปลดล็อกสิทธิ์"}</p>
        <div className="draw-points-progress"><strong>{status.progress.points} / {status.progress.required} แต้ม</strong><div className="reward-journey-bar" role="progressbar" aria-label="คะแนนเพื่อเปิดหีบ" aria-valuemin={0} aria-valuemax={status.progress.required || 1} aria-valuenow={Math.min(status.progress.points,status.progress.required)}><span style={{width:`${status.progress.percent}%`}} /></div><p>{status.eligible ? "คะแนนครบตามกติกาแล้ว" : `สะสมอีก ${status.progress.remaining} แต้ม`}</p><small>ไปแล้ว {status.conditions.visitedVenuesCount} สถานที่ · ร่วม {status.conditions.completedActivitiesCount} กิจกรรม</small></div>
        {status.eligible && !needsRecovery ? <><button className="ceremony-button" onClick={() => void handleDraw()} disabled={drawBusy || phase !== "idle" || status.catalogCount === 0}><Gift size={20} />{drawBusy ? "กำลังรอผลจากเซิร์ฟเวอร์..." : status.catalogCount === 0 ? "รอทีมงานเติมของรางวัล" : "เปิดหีบสมบัติ"} <ArrowRight size={18} /></button><button className="sound-toggle" aria-pressed={sound} onClick={() => setSound(!sound)}>{sound ? <Volume2 size={16} /> : <VolumeX size={16} />}{sound ? "เสียงพิธีเปิด · เปิด" : "เสียงพิธีเปิด · ปิด"}</button><small>สุ่มได้ 1 ครั้งต่อคน · คะแนนคงเดิมหลังสุ่ม · ผลบันทึกในระบบ</small></> : !needsRecovery && <><Link className="button-imperial-red" to="/schedule">เลือกกิจกรรมสะสมแต้ม <ArrowRight size={17} /></Link><Link className="treasure-text-link" to="/survey">ทำแบบประเมิน · โบนัส {status.rules.surveyPoints} แต้ม</Link></>}
      </section>}
      {error && <div className="treasure-error" role="alert"><p>{error}</p><button className="button-gold-outline" disabled={loading} onClick={() => void recover()}><RefreshCw size={16} />ตรวจสอบผลล่าสุด</button></div>}
      <div className="treasure-next-quest"><img src="/assets/brand/dragon-seal.svg" alt="" /><div><strong>การเดินทางยังไม่จบ</strong><p>เก็บตราประทับให้ครบทุกสถานที่<br />ยังมีอีกหลายกิจกรรมให้ค้นพบ</p><Link to="/schedule">เลือกภารกิจถัดไป <ArrowRight size={14} /></Link></div></div>
    </div>
    <AnimatePresence>{phase !== "idle" && <motion.div ref={dialogRef} tabIndex={-1} className={`draw-ceremony phase-${phase}`} role="dialog" aria-modal="true" aria-labelledby="draw-heading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .3 }}>
      <Cloudscape /><LatticeCorners /><QiParticles count={24} /><div className="ceremony-rays" /><div className="ceremony-inner">
        {phase !== "revealed" ? <><span className="eyebrow">THE GUARDIANS HAVE ANSWERED</span><RitualChest active opened={phase === "opening"} /><h2 id="draw-heading" aria-live="polite">{stageText[phase]}</h2><p>ผู้พิทักษ์ทั้งสี่กำลังปลดผนึกสมบัติ</p><div className="ceremony-phase-legend">{["รวมพลัง", "ปลดผนึก", "เผยสมบัติ"].map((label, index) => <span key={label} className={index <= ["charging", "summoning", "opening"].indexOf(phase) ? "active" : ""}><b>{index + 1}</b>{label}</span>)}</div></> : <motion.div className="ceremony-reward" initial={{ scale: reduced ? 1 : .65, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 16 }}><span className="eyebrow">DESTINY HAS CHOSEN</span><span className="ceremony-rarity">{rarityLabels[prize?.tier || ""] || "สมบัติมงคล"}</span><div className="ceremony-prize-art"><div className="treasure-reveal-burst" aria-hidden="true" /><PrizeArtwork name={prize?.title || "สมบัติมงคล"} source={image} /><div className="prize-sparkle one" /><div className="prize-sparkle two" /></div><h2 id="draw-heading">{prize?.title}</h2><p>นี่คือสมบัติที่ผู้พิทักษ์มอบให้คุณ<br />บัตรรับรางวัลถูกเก็บไว้แล้ว</p><button autoFocus className="ceremony-button" onClick={() => setPhase("idle")}>เก็บสมบัติ · ดูบัตรรับรางวัล <ArrowRight size={18} /></button></motion.div>}
        {phase !== "revealed" && <button className="ceremony-skip" onClick={() => { skipAnimation.current = true; releaseReveal.current?.(); setPhase("idle"); }}>ข้ามภาพเคลื่อนไหว · รอผลที่หน้ารางวัล</button>}
      </div>
    </motion.div>}</AnimatePresence>
  </div>;
}
