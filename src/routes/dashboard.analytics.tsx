import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useFilteredDemo, PageTitle, Restricted, Stat } from "./dashboard";

export const Route = createFileRoute("/dashboard/analytics")({ component: Analytics });

function Analytics() {
  const { appointments, patients, plans, raw } = useFilteredDemo();
  const web = appointments.filter((a) => a.source === "Website");
  const converted = web.filter((a) => !["Requested", "Cancelled"].includes(a.status)).length;
  const conv = web.length ? Math.round((converted / web.length) * 100) : 0;
  const sources = Object.entries(patients.reduce<Record<string, number>>((a, p) => ({ ...a, [p.source]: (a[p.source] ?? 0) + 1 }), {})).map(([k, v]) => ({ k, v }));
  const returning = patients.filter((p) => appointments.filter((a) => a.patientId === p.id).length > 1).length;
  const pending = plans.flatMap((t) => t.items.filter((i) => i.status === "Proposed").map((i) => ({ ...i, patientId: t.patientId })));
  const inquiries = raw.leads.filter((l) => l.source === "Website");
  return (
    <Restricted allow={["Owner", "Branch Manager"]}>
      <PageTitle title="Growth" sub="These figures are counted from demonstration appointments, patients, and enquiries. They are not website traffic, ad results, or search rankings. Connect an analytics account in Settings only as a label — this demo does not import one." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Website enquiries" value={inquiries.length} hint="Leads marked Website" />
        <Stat label="Website bookings" value={web.length} />
        <Stat label="Booking conversion" value={`${conv}%`} hint="Website visits moved past Requested" />
        <Stat label="Returning patients" value={returning} hint="More than one appointment" />
        <Stat label="No-shows" value={appointments.filter((a) => a.status === "No Show").length} />
        <Stat label="Open follow-ups" value={pending.length} hint="Proposed plan items" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-display font-semibold">How patients found the studio</h2>
          <div className="mt-4 h-64"><ResponsiveContainer><BarChart data={sources}><XAxis dataKey="k" fontSize={12} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="v" fill="var(--chart-1)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-display font-semibold">Treatment follow-ups</h2>
          {pending.length === 0 ? <p className="py-6 text-sm text-muted-foreground">No proposed treatment is waiting.</p> : (
            <ul className="mt-3 divide-y text-sm">{pending.map((item, i) => (
              <li key={i} className="flex justify-between gap-3 py-2">
                <Link to="/dashboard/patients/$id" params={{ id: item.patientId }} className="text-primary">{patients.find((p) => p.id === item.patientId)?.name ?? raw.patients.find((p) => p.id === item.patientId)?.name}</Link>
                <span className="text-muted-foreground">{item.procedure}</span>
              </li>
            ))}</ul>
          )}
        </div>
      </div>
    </Restricted>
  );
}
