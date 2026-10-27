import { createFileRoute } from "@tanstack/react-router";
import { Quote } from "lucide-react";
import { PageHero, SiteLayout, seo } from "@/components/site/SiteLayout";
import { REVIEWS } from "@/lib/data";

export const Route = createFileRoute("/reviews")({
  head: () => seo("Patient Reviews | Lumière Dental Studio", "Read what patients say about their experience at Lumière Dental Studio.", "/reviews"),
  component: () => (
    <SiteLayout>
      <PageHero eyebrow="Patient reviews" title="Kind words, written for the demonstration." intro="These are fictional sample testimonials. They are not verified reviews and do not describe real patients." />
      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-20 md:grid-cols-2 lg:grid-cols-3">
        {REVIEWS.map((r) => (
          <figure key={r.name} className="rounded-2xl border bg-card p-8">
            <Quote className="h-6 w-6 text-gold" />
            <blockquote className="mt-4 text-foreground">{r.text}</blockquote>
            <figcaption className="mt-6 text-sm text-muted-foreground">{r.name} · {r.treatment}</figcaption>
          </figure>
        ))}
      </section>
    </SiteLayout>
  ),
});
