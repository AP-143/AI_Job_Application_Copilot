import type { ReactNode } from "react";
import { HeroVideo } from "./HeroMedia";

/** Navy video hero at the top of the signed-in pages. The top padding clears the AppHeader (4.5rem). */
export default function PageHero({ children }: { children: ReactNode }) {
  return (
    <section className="tone-dark relative isolate overflow-hidden">
      <HeroVideo />
      <div className="page pt-[7.5rem] pb-14 sm:pt-[9.5rem] sm:pb-20">{children}</div>
    </section>
  );
}
