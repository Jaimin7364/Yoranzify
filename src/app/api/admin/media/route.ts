import { NextRequest } from "next/server";
import { requireRequestAdmin, userFromRequest } from "@/lib/auth";
import { deleteStoredMedia, parseUploadKind, processImage } from "@/lib/media";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/request-security";
import { handleRoute, jsonOk } from "@/lib/route";
import { ApiError } from "@/lib/api-error";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    requireRequestAdmin(await userFromRequest(request));
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new ApiError(400, "FILE_REQUIRED", "Choose an image to upload.");
    const kind = parseUploadKind(typeof form.get("kind") === "string" ? String(form.get("kind")) : null);
    const processed = await processImage(file, kind);
    try {
      const media = await prisma.mediaAsset.create({ data: { kind, originalName: file.name.slice(0, 255), ...processed } });
      return jsonOk({ media: { ...media, url: `/api/media/${media.id}` } }, 201);
    } catch (error) { await deleteStoredMedia(processed.storageKey); throw error; }
  });
}
