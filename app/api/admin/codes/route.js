import { readCodes, writeCodes } from "@/lib/storage";
import crypto from "crypto";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // tanpa 0, O, I, 1
  let code = "";
  const bytes = crypto.randomBytes(4);
  for (let i = 0; i < 4; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
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
        uses: 0,
        maxUses: 5,
        createdAt: new Date().toISOString(),
        usedAt: null,
      };
      newCodes.push(entry);
      codes.push(entry);
    }

    const ok = await writeCodes(codes);
    if (!ok) {
      return Response.json(
        { error: "Gagal menyimpan kode. Setup Vercel KV Redis." },
        { status: 500 }
      );
    }

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
