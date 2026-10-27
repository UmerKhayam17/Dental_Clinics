import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SiteLayout, seo } from "@/components/site/SiteLayout";
import { BRANCHES, DENTISTS, TREATMENTS } from "@/lib/data";
import { sceneForBranch } from "@/lib/scenes";

export const Route = createFileRoute("/locations/$slug")({
  loader: ({ params }) => {
    const branch = BRANCHES.find((b) => b.id === params.slug);
    if (!branch) throw notFound();
    return branch;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Studio not found" }] };
    return {
      ...seo(`Dentist in ${loaderData.city} | Lumière Dental Studio`, `${loaderData.name}: ${loaderData.blurb}`, `/locations/${loaderData.id}`),
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Dentist",
          name: `Lumière Dental Studio — ${loaderData.name}`,
          address: loaderData.address,
          telephone: loaderData.phone,
          areaServed: loaderData.area,
        }),
      }],
    };
  },
  component: Location,
});

function Location() {
  const b = Route.useLoaderData();
  const scene = sceneForBranch(b.id);
  const dentists = DENTISTS.filter((d) => d.branches.includes(b.id));
  return (
    <SiteLayout>
      <section className="border-b bg-secondary/60">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground"><Link to="/">Home</Link> / <Link to="/locations">Studios</Link> / <span className="text-foreground">{b.city}</span></nav>
          <p className="mt-6 text-xs uppercase tracking-[0.25em] text-gold">{b.city}</p>
          <h1 className="mt-3 font-serif text-5xl text-primary">{b.name}</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{b.blurb}</p>
          <Button asChild className="mt-8" size="lg"><Link to="/book" search={{ branch: b.id }}>Request a time at {b.city}</Link></Button>
        </div>
      </section>
      <img src={scene.src} alt={scene.alt} width={1600} height={900} className="aspect-[21/8] w-full object-cover" />
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-2">
        <div className="space-y-3 text-sm">
          <p>{b.address}</p>
          <p>{b.phone}</p>
          <p>{b.email}</p>
          <p>{b.hours}</p>
          <p className="text-muted-foreground">People visit from {b.area}. This is a fictional studio.</p>
          <iframe title={`Map of ${b.name}`} className="mt-4 h-64 w-full rounded-2xl border" loading="lazy" src={b.map} />
        </div>
        <div>
          <h2 className="font-serif text-2xl text-primary">Dentists at this studio</h2>
          <ul className="mt-4 space-y-4">
            {dentists.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4">
                <span><span className="block font-medium">{d.name}</span><span className="text-sm text-muted-foreground">{d.title}</span></span>
                <Button asChild variant="outline" size="sm"><Link to="/book" search={{ dentist: d.id, branch: b.id }}>Book</Link></Button>
              </li>
            ))}
          </ul>
          <h2 className="mt-10 font-serif text-2xl text-primary">Care offered nearby</h2>
          <ul className="mt-4 columns-1 text-sm sm:columns-2">
            {TREATMENTS.map((t) => (
              <li key={t.slug} className="mb-2"><Link to="/treatments/$slug" params={{ slug: t.slug }} className="text-primary hover:underline">{t.name}</Link></li>
            ))}
          </ul>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-5 pb-20">
        <h2 className="font-serif text-3xl text-primary">Questions about {b.city}</h2>
        <Accordion type="single" collapsible className="mt-4">
          {b.faqs.map((f) => <AccordionItem key={f.q} value={f.q}><AccordionTrigger>{f.q}</AccordionTrigger><AccordionContent>{f.a}</AccordionContent></AccordionItem>)}
        </Accordion>
      </section>
    </SiteLayout>
  );
}
