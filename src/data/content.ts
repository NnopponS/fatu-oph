import { useEffect, useMemo, useState } from "react";
import { z, type ZodType } from "zod";
import { realtimePaths, subscribeRealtime } from "@/services/realtime";
import { formatPlaceText, realmFor } from "@/lib/realms";
import { activityAward, rewardPolicy, type RewardPolicy } from "@/lib/reward-policy";

import { siteSchema, venueSchema, activitySchema, prizeSchema, faqSchema, announcementSchema, mediaSchema, type Site, type Venue, type Activity, type Prize, type Faq, type Announcement, type MediaItem } from "@/data/schemas";
export * from "@/data/schemas";

type CollectionState<T> = { items: T[]; loading: boolean; error: string | null };

function useCollection<T extends { displayOrder?: number; isPublished?: boolean }>(
  path: string,
  schema: ZodType<Omit<T, "id">>,
  publishedOnly: boolean,
): CollectionState<T> {
  const [state, setState] = useState<CollectionState<T>>({ items: [], loading: true, error: null });

  useEffect(
    () =>
      subscribeRealtime<unknown>(path, (value) => {
        const parsed = z.record(schema).safeParse(value ?? {});
        if (!parsed.success) {
          setState({ items: [], loading: false, error: "ข้อมูลไม่ถูกต้อง กรุณาลองใหม่ภายหลัง" });
          return;
        }

        const items = Object.entries(parsed.data)
          .map(([id, record]) => ({ id, ...(record as object) } as unknown as T))
          .filter((item) => !publishedOnly || item.isPublished === true)
          .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0));

        setState({ items, loading: false, error: null });
      }),
    [path, schema, publishedOnly],
  );

  return state;
}

export function useSite() {
  const [state, setState] = useState<{ item: Site | null; loading: boolean; error: string | null }>({
    item: null,
    loading: true,
    error: null,
  });

  useEffect(
    () =>
      subscribeRealtime<unknown>(realtimePaths.public.site, (value) => {
        const parsed = siteSchema.safeParse(value);
        if (!parsed.success) {
          setState({ item: null, loading: false, error: "ข้อมูลเว็บไซต์ไม่ถูกต้อง" });
          return;
        }
        setState({ item: parsed.data, loading: false, error: null });
      }),
    [],
  );

  return state;
}

export function useVenues(publishedOnly = true) {
  const state = useCollection<Venue>(realtimePaths.public.venues, venueSchema, publishedOnly);
  return useMemo(() => ({ ...state, items: state.items.map(venue => {
    const meta = realmFor(venue.visualIdentityKey);
    return { ...venue, name: formatPlaceText(venue.name || meta.place), mapUrl: venue.mapUrl || meta.mapUrl, description: formatPlaceText(venue.description), directions: formatPlaceText(venue.directions), landmarkNotes: formatPlaceText(venue.landmarkNotes) };
  }) }), [state]);
}

export function useActivities(publishedOnly = true) {
  const state = useCollection<Activity>(realtimePaths.public.activities, activitySchema, publishedOnly);
  const { rules } = useRewardPolicy();
  return useMemo(
    () => ({
      ...state,
      items: state.items.filter((item) => !publishedOnly || !item.isArchived).map(item =>
        publishedOnly ? { ...item, pointsAwarded: activityAward(item, rules) } : item),
    }),
    [state, publishedOnly, rules],
  );
}

export function useRewardPolicy(): { rules: RewardPolicy; loading: boolean } {
  const site = useSite();
  const rules = useMemo(() => rewardPolicy(site.item?.rewardPolicy), [site.item?.rewardPolicy]);
  return { rules, loading: site.loading };
}

export function usePrizes(publishedOnly = true) {
  return useCollection<Prize>(realtimePaths.public.prizes, prizeSchema, publishedOnly);
}

export function useFaq(publishedOnly = true) {
  return useCollection<Faq>(realtimePaths.public.faq, faqSchema, publishedOnly);
}

export function useAnnouncements(publishedOnly = true) {
  return useCollection<Announcement>(realtimePaths.public.announcements, announcementSchema, publishedOnly);
}

export function useMedia(publishedOnly = true) {
  return useCollection<MediaItem>(realtimePaths.public.media, mediaSchema, publishedOnly);
}

export function resolveMediaUrl(reference: string, media: MediaItem[]) {
  if (!reference) return "";
  if (/^(https?:\/\/|\/media\/)/.test(reference)) return reference;
  return media.find((item) => item.id === reference)?.url || "";
}
