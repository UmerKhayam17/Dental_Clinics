import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Phone, Mail, MessageCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PageHero, SiteLayout, seo } from "@/components/site/SiteLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CLINIC, TREATMENTS } from "@/lib/data";
import { inquirySchema } from "@/lib/schemas";
import { captureInquiry } from "@/lib/store";

export const Route = createFileRoute("/contact")({
  head: () => seo("Contact & Location | Lumière Dental Studio", "Find Lumière Dental Studio in Bayview. Phone, WhatsApp, email, opening hours and emergency instructions.", "/contact"),
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", topic: "General question", message: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = inquirySchema.safeParse(form);
    if (!parsed.success) {
      const er: Record<string, string> = {};
      for (const issue of parsed.error.issues) er[String(issue.path[0])] = issue.message;
      setErr(er);
      return;
    }
    setErr({});
    captureInquiry({ ...parsed.data, phone: form.phone, treatment: form.topic });
    toast.success("Message received", { description: "It is now on the studio’s lead list. No email was sent." });
    setForm({ name: "", email: "", phone: "", topic: "General question", message: "" });
  };
  return (
    <SiteLayout>
      <PageHero eyebrow="Contact" title="We'd love to hear from you." />
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2">
        <div className="space-y-6">
          {[
            [MapPin, CLINIC.address], [Phone, CLINIC.phone], [MessageCircle, `WhatsApp ${CLINIC.whatsapp}`], [Mail, CLINIC.email],
          ].map(([I, t]) => { const Icon = I as typeof MapPin; return <p key={t as string} className="flex gap-3"><Icon className="h-5 w-5 text-gold" />{t as string}</p>; })}
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="font-serif text-xl text-primary">Opening hours</h2>
            <dl className="mt-3 space-y-1 text-sm">{CLINIC.hours.map(([d, h]) => <div key={d} className="flex justify-between"><dt className="text-muted-foreground">{d}</dt><dd>{h}</dd></div>)}</dl>
          </div>
          <div className="flex gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-5 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
            <p>For dental emergencies (severe pain, swelling, trauma) call {CLINIC.phone}. If you have difficulty breathing or swallowing, contact emergency services immediately.</p>
          </div>
          <iframe title="Map" className="h-64 w-full rounded-2xl border" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=-0.15%2C51.49%2C-0.11%2C51.51&layer=mapnik" />
        </div>
        <form onSubmit={submit} noValidate className="space-y-5 rounded-2xl border bg-card p-8">
          <h2 className="font-serif text-2xl text-primary">Send a message</h2>
          {(["name", "email", "phone"] as const).map((k) => (
            <div key={k}><Label htmlFor={k} className="capitalize">{k}{k === "phone" ? " (optional)" : ""}</Label><Input id={k} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} aria-invalid={!!err[k]} className="mt-1.5" />{err[k] && <p className="mt-1 text-sm text-destructive">{err[k]}</p>}</div>
          ))}
          <div>
            <Label>What is this about?</Label>
            <Select value={form.topic} onValueChange={(topic) => setForm({ ...form, topic })}>
              <SelectTrigger className="mt-1.5" aria-label="Topic"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="General question">General question</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
                {TREATMENTS.map((t) => <SelectItem key={t.slug} value={t.name}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label htmlFor="message">Message</Label><Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} aria-invalid={!!err.message} className="mt-1.5" />{err.message && <p className="mt-1 text-sm text-destructive">{err.message}</p>}</div>
          <Button type="submit" className="w-full">Send message</Button>
        </form>
      </section>
    </SiteLayout>
  );
}
