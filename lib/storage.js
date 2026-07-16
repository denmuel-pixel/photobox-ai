/**
 * Storage utility — menyimpan data kode otorisasi.
 *
 * Di Vercel: menggunakan Redis (via @vercel/kv wrapper).
 *   Setup: Vercel Dashboard → Storage → Create Redis Database
 *   Env vars: KV_URL, KV_REST_API_URL, KV_REST_API_TOKEN (auto-added)
 *
 * Di lokal: menggunakan file data/codes.json.
 */

import { promises as fs } from "fs";
import path from "path";

const CODES_FILE = path.join(process.cwd(), "data", "codes.json");
const CODES_KEY = "photobox:codes";

// Deteksi apakah Redis tersedia (Vercel KV / Upstash)
function hasRedis() {
  return !!(
    process.env.KV_URL ||
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL
  );
}

// Deteksi apakah berjalan di serverless Vercel (tanpa Redis)
function isVercelServerless() {
  return !!process.env.VERCEL;
}

/**
 * Baca semua kode dari storage
 */
export async function readCodes() {
  if (hasRedis()) {
    const { kv } = await import("@vercel/kv");
    const data = await kv.get(CODES_KEY);
    return Array.isArray(data) ? data : [];
  }

  // Di Vercel tanpa Redis:
  // 1. Coba baca dari /tmp dulu (hasil write sebelumnya di sesi ini)
  // 2. Fallback ke file statis data/codes.json
  if (isVercelServerless()) {
    try {
      const tmpRaw = await fs.readFile("/tmp/codes.json", "utf-8");
      return JSON.parse(tmpRaw);
    } catch {
      // /tmp belum ada, baca dari file statis
    }
    try {
      const raw = await fs.readFile(CODES_FILE, "utf-8");
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  // Lokal: baca dari file
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
  if (hasRedis()) {
    const { kv } = await import("@vercel/kv");
    await kv.set(CODES_KEY, codes);
    return;
  }

  // Di Vercel tanpa Redis → coba tulis ke /tmp (tidak persisten, tapi
  // tidak crash). Untuk demo, user tetap bisa login di sesi yang sama.
  if (isVercelServerless()) {
    try {
      await fs.writeFile("/tmp/codes.json", JSON.stringify(codes, null, 2), "utf-8");
    } catch {
      // Abaikan — write gagal, tapi validasi tetap sukses untuk sesi ini
    }
    return;
  }

  // Lokal: tulis ke file
  await fs.writeFile(CODES_FILE, JSON.stringify(codes, null, 2), "utf-8");
}
