import { fal } from "@fal-ai/client";

/**
 * Upload base64 image ke Fal AI storage dan dapatkan URL publik
 * @param {string} base64Data - Base64 encoded image (data:image/...;base64,...)
 * @returns {Promise<string>} - URL publik gambar
 */
async function uploadToFalStorage(base64Data) {
  // Konversi base64 ke Buffer
  const base64Str = base64Data.split(",")[1] || base64Data;
  const mimeMatch = base64Data.match(/^data:(image\/\w+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/png";

  const buffer = Buffer.from(base64Str, "base64");

  // Buat Blob dari buffer
  const blob = new Blob([buffer], { type: mimeType });

  // Upload ke Fal AI storage
  const url = await fal.storage.upload(blob, {
    lifecycle: { expiresIn: 3600 }, // 1 jam
  });

  return url;
}

/**
 * Generate gambar menggunakan Fal AI Seedream model
 * @param {string} imageBase64 - Base64 encoded image
 * @param {string} prompt - Prompt untuk AI
 * @param {number} strength - Seberapa kuat perubahan (0-1)
 * @returns {Promise<string>} - URL hasil generate
 */
export async function generateWithSeedream(imageBase64, prompt, strength = 0.85) {
  try {
    // Upload gambar ke storage untuk dapat URL publik
    const imageUrl = await uploadToFalStorage(imageBase64);

    const result = await fal.subscribe("fal-ai/bytedance/seedream/v5/lite/edit", {
      input: {
        image_urls: [imageUrl],
        prompt: prompt,
        strength: strength,
        image_size: "square",
        num_images: 1,
      },
      logs: true,
      onQueueUpdate(update) {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    return result.data.images[0].url;
  } catch (error) {
    console.error("Fal AI Error:", error);
    throw new Error("Gagal memproses gambar: " + error.message);
  }
}

/**
 * Generate menggunakan custom style reference image
 * @param {string} imageBase64 - Base64 encoded foto wajah
 * @param {string} styleImageBase64 - Base64 encoded gambar referensi style
 * @param {string} prompt - Prompt tambahan
 * @param {number} strength - Seberapa kuat perubahan
 * @returns {Promise<string>} - URL hasil generate
 */
export async function generateWithStyleReference(
  imageBase64,
  styleImageBase64,
  prompt = "Transform this portrait to match the style of the reference image",
  strength = 0.85
) {
  try {
    // Upload kedua gambar ke storage
    const imageUrl = await uploadToFalStorage(imageBase64);
    const styleUrl = await uploadToFalStorage(styleImageBase64);

    const result = await fal.subscribe("fal-ai/bytedance/seedream/v5/lite/edit", {
      input: {
        image_urls: [imageUrl, styleUrl],
        prompt: prompt,
        strength: strength,
        image_size: "square",
        num_images: 1,
      },
      logs: true,
      onQueueUpdate(update) {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    return result.data.images[0].url;
  } catch (error) {
    console.error("Fal AI Error:", error);
    throw new Error("Gagal memproses gambar: " + error.message);
  }
}
