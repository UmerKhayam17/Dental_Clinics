import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SiteLayout, seo } from "@/components/site/SiteLayout";
import { readSession, SIGNUP_ROLES, signUp, type Session } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({
    ...seo("Create a desk login | Lumière Dental Studio", "Create a demonstration staff login stored in this browser.", "/signup"),
    meta: [
      { title: "Create a desk login | Lumière Dental Studio" },
      { name: "description", content: "Create a demonstration staff login stored in this browser." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Session["role"]>("Receptionist");
  const [error, setError] = useState("");

  useEffect(() => {
    if (readSession()) navigate({ to: "/dashboard" });
  }, [navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = signUp({ name, email, password, role });
    if (message) { setError(message); return; }
    navigate({ to: "/dashboard" });
  };

  return (
    <SiteLayout>
      <section className="mx-auto grid min-h-[70vh] max-w-lg place-items-center px-5 py-20">
        <div className="w-full rounded-2xl border bg-card p-8 shadow-soft md:p-10">
          <p className="text-xs uppercase tracking-[0.25em] text-gold">Practice platform</p>
          <h1 className="mt-3 font-serif text-4xl text-primary">Create a desk login</h1>
          <p className="mt-3 text-sm text-muted-foreground">The account is saved in this browser only. There is no email check and no server.</p>
          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            <div><Label htmlFor="sn">Name</Label><Input id="sn" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label htmlFor="se">Email</Label><Input id="se" type="email" autoComplete="username" className="mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div><Label htmlFor="sp">Password</Label><Input id="sp" type="password" autoComplete="new-password" className="mt-1.5" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            <div>
              <Label>Desk</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Session["role"])}>
                <SelectTrigger className="mt-1.5" aria-label="Desk role"><SelectValue /></SelectTrigger>
                <SelectContent>{SIGNUP_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">Create login and enter</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary">Already have a login</Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
