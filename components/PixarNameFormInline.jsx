"use client";

import { useState, useRef, useEffect } from "react";

export default function PixarNameFormInline({ onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Nama tidak boleh kosong");
      return;
    }
    if (trimmed.length < 2) {
      setError("Nama minimal 2 karakter");
      return;
    }
    if (trimmed.length > 50) {
      setError("Nama maksimal 50 karakter");
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          placeholder="Contoh: Daniel"
          maxLength={50}
          className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-center text-lg font-medium placeholder:text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          autoComplete="off"
          spellCheck={false}
        />
        {error && (
          <p className="text-error text-sm mt-2 text-center">{error}</p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-card border border-border text-foreground rounded-xl font-medium hover:bg-card-hover transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-red-500 text-white rounded-xl font-medium shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          ✨ Buat Postermu!
        </button>
      </div>
    </form>
  );
}
