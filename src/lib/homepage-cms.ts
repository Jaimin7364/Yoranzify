import { z } from "zod";
import type { HomepageSectionType, Prisma } from "@prisma/client";
import { ApiError } from "./api-error";
import { prisma } from "./prisma";

const safeLink = z.string().trim().max(500).refine((value) => value.startsWith("/") && !value.startsWith("//") || /^https:\/\//i.test(value), "Use a site path or HTTPS URL.");
const nullableLink = z.union([safeLink, z.literal(""), z.null()]).optional().transform((value) => value || null);
const nullableDate = z.union([z.string().datetime(), z.literal(""), z.null()]).optional().transform((value) => value ? new Date(value) : null);

export const bannerSchema = z.object({
  desktopMediaId: z.coerce.number().int().positive(), mobileMediaId: z.coerce.number().int().positive().nullable().optional(),
  altText: z.string().trim().min(3).max(180), title: z.string().trim().min(2).max(160), subtitle: z.string().trim().max(300).nullish().transform((value) => value || null),
  buttonText: z.string().trim().max(60).nullish().transform((value) => value || null), buttonUrl: nullableLink,
  position: z.coerce.number().int().min(0).max(1000), startsAt: nullableDate, endsAt: nullableDate, enabled: z.boolean()
}).superRefine((value, context) => {
  if (value.buttonText && !value.buttonUrl) context.addIssue({ code: "custom", path: ["buttonUrl"], message: "Add a destination for the button." });
  if (value.startsAt && value.endsAt && value.endsAt <= value.startsAt) context.addIssue({ code: "custom", path: ["endsAt"], message: "End time must be after start time." });
});

export const sectionSchema = z.object({ id: z.number().int().positive(), enabled: z.boolean(), position: z.number().int().min(0).max(1000), title: z.string().trim().max(160).nullish().transform((value) => value || null), subtitle: z.string().trim().max(300).nullish().transform((value) => value || null), linkUrl: nullableLink });
export const sectionsSchema = z.object({ sections: z.array(sectionSchema).min(1).max(9) });

export function isBannerActive(banner: { enabled: boolean; startsAt: Date | null; endsAt: Date | null }, now = new Date()) { return banner.enabled && (!banner.startsAt || banner.startsAt <= now) && (!banner.endsAt || banner.endsAt > now); }
export function activeBannerWhere(now = new Date()): Prisma.BannerWhereInput { return { enabled: true, AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gt: now } }] }] }; }
export const bannerInclude = { desktopMedia: true, mobileMedia: true } satisfies Prisma.BannerInclude;

export const defaultHomepageSections: Prisma.HomepageSectionCreateManyInput[] = [
  { type: "HERO", title: "Campaign stories", enabled: true, position: 0 },
  { type: "CATEGORIES", title: "Shop by world", enabled: true, position: 1 },
  { type: "NEW_ARRIVALS", title: "The new edit", enabled: true, position: 2 },
  { type: "FEATURED_COLLECTION", title: "Featured pieces", enabled: true, position: 3 },
  { type: "BEST_SELLERS", title: "Best sellers", enabled: true, position: 4 },
  { type: "OFFERS", title: "The sale edit", enabled: true, position: 5 },
  { type: "TRENDING", title: "Trending now", enabled: false, position: 6 },
  { type: "GALLERY", title: "The journal", enabled: false, position: 7 },
  { type: "TESTIMONIALS", title: "Worn and loved", enabled: false, position: 8 },
];

export async function ensureHomepageSections() {
  await prisma.homepageSection.createMany({ data: defaultHomepageSections, skipDuplicates: true });
  return prisma.homepageSection.findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] });
}

export async function saveBanner(raw: unknown, id?: number) { const data = bannerSchema.parse(raw); const mediaIds = [data.desktopMediaId, data.mobileMediaId].filter((value): value is number => Boolean(value)); const media = await prisma.mediaAsset.count({ where: { id: { in: mediaIds }, kind: "BANNER" } }); if (media !== new Set(mediaIds).size) throw new ApiError(400, "INVALID_BANNER_MEDIA", "Choose uploaded banner images."); return id ? prisma.banner.update({ where: { id }, data, include: bannerInclude }) : prisma.banner.create({ data, include: bannerInclude }); }
export async function saveSections(raw: unknown) { const { sections } = sectionsSchema.parse(raw); return prisma.$transaction(sections.map((section) => prisma.homepageSection.update({ where: { id: section.id }, data: section })) ); }
export async function publicHomepageContent(now = new Date()) { const [banners, allSections] = await Promise.all([prisma.banner.findMany({ where: activeBannerWhere(now), include: bannerInclude, orderBy: [{ position: "asc" }, { id: "asc" }] }), ensureHomepageSections()]); return { banners, sections: allSections.filter((section) => section.enabled) }; }
export const sectionTypes: HomepageSectionType[] = ["HERO", "CATEGORIES", "NEW_ARRIVALS", "TRENDING", "BEST_SELLERS", "OFFERS", "FEATURED_COLLECTION", "GALLERY", "TESTIMONIALS"];
