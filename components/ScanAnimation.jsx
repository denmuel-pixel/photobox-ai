"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const scanSteps = [
  { id: "upload", label: "Foto berhasil diupload", duration: 800 },
  { id: "face-detect", label: "Wajah terdeteksi", duration: 1200 },
  { id: "analyze", label: "Menganalisis fitur wajah", duration: 1500 },
  { id: "ready", label: "Siap digenerate!", duration: 500 },
];

export default function ScanAnimation({ isVisible, onComplete, imageSrc }) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [completed, setCompleted] = useState(false);
  const scanLineRef = useRef(null);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(-1);
      return;
    }

    let timeout;
    let step = 0;

    const runStep = () => {
      if (step < scanSteps.length) {
        setCurrentStep(step);
        timeout = setTimeout(() => {
          step++;
          runStep();
        }, scanSteps[step].duration);
      } else {
        setCompleted(true);
        onComplete?.();
      }
    };

    timeout = setTimeout(runStep, 300);
    return () => clearTimeout(timeout);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 rounded-2xl overflow-hidden pointer-events-none"
    >
      {/* Dark overlay tipis */}
      <div className="absolute inset-0 bg-black/5" />

      {/* Scan line — bergerak hanya saat belum selesai */}
      {!completed && (
        <motion.div
          ref={scanLineRef}
          className="absolute left-0 right-0 h-0.5 z-20"
          style={{
            background: "linear-gradient(90deg, transparent, #8b5cf6, #06b6d4, transparent)",
            boxShadow: "0 0 12px rgba(139, 92, 246, 0.5), 0 0 24px rgba(6, 182, 212, 0.3)",
          }}
          animate={{ top: ["-2%", "102%"] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Side scan bars — berhenti saat selesai */}
      {!completed && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-0.5 z-20 bg-gradient-to-b from-transparent via-primary/30 to-transparent"
            style={{ animation: "scanBar 2.5s linear infinite" }}
          />
          <div className="absolute right-0 top-0 bottom-0 w-0.5 z-20 bg-gradient-to-b from-transparent via-secondary/30 to-transparent"
            style={{ animation: "scanBar 2.5s linear infinite" }}
          />
        </>
      )}

      {/* Corner markers — tetap ada */}
      <div className="absolute top-2 left-2 z-20">
        <span className="w-3 h-3 border-t-2 border-l-2 border-primary/60 rounded-tl block" />
      </div>
      <div className="absolute top-2 right-2 z-20">
        <span className="w-3 h-3 border-t-2 border-r-2 border-secondary/60 rounded-tr block" />
      </div>
      <div className="absolute bottom-2 left-2 z-20">
        <span className="w-3 h-3 border-b-2 border-l-2 border-primary/60 rounded-bl block" />
      </div>
      <div className="absolute bottom-2 right-2 z-20">
        <span className="w-3 h-3 border-b-2 border-r-2 border-secondary/60 rounded-br block" />
      </div>

      {/* Status text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={completed ? "done" : currentStep >= 0 ? scanSteps[currentStep]?.id : "waiting"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20"
        >
          <span className={`inline-flex items-center gap-2 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full ${
            completed ? "bg-green-600/70" : "bg-black/60"
          }`}>
            {completed ? (
              <><span className="text-green-300">✓</span> Wajah terdeteksi</>
            ) : (
              <><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {currentStep >= 0 && currentStep < scanSteps.length
                ? scanSteps[currentStep].label
                : "Memproses..."}</>
            )}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Progress dots — hilang saat selesai */}
      {!completed && (
        <div className="absolute top-3 right-3 z-20 flex gap-1">
          {scanSteps.map((step, i) => (
            <motion.div
              key={step.id}
              className={`rounded-full transition-all ${i <= currentStep ? "bg-primary" : "bg-white/30"}`}
              animate={{ width: i <= currentStep ? 8 : 4, height: 4, opacity: i <= currentStep ? 1 : 0.4 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
