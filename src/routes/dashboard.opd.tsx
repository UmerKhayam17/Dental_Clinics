import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { money } from "@/lib/data";
import { activeDoctors, doctorName, payState, printSheet, removeVisit, saveVisit, useHms, visitTotal, type OpdVisit } from "@/lib/hms";
import { Empty, PageTitle, Restricted } from "./dashboard";

export const Route = createFileRoute("/dashboard/opd")({
  validateSearch: (s: Record<string, unknown>): { panel: "new" | "manage" } => ({ panel: s.panel === "manage" ? "manage" : "new" }),
  component: OpdPage,
});

const blank = (doctorId: string): Omit<OpdVisit, "id" | "mrn" | "token" | "deleted"> => ({
  name: "", phone: "", cnic: "", gender: "female", age: "", dob: "", address: "", blood: "O+", marital: "single",
  guardianRelation: "", guardianName: "", guardianPhone: "", doctorId, purpose: "", disease: "",
  doctorFee: 120, discount: 0, amountPaid: 0, paymentMethod: "cash", paymentNotes: "", verbalConsent: false,
  referredBy: "", date: new Date().toISOString().slice(0, 10),
});

function OpdPage() {
  const { panel } = Route.useSearch();
  const navigate = useNavigate();
  const [s] = useHms();
  const doctors = activeDoctors(s);
  const [draft, setDraft] = useState<Omit<OpdVisit, "id" | "mrn" | "token" | "deleted"> & { id?: string }>(() => blank(doctors[0]?.id ?? "d1"));
  const [q, setQ] = useState("");
  const rows = useMemo(() => s.visits.filter((v) => !v.deleted).filter((v) => `${v.name} ${v.mrn} ${v.phone} ${v.cnic}`.toLowerCase().includes(q.toLowerCase())), [s.visits, q]);

  const fill = (v: OpdVisit) => {
    const { id, mrn: _m, token: _t, deleted: _d, ...rest } = v;
    setDraft({ ...rest, id });
    navigate({ to: "/dashboard/opd", search: { panel: "new" } });
  };
  const doctor = doctors.find((d) => d.id === draft.doctorId);
  const totalFee = Math.max(0, draft.doctorFee - draft.discount);
  const amountDue = Math.max(0, totalFee - draft.amountPaid);

  const save = () => {
    const message = saveVisit(draft);
    if (message) return toast.error(message);
    toast.success(draft.id ? "Visit updated" : "OPD visit saved");
    setDraft(blank(doctors[0]?.id ?? "d1"));
  };

  const printVisit = (v: OpdVisit) => {
    const total = visitTotal(v);
    printSheet(`OPD ${v.mrn}`, `<p>Token ${v.token} · ${v.date}</p><table><tr><th>Patient</th><td>${v.name}</td></tr><tr><th>MRN</th><td>${v.mrn}</td></tr><tr><th>Phone</th><td>${v.phone}</td></tr><tr><th>Doctor</th><td>${doctorName(s, v.doctorId)}</td></tr><tr><th>Purpose</th><td>${v.purpose}</td></tr><tr><th>Fee</th><td>${money(total)}</td></tr><tr><th>Paid</th><td>${money(v.amountPaid)} · ${payState(v.amountPaid, total)}</td></tr><tr><th>Consent</th><td>${v.verbalConsent ? "Verbal consent obtained" : "Not recorded"}</td></tr></table>`);
  };

  return (
    <Restricted allow={["Owner", "Branch Manager", "Receptionist", "Dentist", "Accountant"]}>
      <PageTitle title={panel === "manage" ? "Manage OPD" : draft.id ? `Edit Patient - ${draft.name || "visit"}` : "New OPD Registration"} sub={panel === "manage" ? "Search by name, MR number, phone, or CNIC. Edit, print, or remove a visit. Records stay in this browser." : "Fill in the patient and visit details. The MR number and token are assigned when you save."} />
      {panel === "new" && (
          <div className="grid gap-3 rounded-xl border bg-card p-5 md:grid-cols-3">
            <Field label="MR Number" value={draft.id ? s.visits.find((v) => v.id === draft.id)?.mrn ?? "" : ""} onChange={() => {}} readOnly placeholder="Auto-generated MR Number" />
            <Field label="Patient Name" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} placeholder="Enter Patient Name" />
            <Field label="Guardian Name" value={draft.guardianName} onChange={(guardianName) => setDraft({ ...draft, guardianName })} placeholder="Enter Guardian Name" />
            <div>
              <Label>Guardian Relation</Label>
              <Select value={draft.guardianRelation || "none"} onValueChange={(guardianRelation) => setDraft({ ...draft, guardianRelation: guardianRelation === "none" ? "" : guardianRelation })}><SelectTrigger className="mt-1" aria-label="Guardian Relation"><SelectValue placeholder="Select Relation" /></SelectTrigger><SelectContent>{["none", "Father", "Mother", "Spouse", "Son", "Daughter", "Brother", "Sister", "Other"].map((g) => <SelectItem key={g} value={g}>{g === "none" ? "Select Relation" : g}</SelectItem>)}</SelectContent></Select>
            </div>
            <Field label="Age (Years.Months)" value={draft.age} onChange={(age) => setDraft({ ...draft, age })} placeholder="e.g. 20.5" />
            <div><Label htmlFor="dob">Date of Birth</Label><Input id="dob" type="date" className="mt-1" value={draft.dob} onChange={(e) => setDraft({ ...draft, dob: e.target.value })} /></div>
            <Field label="CNIC Number" value={draft.cnic} onChange={(cnic) => setDraft({ ...draft, cnic })} placeholder="XXXXX-XXXXXXX-X" />
            <Field label="Patient Contact" value={draft.phone} onChange={(phone) => setDraft({ ...draft, phone })} placeholder="03XX-XXXXXXX" />
            <Field label="Guardian Contact" value={draft.guardianPhone} onChange={(guardianPhone) => setDraft({ ...draft, guardianPhone })} placeholder="03XX-XXXXXXX" />
            <div>
              <Label>Gender</Label>
              <Select value={draft.gender} onValueChange={(gender) => setDraft({ ...draft, gender })}><SelectTrigger className="mt-1" aria-label="Gender"><SelectValue /></SelectTrigger><SelectContent>{["female", "male", "other"].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
            </div>
            <div>
              <Label>Blood Group</Label>
              <Select value={draft.blood} onValueChange={(blood) => setDraft({ ...draft, blood })}><SelectTrigger className="mt-1" aria-label="Blood type"><SelectValue /></SelectTrigger><SelectContent>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
            </div>
            <div>
              <Label>Marital Status</Label>
              <Select value={draft.marital} onValueChange={(marital) => setDraft({ ...draft, marital })}><SelectTrigger className="mt-1" aria-label="Marital status"><SelectValue /></SelectTrigger><SelectContent>{["single", "married", "divorced", "widowed"].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
            </div>
            <Field label="Address" value={draft.address} onChange={(address) => setDraft({ ...draft, address })} placeholder="Enter Full Address" />
            <div>
              <Label>Doctor</Label>
              <Select value={draft.doctorId} onValueChange={(doctorId) => {
                const fee = doctors.find((d) => d.id === doctorId)?.fee ?? draft.doctorFee;
                setDraft({ ...draft, doctorId, doctorFee: draft.id ? draft.doctorFee : fee });
              }}><SelectTrigger className="mt-1" aria-label="Doctor"><SelectValue /></SelectTrigger><SelectContent>{doctors.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select>
            </div>
            <Field label="Visit Purpose" value={draft.purpose} onChange={(purpose) => setDraft({ ...draft, purpose })} placeholder="Enter visit purpose" />
            <Field label="Disease/Condition" value={draft.disease} onChange={(disease) => setDraft({ ...draft, disease })} placeholder="Enter disease or condition" />
            <Field label="Referred By" value={draft.referredBy} onChange={(referredBy) => setDraft({ ...draft, referredBy })} placeholder="Enter Referral Name (if any)" />
            <Field label="Qualification" value={doctor?.qualifications ?? ""} onChange={() => {}} readOnly />
            <Field label="Department" value={doctor?.department ?? ""} onChange={() => {}} readOnly />
            <Field label="Specialization" value={doctor?.specialization ?? ""} onChange={() => {}} readOnly />
            <Num label="Consultation Fee" value={draft.doctorFee} onChange={(doctorFee) => setDraft({ ...draft, doctorFee })} />
            <Num label="Discount" value={draft.discount} onChange={(discount) => setDraft({ ...draft, discount })} />
            <Field label="Total Fee" value={String(totalFee)} onChange={() => {}} readOnly />
            <Num label="Amount Paid" value={draft.amountPaid} onChange={(amountPaid) => setDraft({ ...draft, amountPaid })} />
            <Field label="Amount Due" value={String(amountDue)} onChange={() => {}} readOnly />
            <div>
              <Label>Payment Method</Label>
              <Select value={draft.paymentMethod} onValueChange={(paymentMethod) => setDraft({ ...draft, paymentMethod })}><SelectTrigger className="mt-1" aria-label="Payment method"><SelectValue /></SelectTrigger><SelectContent>{["cash", "card", "bank_transfer", "online", "other"].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
            </div>
            <Field label="Payment note" value={draft.paymentNotes} onChange={(paymentNotes) => setDraft({ ...draft, paymentNotes })} />
            <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.verbalConsent} onChange={(e) => setDraft({ ...draft, verbalConsent: e.target.checked })} /> Verbal Consent Obtained</label></div>
            <div className="md:col-span-3 flex gap-2">
              <Button onClick={save}>{draft.id ? "Update visit" : "Save visit"}</Button>
              {draft.id && <Button variant="outline" onClick={() => setDraft(blank(doctors[0]?.id ?? "d1"))}>Clear</Button>}
            </div>
          </div>
      )}
      {panel === "manage" && (
        <>
          <Input placeholder="Search name, MRN, phone, or ID" className="mb-4 max-w-sm" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search visits" />
          {rows.length === 0 && <Empty title="No visits" body="A new OPD registration appears here with its MRN and token." />}
          {rows.length > 0 && (
            <div className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="p-3">Token</th><th className="p-3">Patient</th><th className="p-3">Doctor</th><th className="p-3">Fee</th><th className="p-3">Paid</th><th className="p-3 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((v) => {
                    const total = visitTotal(v);
                    return (
                      <tr key={v.id}>
                        <td className="p-3">{v.token}<span className="block text-xs text-muted-foreground">{v.mrn}</span></td>
                        <td className="p-3"><p className="font-medium">{v.name}</p><p className="text-xs text-muted-foreground">{v.phone} · {v.date}</p></td>
                        <td className="p-3">{doctorName(s, v.doctorId)}</td>
                        <td className="p-3">{money(total)}</td>
                        <td className="p-3">{money(v.amountPaid)} <span className="text-xs text-muted-foreground">{payState(v.amountPaid, total)}</span></td>
                        <td className="p-3 text-right">
                          <Button size="sm" variant="outline" onClick={() => fill(v)}>Edit</Button>
                          <Button size="sm" variant="outline" className="ml-2" onClick={() => printVisit(v)}>Print</Button>
                          <Button size="sm" variant="ghost" className="ml-2" onClick={() => { removeVisit(v.id); toast.success("Visit removed"); }}>Remove</Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Restricted>
  );
}

function Field({ label, value, onChange, readOnly, placeholder }: { label: string; value: string; onChange: (v: string) => void; readOnly?: boolean; placeholder?: string }) {
  const id = label.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return <div><Label htmlFor={id}>{label}</Label><Input id={id} className="mt-1" value={value} placeholder={placeholder} readOnly={readOnly} onChange={(e) => onChange(e.target.value)} /></div>;
}

function Num({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return <div><Label htmlFor={id}>{label}</Label><Input id={id} type="number" className="mt-1" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} /></div>;
}
