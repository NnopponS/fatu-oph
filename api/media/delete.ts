import { del } from "@vercel/blob";
import { z } from "zod";
import {
  adminDb,
  json,
  publicError,
  readJson,
  requireStaff,
} from "../_lib/server.js";

const schema = z.object({ mediaId: z.string().min(1).max(200) });

export default async function handler(request: Request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const actor = await requireStaff(request, ["admin", "editor"]);
    const { mediaId } = schema.parse(await readJson(request));
    const ref = adminDb.ref(`public/media/${mediaId}`);
    const snapshot = await ref.get();
    if (!snapshot.exists()) return json({ error: "ไม่พบไฟล์" }, 404);

    const media = snapshot.val() as {
      provider?: string;
      url?: string;
      pathname?: string;
    };

    if (media.provider === "vercel-blob" && (media.url || media.pathname)) {
      await del(media.url || media.pathname || "");
    }

    await ref.remove();

    const auditId = adminDb.ref("operations/audit").push().key;
    if (auditId) {
      await adminDb.ref(`operations/audit/${auditId}`).set({
        type: "content-delete",
        contentKind: "media",
        contentId: mediaId,
        staffId: actor.uid,
        createdAt: new Date().toISOString(),
      });
    }

    return json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return json({ error: "ข้อมูลไฟล์ไม่ถูกต้อง" }, 400);
    return publicError(error);
  }
}
