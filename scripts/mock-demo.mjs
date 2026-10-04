import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const seedDir = path.join(root, "firebase", "seed", "mock");
const venueMediaDir = path.join(root, "public", "media", "mock", "venues");
const prizeMediaDir = path.join(root, "public", "media", "mock", "prizes");
const project = "fatu-oph-2026";
const eventDate = "2026-11-15";

const venues = {
  "theater": {
    name: "โรงละคอน",
    visualIdentityKey: "azure-dragon",
    visualLabel: "Azure Dragon",
    description: "พื้นที่เวทีหลักสำหรับการแสดง Showcase และกิจกรรมรวมของ Open House",
    directions: "จากจุดลงทะเบียน เดินตามป้ายโรงละคอนประมาณ 3-5 นาที",
    landmarkNotes: "มองหาป้ายโรงละคอนและธงสีฟ้าของจุดมังกรฟ้า",
    mapUrl: "https://maps.app.goo.gl/rUZJNLSjKU1fE7iE7",
    latitude: null,
    longitude: null,
    coverMediaId: "mock-venue-theater",
    displayOrder: 1,
    isPublished: true,
  },
  "faculty-building": {
    name: "ตึกคณะศิลปกรรมศาสตร์",
    visualIdentityKey: "white-tiger",
    visualLabel: "White Tiger",
    description: "ศูนย์ข้อมูลหลัก พบอาจารย์ รุ่นพี่ นิทรรศการหลักสูตร และผลงานนักศึกษา",
    directions: "จากจุดลงทะเบียน เดินเข้าพื้นที่คณะตามป้ายสีขาว ใช้เวลาประมาณ 2-4 นาที",
    landmarkNotes: "จุดพยัคฆ์ขาวอยู่บริเวณอาคารคณะและโต๊ะประชาสัมพันธ์",
    mapUrl: "https://maps.app.goo.gl/XiaLXPfzJABEcMa99",
    latitude: null,
    longitude: null,
    coverMediaId: "mock-venue-faculty-building",
    displayOrder: 2,
    isPublished: true,
  },
  "weaving-building": {
    name: "โรงทอ",
    visualIdentityKey: "nine-tailed-fox",
    visualLabel: "Nine-Tailed Fox",
    description: "พื้นที่ Workshop งานสิ่งทอ วัสดุ และงานสร้างสรรค์แบบลงมือทำ",
    directions: "เดินต่อจากตึกคณะศิลปกรรมศาสตร์ตามป้ายจิ้งจอกเก้าหางประมาณ 4-6 นาที",
    landmarkNotes: "สังเกตพื้นที่ Workshop และป้ายสีเขียวบริเวณโรงทอ",
    mapUrl: "https://maps.app.goo.gl/AQ8zYg4cs9VbhAZdA",
    latitude: null,
    longitude: null,
    coverMediaId: "mock-venue-weaving-building",
    displayOrder: 3,
    isPublished: true,
  },
  "sc3": {
    name: "ตึก SC3",
    visualIdentityKey: "red-phoenix",
    visualLabel: "Red Phoenix",
    description: "พื้นที่เรียนรวมสำหรับ Demo, Talk และกิจกรรมทดลองคลาส",
    directions: "จากตึกคณะศิลปกรรมศาสตร์เดินตามทางเชื่อมไป SC3 ประมาณ 6-8 นาที",
    landmarkNotes: "มองหาป้าย SC3 และธงสีแดงของจุดหงส์แดง",
    mapUrl: "https://maps.app.goo.gl/on7t5SseFTmAvudd9",
    latitude: null,
    longitude: null,
    coverMediaId: "mock-venue-sc3",
    displayOrder: 4,
    isPublished: true,
  },
};

const activitySeed = [
  ["mock-opening-show", "Opening Showcase", "theater", "09:00", "10:00", 20, "qr", "ชมการแสดงเปิดงานและภาพรวมของคณะ"],
  ["mock-stage-behind-scenes", "Behind the Stage", "theater", "10:30", "11:15", 15, "staff", "พาชมเบื้องหลังพื้นที่เวทีและการเตรียมการแสดง"],
  ["mock-portfolio-talk", "Portfolio Talk", "faculty-building", "09:30", "10:30", 20, "qr", "คุยกับรุ่นพี่เรื่อง Portfolio และการเตรียมตัวสมัคร"],
  ["mock-major-discovery", "Major Discovery", "faculty-building", "11:00", "12:00", 15, "qr", "สำรวจหลักสูตรและค้นหาสาขาที่เหมาะกับตัวเอง"],
  ["mock-student-gallery", "Student Gallery Walk", "faculty-building", "13:00", "14:00", 10, "qr", "ชมผลงานนักศึกษาและนิทรรศการตัวอย่าง"],
  ["mock-textile-lab", "Textile Mini Lab", "weaving-building", "09:45", "10:45", 25, "staff", "ทดลองวัสดุและเทคนิคสิ่งทอแบบสั้น"],
  ["mock-pattern-workshop", "Pattern Workshop", "weaving-building", "11:15", "12:15", 30, "staff", "Workshop สร้างลายและทดลองออกแบบชิ้นงาน"],
  ["mock-material-hunt", "Material Hunt", "weaving-building", "14:00", "14:45", 15, "qr", "ภารกิจสำรวจวัสดุและสะสมแต้ม"],
  ["mock-class-demo", "ทดลองคลาสจริง", "sc3", "10:00", "11:00", 20, "qr", "ทดลองบรรยากาศการเรียนแบบย่อ"],
  ["mock-creative-tech", "Creative Tech Demo", "sc3", "11:30", "12:30", 25, "qr", "ดูตัวอย่างงานสร้างสรรค์ที่ผสมเทคโนโลยี"],
  ["mock-student-life-talk", "Student Life Talk", "sc3", "13:30", "14:15", 10, "staff", "ถามตอบเรื่องชีวิตมหาวิทยาลัยกับรุ่นพี่"],
  ["mock-final-quest", "Final Quest", "theater", "15:00", "16:00", 30, "qr", "ภารกิจท้ายงานสำหรับคนที่เก็บแต้มหลายจุด"],
];

const activities = Object.fromEntries(activitySeed.map(([id, title, venueId, start, end, points, completionMethod, shortDescription], index) => [
  id,
  {
    slug: id.replace(/^mock-/, ""),
    title,
    shortDescription,
    description: `${shortDescription} ข้อมูลนี้เป็น Mock สำหรับตรวจภาพรวม UX และระบบคะแนนก่อนใส่เนื้อหาจริง`,
    venueId,
    coverMediaId: `mock-venue-${venueId}`,
    startAt: `${eventDate}T${start}:00+07:00`,
    endAt: `${eventDate}T${end}:00+07:00`,
    registrationMode: index % 4 === 1 ? "on-site" : "none",
    registrationUrl: "",
    ctaLabel: "",
    price: null,
    priceLabel: "ฟรี",
    isFree: true,
    capacity: [120, 30, 80, 60, 100, 24, 24, 50, 60, 80, 70, 150][index],
    availabilityStatus: index === 6 ? "full" : "open",
    tags: [venues[venueId].name, "Mock Demo"],
    displayOrder: index + 1,
    isPublished: true,
    isArchived: false,
    pointsEnabled: true,
    pointsAwarded: points > 0 ? 100 : 0,
    pointGrantMode: "once",
    repeatLimit: null,
    completionMethod,
    requiresStaffVerification: completionMethod === "staff",
    createdAt: "2026-09-30T12:00:00.000Z",
    updatedAt: "2026-09-30T12:00:00.000Z",
  },
]));

const prizes = {
  "mock-hand-fan": {
    name: "พัดมือลายมังกร",
    description: "พัดมือลายมังกร ของที่ระลึกสำหรับผู้เข้าร่วมงาน",
    imageMediaId: "mock-prize-hand-fan",
    stock: 80,
    pointsRequired: 35,
    claimLimit: 1,
    displayOrder: 1,
    isPublished: true,
  },
  "mock-red-envelope": {
    name: "ซองแดงส่วนลดอาหาร",
    description: "คูปองส่วนลดอาหารภายในงานสำหรับผู้สะสมแต้ม",
    imageMediaId: "mock-prize-red-envelope",
    stock: 120,
    pointsRequired: 45,
    claimLimit: 1,
    displayOrder: 2,
    isPublished: true,
  },
  "mock-tassel": {
    name: "พู่ห้อยโทรศัพท์",
    description: "ของที่ระลึกงานฝีมือธีม Open House",
    imageMediaId: "mock-prize-tassel",
    stock: 50,
    pointsRequired: 60,
    claimLimit: 1,
    displayOrder: 3,
    isPublished: true,
  },
  "mock-hairpin": {
    name: "ปิ่นปักผม",
    description: "ปิ่นปักผมธีมจีน ของที่ระลึกงาน Open House",
    imageMediaId: "mock-prize-hairpin",
    stock: 40,
    pointsRequired: 75,
    claimLimit: 1,
    displayOrder: 4,
    isPublished: true,
  },
  "mock-small-doll": {
    name: "ตุ๊กตาเล็ก",
    description: "ตุ๊กตาเล็ก ของรางวัลสำหรับผู้ร่วมสนุก",
    imageMediaId: "mock-prize-small-doll",
    stock: 20,
    pointsRequired: 110,
    claimLimit: 1,
    displayOrder: 5,
    isPublished: true,
  },
  "mock-giant-doll": {
    name: "ตุ๊กตายักษ์",
    description: "ตุ๊กตายักษ์ รางวัลใหญ่ในหีบสมบัติ",
    imageMediaId: "mock-prize-giant-doll",
    stock: 5,
    pointsRequired: 170,
    claimLimit: 1,
    displayOrder: 6,
    isPublished: true,
  },
};

const faq = {
  "mock-faq-01": { question: "ต้องลงทะเบียนก่อนเข้าร่วมงานไหม?", answer: "แนะนำให้สร้างบัตร Open House ผ่านหน้า Pass เพื่อใช้สะสมแต้มและดูประวัติกิจกรรม", displayOrder: 1, isPublished: true },
  "mock-faq-02": { question: "สะสมแต้มอย่างไร?", answer: "ร่วมกิจกรรมที่เปิดให้คะแนน แล้วสแกน QR หรือให้เจ้าหน้าที่บันทึกตามกติกาของแต่ละกิจกรรม", displayOrder: 2, isPublished: true },
  "mock-faq-03": { question: "แต้มใช้แลกอะไรได้บ้าง?", answer: "สะสมครบ 200 แต้ม สุ่มได้ 1 ครั้งต่อคน โดยไม่หักคะแนน แสดง Voucher ให้ Staff ตรวจและจ่ายของรางวัล", displayOrder: 3, isPublished: true },
  "mock-faq-04": { question: "ถ้า QR Pass หายทำอย่างไร?", answer: "เข้าสู่ระบบด้วยบัญชีเดิมเพื่อเปิดใบเบิกทาง หากลืมรหัสผ่านให้ใช้หน้ากู้คืนบัญชีหรือติดต่อทีมงาน", displayOrder: 4, isPublished: true },
  "mock-faq-05": { question: "แต่ละกิจกรรมต้องลงทะเบียนแยกไหม?", answer: "บางกิจกรรมเข้าร่วมได้เลย บางกิจกรรมรับจำนวนจำกัด ให้ดูสถานะในหน้ารายละเอียดกิจกรรม", displayOrder: 5, isPublished: true },
  "mock-faq-06": { question: "สามารถมาเฉพาะบางสถานที่ได้ไหม?", answer: "ได้ สามารถเลือกสำรวจตามความสนใจ แต่การเดินครบหลายจุดจะช่วยให้เห็นภาพรวมของคณะมากขึ้น", displayOrder: 6, isPublished: true },
  "mock-faq-07": { question: "ของรางวัลหมดแล้วทำอย่างไร?", answer: "ระบบสุ่มเฉพาะรางวัลที่ยังมีของ หากหมดทั้งคลัง คะแนนและสิทธิ์ยังอยู่ ให้ติดต่อ Staff โดยไม่สแกนรับของซ้ำ", displayOrder: 7, isPublished: true },
  "mock-faq-08": { question: "ข้อมูลชุดนี้เป็นข้อมูลจริงหรือไม่?", answer: "ตอนนี้เป็น Mock Data สำหรับตรวจระบบและภาพรวม UX ก่อนนำข้อมูลกิจกรรมจริงมาแทน", displayOrder: 8, isPublished: true },
};

const announcements = {
  "mock-announcement-data": {
    title: "DEMO MODE · ข้อมูลจำลอง",
    body: "กิจกรรม ผู้เข้าร่วม คะแนน และของรางวัลในระบบตอนนี้เป็น Mock Data สำหรับตรวจภาพรวมก่อนใส่ข้อมูลจริง",
    level: "important",
    isPublished: true,
    displayOrder: 1,
  },
  "mock-announcement-checkin": {
    title: "ทดลอง Flow สะสมแต้มได้แล้ว",
    body: "สร้าง Pass แล้วทดลองเปิดหน้ากิจกรรมและหน้า Check-in เพื่อดูเส้นทางใช้งานจริง",
    level: "info",
    isPublished: true,
    displayOrder: 2,
  },
  "mock-announcement-prize": {
    title: "ของรางวัลตัวอย่างเปิดครบ 6 แบบ",
    body: "ตั้งแต่พัดมือจนถึงตุ๊กตายักษ์ เพื่อใช้ตรวจ UI, stock และ redemption flow",
    level: "info",
    isPublished: true,
    displayOrder: 3,
  },
};

const media = {};
for (const id of Object.keys(venues)) {
  media[`mock-venue-${id}`] = {
    provider: "vercel-static",
    url: `/media/mock/venues/${id}.svg`,
    pathname: `media/mock/venues/${id}.svg`,
    contentType: "image/svg+xml",
    sizeBytes: 0,
    altText: `ภาพ Mock ของ${venues[id].name}`,
    kind: "image",
    venueId: id,
    activityId: "",
    uploadedBy: "mock-seed",
    createdAt: "2026-09-30T12:00:00.000Z",
    displayOrder: venues[id].displayOrder,
    isPublished: true,
  };
}
for (const [id, prize] of Object.entries(prizes)) {
  const shortId = id.replace("mock-", "");
  media[`mock-prize-${shortId}`] = {
    provider: "vercel-static",
    url: `/media/mock/prizes/${shortId}.svg`,
    pathname: `media/mock/prizes/${shortId}.svg`,
    contentType: "image/svg+xml",
    sizeBytes: 0,
    altText: `ภาพ Mock ของรางวัล ${prize.name}`,
    kind: "image",
    venueId: "",
    activityId: "",
    uploadedBy: "mock-seed",
    createdAt: "2026-09-30T12:00:00.000Z",
    displayOrder: prize.displayOrder,
    isPublished: true,
  };
}

const people = [
  ["ณภัทร ก.", "โรงเรียนมัธยมตัวอย่าง 1"],
  ["พิมพ์ชนก ส.", "โรงเรียนสาธิตตัวอย่าง"],
  ["ธนกฤต ว.", "โรงเรียนมัธยมตัวอย่าง 2"],
  ["ณัฐชา พ.", "โรงเรียนศิลป์ตัวอย่าง"],
  ["ปุณณวิช ร.", "โรงเรียนวิทย์ตัวอย่าง"],
  ["ชญานิน บ.", "โรงเรียนมัธยมตัวอย่าง 3"],
  ["ภูริณัฐ ค.", "โรงเรียนสาธิตตัวอย่าง"],
  ["กมลชนก ท.", "โรงเรียนมัธยมตัวอย่าง 4"],
  ["ศุภกร น.", "โรงเรียนมัธยมตัวอย่าง 1"],
  ["อริสา จ.", "โรงเรียนศิลป์ตัวอย่าง"],
  ["ภัทรพล ม.", "โรงเรียนมัธยมตัวอย่าง 5"],
  ["ปาริฉัตร ด.", "โรงเรียนสาธิตตัวอย่าง"],
  ["กฤติน พ.", "โรงเรียนวิทย์ตัวอย่าง"],
  ["นภัสสร ร.", "โรงเรียนมัธยมตัวอย่าง 2"],
  ["วริศ ล.", "โรงเรียนมัธยมตัวอย่าง 6"],
  ["ชนากานต์ ส.", "โรงเรียนศิลป์ตัวอย่าง"],
  ["ธีรภัทร ก.", "โรงเรียนมัธยมตัวอย่าง 4"],
  ["ณิชารีย์ ว.", "โรงเรียนสาธิตตัวอย่าง"],
  ["ศรัณย์ภัทร ต.", "โรงเรียนมัธยมตัวอย่าง 5"],
  ["พิชญ์สินี อ.", "โรงเรียนวิทย์ตัวอย่าง"],
];

const activityIds = Object.keys(activities);
const completionCounts = [0,1,1,2,2,2,3,3,3,4,4,4,5,5,5,6,6,7,7,8];
const participants = {};
const accounting = {};
const passIndex = {};
const eventCheckins = {};
const activityCompletions = {};
const checkins = {};
const prizeClaims = {};
const audit = {};
const prizeClaimedCounts = Object.fromEntries(Object.keys(prizes).map((id) => [id, 0]));
const demoPassTokens = {};

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const isoAt = (dayOffset, hour, minute = 0) => {
  const d = new Date("2026-09-30T02:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + dayOffset);
  d.setUTCHours(hour - 7, minute, 0, 0);
  return d.toISOString();
};

for (let index = 0; index < people.length; index++) {
  const n = String(index + 1).padStart(2, "0");
  const participantId = `mock-p${n}`;
  const passToken = `FATU-MOCK-PASS-2026-${n}-DEMO-ONLY`;
  const passHash = sha256(passToken);
  const createdAt = isoAt(-Math.min(5, Math.floor(index / 4)), 9 + (index % 6), (index * 7) % 60);
  const [displayName, school] = people[index];

  participants[participantId] = {
    id: participantId,
    displayName,
    school,
    phone: `09X-000-${String(1000 + index).slice(-4)}`,
    email: `mock.participant${n}@example.com`,
    createdAt,
    status: "active",
  };
  passIndex[passHash] = { participantId, createdAt };
  demoPassTokens[participantId] = passToken;

  if (index >= 5) {
    eventCheckins[participantId] = {
      participantId,
      staffId: "mock-staff-01",
      createdAt: isoAt(0, 8, 40 + (index % 15)),
    };
  }

  const transactions = {};
  const claims = {};
  const grantCounts = {};
  let pointTotal = 0;
  const completed = activityIds.slice(0, completionCounts[index]);

  completed.forEach((activityId, activityIndex) => {
    const activity = activities[activityId];
    const txId = `mock-tx-${n}-${String(activityIndex + 1).padStart(2, "0")}`;
    const points = Number(activity.pointsAwarded);
    const source = activityIndex % 2 === 0 ? "activity-qr" : "staff-completion";
    const createdAtTx = isoAt(0, 9 + Math.floor(activityIndex / 2), (index * 3 + activityIndex * 11) % 60);
    const grantKey = sha256(activityId).slice(0, 32);
    transactions[txId] = {
      points,
      reason: `เข้าร่วมกิจกรรม ${activity.title}`,
      activityId,
      grantKey,
      source,
      ...(source === "staff-completion" ? { staffId: "mock-staff-01" } : {}),
      createdAt: createdAtTx,
    };
    grantCounts[grantKey] = 1;
    pointTotal += points;

    const log = {
      participantId,
      activityId,
      pointsAdded: points,
      createdAt: createdAtTx,
    };
    if (source === "activity-qr") {
      checkins[`mock-checkin-${n}-${activityIndex + 1}`] = { ...log, method: "qr" };
    } else {
      activityCompletions[`mock-completion-${n}-${activityIndex + 1}`] = { ...log, staffId: "mock-staff-01" };
    }
  });

  if ([9, 13, 16].includes(index)) {
    const txId = `mock-adjust-${n}`;
    const adjustment = index === 13 ? -5 : 10;
    transactions[txId] = {
      points: adjustment,
      reason: index === 13 ? "แก้ไขคะแนนตัวอย่าง" : "โบนัสกิจกรรมพิเศษ",
      source: "staff-adjustment",
      staffId: "mock-staff-01",
      createdAt: isoAt(0, 14, 10 + index),
    };
    pointTotal += adjustment;
  }

  const claimPlan = {
    15: "mock-hand-fan",
    16: "mock-red-envelope",
    17: "mock-tassel",
    18: "mock-hairpin",
    19: "mock-small-doll",
  };
  const prizeId = claimPlan[index];
  if (prizeId) {
    const prize = prizes[prizeId];
    const cost = prize.pointsRequired;
    if (pointTotal >= cost) {
      const claimId = `mock-claim-${n}`;
      const createdAtClaim = isoAt(0, 15, 5 + index);
      transactions[`mock-redeem-${n}`] = {
        points: -cost,
        reason: `แลกรางวัล ${prize.name}`,
        source: "prize-redemption",
        prizeId,
        staffId: "mock-staff-01",
        createdAt: createdAtClaim,
      };
      claims[claimId] = {
        prizeId,
        pointsSpent: cost,
        status: "completed",
        staffId: "mock-staff-01",
        createdAt: createdAtClaim,
      };
      prizeClaims[claimId] = {
        participantId,
        prizeId,
        prizeName: prize.name,
        pointsSpent: cost,
        staffId: "mock-staff-01",
        createdAt: createdAtClaim,
      };
      prizeClaimedCounts[prizeId] += 1;
      pointTotal -= cost;
    }
  }

  accounting[participantId] = {
    pointTotal,
    grantCounts,
    transactions,
    claims,
  };
}

const prizeRuntime = Object.fromEntries(Object.entries(prizes).map(([id, prize]) => {
  const claimedCount = prizeClaimedCounts[id] || 0;
  return [id, {
    configuredStock: prize.stock,
    claimedCount,
    stockRemaining: Math.max(0, prize.stock - claimedCount),
    updatedAt: "2026-09-30T15:00:00.000Z",
  }];
}));

for (let i = 1; i <= 15; i++) {
  const n = String(i).padStart(2, "0");
  audit[`mock-audit-${n}`] = {
    type: i % 5 === 0 ? "prize-redemption" : i % 3 === 0 ? "activity-completion" : "event-checkin",
    participantId: `mock-p${String(Math.min(20, i + 5)).padStart(2, "0")}`,
    ...(i % 5 === 0 ? { prizeId: "mock-hand-fan", pointsSpent: 35 } : {}),
    ...(i % 3 === 0 ? { activityId: activityIds[i % activityIds.length], pointsAdded: activities[activityIds[i % activityIds.length]].pointsAwarded } : {}),
    staffId: "mock-staff-01",
    createdAt: isoAt(0, 9 + Math.floor(i / 2), (i * 7) % 60),
  };
}

const activityQr = Object.fromEntries(activityIds.map((id, index) => [
  id,
  {
    token: `mock-qr-token-${String(index + 1).padStart(2, "0")}-2026`,
    updatedAt: "2026-09-30T12:00:00.000Z",
    updatedBy: "mock-seed",
  },
]));

const publicSeed = {
  site: {
    name: "FATU Open House 2026",
    eventYear: 2026,
    theme: "ตะลุยแดนมังกร",
    faculty: "Faculty of Fine and Applied Arts, Thammasat University",
    description: "Mock Environment สำหรับตรวจภาพรวมเว็บลงทะเบียน กิจกรรม ตาราง สะสมแต้ม และของรางวัลก่อนใส่ข้อมูลจริง",
    dateLabel: "DEMO DATA · วันงานจำลอง 15 พ.ย. 2026",
    locationLabel: "มหาวิทยาลัยธรรมศาสตร์ ศูนย์รังสิต",
    registrationOpen: true,
  },
  venues,
  activities,
  prizes,
  faq,
  announcements,
  media,
  settings: {
    schemaVersion: 1,
    media: {
      fixedProvider: "vercel-static",
      dynamicProvider: "vercel-blob",
    },
  },
};

const operationsSeed = {
  participants,
  passIndex,
  accounting: { participants: accounting },
  eventCheckins,
  activityCompletions,
  checkins,
  prizeClaims,
  prizeRuntime,
  audit,
};

function ensureDirectories() {
  for (const dir of [seedDir, venueMediaDir, prizeMediaDir]) fs.mkdirSync(dir, { recursive: true });
}

function writeJson(name, data) {
  fs.writeFileSync(path.join(seedDir, name), JSON.stringify(data, null, 2) + "\n");
}

function venueSvg(id, title, identity, start, end, accent) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" role="img" aria-label="${title} mock visual">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${start}"/><stop offset="1" stop-color="${end}"/></linearGradient>
    <radialGradient id="r"><stop stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#g)"/>
  <circle cx="970" cy="120" r="260" fill="url(#r)"/>
  <path d="M80 520h1040v70H80z" fill="#15130f" opacity=".32"/>
  <path d="M190 500V290h820v210M250 290l110-100h480l110 100M310 500V340h120v160M480 500V340h240v160M770 500V340h120v160" fill="none" stroke="#fff8e7" stroke-width="22" opacity=".75"/>
  <path d="M120 120c170 20 210 140 345 90 80-30 110-130 230-120 110 10 150 100 285 75" fill="none" stroke="${accent}" stroke-width="12" stroke-linecap="round" opacity=".8"/>
  <text x="80" y="95" fill="#fff8e7" font-family="Arial,sans-serif" font-size="30" font-weight="700" letter-spacing="5">FATU OPEN HOUSE 2026 · MOCK VISUAL</text>
  <text x="80" y="610" fill="#fff8e7" font-family="Arial,sans-serif" font-size="62" font-weight="700">${title}</text>
  <text x="1120" y="610" text-anchor="end" fill="#fff8e7" font-family="Arial,sans-serif" font-size="28" opacity=".85">${identity}</text>
</svg>`;
}

function prizeSvg(title, glyph, start, end) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="${title} mock visual">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${start}"/><stop offset="1" stop-color="${end}"/></linearGradient></defs>
  <rect width="800" height="600" rx="48" fill="url(#g)"/>
  <circle cx="400" cy="270" r="155" fill="#fff8e7" opacity=".16"/>
  <text x="400" y="330" text-anchor="middle" font-family="Arial,sans-serif" font-size="170" fill="#fff8e7">${glyph}</text>
  <text x="400" y="500" text-anchor="middle" font-family="Arial,sans-serif" font-size="42" font-weight="700" fill="#fff8e7">${title}</text>
  <text x="400" y="555" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" letter-spacing="4" fill="#fff8e7" opacity=".72">MOCK REWARD VISUAL</text>
</svg>`;
}

function generate() {
  ensureDirectories();
  writeJson("public.json", publicSeed);
  writeJson("operations.json", operationsSeed);
  writeJson("site.json", publicSeed.site);
  writeJson("venues.json", venues);
  writeJson("activities.json", activities);
  writeJson("prizes.json", prizes);
  writeJson("faq.json", faq);
  writeJson("announcements.json", announcements);
  writeJson("media.json", media);
  writeJson("settings.json", publicSeed.settings);
  writeJson("participants.json", participants);
  writeJson("pass-index.json", passIndex);
  writeJson("accounting-participants.json", accounting);
  writeJson("event-checkins.json", eventCheckins);
  writeJson("activity-completions.json", activityCompletions);
  writeJson("checkins.json", checkins);
  writeJson("prize-claims.json", prizeClaims);
  writeJson("prize-runtime.json", prizeRuntime);
  writeJson("audit.json", audit);
  writeJson("activity-qr.json", activityQr);
  writeJson("demo-pass-tokens.json", demoPassTokens);

  const venuePalette = {
    "theater": ["#164e63", "#0f766e", "#f0d49a"],
    "faculty-building": ["#4b5563", "#a8a29e", "#f5e6c8"],
    "weaving-building": ["#14532d", "#7c6f3e", "#f0d49a"],
    "sc3": ["#7f1d1d", "#c2410c", "#f6c56b"],
  };
  for (const [id, venue] of Object.entries(venues)) {
    const [start, end, accent] = venuePalette[id];
    fs.writeFileSync(path.join(venueMediaDir, `${id}.svg`), venueSvg(id, venue.name, venue.visualLabel, start, end, accent));
  }

  const prizeVisuals = {
    "hand-fan": ["พัดมือ", "◒", "#7f1d1d", "#b45309"],
    "red-envelope": ["ซองแดง", "囍", "#991b1b", "#dc2626"],
    "tassel": ["พู่ห้อย", "◆", "#14532d", "#7c6f3e"],
    "hairpin": ["ปิ่นปักผม", "✦", "#4c1d95", "#9d174d"],
    "small-doll": ["ตุ๊กตาเล็ก", "福", "#164e63", "#0f766e"],
    "giant-doll": ["ตุ๊กตายักษ์", "龍", "#7f1d1d", "#1f2937"],
  };
  for (const [id, [title, glyph, start, end]] of Object.entries(prizeVisuals)) {
    fs.writeFileSync(path.join(prizeMediaDir, `${id}.svg`), prizeSvg(title, glyph, start, end));
  }

  console.log("Generated FATU mock demo seed: 20 participants, 12 activities, 6 prizes, 4 venues.");
  console.log("Demo pass token for mock-p20:", demoPassTokens["mock-p20"]);
}

function firebaseCommand(args) {
  const result = process.platform === "win32"
    ? spawnSync(
        "cmd.exe",
        ["/d", "/s", "/c", ["npx", "-y", "firebase-tools@15.32.0", ...args].join(" ")],
        { cwd: root, stdio: "inherit" },
      )
    : spawnSync(
        "npx",
        ["-y", "firebase-tools@15.32.0", ...args],
        { cwd: root, stdio: "inherit" },
      );

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function firebaseUpdate(dbPath, file) {
  firebaseCommand(["database:update", dbPath, file, "--force", "--project", project]);
}

function firebaseSet(dbPath, data) {
  const tempFile = path.join(seedDir, "set-value.tmp.json");
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2) + "\\n");
  firebaseCommand(["database:set", dbPath, tempFile, "--force", "--project", project]);
  fs.rmSync(tempFile, { force: true });
}

function seed() {
  generate();

  const updates = [
    ["/public/site", "site.json"],
    ["/public/venues", "venues.json"],
    ["/public/activities", "activities.json"],
    ["/public/prizes", "prizes.json"],
    ["/public/faq", "faq.json"],
    ["/public/announcements", "announcements.json"],
    ["/public/media", "media.json"],
    ["/public/settings", "settings.json"],
    ["/operations/participants", "participants.json"],
    ["/operations/passIndex", "pass-index.json"],
    ["/operations/accounting/participants", "accounting-participants.json"],
    ["/operations/eventCheckins", "event-checkins.json"],
    ["/operations/activityCompletions", "activity-completions.json"],
    ["/operations/checkins", "checkins.json"],
    ["/operations/prizeClaims", "prize-claims.json"],
    ["/operations/prizeRuntime", "prize-runtime.json"],
    ["/operations/audit", "audit.json"],
    ["/admin/activityQr", "activity-qr.json"],
  ];

  for (const [dbPath, file] of updates) firebaseUpdate(dbPath, path.join(seedDir, file));
  console.log("Mock demo data merged into Firebase production without replacing non-mock IDs.");
}

function nullMap(keys) {
  return Object.fromEntries(keys.map((key) => [key, null]));
}

function clear() {
  generate();
  const publicCollections = {
    activities: nullMap(Object.keys(activities)),
    prizes: nullMap(Object.keys(prizes)),
    faq: nullMap(Object.keys(faq)),
    announcements: nullMap(Object.keys(announcements)),
    media: nullMap(Object.keys(media)),
  };
  for (const [collection, data] of Object.entries(publicCollections)) {
    const file = path.join(seedDir, `clear-${collection}.json`);
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
    firebaseUpdate(`/public/${collection}`, file);
  }
  firebaseSet("/public/site", {
    name: "FATU Open House 2026",
    eventYear: 2026,
    theme: "ตะลุยแดนมังกร",
    faculty: "Faculty of Fine and Applied Arts, Thammasat University",
    description: "",
    dateLabel: "",
    locationLabel: "",
    registrationOpen: true,
  });
  for (const [id, venue] of Object.entries(venues)) {
    firebaseSet(`/public/venues/${id}`, {
      name: venue.name,
      visualIdentityKey: venue.visualIdentityKey,
      visualLabel: venue.visualLabel,
      description: "",
      directions: "",
      landmarkNotes: "",
      mapUrl: "",
      latitude: null,
      longitude: null,
      coverMediaId: "",
      displayOrder: venue.displayOrder,
      isPublished: true,
    });
  }

  const operationsCollections = {
    participants: nullMap(Object.keys(participants)),
    passIndex: nullMap(Object.keys(passIndex)),
    "accounting/participants": nullMap(Object.keys(accounting)),
    eventCheckins: nullMap(Object.keys(eventCheckins)),
    activityCompletions: nullMap(Object.keys(activityCompletions)),
    checkins: nullMap(Object.keys(checkins)),
    prizeClaims: nullMap(Object.keys(prizeClaims)),
    prizeRuntime: nullMap(Object.keys(prizeRuntime)),
    audit: nullMap(Object.keys(audit)),
  };
  for (const [collection, data] of Object.entries(operationsCollections)) {
    const safe = collection.replaceAll("/", "-");
    const file = path.join(seedDir, `clear-${safe}.json`);
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
    firebaseUpdate(`/operations/${collection}`, file);
  }
  const clearQr = nullMap(Object.keys(activityQr));
  const qrFile = path.join(seedDir, "clear-activity-qr.json");
  fs.writeFileSync(qrFile, JSON.stringify(clearQr, null, 2) + "\n");
  firebaseUpdate("/admin/activityQr", qrFile);

  console.log("Mock demo data removed. Core venue records restored to baseline.");
}

const command = process.argv[2] || "generate";
if (command === "generate") generate();
else if (command === "seed") seed();
else if (command === "clear") clear();
else {
  console.error("Usage: node scripts/mock-demo.mjs [generate|seed|clear]");
  process.exit(1);
}
