import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock } from "lucide-react";
import { PageHero, SiteLayout, seo } from "@/components/site/SiteLayout";
import { TREATMENTS, money } from "@/lib/data";
import { procedureFor } from "@/lib/procedures";
import { Reveal, Tilt } from "@/components/fx/Motion";

export const Route = createFileRoute("/treatments/")({
  head: () => seo("Dental Treatments | Lumière Dental Studio", "General, cosmetic, implant, orthodontic, pediatric and emergency dentistry at Lumière Dental Studio.", "/treatments"),
  component: () => (
    <SiteLayout>
      <PageHero eyebrow="Treatments" title="Considered care, from check-ups to complete smile design." intro="Every treatment begins with a conversation about your goals." />
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-20 md:grid-cols-2">
        {TREATMENTS.map((t, i) => {
          const photo = procedureFor(t.slug);
          return (
          <Reveal key={t.slug} delay={(i % 2) * 120}>
          <Tilt className="h-full rounded-2xl" max={5}>
          <Link to="/treatments/$slug" params={{ slug: t.slug }} className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-soft">
            <img src={photo.src} alt={photo.alt} loading="lazy" width={1200} height={900} className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
            <div className="flex flex-1 flex-col p-8">
            <h2 className="font-serif text-2xl text-primary">{t.name}</h2>
            <p className="mt-3 flex-1 text-muted-foreground">{t.short}</p>
            <div className="mt-6 flex items-center justify-between text-sm">
              <span className="flex items-center gap-4 text-muted-foreground"><span className="flex items-center gap-1"><Clock className="h-4 w-4" />{t.duration} min</span>From {money(t.price)}</span>
              <ArrowRight className="h-4 w-4 text-gold transition-transform group-hover:translate-x-1" />
            </div>
            </div>
          </Link>
          </Tilt>
          </Reveal>
          );
        })}
      </section>
    </SiteLayout>
  ),
});
