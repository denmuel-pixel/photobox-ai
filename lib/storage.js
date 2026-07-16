/**
 * Storage utility — menyimpan data kode otorisasi.
 *
 * Di Vercel: menggunakan @vercel/kv (Redis via Upstash).
 * Di lokal: menggunakan file data/codes.json.
 */

import { promises as fs } from "fs";
import path from "path";

const CODES_FILE = path.join(process.cwd(), "data", "codes.json");
const CODES_KEY = "photobox:codes";

// Deteksi apakah di environment Vercel (ada env KV)
function isVercel() {
  return !!(process.env.KV_URL || process.env.KV_REST_API_URL);
}

/**
 * Baca semua kode dari storage
 */
export async function readCodes() {
  if (isVercel()) {
    const { kv } = await import("@vercel/kv");
    const data = await kv.get(CODES_KEY);
    return Array.isArray(data) ? data : [];
  }

  // Fallback: file JSON lokal
  try {
    const raw = await fs.readFile(CODES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Tulis semua kode ke storage
 */
export async function writeCodes(codes) {
  if (isVercel()) {
    const { kv } = await import("@vercel/kv");
    await kv.set(CODES_KEY, codes);
    return;
  }

  // Fallback: file JSON lokal
  await fs.writeFile(CODES_FILE, JSON.stringify(codes, null, 2), "utf-8");
}
