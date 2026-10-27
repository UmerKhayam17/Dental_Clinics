import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Odontogram } from "@/components/clinical/Odontogram";
import { BRANCHES, DENTISTS, PROCEDURES, money } from "@/lib/data";
import {
  CONDITIONS, addDocument, addNote, addPlanItem, addPrescription, createInvoice,
  invoiceBalance, invoiceTotal, recordTooth, setPlanStatus, useDemo,
  type PlanStatus, type ToothCondition,
} from "@/lib/store";
import { PageTitle, statusTone, useRole } from "./dashboard";

export const Route = createFileRoute("/dashboard/patients/$id")({ component: PatientPage });

const SURFACES = [
  ["B", "Buccal"],
  ["M", "Mesial"],
  ["O", "Occlusal"],
  ["D", "Distal"],
  ["L", "Lingual"],
] as const;

function PatientPage() {
  const { id } = Route.useParams();
  const role = useRole();
  const [s, ready] = useDemo();
  const [tooth, setTooth] = useState<number | null>(null);
  const [cond, setCond] = useState<ToothCondition>("Caries");
  const [surfaces, setSurfaces] = useState<string[]>([]);
  const [toothNote, setToothNote] = useState("");
  const [procedure, setProcedure] = useState<string>(PROCEDURES[1].name);
  const [note, setNote] = useState("");
  const [rx, setRx] = useState({ drug: "", dose: "" });
  const [dentition, setDentition] = useState<"permanent" | "primary">("permanent");
  const [numbering, setNumbering] = useState<"fdi" | "universal">("fdi");
  const p = s.patients.find((x) => x.id === id);

  if (!ready) return null;
  if (!p) return <p>That record is not in this browser. <Link to="/dashboard/patients" className="text-primary underline">Back to patients</Link></p>;

  const appts = s.appointments.filter((a) => a.patientId === id && !a.deleted).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const plans = s.plans.filter((t) => t.patientId === id);
  const invoices = s.invoices.filter((i) => i.patientId === id);
  const messages = s.messages.filter((m) => m.patientId === id);
  const dentist = DENTISTS.find((d) => d.id === p.preferredDentist);
  const selectTooth = (n: number) => {
    setTooth(n);
    const rec = p.chart[n];
    setCond(rec?.condition ?? "Healthy");
    setSurfaces(rec?.surfaces ?? []);
    setToothNote(rec?.note ?? "");
  };
  const saveTooth = () => {
    if (tooth == null) return;
    recordTooth(id, tooth, { condition: cond, surfaces, note: toothNote });
    toast.success(`Tooth ${tooth} saved`);
  };
  const toPlan = () => {
    if (tooth == null) return toast.error("Select a tooth first");
    const cost = PROCEDURES.find((x) => x.name === procedure)?.cost ?? 0;
    addPlanItem(id, { tooth, procedure, cost, status: "Proposed" });
    toast.success("Added to the treatment plan");
  };
  const saveNote = () => {
    if (note.trim().length < 3) return toast.error("Write a short clinical note");
    addNote(id, note.trim(), role === "Dentist" ? "Dentist" : role);
    setNote("");
    toast.success("Note saved");
  };
  const saveRx = () => {
    if (rx.drug.trim().length < 2 || rx.dose.trim().length < 2) return toast.error("Drug and dose are both required");
    addPrescription(id, rx.drug.trim(), rx.dose.trim());
    setRx({ drug: "", dose: "" });
    toast.success("Prescription recorded");
  };
  const onFile = (file?: File) => {
    if (!file) return;
    if (file.size > 8_000_000) return toast.error("Choose a file under 8 MB");
    addDocument(id, file.name, file.type || "File");
    toast.success("File name stored", { description: "The demonstration keeps the name only. The file itself is not uploaded." });
  };
  const invoiceDone = () => {
    const done = plans.flatMap((plan) => plan.items.filter((item) => item.status === "Completed"));
    if (!done.length) return toast.error("Mark at least one plan item completed");
    const inv = createInvoice(id, done.map((item) => ({ label: `${item.procedure}${item.tooth ? ` — ${item.tooth}` : ""}`, amount: item.cost })));
    toast.success(`Invoice ${inv} created`);
  };

  const timeline = [
    ...p.notes.map((n) => ({ date: n.date, title: `Note · ${n.author}`, body: n.text })),
    ...appts.map((a) => ({ date: a.date, title: `${a.status} · ${a.time}`, body: a.treatment })),
    ...invoices.map((i) => ({ date: i.date, title: i.id, body: money(invoiceTotal(i)) })),
    ...messages.map((m) => ({ date: m.date, title: `${m.channel} · ${m.template}`, body: m.body })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageTitle title={p.name} sub={`${p.id} · ${p.phone} · ${p.email} · ${BRANCHES.find((b) => b.id === p.branchId)?.name ?? "Studio"} · ${dentist?.name ?? "No preferred dentist"}`} />
      {((p.allergies && p.allergies !== "None reported") || p.medicalAlerts) && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
          Alert: {[p.allergies && p.allergies !== "None reported" ? `Allergy — ${p.allergies}` : "", p.medicalAlerts].filter(Boolean).join(" · ")}
        </div>
      )}
      <Tabs defaultValue="overview">
        <TabsList className="mb-4 flex h-auto flex-wrap justify-start">
          {["Overview", "Appointments", "Chart", "Plans", "Notes", "Billing", "Messages"].map((tab) => (
            <TabsTrigger key={tab} value={tab.toLowerCase()}>{tab}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-xl border bg-card p-5 lg:col-span-1">
            <h2 className="font-display font-semibold">Record</h2>
            <dl className="mt-4 space-y-2 text-sm">
              {[["Born", p.dob || "—"], ["Gender", p.gender || "—"], ["Address", p.address || "—"], ["Emergency", p.emergency || "—"], ["History", p.history || "—"], ["Registered", p.registered], ["Source", p.source], ["Consent", p.consent ? "Recorded" : "Not recorded"]].map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-2"><dt className="text-muted-foreground">{k}</dt><dd className="col-span-2">{v}</dd></div>
              ))}
            </dl>
            <div className="mt-5">
              <Label htmlFor="file">Add a document or radiograph</Label>
              <Input id="file" className="mt-1" type="file" onChange={(e) => onFile(e.target.files?.[0])} />
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">{p.documents.map((d) => <li key={d.id}>{d.date} · {d.name}</li>)}</ul>
            </div>
          </section>
          <section className="rounded-xl border bg-card p-5 lg:col-span-2">
            <h2 className="font-display font-semibold">Timeline</h2>
            {timeline.length === 0 ? <p className="py-8 text-sm text-muted-foreground">No visits, notes, or invoices yet.</p> : (
              <ol className="mt-4 space-y-4 border-l border-gold/50 pl-4">
                {timeline.map((event, i) => (
                  <li key={i}>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">{event.date} · {event.title}</p>
                    <p className="text-sm">{event.body}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </TabsContent>

        <TabsContent value="appointments">
          <ul className="divide-y rounded-xl border bg-card">
            {appts.length === 0 && <li className="p-6 text-sm text-muted-foreground">No appointments.</li>}
            {appts.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
                <span>{a.date} · {a.time} · {a.treatment}</span>
                <span className="text-muted-foreground">{DENTISTS.find((d) => d.id === a.dentistId)?.name}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs ${statusTone[a.status]}`}>{a.status}</span>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="chart" className="grid gap-6 xl:grid-cols-3">
          <section className="rounded-xl border bg-card p-5 xl:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display font-semibold">Dental chart</h2>
              <div className="flex gap-2 text-xs">
                <Button size="sm" variant={dentition === "permanent" ? "default" : "outline"} onClick={() => setDentition("permanent")}>Permanent</Button>
                <Button size="sm" variant={dentition === "primary" ? "default" : "outline"} onClick={() => setDentition("primary")}>Primary</Button>
                <Button size="sm" variant={numbering === "fdi" ? "default" : "outline"} onClick={() => setNumbering("fdi")}>FDI</Button>
                <Button size="sm" variant={numbering === "universal" ? "default" : "outline"} onClick={() => setNumbering("universal")}>Universal</Button>
              </div>
            </div>
            <div className="mt-4">
              <Odontogram chart={p.chart} selected={tooth} onSelect={selectTooth} dentition={dentition} numbering={numbering} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Illustration for demonstration. A dentist must review any chart before it is used in care.</p>
          </section>
          <section className="rounded-xl border bg-card p-5">
            <h2 className="font-display font-semibold">{tooth ? `Tooth ${tooth}` : "Select a tooth"}</h2>
            <div className="mt-4 grid gap-3">
              <div>
                <Label>Condition</Label>
                <Select value={cond} onValueChange={(v) => setCond(v as ToothCondition)}><SelectTrigger className="mt-1" aria-label="Condition"><SelectValue /></SelectTrigger><SelectContent>{CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
              </div>
              <div>
                <Label>Surfaces</Label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {SURFACES.map(([code, label]) => (
                    <button key={code} type="button" aria-pressed={surfaces.includes(code)} onClick={() => setSurfaces((cur) => cur.includes(code) ? cur.filter((x) => x !== code) : [...cur, code])}
                      className={`rounded-md border px-2 py-2 text-xs ${surfaces.includes(code) ? "border-primary bg-primary text-primary-foreground" : ""} ${code === "O" ? "col-start-2" : ""}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div><Label htmlFor="tnote">Tooth note</Label><Textarea id="tnote" className="mt-1" value={toothNote} onChange={(e) => setToothNote(e.target.value)} /></div>
              <div>
                <Label>Procedure estimate</Label>
                <Select value={procedure} onValueChange={setProcedure}><SelectTrigger className="mt-1" aria-label="Procedure"><SelectValue /></SelectTrigger><SelectContent>{PROCEDURES.map((item) => <SelectItem key={item.name} value={item.name}>{item.name} · {money(item.cost)}</SelectItem>)}</SelectContent></Select>
              </div>
              <div className="flex gap-2">
                <Button disabled={tooth == null} onClick={saveTooth}>Save tooth</Button>
                <Button variant="outline" disabled={tooth == null} onClick={toPlan}>Add to plan</Button>
              </div>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="plans">
          <div className="mb-3 flex justify-end"><Button size="sm" onClick={invoiceDone}>Invoice completed items</Button></div>
          {plans.length === 0 ? <p className="text-sm text-muted-foreground">No plan yet. Select a tooth and add a procedure.</p> : plans.map((plan) => (
            <section key={plan.id} className="rounded-xl border bg-card p-5">
              <ul className="divide-y text-sm">
                {plan.items.map((item, i) => (
                  <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <span>{item.procedure}{item.tooth ? ` · ${item.tooth}` : ""}</span>
                    <span className="flex items-center gap-3">{money(item.cost)}
                      <Select value={item.status} onValueChange={(v) => setPlanStatus(plan.id, i, v as PlanStatus)}>
                        <SelectTrigger className="h-8 w-32" aria-label="Item status"><SelectValue /></SelectTrigger>
                        <SelectContent>{(["Proposed", "Accepted", "Completed"] as PlanStatus[]).map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                      </Select>
                    </span>
                  </li>
                ))}
              </ul>
              <ul className="mt-3 text-xs text-muted-foreground">{plan.history.map((h, i) => <li key={i}>{h.at} · {h.action}</li>)}</ul>
            </section>
          ))}
        </TabsContent>

        <TabsContent value="notes" className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border bg-card p-5">
            <h2 className="font-display font-semibold">Clinical notes</h2>
            <Textarea className="mt-3" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Findings, discussion, and what was agreed." />
            <Button size="sm" className="mt-2" onClick={saveNote}>Save note</Button>
            <ul className="mt-4 space-y-3 text-sm">{p.notes.map((n, i) => <li key={i} className="border-l-2 border-gold pl-3"><p>{n.text}</p><p className="text-xs text-muted-foreground">{n.date} · {n.author}</p></li>)}</ul>
          </section>
          <section className="rounded-xl border bg-card p-5">
            <h2 className="font-display font-semibold">Prescriptions</h2>
            <div className="mt-3 grid gap-2">
              <Input aria-label="Drug" placeholder="Drug" value={rx.drug} onChange={(e) => setRx({ ...rx, drug: e.target.value })} />
              <Input aria-label="Dose" placeholder="Dose and directions" value={rx.dose} onChange={(e) => setRx({ ...rx, dose: e.target.value })} />
              <Button size="sm" onClick={saveRx}>Record prescription</Button>
            </div>
            <ul className="mt-4 space-y-3 text-sm">{p.prescriptions.map((item) => <li key={item.id}><p className="font-medium">{item.drug}</p><p className="text-muted-foreground">{item.dose}</p><p className="text-xs text-muted-foreground">{item.date}</p></li>)}</ul>
            <p className="mt-4 text-xs text-muted-foreground">Demonstration record only. It is not a legal prescription.</p>
          </section>
        </TabsContent>

        <TabsContent value="billing">
          <ul className="divide-y rounded-xl border bg-card text-sm">
            {invoices.length === 0 && <li className="p-6 text-muted-foreground">No invoices.</li>}
            {invoices.map((i) => (
              <li key={i.id} className="flex justify-between p-4">
                <span>{i.id} · {i.date} · {i.items.map((x) => x.label).join(", ")}</span>
                <span>{invoiceBalance(i) > 0 ? `Due ${money(invoiceBalance(i))}` : "Paid"} · {money(invoiceTotal(i))}</span>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="messages">
          <ul className="divide-y rounded-xl border bg-card text-sm">
            {messages.length === 0 && <li className="p-6 text-muted-foreground">No messages. Confirming an appointment writes a simulated email here.</li>}
            {messages.map((m) => (
              <li key={m.id} className="p-4"><p className="text-xs uppercase tracking-wider text-muted-foreground">{m.date} · {m.channel} · {m.template} · {m.status}</p><p className="mt-1">{m.body}</p></li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </>
  );
}
