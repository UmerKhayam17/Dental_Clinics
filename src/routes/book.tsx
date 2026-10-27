import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHero, SiteLayout, seo } from "@/components/site/SiteLayout";
import { BRANCHES, DENTISTS, TIME_SLOTS, TREATMENTS } from "@/lib/data";
import { procedureFor } from "@/lib/procedures";
import { bookingSchema } from "@/lib/schemas";
import { addDays, bookAppointment, bookedSlots, useDemo } from "@/lib/store";
import { cn } from "@/lib/utils";

type Search = { dentist?: string; treatment?: string; branch?: string };

export const Route = createFileRoute("/book")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    dentist: typeof s.dentist === "string" ? s.dentist : undefined,
    treatment: typeof s.treatment === "string" ? s.treatment : undefined,
    branch: typeof s.branch === "string" ? s.branch : undefined,
  }),
  head: () => seo("Book an Appointment | Lumière Dental Studio", "Choose your treatment, dentist, date and time and request an appointment online.", "/book"),
  component: Book,
});

function Book() {
  const search = Route.useSearch();
  const [state] = useDemo();
  const initialBranch = BRANCHES.some((b) => b.id === search.branch) ? search.branch! : "bayview";
  const [treatment, setTreatment] = useState(search.treatment ?? TREATMENTS[0].slug);
  const [branch, setBranch] = useState(initialBranch);
  const [dentist, setDentist] = useState(() => {
    const allowed = DENTISTS.filter((d) => d.branches.includes(initialBranch));
    return allowed.some((d) => d.id === search.dentist) ? search.dentist! : allowed[0].id;
  });
  const [date, setDate] = useState(addDays(1));
  const [time, setTime] = useState("");
  const [c, setC] = useState({ name: "", email: "", phone: "", notes: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string | null>(null);

  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(i + 1)).filter((d) => new Date(d).getDay() !== 0), []);
  const taken = bookedSlots(state, dentist, date);

  const dentists = DENTISTS.filter((d) => d.branches.includes(branch));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = bookingSchema.safeParse({ ...c, time });
    if (!parsed.success) {
      const er: Record<string, string> = {};
      for (const issue of parsed.error.issues) er[String(issue.path[0])] = issue.message;
      setErr(er);
      return;
    }
    setErr({});
    const id = bookAppointment({ ...c, treatment: TREATMENTS.find((t) => t.slug === treatment)!.name, dentistId: dentist, date, time, branchId: branch });
    if (!id) { setErr({ time: "That time was just taken. Please choose another." }); return; }
    setDone(id);
  };

  if (done) {
    const d = DENTISTS.find((x) => x.id === dentist)!;
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-5 py-28 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
          <h1 className="mt-6 font-serif text-4xl text-primary">Request received</h1>
          <p className="mt-4 text-muted-foreground">
            Thank you, {c.name.split(" ")[0]}. Your request for {new Date(date).toDateString()} at {time} with {d.name} has been sent to reception (reference {done}).
            You'll receive a confirmation once they approve it — a simulated email preview will appear in your patient portal.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild><Link to="/portal" search={{ email: c.email }}>Open patient portal</Link></Button>
            <Button asChild variant="outline"><Link to="/">Back to home</Link></Button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  const step = "rounded-2xl border bg-card p-6 md:p-8";
  const chip = (on: boolean, disabled?: boolean) =>
    cn("rounded-lg border px-3 py-2 text-sm transition-colors", on ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary", disabled && "cursor-not-allowed opacity-40 line-through hover:border-border");

  return (
    <SiteLayout>
      <PageHero eyebrow="Appointments" title="Book your visit" intro="Requests are reviewed by our reception team, who will confirm your appointment." />
      <form onSubmit={submit} noValidate className="mx-auto grid max-w-5xl gap-6 px-5 py-16">
        <section className={step}>
          <h2 className="flex items-center gap-3 font-serif text-xl text-primary"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-sans text-sm font-semibold text-gold">1</span>Treatment</h2>
          <img src={procedureFor(treatment).src} alt={procedureFor(treatment).alt} width={1200} height={900} className="mt-4 aspect-[16/9] w-full rounded-xl object-cover" />
          <p className="mt-2 text-xs text-muted-foreground">{procedureFor(treatment).caption} Demonstration photograph, not a record of a real patient.</p>
          <div className="mt-4 flex flex-wrap gap-2">{TREATMENTS.map((t) => <button type="button" key={t.slug} onClick={() => setTreatment(t.slug)} className={chip(treatment === t.slug)}>{t.name}</button>)}</div>
        </section>
        <section className={step}>
          <h2 className="flex items-center gap-3 font-serif text-xl text-primary"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-sans text-sm font-semibold text-gold">2</span>Studio and dentist</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {BRANCHES.map((b) => (
              <button type="button" key={b.id} onClick={() => {
                setBranch(b.id);
                const allowed = DENTISTS.filter((d) => d.branches.includes(b.id));
                if (!allowed.some((d) => d.id === dentist)) { setDentist(allowed[0].id); setTime(""); }
              }} className={chip(branch === b.id)}>{b.name}</button>
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {dentists.map((d) => (
              <button type="button" key={d.id} onClick={() => { setDentist(d.id); setTime(""); }} className={cn("flex items-center gap-3 rounded-xl border p-3 text-left", dentist === d.id ? "border-primary ring-1 ring-primary" : "hover:border-primary")}>
                <img src={d.photo} alt="" className="h-12 w-12 rounded-full object-cover" />
                <span><span className="block font-medium">{d.name}</span><span className="text-xs text-muted-foreground">{d.title}</span></span>
              </button>
            ))}
          </div>
        </section>
        <section className={step}>
          <h2 className="flex items-center gap-3 font-serif text-xl text-primary"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-sans text-sm font-semibold text-gold">3</span>Date & time</h2>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {days.map((d) => { const dt = new Date(d); return (
              <button type="button" key={d} onClick={() => { setDate(d); setTime(""); }} className={cn(chip(date === d), "min-w-16 text-center")}>
                <span className="block text-xs opacity-70">{dt.toLocaleDateString("en", { weekday: "short" })}</span>{dt.getDate()}
              </button>
            ); })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {TIME_SLOTS.map((s) => <button type="button" key={s} disabled={taken.has(s)} onClick={() => setTime(s)} className={chip(time === s, taken.has(s))}>{s}</button>)}
          </div>
          {err.time && <p className="mt-2 text-sm text-destructive">{err.time}</p>}
        </section>
        <section className={step}>
          <h2 className="flex items-center gap-3 font-serif text-xl text-primary"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary font-sans text-sm font-semibold text-gold">4</span>Your details</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {([["name", "Full name"], ["email", "Email"], ["phone", "Phone"]] as const).map(([k, l]) => (
              <div key={k}><Label htmlFor={k}>{l}</Label><Input id={k} value={c[k]} onChange={(e) => setC({ ...c, [k]: e.target.value })} aria-invalid={!!err[k]} className="mt-1.5" />{err[k] && <p className="mt-1 text-sm text-destructive">{err[k]}</p>}</div>
            ))}
          </div>
          <div className="mt-4"><Label htmlFor="notes">Anything we should know? (optional)</Label><Textarea id="notes" value={c.notes} onChange={(e) => setC({ ...c, notes: e.target.value })} className="mt-1.5" /></div>
        </section>
        <Button type="submit" size="lg" className="justify-self-end">Request appointment</Button>
      </form>
    </SiteLayout>
  );
}
