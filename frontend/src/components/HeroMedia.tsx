"use client";

import { useEffect, useRef } from "react";

const HERO_MEDIA = {
  webm: "/media/hero.webm",
  mp4: "/media/hero.mp4",
  poster: "/media/hero-poster.jpg",
} as const;

/** Full-bleed looping hero video for every page. Plays only when the viewer allows motion. */
export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (reduce.matches) {
        video.pause();
        return;
      }
      video.muted = true;
      video.play().catch(() => {
        // Autoplay can be refused (battery or data saver). The poster stays up.
      });
    };
    sync();
    reduce.addEventListener("change", sync);
    return () => reduce.removeEventListener("change", sync);
  }, []);

  return (
    <div aria-hidden="true" className="hero-media">
      <video ref={videoRef} muted loop playsInline preload="metadata" poster={HERO_MEDIA.poster}>
        <source src={HERO_MEDIA.webm} type="video/webm" />
        <source src={HERO_MEDIA.mp4} type="video/mp4" />
      </video>
    </div>
  );
}
