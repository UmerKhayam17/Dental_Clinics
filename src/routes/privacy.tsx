import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteLayout, seo } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/privacy")({
  head: () => seo("Privacy Policy | Lumière Dental Studio", "How the Lumière demonstration handles information you enter.", "/privacy"),
  component: () => (
    <SiteLayout>
      <PageHero eyebrow="Legal" title="Privacy Policy" />
      <div className="mx-auto max-w-3xl space-y-4 px-5 py-16 text-muted-foreground">
        <p>This is a demonstration. Information you enter (bookings, messages) is stored only in your own browser and is not sent to any clinic.</p>
        <p>Do not enter real medical information. A production deployment would include a full policy reviewed for local healthcare privacy regulations.</p>
      </div>
    </SiteLayout>
  ),
});
