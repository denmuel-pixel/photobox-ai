"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { TEMPLATES } from "@/lib/templates";
import ImageUploader from "@/components/ImageUploader";

export default function TemplateGallery({ onSelectTemplate, selectedTemplate, onUploadStyle, styleImage, hasPhoto = false }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [ready, setReady] = useState(false);
  const showStyleUpload = selectedTemplate?.id === "upload-style";
  const gridRef = useRef(null);
  const playedRef = useRef(false);

  useEffect(() => {
    const el = gridRef.current;
    const cards = el?.querySelectorAll(".template-card");
    if (!cards || !cards.length) return;

    // Wait until section is visible in viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !playedRef.current) {
          playedRef.current = true;
          observer.disconnect();
          startDeckAnim(cards, el, () => setReady(true));
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function startDeckAnim(cards, container, onDone) {
    // Stack all cards at grid center via transforms
    const rect = container.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    cards.forEach((card) => {
      const r = card.getBoundingClientRect();
      const dx = r.left - rect.left + r.width / 2 - cx;
      const dy = r.top - rect.top + r.height / 2 - cy;
      gsap.set(card, { x: -dx, y: -dy, scale: 0.85, opacity: 0, transformPerspective: 600 });
    });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(cards, { x: 0, y: 0, scale: 1, opacity: 1, clearProps: "transform" });
        onDone();
      },
    });

    // Deck arrival
    tl.to(cards, { opacity: 1, scale: 1, duration: 0.2, ease: "power2.out", stagger: 0.02 })
      .to(cards, { scale: 0.99, duration: 0.04, ease: "power2.in" })
      .to(cards, { scale: 1, duration: 0.05, ease: "power2.out" })
      .to({}, { duration: 0.15 });

    // Spread each card to its natural position
    cards.forEach((card) => {
      tl.to(card, { x: 0, y: 0, scale: 1.03, duration: 0.06, ease: "power1.out" })
        .to(card, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.2, ease: "power3.out" });
    });

    // Micro settle
    tl.to(cards, { scale: 0.993, duration: 0.03, ease: "power2.in" })
      .to(cards, { scale: 1, duration: 0.04, ease: "power2.out" });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium text-muted">Pilih Gaya AI</p>

      <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {TEMPLATES.map((template, index) => (
          <button
            key={template.id}
            className={`template-card relative group rounded-xl overflow-hidden border transition-all ${
              selectedTemplate?.id === template.id
                ? "border-primary ring-2 ring-primary/30"
                : "border-border hover:border-primary/50"
            } ${ready ? "opacity-100" : ""} ${!hasPhoto ? "cursor-not-allowed opacity-60 pointer-events-none" : "cursor-pointer"}`}
            onClick={() => hasPhoto && onSelectTemplate(template)}
            onMouseEnter={() => hasPhoto && setHoveredId(template.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{ opacity: ready ? 1 : 0 }}
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
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground truncate">{template.icon} {template.name}</p>
                {template.isTrending && <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">🔥 Tren</span>}
              </div>
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

      {showStyleUpload && (
        <div className="space-y-2">
          <p className="text-xs text-muted">Upload gambar referensi — AI akan mengikuti gaya dari gambar ini</p>
          <div className="bg-card border border-border rounded-xl">
            <ImageUploader label="🎨 Upload Gambar Referensi" icon="🎨" onImageSelected={(base64) => onUploadStyle?.(base64)} />
          </div>
          {styleImage && <p className="text-xs text-green-500 flex items-center gap-1">✓ Gambar referensi siap</p>}
        </div>
      )}
    </div>
  );
}
