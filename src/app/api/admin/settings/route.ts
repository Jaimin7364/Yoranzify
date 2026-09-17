import { NextRequest } from "next/server";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/request-security";
import { getSiteSettings, presentSettings, settingsInputSchema } from "@/lib/settings";
import { handleRoute, jsonOk, parseJson } from "@/lib/route";
import { ApiError } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    requireRequestAdmin(await userFromRequest(request));
    const settings = await getSiteSettings();
    return jsonOk({ settings: settings ? presentSettings(settings) : null });
  });
}

export async function PATCH(request: NextRequest) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    requireRequestAdmin(await userFromRequest(request));
    const input = settingsInputSchema.parse(await parseJson(request));
    const mediaIds = [input.logoMediaId, input.faviconMediaId].filter((id): id is number => id !== null);
    const media = mediaIds.length ? await prisma.mediaAsset.findMany({ where: { id: { in: mediaIds } } }) : [];
    if (media.length !== new Set(mediaIds).size) throw new ApiError(400, "INVALID_MEDIA", "One or more selected images no longer exist.");
    if (input.logoMediaId && media.find((item) => item.id === input.logoMediaId)?.kind !== "LOGO") throw new ApiError(400, "INVALID_LOGO", "Choose an image uploaded as a logo.");
    if (input.faviconMediaId && media.find((item) => item.id === input.faviconMediaId)?.kind !== "FAVICON") throw new ApiError(400, "INVALID_FAVICON", "Choose an image uploaded as a favicon.");
    const settings = await prisma.siteSetting.upsert({ where: { id: 1 }, create: { id: 1 }, update: {}, include: { logo: true, favicon: true } });
    const updated = await prisma.siteSetting.update({ where: { id: settings.id }, data: {
      storeName: input.storeName, contactNumber: input.contactNumber, whatsappNumber: input.whatsappNumber, contactEmail: input.contactEmail,
      address: input.address, instagramUrl: input.instagramUrl, facebookUrl: input.facebookUrl, gstNumber: input.gstNumber, currency: input.currency,
      shippingChargePaise: Math.round(input.shippingChargeRupees * 100), freeShippingAbovePaise: Math.round(input.freeShippingAboveRupees * 100),
      ...(input.platformFeeRupees === undefined ? {} : { platformFeePaise: Math.round(input.platformFeeRupees * 100) }),
      lowStockThreshold: input.lowStockThreshold, codEnabled: input.codEnabled, maintenanceMode: input.maintenanceMode,
      logoMediaId: input.logoMediaId, faviconMediaId: input.faviconMediaId
    }, include: { logo: true, favicon: true } });
    return jsonOk({ settings: presentSettings(updated) });
  });
}
