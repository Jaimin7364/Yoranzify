import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { ApiError } from "./api-error";

const allowedKinds = ["LOGO", "FAVICON", "PRODUCT", "CATEGORY", "BANNER", "REVIEW"] as const;
export type UploadKind = typeof allowedKinds[number];
const root = path.resolve(process.env.UPLOAD_DIR || "./uploads");
const maxBytes = Number(process.env.MAX_UPLOAD_BYTES || 8 * 1024 * 1024);

export function parseUploadKind(value: string | null): UploadKind {
  const kind = value?.toUpperCase();
  if (!allowedKinds.includes(kind as UploadKind)) throw new ApiError(400, "INVALID_MEDIA_KIND", "Choose a valid media type.");
  return kind as UploadKind;
}

export function detectImageType(bytes: Uint8Array) {
  if (bytes.length >= 12 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

function safeStoragePath(storageKey: string) {
  const resolved = path.resolve(root, storageKey);
  if (!resolved.startsWith(`${root}${path.sep}`)) throw new ApiError(400, "INVALID_STORAGE_KEY", "Invalid media path.");
  return resolved;
}

export async function processImage(file: File, kind: UploadKind) {
  if (file.size <= 0 || file.size > maxBytes) throw new ApiError(400, "INVALID_FILE_SIZE", `Images must be smaller than ${Math.round(maxBytes / 1024 / 1024)} MB.`);
  const input = Buffer.from(await file.arrayBuffer());
  const detected = detectImageType(input);
  if (!detected) throw new ApiError(400, "INVALID_IMAGE", "Only valid JPEG, PNG, and WebP images are accepted.");
  try {
    const source = sharp(input, { limitInputPixels: 36_000_000, failOn: "warning" }).rotate();
    const metadata = await source.metadata();
    if (!metadata.width || !metadata.height || metadata.width > 6000 || metadata.height > 6000) throw new ApiError(400, "INVALID_DIMENSIONS", "Images must be no larger than 6000 × 6000 pixels.");
    const output = await source.resize({ width: kind === "FAVICON" ? 512 : 2000, height: kind === "FAVICON" ? 512 : 2000, fit: "inside", withoutEnlargement: true }).webp({ quality: kind === "FAVICON" ? 90 : 82 }).toBuffer({ resolveWithObject: true });
    const folder = kind.toLowerCase();
    const storageKey = `${folder}/${randomUUID()}.webp`;
    const absolutePath = safeStoragePath(storageKey);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, output.data, { flag: "wx" });
    return { storageKey, mimeType: "image/webp", byteSize: output.data.length, width: output.info.width, height: output.info.height, checksum: createHash("sha256").update(output.data).digest("hex") };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "INVALID_IMAGE", "The image could not be processed.");
  }
}

export async function readStoredMedia(storageKey: string) { return readFile(safeStoragePath(storageKey)); }
export async function deleteStoredMedia(storageKey: string) { await unlink(safeStoragePath(storageKey)).catch(() => undefined); }
