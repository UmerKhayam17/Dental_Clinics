import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { money } from "@/lib/data";
import { removeDoctor, removeStaffMember, saveDoctor, saveStaffMember, useHms, type DeskDoctor, type DeskStaff } from "@/lib/hms";
import { PageTitle, Restricted } from "./dashboard";

export const Route = createFileRoute("/dashboard/roster")({
  validateSearch: (s: Record<string, unknown>): { tab: "doctors" | "staff" } => ({ tab: s.tab === "staff" ? "staff" : "doctors" }),
  component: RosterPage,
});

function RosterPage() {
  const { tab } = Route.useSearch();
  const [s] = useHms();
  return (
    <Restricted allow={["Owner", "Branch Manager", "Accountant"]}>
      <PageTitle title={tab === "staff" ? "All Staff" : "All Doctors"} sub={tab === "staff" ? "Name, email, phone, CNIC, password, address, role, designation, department, qualifications, gender, date of birth, shift, and emergency contact. Saved in this browser." : "Department, type, specialisation, qualifications, licence, fee, and the doctor/studio contract split. Saved in this browser. The public website is unchanged."} />
      {tab === "doctors" ? <Doctors rows={s.doctors.filter((d) => !d.deleted)} /> : <Staff rows={s.staff.filter((p) => !p.deleted)} departments={s.departments.map((d) => d.name)} />}
    </Restricted>
  );
}

function Doctors({ rows }: { rows: DeskDoctor[] }) {
  const [draft, setDraft] = useState<Omit<DeskDoctor, "id" | "deleted"> & { id?: string }>({
    name: "", department: "Dentistry", type: "Associate", specialization: "", qualifications: "", license: "",
    fee: 120, doctorPercent: 70, hospitalPercent: 30, contractTime: "Weekdays", joiningDate: new Date().toISOString().slice(0, 10),
  });
  const save = () => {
    const message = saveDoctor(draft);
    if (message) return toast.error(message);
    toast.success("Doctor saved");
  };
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-3">
        <Field label="Name" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} />
        <Field label="Department" value={draft.department} onChange={(department) => setDraft({ ...draft, department })} />
        <Field label="Type" value={draft.type} onChange={(type) => setDraft({ ...draft, type })} />
        <Field label="Specialisation" value={draft.specialization} onChange={(specialization) => setDraft({ ...draft, specialization })} />
        <Field label="Qualifications" value={draft.qualifications} onChange={(qualifications) => setDraft({ ...draft, qualifications })} />
        <Field label="Licence" value={draft.license} onChange={(license) => setDraft({ ...draft, license })} />
        <Num label="Fee" value={draft.fee} onChange={(fee) => setDraft({ ...draft, fee })} />
        <Num label="Doctor %" value={draft.doctorPercent} onChange={(doctorPercent) => setDraft({ ...draft, doctorPercent, hospitalPercent: 100 - doctorPercent })} />
        <Num label="Studio %" value={draft.hospitalPercent} onChange={(hospitalPercent) => setDraft({ ...draft, hospitalPercent, doctorPercent: 100 - hospitalPercent })} />
        <Field label="Contract time" value={draft.contractTime} onChange={(contractTime) => setDraft({ ...draft, contractTime })} />
        <div><Label htmlFor="jd">Joining date</Label><Input id="jd" type="date" className="mt-1" value={draft.joiningDate} onChange={(e) => setDraft({ ...draft, joiningDate: e.target.value })} /></div>
        <div className="flex items-end gap-2"><Button onClick={save}>{draft.id ? "Update doctor" : "Add doctor"}</Button>{draft.id && <Button variant="outline" onClick={() => setDraft({ ...draft, id: undefined, name: "" })}>Clear</Button>}</div>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-3">Doctor</th><th className="p-3">Contract</th><th className="p-3">Fee</th><th className="p-3 text-right">Actions</th></tr></thead>
          <tbody className="divide-y">
            {rows.map((d) => (
              <tr key={d.id}>
                <td className="p-3"><p className="font-medium">{d.name}</p><p className="text-xs text-muted-foreground">{d.department} · {d.qualifications} · {d.license}</p></td>
                <td className="p-3">{d.doctorPercent}% / {d.hospitalPercent}% · {d.contractTime}</td>
                <td className="p-3">{money(d.fee)}</td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => setDraft(d)}>Edit</Button>
                  <Button size="sm" variant="ghost" className="ml-2" onClick={() => { removeDoctor(d.id); toast.success("Doctor removed from the roster"); }}>Remove</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Staff({ rows, departments }: { rows: DeskStaff[]; departments: string[] }) {
  const [draft, setDraft] = useState<Omit<DeskStaff, "id" | "deleted"> & { id?: string }>({
    name: "", email: "", phone: "", gender: "Female", dob: "", designation: "Receptionist", department: departments[0] ?? "Reception",
    qualifications: "", joiningDate: new Date().toISOString().slice(0, 10), shift: "Morning", shiftStart: "08:00", shiftEnd: "16:00",
    emergencyName: "", emergencyRelation: "", emergencyPhone: "", cnic: "", password: "", address: "", accessRole: "Receptionist", active: true,
  });
  const save = () => {
    const message = saveStaffMember(draft);
    if (message) return toast.error(message);
    toast.success("Staff record saved");
  };
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-3">
        <Field label="Full Name" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} />
        <Field label="Email" value={draft.email} onChange={(email) => setDraft({ ...draft, email })} />
        <Field label="Phone" value={draft.phone} onChange={(phone) => setDraft({ ...draft, phone })} />
        <Field label="CNIC" value={draft.cnic} onChange={(cnic) => setDraft({ ...draft, cnic })} />
        <Field label="Password" value={draft.password} onChange={(password) => setDraft({ ...draft, password })} />
        <Field label="Address" value={draft.address} onChange={(address) => setDraft({ ...draft, address })} />
        <Field label="Role" value={draft.accessRole} onChange={(accessRole) => setDraft({ ...draft, accessRole })} />
        <div>
          <Label>Gender</Label>
          <Select value={draft.gender} onValueChange={(gender) => setDraft({ ...draft, gender })}><SelectTrigger className="mt-1" aria-label="Gender"><SelectValue /></SelectTrigger><SelectContent>{["Female", "Male", "Other"].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
        </div>
        <Field label="Designation" value={draft.designation} onChange={(designation) => setDraft({ ...draft, designation })} />
        <Field label="Department" value={draft.department} onChange={(department) => setDraft({ ...draft, department })} />
        <Field label="Qualifications" value={draft.qualifications} onChange={(qualifications) => setDraft({ ...draft, qualifications })} />
        <div>
          <Label>Shift</Label>
          <Select value={draft.shift} onValueChange={(shift) => setDraft({ ...draft, shift })}><SelectTrigger className="mt-1" aria-label="Shift"><SelectValue /></SelectTrigger><SelectContent>{["Morning", "Evening", "Night", "Rotational"].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select>
        </div>
        <Field label="Shift start" value={draft.shiftStart} onChange={(shiftStart) => setDraft({ ...draft, shiftStart })} />
        <Field label="Shift end" value={draft.shiftEnd} onChange={(shiftEnd) => setDraft({ ...draft, shiftEnd })} />
        <Field label="Emergency name" value={draft.emergencyName} onChange={(emergencyName) => setDraft({ ...draft, emergencyName })} />
        <Field label="Relation" value={draft.emergencyRelation} onChange={(emergencyRelation) => setDraft({ ...draft, emergencyRelation })} />
        <Field label="Emergency phone" value={draft.emergencyPhone} onChange={(emergencyPhone) => setDraft({ ...draft, emergencyPhone })} />
        <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} /> Active</label></div>
        <div className="md:col-span-3"><Button onClick={save}>{draft.id ? "Update staff" : "Add staff"}</Button></div>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-3">Person</th><th className="p-3">Desk</th><th className="p-3">Shift</th><th className="p-3">Emergency</th><th className="p-3 text-right">Actions</th></tr></thead>
          <tbody className="divide-y">
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="p-3"><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.email} · {p.phone}</p></td>
                <td className="p-3">{p.designation}<span className="block text-xs text-muted-foreground">{p.department} · {p.active ? "Active" : "Inactive"}</span></td>
                <td className="p-3">{p.shift} {p.shiftStart}–{p.shiftEnd}</td>
                <td className="p-3">{p.emergencyName} {p.emergencyPhone}</td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => setDraft({ ...p, cnic: p.cnic || "", password: p.password || "", address: p.address || "", accessRole: p.accessRole || p.designation })}>Edit</Button>
                  <Button size="sm" variant="ghost" className="ml-2" onClick={() => { removeStaffMember(p.id); toast.success("Staff record removed"); }}>Remove</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = `rs-${label}`;
  return <div><Label htmlFor={id}>{label}</Label><Input id={id} className="mt-1" value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}
function Num({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return <div><Label htmlFor={`rs-${label}`}>{label}</Label><Input id={`rs-${label}`} type="number" className="mt-1" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} /></div>;
}
