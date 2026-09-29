import { useEffect, useMemo, useState } from "react";
import { z, type ZodType } from "zod";
import { realtimePaths, subscribeRealtime } from "@/services/realtime";

export const siteSchema = z.object({
  name: z.string().min(1),
  eventYear: z.number().int().min(2026).default(2026),
  theme: z.string().min(1),
  faculty: z.string().min(1),
  description: z.string().default(""),
  dateLabel: z.string().default(""),
  locationLabel: z.string().default(""),
  registrationOpen: z.boolean().default(true),
});

export const venueSchema = z.object({
  name: z.string().min(1),
  visualIdentityKey: z.enum(["azure-dragon", "white-tiger", "nine-tailed-fox", "red-phoenix"]),
  visualLabel: z.string().min(1),
  description: z.string().default(""),
  directions: z.string().default(""),
  landmarkNotes: z.string().default(""),
  mapUrl: z.string().default(""),
  latitude: z.number().nullable().default(null),
  longitude: z.number().nullable().default(null),
  coverMediaId: z.string().default(""),
  displayOrder: z.number().int().nonnegative().default(0),
  isPublished: z.boolean().default(false),
});

export const activitySchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  shortDescription: z.string().default(""),
  description: z.string().default(""),
  venueId: z.string().min(1),
  coverMediaId: z.string().default(""),
  startAt: z.string().default(""),
  endAt: z.string().default(""),
  registrationMode: z.enum(["none", "external", "on-site"]).default("none"),
  registrationUrl: z.string().default(""),
  ctaLabel: z.string().default(""),
  price: z.number().nonnegative().nullable().default(null),
  priceLabel: z.string().default(""),
  isFree: z.boolean().default(true),
  capacity: z.number().int().nonnegative().nullable().default(null),
  availabilityStatus: z.enum(["open", "full", "closed", "coming-soon"]).default("open"),
  tags: z.array(z.string()).default([]),
  displayOrder: z.number().int().nonnegative().default(0),
  isPublished: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  pointsEnabled: z.boolean().default(false),
  pointsAwarded: z.number().int().nonnegative().default(0),
  pointGrantMode: z.enum(["once", "per-session", "repeat-limited", "manual-only"]).default("once"),
  repeatLimit: z.number().int().positive().nullable().default(null),
  completionMethod: z.enum(["qr", "staff", "none"]).default("none"),
  requiresStaffVerification: z.boolean().default(false),
  updatedAt: z.string().default(""),
  createdAt: z.string().default(""),
});

export const prizeSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(""),
  imageMediaId: z.string().default(""),
  stock: z.number().int().nonnegative().default(0),
  pointsRequired: z.number().int().nonnegative().default(0),
  claimLimit: z.number().int().positive().default(1),
  displayOrder: z.number().int().nonnegative().default(0),
  isPublished: z.boolean().default(false),
});

export const faqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  displayOrder: z.number().int().nonnegative().default(0),
  isPublished: z.boolean().default(false),
});

export const announcementSchema = z.object({
  title: z.string().min(1),
  body: z.string().default(""),
  level: z.enum(["info", "important"]).default("info"),
  isPublished: z.boolean().default(false),
  displayOrder: z.number().int().nonnegative().default(0),
});

export const mediaSchema = z.object({
  provider: z.enum(["vercel-static", "vercel-blob"]),
  url: z.string().min(1),
  pathname: z.string().default(""),
  contentType: z.string().default(""),
  sizeBytes: z.number().nonnegative().default(0),
  altText: z.string().default(""),
  kind: z.enum(["image", "video", "poster"]).default("image"),
  venueId: z.string().default(""),
  activityId: z.string().default(""),
  uploadedBy: z.string().default(""),
  createdAt: z.string().default(""),
  displayOrder: z.number().int().nonnegative().default(0),
  isPublished: z.boolean().default(true),
});

export type Site = z.infer<typeof siteSchema>;
export type Venue = z.infer<typeof venueSchema> & { id: string };
export type Activity = z.infer<typeof activitySchema> & { id: string };
export type Prize = z.infer<typeof prizeSchema> & { id: string };
export type Faq = z.infer<typeof faqSchema> & { id: string };
export type Announcement = z.infer<typeof announcementSchema> & { id: string };
export type MediaItem = z.infer<typeof mediaSchema> & { id: string };

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
  return useCollection<Venue>(realtimePaths.public.venues, venueSchema, publishedOnly);
}

export function useActivities(publishedOnly = true) {
  const state = useCollection<Activity>(realtimePaths.public.activities, activitySchema, publishedOnly);
  return useMemo(
    () => ({
      ...state,
      items: state.items.filter((item) => !publishedOnly || !item.isArchived),
    }),
    [state, publishedOnly],
  );
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
