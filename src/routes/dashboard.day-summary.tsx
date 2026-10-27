import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { money } from "@/lib/data";
import { expenseTotal, printSheet, refundedFor, useHms, visitTotal } from "@/lib/hms";
import { PageTitle, Restricted, Stat } from "./dashboard";

export const Route = createFileRoute("/dashboard/day-summary")({
  validateSearch: (s: Record<string, unknown>): { view: "opd" | "summary" } => ({ view: s.view === "opd" ? "opd" : "summary" }),
  component: DaySummary,
});

function DaySummary() {
  const { view } = Route.useSearch();
  const [s] = useHms();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const visits = s.visits.filter((v) => !v.deleted && v.date === date);
  const procedures = s.procedures.filter((p) => !p.deleted && p.date === date);
  const bills = s.bills.filter((b) => b.status === "paid" && b.date === date);
  const refunds = s.refunds.filter((r) => r.date === date && r.status !== "rejected" && r.status !== "cancelled");
  const expenses = s.expenses.filter((e) => !e.deleted && e.date === date);
  const opd = visits.reduce((a, v) => a + v.amountPaid, 0);
  const proc = procedures.reduce((a, p) => a + p.amountPaid, 0);
  const sales = bills.reduce((a, b) => a + b.total, 0);
  const returned = refunds.reduce((a, r) => a + r.refundAmount, 0);
  const spent = expenses.reduce((a, e) => a + expenseTotal(e), 0);
  const print = () => printSheet(`Day summary ${date}`, `
    <p>OPD collected ${money(opd)} across ${visits.length} visits.</p>
    <p>Procedures collected ${money(proc)}.</p>
    <p>Shop sales ${money(sales)}.</p>
    <p>Refunds ${money(returned)}.</p>
    <p>Expenses ${money(spent)}.</p>
    <p>Net ${money(opd + proc + sales - returned - spent)}.</p>
    <h2>Visits</h2><table>${visits.map((v) => `<tr><td>${v.mrn} ${v.name}</td><td>${money(v.amountPaid)} / ${money(visitTotal(v))}</td><td>refunded ${money(refundedFor(s, v.id))}</td></tr>`).join("")}</table>
  `);
  return (
    <Restricted allow={["Owner", "Branch Manager", "Receptionist", "Accountant"]}>
      <PageTitle title={view === "opd" ? "OPD" : "Summary"} sub="OPD collected, procedures, shop sales, refunds, and expenses for the date you pick. Every figure is calculated from records in this browser." action={<Button variant="outline" onClick={print}>Print</Button>} />
      <div className="mb-4 max-w-xs"><Label htmlFor="sd">Date</Label><Input id="sd" type="date" className="mt-1" value={date} onChange={(e) => setDate(e.target.value)} /></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="OPD collected" value={money(opd)} hint={`${visits.length} visits`} />
        <Stat label="Procedures collected" value={money(proc)} hint={`${procedures.length} procedures`} />
        <Stat label="Shop sales" value={money(sales)} hint={`${bills.length} paid bills`} />
        <Stat label="Refunds" value={money(returned)} hint={`${refunds.length} refunds`} />
        <Stat label="Expenses" value={money(spent)} hint={`${expenses.length} entries`} />
        <Stat label="Net" value={money(opd + proc + sales - returned - spent)} hint="Collected minus refunds and expenses" />
      </div>
    </Restricted>
  );
}
