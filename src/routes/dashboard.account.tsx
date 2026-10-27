import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { readSession } from "@/lib/auth";
import { PageTitle, Restricted } from "./dashboard";

export const Route = createFileRoute("/dashboard/account")({ component: AccountSettings });

type Settings = {
  name: string; email: string; phone: string; specialty: string; licenseNumber: string; hospital: string; address: string;
  notifications: boolean; darkMode: boolean; twoFactor: boolean;
};

const KEY = "lumiere-account-settings";
const blank = (): Settings => ({
  name: "", email: "", phone: "", specialty: "", licenseNumber: "", hospital: "Next Dental Clinic", address: "",
  notifications: true, darkMode: false, twoFactor: false,
});

function AccountSettings() {
  const [tab, setTab] = useState<"profile" | "security" | "preferences">("profile");
  const [form, setForm] = useState<Settings>(blank);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  useEffect(() => {
    const session = readSession();
    const saved = localStorage.getItem(KEY);
    const base = blank();
    if (session) { base.name = session.name; base.email = session.email; }
    if (saved) {
      try { setForm({ ...base, ...JSON.parse(saved) }); } catch { setForm(base); }
    } else setForm(base);
  }, []);
  const set = (key: keyof Settings, value: string | boolean) => setForm({ ...form, [key]: value });
  const save = () => {
    localStorage.setItem(KEY, JSON.stringify(form));
    toast.success("Settings saved in this browser");
  };
  const updatePassword = () => {
    if (!current || next.length < 8 || next !== confirm) return toast.error("Check the current password, and use a new password of at least 8 characters that matches the confirmation");
    localStorage.setItem(KEY, JSON.stringify({ ...form, passwordChangedAt: new Date().toISOString() }));
    setCurrent(""); setNext(""); setConfirm("");
    toast.success("Password updated in this browser");
  };
  return (
    <Restricted allow={["Owner", "Branch Manager", "Dentist", "Receptionist", "Accountant"]}>
      <PageTitle title="Account Settings" sub="Profile, security, and preferences for this desk login. Nothing is sent to a server." />
      <div className="mb-4 flex gap-2 border-b">
        {(["profile", "security", "preferences"] as const).map((id) => (
          <button key={id} className={`px-4 py-2 text-sm capitalize ${tab === id ? "border-b-2 border-primary font-medium text-primary" : "text-muted-foreground"}`} onClick={() => setTab(id)}>{id}</button>
        ))}
      </div>
      {tab === "profile" && (
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-display text-xl text-primary">Profile Information</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Field label="Full Name" value={form.name} onChange={(v) => set("name", v)} />
            <Field label="Email" value={form.email} onChange={(v) => set("email", v)} />
            <Field label="Phone Number" value={form.phone} onChange={(v) => set("phone", v)} />
            <Field label="Specialty" value={form.specialty} onChange={(v) => set("specialty", v)} />
            <Field label="License Number" value={form.licenseNumber} onChange={(v) => set("licenseNumber", v)} />
            <Field label="Hospital/Clinic" value={form.hospital} onChange={(v) => set("hospital", v)} />
            <div className="md:col-span-2"><Label htmlFor="ad">Address</Label><Textarea id="ad" className="mt-1" value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
          </div>
          <Button className="mt-4" onClick={save}>Save Changes</Button>
        </div>
      )}
      {tab === "security" && (
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-display text-xl text-primary">Security Settings</h2>
          <h3 className="mt-4 font-medium">Change Password</h3>
          <div className="mt-3 grid max-w-md gap-3">
            <Field label="Current Password" value={current} onChange={setCurrent} password />
            <Field label="New Password" value={next} onChange={setNext} password />
            <Field label="Confirm New Password" value={confirm} onChange={setConfirm} password />
            <Button onClick={updatePassword}>Update Password</Button>
          </div>
          <div className="mt-8 flex items-center justify-between border-t pt-4">
            <div><h3 className="font-medium">Two-Factor Authentication</h3><p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.twoFactor} onChange={(e) => set("twoFactor", e.target.checked)} /> {form.twoFactor ? "On" : "Off"}</label>
          </div>
          <Button className="mt-4" variant="outline" onClick={save}>Save security choice</Button>
        </div>
      )}
      {tab === "preferences" && (
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-display text-xl text-primary">Preferences</h2>
          <label className="mt-4 flex items-center justify-between text-sm"><span>Email notifications</span><input type="checkbox" checked={form.notifications} onChange={(e) => set("notifications", e.target.checked)} /></label>
          <label className="mt-3 flex items-center justify-between text-sm"><span>Dark mode</span><input type="checkbox" checked={form.darkMode} onChange={(e) => set("darkMode", e.target.checked)} /></label>
          <Button className="mt-4" onClick={save}>Save Changes</Button>
        </div>
      )}
    </Restricted>
  );
}

function Field({ label, value, onChange, password }: { label: string; value: string; onChange: (v: string) => void; password?: boolean }) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return <div><Label htmlFor={id}>{label}</Label><Input id={id} type={password ? "password" : "text"} className="mt-1" value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}
