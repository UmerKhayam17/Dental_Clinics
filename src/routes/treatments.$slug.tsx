import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SiteLayout, seo } from "@/components/site/SiteLayout";
import { TREATMENTS, money } from "@/lib/data";
import { procedureFor } from "@/lib/procedures";

export const Route = createFileRoute("/treatments/$slug")({
  loader: ({ params }) => {
    const t = TREATMENTS.find((x) => x.slug === params.slug);
    if (!t) throw notFound();
    return t;
  },
  head: ({ loaderData }) =>
    loaderData
      ? seo(`${loaderData.name} | Lumière Dental Studio`, loaderData.short, `/treatments/${loaderData.slug}`)
      : { meta: [{ title: "Treatment not found" }, { name: "robots", content: "noindex" }] },
  notFoundComponent: () => (
    <SiteLayout><div className="mx-auto max-w-xl px-5 py-32 text-center"><h1 className="font-serif text-4xl text-primary">Treatment not found</h1><Button asChild className="mt-6"><Link to="/treatments">View all treatments</Link></Button></div></SiteLayout>
  ),
  component: Detail,
});

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="font-serif text-2xl text-primary">{title}</h2>
      <ul className="mt-4 space-y-2">
        {items.map((i) => <li key={i} className="flex gap-2 text-muted-foreground"><Check className="mt-1 h-4 w-4 shrink-0 text-gold" />{i}</li>)}
      </ul>
    </div>
  );
}

function Detail() {
  const t = Route.useLoaderData();
  const photo = procedureFor(t.slug);
  return (
    <SiteLayout>
      <section className="border-b bg-secondary/60">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <Link to="/">Home</Link> / <Link to="/treatments">Treatments</Link> / <span className="text-foreground">{t.name}</span>
          </nav>
          <h1 className="mt-6 font-serif text-5xl text-primary md:text-6xl">{t.name}</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{t.overview}</p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Button asChild size="lg"><Link to="/book" search={{ treatment: t.slug }}>Book a consultation</Link></Button>
            <span className="text-sm text-muted-foreground">Typical visit {t.duration} min · From {money(t.price)}</span>
          </div>
        </div>
      </section>
      <figure className="mx-auto max-w-7xl px-5 pt-10">
        <img src={photo.src} alt={photo.alt} width={1200} height={900} className="aspect-[16/9] w-full rounded-2xl object-cover" />
        <figcaption className="mt-3 text-xs text-muted-foreground">{photo.caption} Demonstration photograph, not a record of a real patient.</figcaption>
      </figure>
      <section className="mx-auto grid max-w-7xl gap-14 px-5 py-20 md:grid-cols-2">
        <List title="Benefits" items={t.benefits} />
        <List title="Who may need it" items={t.whoFor} />
        <div>
          <h2 className="font-serif text-2xl text-primary">The process</h2>
          <ol className="mt-4 space-y-3">
            {t.process.map((p, i) => <li key={p} className="flex gap-3 text-muted-foreground"><span className="font-serif text-gold">{i + 1}.</span>{p}</li>)}
          </ol>
        </div>
        <List title="Aftercare" items={t.aftercare} />
      </section>
      <section className="mx-auto max-w-3xl px-5 pb-24">
        <h2 className="font-serif text-3xl text-primary">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="mt-6">
          {t.faqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}><AccordionTrigger>{f.q}</AccordionTrigger><AccordionContent>{f.a}</AccordionContent></AccordionItem>
          ))}
        </Accordion>
        <p className="mt-8 text-xs text-muted-foreground">General information only. Clinical content should be reviewed by a qualified dentist before publication.</p>
      </section>
    </SiteLayout>
  );
}
