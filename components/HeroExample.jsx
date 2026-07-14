"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { HERO_EXAMPLE, STATS } from "@/lib/examples";

export default function HeroExample({ onTryNow }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  }, []);

  const handleStart = useCallback(
    (e) => {
      setIsDragging(true);
      const cx = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
      handleMove(cx);
    },
    [handleMove]
  );

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e) => handleMove("touches" in e ? e.touches[0].clientX : e.clientX);
    const onEnd = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [isDragging, handleMove]);

  return (
    <section className="relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 py-12 sm:py-16">
        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-2"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI Photo Studio
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3"
        >
          Hasilkan Foto AI Menakjubkan{" "}
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            dalam Sekejap
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-muted text-sm sm:text-base max-w-lg mx-auto mb-8"
        >
          Upload fotomu, pilih gaya AI favorit, dan biarkan AI mengubahnya jadi karya seni!
        </motion.p>

        {/* Before/After Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-md mx-auto mb-8"
        >
          <div
            ref={containerRef}
            className="relative rounded-2xl overflow-hidden cursor-ew-resize select-none border border-border shadow-2xl shadow-primary/10"
            onMouseDown={handleStart}
            onTouchStart={handleStart}
          >
            {/* After image (full) */}
            <div className="w-full" style={{ paddingBottom: "100%" }}>
              <img
                src={HERO_EXAMPLE.after}
                alt="Hasil AI"
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
            </div>

            {/* Before image (clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <div className="relative w-full h-full">
                <img
                  src={HERO_EXAMPLE.before}
                  alt="Foto Asli"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ width: `${100 / (sliderPos / 100)}%`, maxWidth: "none" }}
                  draggable={false}
                />
              </div>
            </div>

            {/* Slider handle */}
            <div
              className="absolute top-0 bottom-0 z-10 pointer-events-none"
              style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
            >
              <div className="h-full w-0.5 bg-white/90 shadow-lg" />
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-primary shadow-lg shadow-primary/40 flex items-center justify-center text-white text-sm border-2 border-white/60">
                ⟷
              </div>
            </div>

            {/* Labels */}
            <div
              className="absolute bottom-2 left-2 z-10 pointer-events-none"
              style={{ opacity: sliderPos > 15 ? 1 : 0, transition: "opacity 0.2s" }}
            >
              <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded">Asli</span>
            </div>
            <div
              className="absolute bottom-2 right-2 z-10 pointer-events-none"
              style={{ opacity: sliderPos < 85 ? 1 : 0, transition: "opacity 0.2s" }}
            >
              <span className="bg-primary/80 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded">AI</span>
            </div>
          </div>

          <p className="text-center text-xs text-muted mt-2">
            Geser untuk lihat perubahan — contoh: {HERO_EXAMPLE.label}
          </p>
        </motion.div>

        {/* Social Proof + CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.button
            onClick={onTryNow}
            className="px-8 py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold text-base shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ✨ COBA SEKARANG — GRATIS
          </motion.button>

          <div className="flex items-center gap-6 text-xs text-muted">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="font-semibold text-foreground">{STATS.totalGenerated.toLocaleString()}</span> foto tergenerate
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="font-semibold text-foreground">{STATS.activeUsers.toLocaleString()}</span> pengguna aktif
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
