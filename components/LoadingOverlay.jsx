"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

const TEMPLATE_COLORS = {
  enhance: { primary: "#06b6d4", secondary: "#22d3ee", label: "Enhance Photo" },
  anime: { primary: "#ec4899", secondary: "#f472b6", label: "Anime Style" },
  "fantasy-elf": { primary: "#f59e0b", secondary: "#fbbf24", label: "Princess Royal" },
  superhero: { primary: "#ef4444", secondary: "#3b82f6", label: "Superhero" },
  gundam: { primary: "#22c55e", secondary: "#3b82f6", label: "The Mecha Pilot" },
  pixar: { primary: "#f59e0b", secondary: "#ef4444", label: "PIXAR Studio" },
};

const STATUS_PHASES = [
  { range: [0, 15], icon: "🧠", text: "Mempersiapkan neural engine..." },
  { range: [15, 35], icon: "👁", text: "Menganalisis wajah & pose..." },
  { range: [35, 60], icon: "🎨", text: "Menerapkan gaya {template}..." },
  { range: [60, 82], icon: "✨", text: "Menyempurnakan detail..." },
  { range: [82, 95], icon: "📦", text: "Mengemas hasil akhir..." },
  { range: [95, 100], icon: "⏳", text: "Hampir selesai..." },
];

function getPhase(progress) {
  return STATUS_PHASES.find(
    (p) => progress >= p.range[0] && progress < p.range[1]
  ) || STATUS_PHASES[STATUS_PHASES.length - 1];
}

function getStatusText(progress, templateLabel) {
  const phase = getPhase(progress);
  return phase.text.replace("{template}", templateLabel);
}

export default function LoadingOverlay({
  isVisible,
  photoSrc,
  templateId,
}) {
  const [progress, setProgress] = useState(0);
  const [phaseKey, setPhaseKey] = useState(0);

  const colors = TEMPLATE_COLORS[templateId] || TEMPLATE_COLORS.enhance;
  const templateLabel = colors.label;

  // Play sparks sound when loading starts
  useEffect(() => {
    if (isVisible) {
      const audio = new Audio("/sounds/sparks.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
  }, [isVisible]);

  // Reset & animate progress
  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      return;
    }
    setProgress(0);
    const duration = 22000;
    const interval = 80;
    const step = 100 / (duration / interval);
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step;
        if (next >= 100) { clearInterval(timer); return 100; }
        return next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [isVisible]);

  // Track phase changes for text animation
  const currentPhase = getPhase(progress);
  const statusText = getStatusText(progress, templateLabel);
  useEffect(() => {
    setPhaseKey((k) => k + 1);
  }, [currentPhase.range[0]]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md"
    >
      {/* Neural Circuit Background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, ${colors.primary} 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, ${colors.secondary} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", damping: 25 }}
        className="relative bg-card/90 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-5 shadow-2xl backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="text-lg"
          >
            ⚡
          </motion.span>
          <span className="text-xs font-semibold text-white/60 tracking-widest uppercase">
            Photobox AI Studio
          </span>
        </div>

        {/* ===== PHOTO AREA ===== */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
          {/* Orbit Ring 1 — outer */}
          <motion.div
            className="absolute inset-0 rounded-full border border-white/10"
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          >
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
              style={{ backgroundColor: colors.primary, boxShadow: `0 0 8px ${colors.primary}` }}
            />
          </motion.div>

          {/* Orbit Ring 2 — inner */}
          <motion.div
            className="absolute inset-3 rounded-full border border-white/5"
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full"
              style={{ backgroundColor: colors.secondary, boxShadow: `0 0 6px ${colors.secondary}` }}
            />
          </motion.div>

          {/* Photo */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-white/10">
            {photoSrc ? (
              <img
                src={photoSrc}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-card flex items-center justify-center">
                <span className="text-3xl">📸</span>
              </div>
            )}
            {/* Scan line overlay */}
            <motion.div
              className="absolute left-0 right-0 h-[2px]"
              style={{
                background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
                boxShadow: `0 0 10px ${colors.primary}`,
              }}
              animate={{ top: ["0%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Sparkle particles */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`spark-${i}`}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: colors.primary,
                boxShadow: `0 0 4px ${colors.primary}`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0],
                x: [0, (i - 1) * 40],
                y: [0, (i % 2 === 0 ? -1 : 1) * 35],
              }}
              transition={{
                duration: 1.5 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {/* ===== NEURAL PROGRESS BAR ===== */}
        <div className="w-full space-y-1.5">
          <div className="relative w-full h-3 rounded-full overflow-hidden bg-white/5">
            {/* Track dots */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.03) 6px, rgba(255,255,255,0.03) 8px)`,
              }}
            />
            {/* Progress fill */}
            <motion.div
              className="h-full rounded-full relative"
              style={{
                background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                boxShadow: `0 0 12px ${colors.primary}`,
                width: `${progress}%`,
              }}
              layout
              transition={{ ease: "linear" }}
            >
              {/* Flow dots */}
              <motion.div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            </motion.div>
          </div>
          <div className="flex justify-between text-[10px] text-white/30">
            <span>0%</span>
            <span>{Math.round(progress)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* ===== STATUS TEXT ===== */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`phase-${phaseKey}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2"
          >
            <span className="text-base">{currentPhase.icon}</span>
            <span className="text-sm text-white/80 font-medium">{statusText}</span>
          </motion.div>
        </AnimatePresence>

        {/* ===== TEMPLATE BADGE ===== */}
        <motion.div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full border"
          style={{
            borderColor: `${colors.primary}40`,
            backgroundColor: `${colors.primary}10`,
          }}
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: colors.primary }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span
            className="text-[11px] font-medium"
            style={{ color: colors.primary }}
          >
            {currentPhase.icon} {templateLabel}
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
