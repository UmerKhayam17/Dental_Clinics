import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PROCEDURES, money } from "@/lib/data";
import { addPlanItem, setPlanStatus, type PlanStatus } from "@/lib/store";
import { Empty, PageTitle, statusTone, useFilteredDemo } from "./dashboard";

export const Route = createFileRoute("/dashboard/plans")({ component: Plans });

function Plans() {
  const { plans, patients, raw } = useFilteredDemo();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ patientId: patients[0]?.id ?? "", procedure: PROCEDURES[0].name, tooth: "", cost: String(PROCEDURES[0].cost) });
  const name = (id: string) => raw.patients.find((p) => p.id === id)?.name ?? "Patient";
  const save = () => {
    const cost = Number(draft.cost);
    if (!draft.patientId || !(cost >= 0)) return toast.error("Choose a patient and a cost");
    const tooth = draft.tooth ? Number(draft.tooth) : undefined;
    if (draft.tooth && Number.isNaN(tooth)) return toast.error("Tooth should be an FDI number, or left blank");
    addPlanItem(draft.patientId, { procedure: draft.procedure, cost, status: "Proposed", tooth });
    toast.success("Added to the plan");
    setOpen(false);
  };
  return (
    <>
      <PageTitle title="Treatment plans" sub="Acceptance is recorded here and on the patient chart. History stays on the plan." action={<Button onClick={() => setOpen(true)}>Add item</Button>} />
      {plans.length === 0 ? <Empty title="No plans in this studio" body="Add an item, or record one from a tooth on the dental chart." /> : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <section key={plan.id} className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display font-semibold"><Link to="/dashboard/patients/$id" params={{ id: plan.patientId }} className="text-primary hover:underline">{name(plan.patientId)}</Link></h2>
                <p className="text-sm text-muted-foreground">{plan.id} · {money(plan.items.reduce((a, i) => a + i.cost, 0))} · opened {plan.created}</p>
              </div>
              <ul className="mt-3 divide-y text-sm">
                {plan.items.map((item, i) => (
                  <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <span>{item.procedure}{item.tooth ? ` · tooth ${item.tooth}` : ""}</span>
                    <span className="flex items-center gap-3">{money(item.cost)}
                      <Select value={item.status} onValueChange={(v) => setPlanStatus(plan.id, i, v as PlanStatus)}>
                        <SelectTrigger className="h-8 w-32" aria-label="Plan item status"><SelectValue /></SelectTrigger>
                        <SelectContent>{(["Proposed", "Accepted", "Completed"] as PlanStatus[]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${statusTone[item.status]}`}>{item.status}</span>
                    </span>
                  </li>
                ))}
              </ul>
              {plan.history.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Latest: {plan.history[plan.history.length - 1].at} — {plan.history[plan.history.length - 1].action}</p>}
            </section>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add a plan item</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Patient</Label><Select value={draft.patientId} onValueChange={(v) => setDraft({ ...draft, patientId: v })}><SelectTrigger className="mt-1" aria-label="Patient"><SelectValue /></SelectTrigger><SelectContent>{patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
            <div><Label>Procedure</Label><Select value={draft.procedure} onValueChange={(v) => { const found = PROCEDURES.find((p) => p.name === v); setDraft({ ...draft, procedure: v, cost: String(found?.cost ?? draft.cost) }); }}><SelectTrigger className="mt-1" aria-label="Procedure"><SelectValue /></SelectTrigger><SelectContent>{PROCEDURES.map((p) => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label htmlFor="tooth">Tooth (FDI)</Label><Input id="tooth" className="mt-1" value={draft.tooth} onChange={(e) => setDraft({ ...draft, tooth: e.target.value })} placeholder="Optional" /></div>
              <div><Label htmlFor="cost">Estimate</Label><Input id="cost" className="mt-1" type="number" value={draft.cost} onChange={(e) => setDraft({ ...draft, cost: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
