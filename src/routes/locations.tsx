import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, SiteLayout, seo } from "@/components/site/SiteLayout";
import { BRANCHES } from "@/lib/data";

export const Route = createFileRoute("/locations")({
  head: () => seo("Studios | Lumière Dental Studio", "Lumière has two fictional studios, in Bayview and Riverside.", "/locations"),
  component: () => (
    <SiteLayout>
      <PageHero eyebrow="Studios" title="Two rooms. One standard of time." intro="Bayview holds the longer restorative and emergency list. Riverside is for orthodontics, children, and hygiene." />
      <section className="mx-auto grid max-w-5xl gap-6 px-5 py-20 md:grid-cols-2">
        {BRANCHES.map((b) => (
          <Link key={b.id} to="/locations/$slug" params={{ slug: b.id }} className="rounded-2xl border bg-card p-8 hover:shadow-soft">
            <p className="text-xs uppercase tracking-[0.2em] text-gold">{b.city}</p>
            <h2 className="mt-3 font-serif text-3xl text-primary">{b.name}</h2>
            <p className="mt-3 text-muted-foreground">{b.blurb}</p>
            <p className="mt-4 text-sm">{b.hours}</p>
          </Link>
        ))}
      </section>
    </SiteLayout>
  ),
});
