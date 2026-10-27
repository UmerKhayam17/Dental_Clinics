import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Free stock footage from Mixkit (mixkit.co), re-encoded without audio.
const CLIPS = [
  { src: "/videos/clinic-treatment.mp4", poster: "/videos/clinic-treatment.jpg", label: "Treatment" },
  { src: "/videos/dentist-examining.mp4", poster: "/videos/dentist-examining.jpg", label: "Examination" },
];
const HOLD_MS = 7000;

/** Background footage for the home hero: cross-fades between clinic clips. Reduced motion or data saver shows a still. */
export function HeroVideo({ className }: { className?: string }) {
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || saveData) setStill(true);
  }, []);

  useEffect(() => {
    if (still) return;
    refs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        // Let the outgoing clip keep moving through the cross-fade, then stop it.
        window.setTimeout(() => v.pause(), 1200);
      }
    });
    const t = window.setTimeout(() => setActive((a) => (a + 1) % CLIPS.length), HOLD_MS);
    return () => window.clearTimeout(t);
  }, [active, still]);

  return (
    <div aria-hidden className={cn("absolute inset-0 overflow-hidden", className)}>
      {CLIPS.map((c, i) =>
        still ? (
          i === 0 && <img key={c.src} src={c.poster} alt="" className="h-full w-full object-cover" />
        ) : (
          <video
            key={c.src}
            ref={(el) => { refs.current[i] = el; }}
            src={c.src}
            poster={c.poster}
            muted
            playsInline
            loop
            preload={i === 0 ? "auto" : "metadata"}
            className={cn(
              "absolute inset-0 h-full w-full scale-105 object-cover object-[68%_50%] md:object-center transition-[opacity,transform] duration-[1200ms] ease-out",
              i === active ? "scale-100 opacity-100" : "opacity-0",
            )}
          />
        ),
      )}
      {!still && (
        <div className="absolute right-5 bottom-6 z-10 hidden gap-4 md:flex lg:right-[max(1.25rem,calc((100vw-80rem)/2+1.25rem))]">
          {CLIPS.map((c, i) => (
            <div key={c.label} className="w-24 text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70">
              <span className={cn("transition-colors", i === active && "text-gold")}>{c.label}</span>
              <span className="mt-2 block h-px overflow-hidden bg-primary-foreground/25">
                <span
                  key={i === active ? active : undefined}
                  className={cn("block h-full origin-left bg-gold", i === active ? "animate-[hero-progress_7s_linear_forwards]" : "scale-x-0")}
                />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
