"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";

export default function CompareSlider({ beforeImage, afterImage, beforeLabel = "Asli", afterLabel = "Hasil AI" }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState(false);
  const containerRef = useRef(null);
  const afterRef = useRef(null);
  const beforeRef = useRef(null);

  const handleImageLoad = useCallback(() => {
    // Trigger re-render after images load
  }, []);

  const handleMove = useCallback(
    (clientX) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percent = (x / rect.width) * 100;
      setSliderPos(percent);
    },
    []
  );

  const handleMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(true);
      handleMove(e.clientX);
    },
    [handleMove]
  );

  const handleTouchStart = useCallback(
    (e) => {
      setIsDragging(true);
      handleMove(e.touches[0].clientX);
    },
    [handleMove]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => handleMove(e.clientX);
    const handleTouchMove = (e) => handleMove(e.touches[0].clientX);
    const handleEnd = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, handleMove]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted">Hasil Generate</p>
        <div className="flex gap-4 text-xs text-muted">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary/80" />
            {beforeLabel}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-secondary/80" />
            {afterLabel}
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="comparison-slider relative mx-auto bg-card rounded-2xl overflow-hidden cursor-ew-resize border border-border select-none"
        style={{ maxWidth: "min(500px, 100%)" }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="relative w-full">
          {/* After image - ditampilkan penuh sebagai background */}
          {imageError ? (
            <div className="w-full aspect-square flex flex-col items-center justify-center bg-card text-muted gap-2 p-4">
              <span className="text-2xl">😕</span>
              <p className="text-sm text-center">Gambar gagal dimuat. Coba generate ulang.</p>
            </div>
          ) : (
            <img
              ref={afterRef}
              src={afterImage}
              alt={afterLabel}
              className="w-full h-auto block"
              draggable={false}
              onLoad={handleImageLoad}
              onError={() => setImageError(true)}
            />
          )}

          {/* Before image - overlay dengan clip */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              ref={beforeRef}
              src={beforeImage}
              alt={beforeLabel}
              className="block"
              draggable={false}
              style={{
                width: `${100 / (sliderPos / 100)}%`,
                maxWidth: `${100 / (sliderPos / 100)}%`,
                height: "auto",
              }}
              onLoad={handleImageLoad}
              onError={() => setImageError(true)}
            />
          </div>

          {/* Slider handle */}
          <div
            className="absolute top-0 bottom-0 z-10 flex items-center justify-center"
            style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
          >
            {/* Garis vertikal */}
            <div className="w-0.5 h-full bg-white/80 shadow-lg" />
            {/* Tombol handle */}
            <div className="absolute w-10 h-10 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center text-white text-lg shadow-lg border-2 border-white/50 hover:bg-primary transition-colors">
              ⟷
            </div>
          </div>

          {/* Labels */}
          <div
            className="absolute bottom-3 left-3 z-20 pointer-events-none"
            style={{ opacity: sliderPos > 15 ? 1 : 0, transition: "opacity 0.2s" }}
          >
            <span className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
              {beforeLabel}
            </span>
          </div>
          <div
            className="absolute bottom-3 right-3 z-20 pointer-events-none"
            style={{ opacity: sliderPos < 85 ? 1 : 0, transition: "opacity 0.2s" }}
          >
            <span className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
              {afterLabel}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
