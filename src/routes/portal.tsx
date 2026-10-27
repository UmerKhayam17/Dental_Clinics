import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageHero, SiteLayout, seo } from "@/components/site/SiteLayout";
import { DENTISTS, money } from "@/lib/data";
import { addFeedback, invoiceBalance, invoiceTotal, requestReschedule, setComms, useDemo } from "@/lib/store";

export const Route = createFileRoute("/portal")({
  validateSearch: (s: Record<string, unknown>): { email?: string } => ({ email: typeof s.email === "string" ? s.email : undefined }),
  head: () => ({
    ...seo("Patient Portal | Lumière Dental Studio", "View your own appointments, treatment plans, and invoices.", "/portal"),
    meta: [
      { title: "Patient Portal | Lumière Dental Studio" },
      { name: "description", content: "View your own appointments, treatment plans, and invoices." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Portal,
});

function Portal() {
  const search = Route.useSearch();
  const [state, ready] = useDemo();
  const [email, setEmail] = useState(search.email ?? "");
  const [active, setActive] = useState(search.email ?? "");
  const [feedback, setFeedback] = useState("");
  const p = state.patients.find((x) => x.email.toLowerCase() === active.toLowerCase());
  const appts = state.appointments.filter((a) => a.patientId === p?.id).sort((a, b) => b.date.localeCompare(a.date));
  const invs = state.invoices.filter((i) => i.patientId === p?.id);
  const plans = state.plans.filter((t) => t.patientId === p?.id);
  const messages = state.messages.filter((m) => m.patientId === p?.id);

  return (
    <SiteLayout>
      <PageHero eyebrow="Patient portal" title={p ? `Welcome, ${p.name.split(" ")[0]}` : "Your Lumière account"} intro="Demonstration sign-in uses the email on the record. Try olivia@example.demo, or the email you just booked with. You only see that record." />
      <div className="mx-auto max-w-5xl px-5 py-12">
        <form onSubmit={(e) => { e.preventDefault(); setActive(email.trim()); }} className="flex max-w-md gap-2">
          <Input type="email" aria-label="Email" placeholder="you@example.demo" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit">Open</Button>
        </form>
        {ready && active && !p && <p className="mt-6 text-muted-foreground">No record uses that email. <Link className="text-primary underline" to="/book">Request a first visit</Link>.</p>}
        {p && (
          <div className="mt-10 grid gap-10">
            <section>
              <h2 className="font-serif text-2xl text-primary">Appointments</h2>
              <div className="mt-4 divide-y rounded-2xl border bg-card">
                {appts.length === 0 && <p className="p-6 text-muted-foreground">No appointments yet.</p>}
                {appts.map((a) => (
                  <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
                    <div>
                      <p className="font-medium">{a.treatment}</p>
                      <p className="text-sm text-muted-foreground">{new Date(a.date + "T12:00:00").toDateString()} · {a.time} · {DENTISTS.find((d) => d.id === a.dentistId)?.name}</p>
                      {a.rescheduleRequested && <p className="text-xs text-warning">Reschedule request sent to reception</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={a.status === "Confirmed" ? "default" : "secondary"}>{a.status}</Badge>
                      {a.status !== "Cancelled" && a.status !== "Completed" && !a.rescheduleRequested && (
                        <Button size="sm" variant="outline" onClick={() => { requestReschedule(a.id); toast.success("Reception can see the request"); }}>Ask to reschedule</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
            {plans.length > 0 && (
              <section>
                <h2 className="font-serif text-2xl text-primary">Treatment plans</h2>
                {plans.map((t) => (
                  <ul key={t.id} className="mt-4 divide-y rounded-2xl border bg-card">
                    {t.items.map((it, i) => <li key={i} className="flex justify-between gap-3 p-4 text-sm"><span>{it.procedure}{it.tooth ? ` — tooth ${it.tooth}` : ""} <Badge variant="outline" className="ml-2">{it.status}</Badge></span><span>{money(it.cost)}</span></li>)}
                  </ul>
                ))}
              </section>
            )}
            <section>
              <h2 className="font-serif text-2xl text-primary">Invoices</h2>
              <div className="mt-4 divide-y rounded-2xl border bg-card">
                {invs.length === 0 && <p className="p-6 text-muted-foreground">No invoices.</p>}
                {invs.map((i) => (
                  <div key={i.id} className="flex justify-between p-5 text-sm">
                    <span><span className="font-medium">{i.id}</span> · {i.date}</span>
                    <span>{money(invoiceTotal(i))} · {invoiceBalance(i) > 0 ? <span className="text-warning">Due {money(invoiceBalance(i))}</span> : <span className="text-success">Paid</span>}</span>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h2 className="font-serif text-2xl text-primary">Messages</h2>
              <p className="mt-2 text-sm text-muted-foreground">Everything here is simulated. Nothing was delivered to an inbox or a phone.</p>
              <ul className="mt-4 divide-y rounded-2xl border bg-card">
                {messages.length === 0 && <li className="p-6 text-muted-foreground">No messages yet.</li>}
                {messages.map((m) => <li key={m.id} className="p-5 text-sm"><p className="text-xs uppercase tracking-wider text-muted-foreground">{m.date} · {m.channel} · {m.template}</p><p className="mt-1">{m.body}</p></li>)}
              </ul>
            </section>
            <section className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border bg-card p-6">
                <h2 className="font-serif text-2xl text-primary">Preferences</h2>
                <div className="mt-4 space-y-2 text-sm">
                  {([["email", "Email"], ["sms", "SMS"], ["whatsapp", "WhatsApp"]] as const).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2">
                      <input type="checkbox" checked={p.comms[key]} onChange={(e) => setComms(p.id, { ...p.comms, [key]: e.target.checked })} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <form className="rounded-2xl border bg-card p-6" onSubmit={(e) => { e.preventDefault(); if (feedback.trim().length < 5) return toast.error("Write a few words"); addFeedback(p.id, feedback.trim()); setFeedback(""); toast.success("Feedback saved for the studio"); }}>
                <h2 className="font-serif text-2xl text-primary">Feedback</h2>
                <Textarea className="mt-4" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How was the visit?" />
                <Button className="mt-3" type="submit">Send to the studio</Button>
              </form>
            </section>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
