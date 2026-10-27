import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CLINIC, money } from "@/lib/data";
import { createInvoice, invoiceBalance, invoiceNet, invoicePaid, invoiceTotal, paymentMethods, recordPayment, recordRefund, type Invoice } from "@/lib/store";
import { Empty, PageTitle, Restricted, Stat, useFilteredDemo, useRole } from "./dashboard";

export const Route = createFileRoute("/dashboard/billing")({ component: Billing });

function Billing() {
  const role = useRole();
  const { invoices, patients, raw } = useFilteredDemo();
  const [amt, setAmt] = useState<Record<string, string>>({});
  const [method, setMethod] = useState("Card");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ patientId: patients[0]?.id ?? "", label: "Examination", amount: "90" });
  const name = (id: string) => raw.patients.find((p) => p.id === id)?.name ?? "—";
  const methods = paymentMethods();

  const pay = (id: string) => {
    const err = recordPayment(id, Number(amt[id]), method);
    if (err) return toast.error(err);
    setAmt({ ...amt, [id]: "" });
    toast.success("Payment recorded", { description: "The receipt is the payment line on the invoice. Nothing was sent to a bank." });
  };
  const refund = (id: string) => {
    const err = recordRefund(id, Number(amt[id]));
    if (err) return toast.error(err);
    setAmt({ ...amt, [id]: "" });
    toast.success("Refund recorded");
  };
  const create = () => {
    const amount = Number(draft.amount);
    if (!draft.patientId || !draft.label.trim() || !(amount > 0)) return toast.error("Patient, description, and amount are required");
    const id = createInvoice(draft.patientId, [{ label: draft.label.trim(), amount }]);
    toast.success(`Invoice ${id} created`);
    setOpen(false);
  };

  return (
    <Restricted allow={["Owner", "Branch Manager", "Receptionist", "Accountant"]}>
      <PageTitle title="Billing" sub={`Tax is ${raw.settings.taxRate}% and is applied when totals are shown. Viewing as ${role}.`} action={<Button onClick={() => setOpen(true)}>Create invoice</Button>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Invoiced" value={money(invoices.reduce((a, i) => a + invoiceTotal(i), 0))} />
        <Stat label="Collected" value={money(invoices.reduce((a, i) => a + invoicePaid(i), 0))} />
        <Stat label="Outstanding" value={money(invoices.reduce((a, i) => a + Math.max(0, invoiceBalance(i)), 0))} />
      </div>
      <div className="mb-3 flex items-center gap-2 text-sm">Method
        <Select value={method} onValueChange={setMethod}><SelectTrigger className="w-44" aria-label="Payment method"><SelectValue /></SelectTrigger><SelectContent>{methods.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
      </div>
      {invoices.length === 0 ? <Empty title="No invoices" body="Create one here, or invoice completed treatment from a patient chart." /> : (
        <div className="divide-y rounded-xl border bg-card">
          {[...invoices].reverse().map((i) => {
            const bal = invoiceBalance(i);
            const paid = invoicePaid(i);
            return (
              <div key={i.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                <div>
                  <p className="font-medium">{i.id} · {name(i.patientId)}</p>
                  <p className="text-xs text-muted-foreground">{i.date} · {i.items.map((x) => x.label).join(", ")} · net {money(invoiceNet(i))}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span>{money(invoiceTotal(i))}</span>
                  {bal > 0 ? <span className="text-warning">Due {money(bal)}</span> : <span className="text-success">Settled</span>}
                  <Input className="h-8 w-24" type="number" min={0} aria-label={`Amount for ${i.id}`} placeholder={bal > 0 ? String(bal) : "0"} value={amt[i.id] ?? ""} onChange={(e) => setAmt({ ...amt, [i.id]: e.target.value })} />
                  {bal > 0 && <Button size="sm" onClick={() => pay(i.id)}>Take payment</Button>}
                  {paid > 0 && <Button size="sm" variant="outline" onClick={() => refund(i.id)}>Refund</Button>}
                  <Button size="sm" variant="ghost" onClick={() => printInvoice(i, name(i.patientId))}>Print</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New invoice</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Patient</Label>
              <Select value={draft.patientId} onValueChange={(v) => setDraft({ ...draft, patientId: v })}><SelectTrigger className="mt-1" aria-label="Patient"><SelectValue placeholder="Choose" /></SelectTrigger><SelectContent>{patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
            </div>
            <div><Label htmlFor="il">Description</Label><Input id="il" className="mt-1" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} /></div>
            <div><Label htmlFor="ia">Amount</Label><Input id="ia" className="mt-1" type="number" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={create}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Restricted>
  );
}

function esc(s: string) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] ?? c));
}

function printInvoice(inv: Invoice, patient: string) {
  const rows = inv.items.map((item) => `<tr><td>${esc(item.label)}</td><td style="text-align:right">${money(item.amount)}</td></tr>`).join("");
  const html = `<!doctype html><html><head><title>${esc(inv.id)}</title><style>body{font-family:Georgia,serif;color:#173D3B;padding:48px}table{width:100%;border-collapse:collapse;margin-top:24px}td{padding:8px 0;border-bottom:1px solid #E6EAE7}h1{font-weight:normal}</style></head><body><p style="letter-spacing:.2em;font-size:12px">LUMIÈRE DENTAL STUDIO</p><h1>${esc(inv.id)}</h1><p>${esc(patient)} · ${esc(inv.date)}</p><p>${esc(CLINIC.address)} · ${esc(CLINIC.phone)}</p><table>${rows}</table><p>Discount ${money(inv.discount)} · Total ${money(invoiceTotal(inv))}</p><p style="font-size:12px;color:#87918E">Demonstration invoice. Technology by Next Software Development Company.</p></body></html>`;
  const w = window.open("", "invoice", "noopener,noreferrer,width=720,height=900");
  if (!w) return toast.error("Allow pop-ups to print");
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}
