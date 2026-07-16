import { fal } from "@fal-ai/client";
import { submitSeedreamJob, checkJobStatus, getJobResult } from "@/lib/falAi";
import { TEMPLATES } from "@/lib/templates";

// Konfigurasi Fal AI (server-side only)
fal.config({
  credentials: process.env.FAL_KEY || process.env.FAL_API_KEY,
});

export const maxDuration = 60;

export async function POST(request) {
  try {
    const body = await request.json();
    const { image, prompt, strength, templateId, requestId, fetchResult } = body;

    const hasFalCredentials = Boolean(process.env.FAL_KEY || process.env.FAL_API_KEY);
    if (!hasFalCredentials) {
      const selectedTemplate = TEMPLATES.find((t) => t.id === templateId);
      return Response.json({
        success: true,
        resultUrl: selectedTemplate?.exampleImage || "/hero.jpg",
        fallback: true,
        message: "Layanan AI belum dikonfigurasi, preview demo lokal.",
      });
    }

    // ===== STEP 3: Ambil hasil setelah COMPLETED =====
    if (requestId && fetchResult) {
      const resultUrl = await getJobResult(requestId);
      return Response.json({ success: true, resultUrl });
    }

    // ===== STEP 2: Cek status job =====
    if (requestId) {
      const status = await checkJobStatus(requestId);
      return Response.json({ success: true, ...status });
    }

    // ===== STEP 1: Submit job baru =====
    if (!image) {
      return Response.json({ error: "Foto wajah wajib diupload" }, { status: 400 });
    }

    const actualPrompt = prompt || "A high quality portrait photo";
    const requestIdNew = await submitSeedreamJob(image, actualPrompt, strength || 0.85);

    return Response.json({ success: true, requestId: requestIdNew });
  } catch (error) {
    console.error("Generate error:", error);

    let detail = "Terjadi kesalahan saat memproses gambar";
    try {
      if (error?.body?.detail) {
        const d = error.body.detail;
        detail = typeof d === "string" ? d : JSON.stringify(d);
      } else {
        detail = error.message || detail;
      }
    } catch {
      detail = error.message || detail;
    }

    if (detail.includes("content_policy") || detail.includes("partner_validation")) {
      return Response.json({ error: "Coba upload foto yang berbeda" }, { status: 400 });
    }

    return Response.json({ error: detail }, { status: 500 });
  }
}
