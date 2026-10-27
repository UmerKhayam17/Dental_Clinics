import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X, Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readSession } from "@/lib/auth";
import { CLINIC, TREATMENTS } from "@/lib/data";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/treatments", label: "Treatments" },
  { to: "/dentists", label: "Our Dentists" },
  { to: "/gallery", label: "Gallery" },
  { to: "/reviews", label: "Reviews" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
] as const;

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className={cn("grid h-9 w-9 place-items-center rounded-full border font-serif text-lg", light ? "border-gold text-gold" : "border-primary text-primary")}>L</span>
      <span className={cn("font-serif text-xl leading-none", light ? "text-primary-foreground" : "text-primary")}>
        Lumière<span className="block font-sans text-[10px] uppercase tracking-[0.3em] opacity-70">Dental Studio</span>
      </span>
    </Link>
  );
}

export function SiteLayout({ children, overlay }: { children: ReactNode; overlay?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => { setSignedIn(!!readSession()); }, []);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 40);
    f();
    window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);
  const solid = !overlay || scrolled || open;

  return (
    <div className="min-h-screen bg-background">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:px-4 focus:py-2">Skip to content</a>
      <div className="bg-primary py-1.5 text-center text-xs text-primary-foreground/80">
        Demo: clinic website &amp; management system. We offer these solutions to clinics — developed by{" "}
        <a
          href="https://nextsoftwaredevelopment.com/"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-gold"
        >
          Next Software Development Company
        </a>
      </div>
      <header className={cn("sticky top-0 z-40 transition-colors duration-300", solid ? "border-b bg-background/95 backdrop-blur" : "bg-transparent", overlay && "-mb-[73px]")}>
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5">
          <Logo light={!solid} />
          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
                className={cn("relative py-1 text-sm transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform hover:after:scale-x-100 data-[status=active]:after:scale-x-100", solid ? "text-foreground/75 hover:text-primary" : "text-primary-foreground/85 hover:text-primary-foreground")}
                activeProps={{ className: solid ? "!text-primary font-semibold" : "!text-primary-foreground font-semibold" }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="outline" className={cn(!solid && "border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground")}>
              <Link to={signedIn ? "/dashboard" : "/login"}>{signedIn ? "Practice desk" : "Login"}</Link>
            </Button>
            <Button asChild size="sm" className={cn("hidden sm:inline-flex", !solid && "bg-gold text-gold-foreground hover:bg-gold/90")}>
              <Link to="/book">Book Appointment</Link>
            </Button>
            <button aria-label="Toggle menu" onClick={() => setOpen(!open)} aria-expanded={open} className={cn("rounded-md p-2 lg:hidden", solid ? "text-primary" : "text-primary-foreground")}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t bg-background px-5 py-4 lg:hidden">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} activeOptions={{ exact: n.to === "/" }} className="block border-b border-border/60 py-3 text-foreground" activeProps={{ className: "!text-primary font-semibold" }}>{n.label}</Link>
            ))}
            <div className="mt-3 grid gap-2">
              <Button asChild variant="outline"><Link to={signedIn ? "/dashboard" : "/login"} onClick={() => setOpen(false)}>{signedIn ? "Practice desk" : "Login"}</Link></Button>
              <Button asChild><Link to="/book" onClick={() => setOpen(false)}>Book Appointment</Link></Button>
            </div>
          </nav>
        )}
      </header>
      <main id="content">{children}</main>
      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 text-sm text-primary-foreground/70">{CLINIC.tagline}</p>
          <div className="mt-5 flex gap-2 text-primary-foreground/70">
            <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-primary-foreground/20 transition-colors hover:border-gold hover:text-gold"><Instagram className="h-4 w-4" /></a>
            <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-primary-foreground/20 transition-colors hover:border-gold hover:text-gold"><Facebook className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">Studio</h3>
          <ul className="space-y-2 text-sm text-primary-foreground/75 [&_a]:transition-colors [&_a:hover]:text-gold">
            {NAV.slice(1).map((n) => <li key={n.to}><Link to={n.to}>{n.label}</Link></li>)}
            <li><Link to="/locations">Studios</Link></li>
            <li><Link to="/portal">Patient Portal</Link></li>
            <li><Link to="/dashboard">Clinic Dashboard (demo)</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">Treatments</h3>
          <ul className="space-y-2 text-sm text-primary-foreground/75 [&_a]:transition-colors [&_a:hover]:text-gold">
            {TREATMENTS.slice(0, 7).map((t) => (
              <li key={t.slug}><Link to="/treatments/$slug" params={{ slug: t.slug }}>{t.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">Visit</h3>
          <ul className="space-y-3 text-sm text-primary-foreground/75">
            <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-gold" />{CLINIC.address}</li>
            <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-gold" />{CLINIC.phone}</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0 text-gold" />{CLINIC.email}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-5 py-5 text-xs text-primary-foreground/60">
          <span>© {new Date().getFullYear()} {CLINIC.name} · Fictional demonstration</span>
          <span className="flex flex-wrap gap-4 [&_a:hover]:text-gold">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms</Link>
            <a
              href="https://nextsoftwaredevelopment.com/"
              target="_blank"
              rel="noreferrer"
            >
              Powered by Next Software Development Company
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

export function PageHero({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <section className="relative overflow-hidden border-b bg-secondary/60">
      <div aria-hidden className="float-slow pointer-events-none absolute -top-40 right-[-6rem] h-[26rem] w-[26rem] rounded-full border border-gold/30" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 right-40 hidden h-56 w-56 rounded-full bg-primary/[0.04] md:block" />
      <div className="hero-rise relative mx-auto max-w-7xl px-5 py-16 md:py-20">
        <p className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-gold"><span className="h-px w-8 bg-gold" />{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl text-primary md:text-6xl">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{intro}</p>}
      </div>
    </section>
  );
}

export function seo(title: string, description: string, path: string) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: path }],
  };
}
