import { fal } from "@fal-ai/client";
import { generateWithSeedream, generateWithStyleReference } from "@/lib/falAi";

// Konfigurasi Fal AI (server-side only)
fal.config({
  credentials: process.env.FAL_KEY || process.env.FAL_API_KEY,
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { image, prompt, strength, mode } = body;

    if (!image) {
      return Response.json(
        { error: "Foto wajah wajib diupload" },
        { status: 400 }
      );
    }

    let resultUrl;

    if (mode === "style-reference") {
      resultUrl = await generateWithStyleReference(
        image,
        null, // styleImage tidak lagi dikirim via API (Seedream hanya support 1 image_url)
        prompt || "Transform this portrait with a beautiful artistic style, vibrant colors, and creative aesthetic",
        strength || 0.85
      );
    } else {
      resultUrl = await generateWithSeedream(
        image,
        prompt || "A high quality portrait photo",
        strength || 0.85
      );
    }

    return Response.json({
      success: true,
      resultUrl,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return Response.json(
      { error: error.message || "Terjadi kesalahan saat memproses gambar" },
      { status: 500 }
    );
  }
}
