"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";

export default function FaceDetection({ imageSrc, onFacesDetected, isVisible }) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const faceapiRef = useRef(null);
  const [faces, setFaces] = useState([]);
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
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Detect faces
  useEffect(() => {
    const faceapi = faceapiRef.current;
    if (!modelLoaded || !imageSrc || !isVisible || !faceapi) return;

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
        onFacesDetected?.({ count: mapped.length });
      } catch (err) {
        console.error("Detection error:", err);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [modelLoaded, imageSrc, isVisible, onFacesDetected]);

  // Canvas drawing
  useEffect(() => {
    const faceapi = faceapiRef.current;
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !faceapi || faces.length === 0) return;

    const displaySize = { width: img.naturalWidth || img.width, height: img.naturalHeight || img.height };
    faceapi.matchDimensions(canvas, displaySize);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < faces.length; i++) {
      const r = faceapi.resizeResults({ detection: { box: faces[i].box } }, displaySize);
      ctx.strokeStyle = "#8b5cf6";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(r.detection.box.x, r.detection.box.y, r.detection.box.width, r.detection.box.height);

      ctx.fillStyle = "#8b5cf6";
      const label = `wajah ${i + 1}`;
      ctx.font = "bold 11px system-ui, sans-serif";
      const tw = ctx.measureText(label).width + 12;
      ctx.fillRect(r.detection.box.x, r.detection.box.y - 22, tw, 20);
      ctx.fillStyle = "#fff";
      ctx.fillText(label, r.detection.box.x + 6, r.detection.box.y - 7);
    }
  }, [faces]);

  if (!isVisible || !imageSrc || faces.length === 0) return null;

  return (
    <>
      {/* Hidden img untuk deteksi */}
      <img ref={imageRef} src={imageSrc} alt="" className="hidden" crossOrigin="anonymous" />
      {/* Canvas overlay */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-30" />
    </>
  );
}
