import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Sparkles, HeartHandshake, CalendarClock, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteLayout, seo } from "@/components/site/SiteLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SceneGallery } from "@/components/site/SceneGallery";
import { HeroVideo } from "@/components/site/HeroVideo";
import { Reveal, Tilt } from "@/components/fx/Motion";
import { BRANCHES, DENTISTS, FAQS, POSTS, REVIEWS, TREATMENTS, VISIT_PREP, money } from "@/lib/data";
import { procedureFor } from "@/lib/procedures";
import { SCENES, sceneForBranch, sceneForPost } from "@/lib/scenes";

export const Route = createFileRoute("/")({
  head: () => seo("Lumière Dental Studio — Exceptional Dental Care", "Personalised general, cosmetic and implant dentistry in a calm, modern studio. Book your appointment online.", "/"),
  component: Home,
});

const TRUST = [
  { icon: ShieldCheck, label: "Experienced dental professionals" },
  { icon: Sparkles, label: "Modern technology" },
  { icon: HeartHandshake, label: "Personalised treatment" },
  { icon: CalendarClock, label: "Convenient appointments" },
];

function Home() {
  return (
    <SiteLayout overlay>
      <section className="relative min-h-[92vh] overflow-hidden bg-primary">
        <HeroVideo />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-primary/40" />
        <div className="hero-rise relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-5 pt-24 pb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Lumière Dental Studio</p>
          <h1 className="mt-5 max-w-2xl font-serif text-5xl leading-[1.05] text-primary-foreground md:text-7xl">
            Exceptional Dental Care. <em className="text-gold">Beautiful Smiles.</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-primary-foreground/80">
            Experience personalised dentistry where advanced technology, compassionate care, and beautiful results come together.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg" className="btn-sheen bg-gold text-gold-foreground shadow-[0_10px_30px_-10px_var(--gold)] transition-transform hover:-translate-y-0.5 hover:bg-gold/90">
              <Link to="/book">Book Your Appointment</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link to="/treatments">Explore Our Treatments</Link>
            </Button>
          </div>
          <ul className="mt-14 grid max-w-3xl gap-3 sm:grid-cols-2 md:grid-cols-4">
            {TRUST.map(({ icon: I, label }) => (
              <li key={label} className="flex items-center gap-2.5 rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 px-3 py-2.5 text-sm leading-snug text-primary-foreground/85 backdrop-blur-sm">
                <I className="h-4 w-4 shrink-0 text-gold" />{label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-2 md:items-center">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.25em] text-gold">About the studio</p>
          <h2 className="mt-3 font-serif text-4xl text-primary md:text-5xl">Dentistry that feels considered.</h2>
          <p className="mt-6 text-muted-foreground">
            We designed Lumière around one idea: every patient deserves time. Unhurried consultations, clear explanations, and a calm environment make good care feel easy.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-4 text-sm">
            {["Experienced dentists", "Personalised care", "Modern equipment", "Comfortable environment", "Patient-first approach", "Transparent pricing"].map((x) => (
              <li key={x} className="border-l-2 border-gold pl-3 text-foreground">{x}</li>
            ))}
          </ul>
          <Button asChild variant="link" className="mt-6 px-0"><Link to="/about">Our philosophy <ArrowRight className="h-4 w-4" /></Link></Button>
        </Reveal>
        <Reveal delay={120} className="rounded-3xl bg-secondary/60 p-4 sm:p-6">
          <p className="px-2 pb-4 text-xs uppercase tracking-[0.25em] text-primary/70">Bring to your first visit</p>
          <div className="grid gap-3">
            {VISIT_PREP.map((item, i) => (
              <article key={item.title} className="flex gap-4 rounded-2xl border bg-card p-5 transition-shadow hover:shadow-soft">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary font-serif text-sm text-gold">{i + 1}</span>
                <div>
                  <h3 className="font-serif text-xl text-primary">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="bg-secondary/60 py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gold">Treatments</p>
              <h2 className="mt-3 font-serif text-4xl text-primary md:text-5xl">Care for every smile</h2>
            </div>
            <Button asChild variant="outline"><Link to="/treatments">All treatments</Link></Button>
          </div>
          <div className="-mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
            {TREATMENTS.slice(0, 6).map((t, i) => {
              const photo = procedureFor(t.slug);
              return (
                <Reveal key={t.slug} delay={(i % 3) * 110} className="w-[78%] shrink-0 snap-start sm:w-auto">
                <Tilt className="h-full rounded-2xl">
                <Link to="/treatments/$slug" params={{ slug: t.slug }} className="group block h-full overflow-hidden rounded-2xl border bg-card transition-shadow duration-300 hover:shadow-soft">
                  <img src={photo.src} alt={photo.alt} loading="lazy" width={1200} height={900} className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                  <div className="p-6">
                    <h3 className="font-serif text-xl text-primary">{t.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{t.short}</p>
                    <p className="mt-4 flex items-center justify-between text-xs"><span className="text-gold">From {money(t.price)}</span><ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" /></p>
                  </div>
                </Link>
                </Tilt>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24">
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Meet our dentists</p>
        <h2 className="mt-3 font-serif text-4xl text-primary md:text-5xl">Your care team</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {DENTISTS.map((d, i) => (
            <Reveal key={d.id} delay={i * 120}>
              <Tilt className="rounded-2xl" max={10}>
                <img src={d.photo} alt={d.name} loading="lazy" width={800} height={1008} className="aspect-[4/5] w-full rounded-2xl object-cover shadow-soft" />
              </Tilt>
              <h3 className="mt-5 font-serif text-2xl text-primary">{d.name}</h3>
              <p className="text-sm text-muted-foreground">{d.title} · {d.qualifications}</p>
              <Button asChild variant="link" className="px-0"><Link to="/book" search={{ dentist: d.id }}>Book with {d.name.split(" ")[1]}</Link></Button>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-primary py-24 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="font-serif text-4xl md:text-5xl">What patients say</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {REVIEWS.slice(0, 3).map((r, i) => (
              <Reveal key={r.name} delay={i * 120}>
              <Tilt className="h-full rounded-2xl" max={6}>
              <figure className="flex h-full flex-col rounded-2xl border border-primary-foreground/15 bg-primary-foreground/[0.03] p-7">
                <Quote className="h-6 w-6 text-gold" />
                <blockquote className="mt-4 mb-6 text-primary-foreground/85">{r.text}</blockquote>
                <figcaption className="mt-auto border-t border-primary-foreground/10 pt-5 text-sm text-primary-foreground/60">{r.name} · {r.treatment}</figcaption>
              </figure>
              </Tilt>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-xs text-primary-foreground/50">Sample testimonials for demonstration.</p>
        </div>
      </section>

      <section className="border-y bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-4">
          {[
            ["01", "Tell us what you want", "The visit starts with the reason you came, not a menu of treatments."],
            ["02", "We examine, then explain", "You leave with what was seen and whether anything needs to happen."],
            ["03", "You decide", "Fees and alternatives are written down before a tooth is prepared."],
            ["04", "We stay in touch", "Confirmations in this demo are simulated, and they show in your portal."],
          ].map(([n, h, p], i) => (
            <Reveal key={n} delay={i * 100}>
              <p className="grid h-10 w-10 place-items-center rounded-full border border-gold/60 font-serif text-sm text-gold">{n}</p>
              <h2 className="mt-3 font-serif text-2xl text-primary">{h}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{p}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-primary py-24 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gold">The rooms</p>
              <h2 className="mt-3 font-serif text-4xl md:text-5xl">Walk through before you book</h2>
            </div>
            <Button asChild variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link to="/gallery">Open the gallery</Link>
            </Button>
          </div>
          <p className="mt-4 max-w-xl text-primary-foreground/75">Select a room. Arrow keys move through the set. These are photographs of the studios, not of patients.</p>
          <Reveal className="mt-10">
            <SceneGallery scenes={SCENES} layout="bento" />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-24 md:grid-cols-2">
        {BRANCHES.map((b, i) => {
          const scene = sceneForBranch(b.id);
          return (
            <Reveal key={b.id} delay={i * 120}>
            <Tilt className="h-full rounded-2xl" max={5}>
            <Link to="/locations/$slug" params={{ slug: b.id }} className="group block h-full overflow-hidden rounded-2xl border bg-card transition-shadow duration-300 hover:shadow-soft">
              <img src={scene.src} alt={scene.alt} loading="lazy" width={1600} height={900} className="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
              <div className="p-8">
                <p className="text-xs uppercase tracking-[0.25em] text-gold">{b.city}</p>
                <h2 className="mt-3 font-serif text-3xl text-primary">{b.name}</h2>
                <p className="mt-3 text-muted-foreground">{b.blurb}</p>
                <p className="mt-4 text-sm">{b.hours}</p>
              </div>
            </Link>
            </Tilt>
            </Reveal>
          );
        })}
      </section>

      <section className="bg-secondary/50 py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-serif text-4xl text-primary">From the journal</h2>
            <Button asChild variant="outline"><Link to="/blog">All notes</Link></Button>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {POSTS.map((post, i) => {
              const scene = sceneForPost(post.slug);
              return (
                <Reveal key={post.slug} delay={i * 110}>
                <Tilt className="h-full rounded-2xl" max={6}>
                <Link to="/blog/$slug" params={{ slug: post.slug }} className="group block h-full overflow-hidden rounded-2xl bg-card transition-shadow duration-300 hover:shadow-soft">
                  <div className="overflow-hidden"><img src={scene.src} alt="" loading="lazy" width={1200} height={800} className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.03]" /></div>
                  <div className="p-7">
                    <p className="text-xs uppercase tracking-[0.2em] text-gold">{post.date}</p>
                    <h3 className="mt-3 font-serif text-2xl text-primary">{post.title}</h3>
                    <p className="mt-3 text-sm text-muted-foreground">{post.excerpt}</p>
                  </div>
                </Link>
                </Tilt>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold">Before you call</p>
          <h2 className="mt-3 font-serif text-4xl text-primary">Questions we answer every week</h2>
          <p className="mt-4 text-muted-foreground">Short answers, so you can decide whether to book. A dentist who has examined you is still the right person to plan treatment.</p>
        </div>
        <Accordion type="single" collapsible className="rounded-2xl border bg-card px-6">
          {FAQS.map((item, i) => (
            <AccordionItem key={item.q} value={`faq-${i}`}>
              <AccordionTrigger className="font-serif text-lg text-primary hover:no-underline">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24">
        <Reveal className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground md:py-20">
          <div aria-hidden className="float-slow pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full border border-gold/30" />
          <div aria-hidden className="float-slow pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full border border-gold/20 [animation-delay:-4s]" />
          <p className="relative text-xs uppercase tracking-[0.3em] text-gold">Bayview · Riverside</p>
          <h2 className="relative mt-4 font-serif text-4xl md:text-5xl">Ready for your next visit?</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-primary-foreground/75">Choose a treatment, a dentist and a time that suits you — it takes about a minute.</p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="btn-sheen bg-gold text-gold-foreground hover:bg-gold/90"><Link to="/book">Book Your Appointment</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"><Link to="/contact">Ask a question</Link></Button>
          </div>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
