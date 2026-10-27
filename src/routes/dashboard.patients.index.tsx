import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BRANCHES, DENTISTS } from "@/lib/data";
import { patientSchema, type PatientFormValues } from "@/lib/schemas";
import { mergePatients, registerPatient } from "@/lib/store";
import { Empty, PageTitle, useBranchFilter, useFilteredDemo } from "./dashboard";

export const Route = createFileRoute("/dashboard/patients/")({
  validateSearch: (s: Record<string, unknown>): { new?: boolean } => ({ new: s.new === true || s.new === "true" ? true : undefined }),
  component: Patients,
});

const blank: PatientFormValues = {
  name: "", dob: "", gender: "", phone: "", email: "", address: "", emergency: "",
  allergies: "", medicalAlerts: "", history: "", branchId: "bayview", preferredDentist: "d1",
};

function Patients() {
  const search = Route.useSearch();
  const nav = useNavigate();
  const { patients } = useFilteredDemo();
  const { branch } = useBranchFilter();
  const [q, setQ] = useState("");
  const [alerts, setAlerts] = useState(false);
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(!!search.new);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [keep, setKeep] = useState("");
  const [drop, setDrop] = useState("");
  const form = useForm<PatientFormValues>({ resolver: zodResolver(patientSchema), defaultValues: { ...blank, branchId: branch === "all" ? "bayview" : branch } });

  const rows = patients.filter((p) => `${p.name} ${p.email} ${p.phone} ${p.id}`.toLowerCase().includes(q.toLowerCase()))
    .filter((p) => !alerts || (p.allergies && p.allergies !== "None reported") || p.medicalAlerts);
  const pages = Math.max(1, Math.ceil(rows.length / 9));
  const shown = rows.slice(page * 9, page * 9 + 9);

  const save = form.handleSubmit((values) => {
    const result = registerPatient({ ...values, source: "Walk-in" });
    if (result.error || !result.id) return toast.error(result.error ?? "Could not save");
    toast.success("Patient registered", { description: result.id });
    setOpen(false);
    form.reset(blank);
    nav({ to: "/dashboard/patients/$id", params: { id: result.id } });
  });

  const merge = () => {
    const err = mergePatients(keep, drop);
    if (err) return toast.error(err);
    toast.success("Records merged", { description: "Appointments, plans, invoices, and notes moved to the record you kept. The merge is in the audit log." });
    setMergeOpen(false);
  };

  return (
    <>
      <PageTitle title="Patients" sub={`${patients.length} records in this studio. Duplicate emails are refused. Merging keeps one chart and writes an audit line.`} action={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setMergeOpen(true)}>Merge</Button>
          <Button onClick={() => setOpen(true)}><UserPlus className="h-4 w-4" />Register</Button>
        </div>
      } />
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative w-full max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Name, email, phone, or ID" className="pl-9" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} /></div>
        <Button variant={alerts ? "default" : "outline"} onClick={() => setAlerts((v) => !v)}>Medical alerts</Button>
      </div>
      {shown.length === 0 ? <Empty title="No patients" body="Try another search, or register someone new." /> : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => (
            <Link key={p.id} to="/dashboard/patients/$id" params={{ id: p.id }} className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-shadow hover:shadow-soft">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-secondary font-display font-semibold text-primary">{p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{p.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{p.id} · {p.phone}</span>
              </span>
              {((p.allergies && p.allergies !== "None reported") || p.medicalAlerts) && <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs text-destructive">Alert</span>}
            </Link>
          ))}
        </div>
      )}
      <div className="mt-4 flex justify-end gap-3 text-sm">
        <span className="text-muted-foreground">Page {Math.min(page + 1, pages)} of {pages}</span>
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
        <Button variant="outline" size="sm" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Next</Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader><DialogTitle>Register a patient</DialogTitle></DialogHeader>
          <form onSubmit={save} className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name" error={form.formState.errors.name?.message}><Input {...form.register("name")} /></Field>
            <Field label="Date of birth" error={form.formState.errors.dob?.message}><Input type="date" {...form.register("dob")} /></Field>
            <Field label="Gender" error={form.formState.errors.gender?.message}><Input placeholder="Optional" {...form.register("gender")} /></Field>
            <Field label="Phone" error={form.formState.errors.phone?.message}><Input {...form.register("phone")} /></Field>
            <Field label="Email" error={form.formState.errors.email?.message}><Input {...form.register("email")} /></Field>
            <Field label="Emergency contact" error={form.formState.errors.emergency?.message}><Input {...form.register("emergency")} /></Field>
            <Field label="Address" className="sm:col-span-2" error={form.formState.errors.address?.message}><Input {...form.register("address")} /></Field>
            <Field label="Allergies" error={form.formState.errors.allergies?.message}><Input {...form.register("allergies")} /></Field>
            <Field label="Medical alerts" error={form.formState.errors.medicalAlerts?.message}><Input {...form.register("medicalAlerts")} /></Field>
            <Field label="History" className="sm:col-span-2" error={form.formState.errors.history?.message}><Input {...form.register("history")} /></Field>
            <div>
              <Label>Studio</Label>
              <Select value={form.watch("branchId")} onValueChange={(v) => form.setValue("branchId", v)}><SelectTrigger className="mt-1" aria-label="Studio"><SelectValue /></SelectTrigger><SelectContent>{BRANCHES.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select>
            </div>
            <div>
              <Label>Preferred dentist</Label>
              <Select value={form.watch("preferredDentist")} onValueChange={(v) => form.setValue("preferredDentist", v)}><SelectTrigger className="mt-1" aria-label="Preferred dentist"><SelectValue /></SelectTrigger><SelectContent>{DENTISTS.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select>
            </div>
            <DialogFooter className="sm:col-span-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit">Save patient</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={mergeOpen} onOpenChange={setMergeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Merge two records</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">The second record is removed. Its visits, invoices, chart marks, and notes are kept on the first. This is written to the audit log.</p>
          <div className="grid gap-3">
            <div><Label>Keep</Label><Select value={keep} onValueChange={setKeep}><SelectTrigger className="mt-1" aria-label="Record to keep"><SelectValue placeholder="Choose" /></SelectTrigger><SelectContent>{patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} · {p.id}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Merge away</Label><Select value={drop} onValueChange={setDrop}><SelectTrigger className="mt-1" aria-label="Record to merge"><SelectValue placeholder="Choose" /></SelectTrigger><SelectContent>{patients.filter((p) => p.id !== keep).map((p) => <SelectItem key={p.id} value={p.id}>{p.name} · {p.id}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setMergeOpen(false)}>Cancel</Button><Button onClick={merge} disabled={!keep || !drop}>Merge</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, error, children, className }: { label: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
