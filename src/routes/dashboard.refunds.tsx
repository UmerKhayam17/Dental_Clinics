import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { money } from "@/lib/data";
import { printSheet, refundedFor, saveRefund, setRefundStatus, useHms, type OpdRefund } from "@/lib/hms";
import { Empty, PageTitle, Restricted } from "./dashboard";

const REASONS = [
  { value: "service_not_rendered", label: "Service Not Rendered" },
  { value: "overpayment", label: "Overpayment" },
  { value: "cancellation", label: "Cancellation" },
  { value: "dissatisfaction", label: "Patient Dissatisfaction" },
  { value: "duplicate_payment", label: "Duplicate Payment" },
  { value: "other", label: "Other" },
];

export const Route = createFileRoute("/dashboard/refunds")({
  validateSearch: (s: Record<string, unknown>): { panel: "new" | "list" } => ({ panel: s.panel === "list" ? "list" : "new" }),
  component: RefundsPage,
});

function RefundsPage() {
  const { panel } = Route.useSearch();
  const [s] = useHms();
  const visits = s.visits.filter((v) => !v.deleted && v.amountPaid > 0);
  const [visitId, setVisitId] = useState(visits[0]?.id ?? "");
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [method, setMethod] = useState("cash");
  const [q, setQ] = useState("");
  const visit = visits.find((v) => v.id === visitId);
  const cap = visit ? visit.amountPaid - refundedFor(s, visit.id) : 0;
  const rows = s.refunds.filter((r) => `${r.patientName} ${r.mrn} ${r.reason}`.toLowerCase().includes(q.toLowerCase()));

  const save = () => {
    const message = saveRefund({
      visitId, refundAmount: amount, reason, description, refundMethod: method,
      originalMethod: visit?.paymentMethod ?? "cash", status: "approved",
    });
    if (message) return toast.error(message);
    toast.success("Refund recorded");
    setReason(""); setDescription(""); setAmount(0);
  };

  return (
    <Restricted allow={["Owner", "Branch Manager", "Receptionist", "Accountant"]}>
      <PageTitle title={panel === "list" ? "All Opd Refunds" : "Refund Opd"} sub="Choose the visit, the reason, the original payment method, and how the money is returned. A refund cannot exceed what is still unreturned." />
      {panel === "new" && (
      <div className="mb-6 grid gap-3 rounded-xl border bg-card p-5 md:grid-cols-3">
        <div>
          <Label>Visit</Label>
          <Select value={visitId} onValueChange={setVisitId}><SelectTrigger className="mt-1" aria-label="Visit"><SelectValue placeholder="Choose a visit" /></SelectTrigger><SelectContent>{visits.map((v) => <SelectItem key={v.id} value={v.id}>{v.name} · {v.mrn}</SelectItem>)}</SelectContent></Select>
          {visit && <p className="mt-1 text-xs text-muted-foreground">Paid {money(visit.amountPaid)} · still refundable {money(cap)}</p>}
        </div>
        <div><Label htmlFor="ra">Amount</Label><Input id="ra" type="number" className="mt-1" value={amount} onChange={(e) => setAmount(Number(e.target.value) || 0)} /></div>
        <div>
          <Label>Return by</Label>
          <Select value={method} onValueChange={setMethod}><SelectTrigger className="mt-1" aria-label="Refund method"><SelectValue /></SelectTrigger><SelectContent>{["cash", "bank_transfer", "credit_note", "adjustment", "other"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
        </div>
        <div>
          <Label>Refund Reason</Label>
          <Select value={reason || "none"} onValueChange={(v) => setReason(v === "none" ? "" : v)}><SelectTrigger className="mt-1" aria-label="Refund reason"><SelectValue placeholder="Select reason" /></SelectTrigger><SelectContent><SelectItem value="none">Select reason</SelectItem>{REASONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent></Select>
        </div>
        <div className="md:col-span-2"><Label htmlFor="rd">Note</Label><Input id="rd" className="mt-1" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        <div className="md:col-span-3"><Button onClick={save}>Record refund</Button></div>
      </div>
      )}
      {panel === "list" && <>
      <Input placeholder="Search refunds" className="mb-4 max-w-sm" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search refunds" />
      {rows.length === 0 && <Empty title="No refunds" body="Record one against a visit that has a payment." />}
      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="p-3">Patient</th><th className="p-3">Refund</th><th className="p-3">Reason</th><th className="p-3">Status</th><th className="p-3 text-right">Print</th></tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="p-3"><p className="font-medium">{r.patientName}</p><p className="text-xs text-muted-foreground">{r.mrn} · {r.date}</p></td>
                  <td className="p-3">{money(r.refundAmount)} <span className="text-xs text-muted-foreground">of {money(r.originalAmount)} via {r.refundMethod}</span></td>
                  <td className="p-3">{r.reason}</td>
                  <td className="p-3">
                    <Select value={r.status} onValueChange={(v) => setRefundStatus(r.id, v as OpdRefund["status"])}><SelectTrigger className="h-8 w-36" aria-label={`Status for ${r.id}`}><SelectValue /></SelectTrigger><SelectContent>{["pending", "approved", "processed", "rejected", "cancelled"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent></Select>
                  </td>
                  <td className="p-3 text-right"><Button size="sm" variant="outline" onClick={() => printRefund(r)}>Print</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </>}
    </Restricted>
  );
}

function printRefund(r: OpdRefund) {
  printSheet(`Refund ${r.id}`, `<p>${r.patientName} · ${r.mrn}</p><p>${money(r.refundAmount)} returned by ${r.refundMethod} on ${r.date}.</p><p>Reason: ${r.reason}</p><p>${r.description}</p><p>Status: ${r.status}</p>`);
}
