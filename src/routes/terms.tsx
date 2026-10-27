import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteLayout, seo } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/terms")({
  head: () => seo("Terms & Conditions | Lumière Dental Studio", "Terms of use for the Lumière Dental Studio demonstration.", "/terms"),
  component: () => (
    <SiteLayout>
      <PageHero eyebrow="Legal" title="Terms & Conditions" />
      <div className="mx-auto max-w-3xl space-y-4 px-5 py-16 text-muted-foreground">
        <p>Lumière Dental Studio is fictional. All dentists, patients, prices and appointments are synthetic data for demonstration only.</p>
        <p>Nothing on this site is medical advice. Technology by Next Software Development Company.</p>
      </div>
    </SiteLayout>
  ),
});
