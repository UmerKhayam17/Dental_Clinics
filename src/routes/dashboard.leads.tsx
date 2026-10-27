import { createFileRoute } from "@tanstack/react-router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setLeadStatus, type LeadStatus } from "@/lib/store";
import { Empty, PageTitle, statusTone, useFilteredDemo } from "./dashboard";

export const Route = createFileRoute("/dashboard/leads")({ component: Leads });

const STATUSES: LeadStatus[] = ["New", "Contacted", "Booked", "Lost"];

function Leads() {
  const { leads } = useFilteredDemo();
  return (
    <>
      <PageTitle title="Leads" sub="Website enquiries and online bookings land here. Seeded rows are fictional. New contact-form messages from this browser are real records of the demo, not of a live clinic." />
      {leads.length === 0 ? <Empty title="No enquiries" body="Send a message from the contact page and it will appear in this list." /> : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="p-3">Person</th><th className="p-3">Interest</th><th className="p-3">Source</th><th className="p-3">Note</th><th className="p-3">Status</th></tr>
            </thead>
            <tbody className="divide-y">
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="p-3"><p className="font-medium">{lead.name}</p><p className="text-xs text-muted-foreground">{lead.email} · {lead.created}</p></td>
                  <td className="p-3">{lead.treatment}</td>
                  <td className="p-3">{lead.source}</td>
                  <td className="max-w-xs p-3 text-muted-foreground">{lead.note}</td>
                  <td className="p-3">
                    <Select value={lead.status} onValueChange={(v) => setLeadStatus(lead.id, v as LeadStatus)}>
                      <SelectTrigger className="h-8 w-32" aria-label={`Status for ${lead.name}`}><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${statusTone[lead.status]}`}>{lead.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
