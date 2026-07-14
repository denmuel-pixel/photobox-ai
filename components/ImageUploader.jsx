"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageUploader({ onImageSelected, label, icon = "📸" }) {
  const [preview, setPreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const inputRef = useRef(null);

  const handleFile = useCallback(
    (file) => {
      if (!file) return;

      // Validasi tipe file
      if (!file.type.startsWith("image/")) {
        alert("Harap upload file gambar (JPG, PNG, WebP)");
        return;
      }

      // Validasi ukuran (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Ukuran file maksimal 10MB");
        return;
      }

      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        setPreview(result);
        onImageSelected(result, file);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelected]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    setFileName("");
    onImageSelected(null, null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-muted">{label}</p>

      <motion.div
        className={`drop-zone relative flex flex-col items-center justify-center p-8 min-h-[200px] ${
          isDragOver ? "active" : ""
        } ${preview ? "p-4" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative w-full"
            >
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-[250px] object-contain rounded-xl"
              />
              <button
                onClick={handleRemove}
                className="absolute -top-2 -right-2 bg-error text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg"
              >
                ✕
              </button>
              {fileName && (
                <p className="text-xs text-muted mt-2 text-center truncate">
                  {fileName}
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 text-center"
            >
              <span className="text-4xl">{icon}</span>
              <p className="text-muted text-sm">
                Seret gambar ke sini atau{" "}
                <span className="text-primary font-medium">klik untuk unggah</span>
              </p>
              <p className="text-xs text-muted/60">JPG, PNG, WebP • Maks 10MB</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
