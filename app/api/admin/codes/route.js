import { readCodes, writeCodes } from "@/lib/storage";
import crypto from "crypto";

function generateCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // tanpa 0, O, I, 1
  let code = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  // Format: XXXXX-XXXXX
  const mid = Math.floor(code.length / 2);
  return code.slice(0, mid) + "-" + code.slice(mid);
}

// GET: List semua kode
export async function GET() {
  try {
    const codes = await readCodes();
    // Urutkan dari terbaru
    codes.reverse();
    return Response.json({ codes });
  } catch (error) {
    console.error("List codes error:", error);
    return Response.json({ error: "Gagal memuat kode" }, { status: 500 });
  }
}

// POST: Generate kode baru
export async function POST(request) {
  try {
    const { count = 1 } = await request.json();
    const codes = await readCodes();
    const newCodes = [];

    for (let i = 0; i < Math.min(count, 50); i++) {
      let code;
      // Pastikan tidak duplikat
      do {
        code = generateCode();
      } while (codes.some((c) => c.code === code) || newCodes.some((c) => c.code === code));

      const entry = {
        code,
        used: false,
        createdAt: new Date().toISOString(),
        usedAt: null,
      };
      newCodes.push(entry);
      codes.push(entry);
    }

    await writeCodes(codes);

    return Response.json({
      success: true,
      codes: newCodes.map((c) => c.code),
    });
  } catch (error) {
    console.error("Generate codes error:", error);
    return Response.json(
      { error: "Gagal membuat kode" },
      { status: 500 }
    );
  }
}
