import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHero, SiteLayout, seo } from "@/components/site/SiteLayout";
import { DENTISTS } from "@/lib/data";
import { Reveal, Tilt } from "@/components/fx/Motion";

export const Route = createFileRoute("/dentists")({
  head: () => seo("Our Dentists | Lumière Dental Studio", "Meet the experienced general, implant and orthodontic dentists at Lumière Dental Studio.", "/dentists"),
  component: () => (
    <SiteLayout>
      <PageHero eyebrow="Our dentists" title="A small team, deeply invested in your care." />
      <section className="mx-auto max-w-7xl space-y-16 px-5 py-20">
        {DENTISTS.map((d, i) => (
          <article key={d.id} className={`grid gap-10 md:items-center ${i % 2 ? "md:grid-cols-[3fr_2fr]" : "md:grid-cols-[2fr_3fr]"}`}>
            <Reveal className={i % 2 ? "md:order-2" : ""}>
              <Tilt className="rounded-2xl" max={10}>
                <img src={d.photo} alt={d.name} loading="lazy" width={800} height={1008} className="aspect-[4/5] w-full rounded-2xl object-cover shadow-soft" />
              </Tilt>
            </Reveal>
            <Reveal delay={120}>
              <p className="text-xs uppercase tracking-[0.25em] text-gold">{d.title}</p>
              <h2 className="mt-2 font-serif text-4xl text-primary">{d.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{d.qualifications} · {d.experience}</p>
              <p className="mt-6 text-muted-foreground">{d.bio}</p>
              <div className="mt-6 flex flex-wrap gap-2">{d.specialties.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}</div>
              <p className="mt-4 text-sm text-muted-foreground">Languages: {d.languages.join(", ")}</p>
              <Button asChild className="mt-8"><Link to="/book" search={{ dentist: d.id }}>See available times</Link></Button>
            </Reveal>
          </article>
        ))}
      </section>
    </SiteLayout>
  ),
});
