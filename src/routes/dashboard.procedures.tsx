import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { money } from "@/lib/data";
import { activeDoctors, addCategory, doctorName, payState, printSheet, removeProcedure, saveProcedure, useHms, type ClinicProcedure } from "@/lib/hms";
import { Empty, PageTitle, Restricted } from "./dashboard";

export const Route = createFileRoute("/dashboard/procedures")({
  validateSearch: (s: Record<string, unknown>): { category: string } => ({ category: typeof s.category === "string" && s.category ? s.category : "Dental" }),
  component: ProceduresPage,
});

const blank = (category: string, doctorId: string): Omit<ClinicProcedure, "id" | "token" | "deleted"> => ({
  category, mrn: "", patientName: "", contact: "", age: "", gender: "female", address: "", external: false,
  doctorId, name: "", description: "", date: new Date().toISOString().slice(0, 10), duration: 30, price: 0,
  status: "scheduled", notes: "", amountPaid: 0, paymentMethod: "cash",
});

function ProceduresPage() {
  const [s] = useHms();
  const doctors = activeDoctors(s);
  const { category } = Route.useSearch();
  const navigate = useNavigate();
  const [custom, setCustom] = useState("");
  const [draft, setDraft] = useState<Omit<ClinicProcedure, "id" | "token" | "deleted"> & { id?: string }>(() => blank(category, doctors[0]?.id ?? "d1"));
  const [open, setOpen] = useState(false);
  useEffect(() => { setDraft((d) => d.id ? d : { ...d, category }); }, [category]);
  const rows = useMemo(() => s.procedures.filter((p) => !p.deleted && p.category === category), [s.procedures, category]);

  const start = (row?: ClinicProcedure) => {
    if (!row) setDraft(blank(category, doctors[0]?.id ?? "d1"));
    else {
      const { id, token: _t, deleted: _d, ...rest } = row;
      setDraft({ ...rest, id });
    }
    setOpen(true);
  };

  const save = () => {
    const message = saveProcedure(draft);
    if (message) return toast.error(message);
    toast.success("Procedure saved");
    setOpen(false);
  };

  return (
    <Restricted allow={["Owner", "Branch Manager", "Receptionist", "Dentist"]}>
      <PageTitle title={category === "Dental" ? "Dentist" : category === "Dermatology" ? "Dermatologist" : category === "Ophthalmology" ? "Ophthalmologist" : category} sub="Search a patient by MR number, then record the procedure name, price, date, duration, description, and notes. Saved in this browser." action={<Button onClick={() => start()}>Add procedure</Button>} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {s.categories.map((c) => <Button key={c} size="sm" variant={c === category ? "default" : "outline"} onClick={() => navigate({ to: "/dashboard/procedures", search: { category: c } })}>{c}</Button>)}
        <Input className="h-8 w-40" placeholder="New category" value={custom} onChange={(e) => setCustom(e.target.value)} aria-label="New category" />
        <Button size="sm" variant="outline" onClick={() => { const message = addCategory(custom); if (message) toast.error(message); else { const name = custom.trim(); setCustom(""); navigate({ to: "/dashboard/procedures", search: { category: name } }); toast.success("Category added"); } }}>Add</Button>
      </div>
      {rows.length === 0 && <Empty title={`No ${category} procedures`} body="Add one with a patient, a doctor, a price, and how much has been paid." />}
      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="p-3">Token</th><th className="p-3">Patient</th><th className="p-3">Procedure</th><th className="p-3">When</th><th className="p-3">Fee</th><th className="p-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className="p-3">{p.token}{p.external && <span className="block text-xs text-muted-foreground">External</span>}</td>
                  <td className="p-3"><p className="font-medium">{p.patientName}</p><p className="text-xs text-muted-foreground">{p.mrn || "No MRN"} · {doctorName(s, p.doctorId)}</p></td>
                  <td className="p-3">{p.name}<span className="block text-xs text-muted-foreground">{p.status}</span></td>
                  <td className="p-3">{p.date}<span className="block text-xs text-muted-foreground">{p.duration} min</span></td>
                  <td className="p-3">{money(p.price)}<span className="block text-xs text-muted-foreground">{payState(p.amountPaid, p.price)} · {money(p.amountPaid)}</span></td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => start(p)}>Edit</Button>
                    <Button size="sm" variant="outline" className="ml-2" onClick={() => printSheet(`${p.category} procedure ${p.token}`, `<p>${p.patientName} · ${p.mrn || "external"}</p><p>${p.name} on ${p.date} with ${doctorName(s, p.doctorId)}</p><p>${money(p.price)} · paid ${money(p.amountPaid)}</p><p>${p.description}</p>`)}>Print</Button>
                    <Button size="sm" variant="ghost" className="ml-2" onClick={() => { removeProcedure(p.id); toast.success("Procedure removed"); }}>Remove</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {open && (
        <div className="mt-4 grid gap-3 rounded-xl border bg-card p-5 md:grid-cols-3">
          <div className="md:col-span-3 font-display text-lg text-primary">{draft.id ? "Edit procedure" : "New procedure"}</div>
          <Field label="Patient" value={draft.patientName} onChange={(patientName) => setDraft({ ...draft, patientName })} />
          <Field label="MRN" value={draft.mrn} onChange={(mrn) => setDraft({ ...draft, mrn })} />
          <Field label="Phone" value={draft.contact} onChange={(contact) => setDraft({ ...draft, contact })} />
          <Field label="Age" value={draft.age} onChange={(age) => setDraft({ ...draft, age })} />
          <Field label="Address" value={draft.address} onChange={(address) => setDraft({ ...draft, address })} />
          <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.external} onChange={(e) => setDraft({ ...draft, external: e.target.checked })} /> External patient</label></div>
          <div>
            <Label>Doctor</Label>
            <Select value={draft.doctorId} onValueChange={(doctorId) => setDraft({ ...draft, doctorId })}><SelectTrigger className="mt-1" aria-label="Doctor"><SelectValue /></SelectTrigger><SelectContent>{doctors.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select>
          </div>
          <Field label="Procedure" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} />
          <Field label="Description" value={draft.description} onChange={(description) => setDraft({ ...draft, description })} />
          <div><Label htmlFor="pd">Date</Label><Input id="pd" type="date" className="mt-1" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></div>
          <Num label="Minutes" value={draft.duration} onChange={(duration) => setDraft({ ...draft, duration })} />
          <Num label="Price" value={draft.price} onChange={(price) => setDraft({ ...draft, price })} />
          <Num label="Paid" value={draft.amountPaid} onChange={(amountPaid) => setDraft({ ...draft, amountPaid })} />
          <div>
            <Label>Status</Label>
            <Select value={draft.status} onValueChange={(status) => setDraft({ ...draft, status: status as ClinicProcedure["status"] })}><SelectTrigger className="mt-1" aria-label="Status"><SelectValue /></SelectTrigger><SelectContent>{["scheduled", "in-progress", "completed", "cancelled"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select>
          </div>
          <Field label="Notes" value={draft.notes} onChange={(notes) => setDraft({ ...draft, notes })} />
          <div className="md:col-span-3 flex gap-2">
            <Button onClick={save}>Save</Button>
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          </div>
        </div>
      )}
    </Restricted>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = `pr-${label}`;
  return <div><Label htmlFor={id}>{label}</Label><Input id={id} className="mt-1" value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}
function Num({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return <div><Label htmlFor={`pr-${label}`}>{label}</Label><Input id={`pr-${label}`} type="number" className="mt-1" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} /></div>;
}
