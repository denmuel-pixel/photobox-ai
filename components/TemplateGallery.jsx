"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TEMPLATES } from "@/lib/templates";

export default function TemplateGallery({ onSelectTemplate, selectedTemplate }) {
  const [mode, setMode] = useState("template"); // "template" | "custom"
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted">Pilih Gaya AI</p>
        <div className="flex gap-1 bg-card rounded-lg p-1">
          <button
            onClick={() => setMode("template")}
            className={`px-3 py-1.5 text-xs rounded-md transition-all ${
              mode === "template"
                ? "bg-primary text-white shadow-lg shadow-primary/30"
                : "text-muted hover:text-foreground"
            }`}
          >
            Template
          </button>
          <button
            onClick={() => setMode("custom")}
            className={`px-3 py-1.5 text-xs rounded-md transition-all ${
              mode === "custom"
                ? "bg-primary text-white shadow-lg shadow-primary/30"
                : "text-muted hover:text-foreground"
            }`}
          >
            Upload Style
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === "template" ? (
          <motion.div
            key="templates"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TEMPLATES.map((template, index) => (
                <motion.button
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelectTemplate(template)}
                  onMouseEnter={() => setHoveredId(template.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`relative group rounded-xl overflow-hidden border transition-all ${
                    selectedTemplate?.id === template.id
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-primary/50"
                  }`}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* Example image */}
                  <div className="aspect-square overflow-hidden bg-card">
                    <img
                      src={template.exampleImage}
                      alt={template.name}
                      className={`w-full h-full object-cover transition-all duration-500 ${
                        hoveredId === template.id ? "scale-110" : "scale-100"
                      }`}
                      loading="lazy"
                    />
                    {/* Hover overlay - "Pakai" button */}
                    <div
                      className={`absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${
                        hoveredId === template.id ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <span className="text-white text-sm font-medium bg-primary px-4 py-1.5 rounded-lg">
                        Pakai Template
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-2.5 text-left">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground truncate">
                        {template.icon} {template.name}
                      </p>
                      {template.isTrending && (
                        <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          🔥 Tren
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-muted truncate">
                        {template.description}
                      </p>
                      <span className="text-[9px] text-muted/60 ml-1 flex-shrink-0">
                        {template.usageCount >= 1000
                          ? `${(template.usageCount / 1000).toFixed(1)}k`
                          : template.usageCount}
                      </span>
                    </div>
                  </div>

                  {/* Selected badge */}
                  {selectedTemplate?.id === template.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1.5 right-1.5 bg-primary text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                    >
                      ✓
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="custom"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-card border border-border rounded-xl p-6 text-center"
          >
            <p className="text-muted text-sm">
              Upload gambar referensi style di bawah untuk custom style
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
