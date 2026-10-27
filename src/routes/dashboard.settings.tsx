import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { resetDemo, setSettings, useDemo } from "@/lib/store";
import { PageTitle, Restricted } from "./dashboard";

export const Route = createFileRoute("/dashboard/settings")({ component: SettingsPage });

function SettingsPage() {
  const [s] = useDemo();
  return (
    <Restricted allow={["Owner"]}>
      <PageTitle title="Clinic settings" sub="Tax changes the invoice total immediately. Integration switches do not connect to WhatsApp, an SMS gateway, or an analytics account." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-display font-semibold">Money</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="tax">Tax rate (%)</Label><Input id="tax" className="mt-1" type="number" min={0} value={s.settings.taxRate} onChange={(e) => setSettings({ taxRate: Number(e.target.value) || 0 })} /></div>
            <div><Label htmlFor="rem">Reminder window (hours)</Label><Input id="rem" className="mt-1" type="number" min={1} value={s.settings.reminderHours} onChange={(e) => setSettings({ reminderHours: Number(e.target.value) || 24 })} /></div>
            <div className="sm:col-span-2"><Label htmlFor="dig">Digital payment label</Label><Input id="dig" className="mt-1" value={s.settings.digitalLabel} onChange={(e) => setSettings({ digitalLabel: e.target.value })} /></div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Currency in this demonstration is US dollars. The reminder window is stored for a future scheduler and does not send anything.</p>
        </section>
        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-display font-semibold">Simulated integrations</h2>
          <div className="mt-4 space-y-4">
            {([
              ["whatsapp", "WhatsApp Business"],
              ["sms", "SMS provider"],
              ["analytics", "Website analytics"],
            ] as const).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div><p className="text-sm font-medium">{label}</p><p className="text-xs text-muted-foreground">Off means the demo will not pretend a provider is connected.</p></div>
                <Switch checked={s.settings.integrations[key]} onCheckedChange={(v) => setSettings({ integrations: { [key]: v } })} aria-label={label} />
              </div>
            ))}
          </div>
          <Button className="mt-6" variant="outline" onClick={() => { resetDemo(); toast.success("Demonstration data restored"); }}>Restore original records</Button>
        </section>
        <section className="rounded-xl border bg-card p-5 lg:col-span-2">
          <h2 className="font-display font-semibold">Audit</h2>
          <ul className="mt-3 max-h-80 divide-y overflow-auto text-sm">
            {s.audit.map((event) => (
              <li key={event.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span>{event.action}</span>
                <span className="text-xs text-muted-foreground">{event.actor} · {event.at.slice(0, 16).replace("T", " ")}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Restricted>
  );
}
