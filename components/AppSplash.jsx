"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AppSplash({ children }) {
  const [showSplash, setShowSplash] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Cek localStorage: sudah pernah lihat splash?
    const hasSeen = localStorage.getItem("photobox_hasSeenSplash");
    if (hasSeen) {
      setShowSplash(false);
      setReady(true);
      return;
    }

    // Tampilkan splash selama 2.5 detik
    const timer = setTimeout(() => {
      setShowSplash(false);
      localStorage.setItem("photobox_hasSeenSplash", "true");
      // Beri waktu fade out sebelum konten muncul
      setTimeout(() => setReady(true), 400);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          >
            {/* Logo Area */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center gap-4"
            >
              {/* Icon */}
              <motion.div
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl shadow-primary/30"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-3xl">🎨</span>
              </motion.div>

              {/* Title */}
              <motion.h1
                className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                Photobox AI
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-sm text-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                Ubah fotomu dengan kecerdasan buatan
              </motion.p>
            </motion.div>

            {/* Loading Dots */}
            <motion.div
              className="absolute bottom-12 flex gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary/60"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Konten Utama — muncul setelah splash hilang */}
      {ready && children}
    </>
  );
}
