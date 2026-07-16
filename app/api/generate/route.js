import { fal } from "@fal-ai/client";
import { generateWithSeedream, generateWithStyleReference } from "@/lib/falAi";
import { TEMPLATES } from "@/lib/templates";

// Konfigurasi Fal AI (server-side only)
fal.config({
  credentials: process.env.FAL_KEY || process.env.FAL_API_KEY,
});

// Tingkatkan timeout Vercel serverless (default 10s → 60s)
export const maxDuration = 60;

export async function POST(request) {
  try {
    const body = await request.json();
    const { image, prompt, strength, mode, styleImage, templateId } = body;

    const hasFalCredentials = Boolean(process.env.FAL_KEY || process.env.FAL_API_KEY);
    if (!hasFalCredentials) {
      const selectedTemplate = TEMPLATES.find((template) => template.id === templateId);
      const fallbackUrl = selectedTemplate?.exampleImage || "/hero.jpg";

      return Response.json(
        {
          success: true,
          resultUrl: fallbackUrl,
          fallback: true,
          message:
            "Layanan AI belum dikonfigurasi, jadi ditampilkan preview demo lokal.",
        },
        { status: 200 }
      );
    }

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
        styleImage || null,
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

    if (!resultUrl || typeof resultUrl !== "string") {
      return Response.json(
        { error: "Tidak menerima URL hasil generate dari layanan AI" },
        { status: 502 }
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
