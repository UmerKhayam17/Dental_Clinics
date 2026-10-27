import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RescheduleDialog } from "@/components/app/RescheduleDialog";
import { DENTISTS, TIME_SLOTS } from "@/lib/data";
import { addDays, rescheduleAppointment, today, type Appointment } from "@/lib/store";
import { cn } from "@/lib/utils";
import { PageTitle, statusTone, useFilteredDemo } from "./dashboard";

export const Route = createFileRoute("/dashboard/calendar")({ component: Calendar });

function monday(iso: string) {
  const d = new Date(iso + "T12:00:00");
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d.toISOString().slice(0, 10);
}

function Calendar() {
  const { appointments, raw } = useFilteredDemo();
  const [cursor, setCursor] = useState(monday(today()));
  const [dentist, setDentist] = useState("all");
  const [editing, setEditing] = useState<Appointment | null>(null);
  const days = useMemo(() => Array.from({ length: 6 }, (_, i) => addDaysFrom(cursor, i)), [cursor]);
  const name = (id: string) => raw.patients.find((p) => p.id === id)?.name ?? "Patient";

  const drop = (date: string, time: string, id: string) => {
    const err = rescheduleAppointment(id, date, time);
    if (err) toast.error(err);
    else toast.success("Appointment moved");
  };

  return (
    <>
      <PageTitle title="Calendar" sub="Drag a visit to another open slot, or open it to reschedule with the keyboard. Sunday is closed." action={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCursor(addDaysFrom(cursor, -7))}>Previous</Button>
          <Button variant="outline" size="sm" onClick={() => setCursor(monday(today()))}>This week</Button>
          <Button variant="outline" size="sm" onClick={() => setCursor(addDaysFrom(cursor, 7))}>Next</Button>
        </div>
      } />
      <Select value={dentist} onValueChange={setDentist}>
        <SelectTrigger className="mb-4 w-56" aria-label="Dentist"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All dentists</SelectItem>
          {DENTISTS.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <div className="grid min-w-[860px]" style={{ gridTemplateColumns: "72px repeat(6, minmax(0,1fr))" }}>
          <div className="border-b border-r bg-muted/40 p-2" />
          {days.map((d) => (
            <div key={d} className={cn("border-b border-r p-2 text-center text-xs", d === today() && "bg-secondary")}>
              <p className="uppercase tracking-wider text-muted-foreground">{new Date(d + "T12:00:00").toLocaleDateString("en", { weekday: "short" })}</p>
              <p className="font-display text-lg text-primary">{new Date(d + "T12:00:00").getDate()}</p>
            </div>
          ))}
          {TIME_SLOTS.map((time) => (
            <div key={time} className="contents">
              <div className="border-b border-r px-2 py-3 text-xs text-muted-foreground">{time}</div>
              {days.map((date) => {
                const items = appointments.filter((a) => a.date === date && a.time === time && a.status !== "Cancelled" && (dentist === "all" || a.dentistId === dentist));
                return (
                  <div key={date + time} className="min-h-16 border-b border-r p-1"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData("text/plain"); if (id) drop(date, time, id); }}>
                    {items.map((a) => (
                      <button key={a.id} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", a.id)} onClick={() => setEditing(a)}
                        className={cn("w-full rounded-md px-2 py-1 text-left text-[11px] leading-tight", statusTone[a.status])}>
                        <span className="block font-medium">{name(a.patientId)}</span>
                        <span className="opacity-80">{DENTISTS.find((d) => d.id === a.dentistId)?.name.split(" ").slice(-1)}</span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Dragging is a pointer shortcut. Each block is also a button that opens the reschedule form. <Link to="/dashboard/appointments" className="text-primary">Appointment list</Link></p>
      <RescheduleDialog key={editing?.id ?? "none"} appointment={editing} open={!!editing} onOpenChange={(v) => !v && setEditing(null)} />
    </>
  );
}

function addDaysFrom(iso: string, n: number) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
