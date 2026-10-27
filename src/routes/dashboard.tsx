import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard, Users, CalendarClock, Stethoscope, IdCard, Settings, Menu, RotateCcw, LogOut,
  Hospital, ChevronDown, BarChart3, Wrench, Banknote, Calendar, FileText, NotebookPen, Pill, Inbox,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { readSession, signOut } from "@/lib/auth";
import { BRANCHES } from "@/lib/data";
import { resetHms } from "@/lib/hms";
import { resetDemo, setActor, useDemo } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Tilt } from "@/components/fx/Motion";

export type Role = "Owner" | "Branch Manager" | "Dentist" | "Receptionist" | "Accountant";
export const ROLES: Role[] = ["Owner", "Branch Manager", "Dentist", "Receptionist", "Accountant"];
const RoleCtx = createContext<Role>("Owner");
export const useRole = () => useContext(RoleCtx);

const BranchCtx = createContext<{ branch: string; setBranch: (b: string) => void }>({ branch: "all", setBranch: () => {} });
export const useBranchFilter = () => useContext(BranchCtx);

export function useFilteredDemo() {
  const [s, ready] = useDemo();
  const { branch } = useBranchFilter();
  const ok = (id?: string) => branch === "all" || !id || id === branch;
  const patients = s.patients.filter((p) => ok(p.branchId));
  const patientIds = new Set(patients.map((p) => p.id));
  return {
    ready, branch, raw: s, patients,
    appointments: s.appointments.filter((a) => ok(a.branchId) && !a.deleted),
    invoices: s.invoices.filter((i) => ok(i.branchId)),
    plans: s.plans.filter((t) => branch === "all" || patientIds.has(t.patientId)),
    leads: s.leads.filter((l) => ok(l.branchId)),
    inventory: s.inventory.filter((i) => ok(i.branchId)),
    expenses: s.expenses.filter((e) => ok(e.branchId)),
    messages: s.messages,
  };
}

type Desk = "admin" | "doctor" | "receptionist";
type MenuLink = {
  label: string;
  to: "/dashboard" | "/dashboard/departments" | "/dashboard/roster" | "/dashboard/opd" | "/dashboard/day-summary" | "/dashboard/appointments" | "/dashboard/patients" | "/dashboard/procedures" | "/dashboard/refunds" | "/dashboard/clinic-expenses" | "/dashboard/pos" | "/dashboard/clinical" | "/dashboard/account";
  search?: Record<string, string>;
};
type Menu = { name: string; icon: typeof LayoutDashboard; links: MenuLink[] };

const MENUS: Record<Desk, Menu[]> = {
  admin: [
    { name: "Dashboards", icon: LayoutDashboard, links: [{ label: "Admin Dashboard", to: "/dashboard" }] },
    { name: "Departments", icon: Users, links: [{ label: "All Departments", to: "/dashboard/departments" }] },
    { name: "Doctor Management", icon: Stethoscope, links: [{ label: "All Doctors", to: "/dashboard/roster", search: { tab: "doctors" } }] },
    { name: "Staff Management", icon: IdCard, links: [{ label: "All Staff", to: "/dashboard/roster", search: { tab: "staff" } }] },
    { name: "Patient Management", icon: Users, links: [{ label: "All Patients", to: "/dashboard/opd", search: { panel: "manage" } }] },
    { name: "Finance Management", icon: Banknote, links: [{ label: "OPD", to: "/dashboard/day-summary", search: { view: "opd" } }] },
  ],
  doctor: [
    { name: "Dashboard", icon: LayoutDashboard, links: [{ label: "Dashboard", to: "/dashboard" }] },
    { name: "My Appointments", icon: CalendarClock, links: [{ label: "My Appointments", to: "/dashboard/appointments" }] },
    { name: "Patient Records", icon: NotebookPen, links: [{ label: "Patient Records", to: "/dashboard/patients" }] },
    { name: "Prescriptions", icon: Pill, links: [{ label: "Prescriptions", to: "/dashboard/clinical", search: { panel: "prescriptions" } }] },
    { name: "Reports", icon: FileText, links: [{ label: "Reports", to: "/dashboard/clinical", search: { panel: "reports" } }] },
    { name: "Notes / Diagnosis", icon: NotebookPen, links: [{ label: "Notes / Diagnosis", to: "/dashboard/clinical", search: { panel: "notes" } }] },
    { name: "Settings", icon: Settings, links: [{ label: "Settings", to: "/dashboard/account" }] },
  ],
  receptionist: [
    { name: "Dashboards", icon: LayoutDashboard, links: [{ label: "Reception Dashboard", to: "/dashboard" }] },
    { name: "Appointments", icon: CalendarClock, links: [{ label: "Appointments", to: "/dashboard/appointments" }] },
    { name: "OPD", icon: Hospital, links: [
      { label: "New OPD", to: "/dashboard/opd", search: { panel: "new" } },
      { label: "Manage OPD", to: "/dashboard/opd", search: { panel: "manage" } },
    ]},
    { name: "Procedure", icon: Wrench, links: [
      { label: "Dentist", to: "/dashboard/procedures", search: { category: "Dental" } },
      { label: "Dermatologist", to: "/dashboard/procedures", search: { category: "Dermatology" } },
      { label: "Ophthalmologist", to: "/dashboard/procedures", search: { category: "Ophthalmology" } },
    ]},
    { name: "Refunds", icon: Banknote, links: [
      { label: "Refund OPD", to: "/dashboard/refunds", search: { panel: "new" } },
      { label: "All OPD Refunds", to: "/dashboard/refunds", search: { panel: "list" } },
    ]},
    { name: "Expenses", icon: Calendar, links: [{ label: "Expenses", to: "/dashboard/clinic-expenses" }] },
    { name: "Point of Sale", icon: BarChart3, links: [
      { label: "Sell", to: "/dashboard/pos", search: { panel: "sell" } },
      { label: "Inventory", to: "/dashboard/pos", search: { panel: "products" } },
      { label: "Bills", to: "/dashboard/pos", search: { panel: "bills" } },
      { label: "Summary", to: "/dashboard/pos", search: { panel: "summary" } },
    ]},
    { name: "Summary", icon: NotebookPen, links: [{ label: "Summary", to: "/dashboard/day-summary" }] },
  ],
};

export function deskFor(role: Role): Desk {
  if (role === "Dentist") return "doctor";
  if (role === "Receptionist") return "receptionist";
  return "admin";
}

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Clinic Dashboard | Lumière Practice Platform" },
      { name: "description", content: "Demonstration practice platform for appointments, charts, billing, and clinic operations." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Layout,
});

function Layout() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("Owner");
  const [authed, setAuthed] = useState(false);
  const [branch, setBranch] = useState("all");
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const path = useRouterState({ select: (r) => r.location.pathname });
  const locSearch = useRouterState({ select: (r) => r.location.search as Record<string, unknown> });

  useEffect(() => {
    const session = readSession();
    if (!session) {
      navigate({ to: "/login" });
      return;
    }
    const stored = localStorage.getItem("lumiere-role") as Role | null;
    setRole(stored && ROLES.includes(stored) ? stored : session.role);
    setAuthed(true);
  }, [navigate]);
  useEffect(() => { setActor(role); }, [role]);

  const changeRole = (r: Role) => { setRole(r); localStorage.setItem("lumiere-role", r); toast(`Viewing as ${r}`); };
  const desk = deskFor(role);
  const menus = MENUS[desk];
  const activeLink = (link: MenuLink) => {
    const onPath = link.to === "/dashboard" ? path === "/dashboard" || path === "/dashboard/" : path === link.to || path.startsWith(`${link.to}/`);
    if (!onPath) return false;
    if (!link.search) return true;
    return Object.entries(link.search).every(([key, value]) => String(locSearch?.[key] ?? "") === value);
  };

  if (!authed) {
    return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Opening the practice desk…</div>;
  }

  const navItem = "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground";
  const navActive = "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_3px_0_0_var(--gold)]";
  const side = (
    <aside className="flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground shadow-lg">
      <Link to="/" className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold font-serif text-lg text-gold">L</span>
        <span className="leading-tight">
          <span className="block font-serif text-lg text-sidebar-accent-foreground">Lumière</span>
          <span className="block text-[10px] uppercase tracking-[0.25em] text-sidebar-foreground/60">Practice desk</span>
        </span>
      </Link>
      <p className="px-5 pt-5 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/45">{desk === "doctor" ? "Clinical" : desk === "receptionist" ? "Front desk" : "Administration"}</p>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const openMenu = !!expanded[menu.name];
          if (menu.links.length === 1) {
            const link = menu.links[0];
            return (
              <Link key={menu.name} to={link.to} search={link.search as never} activeOptions={{ exact: true, includeSearch: true }} onClick={() => setOpen(false)}
                className={cn(navItem, activeLink(link) ? navActive : "text-sidebar-foreground/80")}>
                <Icon className={cn("mr-3 h-4 w-4 shrink-0", activeLink(link) && "text-gold")} />
                {menu.name}
              </Link>
            );
          }
          const childActive = menu.links.some(activeLink);
          const show = openMenu || childActive;
          return (
            <div key={menu.name}>
              <button type="button" aria-expanded={show} onClick={() => setExpanded((e) => ({ ...e, [menu.name]: !show }))}
                className={cn(navItem, "w-full justify-between text-left", childActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/80")}>
                <span className="flex items-center"><Icon className={cn("mr-3 h-4 w-4 shrink-0", childActive && "text-gold")} />{menu.name}</span>
                <ChevronDown className={cn("h-4 w-4 opacity-60 transition-transform", show && "rotate-180")} />
              </button>
              {show && (
                <div className="my-1 ml-[1.35rem] space-y-0.5 border-l border-sidebar-border pl-3">
                  {menu.links.map((link) => (
                    <Link key={link.label} to={link.to} search={link.search as never} activeOptions={{ exact: true, includeSearch: true }} onClick={() => setOpen(false)}
                      className={cn("block rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground", activeLink(link) ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : "text-sidebar-foreground/70")}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 px-3 py-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold text-xs font-semibold text-gold-foreground">{role.split(" ").map((w) => w[0]).join("")}</span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-medium text-sidebar-accent-foreground">{role}</span>
            <span className="block truncate text-xs text-sidebar-foreground/60">{branch === "all" ? "All studios" : BRANCHES.find((b) => b.id === branch)?.city}</span>
          </span>
        </div>
        <p className="px-2 pt-3 text-[10px] leading-relaxed text-sidebar-foreground/55">
          Clinic management system demo by{" "}
          <a
            href="https://nextsoftwaredevelopment.com/"
            target="_blank"
            rel="noreferrer"
            className="text-sidebar-foreground/80 underline underline-offset-2 hover:text-gold"
          >
            Next Software Development Company
          </a>
        </p>
      </div>
    </aside>
  );

  return (
    <RoleCtx.Provider value={role}>
      <BranchCtx.Provider value={{ branch, setBranch }}>
        <div className="flex min-h-screen bg-background">
          <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-card focus:px-3 focus:py-2">Skip to content</a>
          <div className="sticky top-0 hidden h-screen lg:block">{side}</div>
          {open && <div className="fixed inset-0 z-50 flex lg:hidden"><div className="h-full">{side}</div><button aria-label="Close menu" className="flex-1 bg-foreground/40" onClick={() => setOpen(false)} /></div>}
          <div className="min-w-0 flex-1">
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/85 px-4 backdrop-blur-md md:px-6">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></Button>
                <button onClick={() => { resetDemo(); resetHms(); toast.success("Demonstration data restored"); }} className="hidden items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:inline-flex"><RotateCcw className="h-3.5 w-3.5" />Restore demo data</button>
              </div>
              <div className="flex items-center gap-2">
                <Select value={branch} onValueChange={setBranch}>
                  <SelectTrigger className="w-36 bg-card" aria-label="Branch"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All studios</SelectItem>
                    {BRANCHES.map((b) => <SelectItem key={b.id} value={b.id}>{b.city}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={role} onValueChange={(v) => changeRole(v as Role)}>
                  <SelectTrigger className="w-40 bg-card" aria-label="Demonstration role"><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
                <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate({ to: "/login" }); }}><LogOut className="h-4 w-4" />Log out</Button>
              </div>
            </header>
            <main id="content" className="mx-auto max-w-[1600px] p-4 md:p-8"><Outlet /></main>
          </div>
        </div>
      </BranchCtx.Provider>
    </RoleCtx.Provider>
  );
}

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{title}</h1>
        {sub && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, hint, icon: Icon }: { label: string; value: string | number; hint?: string; icon?: LucideIcon }) {
  return (
    <Tilt className="rounded-xl" max={4}>
    <div className="group relative h-full overflow-hidden rounded-xl border bg-card p-5 transition-shadow hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
        {Icon && <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary"><Icon className="h-4 w-4" /></span>}
      </div>
      <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-primary">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />
    </div>
    </Tilt>
  );
}

export function Panel({ title, sub, action, className, children }: { title: string; sub?: string; action?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <section className={cn("rounded-xl border bg-card p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-semibold">{title}</h2>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed bg-card px-6 py-14 text-center">
      <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-secondary text-primary"><Inbox className="h-5 w-5" /></span>
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

export function Restricted({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const role = useRole();
  if (allow.includes(role)) return children;
  return <Empty title="This section is not on this role’s desk" body={`${role} accounts do not open this part of the platform. Switch the demonstration role in the header to continue.`} />;
}

export const statusTone: Record<string, string> = {
  Requested: "bg-warning/15 text-foreground",
  Confirmed: "bg-primary/10 text-primary",
  "Checked In": "bg-gold/30 text-foreground",
  "In Progress": "bg-secondary text-primary",
  Completed: "bg-success/15 text-success",
  Cancelled: "bg-muted text-muted-foreground",
  "No Show": "bg-destructive/15 text-destructive",
  Proposed: "bg-warning/15 text-foreground",
  Accepted: "bg-primary/10 text-primary",
  New: "bg-warning/15 text-foreground",
  Contacted: "bg-secondary text-primary",
  Booked: "bg-success/15 text-success",
  Lost: "bg-muted text-muted-foreground",
};
