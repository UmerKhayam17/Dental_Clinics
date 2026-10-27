export type Session = {
  email: string;
  name: string;
  role: "Owner" | "Branch Manager" | "Dentist" | "Receptionist" | "Accountant";
};

export type Account = {
  email: string;
  password: string;
  name: string;
  role: Session["role"];
};

export type StaffProfile = {
  phone: string;
  address: string;
  cnic: string;
};

const SESSION_KEY = "lumiere-session";
const USERS_KEY = "lumiere-users";
const PROFILE_KEY = "lumiere-profiles";

export const ADMIN_LOGIN: Account = {
  email: "admin@lumiere-dental.demo",
  password: "LumiereAdmin",
  name: "Studio Admin",
  role: "Owner",
};

export const DEMO_ACCOUNTS: Account[] = [
  ADMIN_LOGIN,
  { email: "reception@lumiere-dental.demo", password: "ReceptionDesk", name: "Amira Shah", role: "Receptionist" },
  { email: "dentist@lumiere-dental.demo", password: "DentistDesk", name: "Dr. Melissa Carter", role: "Dentist" },
  { email: "accounts@lumiere-dental.demo", password: "AccountsDesk", name: "Priya Nair", role: "Accountant" },
];

export const SIGNUP_ROLES: Session["role"][] = ["Branch Manager", "Dentist", "Receptionist", "Accountant"];

function readUsers(): Account[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as Account[];
    return Array.isArray(raw) ? raw.filter((a) => a?.email && a.password && a.role) : [];
  } catch {
    return [];
  }
}

export function allAccounts(): Account[] {
  const extra = readUsers().filter((a) => !DEMO_ACCOUNTS.some((d) => d.email === a.email));
  return [...DEMO_ACCOUNTS, ...extra];
}

export function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    if (!session?.email || !session.role) return null;
    return session;
  } catch {
    return null;
  }
}

function writeSession(account: Account) {
  const session: Session = { email: account.email, name: account.name, role: account.role };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem("lumiere-role", session.role);
}

export function signIn(email: string, password: string): string | null {
  const found = allAccounts().find((a) => a.email === email.trim().toLowerCase() && a.password === password);
  if (!found) return "Email or password is incorrect.";
  writeSession(found);
  return null;
}

export function signUp(input: Account): string | null {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (name.length < 2) return "Enter the person’s name.";
  if (!email.includes("@") || email.startsWith("@")) return "Enter a valid email.";
  if (input.password.length < 8) return "Use a password of at least 8 characters.";
  if (!SIGNUP_ROLES.includes(input.role)) return "Choose a desk role.";
  if (allAccounts().some((a) => a.email === email)) return "That email already has a desk login.";
  const account: Account = { email, password: input.password, name, role: input.role };
  localStorage.setItem(USERS_KEY, JSON.stringify([...readUsers(), account]));
  writeSession(account);
  return null;
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
}

export function readProfile(email: string): StaffProfile {
  if (typeof window === "undefined") return { phone: "", address: "", cnic: "" };
  try {
    const all = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}") as Record<string, StaffProfile>;
    const saved = all[email];
    return { phone: saved?.phone ?? "", address: saved?.address ?? "", cnic: saved?.cnic ?? "" };
  } catch {
    return { phone: "", address: "", cnic: "" };
  }
}

export function saveProfile(email: string, profile: StaffProfile, name: string) {
  let all: Record<string, StaffProfile> = {};
  try { all = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}") as Record<string, StaffProfile>; } catch { all = {}; }
  all[email] = profile;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(all));
  const session = readSession();
  if (session?.email === email) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, name }));
    const users = readUsers();
    if (users.some((u) => u.email === email)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(users.map((u) => u.email === email ? { ...u, name } : u)));
    }
  }
}
