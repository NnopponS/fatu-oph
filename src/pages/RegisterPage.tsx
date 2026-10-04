import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, ScrollText, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { checkUsername } from "@/services/auth";
import { readRealtime, realtimePaths } from "@/services/realtime";
import { useRewardPolicy, useSite } from "@/data/content";
import { FortuneKnot } from "@/components/ChineseOrnaments";

const defaultGrades = ["ประถมต้น (ป.1 - ป.3)","ประถมปลาย (ป.4 - ป.6)","มัธยมศึกษาปีที่ 1 (ม.1)","มัธยมศึกษาปีที่ 2 (ม.2)","มัธยมศึกษาปีที่ 3 (ม.3)","มัธยมศึกษาปีที่ 4 (ม.4)","มัธยมศึกษาปีที่ 5 (ม.5)","มัธยมศึกษาปีที่ 6 (ม.6)","ประกาศนียบัตรวิชาชีพ (ปวช.)","ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)","บุคคลทั่วไป / ผู้ปกครอง / ครู"];
const defaultTracks = ["วิทย์–คณิต","ศิลป์–คำนวณ","ศิลป์–ภาษา","ศิลป์–สังคม / ทั่วไป","อาชีวศึกษา / ปวช.","อื่น ๆ"].map((label,index) => ({id:String(index),label}));

export function RegisterPage() {
  const navigate = useNavigate(); const { register } = useAuth(); const site = useSite(); const { rules } = useRewardPolicy();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({firstName:"",lastName:"",school:"",grade:"",academicTrack:"",academicTrackOther:"",phone:"",email:"",username:"",password:"",confirmPassword:""});
  const [tracks, setTracks] = useState(defaultTracks); const [grades, setGrades] = useState(defaultGrades);
  const [configOpen, setConfigOpen] = useState(true); const [consentText, setConsentText] = useState("");
  const [consent, setConsent] = useState(false); const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{available:boolean;checked:boolean;msg:string}>({available:true,checked:false,msg:""});
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const [information, setInformation] = useState<"terms" | "privacy" | null>(null);
  const heading = useRef<HTMLHeadingElement>(null); const dialog = useRef<HTMLDivElement>(null);
  const general = /บุคคลทั่วไป|ผู้ปกครอง|ครู/.test(form.grade);
  const otherTrack = form.academicTrack === "อื่น ๆ" || form.academicTrack.toLowerCase().includes("other");
  const registrationOpen = configOpen && site.item?.registrationOpen !== false;
  const change = (key: keyof typeof form, value:string) => { setForm(current => ({...current,[key]:value})); setError(""); };

  useEffect(() => {
    let active = true;
    void readRealtime<{academicTracks?:typeof defaultTracks;grades?:string[];registrationOpen?:boolean;consentText?:string}>(realtimePaths.public.registrationConfig).then(config => {
      if (!active) return;
      if (config?.academicTracks?.length) setTracks(config.academicTracks);
      if (config?.grades?.length) setGrades(config.grades);
      setConfigOpen(config?.registrationOpen !== false); setConsentText(config?.consentText || "");
    }).catch(() => undefined);
    return () => {active=false;};
  }, []);
  useEffect(() => {
    let active = true;
    setUsernameStatus({available:true,checked:false,msg:""});
    if (form.username.trim().length < 3) return;
    const timer = setTimeout(() => {
      void checkUsername(form.username.trim()).then(result => {
        if (active) setUsernameStatus({available:result.available,checked:true,msg:result.available ? "ชื่อผู้ใช้นี้ว่างอยู่" : result.reason || "ชื่อผู้ใช้นี้ถูกใช้แล้ว"});
      }).catch(() => { if (active) setUsernameStatus({available:true,checked:false,msg:"ระบบจะตรวจชื่อผู้ใช้อีกครั้งตอนลงทะเบียน"}); });
    },400);
    return () => {active=false;clearTimeout(timer);};
  }, [form.username]);
  useEffect(() => { heading.current?.focus({preventScroll:true}); }, [step]);
  useEffect(() => {
    if (!information) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previous = document.body.style.overflow; document.body.style.overflow="hidden";
    dialog.current?.focus();
    const key = (e:KeyboardEvent) => { if (e.key==="Escape") setInformation(null); if (e.key==="Tab") {e.preventDefault();dialog.current?.querySelector<HTMLButtonElement>("button")?.focus();} };
    document.addEventListener("keydown",key);
    return () => {document.body.style.overflow=previous;document.removeEventListener("keydown",key);previousFocus?.focus();};
  }, [information]);

  async function submit(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (!registrationOpen) {setError("ขณะนี้ปิดรับลงทะเบียน");return;}
    if (step === 1) {
      if (!form.firstName.trim() || !form.lastName.trim() || !general && !form.school.trim()) {setError("กรุณากรอกชื่อ นามสกุล และสถานศึกษาให้ครบ");return;}
      setStep(2); return;
    }
    if (form.password !== form.confirmPassword) {setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");return;}
    if (!consent) {setError("กรุณารับทราบกติกาและการใช้ข้อมูลก่อนลงทะเบียน");return;}
    if (usernameStatus.checked && !usernameStatus.available) {setError("กรุณาเลือกชื่อผู้ใช้ที่ยังว่าง");return;}
    setBusy(true);
    try {
      await register({...form,firstName:form.firstName.trim(),lastName:form.lastName.trim(),school:form.school.trim() || "บุคคลทั่วไป",email:form.email.trim(),phone:form.phone.trim(),username:form.username.trim(),academicTrack:general ? "บุคคลทั่วไป" : form.academicTrack,academicTrackOther:general ? "" : otherTrack ? form.academicTrackOther.trim() : undefined,consent:true});
      navigate("/profile");
    } catch (err) {setError(err instanceof Error ? err.message : "ลงทะเบียนไม่สำเร็จ กรุณาลองอีกครั้ง");}
    finally {setBusy(false);}
  }

  return <div className="chinese-auth-page register-flow"><div className="register-shell">
    <Link to="/" className="register-back"><ArrowLeft size={16} />กลับหน้าแรก</Link>
    <header><FortuneKnot /><img src="/assets/brand/dragon-seal.svg" alt="" /><span className="eyebrow">YOUR ADVENTURE STARTS HERE</span><h1>รับใบเบิกทางแดนมังกร</h1><p>ลงทะเบียนเพื่อสะสมแต้มและเก็บบัตรรางวัลไว้ในบัญชี</p></header>
    <ol className="register-stepper" aria-label="ขั้นตอนลงทะเบียน"><li aria-current={step===1 ? "step" : undefined} className={step===1 ? "active" : "done"}><span>{step===2 ? <Check size={16} /> : "1"}</span>ข้อมูลผู้เข้าร่วม</li><li aria-current={step===2 ? "step" : undefined} className={step===2 ? "active" : ""}><span>2</span>สร้างใบเบิกทาง</li></ol>
    {!registrationOpen && <p className="form-error" role="status">ขณะนี้ปิดรับลงทะเบียน ผู้มีบัญชีแล้วเข้าสู่ระบบได้ตามปกติ</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    <form onSubmit={event => void submit(event)} className="register-step" key={step}>
      <h2 ref={heading} tabIndex={-1}>{step===1 ? "คุณคือใครในการเดินทางนี้?" : "สร้างบัญชีเพื่อเก็บความคืบหน้า"}</h2>
      {step===1 ? <>
        <div className="register-columns"><label htmlFor="register-first">ชื่อ<input id="register-first" value={form.firstName} onChange={e=>change("firstName",e.target.value)} autoComplete="given-name" required maxLength={60} /></label><label htmlFor="register-last">นามสกุล<input id="register-last" value={form.lastName} onChange={e=>change("lastName",e.target.value)} autoComplete="family-name" required maxLength={60} /></label></div>
        <label htmlFor="register-grade">ระดับการศึกษา / ประเภทผู้เข้าร่วม<select id="register-grade" value={form.grade} onChange={e=>change("grade",e.target.value)} required><option value="">เลือกประเภทผู้เข้าร่วม</option>{grades.map(g=><option key={g}>{g}</option>)}</select></label>
        <label htmlFor="register-school">{general ? "โรงเรียน / หน่วยงาน (ถ้ามี)" : "โรงเรียน / สถาบันการศึกษา"}<input id="register-school" value={form.school} onChange={e=>change("school",e.target.value)} autoComplete="organization" required={!general} maxLength={160} /></label>
        {!general && <><label htmlFor="register-track">สายการเรียน<select id="register-track" value={form.academicTrack} onChange={e=>change("academicTrack",e.target.value)} required><option value="">เลือกสายการเรียน</option>{tracks.map(t=><option key={t.id} value={t.label}>{t.label}</option>)}</select></label>{otherTrack && <label htmlFor="register-other">ระบุสายการเรียน<input id="register-other" value={form.academicTrackOther} onChange={e=>change("academicTrackOther",e.target.value)} required maxLength={120} /></label>}</>}
        <label htmlFor="register-phone">เบอร์โทรศัพท์<input id="register-phone" type="tel" inputMode="tel" value={form.phone} onChange={e=>change("phone",e.target.value)} autoComplete="tel" required minLength={9} maxLength={25} /></label>
        <label htmlFor="register-email">อีเมล<small>สำหรับติดต่อและกู้คืนบัญชี</small><input id="register-email" type="email" value={form.email} onChange={e=>change("email",e.target.value)} autoComplete="email" required maxLength={120} /></label>
        <button className="chinese-btn-primary" type="submit" disabled={!registrationOpen || site.loading}>ถัดไป · สร้างใบเบิกทาง <ArrowRight size={17} /></button>
      </> : <>
        <p className="register-person"><ScrollText size={19} /><span>{form.firstName} {form.lastName}<small>{form.school || "บุคคลทั่วไป"}</small></span></p>
        <label htmlFor="register-username">ชื่อผู้ใช้<input id="register-username" value={form.username} onChange={e=>change("username",e.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} required pattern="[A-Za-z0-9_-]{3,30}" minLength={3} maxLength={30} aria-describedby="username-help" /></label><small id="username-help" className={usernameStatus.checked && !usernameStatus.available ? "form-error" : "register-hint"}>{usernameStatus.msg || "ภาษาอังกฤษ ตัวเลข _ หรือ - ความยาว 3–30 ตัวอักษร"}</small>
        <label htmlFor="register-password">รหัสผ่าน<small>อย่างน้อย 6 ตัวอักษร</small><div className="register-password"><input id="register-password" type={showPassword ? "text" : "password"} value={form.password} onChange={e=>change("password",e.target.value)} autoComplete="new-password" required minLength={6} maxLength={128} /><button type="button" aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"} onClick={()=>setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></label>
        <label htmlFor="register-confirm">ยืนยันรหัสผ่าน<input id="register-confirm" type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={e=>change("confirmPassword",e.target.value)} autoComplete="new-password" required minLength={6} /></label>
        <label className="register-consent" htmlFor="consent"><input id="consent" type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required /><span>ยอมรับกติกาการเข้าร่วมและรับทราบการใช้ข้อมูลลงทะเบียน</span></label>
        <div className="register-information"><button type="button" onClick={()=>setInformation("terms")}>กติกาเข้าร่วมงาน</button><button type="button" onClick={()=>setInformation("privacy")}>ข้อมูลของคุณใช้ทำอะไร?</button></div>
        <div className="register-actions"><button className="button-gold-outline" type="button" onClick={()=>{setStep(1);setError("");}} disabled={busy}><ArrowLeft size={16} />กลับ</button><button className="chinese-btn-primary" type="submit" disabled={busy || !registrationOpen}>{busy ? "กำลังสร้างใบเบิกทาง..." : "รับใบเบิกทาง"}<ArrowRight size={17} /></button></div>
      </>}
    </form>
    <p className="register-login">มีบัญชีแล้ว? <Link to="/login">เข้าสู่ระบบ</Link></p>
    {information && <div className="registration-info-modal" role="dialog" aria-modal="true" aria-labelledby="registration-info-title" ref={dialog} tabIndex={-1}><div><button aria-label="ปิดข้อมูล" onClick={()=>setInformation(null)}><X size={21} /></button><h2 id="registration-info-title">{information==="terms" ? "กติกาการเข้าร่วมงาน" : "การใช้ข้อมูลลงทะเบียน"}</h2>{information==="terms" ? <><p>{consentText || "ใบเบิกทางใช้บันทึกการเข้าร่วมกิจกรรม คะแนน และสิทธิ์รางวัลของผู้ลงทะเบียนแต่ละคน"}</p><p>สะสมครบ {rules.pointsRequired} แต้ม สุ่มได้ 1 ครั้งต่อคน คะแนนคงเดิมหลังสุ่ม แสดง Voucher ต่อ Staff เพื่อรับรางวัลตามผลที่บันทึกในระบบ</p></> : <><p>ระบบเก็บชื่อ สถานศึกษา ระดับการศึกษา สายการเรียน เบอร์โทร อีเมล ชื่อผู้ใช้ และประวัติกิจกรรม เพื่อจัดการการเข้าร่วมงาน ใบเบิกทาง คะแนนและรางวัล รวมถึงการติดต่อและกู้คืนบัญชี</p><p>เจ้าหน้าที่ใช้งานข้อมูลตามบทบาทที่ได้รับ หากต้องการแก้ไขข้อมูลหรือความช่วยเหลือ ติดต่อทีมงานที่จุดลงทะเบียน</p></>}</div></div>}
  </div></div>;
}
