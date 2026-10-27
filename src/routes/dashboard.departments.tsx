import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { removeDepartment, saveDepartment, useHms, type Department } from "@/lib/hms";
import { Empty, PageTitle, Restricted } from "./dashboard";

export const Route = createFileRoute("/dashboard/departments")({ component: DepartmentsPage });

const blank = (): Omit<Department, "id"> => ({ name: "", description: "", location: "", status: "active", services: "", ward: "" });

function DepartmentsPage() {
  const [s] = useHms();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Omit<Department, "id"> & { id?: string }>(blank());
  const save = () => {
    if (draft.name.trim().length < 2) return toast.error("Name the department");
    saveDepartment(draft);
    toast.success(draft.id ? "Department updated" : "Department added");
    setOpen(false);
  };
  return (
    <Restricted allow={["Owner", "Branch Manager", "Accountant"]}>
      <PageTitle title="Departments" sub="Studios can group chairs and services the way the hospital desk grouped wards. Records stay in this browser." action={<Button onClick={() => { setDraft(blank()); setOpen(true); }}>Add department</Button>} />
      {s.departments.length === 0 && <Empty title="No departments" body="Add dentistry, orthodontics, or any other service list you want on the desk." />}
      <div className="grid gap-4 md:grid-cols-2">
        {s.departments.map((d) => (
          <article key={d.id} className="rounded-xl border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl text-primary">{d.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{d.location || "Location not set"} · {d.status}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => { setDraft(d); setOpen(true); }}>Edit</Button>
            </div>
            <p className="mt-3 text-sm">{d.description}</p>
            <p className="mt-2 text-sm text-muted-foreground">Services: {d.services || "—"}</p>
            <p className="text-sm text-muted-foreground">Ward / rooms: {d.ward || "—"}</p>
            <Button size="sm" variant="ghost" className="mt-3" onClick={() => { removeDepartment(d.id); toast.success("Department removed"); }}>Remove</Button>
          </article>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{draft.id ? "Edit department" : "New department"}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label htmlFor="dn">Name</Label><Input id="dn" className="mt-1" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
            <div><Label htmlFor="dl">Location</Label><Input id="dl" className="mt-1" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} /></div>
            <div><Label>Status</Label><Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as Department["status"] })}><SelectTrigger className="mt-1" aria-label="Status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
            <div><Label htmlFor="ds">Services</Label><Input id="ds" className="mt-1" value={draft.services} onChange={(e) => setDraft({ ...draft, services: e.target.value })} /></div>
            <div><Label htmlFor="dw">Ward or rooms</Label><Input id="dw" className="mt-1" value={draft.ward} onChange={(e) => setDraft({ ...draft, ward: e.target.value })} /></div>
            <div><Label htmlFor="dd">Description</Label><Textarea id="dd" className="mt-1" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Restricted>
  );
}
