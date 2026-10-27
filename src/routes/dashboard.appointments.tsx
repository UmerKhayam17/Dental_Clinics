import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RescheduleDialog } from "@/components/app/RescheduleDialog";
import { DENTISTS, TIME_SLOTS, TREATMENTS } from "@/lib/data";
import { STATUSES, bookAppointment, bookedSlots, setAppointmentDeleted, setAppointmentStatus, useDemo, type Appointment, type AppointmentStatus, type State } from "@/lib/store";
import { Empty, PageTitle, statusTone, useBranchFilter, useFilteredDemo } from "./dashboard";

export const Route = createFileRoute("/dashboard/appointments")({ component: Appointments });

const PAGE = 8;

function Appointments() {
  const { appointments, raw } = useFilteredDemo();
  const { branch } = useBranchFilter();
  const [full] = useDemo();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [dentist, setDentist] = useState("all");
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [walkOpen, setWalkOpen] = useState(false);
  const [walk, setWalk] = useState({ name: "", phone: "", treatment: TREATMENTS[0].name, dentistId: DENTISTS[0].id });
  const name = (id: string) => raw.patients.find((p) => p.id === id)?.name ?? full.patients.find((p) => p.id === id)?.name ?? "—";

  const rows = useMemo(() => appointments
    .filter((a) => (status === "all" || a.status === status) && (dentist === "all" || a.dentistId === dentist))
    .filter((a) => `${name(a.patientId)} ${a.treatment} ${a.id}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)), [appointments, q, status, dentist, full.patients]); // eslint-disable-line react-hooks/exhaustive-deps

  const setSt = (id: string, st: AppointmentStatus) => {
    setAppointmentStatus(id, st);
    toast.success(st === "Confirmed" ? "Confirmed — a simulated email was added to the patient record" : `Marked ${st.toLowerCase()}`);
  };

  const saveWalk = () => {
    if (walk.name.trim().length < 2 || walk.phone.replace(/\D/g, "").length < 7) return toast.error("Name and a real phone number are required");
    const slot = nextOpen(full, walk.dentistId);
    if (!slot) return toast.error("No open slot in the next two weeks");
    const id = bookAppointment({
      name: walk.name, phone: walk.phone, email: `walk-${Date.now()}@example.demo`,
      treatment: walk.treatment, dentistId: walk.dentistId, ...slot,
      source: "Walk-in", branchId: branch === "all" ? "bayview" : branch,
    });
    if (!id) return toast.error("That slot was just taken");
    toast.success(`Checked in at ${slot.time} on ${slot.date}`);
    setWalkOpen(false);
  };

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const shown = rows.slice(page * PAGE, page * PAGE + PAGE);

  return (
    <>
      <PageTitle title="Appointments" sub={`${appointments.filter((a) => a.status === "Requested").length} requests waiting. Confirming one writes a simulated message, not a real email. Remove hides a visit and frees the slot.`} action={<div className="flex gap-2"><Button asChild variant="outline"><Link to="/dashboard/removed-appointments">Removed</Link></Button><Button onClick={() => setWalkOpen(true)}>Walk-in</Button></div>} />
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative w-full max-w-xs"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search patient or treatment" className="pl-9" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} /></div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0); }}><SelectTrigger className="w-40" aria-label="Status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{STATUSES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select>
        <Select value={dentist} onValueChange={(v) => { setDentist(v); setPage(0); }}><SelectTrigger className="w-48" aria-label="Dentist"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All dentists</SelectItem>{DENTISTS.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">When</th><th className="p-3">Patient</th><th className="p-3">Treatment</th><th className="p-3">Dentist</th><th className="p-3">Source</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y">
            {shown.length === 0 && <tr><td colSpan={7} className="p-8"><Empty title="No appointments" body="Nothing matches these filters. Website requests appear here as soon as they are submitted in this browser." /></td></tr>}
            {shown.map((a) => (
              <tr key={a.id} className="hover:bg-muted/30">
                <td className="whitespace-nowrap p-3">{a.date}<span className="ml-2 text-muted-foreground">{a.time}</span>{a.rescheduleRequested && <span className="mt-1 block text-xs text-warning">Reschedule asked</span>}</td>
                <td className="p-3"><Link to="/dashboard/patients/$id" params={{ id: a.patientId }} className="font-medium text-primary hover:underline">{name(a.patientId)}</Link></td>
                <td className="p-3">{a.treatment}</td>
                <td className="p-3 text-muted-foreground">{DENTISTS.find((d) => d.id === a.dentistId)?.name}</td>
                <td className="p-3 text-muted-foreground">{a.source}</td>
                <td className="p-3"><span className={`rounded-full px-2.5 py-0.5 text-xs ${statusTone[a.status]}`}>{a.status}</span></td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    {a.status === "Requested" && <Button size="sm" onClick={() => setSt(a.id, "Confirmed")}>Confirm</Button>}
                    <Button size="sm" variant="outline" onClick={() => setEditing(a)}>Move</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setAppointmentDeleted(a.id, true); toast.success("Visit removed from the day list"); }}>Remove</Button>
                    <Select value={a.status} onValueChange={(v) => setSt(a.id, v as AppointmentStatus)}>
                      <SelectTrigger className="h-8 w-32" aria-label={`Status for ${a.id}`}><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-end gap-3 text-sm">
        <span className="text-muted-foreground">Page {Math.min(page + 1, pages)} of {pages}</span>
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
        <Button variant="outline" size="sm" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Next</Button>
      </div>
      <RescheduleDialog key={editing?.id ?? "none"} appointment={editing} open={!!editing} onOpenChange={(v) => !v && setEditing(null)} />
      <Dialog open={walkOpen} onOpenChange={setWalkOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Walk-in</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">The next open slot for the chosen dentist is used, and the visit is checked in. A double-booked slot is refused.</p>
          <div className="grid gap-3">
            <div><Label htmlFor="wn">Name</Label><Input id="wn" className="mt-1" value={walk.name} onChange={(e) => setWalk({ ...walk, name: e.target.value })} /></div>
            <div><Label htmlFor="wp">Phone</Label><Input id="wp" className="mt-1" value={walk.phone} onChange={(e) => setWalk({ ...walk, phone: e.target.value })} /></div>
            <div><Label>Treatment</Label>
              <Select value={walk.treatment} onValueChange={(v) => setWalk({ ...walk, treatment: v })}><SelectTrigger className="mt-1" aria-label="Treatment"><SelectValue /></SelectTrigger><SelectContent>{TREATMENTS.map((t) => <SelectItem key={t.slug} value={t.name}>{t.name}</SelectItem>)}</SelectContent></Select>
            </div>
            <div><Label>Dentist</Label>
              <Select value={walk.dentistId} onValueChange={(v) => setWalk({ ...walk, dentistId: v })}><SelectTrigger className="mt-1" aria-label="Dentist"><SelectValue /></SelectTrigger><SelectContent>{DENTISTS.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setWalkOpen(false)}>Cancel</Button><Button onClick={saveWalk}>Check in</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function nextOpen(s: State, dentistId: string) {
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    if (date.getDay() === 0) continue;
    const iso = date.toISOString().slice(0, 10);
    const taken = bookedSlots(s, dentistId, iso);
    const time = TIME_SLOTS.find((slot) => !taken.has(slot));
    if (time) return { date: iso, time };
  }
  return null;
}
