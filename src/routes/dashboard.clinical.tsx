import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addNote, addPrescription, useDemo } from "@/lib/store";
import { printSheet, saveReport, useHms } from "@/lib/hms";
import { readSession } from "@/lib/auth";
import { Empty, PageTitle, Restricted } from "./dashboard";

export const Route = createFileRoute("/dashboard/clinical")({
  validateSearch: (s: Record<string, unknown>): { panel: "prescriptions" | "notes" | "reports" } => ({
    panel: s.panel === "notes" || s.panel === "reports" ? s.panel : "prescriptions",
  }),
  component: ClinicalPage,
});

function ClinicalPage() {
  const { panel } = Route.useSearch();
  const [clinic] = useDemo();
  const [hms] = useHms();
  const session = readSession();
  const author = session?.name ?? "Dentist";
  const [patientId, setPatientId] = useState("");
  useEffect(() => {
    if (!patientId && clinic.patients[0]) setPatientId(clinic.patients[0].id);
  }, [clinic.patients, patientId]);
  const [drug, setDrug] = useState("");
  const [dose, setDose] = useState("");
  const [note, setNote] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const patient = clinic.patients.find((p) => p.id === patientId);

  return (
    <Restricted allow={["Owner", "Branch Manager", "Dentist"]}>
      <PageTitle title={panel === "notes" ? "Notes / Diagnosis" : panel === "reports" ? "Reports" : "Prescriptions"} sub="Choose the patient, then write the prescription, note, or report. It is stored in this browser and can be printed." />
      <div className="mb-4 max-w-sm">
        <Label>Patient</Label>
        <Select value={patientId} onValueChange={setPatientId}><SelectTrigger className="mt-1" aria-label="Patient"><SelectValue /></SelectTrigger><SelectContent>{clinic.patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
      </div>
      <div className="grid gap-4 lg:grid-cols-1">
        {panel === "prescriptions" && <section className="rounded-xl border bg-card p-4">
          <h2 className="font-display text-lg text-primary">Prescription</h2>
          <div className="mt-3 grid gap-2">
            <Input placeholder="Medicine" value={drug} onChange={(e) => setDrug(e.target.value)} aria-label="Medicine" />
            <Input placeholder="Dose and instructions" value={dose} onChange={(e) => setDose(e.target.value)} aria-label="Dose" />
            <Button onClick={() => { if (!patient || !drug.trim()) return toast.error("Choose a patient and a medicine"); addPrescription(patient.id, drug.trim(), dose.trim() || "As directed by the dentist"); setDrug(""); setDose(""); toast.success("Prescription added to the chart"); }}>Add prescription</Button>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {(patient?.prescriptions ?? []).map((rx) => <li key={rx.id}><span className="font-medium">{rx.drug}</span> · {rx.dose}<span className="block text-xs text-muted-foreground">{rx.date}</span></li>)}
            {!patient?.prescriptions.length && <li className="text-muted-foreground">None yet.</li>}
          </ul>
        </section>}
        {panel === "notes" && <section className="rounded-xl border bg-card p-4">
          <h2 className="font-display text-lg text-primary">Notes / Diagnosis</h2>
          <Textarea className="mt-3" value={note} onChange={(e) => setNote(e.target.value)} aria-label="Clinical note" />
          <Button className="mt-2" onClick={() => { if (!patient || note.trim().length < 3) return toast.error("Write the note"); addNote(patient.id, note.trim(), author); setNote(""); toast.success("Note added"); }}>Add note</Button>
          <ul className="mt-4 space-y-2 text-sm">
            {(patient?.notes ?? []).map((n, i) => <li key={i}><span className="font-medium">{n.date}</span> · {n.author}<span className="block text-muted-foreground">{n.text}</span></li>)}
          </ul>
        </section>}
        {panel === "reports" && <section className="rounded-xl border bg-card p-4">
          <h2 className="font-display text-lg text-primary">Report</h2>
          <Input className="mt-3" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Report title" />
          <Textarea className="mt-2" value={body} onChange={(e) => setBody(e.target.value)} aria-label="Report" />
          <Button className="mt-2" onClick={() => { if (!patient) return; const message = saveReport({ patientName: patient.name, title, body, author }); if (message) return toast.error(message); setTitle(""); setBody(""); toast.success("Report saved"); }}>Save report</Button>
        </section>}
      </div>
      {panel === "reports" && <h2 className="mb-3 mt-8 font-display text-xl text-primary">Saved reports</h2>}
      {panel === "reports" && hms.reports.length === 0 && <Empty title="No reports" body="A written report is stored with the patient’s name so it can be printed later." />}
      {panel === "reports" && (
      <div className="grid gap-3">
        {hms.reports.map((r) => (
          <article key={r.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div><h3 className="font-medium">{r.title}</h3><p className="text-xs text-muted-foreground">{r.patientName} · {r.author} · {r.date}</p></div>
              <Button size="sm" variant="outline" onClick={() => printSheet(r.title, `<p>${r.patientName}</p><p>${r.author} · ${r.date}</p><p>${r.body}</p>`)}>Print</Button>
            </div>
            <p className="mt-2 text-sm">{r.body}</p>
          </article>
        ))}
      </div>
      )}
    </Restricted>
  );
}
