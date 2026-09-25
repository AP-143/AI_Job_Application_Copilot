"use client";

import { useEffect, useRef } from "react";

// Files live in public/media (added in Task 11). A missing file falls back to the CSS gradient.
const HERO_MEDIA = {
  webm: "/media/hero.webm",
  mp4: "/media/hero.mp4",
  poster: "/media/hero-poster.jpg",
  still: "/media/hero-still.jpg",
} as const;

/** Cinematic backdrop for the landing page and login. Plays only when the viewer allows motion.
 *  `src` swaps in a single remote mp4; `bare` drops the scrim so the video shows untouched. */
export function HeroVideo({ src, bare = false }: { src?: string; bare?: boolean }) {
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
    <div aria-hidden="true" className={bare ? "hero-media hero-media-bare" : "hero-media"}>
      <video ref={videoRef} muted loop playsInline preload="metadata" poster={src ? undefined : HERO_MEDIA.poster}>
        {src ? (
          <source src={src} type="video/mp4" />
        ) : (
          <>
            <source src={HERO_MEDIA.webm} type="video/webm" />
            <source src={HERO_MEDIA.mp4} type="video/mp4" />
          </>
        )}
      </video>
    </div>
  );
}

/** One still frame from the same video, for the calmer signed-in pages. */
export function HeroStill() {
  return (
    <div
      aria-hidden="true"
      className="hero-media"
      style={{ backgroundImage: `url(${HERO_MEDIA.still}), var(--dark-gradient)` }}
    />
  );
}
