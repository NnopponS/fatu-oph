import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

const MEDIA_EDITOR_ROLES = new Set(["admin", "editor"]);
const MAX_MEDIA_BYTES = 100 * 1024 * 1024;

interface UploadClientPayload {
  idToken?: string;
}

interface FirebaseLookupResponse {
  users?: Array<{ localId?: string }>;
}

function getServerFirebaseConfig() {
  const apiKey =
    process.env.FIREBASE_WEB_API_KEY ?? process.env.VITE_FIREBASE_API_KEY;
  const databaseURL =
    process.env.FIREBASE_DATABASE_URL ?? process.env.VITE_FIREBASE_DATABASE_URL;

  if (!apiKey || !databaseURL) {
    throw new Error(
      "Firebase server configuration is incomplete. Set FIREBASE_WEB_API_KEY and FIREBASE_DATABASE_URL in Vercel.",
    );
  }

  return { apiKey, databaseURL: databaseURL.replace(/\/+$/, "") };
}

async function verifyEditor(idToken: string) {
  const { apiKey, databaseURL } = getServerFirebaseConfig();
  const lookupResponse = await fetch(
    "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + encodeURIComponent(apiKey),
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idToken }),
    },
  );

  if (!lookupResponse.ok) {
    throw new Error("Firebase authentication failed.");
  }

  const lookup = (await lookupResponse.json()) as FirebaseLookupResponse;
  const uid = lookup.users?.[0]?.localId;

  if (!uid) {
    throw new Error("Firebase user was not found.");
  }

  const roleResponse = await fetch(
    databaseURL + "/admin/roles/" + encodeURIComponent(uid) + ".json?auth=" + encodeURIComponent(idToken),
  );

  if (!roleResponse.ok) {
    throw new Error("Unable to verify the admin role.");
  }

  const roleValue = (await roleResponse.json()) as string | { role?: string } | null;
  const role = typeof roleValue === "string" ? roleValue : roleValue?.role;

  if (!role || !MEDIA_EDITOR_ROLES.has(role)) {
    throw new Error("This account is not allowed to upload event media.");
  }

  return { uid, role };
}

export default async function handler(request: Request) {
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
        // The authenticated client writes media metadata to Realtime Database.
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
