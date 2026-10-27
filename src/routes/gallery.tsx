import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero, SiteLayout, seo } from "@/components/site/SiteLayout";
import { SceneGallery } from "@/components/site/SceneGallery";
import { SCENES } from "@/lib/scenes";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gallery")({
  head: () => seo("Smile Gallery | Lumière Dental Studio", "Illustrative shade, alignment, and space studies. These are drawings, not patient photographs.", "/gallery"),
  component: Gallery,
});

const CASES = [
  { cat: "Whitening", title: "A lighter shade, still yours", variant: "whiten" as const },
  { cat: "Orthodontics", title: "One tooth brought into line", variant: "align" as const },
  { cat: "Implants", title: "A space, then a tooth", variant: "gap" as const },
  { cat: "Whitening", title: "Even colour across the front six", variant: "whiten" as const },
  { cat: "Cosmetic", title: "A chipped edge redrawn", variant: "align" as const },
  { cat: "Implants", title: "The neighbouring teeth left alone", variant: "gap" as const },
];

function Teeth({ variant, tone }: { variant: "whiten" | "align" | "gap"; tone: "before" | "after" }) {
  const fill = variant === "whiten" && tone === "before" ? "#E3D0A4" : "#F6F1E6";
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" aria-hidden>
      <rect width="320" height="180" fill={tone === "before" ? "#E7EFEA" : "#F7F4EF"} />
      <path d="M20 150c40-70 240-70 280 0" fill="#F3E6EA" />
      {Array.from({ length: 6 }, (_, i) => {
        const hidden = variant === "gap" && tone === "before" && i === 3;
        const tilt = variant === "align" && tone === "before" && i === 2 ? -12 : 0;
        const x = 48 + i * 40;
        return hidden ? null : (
          <rect key={i} x={x} y={78} width={28} height={i === 2 || i === 3 ? 42 : 36} rx={8} fill={fill} stroke="#173D3B" strokeWidth="1.2" transform={`rotate(${tilt} ${x + 14} 90)`} />
        );
      })}
    </svg>
  );
}

function Compare({ variant }: { variant: "whiten" | "align" | "gap" }) {
  const [v, setV] = useState(52);
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-card">
      <Teeth variant={variant} tone="before" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${v}%)` }}><Teeth variant={variant} tone="after" /></div>
      <div className="absolute inset-y-0 w-px bg-gold" style={{ left: `${v}%` }} />
      <span className="absolute left-3 top-3 rounded bg-card/90 px-2 py-0.5 text-xs">Before</span>
      <span className="absolute right-3 top-3 rounded bg-card/90 px-2 py-0.5 text-xs">After</span>
      <input aria-label="Compare the illustrative before and after" type="range" min={0} max={100} value={v} onChange={(e) => setV(+e.target.value)} className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" />
    </div>
  );
}

function Gallery() {
  const [cat, setCat] = useState("All");
  const cats = ["All", ...new Set(CASES.map((c) => c.cat))];
  return (
    <SiteLayout>
      <PageHero eyebrow="Gallery" title="The rooms, then the studies." intro="Open a photograph of either studio. The drawings below are still studies, not before-and-after pictures of patients." />
      <section className="mx-auto max-w-7xl px-5 py-16">
        <h2 className="font-serif text-3xl text-primary">Studios</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">Select a room. Use the arrows, or the left and right keys, to move through the set.</p>
        <div className="mt-8"><SceneGallery scenes={SCENES} layout="bento" /></div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-16">
        <h2 className="font-serif text-3xl text-primary">Illustrative studies</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">Drag the gold line. These drawings show the kind of change a treatment can discuss.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={cn("rounded-full border px-4 py-1.5 text-sm", cat === c ? "bg-primary text-primary-foreground" : "bg-card")}>{c}</button>
          ))}
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {CASES.filter((c) => cat === "All" || c.cat === cat).map((c) => (
            <figure key={c.title}>
              <Compare variant={c.variant} />
              <figcaption className="mt-3">
                <span className="text-xs uppercase tracking-widest text-gold">{c.cat}</span>
                <p className="font-serif text-lg text-primary">{c.title}</p>
                <p className="text-xs text-muted-foreground">Illustrative study</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
