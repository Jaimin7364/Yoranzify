import { z } from "zod";
import { prisma } from "./prisma";

const optionalPhone = z.union([z.literal(""), z.string().transform((value) => value.replace(/\D/g, "")).pipe(z.string().regex(/^\d{10,15}$/, "Enter a valid phone number"))]).transform((value) => value || null);
const optionalUrl = z.union([z.literal(""), z.url("Enter a complete URL beginning with https://").refine((value) => new URL(value).protocol === "https:", "Only secure https:// URLs are allowed")]).transform((value) => value || null);
const optionalEmail = z.union([z.literal(""), z.email("Enter a valid email")]).transform((value) => value || null);

export const settingsInputSchema = z.object({
  storeName: z.string().trim().min(2).max(100),
  contactNumber: optionalPhone,
  whatsappNumber: optionalPhone,
  contactEmail: optionalEmail,
  address: z.string().trim().max(1000).transform((value) => value || null),
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  gstNumber: z.string().trim().toUpperCase().max(20).refine((value) => !value || /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/.test(value), "Enter a valid GST number").transform((value) => value || null),
  currency: z.literal("INR"),
  shippingChargeRupees: z.coerce.number().min(0).max(10000),
  freeShippingAboveRupees: z.coerce.number().min(0).max(1_000_000),
  platformFeeRupees: z.coerce.number().min(0).max(10000).optional(),
  lowStockThreshold: z.coerce.number().int().min(0).max(10000),
  codEnabled: z.boolean(),
  maintenanceMode: z.boolean(),
  logoMediaId: z.number().int().positive().nullable(),
  faviconMediaId: z.number().int().positive().nullable()
});

export async function getSiteSettings() {
  return prisma.siteSetting.findUnique({ where: { id: 1 }, include: { logo: true, favicon: true } });
}

export function presentSettings(settings: NonNullable<Awaited<ReturnType<typeof getSiteSettings>>>) {
  return {
    ...settings,
    shippingChargeRupees: settings.shippingChargePaise / 100,
    freeShippingAboveRupees: settings.freeShippingAbovePaise / 100,
    platformFeeRupees: settings.platformFeePaise / 100,
    logoUrl: settings.logo ? `/api/media/${settings.logo.id}` : null,
    faviconUrl: settings.favicon ? `/api/media/${settings.favicon.id}` : null
  };
}
