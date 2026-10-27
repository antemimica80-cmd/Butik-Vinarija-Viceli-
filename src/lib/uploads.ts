import "server-only";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

export class UploadError extends Error {
  constructor(public code: "too_large" | "type" | "empty") { super(code); }
}

export const uploadRoot = () => path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR || "./storage/uploads");
const maxBytes = () => Number(process.env.UPLOAD_MAX_MB || 8) * 1024 * 1024;

/** Detect the real file type from magic bytes (never trust the browser-supplied MIME type). */
export function sniff(buf: Buffer): { mime: string; ext: string } | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { mime: "image/png", ext: "png" };
  if (buf.length > 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return { mime: "image/webp", ext: "webp" };
  if (buf.length > 5 && buf.toString("ascii", 0, 5) === "%PDF-") return { mime: "application/pdf", ext: "pdf" };
  return null;
}

/** Best-effort pixel dimensions for PNG, JPEG and WebP. */
export function dimensions(buf: Buffer, mime: string): { width: number; height: number } | null {
  try {
    if (mime === "image/png") return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    if (mime === "image/webp") {
      const chunk = buf.toString("ascii", 12, 16);
      if (chunk === "VP8X") return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
      if (chunk === "VP8 ") return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
      if (chunk === "VP8L") { const b = buf.readUInt32LE(21); return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 }; }
    }
    if (mime === "image/jpeg") {
      let i = 2;
      while (i < buf.length) {
        if (buf[i] !== 0xff) return null;
        const marker = buf[i + 1];
        const len = buf.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
        i += 2 + len;
      }
    }
  } catch { /* malformed */ }
  return null;
}

export async function storeUpload(file: File, dir: string, allowed: string[]) {
  if (!file.size) throw new UploadError("empty");
  if (file.size > maxBytes()) throw new UploadError("too_large");
  const buf = Buffer.from(await file.arrayBuffer());
  const kind = sniff(buf);
  if (!kind || !allowed.includes(kind.mime)) throw new UploadError("type");
  const safeDir = dir.replace(/[^a-z0-9/_-]/gi, "");
  const name = `${Date.now().toString(36)}-${randomBytes(8).toString("hex")}.${kind.ext}`;
  const rel = path.posix.join(safeDir, name);
  const abs = path.join(/*turbopackIgnore: true*/ uploadRoot(), rel);
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, buf, { mode: 0o640 });
  const dim = dimensions(buf, kind.mime);
  return { path: rel, mime: kind.mime, bytes: buf.length, width: dim?.width ?? null, height: dim?.height ?? null };
}

/** Read a stored file, refusing any path that escapes the upload root. */
export async function readUpload(rel: string) {
  const root = uploadRoot();
  const abs = path.resolve(/*turbopackIgnore: true*/ root, rel);
  if (!abs.startsWith(root + path.sep)) throw new Error("invalid path");
  return readFile(abs);
}
