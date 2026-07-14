"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";

export default function FaceDetection({ imageSrc, onFacesDetected, isVisible }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const faceapiRef = useRef(null);
  const [faces, setFaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [error, setError] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  // Load models once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import("face-api.js");
        if (!mounted) return;
        faceapiRef.current = mod;
        await mod.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await mod.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        if (mounted) setModelLoaded(true);
      } catch (err) {
        console.error("Model load error:", err);
        if (mounted) setError("Gagal memuat model: " + err.message);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Detect faces
  useEffect(() => {
    const faceapi = faceapiRef.current;
    if (!modelLoaded || !imageSrc || !isVisible || !faceapi) return;

    setIsLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        const img = imageRef.current;
        if (!img) return;
        if (!img.complete || !img.naturalWidth) {
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
        }

        const detections = await faceapi
          .detectAllFaces(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
          .withFaceLandmarks();

        const mapped = detections.map((d) => ({
          box: {
            x: d.detection.box.x,
            y: d.detection.box.y,
            width: d.detection.box.width,
            height: d.detection.box.height,
          },
          confidence: d.detection.score,
        }));

        setFaces(mapped);
        setFaceCount(mapped.length);
        onFacesDetected?.({ count: mapped.length });
      } catch (err) {
        console.error("Detection error:", err);
        setError("Gagal mendeteksi wajah: " + err.message);
      } finally {
        setIsLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [modelLoaded, imageSrc, isVisible, onFacesDetected]);

  // Canvas drawing
  useEffect(() => {
    const faceapi = faceapiRef.current;
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !faceapi || faces.length === 0) return;

    const displaySize = {
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
    };
    faceapi.matchDimensions(canvas, displaySize);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < faces.length; i++) {
      const f = faces[i];
      const r = faceapi.resizeResults({ detection: { box: f.box } }, displaySize);
      ctx.strokeStyle = "#8b5cf6";
      ctx.lineWidth = 2;
      ctx.strokeRect(r.detection.box.x, r.detection.box.y, r.detection.box.width, r.detection.box.height);

      ctx.fillStyle = "#8b5cf6";
      ctx.font = "11px system-ui, sans-serif";
      const label = `Wajah ${i + 1}`;
      const tw = ctx.measureText(label).width + 10;
      ctx.fillRect(r.detection.box.x, r.detection.box.y - 20, tw, 18);
      ctx.fillStyle = "#fff";
      ctx.fillText(label, r.detection.box.x + 5, r.detection.box.y - 6);
    }
  }, [faces]);

  if (!isVisible || !imageSrc) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="bg-card border border-border rounded-xl p-4 mt-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">🎯 Deteksi Wajah</h3>
          {isLoading && (
            <span className="text-xs text-primary flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Menganalisis...
            </span>
          )}
          {!isLoading && faceCount > 0 && (
            <span className="text-xs text-muted">{faceCount} wajah terdeteksi</span>
          )}
        </div>

        <div className="relative rounded-lg overflow-hidden bg-background">
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Upload"
            className="w-full h-auto max-h-[300px] object-contain"
            crossOrigin="anonymous"
          />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        </div>

        {faceCount > 0 && !isLoading && (
          <p className="text-xs text-muted mt-2">✓ {faceCount} wajah terdeteksi</p>
        )}

        {error && <p className="text-xs text-error mt-2">{error}</p>}
        {!isLoading && faceCount === 0 && modelLoaded && (
          <p className="text-xs text-muted mt-2">Tidak ada wajah terdeteksi. Coba upload foto lain.</p>
        )}
      </div>
    </motion.div>
  );
}
