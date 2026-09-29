import { useEffect, useState } from "react";
import { z } from "zod";
import { realtimePaths, subscribeRealtime } from "@/services/realtime";

const venueSchema = z.object({
  name: z.string().min(1),
  visualIdentityKey: z.enum([
    "azure-dragon",
    "white-tiger",
    "nine-tailed-fox",
    "red-phoenix",
  ]),
  visualLabel: z.string().min(1),
  displayOrder: z.number().int().nonnegative(),
  isPublished: z.boolean(),
});

const venueMapSchema = z.record(venueSchema);

export interface PublicVenue extends z.infer<typeof venueSchema> {
  id: string;
}

export function usePublishedVenues() {
  const [venues, setVenues] = useState<PublicVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () =>
      subscribeRealtime<unknown>(realtimePaths.public.venues, (value) => {
        const parsed = venueMapSchema.safeParse(value ?? {});

        if (!parsed.success) {
          setError("ข้อมูลสถานที่ไม่ถูกต้อง กรุณาลองใหม่ภายหลัง");
          setLoading(false);
          return;
        }

        setVenues(
          Object.entries(parsed.data)
            .map(([id, venue]) => ({ id, ...venue }))
            .filter((venue) => venue.isPublished)
            .sort((a, b) => a.displayOrder - b.displayOrder),
        );
        setError(null);
        setLoading(false);
      }),
    [],
  );

  return { venues, loading, error };
}
