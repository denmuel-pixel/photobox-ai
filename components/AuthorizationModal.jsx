"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthorizationModal({ isOpen, onClose, onAuthorized }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setCode("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Masukkan kode otorisasi");
      return;
    }

    setIsChecking(true);
    setError("");

    try {
      const res = await fetch("/api/validate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });

      const data = await res.json();

      if (data.valid) {
        onAuthorized();
      } else {
        setError(data.error || "Kode tidak valid");
      }
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-card border border-border rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl shadow-primary/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="text-center mb-4">
                <span className="text-4xl">🔐</span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-center mb-1">
                Masukkan Kode Otorisasi
              </h2>
              <p className="text-sm text-muted text-center mb-6">
                Masukkan kode yang kamu dapatkan untuk melanjutkan
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setError("");
                    }}
                    placeholder="Contoh: ABCDE-12345"
                    maxLength={20}
                    disabled={isChecking}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-center text-lg font-mono tracking-widest placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50 uppercase"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-error text-sm mt-2 text-center"
                    >
                      {error}
                    </motion.p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isChecking}
                    className="flex-1 px-4 py-3 bg-card border border-border text-foreground rounded-xl font-medium hover:bg-card-hover transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isChecking || !code.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isChecking ? (
                      <><span className="animate-spin">⏳</span> Memeriksa...</>
                    ) : (
                      <>✅ Verifikasi</>
                    )}
                  </button>
                </div>
              </form>

              <p className="text-xs text-muted text-center mt-4">
                Belum punya kode? Hubungi admin untuk mendapatkannya
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
