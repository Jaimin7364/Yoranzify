import { NextRequest } from "next/server";
import { z } from "zod";
import { readStoredMedia } from "@/lib/media";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = z.coerce.number().int().positive().safeParse(id);
  if (!parsed.success) return new Response("Not found", { status: 404 });
  const media = await prisma.mediaAsset.findUnique({ where: { id: parsed.data } });
  if (!media) return new Response("Not found", { status: 404 });
  try {
    const file = await readStoredMedia(media.storageKey);
    return new Response(new Uint8Array(file), { headers: { "Content-Type": media.mimeType, "Content-Length": String(file.length), "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch { return new Response("Not found", { status: 404 }); }
}
