import { z } from "zod";

export const siteSchema = z.object({
  name: z.string().min(1),
  eventYear: z.number().int().min(2026).default(2026),
  theme: z.string().min(1),
  faculty: z.string().min(1),
  description: z.string().default(""),
  heroTitle: z.string().default(""),
  heroDescription: z.string().default(""),
  heroCtaText: z.string().default(""),
  dateLabel: z.string().default(""),
  locationLabel: z.string().default(""),
  registrationOpen: z.boolean().default(true),
  rewardPolicy: z.unknown().optional(),
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
  room: z.string().default(""),
  category: z.enum(["workshop", "performance", "recreation", "other"]).default("other"),
  sessionNumber: z.number().int().positive().nullable().default(null),
  sourceId: z.string().default(""),
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
  pointsAwarded: z.number().int().nonnegative().default(100),
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
  drawWeight: z.number().nonnegative().default(1),
  rarity: z.enum(["legendary", "epic", "rare", "uncommon", "common"]).default("common"),
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
