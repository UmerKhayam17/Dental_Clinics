import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { DENTISTS, money } from "@/lib/data";
import { invoiceBalance, invoicePaid } from "@/lib/store";
import { PageTitle, Restricted, Stat, useFilteredDemo } from "./dashboard";

export const Route = createFileRoute("/dashboard/reports")({ component: Reports });

function Reports() {
  const { appointments, invoices, patients, expenses, raw } = useFilteredDemo();
  const [windowDays, setWindowDays] = useState<30 | 90 | 0>(30);
  const from = windowDays === 0 ? "0000" : new Date(Date.now() - windowDays * 86400000).toISOString().slice(0, 10);
  const appts = appointments.filter((a) => a.date >= from);
  const inv = invoices.filter((i) => i.date >= from);
  const noshow = appts.filter((a) => a.status === "No Show").length;
  const done = appts.filter((a) => a.status === "Completed").length;
  const rate = appts.length ? Math.round((noshow / appts.length) * 100) : 0;
  const byDoctor = DENTISTS.map((d) => ({ k: d.name.split(" ").slice(-1)[0], v: appts.filter((a) => a.dentistId === d.id && a.status === "Completed").length }));
  const collected = inv.flatMap((i) => i.payments).filter((p) => p.date >= from && p.amount > 0).reduce((a, b) => a + b.amount, 0);
  const spend = expenses.filter((e) => e.date >= from).reduce((a, b) => a + b.amount, 0);
  const exportCsv = () => {
    const rows = [["Date", "Time", "Patient", "Treatment", "Dentist", "Status", "Source"], ...appts.map((a) => [a.date, a.time, raw.patients.find((p) => p.id === a.patientId)?.name ?? "", a.treatment, DENTISTS.find((d) => d.id === a.dentistId)?.name ?? "", a.status, a.source])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "lumiere-appointments.csv";
    link.click();
  };
  return (
    <Restricted allow={["Owner", "Branch Manager", "Accountant"]}>
      <PageTitle title="Reports" sub="Every number is calculated from demonstration records. Export is a CSV of the appointments in this window." action={
        <div className="flex gap-2">
          {([30, 90, 0] as const).map((n) => <Button key={n} size="sm" variant={windowDays === n ? "default" : "outline"} onClick={() => setWindowDays(n)}>{n === 0 ? "All" : `${n} days`}</Button>)}
          <Button size="sm" variant="outline" onClick={exportCsv}>Export CSV</Button>
          <Button size="sm" variant="outline" onClick={() => window.print()}>Print</Button>
        </div>
      } />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Appointments" value={appts.length} />
        <Stat label="Completed" value={done} />
        <Stat label="No-show rate" value={`${rate}%`} hint={`${noshow} no-shows`} />
        <Stat label="New patients" value={patients.filter((p) => p.registered >= from).length} />
        <Stat label="Collected" value={money(collected)} />
        <Stat label="Outstanding" value={money(inv.reduce((a, i) => a + Math.max(0, invoiceBalance(i)), 0))} />
        <Stat label="Net collected" value={money(inv.reduce((a, i) => a + invoicePaid(i), 0))} hint="Includes refunds as negative payments" />
        <Stat label="Expenses" value={money(spend)} />
      </div>
      <div className="mt-6 rounded-xl border bg-card p-5">
        <h2 className="font-display font-semibold">Completed visits by dentist</h2>
        <div className="mt-4 h-64"><ResponsiveContainer><BarChart data={byDoctor}><XAxis dataKey="k" fontSize={12} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="v" fill="var(--chart-1)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </div>
    </Restricted>
  );
}
