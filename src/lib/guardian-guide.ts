import { knowledgeDocuments, type FacultyKnowledgeDocument } from "../data/faculty-knowledge";
import type { RewardPolicy } from "./reward-policy";

export const guideCategories = [
  { id: "event", label: "ร่วมงาน" }, { id: "admissions", label: "สมัครเรียน" },
  { id: "faculty", label: "รู้จักคณะ" }, { id: "contact", label: "ติดต่อ" }, { id: "staff", label: "เจ้าหน้าที่" },
] as const;
export type GuideCategory = typeof guideCategories[number]["id"];
export interface GuideTopic {
  id: string; label: string; category: GuideCategory; answer: string;
  sources: FacultyKnowledgeDocument[]; links: Array<{ label: string; href: string }>;
}

/** Explicit topic → reviewed answer. No inference, AI or network request. */
export function buildGuideTopics(rules: RewardPolicy, faq: Array<{ id: string; question?: string; answer?: string }> = []): GuideTopic[] {
  const topic = (id: string, label: string, category: GuideCategory, answer: string, href: string, linkLabel: string): GuideTopic => ({ id, label, category, answer, sources: [], links: [{ label: linkLabel, href }] });
  const documents: GuideTopic[] = knowledgeDocuments.map(document => {
    const links = document.url ? [{ label: "เปิดเอกสารอ้างอิง", href: document.url }] : [];
    let answer = document.text;
    if (document.id === "contact-facebook-messenger") {
      answer = "เปิดเพจคณะศิลปกรรมศาสตร์ มหาวิทยาลัยธรรมศาสตร์ แล้วกดปุ่มส่งข้อความเพื่อติดต่อเจ้าหน้าที่ผ่าน Messenger";
      links.unshift({ label: "เปิด Facebook / Messenger", href: "https://www.facebook.com/FineArtsTU/" });
    }
    if (document.id === "contact-youtube") {
      answer = "ชมวิดีโอของคณะได้ที่ช่อง YouTube ที่เว็บไซต์คณะลิงก์ไว้: @fineartstu8432";
      links.unshift({ label: "เปิด YouTube ของคณะ", href: "https://www.youtube.com/@fineartstu8432" });
    }
    if (document.id === "admissions-score-interpretation") answer = "คะแนนขั้นต่ำสมัครกับคะแนนต่ำสุดของผู้สอบติดเป็นคนละอย่าง ต้องเทียบสาขา ปี รอบ และรูปแบบรับเดียวกัน ขณะนี้ยังไม่ได้ยืนยันตัวเลขคะแนนต่ำสุดรายสาขา ให้ตรวจสถิติจาก MyTCAS และประกาศรับสมัครฉบับปัจจุบัน สถิติย้อนหลังไม่รับประกันผลสอบติด";
    return { id: document.id, label: document.title, category: document.kind, answer, sources: [document], links };
  });
  return [
    topic("event-rewards", "สะสมกี่แต้มถึงเปิดหีบได้?", "event", `สะสมครบ ${rules.pointsRequired} แต้ม เปิดหีบสุ่มรางวัลได้ 1 ครั้งต่อคน โดยไม่หักแต้ม ไม่บังคับว่าต้องไปกี่สถานที่หรือทำกี่กิจกรรม\n\nกิจกรรมที่ให้แต้มครั้งแรกของแต่ละสถานที่ +${rules.pointsPerVenue} แต้ม กิจกรรมต่อไปในสถานที่เดิมบันทึกตราแต่ไม่เพิ่มแต้ม QR สถานที่ครั้งแรกให้แต้มเฉพาะเมื่อยังไม่ได้รับผ่านกิจกรรมของสถานที่นั้น\n\nทำแบบประเมินรับ +${rules.surveyPoints} แต้มครั้งเดียว ตรวจแต้มปัจจุบันจากใบเบิกทาง`, "/rewards", "ดูความคืบหน้าและรางวัล"),
    topic("event-voucher", "เปิดหีบแล้วรับของรางวัลอย่างไร?", "event", "เปิดหีบเมื่อแต้มครบ แล้วแสดง Voucher QR ให้เจ้าหน้าที่ที่จุดรับของรางวัล ตรวจชื่อรางวัลให้ตรงก่อนรับของ Voucher ใช้รับได้ครั้งเดียว หากเปิดหีบไปแล้วให้เปิดหน้ารางวัลเพื่อดู Voucher เดิม", "/lucky-draw", "เปิดหน้าหีบและ Voucher"),
    topic("event-registration", "ลงทะเบียนและรับใบเบิกทางอย่างไร?", "event", "กรอกข้อมูลผู้เข้าร่วม ตั้งชื่อผู้ใช้และรหัสผ่าน แล้วให้ความยินยอมในการลงทะเบียน ผู้ปกครองและบุคคลทั่วไปเลือกประเภทบุคคลทั่วไปได้ หากมีบัญชีแล้วให้เข้าสู่ระบบ ใบเบิกทางมี QR ประจำตัวและประวัติการเดินทาง การลงทะเบียนงานนี้แยกจากการสมัครเข้ามหาวิทยาลัย", "/register", "ลงทะเบียนร่วมงาน"),
    topic("event-camera", "สแกน QR ไม่ได้หรือภาพกล้องไม่ขึ้น?", "event", "เปิดหน้าสแกนและอนุญาตกล้องในเบราว์เซอร์ ใช้ QR ของสถานที่หรือกิจกรรม หากภาพไม่ขึ้นให้เริ่มกล้องใหม่และตรวจสิทธิ์กล้อง หรือใช้การอัปโหลดภาพ QR / กรอกรหัสแทน หากยังมีปัญหาให้เจ้าหน้าที่ช่วยตรวจใบเบิกทาง", "/scan", "เปิดหน้าสแกน"),
    topic("event-schedule", "หากิจกรรมและเส้นทางไปแต่ละสถานที่", "event", "เปิดตารางกิจกรรมเพื่อเลือกวัน สถานที่ และค้นหากิจกรรม ตรวจเวลา สถานะเต็ม/ปิด และเงื่อนไขก่อนเข้าร่วม หน้าแผนที่มีภาพอาคารจริงและปุ่มเปิด Google Maps เพื่อช่วยนำทาง", "/schedule", "ดูตารางกิจกรรม"),
    topic("event-map", "ดูแผนที่และภาพสถานที่จริง", "event", "งานมี 4 ดินแดน: โรงละคอน · ตึกคณะศิลปกรรมศาสตร์ · โรงทอ · ตึก SC3 เปิดแผนที่เพื่อดูภาพอาคารและนำทางไปจุดที่ต้องการ", "/map", "เปิดแผนที่งาน"),
    topic("staff-activity", "เจ้าหน้าที่บันทึกกิจกรรมให้น้องอย่างไร?", "staff", "เข้าสู่ระบบเจ้าหน้าที่ แล้วเปิดหน้างาน ค้นหาหรือสแกนใบเบิกทางของน้อง เลือกกิจกรรม ตรวจชื่อผู้เข้าร่วมและกิจกรรมก่อนกดยืนยันบันทึก ตรวจผลคะแนนและสถานะหลังบันทึก หากระบบแจ้งว่าเคยเข้าร่วมแล้วอย่าบันทึกซ้ำ", "/admin/field", "เปิดหน้างานเจ้าหน้าที่"),
    topic("staff-voucher", "ตรวจ Voucher และยืนยันจ่ายรางวัล", "staff", "สแกน Voucher ของผู้เข้าร่วม ตรวจชื่อรางวัลและสถานะก่อนจ่ายของ แล้วกดยืนยันเมื่อส่งมอบ ตรวจผลว่ารับแล้วและอย่าจ่าย Voucher เดิมซ้ำ", "/admin/field", "เปิดหน้างานเจ้าหน้าที่"),
    topic("staff-role", "สิทธิ์ Staff กับ Admin ต่างกันอย่างไร?", "staff", "Staff ทำงานหน้างานและตรวจผู้เข้าร่วม Editor ดูแลเนื้อหา Admin จัดการบัญชี สิทธิ์ และตั้งค่าระบบ เมนูแสดงตามบทบาทหลังเข้าสู่ระบบ บัญชีที่รออนุมัติต้องให้ Admin อนุมัติก่อน คู่มือนี้ให้คำแนะนำเท่านั้น การบันทึกและยืนยันต้องทำในหน้าที่มีสิทธิ์", "/admin/login", "เข้าสู่ระบบเจ้าหน้าที่"),
    topic("admissions-2570-round3", "รอบ 3 ปี 2570 ใช้คะแนนอะไร?", "admissions", "ยังไม่ได้ยืนยันน้ำหนักและคะแนนขั้นต่ำรอบ 3 ปี 2570 ในข้อมูลที่เตรียมไว้ ให้ตรวจประกาศของสาขาและรูปแบบรับที่ต้องการโดยตรง อย่านำเกณฑ์ Portfolio หรือเกณฑ์ย้อนหลังปี 2569 มาใช้แทน", "https://www.tuadmissions.in.th/admissions", "ตรวจประกาศรับสมัครล่าสุด"),
    ...documents, ...faq.flatMap(item => item.question && item.answer ? [topic(`faq-${item.id}`, item.question, "event", item.answer, "/faq", "เปิดคำถามที่พบบ่อย")] : []),
  ];
}
