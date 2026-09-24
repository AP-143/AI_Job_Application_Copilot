import type { ReactNode } from "react";
import { HeroStill } from "./HeroMedia";

/** Dark top section for the signed-in pages. The top padding clears the fixed AppHeader (4.5rem). */
export default function PageHero({ children }: { children: ReactNode }) {
  return (
    <section className="tone-dark relative isolate overflow-hidden">
      <HeroStill />
      <div className="page pt-[7.5rem] pb-14 sm:pt-[9.5rem] sm:pb-20">{children}</div>
    </section>
  );
}
