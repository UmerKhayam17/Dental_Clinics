import { createFileRoute } from "@tanstack/react-router";
import { BRANCHES, DENTISTS, TIME_SLOTS } from "@/lib/data";
import { today } from "@/lib/store";
import { PageTitle, useFilteredDemo } from "./dashboard";

export const Route = createFileRoute("/dashboard/doctors")({ component: Doctors });

function Doctors() {
  const { appointments } = useFilteredDemo();
  const t = today();
  return (
    <>
      <PageTitle title="Doctors" sub="Workload is counted from appointments in the current studio filter. Leave and hours are illustrative for the demonstration." />
      <div className="grid gap-4 lg:grid-cols-3">
        {DENTISTS.map((d) => {
          const mine = appointments.filter((a) => a.dentistId === d.id && a.status !== "Cancelled");
          const todayCount = mine.filter((a) => a.date === t).length;
          const done = mine.filter((a) => a.status === "Completed").length;
          return (
            <article key={d.id} className="overflow-hidden rounded-xl border bg-card">
              <img src={d.photo} alt="" className="h-52 w-full object-cover object-top" />
              <div className="p-5">
                <h2 className="font-display text-xl font-semibold text-primary">{d.name}</h2>
                <p className="text-sm text-muted-foreground">{d.title}</p>
                <p className="mt-3 text-sm">{d.qualifications}</p>
                <p className="mt-1 text-xs text-muted-foreground">{d.branches.map((b) => BRANCHES.find((x) => x.id === b)?.name).join(" · ")}</p>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-lg bg-secondary p-2"><dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Today</dt><dd className="font-display text-lg">{todayCount}</dd></div>
                  <div className="rounded-lg bg-secondary p-2"><dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Booked</dt><dd className="font-display text-lg">{mine.length}</dd></div>
                  <div className="rounded-lg bg-secondary p-2"><dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Done</dt><dd className="font-display text-lg">{done}</dd></div>
                </dl>
                <p className="mt-3 text-xs text-muted-foreground">Today’s list uses {todayCount} of {TIME_SLOTS.length} bookable slots.</p>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
