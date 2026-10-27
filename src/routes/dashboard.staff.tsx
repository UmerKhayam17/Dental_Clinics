import { createFileRoute } from "@tanstack/react-router";
import { BRANCHES, STAFF } from "@/lib/data";
import { setAttendance, today, useDemo } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { PageTitle, Restricted } from "./dashboard";

export const Route = createFileRoute("/dashboard/staff")({ component: StaffPage });

function StaffPage() {
  const [s] = useDemo();
  const day = today();
  return (
    <Restricted allow={["Owner", "Branch Manager"]}>
      <PageTitle title="Staff" sub="Attendance is for today only and stays in this browser. It does not clock anyone in for payroll." />
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Name</th><th className="p-3">Role</th><th className="p-3">Studio</th><th className="p-3">Today</th><th className="p-3 text-right">Mark</th></tr>
          </thead>
          <tbody className="divide-y">
            {STAFF.map((person) => {
              const mark = s.attendance.find((a) => a.staffId === person.id && a.date === day)?.status ?? "Not marked";
              return (
                <tr key={person.id}>
                  <td className="p-3"><p className="font-medium">{person.name}</p><p className="text-xs text-muted-foreground">{person.email}</p></td>
                  <td className="p-3">{person.role}</td>
                  <td className="p-3">{BRANCHES.find((b) => b.id === person.branchId)?.name}</td>
                  <td className="p-3">{mark}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant={mark === "Present" ? "default" : "outline"} onClick={() => setAttendance(person.id, "Present")}>Present</Button>
                    <Button size="sm" variant={mark === "Leave" ? "default" : "outline"} className="ml-2" onClick={() => setAttendance(person.id, "Leave")}>Leave</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Restricted>
  );
}
