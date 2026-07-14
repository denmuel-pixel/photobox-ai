"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const loadingMessages = [
  "Menganalisis foto...",
  "AI sedang bekerja...",
  "Menerapkan gaya yang dipilih...",
  "Hampir selesai...",
  "Sentuhan akhir...",
];

export default function LoadingOverlay({ isVisible }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) =>
        prev < loadingMessages.length - 1 ? prev + 1 : prev
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center gap-6 shadow-2xl"
      >
        {/* AI Icon Animation */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-2 rounded-full bg-primary/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.2, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
          />
          <motion.span
            className="text-4xl relative z-10"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ✨
          </motion.span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-border rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            animate={{
              width: ["0%", "100%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Message */}
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-foreground text-sm text-center"
        >
          {loadingMessages[messageIndex]}
        </motion.p>

        <p className="text-xs text-muted text-center">
          Proses ini memakan waktu beberapa detik
        </p>
      </motion.div>
    </motion.div>
  );
}
