"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
import PixarNameFormInline from "@/components/PixarNameFormInline";
import { useSound } from "@/lib/useSound";
import { STATS } from "@/lib/examples";
import { TEMPLATES, getRandomPrompt } from "@/lib/templates";

export default function Home() {
  const [photoBase64, setPhotoBase64] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [resultMessage, setResultMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showScan, setShowScan] = useState(false);
  const [showFaceDetection, setShowFaceDetection] = useState(false);
  const [faceData, setFaceData] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const [rawPhotoBase64, setRawPhotoBase64] = useState(null);
  const [cropKey, setCropKey] = useState(0);
  const [pendingRequestId, setPendingRequestId] = useState(null);
  const [uploadKey, setUploadKey] = useState(0);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const isAuthorizedRef = useRef(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pixarName, setPixarName] = useState("");
  const [showPixarNameModal, setShowPixarNameModal] = useState(false);
  const pendingTemplateRef = useRef(null);
  const uploadSectionRef = useRef(null);
  const templateSectionRef = useRef(null);
  const generateRef = useRef(null);
  const { playClick, playScan, stopScan, playSparks } = useSound();
  const doneAudioRef = useRef(null);

  const handlePhotoSelected = useCallback((base64) => {
    setResultUrl(null);
    setResultMessage(null);
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

  const handleSelectTemplate = useCallback((template) => {
    playClick();
    setResultUrl(null);
    setResultMessage(null);
    setError(null);
    if (template.id === "pixar") {
      pendingTemplateRef.current = template;
      setShowPixarNameModal(true);
    } else {
      setSelectedTemplate(template);
      setPixarName("");
      setTimeout(() => {
        generateRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [playClick]);

  const handleTryNow = useCallback(() => {
    playClick();
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [playClick]);

  const pollJobRef = useRef(null);

  const handleGenerate = async () => {
    if (!photoBase64) {
      setError("Upload foto terlebih dahulu");
      return;
    }
    if (!selectedTemplate) {
      setError("Pilih gaya AI terlebih dahulu");
      return;
    }
    if (!isAuthorizedRef.current) {
      setShowAuthModal(true);
      return;
    }

    playClick();
    playSparks();
    const doneAudio = new Audio("/sounds/done.mp3");
    doneAudio.volume = 0.5;
    doneAudio.play().catch(() => {});
    setIsLoading(true);
    setError(null);
    setResultUrl(null);
    setResultMessage(null);

    const faceCount = faceData?.count || 1;
    const name = selectedTemplate.id === "pixar" ? pixarName : "";
    const prompt = getRandomPrompt(selectedTemplate.id, faceCount, name);
    const strength = selectedTemplate.strength;

    stopScan();

    try {
      // === STEP 1: Submit job ===
      const submitRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: photoBase64,
          prompt,
          strength,
          templateId: selectedTemplate?.id || null,
        }),
      });

      let submitData;
      const ct = submitRes.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        submitData = await submitRes.json();
      } else {
        const text = await submitRes.text();
        throw new Error(
          text.startsWith("An error")
            ? "Server error. Coba lagi."
            : `Server error: ${text.slice(0, 200)}`
        );
      }

      if (!submitRes.ok) throw new Error(submitData.error || "Gagal submit");

      // Fallback → langsung tampilkan
      if (submitData.resultUrl) {
        doneAudio.play().catch(() => {});
        setResultUrl(submitData.resultUrl);
        setResultMessage(submitData.fallback ? submitData.message : null);
        setIsLoading(false);
        return;
      }

      const requestId = submitData.requestId;
      if (!requestId) throw new Error("Tidak mendapat ID job dari server");

      setPendingRequestId(requestId);

      // === STEP 2: Poll status (max 60x = ~2 menit) ===
      let pollCount = 0;
      const MAX_POLL = 60;

      const poll = async () => {
        pollCount++;
        if (pollCount > MAX_POLL) {
          setError("Hasil belum siap. Klik 'Coba Ambil Ulang' untuk mengecek lagi.");
          setIsLoading(false);
          return;
        }

        try {
          const statusRes = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requestId }),
          });
          const statusData = await statusRes.json();
          if (!statusRes.ok) throw new Error(statusData.error || "Gagal cek status");

          if (statusData.status === "COMPLETED") {
            setPendingRequestId(null);
            // === STEP 3: Ambil hasil ===
            const resultRes = await fetch("/api/generate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ requestId, fetchResult: true }),
            });
            const resultData = await resultRes.json();
            if (!resultRes.ok) throw new Error(resultData.error || "Gagal ambil hasil");

            doneAudio.play().catch(() => {});
            setResultUrl(resultData.resultUrl);
            setIsLoading(false);
          } else {
            pollJobRef.current = setTimeout(poll, 2000);
          }
        } catch (err) {
          setError("Gagal memeriksa status. " + err.message);
          setIsLoading(false);
        }
      };

      pollJobRef.current = setTimeout(poll, 1000);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    playClick();
    if (!resultUrl) return;
    try {
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(resultUrl)}`;
      const res = await fetch(proxyUrl);
      const blob = await res.blob();
      const fileName = `photobox-${Date.now()}.jpg`;

      // Web Share API — di iPhone ini munculin "Save to Photos" bukan Files
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], fileName, { type: "image/jpeg" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "Photobox AI" });
          return;
        }
      }

      // Fallback: anchor download (desktop)
      const blobUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((jpgBlob) => {
            if (jpgBlob) {
              const jpgUrl = URL.createObjectURL(jpgBlob);
              const link = document.createElement("a");
              link.href = jpgUrl;
              link.download = fileName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(jpgUrl);
            }
            URL.revokeObjectURL(blobUrl);
            resolve();
          }, "image/jpeg", 0.92);
        };
        img.onerror = () => {
          URL.revokeObjectURL(blobUrl);
          reject();
        };
        img.src = blobUrl;
      });
    } catch {
      // Fallback: buka di tab baru
      window.open(resultUrl, "_blank");
    }
  };

  const handleRetryResult = async () => {
    if (!pendingRequestId) return;
    setError(null);
    setIsLoading(true);

    try {
      const statusRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: pendingRequestId }),
      });
      const statusData = await statusRes.json();
      if (!statusRes.ok) throw new Error(statusData.error || "Gagal cek status");

      if (statusData.status === "COMPLETED") {
        const resultRes = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId: pendingRequestId, fetchResult: true }),
        });
        const resultData = await resultRes.json();
        if (!resultRes.ok) throw new Error(resultData.error || "Gagal ambil hasil");

        setPendingRequestId(null);
        setResultUrl(resultData.resultUrl);
      } else {
        setError("Hasil AI masih diproses. Coba lagi beberapa saat.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => clearTimeout(pollJobRef.current);
  }, []);

  const handleReset = () => {
    clearTimeout(pollJobRef.current);
    playClick();
    stopScan();
    setPhotoBase64(null);
    setRawPhotoBase64(null);
    setSelectedTemplate(null);
    setResultUrl(null);
    setPendingRequestId(null);
    setResultMessage(null);
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

  const handlePixarNameSubmit = (name) => {
    setPixarName(name);
    setSelectedTemplate(pendingTemplateRef.current);
    setShowPixarNameModal(false);
    setTimeout(() => {
      generateRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const isReady = !!selectedTemplate;

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

      {/* PIXAR Name Modal */}
      <AnimatePresence>
        {showPixarNameModal && (
          <>
            <motion.div
              key="pixar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowPixarNameModal(false)}
            />
            <motion.div
              key="pixar-modal"
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
                <div className="text-center mb-4">
                  <span className="text-4xl">💡</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-center mb-1">
                  Masukkan Namamu
                </h2>
                <p className="text-sm text-muted text-center mb-6">
                  Nama akan muncul di poster PIXAR Studio-mu!
                </p>
                <PixarNameFormInline
                  onSubmit={handlePixarNameSubmit}
                  onCancel={() => setShowPixarNameModal(false)}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            
            <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Photobox AI
            </span>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted hidden sm:block">
              Ubah fotomu dengan AI ✨
            </p>
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
                  key={`upload-${uploadKey}`}
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
                  key={`crop-${cropKey}`}
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
              <>Memproses...</>
            ) : (
              <>LIHAT TRANSFORMASIMU</>
            )}
          </motion.button>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <p className="text-error text-sm bg-error/10 px-4 py-2 rounded-lg border border-error/20">
                {error}
              </p>
              {pendingRequestId && (
                <button
                  onClick={handleRetryResult}
                  disabled={isLoading}
                  className="text-xs px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors flex items-center gap-1.5"
                >
                  {isLoading ? "Memeriksa..." : "🔄 Coba Ambil Ulang"}
                </button>
              )}
            </motion.div>
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
                {resultMessage && (
                  <p className="text-xs text-amber-300 mt-3 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 inline-block">
                    {resultMessage}
                  </p>
                )}
              </motion.div>

              <CompareSlider
                key={`${photoBase64}-${resultUrl}`}
                beforeImage={photoBase64}
                afterImage={resultUrl}
                beforeLabel="Asli"
                afterLabel="Hasil AI"
              />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
                <motion.button
                  onClick={handleDownload}
                  className="flex-1 px-8 py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Download HD
                </motion.button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>



      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted">
          <p>Photobox AI — Dibuat dengan ❤️</p>
          <p>{STATS.totalGenerated.toLocaleString()} foto telah dihasilkan</p>
        </div>
      </footer>
    </div>
  );
}
