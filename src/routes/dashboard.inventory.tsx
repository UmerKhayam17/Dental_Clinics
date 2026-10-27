import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BRANCHES, money } from "@/lib/data";
import { addStockItem, adjustStock } from "@/lib/store";
import { PageTitle, Restricted, useBranchFilter, useFilteredDemo } from "./dashboard";

export const Route = createFileRoute("/dashboard/inventory")({ component: Inventory });

function Inventory() {
  const { inventory } = useFilteredDemo();
  const { branch } = useBranchFilter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", sku: "", qty: "0", min: "1", supplier: "", expiry: "", unitCost: "0", branchId: branch === "all" ? "bayview" : branch });
  const value = inventory.reduce((a, i) => a + i.qty * i.unitCost, 0);
  const save = () => {
    if (draft.name.trim().length < 2) return toast.error("Name the material");
    addStockItem({ ...draft, qty: Number(draft.qty) || 0, min: Number(draft.min) || 0, unitCost: Number(draft.unitCost) || 0 });
    toast.success("Item added");
    setOpen(false);
  };
  return (
    <Restricted allow={["Owner", "Branch Manager", "Receptionist", "Accountant"]}>
      <PageTitle title="Inventory" sub={`On-hand value ${money(value)}. Procedure-linked consumption is off in this demonstration, so completing a treatment does not reduce stock.`} action={<Button onClick={() => setOpen(true)}>Add item</Button>} />
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Material</th><th className="p-3">Studio</th><th className="p-3">On hand</th><th className="p-3">Expires</th><th className="p-3">Value</th><th className="p-3 text-right">Adjust</th></tr>
          </thead>
          <tbody className="divide-y">
            {inventory.map((item) => (
              <tr key={item.id} className={item.qty <= item.min ? "bg-warning/10" : undefined}>
                <td className="p-3"><p className="font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.sku} · {item.supplier}</p></td>
                <td className="p-3">{BRANCHES.find((b) => b.id === item.branchId)?.city}</td>
                <td className="p-3">{item.qty} <span className="text-muted-foreground">/ min {item.min}</span>{item.qty <= item.min && <span className="ml-2 text-xs text-warning">Low</span>}</td>
                <td className="p-3">{item.expiry}</td>
                <td className="p-3">{money(item.qty * item.unitCost)}</td>
                <td className="p-3 text-right">
                  <Button size="sm" variant="outline" aria-label={`Decrease ${item.name}`} onClick={() => adjustStock(item.id, item.qty - 1)}>-</Button>
                  <Button size="sm" variant="outline" className="ml-2" aria-label={`Increase ${item.name}`} onClick={() => adjustStock(item.id, item.qty + 1)}>+</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add stock</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label htmlFor="sn">Name</Label><Input id="sn" className="mt-1" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
            <div><Label htmlFor="ss">SKU</Label><Input id="ss" className="mt-1" value={draft.sku} onChange={(e) => setDraft({ ...draft, sku: e.target.value })} /></div>
            <div><Label htmlFor="su">Supplier</Label><Input id="su" className="mt-1" value={draft.supplier} onChange={(e) => setDraft({ ...draft, supplier: e.target.value })} /></div>
            <div><Label htmlFor="sq">Quantity</Label><Input id="sq" className="mt-1" type="number" value={draft.qty} onChange={(e) => setDraft({ ...draft, qty: e.target.value })} /></div>
            <div><Label htmlFor="sm">Minimum</Label><Input id="sm" className="mt-1" type="number" value={draft.min} onChange={(e) => setDraft({ ...draft, min: e.target.value })} /></div>
            <div><Label htmlFor="sc">Unit cost</Label><Input id="sc" className="mt-1" type="number" value={draft.unitCost} onChange={(e) => setDraft({ ...draft, unitCost: e.target.value })} /></div>
            <div><Label htmlFor="se">Expiry</Label><Input id="se" className="mt-1" type="date" value={draft.expiry} onChange={(e) => setDraft({ ...draft, expiry: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Studio</Label><Select value={draft.branchId} onValueChange={(v) => setDraft({ ...draft, branchId: v })}><SelectTrigger className="mt-1" aria-label="Studio"><SelectValue /></SelectTrigger><SelectContent>{BRANCHES.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Restricted>
  );
}
