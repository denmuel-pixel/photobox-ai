"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPage() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generateCount, setGenerateCount] = useState(1);
  const [newCodes, setNewCodes] = useState([]);
  const [showNewCodes, setShowNewCodes] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [adminError, setAdminError] = useState(null);

  const fetchCodes = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/codes");
      const data = await res.json();
      setCodes(data.codes || []);
    } catch {
      console.error("Gagal memuat kode");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const handleGenerate = async () => {
    setGenerating(true);
    setAdminError(null);
    try {
      const res = await fetch("/api/admin/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: generateCount }),
      });
      const data = await res.json();
      if (data.success) {
        setNewCodes(data.codes);
        setShowNewCodes(true);
        fetchCodes();
        setTimeout(() => setShowNewCodes(false), 8000);
      } else {
        setAdminError(data.error || "Gagal membuat kode");
      }
    } catch (err) {
      setAdminError(err.message || "Gagal terhubung ke server");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // fallback
    }
  };

  const copyAllNew = async () => {
    try {
      await navigator.clipboard.writeText(newCodes.join("\n"));
      alert("Semua kode berhasil disalin!");
    } catch {
      // fallback
    }
  };

  const statTotal = codes.length;
  const statUsed = codes.filter((c) => c.used).length;
  const statAvailable = statTotal - statUsed;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Photobox Admin
            </span>
          </div>
          <a
            href="/"
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            ← Kembali ke Aplikasi
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{statTotal}</div>
            <div className="text-xs text-muted mt-1">Total Kode</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-success">{statAvailable}</div>
            <div className="text-xs text-muted mt-1">Tersedia</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-error">{statUsed}</div>
            <div className="text-xs text-muted mt-1">Terpakai</div>
          </div>
        </div>

        {/* Generate Section */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 mb-8">
          <h2 className="text-lg font-bold mb-1">Generate Kode Otorisasi</h2>
          <p className="text-sm text-muted mb-4">
            Buat kode baru yang bisa diberikan ke pengguna. 1 kode hanya bisa dipakai 1 kali.
          </p>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted block mb-1.5">Jumlah kode</label>
              <input
                type="number"
                min={1}
                max={50}
                value={generateCount}
                onChange={(e) => setGenerateCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-medium shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
            >
              {generating ? (
                <><span className="animate-spin">⏳</span> Membuat...</>
              ) : (
                <><span>🎟️</span> Generate Kode</>
              )}
            </button>
          </div>

          {/* New Codes Toast */}
          <AnimatePresence>
            {showNewCodes && newCodes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 bg-primary/10 border border-primary/30 rounded-xl p-4 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-primary">
                    ✅ {newCodes.length} kode baru berhasil dibuat!
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={copyAllNew}
                      className="text-xs px-2.5 py-1 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                    >
                      📋 Salin Semua
                    </button>
                    <button
                      onClick={() => setShowNewCodes(false)}
                      className="text-xs px-2 py-1 text-muted hover:text-foreground transition-colors"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {newCodes.map((code, i) => (
                    <button
                      key={code}
                      onClick={() => handleCopy(code, i)}
                      className="relative font-mono text-xs bg-background border border-border rounded-lg px-3 py-2 text-center hover:border-primary transition-colors group"
                    >
                      <span>{code}</span>
                      <span className="absolute -top-1.5 -right-1.5 text-[10px] bg-primary text-white w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {copiedIndex === i ? "✓" : "📋"}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Alert */}
          {adminError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-error/10 border border-error/30 rounded-xl p-4"
            >
              <p className="text-sm text-error flex items-center gap-2">
                <span>⚠️</span> {adminError}
              </p>
            </motion.div>
          )}
        </div>

        {/* Codes List */}
        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6">
          <h2 className="text-lg font-bold mb-1">Riwayat Kode</h2>
          <p className="text-sm text-muted mb-4">
            Semua kode yang pernah dibuat. Kode yang sudah terpakai tidak bisa digunakan lagi.
          </p>

          {loading ? (
            <div className="text-center py-8 text-muted">
              <span className="animate-spin inline-block">⏳</span> Memuat...
            </div>
          ) : codes.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <p className="text-2xl mb-2">🎟️</p>
              <p>Belum ada kode. Buat kode pertama kamu!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-muted font-medium">Kode</th>
                    <th className="text-left py-2 pr-4 text-muted font-medium">Status</th>
                    <th className="text-left py-2 pr-4 text-muted font-medium">Dibuat</th>
                    <th className="text-left py-2 text-muted font-medium">Dipakai</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((item) => (
                    <tr key={item.code} className="border-b border-border/50 hover:bg-card-hover/50 transition-colors">
                      <td className="py-2.5 pr-4">
                        <span className="font-mono text-xs bg-background px-2 py-1 rounded-lg border border-border">
                          {item.code}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        {item.used ? (
                          <span className="text-xs text-error bg-error/10 px-2 py-0.5 rounded-full">
                            Terpakai
                          </span>
                        ) : (
                          <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">
                            Tersedia
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 text-muted text-xs">
                        {new Date(item.createdAt).toLocaleString("id-ID")}
                      </td>
                      <td className="py-2.5 text-muted text-xs">
                        {item.usedAt ? new Date(item.usedAt).toLocaleString("id-ID") : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
