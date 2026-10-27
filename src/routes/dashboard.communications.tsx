import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sendSimulated, updateTemplate, type Message } from "@/lib/store";
import { PageTitle, Restricted, useFilteredDemo } from "./dashboard";

export const Route = createFileRoute("/dashboard/communications")({ component: Comms });

function Comms() {
  const { raw, patients, messages } = useFilteredDemo();
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "");
  const [channel, setChannel] = useState<Message["channel"]>("Email");
  const [templateId, setTemplateId] = useState(raw.templates[0]?.id ?? "");
  const template = raw.templates.find((t) => t.id === templateId);
  const send = () => {
    if (!patientId || !template) return toast.error("Choose a patient and a template");
    const err = sendSimulated({ patientId, channel, template: template.name, body: template.body });
    if (err) toast.error(err);
    else toast.success("Saved as simulated", { description: "No email, SMS, or WhatsApp message left this browser." });
  };
  return (
    <Restricted allow={["Owner", "Branch Manager", "Receptionist"]}>
      <PageTitle title="Communications" sub="Templates are editable. Sending respects the patient’s channel preferences and always stays in simulation." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-display font-semibold">Templates</h2>
          <div className="mt-4 space-y-4">
            {raw.templates.map((item) => (
              <div key={item.id}>
                <Label htmlFor={item.id}>{item.name}</Label>
                <Textarea id={item.id} className="mt-1" rows={3} value={item.body} onChange={(e) => updateTemplate(item.id, e.target.value)} />
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-display font-semibold">Simulate a send</h2>
          <div className="mt-4 grid gap-3">
            <div><Label>Patient</Label><Select value={patientId} onValueChange={setPatientId}><SelectTrigger className="mt-1" aria-label="Patient"><SelectValue /></SelectTrigger><SelectContent>{patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Channel</Label><Select value={channel} onValueChange={(v) => setChannel(v as Message["channel"])}><SelectTrigger className="mt-1" aria-label="Channel"><SelectValue /></SelectTrigger><SelectContent>{(["Email", "SMS", "WhatsApp"] as const).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Template</Label><Select value={templateId} onValueChange={setTemplateId}><SelectTrigger className="mt-1" aria-label="Template"><SelectValue /></SelectTrigger><SelectContent>{raw.templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
            <Button onClick={send}>Record simulated message</Button>
          </div>
          <h3 className="mt-8 font-display font-semibold">Log</h3>
          <ul className="mt-3 max-h-80 divide-y overflow-auto text-sm">
            {messages.slice(0, 12).map((m) => (
              <li key={m.id} className="py-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{m.date} · {m.channel} · {m.status}</p>
                <p className="mt-1">{m.body}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Restricted>
  );
}
