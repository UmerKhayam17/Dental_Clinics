import { createFileRoute, Link } from "@tanstack/react-router";
import { money } from "@/lib/data";
import { invoiceBalance } from "@/lib/store";
import { Empty, PageTitle, useFilteredDemo } from "./dashboard";

export const Route = createFileRoute("/dashboard/notifications")({ component: Notes });

function Notes() {
  const { appointments, inventory, invoices, plans, raw } = useFilteredDemo();
  const name = (id: string) => raw.patients.find((p) => p.id === id)?.name ?? "Patient";
  const items = [
    ...appointments.filter((a) => a.status === "Requested").map((a) => ({ id: a.id, tone: "Request", text: `${name(a.patientId)} asked for ${a.treatment} on ${a.date} at ${a.time}`, to: "/dashboard/appointments" as const })),
    ...appointments.filter((a) => a.rescheduleRequested).map((a) => ({ id: a.id + "r", tone: "Reschedule", text: `${name(a.patientId)} asked to move ${a.date} at ${a.time}`, to: "/dashboard/appointments" as const })),
    ...inventory.filter((i) => i.qty <= i.min).map((i) => ({ id: i.id, tone: "Stock", text: `${i.name} is at ${i.qty} (minimum ${i.min})`, to: "/dashboard/inventory" as const })),
    ...invoices.filter((i) => invoiceBalance(i) > 0).map((i) => ({ id: i.id, tone: "Balance", text: `${i.id} · ${name(i.patientId)} still owes ${money(invoiceBalance(i))}`, to: "/dashboard/billing" as const })),
    ...plans.flatMap((p) => p.items.filter((it) => it.status === "Proposed").map((it, n) => ({ id: p.id + n, tone: "Follow-up", text: `${name(p.patientId)} has not accepted ${it.procedure}`, to: "/dashboard/plans" as const }))),
  ];
  return (
    <>
      <PageTitle title="Notifications" sub="Work waiting on the records in this browser. Nothing here is pushed to a phone." />
      {items.length === 0 ? <Empty title="The list is clear" body="New requests, low stock, balances, and unaccepted plans will collect here." /> : (
        <ul className="divide-y rounded-xl border bg-card">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <span><span className="mr-3 text-[11px] uppercase tracking-[0.16em] text-gold">{item.tone}</span>{item.text}</span>
              <Link to={item.to} className="text-primary">Open</Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
