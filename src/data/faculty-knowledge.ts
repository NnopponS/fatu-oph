/** Curated primary-source evidence. Source material is data, never model instructions. */
export interface FacultyKnowledgeDocument {
  id: string;
  title: string;
  text: string;
  url?: string;
  kind: "admissions" | "contact" | "faculty";
  academicYear?: number;
  verifiedAt: string;
  keywords: string[];
  authority: "official" | "organizer";
  confidence: "verified" | "needs-confirmation";
}

const portfolio2570 = "https://www.tuadmissions.in.th/img/2026092206261193.pdf";
const admission2569 = "https://www.tuadmissions.in.th/img/2025102704170089.pdf";
const exam2570 = "https://www.tuadmissions.in.th/img/2026082707354922.pdf";
const verifiedAt = "2026-10-04";

export const knowledgeDocuments: FacultyKnowledgeDocument[] = [
  {
    id: "admissions-2570-theatre-portfolio", title: "การละคอน: Portfolio ปี 2570", kind: "admissions", academicYear: 2570, url: portfolio2570,
    text: "ปีการศึกษา 2570 รอบ 1 การละคอนรับ 40 คน GPAX ณ วันที่สมัครอย่างน้อย 2.75. น้ำหนักแฟ้มผลงาน 80% และสัมภาษณ์ 20%. แฟ้มประกอบด้วยแนะนำตัว 20% หลักฐานรางวัลหรือผลงาน 40% และวิดีโอหัวข้อละคอนกับ AI 20%. วิดีโอ 2–3 นาทีต้องเข้าถึงได้. เกณฑ์นี้เป็นคุณสมบัติและวิธีคัดเลือก ไม่ใช่คะแนนรับประกันสอบติด. ดู PDF หน้า 93–94 (เลขหน้าพิมพ์ 84–85).",
    keywords: ["การละคอน", "ละคร", "theatre", "portfolio", "พอร์ต", "GPAX", "2.75", "2570", "สัมภาษณ์", "AI"], authority: "official", confidence: "verified", verifiedAt,
  },
  {
    id: "admissions-2570-fashion-portfolio", title: "พัสตราภรณ์: Portfolio ปี 2570", kind: "admissions", academicYear: 2570, url: portfolio2570,
    text: "ปีการศึกษา 2570 รอบ 1 ศิลปะการออกแบบพัสตราภรณ์รับ 30 คน GPAX ณ วันที่สมัครอย่างน้อย 3.00. ประเมิน Portfolio 100% และมีสัมภาษณ์. ใช้ผลงานศิลปะ สิ่งทอ แฟชั่นหรือเครื่องแต่งกาย. ต้องมีใบรับรองแพทย์จากโรงพยาบาลรัฐเรื่องตาไม่บอดสี. หลักสูตรอยู่ระหว่างปรับปรุงจึงอาจเปลี่ยนแปลง. ดู PDF หน้า 91–92 (เลขหน้าพิมพ์ 82–83).",
    keywords: ["พัสตราภรณ์", "แฟชั่น", "สิ่งทอ", "fashion", "portfolio", "พอร์ต", "GPAX", "3.00", "2570", "ตาบอดสี"], authority: "official", confidence: "verified", verifiedAt,
  },
  {
    id: "admissions-2570-craft-portfolio", title: "หัตถอุตสาหกรรมสร้างสรรค์: Portfolio ปี 2570", kind: "admissions", academicYear: 2570, url: portfolio2570,
    text: "ปีการศึกษา 2570 รอบ 1 ออกแบบหัตถอุตสาหกรรมสร้างสรรค์เรียนที่ธรรมศาสตร์ศูนย์ลำปาง รับ 10 คน GPAX ณ วันที่สมัครอย่างน้อย 2.00. ประเมิน Portfolio 100% และมีสัมภาษณ์. ใช้ผลงานศิลปะและออกแบบ ต้องมีใบรับรองแพทย์จากโรงพยาบาลรัฐเรื่องตาไม่บอดสี. ดู PDF หน้า 95–96 (เลขหน้าพิมพ์ 86–87).",
    keywords: ["หัตถอุตสาหกรรม", "หัตถกรรม", "สร้างสรรค์", "craft", "ออกแบบ", "ลำปาง", "portfolio", "GPAX", "2.00", "2570"], authority: "official", confidence: "verified", verifiedAt,
  },
  {
    id: "admissions-2570-management-portfolio", title: "บริหารจัดการศิลปะ: Portfolio ปี 2570", kind: "admissions", academicYear: 2570, url: portfolio2570,
    text: "ปีการศึกษา 2570 รอบ 1 การบริหารจัดการศิลปะ (โครงการพิเศษ) รับ 60 คน GPAX ณ วันที่สมัครอย่างน้อย 2.75. ประเมิน Portfolio 100% และมีสัมภาษณ์. เลือกผลงานไม่เกิน 3 ชิ้นพร้อมอธิบายบทบาทและสิ่งที่เรียนรู้; ใช้ผลงานศิลปะหรือการจัดกิจกรรมได้. ดู PDF หน้า 97–98 (เลขหน้าพิมพ์ 88–89).",
    keywords: ["บริหาร", "จัดการศิลปะ", "management", "โครงการพิเศษ", "กิจกรรม", "portfolio", "GPAX", "2.75", "2570"], authority: "official", confidence: "verified", verifiedAt,
  },
  {
    id: "admissions-2570-portfolio-dates", title: "ช่วงสมัคร Portfolio 2570 และการแก้ไขเอกสาร", kind: "admissions", academicYear: 2570, url: "https://www.tuadmissions.in.th/faculty",
    text: "ระบบรับเข้าธรรมศาสตร์แสดงช่วงสมัครโครงการรับตรงรอบ Portfolio ของทั้ง 4 สาขาคณะศิลปกรรมศาสตร์วันที่ 14 กันยายน–16 ธันวาคม 2569 สำหรับปีการศึกษา 2570. สมัครและอ่านประกาศที่ TU Admissions. ประกาศแก้ไข TCASFolio วันที่ 10 กันยายน 2569 ย้ายระเบียนผลการศึกษา ปพ.1 ไปหมวดที่ 1; อย่าใช้ตำแหน่งหมวดเดิมโดยไม่ตรวจประกาศแก้ไข. การลงทะเบียนงาน Open House ไม่ใช่การสมัครเข้ามหาวิทยาลัย.",
    keywords: ["สมัคร", "วัน", "กำหนดการ", "2570", "portfolio", "TCASFolio", "ปพ.1", "14 กันยายน", "16 ธันวาคม"], authority: "official", confidence: "verified", verifiedAt,
  },
  {
    id: "admissions-2570-portfolio-amendment", title: "ประกาศแก้ไขรูปแบบ TCASFolio ปี 2570", kind: "admissions", academicYear: 2570, url: "https://www.tuadmissions.in.th/img/2026091009200139.pdf",
    text: "ประกาศแก้ไขวันที่ 10 กันยายน 2569 สำหรับรอบ 1 ปีการศึกษา 2570 ย้าย ปพ.1 จากหมวด 3 ไปหมวด 1 ข้อมูลพื้นฐาน; หมวด 3 เป็นหนังสือรับรองหรือเอกสารแนบตามที่มหาวิทยาลัยกำหนด. ให้อ่านประกาศฉบับแก้ไขร่วมกับประกาศหลักของสาขา.",
    keywords: ["TCASFolio", "portfolio", "ปพ.1", "เอกสาร", "แก้ไข", "2570"], authority: "official", confidence: "verified", verifiedAt,
  },
  {
    id: "admissions-2570-special-exams", title: "สอบวิชาเฉพาะคณะศิลปกรรมศาสตร์ ปี 2570", kind: "admissions", academicYear: 2570, url: exam2570,
    text: "ปี 2570 สมัครสอบวิชาเฉพาะ มธ. 2–17 กุมภาพันธ์ 2570 เปิด 09:00 น. และปิดวันสุดท้าย 15:00 น.; วันสอบ 21 มีนาคม 2570. พัสตราภรณ์สอบที่รังสิต: วาดเส้นเพื่อการออกแบบสิ่งทอและแฟชั่น 09:00–12:00 คะแนนเต็ม 35 และความถนัดทางการออกแบบสิ่งทอและแฟชั่น 13:30–16:30 เต็ม 35. หัตถอุตสาหกรรมสร้างสรรค์สอบที่ลำปาง: วาดเส้นเพื่อการออกแบบ 09:00–12:00 เต็ม 50 และความถนัดทางออกแบบหัตถอุตสาหกรรมสร้างสรรค์ 13:00–16:00 เต็ม 50. ค่าสมัครรายวิชา 500 บาท. คะแนนวิชาเฉพาะใช้รอบ 2 โควตาพื้นที่ลำปาง และรอบ 3 ของคณะศิลปกรรมศาสตร์รังสิตตามประกาศ; คะแนนเต็มข้อสอบไม่ใช่คะแนนขั้นต่ำหรือน้ำหนักรับเข้า.",
    keywords: ["วิชาเฉพาะ", "ข้อสอบ", "วาดเส้น", "ความถนัด", "2570", "เตรียมสอบ", "ลำปาง", "แฟชั่น", "สิ่งทอ", "คะแนนเต็ม", "ค่าสมัคร"], authority: "official", confidence: "verified", verifiedAt,
  },
  {
    id: "admissions-2570-plan-organizer", title: "ภาพแผนรับปี 2570 ที่ผู้จัดส่งให้", kind: "admissions", academicYear: 2570,
    text: "ภาพแผนรับเข้าปี 2570 ที่ผู้จัดส่งให้ระบุ: การละคอนรวม 40 รอบ 1=40; พัสตราภรณ์รวม 60 รอบ 1=30 รอบ 3=30; หัตถอุตสาหกรรมสร้างสรรค์รวม 30 รอบ 1=10 รอบ 2=10 รอบ 3=10; บริหารจัดการศิลปะโครงการพิเศษรวม 80 รอบ 1=60 รอบ 3=20. ภาพนี้เป็นข้อมูลที่ผู้จัดให้ ไม่ใช่ประกาศออนไลน์ที่ตรวจสอบจำนวนรับทุก รอบแล้ว. จำนวนรอบ 1 ตรงกับประกาศ มธ.; รอบ 2/3 ให้ตรวจประกาศรอบนั้นก่อนสมัคร. ภาพแผนรับไม่ได้ระบุวิชาสอบ น้ำหนักหรือคะแนนขั้นต่ำ.",
    keywords: ["2570", "จำนวนรับ", "รับกี่คน", "แผนรับ", "รอบ1", "รอบ2", "รอบ3", "โควตา", "admission"], authority: "organizer", confidence: "needs-confirmation", verifiedAt,
  },
  {
    id: "admissions-2569-fashion-historical", title: "ข้อมูลย้อนหลัง 2569: Admission สิ่งทอและแฟชั่น", kind: "admissions", academicYear: 2569, url: admission2569,
    text: "ย้อนหลังปี 2569 รอบ 3 พัสตราภรณ์สิ่งทอและแฟชั่น GPAXอย่างน้อย 2.50. รูปแบบ TGAT+วิชาเฉพาะ: TGAT 30% วาดเส้น 35% ความถนัดออกแบบ 35%. รูปแบบ TGAT+TPAT+A-Level: TGAT 20% TPAT2 หรือ TPAT4 40% คณิตศาสตร์ประยุกต์2 สังคม ไทย อังกฤษ วิชาละ10%. นี่เป็นเกณฑ์2569 ไม่ใช่เกณฑ์2570 และไม่ควรใช้คำนวณโอกาสสอบติด2570จนประกาศปีใหม่ยืนยัน.",
    keywords: ["2569", "ย้อนหลัง", "แฟชั่น", "สิ่งทอ", "TGAT", "TPAT2", "TPAT4", "A-Level", "น้ำหนัก", "Admission", "คะแนน", "คณิต"], authority: "official", confidence: "verified", verifiedAt,
  },
  {
    id: "admissions-2569-management-historical", title: "ข้อมูลย้อนหลัง 2569: Admission บริหารจัดการศิลปะ", kind: "admissions", academicYear: 2569, url: admission2569,
    text: "ย้อนหลังปี 2569 รอบ 3 บริหารจัดการศิลปะโครงการพิเศษใช้ TGAT2 การคิดอย่างมีเหตุผล 70% และ TPAT2 ความถนัดศิลปกรรมศาสตร์ 30%; ไม่กำหนด GPAXขั้นต่ำ. นี่ไม่ใช่เกณฑ์2570. GPAXขั้นต่ำกับคะแนนต่ำสุดของผู้ผ่านคัดเลือกเป็นคนละเรื่อง.",
    keywords: ["2569", "ย้อนหลัง", "บริหาร", "จัดการศิลปะ", "TGAT2", "TPAT2", "Admission", "น้ำหนัก", "คะแนน"], authority: "official", confidence: "verified", verifiedAt,
  },
  {
    id: "admissions-2569-craft-historical", title: "ข้อมูลย้อนหลัง 2569: Admission หัตถอุตสาหกรรมสร้างสรรค์", kind: "admissions", academicYear: 2569, url: admission2569,
    text: "ย้อนหลังปี 2569 รอบ 3 หัตถอุตสาหกรรมสร้างสรรค์ลำปางมี 3 รูปแบบ ไม่กำหนด GPAXขั้นต่ำ: A-Level สังคม40% ไทย30% อังกฤษ30%; หรือ TPAT2 60% สังคม20% ไทย10% อังกฤษ10%; หรือเฉพาะ TPAT21 ทัศนศิลป์100%. นี่เป็นเกณฑ์ย้อนหลัง2569 ไม่ใช่2570.",
    keywords: ["2569", "ย้อนหลัง", "หัตถอุตสาหกรรม", "ลำปาง", "TPAT21", "TPAT2", "A-Level", "Admission", "น้ำหนัก", "คะแนน"], authority: "official", confidence: "verified", verifiedAt,
  },
  {
    id: "admissions-score-interpretation", title: "คะแนนควรเท่าไหร่: แยกขั้นต่ำ น้ำหนัก และสถิติย้อนหลัง", kind: "admissions", url: "https://www.mytcas.com/news/96/",
    text: "ทปอ.เผยแพร่ลิงก์สถิติคะแนน TCAS69 รอบ 3 ที่ https://assets.mytcas.com/69/TCAS69-R3-MinMax.pdf. ยังไม่ได้ยืนยันตัวเลขคะแนนต่ำสุดรายสาขาจากไฟล์นี้ในฐานความรู้ จึงห้ามสร้างตัวเลขคะแนนสอบติด. ถ้าถามควรได้เท่าไหร่ ให้ขอสาขา ปี รอบ และรูปแบบรับก่อน แยกคุณสมบัติขั้นต่ำออกจากคะแนนแข่งขัน และให้ตรวจสถิติของรหัสสาขารูปแบบเดียวกัน. สถิติย้อนหลังและเกณฑ์ขั้นต่ำไม่รับประกันการติดปีใหม่.",
    keywords: ["คะแนน", "คะแนนต่ำสุด", "คะแนนสูงสุด", "cutoff", "ควรได้", "เท่าไหร่", "สอบติด", "โอกาส", "สถิติ", "2569", "2570"], authority: "official", confidence: "verified", verifiedAt,
  },
  {
    id: "faculty-theatre", title: "เรียนอะไรในสาขาการละคอน", kind: "faculty", url: "https://fineart.tu.ac.th/index.php?Itemid=368&id=52&lang=th&option=com_content&view=article",
    text: "การละคอนเรียนการแสดง กำกับ เขียนบท ทฤษฎีและประวัติศาสตร์ละคอน รวมถึงการออกแบบฉาก แสง เสียง เครื่องแต่งกาย และการจัดการละคอน. ฝึกปฏิบัติและทำละคอนนิพนธ์. งานที่เกี่ยวข้อง เช่น นักแสดง ผู้กำกับ ผู้เขียนบท ผู้จัดการเวที และงานออกแบบเพื่อการแสดง. เป็นภาพรวมจากหน้าหลักสูตร ไม่ใช่การรับรองตำแหน่งงานหลังจบ.",
    keywords: ["การละคอน", "ละคร", "เรียนอะไร", "หลักสูตร", "อาชีพ", "จบ", "นักแสดง", "กำกับ", "ฉาก"], authority: "official", confidence: "verified", verifiedAt,
  },
  {
    id: "faculty-fashion", title: "เรียนอะไรในสาขาพัสตราภรณ์", kind: "faculty", url: "https://fineart.tu.ac.th/index.php?Itemid=369&id=53&lang=th&option=com_content&view=article",
    text: "ศิลปะการออกแบบพัสตราภรณ์ศึกษาสิ่งทอ เครื่องแต่งกาย การสร้างสรรค์งานออกแบบ และความรู้บริหาร/การตลาดในอุตสาหกรรมสิ่งทอและแฟชั่น. ตัวอย่างงานหลังจบ: นักออกแบบสิ่งทอและแฟชั่น นักพัฒนาผลิตภัณฑ์ ผู้ประกอบการ และ stylist. หลักสูตรปี2570อาจปรับปรุง ให้ตรวจฉบับที่จะเข้าเรียน.",
    keywords: ["พัสตราภรณ์", "แฟชั่น", "สิ่งทอ", "เรียนอะไร", "หลักสูตร", "อาชีพ", "จบ", "stylist"], authority: "official", confidence: "verified", verifiedAt,
  },
  {
    id: "faculty-craft", title: "เรียนอะไรในสาขาหัตถอุตสาหกรรมสร้างสรรค์", kind: "faculty", url: "https://fineart.tu.ac.th/index.php?Itemid=370&id=59&lang=th&option=com_content&view=article",
    text: "ออกแบบหัตถอุตสาหกรรมสร้างสรรค์เน้นออกแบบผลิตภัณฑ์จากภูมิปัญญาและวัฒนธรรมท้องถิ่นร่วมกับเทคโนโลยีสมัยใหม่. ตัวอย่างงานที่เกี่ยวข้อง: ออกแบบผลิตภัณฑ์ บรรจุภัณฑ์ เฟอร์นิเจอร์ เซรามิกส์ และพัฒนาผลิตภัณฑ์ชุมชน. เกณฑ์รับปี2570ระบุว่าเรียนที่ศูนย์ลำปาง.",
    keywords: ["หัตถอุตสาหกรรม", "หัตถกรรม", "สร้างสรรค์", "เรียนอะไร", "หลักสูตร", "อาชีพ", "จบ", "ผลิตภัณฑ์", "ลำปาง"], authority: "official", confidence: "verified", verifiedAt,
  },
  {
    id: "faculty-management", title: "การบริหารจัดการศิลปะ: ความสนใจและแฟ้มผลงาน", kind: "faculty", academicYear: 2570, url: portfolio2570,
    text: "การบริหารจัดการศิลปะโครงการพิเศษเกี่ยวข้องกับการจัดการงานทัศนศิลป์ การแสดง ดนตรี ออกแบบ และอีเวนต์. เกณฑ์Portfolio2570รองรับทั้งผู้มีทักษะศิลปะที่สนใจการจัดการและผู้สนใจศิลปะ/การจัดการแม้ไม่มีทักษะศิลปะ; อธิบายบทบาทและสิ่งที่เรียนรู้จากผลงานหรือกิจกรรมที่เลือก.",
    keywords: ["บริหาร", "จัดการศิลปะ", "เรียนอะไร", "หลักสูตร", "อีเวนต์", "ไม่มีทักษะ", "portfolio"], authority: "official", confidence: "verified", verifiedAt,
  },
  {
    id: "contact-admissions", title: "ติดต่อฝ่ายรับเข้าคณะศิลปกรรมศาสตร์", kind: "contact", url: "https://www.tuadmissions.in.th/faculty_contact",
    text: "ช่องทางรับเข้าปริญญาตรีคณะศิลปกรรมศาสตร์: โทร 02-696-6249 หรือ 097-247-9601; อีเมล fatuadmission@gmail.com. เว็บไซต์คณะ https://fineart.tu.ac.th/ และประกาศ/ระบบสมัครของมหาวิทยาลัย https://www.tuadmissions.in.th/admissions และ https://tcas.tuadmissions.in.th/. ใช้ถามเกณฑ์ที่ยังไม่ชัดเจน เอกสารและข้อยกเว้นรายบุคคล.",
    keywords: ["ติดต่อ", "โทร", "เบอร์", "อีเมล", "สมัคร", "เจ้าหน้าที่", "คณะ", "รับเข้า", "email"], authority: "official", confidence: "verified", verifiedAt,
  },
  {
    id: "contact-facebook-messenger", title: "Facebook และ Messenger ของคณะ", kind: "contact", url: "https://fineart.tu.ac.th/index.php?Itemid=434&id=193&lang=th&option=com_content&view=article",
    text: "เว็บไซต์คณะลิงก์เพจ Facebook คณะศิลปกรรมศาสตร์ มหาวิทยาลัยธรรมศาสตร์: https://www.facebook.com/FineArtsTU/. เปิดเพจและกดส่งข้อความเพื่อคุยกับเจ้าหน้าที่ผ่าน Messenger. ผู้ช่วยในงานตอบจากฐานข้อมูลและไม่อ่านบัญชี Facebook, ไม่ส่งข้อความแทนผู้ใช้ และไม่ยืนยันเวลาตอบของเจ้าหน้าที่.",
    keywords: ["Facebook", "เฟซบุ๊ก", "เพจ", "Messenger", "messager", "แชท", "ข้อความ", "ติดต่อ", "social"], authority: "official", confidence: "verified", verifiedAt,
  },
  {
    id: "contact-youtube", title: "YouTube ที่เว็บคณะลิงก์ไว้", kind: "contact", url: "https://fineart.tu.ac.th/index.php?Itemid=163&id=7%3Avideo-7&lang=th&option=com_yendifvideoshare&view=video",
    text: "หน้า Video ของเว็บคณะมีลิงก์ช่อง YouTube https://www.youtube.com/@fineartstu8432. ใช้เปิดดูวิดีโอของคณะหรือเริ่มสำรวจสาขา. ฐานความรู้นี้ไม่ได้ถอดเสียงทุกวิดีโอหรืออัปเดตทุกโพสต์ จึงห้ามอ้างเนื้อหาคลิปที่ยังไม่ได้อ่าน.",
    keywords: ["YouTube", "ยูทูบ", "วิดีโอ", "วีดีโอ", "คลิป", "ช่อง", "ดู", "แนะนำสาขา"], authority: "official", confidence: "verified", verifiedAt,
  },
];
