import { useState } from "react";
import { ArrowRight, CheckCircle2, Compass, Gift, RefreshCw, ScrollText, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRewardPolicy, useVenues } from "@/data/content";
import { rewardProgress } from "@/lib/reward-policy";
import { FortuneKnot, ScrollRolls } from "@/components/ChineseOrnaments";

export function RewardProgress() {
  const { profile, firebaseUser, refreshProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const { rules } = useRewardPolicy(); const venues = useVenues();
  const progress = rewardProgress(profile?.pointTotal || 0, rules);
  const claimed = profile?.luckyDraw?.claimed;
  const awarded = new Set((profile?.transactions || []).filter(t => t.activityId && t.points > 0).map(t => t.venueId));
  const next = venues.items.find(v => !awarded.has(v.id));
  const allVisited = venues.items.length > 0 && venues.items.every(v => profile?.visits?.[v.id]);
  async function refresh() {
    if (refreshing) return;
    setRefreshing(true); setError("");
    try { await refreshProfile(); }
    catch { setError("ยังตรวจคะแนนล่าสุดไม่ได้ กรุณาลองอีกครั้ง"); }
    finally { setRefreshing(false); }
  }
  return <section className="reward-journey" aria-label="ความคืบหน้าสิทธิ์รางวัล">
    <ScrollRolls /><FortuneKnot />
    <div className="reward-journey-top"><span className="eyebrow"><Sparkles size={14} /> YOUR NEXT REWARD</span><span>สุ่ม 1 ครั้ง / คน</span></div>
    <h2>{claimed ? "บัตรรางวัลของคุณพร้อมแล้ว" : progress.eligible && firebaseUser ? "คะแนนครบ · พร้อมเปิดหีบ" : "สะสมแต้ม ปลดผนึกสมบัติ"}</h2>
    {!claimed && <><div className="reward-journey-score"><strong>{progress.points.toLocaleString("th-TH")}</strong><span>/ {progress.required.toLocaleString("th-TH")} แต้ม</span></div><div className="reward-journey-bar" role="progressbar" aria-label="คะแนนเพื่อปลดล็อกรางวัล" aria-valuenow={Math.min(progress.points, progress.required)} aria-valuemin={0} aria-valuemax={progress.required || 1}><span style={{width:`${progress.percent}%`}} /></div><p>{firebaseUser ? progress.eligible ? "เปิดหีบแล้วแสดง Voucher ให้เจ้าหน้าที่รับของรางวัล" : `อีก ${progress.remaining.toLocaleString("th-TH")} แต้มถึงสิทธิ์เปิดหีบ` : "ลงทะเบียนรับใบเบิกทาง แล้วเริ่มเก็บคะแนน"}</p></>}
    <Link className="button-imperial-red" to={!firebaseUser ? "/register" : claimed || progress.eligible ? "/lucky-draw" : next ? `/venue/${next.id}` : "/schedule"}>{claimed ? <ScrollText size={18} /> : progress.eligible && firebaseUser ? <Gift size={18} /> : <Compass size={18} />}{!firebaseUser ? "รับใบเบิกทาง" : claimed ? "ดู Voucher รับของรางวัล" : progress.eligible ? "ไปเปิดหีบสมบัติ" : next ? `ไปทำภารกิจ · ${next.name}` : "เลือกภารกิจสะสมแต้ม"}<ArrowRight size={17} /></Link>
    {firebaseUser && !profile?.surveyCompleted && !claimed && <Link className="reward-survey-link" to="/survey">ทำแบบประเมิน · รับโบนัส {rules.surveyPoints} แต้ม <ArrowRight size={14} /></Link>}
    {firebaseUser && <button className="reward-refresh" onClick={()=>void refresh()} disabled={refreshing}><RefreshCw size={14} />{refreshing ? "กำลังตรวจข้อมูล..." : "ตรวจคะแนนและสิทธิ์ล่าสุด"}</button>}
    {error && <p role="alert">{error}</p>}
    {allVisited && <div className="journey-achievement"><CheckCircle2 size={20} /><span><strong>ผู้พิชิตทั้ง 4 แดน</strong><small>คุณสำรวจครบทุกสถานที่แล้ว</small></span></div>}
    <details className="reward-rules"><summary>กติกาคะแนนและการรับรางวัล</summary><ul><li>QR สถานที่ครั้งแรก +{rules.pointsPerVenue} แต้ม หากร่วมกิจกรรมที่นั่นก่อน ระบบเช็กอินให้อัตโนมัติโดยไม่เพิ่มแต้มเช็กอินแยก</li><li>กิจกรรมที่ให้แต้มครั้งแรกในแต่ละสถานที่ +{rules.pointsPerVenue} แต้ม กิจกรรมถัดไปในสถานที่เดียวกันยังบันทึกได้ แต่ไม่เพิ่มแต้ม</li><li>แบบประเมิน +{rules.surveyPoints} แต้ม ครั้งเดียว</li><li>ครบ {rules.pointsRequired} แต้ม สุ่มได้ 1 ครั้ง คะแนนคงเดิมหลังสุ่ม</li></ul><p>ตัวอย่าง: ทำกิจกรรมต่างสถานที่ 2 จุด หรือทำกิจกรรม 1 จุดแล้วตอบแบบประเมิน เมื่อยอดแต้มครบก็รับสิทธิ์ได้</p><p>การสำรวจครบ 4 แดนเป็นความสำเร็จเพิ่มเติมของใบเบิกทาง</p></details>
  </section>;
}
