import { readCodes, writeCodes } from "@/lib/storage";

export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return Response.json(
        { valid: false, error: "Kode tidak valid" },
        { status: 400 }
      );
    }

    const codes = await readCodes();
    const trimmed = code.trim().toUpperCase();
    const found = codes.find((c) => c.code === trimmed);

    if (!found) {
      return Response.json(
        { valid: false, error: "Kode otorisasi tidak ditemukan" },
        { status: 400 }
      );
    }

    const maxUses = found.maxUses || 1;
    const uses = found.uses || 0;

    if (uses >= maxUses) {
      return Response.json(
        { valid: false, error: "Kode otorisasi sudah habis (" + uses + "/" + maxUses + ")" },
        { status: 400 }
      );
    }

    // Tambah pemakaian
    found.uses = uses + 1;
    found.usedAt = new Date().toISOString();
    const saved = await writeCodes(codes);

    if (!saved) {
      return Response.json(
        {
          valid: false,
          error:
            "Penyimpanan kode tidak persisten. Setup Vercel KV Redis agar kode berfungsi dengan benar.",
        },
        { status: 500 }
      );
    }

    const remaining = maxUses - found.uses;
    return Response.json({
      valid: true,
      remaining,
      maxUses,
      message: "Kode valid! Sisa: " + remaining + "/" + maxUses + " penggunaan",
    });
  } catch (error) {
    console.error("Validate code error:", error);
    return Response.json(
      { valid: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
