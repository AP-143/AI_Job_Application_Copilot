import type { CSSProperties } from "react";

// Decorative cinematic backdrop: a desk at night lit by one warm lamp. Pure CSS shapes, no assets.

const BOOKS = [
  { w: 3.2, h: 78, c: "#c9a13a" },
  { w: 2.4, h: 70, c: "#8d2f2a" },
  { w: 3.8, h: 84, c: "#2f4f7a" },
  { w: 2.2, h: 66, c: "#d8cdb4" },
  { w: 3, h: 80, c: "#6f3f58" },
  { w: 2.6, h: 74, c: "#3e6b5a" },
  { w: 4, h: 88, c: "#b8622e" },
  { w: 2.4, h: 72, c: "#243a5c" },
];

const MOTES = Array.from({ length: 14 }, (_, i) => ({
  left: `${58 + ((i * 37) % 34)}%`,
  bottom: `${10 + ((i * 23) % 40)}%`,
  size: 2 + (i % 3),
  dur: `${9 + (i % 5) * 2}s`,
  delay: `${-(i * 1.3)}s`,
}));

export default function NightScene() {
  return (
    <div aria-hidden="true" className="night-scene absolute inset-x-0 top-0 -z-10 h-[100svh] min-h-[640px] overflow-hidden">
      <div className="night-camera absolute inset-0">
        {/* back wall with warm falloff from the lamp */}
        <div className="absolute inset-0 bg-[radial-gradient(90%_80%_at_82%_92%,#6b4a2a_0%,#2a2a2e_28%,#12202b_55%,#0a141c_100%)]" />

        {/* bookshelf, top-left */}
        <div className="absolute top-[14%] left-[-10%] w-[44%] opacity-80 blur-[1.5px] sm:left-[-2%] sm:w-[30%]">
          <div className="flex h-[clamp(70px,11vw,150px)] items-end gap-[0.5%] pl-[8%]">
            {BOOKS.map((b, i) => (
              <span
                key={i}
                className="block rounded-t-[2px] shadow-[inset_-3px_0_0_rgb(0_0_0/0.25),inset_2px_0_0_rgb(255_255_255/0.08)]"
                style={{ width: `${b.w}%`, height: `${b.h}%`, background: b.c, filter: "brightness(0.62) saturate(0.8)" }}
              />
            ))}
            <span className="ml-[6%] block h-[46%] w-[12%] rounded-full bg-[#2c4a35] brightness-50" />
          </div>
          <div className="h-[clamp(8px,1vw,14px)] rounded-[2px] bg-[linear-gradient(180deg,#2f6b5e,#1c3f38)] shadow-[0_18px_30px_rgb(0_0_0/0.45)]" />
          <div className="mt-[clamp(70px,11vw,150px)] h-[clamp(8px,1vw,14px)] rounded-[2px] bg-[linear-gradient(180deg,#2a5f54,#183731)] shadow-[0_18px_30px_rgb(0_0_0/0.45)]" />
          <div className="absolute top-0 left-0 h-[calc(100%+clamp(70px,11vw,150px))] w-[clamp(8px,1vw,14px)] bg-[#1d4039]" />
        </div>

        {/* desk top */}
        <div className="absolute inset-x-0 bottom-0 h-[24%] bg-[linear-gradient(180deg,#2b1f18_0%,#150f0c_100%)]">
          <div className="absolute inset-x-0 top-0 h-px bg-[#8a5a32]/50" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_120%_at_84%_0%,rgb(255_170_80/0.28),transparent_70%)]" />
        </div>

        {/* stack of CVs on the desk */}
        <div className="absolute bottom-[5%] left-[6%] hidden w-[clamp(130px,12vw,210px)] lg:block">
          {[
            { r: -7, x: -6, y: 6, b: 0.55 },
            { r: 4, x: 8, y: 3, b: 0.68 },
            { r: -2, x: 0, y: 0, b: 0.82 },
          ].map((s, i) => (
            <div
              key={i}
              className="absolute bottom-0 left-0 aspect-[0.72] w-full rounded-[3px] bg-[linear-gradient(115deg,#d9d2c3_0%,#f3e6cf_70%,#ffd9a0_100%)] p-[9%] shadow-[0_20px_40px_rgb(0_0_0/0.55)]"
              style={{ transform: `translate(${s.x}%, ${s.y}%) rotate(${s.r}deg) perspective(600px) rotateX(58deg)`, filter: `brightness(${s.b})`, transformOrigin: "bottom center" }}
            >
              <span className="block h-[7%] w-[55%] rounded-sm bg-[#3a3530]/70" />
              {[80, 92, 70, 86, 60, 88, 74].map((w, j) => (
                <span key={j} className="mt-[7%] block h-[3%] rounded-sm bg-[#3a3530]/35" style={{ width: `${w}%` }} />
              ))}
            </div>
          ))}
        </div>

        {/* lamp, bottom-right: glow, light cones, shade */}
        <div
          className="night-glow absolute right-[2%] bottom-[38%] h-[46%] w-[clamp(160px,26vw,420px)] bg-[linear-gradient(0deg,rgb(255_176_84/0.42),transparent_85%)] sm:right-[7%] lg:right-[40%]"
          style={{ clipPath: "polygon(30% 100%, 70% 100%, 100% 0, 0 0)" }}
        />
        <div className="night-glow absolute right-[-18%] bottom-[-28%] aspect-square w-[80%] rounded-full bg-[radial-gradient(circle,rgb(255_176_84/0.75)_0%,rgb(255_140_60/0.28)_32%,transparent_66%)] sm:right-[-8%] sm:w-[62%] lg:right-[26%] lg:w-[48%]" />
        <div className="absolute right-[10%] bottom-[18%] hidden w-[clamp(120px,19vw,300px)] sm:block lg:right-[43%] lg:w-[clamp(140px,15vw,260px)]">
          <div
            className="night-shade aspect-[1.25] w-full bg-[linear-gradient(180deg,#ffc56a_0%,#f59a3d_55%,#c9641f_100%)] shadow-[0_0_80px_20px_rgb(255_160_70/0.35)]"
            style={{ clipPath: "polygon(16% 0, 84% 0, 100% 100%, 0 100%)" }}
          >
            <div className="h-full w-full bg-[repeating-linear-gradient(90deg,transparent_0_15%,rgb(120_60_20/0.18)_15%_16%)]" />
          </div>
          <div className="mx-auto h-[clamp(30px,5vw,70px)] w-[6%] bg-[linear-gradient(90deg,#3b2a1c,#7a5634,#3b2a1c)]" />
          <div className="mx-auto h-[clamp(6px,0.8vw,10px)] w-[46%] rounded-full bg-[#2e2118] shadow-[0_6px_14px_rgb(0_0_0/0.6)]" />
        </div>

        {/* dust drifting through the lamplight */}
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="night-mote absolute rounded-full bg-[#ffd9a0]"
            style={{ left: m.left, bottom: m.bottom, width: m.size, height: m.size, "--dur": m.dur, animationDelay: m.delay } as CSSProperties}
          />
        ))}
      </div>

      {/* vignette + darkening under the headline for legibility */}
      <div className="absolute inset-0 bg-[radial-gradient(46%_40%_at_50%_38%,rgb(6_12_18/0.6),transparent_80%)] lg:bg-[radial-gradient(40%_50%_at_22%_40%,rgb(6_12_18/0.65),transparent_80%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,transparent_55%,rgb(3_7_10/0.75)_100%)]" />
    </div>
  );
}
