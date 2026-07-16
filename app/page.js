"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ImageUploader from "@/components/ImageUploader";
import TemplateGallery from "@/components/TemplateGallery";
import CompareSlider from "@/components/CompareSlider";
import HeroExample from "@/components/HeroExample";
import ScanAnimation from "@/components/ScanAnimation";
import FaceDetection from "@/components/FaceDetection";
import LoadingOverlay from "@/components/LoadingOverlay";
import CropAdjust from "@/components/CropAdjust";
import AuthorizationModal from "@/components/AuthorizationModal";
import { useSound } from "@/lib/useSound";
import { STATS } from "@/lib/examples";
import { TEMPLATES, getRandomPrompt } from "@/lib/templates";

export default function Home() {
  const [photoBase64, setPhotoBase64] = useState(null);
  const [styleBase64, setStyleBase64] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScan, setShowScan] = useState(false);
  const [showFaceDetection, setShowFaceDetection] = useState(false);
  const [faceData, setFaceData] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const [rawPhotoBase64, setRawPhotoBase64] = useState(null);
  const [cropKey, setCropKey] = useState(0);
  const [uploadKey, setUploadKey] = useState(0);
  const [showShareToast, setShowShareToast] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const isAuthorizedRef = useRef(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const uploadSectionRef = useRef(null);
  const templateSectionRef = useRef(null);
  const generateRef = useRef(null);
  const { playClick, playScan, stopScan, playSparks } = useSound();
  const doneAudioRef = useRef(null);

  const handlePhotoSelected = useCallback((base64) => {
    setResultUrl(null);
    setError(null);
    setFaceData(null);
    if (base64) {
      // Simpan foto original dulu, lalu tampilkan crop tool
      setRawPhotoBase64(base64);
      setCropKey((k) => k + 1); // force remount CropAdjust
      setShowCrop(true);
      setShowScan(false);
      setShowFaceDetection(false);
      setPhotoBase64(null);
    } else {
      setRawPhotoBase64(null);
      setPhotoBase64(null);
      setShowCrop(false);
      setShowScan(false);
      setShowFaceDetection(false);
    }
  }, []);

  const handleCropComplete = useCallback((croppedBase64) => {
    setShowCrop(false);
    setRawPhotoBase64(null);
    setPhotoBase64(croppedBase64);
    // Setelah crop, lanjut ke scan & face detection
    setShowScan(true);
    setShowFaceDetection(false);
  }, []);

  const handleCropCancel = useCallback(() => {
    setShowCrop(false);
    setRawPhotoBase64(null);
    // Kembali ke kondisi awal biar user upload ulang
    setPhotoBase64(null);
  }, []);

  const handleScanComplete = useCallback(() => {
    // Scan selesai, tampilkan face detection
    setShowFaceDetection(true);
  }, []);

  const handleFacesDetected = useCallback((data) => {
    setFaceData(data);
    // Scroll ke template gallery agar user langsung pilih gaya
    setTimeout(() => {
      templateSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  }, []);

  const handleStyleSelected = useCallback((base64) => {
    setStyleBase64(base64);
    setResultUrl(null);
    setError(null);
  }, []);

  const handleSelectTemplate = useCallback((template) => {
    playClick();
    setSelectedTemplate(template);
    setStyleBase64(null);
    setResultUrl(null);
    setError(null);
    setTimeout(() => {
      generateRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }, [playClick]);

  const handleTryNow = useCallback(() => {
    playClick();
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [playClick]);

  const handleGenerate = async () => {
    if (!photoBase64) {
      setError("Upload foto terlebih dahulu");
      return;
    }
    if (!selectedTemplate) {
      setError("Pilih gaya AI terlebih dahulu");
      return;
    }
    if (selectedTemplate.id === "upload-style" && !styleBase64) {
      setError("Upload gambar referensi style terlebih dahulu");
      return;
    }

    // Cek otorisasi (pakai ref biar bisa dibaca synchronous)
    if (!isAuthorizedRef.current) {
      setShowAuthModal(true);
      return;
    }

    playClick();
    playSparks();
    // Buat Audio sekarang (masih dalam user gesture) biar nanti bisa diputer
    const doneAudio = new Audio("/sounds/done.mp3");
    doneAudio.volume = 0.5;
    doneAudio.play().catch(() => {}); // priming — biar browser approve source
    setIsLoading(true);
    setError(null);
    setResultUrl(null);

    try {
      let prompt, strength, mode;

      const faceCount = faceData?.count || 1;

      if (selectedTemplate?.id === "upload-style") {
        mode = "style-reference";
        prompt = selectedTemplate.prompts[0];
        strength = selectedTemplate.strength;
      } else {
        mode = "template";
        prompt = getRandomPrompt(selectedTemplate.id, faceCount);
        strength = selectedTemplate.strength;
      }

      stopScan();
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: photoBase64,
          prompt,
          strength,
          mode,
          styleImage: mode === "style-reference" ? styleBase64 : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal memproses gambar");
      doneAudio.play().catch(() => {}); // play done sound
      setResultUrl(data.resultUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    playClick();
    if (!resultUrl) return;
    try {
      const res = await fetch(resultUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `photobox-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      window.open(resultUrl, "_blank");
    }
  };

  const handleShare = async () => {
    playClick();
    if (!resultUrl) return;
    try {
      await navigator.clipboard.writeText(resultUrl);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleReset = () => {
    playClick();
    stopScan();
    setPhotoBase64(null);
    setRawPhotoBase64(null);
    setStyleBase64(null);
    setSelectedTemplate(null);
    setResultUrl(null);
    setError(null);
    setShowScan(false);
    setShowCrop(false);
    setUploadKey((k) => k + 1);
  };

  const handleAuthorized = () => {
    isAuthorizedRef.current = true;
    setIsAuthorized(true);
    setShowAuthModal(false);
    // Langsung generate — ref sudah terupdate sebelum panggil handleGenerate
    handleGenerate();
  };

  const isReady = selectedTemplate && (
    selectedTemplate.id !== "upload-style" ? true : styleBase64
  );

  return (
    <div className="min-h-screen bg-background">
      <LoadingOverlay
        isVisible={isLoading}
        photoSrc={photoBase64}
        templateId={selectedTemplate?.id}
      />

      {/* Authorization Modal */}
      <AuthorizationModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthorized={handleAuthorized}
      />

      {/* Share Toast */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-success text-white text-sm px-4 py-2 rounded-xl shadow-lg"
          >
            ✓ Link hasil disalin!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎨</span>
            <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Photobox AI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted hidden sm:block">
              Ubah fotomu dengan AI ✨
            </p>
            <a
              href="/admin"
              className="text-xs text-muted hover:text-primary transition-colors"
              title="Halaman Admin"
            >
              ⚙️ Admin
            </a>
          </div>
        </div>
      </header>

      {/* SECTION 1: HERO — Before/After Example */}
      <HeroExample onTryNow={handleTryNow} />

      {/* SECTION 2: MAIN WORKSPACE */}
      <section ref={uploadSectionRef} className="max-w-5xl mx-auto px-4 pb-8 scroll-mt-20">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
          {[
            { num: "1", label: "Upload Foto" },
            { num: "2", label: "Pilih Gaya" },
            { num: "3", label: "Generate" },
          ].map((step, i) => (
            <div key={step.num} className="flex items-center gap-2 sm:gap-4">
              <div className={`flex items-center gap-2 ${
                (i === 0 && photoBase64) || (i === 1 && selectedTemplate) || i === 2
                  ? "text-primary" : "text-muted"
              }`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  (i === 0 && photoBase64) || (i === 1 && selectedTemplate)
                    ? "border-primary bg-primary/10"
                    : "border-border"
                }`}>
                  {(i === 0 && photoBase64) || (i === 1 && selectedTemplate) ? "✓" : step.num}
                </div>
                <span className="text-xs hidden sm:inline font-medium">{step.label}</span>
              </div>
              {i < 2 && <div className="w-6 sm:w-12 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left: Upload */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="relative">
                <ImageUploader
                  key={uploadKey}
                  label="📸 Upload Foto Kamu"
                  icon="📸"
                  onImageSelected={handlePhotoSelected}
                />
                <ScanAnimation
                  isVisible={showScan}
                  onComplete={handleScanComplete}
                  imageSrc={photoBase64}
                  onPlay={playScan}
                  onStop={stopScan}
                />
                <FaceDetection
                  imageSrc={photoBase64}
                  isVisible={showFaceDetection}
                  onFacesDetected={handleFacesDetected}
                />
                <CropAdjust
                  key={cropKey}
                  imageSrc={rawPhotoBase64}
                  isVisible={showCrop}
                  onCropComplete={handleCropComplete}
                  onCancel={handleCropCancel}
                />
              </div>
            </div>
          </motion.div>

          {/* Right: Templates */}
          <motion.div
            ref={templateSectionRef}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-card border border-border rounded-2xl p-5 scroll-mt-24">
              <TemplateGallery
                onSelectTemplate={handleSelectTemplate}
                selectedTemplate={selectedTemplate}
                onUploadStyle={handleStyleSelected}
                styleImage={styleBase64}
                hasPhoto={!!photoBase64}
              />
            </div>
          </motion.div>
        </div>

        {/* Generate Button */}
        <motion.div
          ref={generateRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-4 mb-6"
        >
          <motion.button
            onClick={handleGenerate}
            disabled={!isReady || isLoading}
            className={`relative px-10 py-4 rounded-xl font-semibold text-base transition-all flex items-center gap-3 overflow-hidden ${
              isReady && !isLoading
                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
                : "bg-border text-muted cursor-not-allowed"
            }`}
            whileHover={isReady && !isLoading ? { scale: 1.05 } : {}}
            whileTap={isReady && !isLoading ? { scale: 0.95 } : {}}
          >
            {/* Pulsing glow */}
            {isReady && !isLoading && (
              <motion.div
                className="absolute inset-0 bg-white/10"
                animate={{ opacity: [0, 0.2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            {isLoading ? (
              <><span className="animate-spin">⏳</span> Memproses...</>
            ) : (
              <><span className="text-lg">✨</span> LIHAT TRANSFORMASIMU</>
            )}
          </motion.button>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-error text-sm bg-error/10 px-4 py-2 rounded-lg border border-error/20"
            >
              {error}
            </motion.p>
          )}

          {!photoBase64 && !isLoading && (
              <p className="text-xs text-muted">
                {selectedTemplate ? "Upload foto untuk memulai" : "Pilih template untuk memulai"}
              </p>
          )}
        </motion.div>
      </section>

      {/* SECTION 3: RESULT */}
      <AnimatePresence mode="wait">
        {resultUrl && photoBase64 && (
          <motion.section
            key="result-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto px-4 pb-12"
          >
            <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
              {/* WOW Header */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-center mb-6"
              >
                <span className="text-3xl">🔥</span>
                <h2 className="text-xl font-bold mt-1">Keren! Ini hasil transformasimu!</h2>
              </motion.div>

              <CompareSlider
                beforeImage={photoBase64}
                afterImage={resultUrl}
                beforeLabel="Asli"
                afterLabel="Hasil AI"
              />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
                <motion.button
                  onClick={handleDownload}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  📥 Download HD
                </motion.button>

                <motion.button
                  onClick={handleShare}
                  className="flex-1 px-6 py-3 bg-card border border-border text-foreground rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-card-hover transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  🔗 Copy Link
                </motion.button>

                <motion.button
                  onClick={handleReset}
                  className="flex-1 px-6 py-3 bg-card border border-border text-foreground rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-card-hover transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  🔄 Buat Lagi
                </motion.button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* SECTION 4: MORE TEMPLATES — jika sudah punya hasil */}
      {resultUrl && (
        <section className="max-w-5xl mx-auto px-4 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-center text-lg font-semibold mb-6">
              Masih kurang puas? Coba gaya lain...
            </h3>
            <div className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto">
              {TEMPLATES.filter((t) => t.id !== selectedTemplate?.id)
                .slice(0, 7)
                .map((t) => (
                  <motion.button
                    key={t.id}
                    onClick={() => {
                      setSelectedTemplate(t);
                      setResultUrl(null);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex flex-col items-center gap-1 p-2 w-[68px] rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-card-hover transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title={t.name}
                  >
                    <span className="text-xl">{t.icon}</span>
                    <span className="text-[9px] text-muted truncate max-w-full">{t.name}</span>
                  </motion.button>
                ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted">
          <p>Photobox AI — Dibuat dengan ❤️ menggunakan Next.js & Fal AI</p>
          <p>{STATS.totalGenerated.toLocaleString()} foto telah dihasilkan</p>
        </div>
      </footer>
    </div>
  );
}
