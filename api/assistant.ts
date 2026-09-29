import { z } from "zod";
import {
  adminDb,
  enforceRateLimit,
  json,
  publicError,
  readJson,
  resolveParticipant,
} from "./_lib/server.js";

const schema = z.object({
  question: z.string().trim().min(1).max(500),
  passToken: z.string().min(20).optional(),
});

async function publicData(path: string) {
  const snapshot = await adminDb.ref(`public/${path}`).get();
  return snapshot.val() || {};
}

function score(text: string, terms: string[], exactLabels: string[], question: string) {
  const haystack = text.toLocaleLowerCase("th");
  let total = terms.reduce(
    (sum, term) => sum + (term.length > 1 && haystack.includes(term) ? 1 : 0),
    0,
  );
  for (const label of exactLabels) {
    if (label && question.includes(label.toLocaleLowerCase("th"))) total += 5;
  }
  return total;
}

type PublicActivity = {
  id: string;
  title?: unknown;
  shortDescription?: unknown;
  description?: unknown;
  venueId?: unknown;
  availabilityStatus?: unknown;
  isPublished?: unknown;
  isArchived?: unknown;
};

function publishedActivities(raw: Record<string, unknown>): PublicActivity[] {
  return Object.entries(raw)
    .map(([id, value]) => ({ id, ...(value as Omit<PublicActivity, "id">) }))
    .filter((item) => item.isPublished === true && item.isArchived !== true);
}

export default async function handler(request: Request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    await enforceRateLimit(request, "assistant", 30);
    const { question, passToken } = schema.parse(await readJson(request));
    const query = question.toLocaleLowerCase("th");
    const terms = query.split(/\s+/).filter((term) => term.length > 1);
    const [venues, activitiesRaw, faq, prizes] = await Promise.all([
      publicData("venues"),
      publicData("activities"),
      publicData("faq"),
      publicData("prizes"),
    ]);
    const activities = publishedActivities(activitiesRaw);

    if (passToken && /(แต้ม|คะแนน)/.test(query)) {
      const resolved = await resolveParticipant(passToken);
      if (resolved) {
        const account = (
          await adminDb
            .ref(`operations/accounting/participants/${resolved.participantId}`)
            .get()
        ).val();
        return json({
          answer: `ตอนนี้คุณมี ${Number(account?.pointTotal || 0)} คะแนน`,
          links: [
            { label: "ดูบัตรและประวัติคะแนน", href: "/pass" },
            { label: "ดูของรางวัล", href: "/prizes" },
          ],
        });
      }
    }

    const venueMatch = Object.entries(venues).find(([, value]) => {
      const item = value as Record<string, unknown>;
      return item.isPublished && query.includes(String(item.name || "").toLocaleLowerCase("th"));
    });

    if (venueMatch) {
      const [venueId, rawVenue] = venueMatch;
      const venue = rawVenue as Record<string, unknown>;

      if (query.includes("กิจกรรม")) {
        const venueActivities = activities.filter(
          (activity) => activity.venueId === venueId,
        );
        return json({
          answer: venueActivities.length
            ? `${venue.name} มีกิจกรรมที่เผยแพร่ตอนนี้: ${venueActivities
                .map((activity) => String(activity.title))
                .join(", ")}`
            : `${venue.name} ยังไม่มีกิจกรรมที่เผยแพร่ในระบบตอนนี้`,
          links: [{ label: `ดู ${venue.name}`, href: `/venue/${venueId}` }],
        });
      }

      if (/(อยู่ไหน|ที่ไหน|ไปยังไง|ไปทางไหน|เดินทาง|นำทาง)/.test(query)) {
        return json({
          answer: `${venue.name}: ${venue.directions || venue.landmarkNotes || "เปิดหน้าสถานที่เพื่อดูข้อมูลการเดินทาง"}`,
          links: [
            { label: `ดูการเดินทางไป ${venue.name}`, href: `/venue/${venueId}` },
            { label: "เปิดหน้ารวมแผนที่", href: "/map" },
          ],
        });
      }
    }

    if (/(ตอนนี้|กำลังเปิด|เปิดอยู่)/.test(query) && query.includes("กิจกรรม")) {
      const open = activities.filter((activity) => activity.availabilityStatus === "open");
      return json({
        answer: open.length
          ? `กิจกรรมที่สถานะเปิดตอนนี้: ${open
              .slice(0, 8)
              .map((activity) => String(activity.title))
              .join(", ")}`
          : "ตอนนี้ยังไม่มีกิจกรรมที่ตั้งสถานะเป็นเปิด",
        links: [{ label: "ดูกิจกรรมทั้งหมด", href: "/explore" }],
      });
    }

    const candidates: Array<{
      score: number;
      text: string;
      label: string;
      href: string;
    }> = [];

    for (const [id, rawVenue] of Object.entries(venues)) {
      const item = rawVenue as Record<string, unknown>;
      if (!item.isPublished) continue;
      const text = [item.name, item.description, item.directions, item.landmarkNotes].join(" ");
      candidates.push({
        score: score(text, terms, [String(item.name || "")], query),
        text: `${item.name}: ${item.description || "ดูรายละเอียดสถานที่และกิจกรรมในหน้าสถานที่"} ${item.directions || ""}`.trim(),
        label: String(item.name),
        href: `/venue/${id}`,
      });
    }

    for (const activity of activities) {
      const text = [
        activity.title,
        activity.shortDescription,
        activity.description,
      ].join(" ");
      candidates.push({
        score:
          score(text, terms, [String(activity.title || "")], query) +
          (query.includes("กิจกรรม") ? 1 : 0),
        text: `${activity.title}: ${activity.shortDescription || activity.description || "ดูรายละเอียดกิจกรรม"}`,
        label: String(activity.title),
        href: `/activity/${activity.id}`,
      });
    }

    for (const faqItem of Object.values(faq)) {
      const item = faqItem as Record<string, unknown>;
      if (!item.isPublished) continue;
      const text = [item.question, item.answer].join(" ");
      candidates.push({
        score: score(text, terms, [String(item.question || "")], query) + 1,
        text: `${item.question}: ${item.answer}`,
        label: String(item.question),
        href: "/faq",
      });
    }

    if (query.includes("รางวัล") || query.includes("แต้ม") || query.includes("คะแนน")) {
      const published = Object.values(prizes).filter(
        (value) => (value as { isPublished?: boolean }).isPublished,
      );
      if (published.length) {
        candidates.push({
          score: 3,
          text: `ตอนนี้มีของรางวัลที่เปิดแลก ${published.length} รายการ ดูแต้มที่ต้องใช้ได้ที่หน้าของรางวัล`,
          label: "ของรางวัล",
          href: "/prizes",
        });
      }
    }

    candidates.sort((a, b) => b.score - a.score);
    const matches = candidates.filter((item) => item.score > 0).slice(0, 3);
    if (!matches.length) {
      return json({
        answer:
          "ยังไม่พบข้อมูลที่ตรงกับคำถามนี้ ลองถามชื่อสถานที่ ชื่อกิจกรรม เวลา คะแนน หรือของรางวัล",
        links: [{ label: "ดูสถานที่และกิจกรรม", href: "/explore" }],
      });
    }

    return json({
      answer: matches.map((item) => item.text).join("\n\n"),
      links: matches.map(({ label, href }) => ({ label, href })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) return json({ error: "กรุณาพิมพ์คำถาม" }, 400);
    return publicError(error);
  }
}
