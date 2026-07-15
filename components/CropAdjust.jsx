"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";

export default function CropAdjust({ imageSrc, onCropComplete, onCancel, isVisible }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [aspect, setAspect] = useState(1 / 1); // square default
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((location) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((z) => {
    setZoom(z);
  }, []);

  const onRotationChange = useCallback((r) => {
    setRotation(r);
  }, []);

  const onCropAreaComplete = useCallback((croppedArea, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const aspectOptions = [
    { label: "🗂 1:1", value: 1 / 1 },
    { label: "📱 4:5", value: 4 / 5 },
    { label: "🖼 16:9", value: 16 / 9 },
    { label: "📐 3:4", value: 3 / 4 },
    { label: "🆓 Bebas", value: undefined },
  ];

  const createCroppedImage = useCallback(async () => {
    setIsProcessing(true);

    try {
      // Jika crop area belum siap, gunakan gambar asli tanpa crop
      if (!croppedAreaPixels) {
        onCropComplete(imageSrc);
        return;
      }

      const image = new Image();
      image.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = imageSrc;
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const { width, height, x, y } = croppedAreaPixels;
      canvas.width = width;
      canvas.height = height;

      // Apply rotation if any
      if (rotation !== 0) {
        // Rotasi: width/height swap
        const rad = (rotation * Math.PI) / 180;
        const cos = Math.abs(Math.cos(rad));
        const sin = Math.abs(Math.sin(rad));
        const w = Math.floor(width * cos + height * sin);
        const h = Math.floor(width * sin + height * cos);
        canvas.width = w;
        canvas.height = h;
        ctx.translate(w / 2, h / 2);
        ctx.rotate(rad);
        ctx.drawImage(image, -width / 2, -height / 2, width, height);
      } else {
        ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
      }

      const croppedBase64 = canvas.toDataURL("image/jpeg", 0.95);
      setIsProcessing(false);
      onCropComplete(croppedBase64);
    } catch (err) {
      console.error("Crop error:", err);
      setIsProcessing(false);
      // Fallback: kirim gambar asli
      onCropComplete(imageSrc);
    }
  }, [croppedAreaPixels, imageSrc, rotation, onCropComplete]);

  if (!isVisible || !imageSrc) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-card border border-border rounded-2xl overflow-hidden w-full max-w-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">✂️ Crop & Adjust Foto</h3>
          <button
            onClick={onCancel}
            className="text-muted hover:text-foreground transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative w-full h-[350px] sm:h-[420px] bg-[#1a1a2e]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onRotationChange={onRotationChange}
            onCropComplete={onCropAreaComplete}
            cropShape="rect"
            showGrid={true}
            classes={{
              containerClassName: "cropper-container",
              mediaClassName: "cropper-media",
              cropAreaClassName: "cropper-crop-area",
            }}
          />
        </div>

        {/* Controls */}
        <div className="px-5 py-4 space-y-4">
          {/* Aspect Ratio */}
          <div>
            <p className="text-xs text-muted mb-2">Rasio</p>
            <div className="flex flex-wrap gap-2">
              {aspectOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setAspect(opt.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    aspect === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted hover:border-primary/50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted">Zoom</p>
              <span className="text-xs text-muted/60">{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => onZoomChange(parseFloat(e.target.value))}
              className="w-full accent-primary h-1.5 rounded-full appearance-none bg-border cursor-pointer"
            />
          </div>

          {/* Rotation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted">Rotasi</p>
              <span className="text-xs text-muted/60">{rotation}°</span>
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={rotation}
              onChange={(e) => onRotationChange(parseInt(e.target.value))}
              className="w-full accent-primary h-1.5 rounded-full appearance-none bg-border cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-border text-muted hover:text-foreground hover:bg-card-hover transition-all text-sm font-medium"
            >
              Batal
            </button>
            <button
              onClick={createCroppedImage}
              disabled={isProcessing}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isProcessing
                  ? "bg-border text-muted cursor-not-allowed"
                  : "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
              }`}
            >
              {isProcessing ? "⏳ Memotong..." : "✂️ Terapkan"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
