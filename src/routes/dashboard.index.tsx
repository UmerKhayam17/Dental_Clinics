import { createFileRoute, Link } from "@tanstack/react-router";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { UserPlus, CalendarPlus, Receipt, ClipboardList, Scan, Users, CalendarCheck, Hourglass, TrendingUp, ClipboardCheck, Wallet, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DENTISTS, money, TIME_SLOTS } from "@/lib/data";
import { invoiceBalance, invoicePaid, today } from "@/lib/store";
import { PageTitle, Panel, Stat, statusTone, useFilteredDemo, useRole } from "./dashboard";

const axis = { fontSize: 12, tickLine: false, axisLine: false, tick: { fill: "var(--muted-foreground)" } } as const;
const tooltip = { contentStyle: { borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12, boxShadow: "var(--shadow-soft)" } } as const;

export const Route = createFileRoute("/dashboard/")({ component: Overview });

function Overview() {
  const { ready, patients, appointments, invoices, plans, raw } = useFilteredDemo();
  const role = useRole();
  if (!ready) return <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>;

  const t = today();
  const month = t.slice(0, 7);
  const todays = appointments.filter((a) => a.date === t).sort((a, b) => a.time.localeCompare(b.time));
  const monthRev = invoices.flatMap((i) => i.payments).filter((p) => p.date.startsWith(month) && p.amount > 0).reduce((a, b) => a + b.amount, 0);
  const outstanding = invoices.reduce((a, i) => a + Math.max(0, invoiceBalance(i)), 0);
  const items = plans.flatMap((p) => p.items);
  const acceptance = items.length ? Math.round((items.filter((i) => i.status !== "Proposed").length / items.length) * 100) : 0;
  const finance = role !== "Dentist";
  const months = Array.from({ length: 6 }, (_, k) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - k)); return d.toISOString().slice(0, 7); });
  const revenue = months.map((m) => ({ m: new Date(m + "-02").toLocaleDateString("en", { month: "short" }), v: invoices.flatMap((i) => i.payments).filter((p) => p.date.startsWith(m) && p.amount > 0).reduce((a, b) => a + b.amount, 0) }));
  const growth = months.map((m) => ({ m: new Date(m + "-02").toLocaleDateString("en", { month: "short" }), v: patients.filter((p) => p.registered.startsWith(m)).length }));
  const byTreatment = Object.entries(appointments.reduce<Record<string, number>>((a, x) => ({ ...a, [x.treatment]: (a[x.treatment] ?? 0) + 1 }), {})).map(([k, v]) => ({ k, v })).sort((a, b) => b.v - a.v);
  const name = (id: string) => raw.patients.find((p) => p.id === id)?.name ?? "—";

  return (
    <>
      <PageTitle title={`Good ${new Date().getHours() < 12 ? "morning" : "afternoon"}`} sub={`${new Date().toDateString()} · signed in as ${role}. Figures come from the records in this browser.`} action={
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm"><Link to="/dashboard/patients" search={{ new: true }}><UserPlus className="h-4 w-4" />Add patient</Link></Button>
          <Button asChild variant="outline" size="sm"><Link to="/dashboard/appointments"><CalendarPlus className="h-4 w-4" />Book appointment</Link></Button>
          {finance && <Button asChild variant="outline" size="sm"><Link to="/dashboard/billing"><Receipt className="h-4 w-4" />Create invoice</Link></Button>}
          <Button asChild variant="outline" size="sm"><Link to="/dashboard/plans"><ClipboardList className="h-4 w-4" />Treatment plan</Link></Button>
          <Button asChild size="sm"><Link to="/dashboard/patients"><Scan className="h-4 w-4" />Dental chart</Link></Button>
        </div>
      } />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Users} label="Total patients" value={patients.length} hint={`${patients.filter((p) => p.registered.startsWith(month)).length} registered this month`} />
        <Stat icon={UserPlus} label="New patients" value={patients.filter((p) => p.registered >= addMonthStart()).length} hint="Since the first of this month" />
        <Stat icon={CalendarCheck} label="Today’s appointments" value={todays.length} hint={`${todays.filter((a) => a.status === "Completed").length} completed · ${todays.filter((a) => ["Requested", "Confirmed", "Checked In", "In Progress"].includes(a.status)).length} still open`} />
        <Stat icon={Hourglass} label="Pending requests" value={appointments.filter((a) => a.status === "Requested").length} hint="Waiting for reception" />
        {finance && <Stat icon={TrendingUp} label="Revenue this month" value={money(monthRev)} hint="Payments received" />}
        {finance && <Stat icon={Receipt} label="Outstanding" value={money(outstanding)} hint={`${invoices.filter((i) => invoiceBalance(i) > 0).length} open invoices`} />}
        <Stat icon={ClipboardCheck} label="Treatment acceptance" value={`${acceptance}%`} hint={`${items.length} plan items`} />
        {finance && <Stat icon={Wallet} label="Collected" value={money(invoices.reduce((a, i) => a + invoicePaid(i), 0))} hint="All stored payments, net of refunds" />}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {finance && (
          <Panel title="Revenue trend" sub="Collected payments by month. Empty months mean no payment was recorded, not a live forecast." className="xl:col-span-2">
            <div className="mt-4 h-64">
              <ResponsiveContainer>
                <AreaChart data={revenue} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="m" {...axis} />
                  <YAxis {...axis} width={56} tickFormatter={(v: number) => money(v)} />
                  <Tooltip formatter={(v: number) => [money(v), "Collected"]} {...tooltip} cursor={{ stroke: "var(--gold)", strokeDasharray: "4 4" }} />
                  <Area type="monotone" dataKey="v" stroke="var(--chart-1)" strokeWidth={2} fill="url(#rev-fill)" activeDot={{ r: 5, fill: "var(--gold)", stroke: "var(--card)", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        )}
        <Panel title="Treatment mix" sub="Appointments by treatment">
          <div className="mt-4" style={{ height: Math.max(160, byTreatment.length * 28) }}>
            <ResponsiveContainer>
              <BarChart data={byTreatment} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                <XAxis type="number" allowDecimals={false} hide />
                <YAxis type="category" dataKey="k" {...axis} fontSize={11} width={150} interval={0} />
                <Tooltip formatter={(v: number) => [v, "Appointments"]} {...tooltip} cursor={{ fill: "var(--secondary)" }} />
                <Bar dataKey="v" fill="var(--chart-2)" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Patient registrations" sub="New charts opened per month">
          <div className="mt-4 h-56">
            <ResponsiveContainer>
              <BarChart data={growth} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="m" {...axis} /><YAxis allowDecimals={false} {...axis} />
                <Tooltip formatter={(v: number) => [v, "Patients"]} {...tooltip} cursor={{ fill: "var(--secondary)" }} />
                <Bar dataKey="v" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Who is in today" sub="Booked slots per dentist" className="xl:col-span-2">
          <ul className="mt-5 space-y-4">
            {DENTISTS.map((d) => {
              const n = todays.filter((a) => a.dentistId === d.id && a.status !== "Cancelled").length;
              return (
                <li key={d.id} className="flex items-center gap-3">
                  <img src={d.photo} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2 text-sm"><span className="truncate font-medium">{d.name}</span><span className="shrink-0 text-muted-foreground">{n} of {TIME_SLOTS.length} slots</span></div>
                    <div className="mt-1.5 h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-gradient-to-r from-primary to-chart-3 transition-[width] duration-700" style={{ width: `${Math.min(100, (n / TIME_SLOTS.length) * 100)}%` }} /></div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel title="Today’s book" className="xl:col-span-3" action={<Button asChild variant="ghost" size="sm"><Link to="/dashboard/calendar">Open calendar<ArrowRight className="h-4 w-4" /></Link></Button>}>
          {todays.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Nothing booked today for this studio.</p> : (
            <ul className="mt-2 divide-y">
              {todays.map((a) => (
                <li key={a.id} className="-mx-2 flex flex-wrap items-center gap-3 rounded-lg px-2 py-3 text-sm transition-colors hover:bg-secondary/50">
                  <span className="w-14 font-display font-semibold tabular-nums text-primary">{a.time}</span>
                  <Link to="/dashboard/patients/$id" params={{ id: a.patientId }} className="min-w-40 font-medium hover:text-primary hover:underline">{name(a.patientId)}</Link>
                  <span className="flex-1 text-muted-foreground">{a.treatment} · {DENTISTS.find((d) => d.id === a.dentistId)?.name}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusTone[a.status]}`}>{a.status}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}

function addMonthStart() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}
