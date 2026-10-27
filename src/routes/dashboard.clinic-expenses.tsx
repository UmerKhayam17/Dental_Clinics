import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { money } from "@/lib/data";
import { activeDoctors, expenseTotal, printSheet, removeExpense, saveExpense, useHms, type ClinicExpense } from "@/lib/hms";
import { Empty, PageTitle, Restricted, Stat } from "./dashboard";

export const Route = createFileRoute("/dashboard/clinic-expenses")({ component: ExpensesPage });

function ExpensesPage() {
  const [s] = useHms();
  const doctors = activeDoctors(s);
  const [draft, setDraft] = useState<Omit<ClinicExpense, "id" | "deleted"> & { id?: string }>({
    kind: "hospital", doctor: "", welfare: 0, ot: 0, other: 0, description: "", date: new Date().toISOString().slice(0, 10),
  });
  const rows = s.expenses.filter((e) => !e.deleted);
  const doctorRows = rows.filter((e) => e.kind === "doctor");
  const hospital = rows.filter((e) => e.kind === "hospital").reduce((a, e) => a + expenseTotal(e), 0);
  const byDoctor = doctors.map((d) => ({ name: d.name, total: doctorRows.filter((e) => e.doctor === d.name).reduce((a, e) => a + expenseTotal(e), 0) })).filter((d) => d.total > 0);

  const save = () => {
    const message = saveExpense(draft);
    if (message) return toast.error(message);
    toast.success("Expense saved");
    setDraft({ kind: "hospital", doctor: "", welfare: 0, ot: 0, other: 0, description: "", date: new Date().toISOString().slice(0, 10) });
  };

  return (
    <Restricted allow={["Owner", "Branch Manager", "Receptionist", "Accountant"]}>
      <PageTitle title="Clinic expenses" sub="Doctor welfare, theatre costs, and studio costs are kept apart from the simpler expense list on Reports. Totals are calculated here." action={<Button variant="outline" onClick={() => printSheet("Expense summary", `<p>Studio expenses ${money(hospital)}</p><ul>${byDoctor.map((d) => `<li>${d.name}: ${money(d.total)}</li>`).join("")}</ul>`)}>Print summary</Button>} />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Studio expenses" value={money(hospital)} />
        <Stat label="Doctor expenses" value={money(doctorRows.reduce((a, e) => a + expenseTotal(e), 0))} />
        <Stat label="Entries" value={rows.length} />
      </div>
      <div className="mb-6 grid gap-3 rounded-xl border bg-card p-5 md:grid-cols-3">
        <div>
          <Label>Type</Label>
          <Select value={draft.kind} onValueChange={(kind) => setDraft({ ...draft, kind: kind as ClinicExpense["kind"] })}><SelectTrigger className="mt-1" aria-label="Expense type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="hospital">Studio</SelectItem><SelectItem value="doctor">Doctor</SelectItem></SelectContent></Select>
        </div>
        {draft.kind === "doctor" && (
          <div>
            <Label>Doctor</Label>
            <Select value={draft.doctor} onValueChange={(doctor) => setDraft({ ...draft, doctor })}><SelectTrigger className="mt-1" aria-label="Doctor"><SelectValue placeholder="Choose" /></SelectTrigger><SelectContent>{doctors.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent></Select>
          </div>
        )}
        <div><Label htmlFor="ed">Date</Label><Input id="ed" type="date" className="mt-1" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} /></div>
        <Num label="Welfare" value={draft.welfare} onChange={(welfare) => setDraft({ ...draft, welfare })} />
        <Num label="Theatre / OT" value={draft.ot} onChange={(ot) => setDraft({ ...draft, ot })} />
        <Num label="Other" value={draft.other} onChange={(other) => setDraft({ ...draft, other })} />
        <div className="md:col-span-2"><Label htmlFor="en">Description</Label><Input id="en" className="mt-1" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
        <div className="flex items-end"><Button onClick={save}>{draft.id ? "Update" : "Add expense"} · {money(expenseTotal(draft))}</Button></div>
      </div>
      {rows.length === 0 && <Empty title="No expenses" body="Add a studio or doctor expense. The total is welfare plus theatre plus other." />}
      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="p-3">Date</th><th className="p-3">Type</th><th className="p-3">Welfare</th><th className="p-3">OT</th><th className="p-3">Other</th><th className="p-3">Total</th><th className="p-3 text-right">Remove</th></tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((e) => (
                <tr key={e.id}>
                  <td className="p-3">{e.date}<span className="block text-xs text-muted-foreground">{e.description}</span></td>
                  <td className="p-3">{e.kind === "doctor" ? e.doctor : "Studio"}</td>
                  <td className="p-3">{money(e.welfare)}</td>
                  <td className="p-3">{money(e.ot)}</td>
                  <td className="p-3">{money(e.other)}</td>
                  <td className="p-3">{money(expenseTotal(e))}</td>
                  <td className="p-3 text-right"><Button size="sm" variant="ghost" onClick={() => { removeExpense(e.id); toast.success("Expense removed"); }}>Remove</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Restricted>
  );
}

function Num({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return <div><Label htmlFor={label}>{label}</Label><Input id={label} type="number" className="mt-1" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} /></div>;
}
