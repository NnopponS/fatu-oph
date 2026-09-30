import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { adminAuth, adminDb } from "../_lib/server.js";

const MEDIA_EDITOR_ROLES = new Set(["admin", "editor"]);
const MAX_MEDIA_BYTES = 100 * 1024 * 1024;

interface UploadClientPayload {
  idToken?: string;
}

async function verifyEditor(idToken: string) {
  const decoded = await adminAuth.verifyIdToken(idToken);
  const role = (
    await adminDb.ref(`admin/roles/${decoded.uid}/role`).get()
  ).val();

  if (typeof role !== "string" || !MEDIA_EDITOR_ROLES.has(role)) {
    throw new Error("This account is not allowed to upload event media.");
  }

  return { uid: decoded.uid, role };
}

export async function POST(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  try {
    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        let payload: UploadClientPayload = {};

        try {
          payload = JSON.parse(clientPayload ?? "{}") as UploadClientPayload;
        } catch {
          throw new Error("Invalid upload authorization payload.");
        }

        if (!payload.idToken) {
          throw new Error("Firebase sign-in is required.");
        }

        const actor = await verifyEditor(payload.idToken);

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/avif",
            "video/mp4",
            "video/webm",
          ],
          maximumSizeInBytes: MAX_MEDIA_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ uid: actor.uid, role: actor.role }),
        };
      },
      onUploadCompleted: async () => {
        // Client writes the returned public URL/metadata to /public/media.
      },
    });

    return Response.json(response);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Media upload failed." },
      { status: 400 },
    );
  }
}
