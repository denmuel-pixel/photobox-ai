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

    if (found.used) {
      return Response.json(
        { valid: false, error: "Kode otorisasi sudah pernah digunakan" },
        { status: 400 }
      );
    }

    // Tandai kode sebagai sudah dipakai
    found.used = true;
    found.usedAt = new Date().toISOString();
    await writeCodes(codes);

    return Response.json({ valid: true });
  } catch (error) {
    console.error("Validate code error:", error);
    return Response.json(
      { valid: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
