"use client";

import { useCallback, useRef } from "react";

// Preload audio elements
const sounds = {
  click: typeof Audio !== "undefined" ? new Audio("/sounds/click.mp3") : null,
  scan: typeof Audio !== "undefined" ? new Audio("/sounds/scan.mp3") : null,
  sparks: typeof Audio !== "undefined" ? new Audio("/sounds/sparks.mp3") : null,
};

// Set volume
Object.values(sounds).forEach((a) => {
  if (a) a.volume = 0.5;
});

export function useSound() {
  const scanRef = useRef(null);

  const playClick = useCallback(() => {
    sounds.click?.cloneNode().play().catch(() => {});
  }, []);

  const playScan = useCallback(() => {
    if (scanRef.current) {
      scanRef.current.pause();
      scanRef.current.currentTime = 0;
    }
    const s = sounds.scan?.cloneNode();
    if (s) {
      s.loop = true;
      s.play().catch(() => {});
      scanRef.current = s;
    }
  }, []);

  const stopScan = useCallback(() => {
    if (scanRef.current) {
      scanRef.current.pause();
      scanRef.current.currentTime = 0;
      scanRef.current = null;
    }
  }, []);

  const playSparks = useCallback(() => {
    sounds.sparks?.cloneNode().play().catch(() => {});
  }, []);

  return { playClick, playScan, stopScan, playSparks };
}
