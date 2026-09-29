import { upload } from "@vercel/blob/client";
import { auth } from "@/lib/firebase";
import { pushRealtime, realtimePaths } from "@/services/realtime";

export type MediaProvider = "vercel-static" | "vercel-blob";

export interface MediaRecord {
  id: string;
  provider: MediaProvider;
  url: string;
  pathname?: string;
  contentType?: string;
  sizeBytes?: number;
  altText: string;
  kind: "image" | "video" | "poster";
  venueId?: string;
  activityId?: string;
  uploadedBy?: string;
  createdAt: string;
}

export interface UploadMediaInput {
  file: File;
  kind: MediaRecord["kind"];
  altText: string;
  venueId?: string;
  activityId?: string;
}

const CLIENT_UPLOAD_THRESHOLD_BYTES = 4.5 * 1024 * 1024;

export function getStaticMediaUrl(pathname: string): string {
  const clean = pathname.replace(/^\/+/, "");
  return "/media/" + clean;
}

export async function uploadAdminMedia(
  input: UploadMediaInput,
): Promise<MediaRecord> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Admin sign-in is required before uploading media.");
  }

  const idToken = await user.getIdToken();
  const scope = input.activityId
    ? "activities/" + input.activityId
    : input.venueId
      ? "venues/" + input.venueId
      : "general";

  const blob = await upload("event-media/" + scope + "/" + input.file.name, input.file, {
    access: "public",
    handleUploadUrl: "/api/media/upload",
    clientPayload: JSON.stringify({ idToken }),
    multipart: input.file.size > CLIENT_UPLOAD_THRESHOLD_BYTES,
  });

  const createdAt = new Date().toISOString();
  const draft: Omit<MediaRecord, "id"> = {
    provider: "vercel-blob",
    url: blob.url,
    pathname: blob.pathname,
    contentType: input.file.type || blob.contentType,
    sizeBytes: input.file.size,
    altText: input.altText,
    kind: input.kind,
    venueId: input.venueId,
    activityId: input.activityId,
    uploadedBy: user.uid,
    createdAt,
  };

  const id = await pushRealtime(realtimePaths.public.media, draft);
  return { id, ...draft };
}
