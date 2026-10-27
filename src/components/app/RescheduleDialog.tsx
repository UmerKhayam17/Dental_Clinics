import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TIME_SLOTS } from "@/lib/data";
import { addDays, bookedSlots, rescheduleAppointment, today, useDemo, type Appointment } from "@/lib/store";
import { cn } from "@/lib/utils";

export function RescheduleDialog({ appointment, open, onOpenChange }: { appointment: Appointment | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [s] = useDemo();
  const [date, setDate] = useState(appointment?.date ?? today());
  const [time, setTime] = useState(appointment?.time ?? "");
  if (!appointment) return null;
  const days = Array.from({ length: 14 }, (_, i) => addDays(i)).filter((d) => new Date(d + "T12:00:00").getDay() !== 0);
  const taken = bookedSlots(s, appointment.dentistId, date);
  const save = () => {
    if (!time) return toast.error("Choose a time");
    const err = rescheduleAppointment(appointment.id, date, time);
    if (err) return toast.error(err);
    toast.success("Appointment moved");
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Reschedule {appointment.id}</DialogTitle></DialogHeader>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((d) => (
            <button key={d} type="button" onClick={() => { setDate(d); setTime(""); }} className={cn("min-w-14 rounded-lg border px-2 py-1.5 text-center text-xs", date === d && "border-primary bg-primary text-primary-foreground")}>
              {new Date(d + "T12:00:00").toLocaleDateString("en", { weekday: "short", day: "numeric" })}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {TIME_SLOTS.map((slot) => {
            const busy = taken.has(slot) && !(date === appointment.date && slot === appointment.time);
            return (
              <button key={slot} type="button" disabled={busy} onClick={() => setTime(slot)} className={cn("rounded-md border px-2.5 py-1.5 text-sm", time === slot && "border-primary bg-primary text-primary-foreground", busy && "cursor-not-allowed line-through opacity-40")}>{slot}</button>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save time</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
