import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteLayout, seo } from "@/components/site/SiteLayout";
import { DEMO_ACCOUNTS, readSession, signIn } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    ...seo("Staff login | Lumière Dental Studio", "Sign in to the Lumière practice platform.", "/login"),
    meta: [
      { title: "Staff login | Lumière Dental Studio" },
      { name: "description", content: "Sign in to the Lumière practice platform." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (readSession()) navigate({ to: "/dashboard" });
  }, [navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = signIn(email, password);
    if (message) {
      setError(message);
      return;
    }
    navigate({ to: "/dashboard" });
  };

  return (
    <SiteLayout>
      <section className="mx-auto grid min-h-[70vh] max-w-lg place-items-center px-5 py-20">
        <div className="w-full rounded-2xl border bg-card p-8 shadow-soft md:p-10">
          <p className="text-xs uppercase tracking-[0.25em] text-gold">Practice platform</p>
          <h1 className="mt-3 font-serif text-4xl text-primary">Staff login</h1>
          <p className="mt-3 text-sm text-muted-foreground">This opens the clinic desk. Patient records in the demonstration are synthetic.</p>
          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="username" className="mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" className="mt-1.5" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">Enter the practice desk</Button>
          </form>
          <div className="mt-8 space-y-3 rounded-xl bg-secondary p-4 text-sm">
            <p className="font-medium text-primary">Demonstration desks</p>
            {DEMO_ACCOUNTS.map((account) => (
              <div key={account.email} className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-muted-foreground"><span className="text-foreground">{account.role}</span> · {account.email} · {account.password}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => { setEmail(account.email); setPassword(account.password); setError(""); }}>Use</Button>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/signup" className="text-primary">Create a desk login</Link>
            <span className="mx-2">·</span>
            <Link to="/" className="text-primary">Back to the studio</Link>
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
