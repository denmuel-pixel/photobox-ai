"use client";

import { useState } from "react";
import { TEMPLATES } from "@/lib/templates";

export default function TemplateGallery({ onSelectTemplate, selectedTemplate, hasPhoto = false }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium text-muted">Pilih Gaya AI</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            className={`template-card relative group rounded-xl overflow-hidden border transition-all ${
              selectedTemplate?.id === template.id
                ? "border-primary ring-2 ring-primary/30"
                : "border-border hover:border-primary/50"
            } ${!hasPhoto ? "cursor-not-allowed opacity-60 pointer-events-none" : "cursor-pointer"}`}
            onClick={() => hasPhoto && onSelectTemplate(template)}
            onMouseEnter={() => hasPhoto && setHoveredId(template.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="aspect-square overflow-hidden bg-card">
              <img src={template.exampleImage} alt={template.name}
                className={`w-full h-full transition-all duration-500 ${
                  template.id === "superhero" ? "object-cover object-top" : "object-cover object-center"
                } ${hoveredId === template.id ? "scale-110" : "scale-100"}`}
                loading="lazy"
              />
              <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${
                hoveredId === template.id ? "opacity-100" : "opacity-0"
              }`}>
                <span className="text-white text-sm font-medium bg-primary px-4 py-1.5 rounded-lg">Pakai Template</span>
              </div>
            </div>
            <div className="p-2.5 text-left">
              <p className="text-sm font-medium text-foreground leading-tight line-clamp-2 mb-1">{template.name}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-muted truncate">{template.description}</p>
                <span className="text-[9px] text-muted/60 ml-1 flex-shrink-0">
                  {template.usageCount >= 1000 ? `${(template.usageCount / 1000).toFixed(1)}k` : template.usageCount}
                </span>
              </div>
            </div>
            {selectedTemplate?.id === template.id && (
              <div className="absolute top-1.5 right-1.5 bg-primary text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">✓</div>
            )}
          </button>
        ))}
      </div>

      {!hasPhoto && (
        <p className="text-[11px] text-muted/60 text-center mt-1">📸 Upload foto terlebih dahulu untuk memilih gaya</p>
      )}
    </div>
  );
}
