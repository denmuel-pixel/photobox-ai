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

const ENDPOINT_ID = "fal-ai/bytedance/seedream/v5/lite/edit";

/**
 * Step 1: Submit job ke Fal AI queue, return requestId
 * @returns {Promise<string>} - requestId
 */
export async function submitSeedreamJob(imageBase64, prompt, strength = 0.85) {
  const imageUrl = await uploadToFalStorage(imageBase64);

  const { request_id } = await fal.queue.submit(ENDPOINT_ID, {
    input: {
      image_urls: [imageUrl],
      prompt,
      strength,
      image_size: "square",
      num_images: 1,
      enable_safety_checker: false,
    },
  });

  return request_id;
}

/**
 * Step 2: Cek status job Fal AI
 * @returns {Promise<{status: string, requestId: string}>}
 */
export async function checkJobStatus(requestId) {
  const status = await fal.queue.status(ENDPOINT_ID, { requestId });
  return { status: status.status, requestId };
}

/**
 * Step 3: Ambil hasil job setelah COMPLETED
 * @returns {Promise<string>} - URL hasil generate
 */
export async function getJobResult(requestId) {
  const { data } = await fal.queue.result(ENDPOINT_ID, { requestId });
  return data.images[0].url;
}

/**
 * Generate menggunakan custom style reference image
 * Seedream hanya support 1 image dalam image_urls array.
 * Style reference tidak bisa dikirim sebagai image kedua,
 * jadi gunakan prompt yang mendeskripsikan gaya yang diinginkan.
 * @param {string} imageBase64 - Base64 encoded foto wajah
 * @param {string|null} styleImageBase64 - (tidak dipakai, disimpan untuk kompatibilitas)
 * @param {string} prompt - Prompt untuk transformasi
 * @param {number} strength - Seberapa kuat perubahan
 * @returns {Promise<string>} - URL hasil generate
 */
export async function generateWithStyleReference(
  imageBase64,
  styleImageBase64,
  prompt = "Transform this portrait with a beautiful artistic style, vibrant colors, and creative aesthetic",
  strength = 0.85
) {
  try {
    let imageUrl;

    if (styleImageBase64) {
      // Gabung foto wajah + style reference jadi 1 gambar (side by side)
      const combinedBase64 = await combineImagesSideBySide(imageBase64, styleImageBase64);
      imageUrl = await uploadToFalStorage(combinedBase64);

      // Update prompt untuk menjelaskan layout composite
      const compositePrompt = `The left half of this image is the person's original photo. The right half is the style reference. Apply the artistic style, colors, textures, and aesthetic from the right half (style reference) to transform the person on the left half. Keep the person's facial identity recognizable but change their appearance to match the style. Make the result look like a seamless styled portrait. ${prompt}`;

      const result = await fal.subscribe("openai/gpt-image-2/edit", {
        input: {
          image_urls: [imageUrl],
          prompt: compositePrompt,
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

      const resultUrl = result.data.images[0].url;
      return resultUrl;
    }

    // Fallback: tanpa style reference
    imageUrl = await uploadToFalStorage(imageBase64);

    const result = await fal.subscribe("openai/gpt-image-2/edit", {
      input: {
        image_urls: [imageUrl],
        prompt: prompt,
        strength: strength,
        image_size: "square",
        num_images: 1,
        enable_safety_checker: false,
      },
      logs: true,
      onQueueUpdate(update) {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    const resultUrl = result.data.images[0].url;
    return resultUrl;
  } catch (error) {
    console.error("Fal AI Error:", error);
    let detail = "Unknown error";
    try {
      detail =
        (typeof error?.body?.detail === "string"
          ? error.body.detail
          : JSON.stringify(error?.body?.detail)) ||
        (typeof error?.body?.error === "string"
          ? error.body.error
          : JSON.stringify(error?.body?.error)) ||
        error?.message ||
        JSON.stringify(error).slice(0, 200);
    } catch {
      detail = error?.message || "Unknown error";
    }
    if (detail.includes("content_policy") || detail.includes("partner_validation")) {
      throw new Error("Coba upload foto yang berbeda");
    }
    throw new Error("Gagal memproses gambar, coba lagi");
  }
}

/**
 * Gabung 2 base64 image jadi 1 gambar side-by-side menggunakan sharp
 */
async function combineImagesSideBySide(leftBase64, rightBase64) {
  try {
    const sharp = require("sharp");

    const toBuffer = (b64) => {
      const raw = b64.split(",")[1] || b64;
      return Buffer.from(raw, "base64");
    };

    const leftBuf = toBuffer(leftBase64);
    const rightBuf = toBuffer(rightBase64);

    const size = 512;

    // Resize & crop center both images to square 512x512, force RGB (3 channels)
    const leftResized = await sharp(leftBuf)
      .resize(size, size, { fit: "cover", position: "center" })
      .ensureAlpha() // handle RGBA safely
      .toColorspace("srgb")
      .jpeg()
      .toBuffer();

    const rightResized = await sharp(rightBuf)
      .resize(size, size, { fit: "cover", position: "center" })
      .ensureAlpha()
      .toColorspace("srgb")
      .jpeg()
      .toBuffer();

    // Gabung side by side
    const composite = await sharp({
      create: {
        width: size * 2,
        height: size,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 },
      },
    })
      .composite([
        { input: leftResized, top: 0, left: 0 },
        { input: rightResized, top: 0, left: size },
      ])
      .jpeg({ quality: 90 })
      .toBuffer();

    return `data:image/jpeg;base64,${composite.toString("base64")}`;
  } catch (err) {
    console.error("Combine images error:", err);
    // Fallback: return face photo only without composite
    return leftBase64;
  }
}
