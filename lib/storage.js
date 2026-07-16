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

  // Di Vercel tapi tanpa Redis → hanya bisa baca file statis (initial deployment)
  if (isVercelServerless()) {
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

  // Di Vercel tanpa Redis → tidak bisa menulis
  if (isVercelServerless()) {
    throw new Error(
      "Penyimpanan Redis belum dikonfigurasi. " +
        "Buka Vercel Dashboard → Storage → Create Redis Database, " +
        "lalu redeploy."
    );
  }

  // Lokal: tulis ke file
  await fs.writeFile(CODES_FILE, JSON.stringify(codes, null, 2), "utf-8");
}
