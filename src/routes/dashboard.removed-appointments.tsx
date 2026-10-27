import { createFileRoute } from "@tanstack/react-router";
import { DENTISTS } from "@/lib/data";
import { setAppointmentDeleted, useDemo } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Empty, PageTitle, Restricted } from "./dashboard";

export const Route = createFileRoute("/dashboard/removed-appointments")({ component: RemovedAppointments });

function RemovedAppointments() {
  const [s] = useDemo();
  const rows = s.appointments.filter((a) => a.deleted);
  return (
    <Restricted allow={["Owner", "Branch Manager", "Receptionist"]}>
      <PageTitle title="Removed appointments" sub="Removing a visit hides it from the day list and frees the slot. Restoring puts it back. Nothing is sent to a server." />
      {rows.length === 0 && <Empty title="Nothing removed" body="Use Remove on the appointment list. The visit stays in this browser so it can be restored." />}
      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="p-3">When</th><th className="p-3">Patient</th><th className="p-3">Treatment</th><th className="p-3">Dentist</th><th className="p-3">Note</th><th className="p-3 text-right">Restore</th></tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((a) => {
                const patient = s.patients.find((p) => p.id === a.patientId);
                return (
                  <tr key={a.id}>
                    <td className="p-3">{a.date} {a.time}</td>
                    <td className="p-3">{patient?.name ?? a.patientId}</td>
                    <td className="p-3">{a.treatment}</td>
                    <td className="p-3">{DENTISTS.find((d) => d.id === a.dentistId)?.name ?? a.dentistId}</td>
                    <td className="p-3 text-muted-foreground">{a.notes || a.status}</td>
                    <td className="p-3 text-right"><Button size="sm" variant="outline" onClick={() => { setAppointmentDeleted(a.id, false); toast.success("Appointment restored"); }}>Restore</Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Restricted>
  );
}
