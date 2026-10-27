import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHero, SiteLayout, seo } from "@/components/site/SiteLayout";
import { SceneGallery } from "@/components/site/SceneGallery";
import { BRANCHES, FAQS, VISIT_PREP } from "@/lib/data";
import { SCENES, sceneForBranch } from "@/lib/scenes";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/about")({
  head: () => seo("About Us | Lumière Dental Studio", "How a first visit works, which studio to choose, and what this demonstration clinic will and will not promise.", "/about"),
  component: About,
});

function About() {
  return (
    <SiteLayout>
      <PageHero eyebrow="About" title="A studio designed around time, comfort and clarity." intro="Lumière is a fictional clinic. The way a visit is described here is the standard we would want from a real one." />
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-2">
        <div className="grid gap-4">
          <img src={hero} alt="Bayview treatment room" loading="lazy" width={1600} height={1104} className="aspect-[4/3] w-full rounded-2xl object-cover" />
          <div className="grid grid-cols-2 gap-4">
            {SCENES.filter((s) => s.id === "reception" || s.id === "consult").map((s) => (
              <img key={s.id} src={s.src} alt={s.alt} loading="lazy" width={800} height={600} className="aspect-[4/3] w-full rounded-2xl object-cover" />
            ))}
          </div>
        </div>
        <div className="space-y-5 text-muted-foreground">
          <p>The studio was built around one rule: the examination comes before the treatment menu. You should know what was seen, what can wait, and what it costs before anyone prepares a tooth.</p>
          {[
            ["Experienced dentists", "General, restorative, implant, and orthodontic care, split across two studios so the longer visits have a room that can actually hold them."],
            ["Personalised care", "A plan is written around your health, the tooth in front of us, and the budget you name. Declining treatment is a complete answer."],
            ["Modern equipment", "Imaging is recommended when it changes a decision, not as a routine extra. The chart in the practice desk records what was found."],
            ["Comfortable environment", "Quiet rooms and an unhurried first visit. If you are nervous, say so. The pace should change."],
          ].map(([h, p]) => (
            <div key={h} className="border-l-2 border-gold pl-4"><h2 className="font-serif text-xl text-primary">{h}</h2><p>{p}</p></div>
          ))}
        </div>
      </section>
      <section className="bg-secondary/60 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="font-serif text-4xl text-primary">What a first visit includes</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {VISIT_PREP.map((item) => (
              <article key={item.title} className="rounded-2xl bg-card p-6">
                <h3 className="font-serif text-2xl text-primary">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-20">
        <h2 className="font-serif text-4xl text-primary">The studios, room by room</h2>
        <p className="mt-3 max-w-xl text-muted-foreground">Open any photograph. These rooms belong to the demonstration. They are not pictures of patients.</p>
        <div className="mt-8"><SceneGallery scenes={SCENES} /></div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-20 md:grid-cols-2">
        {BRANCHES.map((b) => {
          const scene = sceneForBranch(b.id);
          return (
          <article key={b.id} className="overflow-hidden rounded-2xl border">
            <img src={scene.src} alt={scene.alt} loading="lazy" width={1600} height={900} className="aspect-[16/9] w-full object-cover" />
            <div className="p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-gold">{b.city}</p>
            <h2 className="mt-2 font-serif text-3xl text-primary">{b.name}</h2>
            <p className="mt-3 text-muted-foreground">{b.blurb}</p>
            <p className="mt-3 text-sm">{b.address}</p>
            <p className="text-sm text-muted-foreground">{b.hours}</p>
            <Button asChild variant="link" className="mt-4 px-0"><Link to="/locations/$slug" params={{ slug: b.id }}>Studio details</Link></Button>
            </div>
          </article>
          );
        })}
      </section>
      <section className="mx-auto max-w-3xl px-5 pb-20">
        <h2 className="font-serif text-3xl text-primary">Plain answers</h2>
        <dl className="mt-6 space-y-6">
          {FAQS.map((item) => (
            <div key={item.q}>
              <dt className="font-medium text-primary">{item.q}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </SiteLayout>
  );
}
