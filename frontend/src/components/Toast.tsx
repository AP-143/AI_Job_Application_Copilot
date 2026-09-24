"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "./ui";

export function Toast({
  message,
  onDone,
  duration = 5000,
}: {
  message: string | null;
  onDone: () => void;
  duration?: number;
}) {
  const [paused, setPaused] = useState(false);
  const doneRef = useRef(onDone);

  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!message || paused) return;
    const timer = window.setTimeout(() => doneRef.current(), duration);
    return () => window.clearTimeout(timer);
  }, [message, paused, duration]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center sm:bottom-8"
    >
      {message && (
        <div
          key={message}
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          className="animate-toast pointer-events-auto flex items-center gap-3 rounded-full bg-ink py-1.5 pr-1.5 pl-5 text-on-ink shadow-[0_20px_50px_-15px_rgb(10_10_10/0.45)]"
        >
          <Icon name="check" className="h-4 w-4" />
          <p className="text-body">{message}</p>
          <button
            type="button"
            onClick={onDone}
            aria-label="Tutup notifikasi"
            className="grid h-11 w-11 place-items-center rounded-full bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline-on-ink"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
