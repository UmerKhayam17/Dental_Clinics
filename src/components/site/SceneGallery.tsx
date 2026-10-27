import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Scene } from "@/lib/scenes";

export function SceneGallery({ scenes, layout = "grid" }: { scenes: Scene[]; layout?: "grid" | "bento" }) {
  const [index, setIndex] = useState<number | null>(null);
  const scene = index === null ? null : scenes[index];

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIndex((i) => (i === null ? i : (i + 1) % scenes.length));
      if (e.key === "ArrowLeft") setIndex((i) => (i === null ? i : (i - 1 + scenes.length) % scenes.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, scenes.length]);

  return (
    <>
      <div className={cn("grid gap-3", layout === "bento" ? "grid-cols-2 md:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3")}>
        {scenes.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setIndex(i)}
            className={cn(
              "group relative overflow-hidden rounded-2xl text-left ring-1 ring-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              layout !== "bento" && "min-h-52",
              layout === "bento" && i === 0 && "col-span-2 min-h-64 md:row-span-2 md:min-h-[28rem]",
              // Tiles after the 2×2 block share the remaining rows evenly, so an odd count never leaves a hole.
              layout === "bento" && i > 0 && (i > 4 ? "min-h-40 md:col-span-2 md:min-h-56" : "min-h-40 md:min-h-52"),
              layout === "bento" && i === scenes.length - 1 && (scenes.length - 5) % 2 === 1 && "col-span-2 md:col-span-4",
            )}
          >
            <img
              src={item.src}
              alt={item.alt}
              loading="lazy"
              width={1200}
              height={800}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent p-4 pt-10 text-primary-foreground">
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold">{item.place}</span>
              <span className="mt-1 block font-serif text-lg md:text-xl">{item.title}</span>
            </span>
          </button>
        ))}
      </div>
      <Dialog open={scene !== null} onOpenChange={(open) => !open && setIndex(null)}>
        <DialogContent className="max-w-5xl border-0 bg-primary p-3 text-primary-foreground sm:rounded-2xl">
          {scene && (
            <figure>
              <DialogTitle className="absolute h-px w-px overflow-hidden whitespace-nowrap">{scene.title}</DialogTitle>
              <img src={scene.src} alt={scene.alt} className="max-h-[72vh] w-full rounded-xl object-contain" />
              <figcaption className="flex items-end justify-between gap-4 px-2 py-3">
                <div>
                  <DialogDescription className="text-gold">{scene.place}</DialogDescription>
                  <p className="mt-1 font-serif text-2xl text-primary-foreground">{scene.title}</p>
                  <p className="mt-1 text-sm text-primary-foreground/75">{scene.caption}</p>
                </div>
                <span className="flex shrink-0 gap-2">
                  <button type="button" aria-label="Previous photograph" onClick={() => setIndex((i) => (i === null ? i : (i - 1 + scenes.length) % scenes.length))} className="rounded-full border border-primary-foreground/30 p-2 hover:bg-primary-foreground/10">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button type="button" aria-label="Next photograph" onClick={() => setIndex((i) => (i === null ? i : (i + 1) % scenes.length))} className="rounded-full border border-primary-foreground/30 p-2 hover:bg-primary-foreground/10">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </span>
              </figcaption>
            </figure>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
