import { useEffect, useState } from "react";

export type AppointmentStatus =
  | "Requested" | "Confirmed" | "Checked In" | "In Progress" | "Completed" | "Cancelled" | "No Show";
export const STATUSES: AppointmentStatus[] = ["Requested", "Confirmed", "Checked In", "In Progress", "Completed", "Cancelled", "No Show"];

export type ToothCondition = "Healthy" | "Caries" | "Filling" | "Crown" | "Root Canal" | "Implant" | "Missing" | "Extraction Planned";
export const CONDITIONS: ToothCondition[] = ["Healthy", "Caries", "Filling", "Crown", "Root Canal", "Implant", "Missing", "Extraction Planned"];

export type ToothRecord = { condition: ToothCondition; surfaces: string[]; note?: string };
export type PlanStatus = "Proposed" | "Accepted" | "Completed";
export type PlanItem = { tooth?: number; procedure: string; cost: number; status: PlanStatus };
export type TreatmentPlan = {
  id: string; patientId: string; created: string; items: PlanItem[];
  history: { at: string; action: string }[];
};
export type Invoice = {
  id: string; patientId: string; date: string; branchId: string;
  items: { label: string; amount: number }[];
  discount: number; payments: { date: string; amount: number; method: string }[];
};
export type LeadStatus = "New" | "Contacted" | "Booked" | "Lost";
export type Lead = {
  id: string; name: string; phone: string; email: string; source: string;
  treatment: string; status: LeadStatus; created: string; branchId: string; note?: string;
};
export type Message = {
  id: string; patientId: string; channel: "Email" | "SMS" | "WhatsApp";
  template: string; body: string; status: "Simulated"; date: string;
};
export type StockItem = {
  id: string; name: string; sku: string; qty: number; min: number;
  supplier: string; expiry: string; unitCost: number; branchId: string;
};
export type Expense = { id: string; date: string; category: string; amount: number; branchId: string; note: string };
export type AttendanceMark = { staffId: string; date: string; status: "Present" | "Leave" };
export type AuditEvent = { id: string; at: string; actor: string; action: string };
export type Template = { id: string; name: string; body: string };
export type Settings = {
  taxRate: number;
  reminderHours: number;
  digitalLabel: string;
  integrations: { whatsapp: boolean; sms: boolean; analytics: boolean };
};

export type Patient = {
  id: string; name: string; dob: string; phone: string; email: string;
  gender: string; address: string; emergency: string; history: string;
  allergies: string; medicalAlerts: string; preferredDentist: string;
  registered: string; source: string; branchId: string; consent: boolean;
  comms: { email: boolean; sms: boolean; whatsapp: boolean };
  chart: Record<number, ToothRecord>;
  notes: { date: string; text: string; author: string }[];
  prescriptions: { id: string; drug: string; dose: string; date: string }[];
  documents: { id: string; name: string; kind: string; date: string }[];
};

export type Appointment = {
  id: string; patientId: string; dentistId: string; treatment: string;
  date: string; time: string; status: AppointmentStatus; notes?: string;
  source: "Website" | "Phone" | "Walk-in" | "Referral";
  branchId: string; rescheduleRequested?: boolean; deleted?: boolean;
};

export type State = {
  patients: Patient[];
  appointments: Appointment[];
  plans: TreatmentPlan[];
  invoices: Invoice[];
  leads: Lead[];
  messages: Message[];
  inventory: StockItem[];
  expenses: Expense[];
  attendance: AttendanceMark[];
  audit: AuditEvent[];
  templates: Template[];
  settings: Settings;
};

const KEY = "lumiere-demo-v2";
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
export const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

let actor = "Demo user";
export function setActor(name: string) { actor = name; }

const tooth = (condition: ToothCondition, surfaces: string[] = [], note?: string): ToothRecord => ({ condition, surfaces, note });

function seed(): State {
  const patients: Patient[] = [
    ["Olivia Bennett", "1984-04-12", "Penicillin", "", "d1", "Website", "bayview", -140],
    ["Noah Patel", "1991-11-02", "None reported", "", "d2", "Referral", "bayview", -90],
    ["Ava Thompson", "1978-06-19", "None reported", "Asthma — inhaler in bag", "d1", "Google", "bayview", -45],
    ["Liam Rodriguez", "2008-01-23", "None reported", "", "d3", "Website", "riverside", -30],
    ["Mia Chen", "1995-09-08", "Latex", "", "d2", "Instagram", "bayview", -12],
    ["Ethan Walker", "1988-02-14", "None reported", "", "d1", "Walk-in", "bayview", -8],
    ["Isla Murphy", "2016-07-30", "None reported", "", "d3", "Website", "riverside", -4],
    ["Lucas Ahmed", "1972-12-01", "Ibuprofen", "Hypertension, medication listed with GP", "d2", "Referral", "bayview", -2],
  ].map((row, i) => {
    const [name, dob, allergies, medicalAlerts, preferredDentist, source, branchId, offset] = row as [string, string, string, string, string, string, string, number];
    return {
      id: `P-10${i + 1}`, name, dob, phone: `+1 (555) 210-0${10 + i}`,
      email: `${name.split(" ")[0].toLowerCase()}@example.demo`,
      gender: i % 2 ? "Male" : "Female", address: `${12 + i} Example Street`,
      emergency: `Next of kin · +1 (555) 210-09${i}`, history: medicalAlerts || "No significant history recorded",
      allergies, medicalAlerts, preferredDentist, registered: addDays(offset), source, branchId, consent: true,
      comms: { email: true, sms: i % 2 === 0, whatsapp: true },
      chart: (i === 0
        ? { 16: tooth("Filling", ["O"], "Occlusal composite, stable"), 26: tooth("Crown", ["O"]), 36: tooth("Caries", ["O"], "Occlusal caries, asymptomatic"), 46: tooth("Root Canal") }
        : i === 1 ? { 11: tooth("Filling", ["M"]), 47: tooth("Missing") } : {}) as Record<number, ToothRecord>,
      notes: i === 0 ? [{ date: addDays(-60), text: "Routine exam. Advised review of 36 occlusal caries before it reaches the dentine.", author: "Dr. Melissa Carter" }] : [],
      prescriptions: i === 1 ? [{ id: "RX-1", drug: "Ibuprofen", dose: "400 mg as needed with food, if tolerated and not contraindicated", date: addDays(-20) }] : [],
      documents: i === 0 ? [{ id: "DOC-1", name: "Bitewing series (demo metadata)", kind: "Radiograph", date: addDays(-60) }] : [],
    };
  });

  const appointments: Appointment[] = [
    { id: "A-2001", patientId: "P-101", dentistId: "d1", treatment: "General Dentistry", date: today(), time: "09:00", status: "Checked In", source: "Website", branchId: "bayview" },
    { id: "A-2002", patientId: "P-102", dentistId: "d2", treatment: "Root Canal Treatment", date: today(), time: "09:45", status: "Confirmed", source: "Phone", branchId: "bayview" },
    { id: "A-2003", patientId: "P-103", dentistId: "d1", treatment: "Teeth Whitening", date: today(), time: "11:15", status: "Requested", source: "Website", branchId: "bayview" },
    { id: "A-2004", patientId: "P-104", dentistId: "d3", treatment: "Orthodontics", date: today(), time: "13:00", status: "Confirmed", source: "Referral", branchId: "riverside" },
    { id: "A-2005", patientId: "P-105", dentistId: "d2", treatment: "Teeth Cleaning", date: today(), time: "14:30", status: "Completed", source: "Walk-in", branchId: "bayview" },
    { id: "A-2006", patientId: "P-106", dentistId: "d1", treatment: "Dental Implants", date: addDays(1), time: "10:30", status: "Confirmed", source: "Website", branchId: "bayview" },
    { id: "A-2007", patientId: "P-107", dentistId: "d3", treatment: "Pediatric Dentistry", date: addDays(2), time: "09:45", status: "Requested", source: "Website", branchId: "riverside", rescheduleRequested: true },
    { id: "A-2008", patientId: "P-108", dentistId: "d2", treatment: "Emergency Dental Care", date: addDays(-1), time: "16:00", status: "No Show", source: "Phone", branchId: "bayview" },
    { id: "A-2009", patientId: "P-101", dentistId: "d1", treatment: "Dental Crowns & Bridges", date: addDays(-40), time: "10:30", status: "Completed", source: "Referral", branchId: "bayview" },
    { id: "A-2010", patientId: "P-105", dentistId: "d1", treatment: "Cosmetic Dentistry", date: addDays(3), time: "15:15", status: "Confirmed", source: "Website", branchId: "bayview" },
    { id: "A-2011", patientId: "P-102", dentistId: "d2", treatment: "Root Canal Treatment", date: addDays(-15), time: "11:15", status: "Completed", source: "Phone", branchId: "bayview" },
    { id: "A-2012", patientId: "P-103", dentistId: "d1", treatment: "Teeth Cleaning", date: addDays(-3), time: "13:45", status: "Cancelled", source: "Phone", branchId: "bayview", notes: "Patient asked to drop this visit.", deleted: true },
  ];

  const invoices: Invoice[] = [
    { id: "INV-3001", patientId: "P-101", branchId: "bayview", date: addDays(-130), items: [{ label: "Crown — 26", amount: 1100 }], discount: 0, payments: [{ date: addDays(-130), amount: 1100, method: "Card" }] },
    { id: "INV-3002", patientId: "P-102", branchId: "bayview", date: addDays(-70), items: [{ label: "Filling — 11", amount: 180 }, { label: "Exam", amount: 90 }], discount: 0, payments: [{ date: addDays(-70), amount: 100, method: "Cash" }] },
    { id: "INV-3003", patientId: "P-105", branchId: "bayview", date: addDays(-5), items: [{ label: "Teeth Whitening", amount: 350 }], discount: 0, payments: [] },
    { id: "INV-3004", patientId: "P-104", branchId: "riverside", date: addDays(-20), items: [{ label: "Orthodontic consultation", amount: 150 }], discount: 0, payments: [{ date: addDays(-20), amount: 150, method: "Bank transfer" }] },
    { id: "INV-3005", patientId: "P-106", branchId: "bayview", date: addDays(-100), items: [{ label: "Implant consultation", amount: 180 }], discount: 0, payments: [{ date: addDays(-100), amount: 180, method: "Card" }] },
  ];

  const plans: TreatmentPlan[] = [
    { id: "TP-1", patientId: "P-101", created: addDays(-60), items: [{ tooth: 36, procedure: "Composite filling", cost: 180, status: "Proposed" }], history: [{ at: addDays(-60), action: "Plan created" }] },
    { id: "TP-2", patientId: "P-102", created: addDays(-18), items: [{ tooth: 46, procedure: "Root canal treatment", cost: 780, status: "Accepted" }], history: [{ at: addDays(-18), action: "Plan created" }, { at: addDays(-16), action: "Item 1 marked Accepted" }] },
    { id: "TP-3", patientId: "P-105", created: addDays(-6), items: [{ procedure: "Whitening", cost: 350, status: "Proposed" }], history: [{ at: addDays(-6), action: "Plan created" }] },
  ];

  const leads: Lead[] = [
    { id: "LD-1", name: "Hannah Cole", phone: "+1 (555) 019-4410", email: "hannah@example.demo", source: "Website", treatment: "Dental Implants", status: "New", created: addDays(-1), branchId: "bayview", note: "Asked about timing for a single molar." },
    { id: "LD-2", name: "Omar Farouk", phone: "+1 (555) 019-4418", email: "omar@example.demo", source: "Google", treatment: "Teeth Whitening", status: "Contacted", created: addDays(-4), branchId: "bayview" },
    { id: "LD-3", name: "Isla Murphy", phone: "+1 (555) 210-016", email: "isla@example.demo", source: "Website", treatment: "Pediatric Dentistry", status: "Booked", created: addDays(-4), branchId: "riverside" },
    { id: "LD-4", name: "Grace Kim", phone: "+1 (555) 019-4422", email: "grace@example.demo", source: "Instagram", treatment: "Orthodontics", status: "Lost", created: addDays(-21), branchId: "riverside", note: "Chose another practice." },
  ];

  const messages: Message[] = [
    { id: "M-1", patientId: "P-101", channel: "Email", template: "Appointment confirmation", body: "Your appointment is confirmed. This message was simulated and was not sent.", status: "Simulated", date: addDays(-1) },
    { id: "M-2", patientId: "P-105", channel: "WhatsApp", template: "Payment reminder", body: "Invoice INV-3003 has a balance. Simulated reminder — nothing was delivered.", status: "Simulated", date: addDays(-2) },
  ];

  const inventory: StockItem[] = [
    { id: "ST-1", name: "Composite resin A2", sku: "RES-A2", qty: 14, min: 6, supplier: "Northline Dental", expiry: addDays(400), unitCost: 42, branchId: "bayview" },
    { id: "ST-2", name: "Nitrile gloves, M", sku: "GLV-M", qty: 8, min: 20, supplier: "Harbour Medical", expiry: addDays(700), unitCost: 9, branchId: "bayview" },
    { id: "ST-3", name: "Local anaesthetic cartridges", sku: "AN-2", qty: 40, min: 24, supplier: "Northline Dental", expiry: addDays(180), unitCost: 1.4, branchId: "bayview" },
    { id: "ST-4", name: "Alginate impression material", sku: "IMP-1", qty: 3, min: 4, supplier: "Quay Supplies", expiry: addDays(90), unitCost: 18, branchId: "riverside" },
    { id: "ST-5", name: "Whitening gel, clinic", sku: "WH-16", qty: 11, min: 4, supplier: "Northline Dental", expiry: addDays(240), unitCost: 28, branchId: "bayview" },
    { id: "ST-6", name: "Sterilisation pouches", sku: "STE-90", qty: 120, min: 40, supplier: "Harbour Medical", expiry: addDays(900), unitCost: 0.2, branchId: "bayview" },
    { id: "ST-7", name: "Implant healing caps", sku: "IM-HC", qty: 6, min: 4, supplier: "Atlas Implants", expiry: addDays(1200), unitCost: 35, branchId: "bayview" },
    { id: "ST-8", name: "Child prophy paste", sku: "PED-P", qty: 9, min: 3, supplier: "Quay Supplies", expiry: addDays(300), unitCost: 7, branchId: "riverside" },
  ];

  const expenses: Expense[] = [
    { id: "EX-1", date: addDays(-12), category: "Laboratory", amount: 640, branchId: "bayview", note: "Crown — Olivia Bennett" },
    { id: "EX-2", date: addDays(-26), category: "Rent", amount: 4200, branchId: "bayview", note: "Studio rent" },
    { id: "EX-3", date: addDays(-26), category: "Rent", amount: 2100, branchId: "riverside", note: "Studio rent" },
    { id: "EX-4", date: addDays(-8), category: "Supplies", amount: 380, branchId: "bayview", note: "Gloves and pouches" },
  ];

  const templates: Template[] = [
    { id: "tpl-confirm", name: "Appointment confirmation", body: "Your visit on {date} at {time} is confirmed. Reply if you need a different time. This is a demonstration template." },
    { id: "tpl-remind", name: "Appointment reminder", body: "This is a reminder for your visit on {date} at {time}. Please arrive a few minutes early." },
    { id: "tpl-plan", name: "Treatment plan follow-up", body: "Your proposed treatment is still open. We can talk it through whenever you are ready." },
    { id: "tpl-balance", name: "Payment reminder", body: "There is a balance on your latest invoice. Ask reception if you would like to split the payment." },
  ];

  return {
    patients, appointments, plans, invoices, leads, messages, inventory, expenses,
    attendance: [], audit: [{ id: "AU-0", at: new Date().toISOString(), actor: "System", action: "Demonstration records loaded" }],
    templates,
    settings: { taxRate: 0, reminderHours: 24, digitalLabel: "Digital wallet", integrations: { whatsapp: false, sms: false, analytics: false } },
  };
}

let state: State | null = null;
const listeners = new Set<() => void>();

function normalizePatient(p: Patient): Patient {
  const chart: Patient["chart"] = {};
  for (const [k, v] of Object.entries(p.chart ?? {})) {
    if (typeof v === "string") chart[Number(k)] = { condition: v as ToothCondition, surfaces: [] };
    else {
      const rec = v as ToothRecord;
      chart[Number(k)] = { condition: rec.condition, surfaces: rec.surfaces ?? [], note: rec.note };
    }
  }
  return {
    ...p,
    gender: p.gender ?? "",
    address: p.address ?? "",
    emergency: p.emergency ?? "",
    history: p.history ?? "",
    consent: p.consent ?? true,
    branchId: p.branchId ?? "bayview",
    chart,
    comms: { email: p.comms?.email ?? true, sms: p.comms?.sms ?? false, whatsapp: p.comms?.whatsapp ?? true },
    documents: p.documents ?? [],
    prescriptions: p.prescriptions ?? [],
    notes: p.notes ?? [],
  };
}

function hydrate(raw: Partial<State> | null): State {
  const base = seed();
  if (!raw?.patients?.length) return base;
  return {
    ...base,
    ...raw,
    patients: raw.patients.map((p) => normalizePatient(p)),
    appointments: raw.appointments ?? [],
    plans: (raw.plans ?? []).map((p) => ({ ...p, history: p.history ?? [] })),
    invoices: raw.invoices ?? [],
    leads: raw.leads ?? base.leads,
    messages: raw.messages ?? [],
    inventory: raw.inventory ?? base.inventory,
    expenses: raw.expenses ?? base.expenses,
    attendance: raw.attendance ?? [],
    audit: raw.audit ?? base.audit,
    templates: raw.templates?.length ? raw.templates : base.templates,
    settings: { ...base.settings, ...raw.settings, integrations: { ...base.settings.integrations, ...raw.settings?.integrations } },
  };
}

function load(): State {
  if (state) return state;
  try {
    const raw = localStorage.getItem(KEY);
    state = raw ? hydrate(JSON.parse(raw) as Partial<State>) : seed();
  } catch {
    state = seed();
  }
  return state;
}

function withAudit(s: State, action: string): State {
  return { ...s, audit: [{ id: uid("AU"), at: new Date().toISOString(), actor, action }, ...s.audit].slice(0, 80) };
}

export function update(fn: (s: State) => State) {
  state = fn(load());
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore quota */ }
  listeners.forEach((l) => l());
}

export function getState() { return load(); }

export function resetDemo() {
  state = seed();
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

const EMPTY: State = {
  patients: [], appointments: [], plans: [], invoices: [], leads: [], messages: [],
  inventory: [], expenses: [], attendance: [], audit: [], templates: [],
  settings: { taxRate: 0, reminderHours: 24, digitalLabel: "Digital wallet", integrations: { whatsapp: false, sms: false, analytics: false } },
};

export function useDemo(): [State, boolean] {
  const [s, setS] = useState<State>(EMPTY);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setS(load());
    setReady(true);
    const l = () => setS(load());
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return [s, ready];
}

export function invoiceNet(inv: Invoice) {
  return inv.items.reduce((a, b) => a + b.amount, 0) - inv.discount;
}
export function invoiceTotal(inv: Invoice) {
  const rate = (state?.settings.taxRate ?? 0) / 100;
  return Math.round(invoiceNet(inv) * (100 + rate * 100)) / 100;
}
export const invoicePaid = (inv: Invoice) => inv.payments.reduce((a, b) => a + b.amount, 0);
export const invoiceBalance = (inv: Invoice) => Math.round((invoiceTotal(inv) - invoicePaid(inv)) * 100) / 100;

export function paymentMethods() {
  const label = load().settings.digitalLabel || "Digital wallet";
  return ["Cash", "Bank transfer", "Card", label];
}

export function slotTaken(s: State, dentistId: string, date: string, time: string, ignoreId?: string) {
  return s.appointments.some((a) => a.id !== ignoreId && !a.deleted && a.dentistId === dentistId && a.date === date && a.time === time && a.status !== "Cancelled");
}

export function bookedSlots(s: State, dentistId: string, date: string) {
  return new Set(s.appointments.filter((a) => !a.deleted && a.dentistId === dentistId && a.date === date && a.status !== "Cancelled").map((a) => a.time));
}

export function setAppointmentDeleted(id: string, deleted: boolean) {
  update((s) => withAudit({
    ...s,
    appointments: s.appointments.map((a) => a.id === id ? { ...a, deleted } : a),
  }, deleted ? `Appointment ${id} removed from the day list` : `Appointment ${id} restored`));
}

export function bookAppointment(input: {
  name: string; email: string; phone: string; treatment: string; dentistId: string;
  date: string; time: string; notes?: string; branchId?: string; source?: Appointment["source"];
}): string | null {
  let id: string | null = null;
  update((s) => {
    if (slotTaken(s, input.dentistId, input.date, input.time)) return s;
    id = uid("A");
    const source = input.source ?? "Website";
    const branchId = input.branchId ?? "bayview";
    let patient = s.patients.find((p) => p.email.toLowerCase() === input.email.toLowerCase());
    const patients = [...s.patients];
    if (!patient) {
      patient = normalizePatient({
        id: uid("P"), name: input.name, dob: "", phone: input.phone, email: input.email,
        gender: "", address: "", emergency: "", history: "", allergies: "", medicalAlerts: "",
        preferredDentist: input.dentistId, registered: today(), source: source === "Website" ? "Website" : source,
        branchId, consent: true, comms: { email: true, sms: false, whatsapp: true },
        chart: {}, notes: [], prescriptions: [], documents: [],
      });
      patients.push(patient);
    }
    const leadNote = source === "Website" ? "Booked from the public website." : undefined;
    const leads = source === "Website"
      ? [{ id: uid("LD"), name: input.name, phone: input.phone, email: input.email, source: "Website", treatment: input.treatment, status: "Booked" as const, created: today(), branchId, note: leadNote }, ...s.leads.filter((l) => l.email.toLowerCase() !== input.email.toLowerCase() || l.status === "Lost")]
      : s.leads;
    const messages: Message[] = [{
      id: uid("M"), patientId: patient.id, channel: "Email", template: source === "Walk-in" ? "Walk-in" : "Request received",
      body: source === "Walk-in"
        ? `Walk-in recorded for ${input.date} at ${input.time}. Simulated — no message was sent.`
        : `We received your request for ${input.date} at ${input.time}. Reception will confirm it. Simulated — no email was sent.`,
      status: "Simulated", date: today(),
    }, ...s.messages];
    return withAudit({
      ...s, patients, leads, messages,
      appointments: [...s.appointments, {
        id: id!, patientId: patient.id, dentistId: input.dentistId, treatment: input.treatment,
        date: input.date, time: input.time, status: source === "Walk-in" ? "Checked In" : "Requested",
        notes: input.notes, source, branchId,
      }],
    }, `${source} appointment ${id} for ${input.name}`);
  });
  return id;
}

export function captureInquiry(input: { name: string; email: string; message: string; phone?: string; treatment?: string }) {
  update((s) => withAudit({
    ...s,
    leads: [{
      id: uid("LD"), name: input.name, phone: input.phone ?? "", email: input.email,
      source: "Website", treatment: input.treatment ?? "General enquiry", status: "New",
      created: today(), branchId: "bayview", note: input.message,
    }, ...s.leads],
  }, `Website enquiry from ${input.name}`));
}

export function setLeadStatus(id: string, status: LeadStatus) {
  update((s) => withAudit({ ...s, leads: s.leads.map((l) => l.id === id ? { ...l, status } : l) }, `Lead ${id} marked ${status}`));
}

export function setAppointmentStatus(id: string, status: AppointmentStatus) {
  update((s) => {
    const a = s.appointments.find((x) => x.id === id);
    if (!a) return s;
    let messages = s.messages;
    if (status === "Confirmed") {
      messages = [{
        id: uid("M"), patientId: a.patientId, channel: "Email", template: "Appointment confirmation",
        body: `Your appointment on ${a.date} at ${a.time} is confirmed. Simulated — this was not sent to a real inbox.`,
        status: "Simulated", date: today(),
      }, ...messages];
    }
    return withAudit({
      ...s, messages,
      appointments: s.appointments.map((x) => x.id === id ? { ...x, status } : x),
    }, `Appointment ${id} marked ${status}`);
  });
}

export function rescheduleAppointment(id: string, date: string, time: string): string | null {
  let error: string | null = null;
  update((s) => {
    const a = s.appointments.find((x) => x.id === id);
    if (!a) { error = "Appointment not found"; return s; }
    if (slotTaken(s, a.dentistId, date, time, id)) { error = "That time is already booked for this dentist."; return s; }
    error = null;
    return withAudit({
      ...s,
      appointments: s.appointments.map((x) => x.id === id ? { ...x, date, time, rescheduleRequested: false } : x),
    }, `Rescheduled ${id} to ${date} ${time}`);
  });
  return error;
}

export function requestReschedule(id: string) {
  update((s) => {
    const a = s.appointments.find((x) => x.id === id);
    if (!a) return s;
    return withAudit({
      ...s,
      appointments: s.appointments.map((x) => x.id === id ? { ...x, rescheduleRequested: true } : x),
      messages: [{ id: uid("M"), patientId: a.patientId, channel: "Email", template: "Reschedule request", body: `Reschedule requested for ${a.date} at ${a.time}. Reception can see this on the appointment. Simulated.`, status: "Simulated", date: today() }, ...s.messages],
    }, `Reschedule requested for ${id}`);
  });
}

export function recordTooth(patientId: string, fdi: number, record: ToothRecord) {
  update((s) => withAudit({
    ...s,
    patients: s.patients.map((p) => p.id === patientId ? { ...p, chart: { ...p.chart, [fdi]: record } } : p),
  }, `Tooth ${fdi} recorded as ${record.condition} for ${patientId}`));
}

export function addNote(patientId: string, text: string, author: string) {
  update((s) => withAudit({
    ...s,
    patients: s.patients.map((p) => p.id === patientId ? { ...p, notes: [{ date: today(), text, author }, ...p.notes] } : p),
  }, `Clinical note added for ${patientId}`));
}

export function addPrescription(patientId: string, drug: string, dose: string) {
  update((s) => withAudit({
    ...s,
    patients: s.patients.map((p) => p.id === patientId ? { ...p, prescriptions: [{ id: uid("RX"), drug, dose, date: today() }, ...p.prescriptions] } : p),
  }, `Prescription recorded for ${patientId}`));
}

export function addDocument(patientId: string, name: string, kind: string) {
  update((s) => withAudit({
    ...s,
    patients: s.patients.map((p) => p.id === patientId ? { ...p, documents: [{ id: uid("DOC"), name, kind, date: today() }, ...p.documents] } : p),
  }, `Document metadata stored for ${patientId}`));
}

export function setComms(patientId: string, comms: Patient["comms"]) {
  update((s) => ({ ...s, patients: s.patients.map((p) => p.id === patientId ? { ...p, comms } : p) }));
}

export function addPlanItem(patientId: string, item: PlanItem) {
  update((s) => {
    const ex = s.plans.find((t) => t.patientId === patientId);
    const plans = ex
      ? s.plans.map((t) => t.id === ex.id ? { ...t, items: [...t.items, item], history: [...t.history, { at: today(), action: `Added ${item.procedure}` }] } : t)
      : [...s.plans, { id: uid("TP"), patientId, created: today(), items: [item], history: [{ at: today(), action: "Plan created" }] }];
    return withAudit({ ...s, plans }, `Treatment item added for ${patientId}`);
  });
}

export function setPlanStatus(planId: string, index: number, status: PlanStatus) {
  update((s) => ({
    ...s,
    plans: s.plans.map((t) => t.id !== planId ? t : {
      ...t,
      items: t.items.map((it, i) => i === index ? { ...it, status } : it),
      history: [...t.history, { at: today(), action: `Item ${index + 1} marked ${status}` }],
    }),
  }));
}

export function createInvoice(patientId: string, items: { label: string; amount: number }[], discount = 0) {
  const id = uid("INV");
  update((s) => {
    const p = s.patients.find((x) => x.id === patientId);
    return withAudit({
      ...s,
      invoices: [...s.invoices, { id, patientId, date: today(), branchId: p?.branchId ?? "bayview", items, discount, payments: [] }],
    }, `Invoice ${id} created`);
  });
  return id;
}

export function recordPayment(invoiceId: string, amount: number, method: string): string | null {
  let error: string | null = null;
  update((s) => {
    const inv = s.invoices.find((i) => i.id === invoiceId);
    if (!inv) { error = "Invoice not found"; return s; }
    const bal = invoiceBalance(inv);
    if (!(amount > 0) || amount > bal + 0.001) { error = "Enter an amount up to the balance due"; return s; }
    error = null;
    return withAudit({
      ...s,
      invoices: s.invoices.map((i) => i.id === invoiceId ? { ...i, payments: [...i.payments, { date: today(), amount, method }] } : i),
    }, `Payment of ${amount} via ${method} on ${invoiceId}`);
  });
  return error;
}

export function recordRefund(invoiceId: string, amount: number): string | null {
  let error: string | null = null;
  update((s) => {
    const inv = s.invoices.find((i) => i.id === invoiceId);
    if (!inv) { error = "Invoice not found"; return s; }
    const paid = invoicePaid(inv);
    if (!(amount > 0) || amount > paid + 0.001) { error = "Refund cannot exceed what has been paid"; return s; }
    error = null;
    return withAudit({
      ...s,
      invoices: s.invoices.map((i) => i.id === invoiceId ? { ...i, payments: [...i.payments, { date: today(), amount: -amount, method: "Refund" }] } : i),
    }, `Refund of ${amount} on ${invoiceId}`);
  });
  return error;
}

export function adjustStock(id: string, qty: number) {
  update((s) => withAudit({
    ...s,
    inventory: s.inventory.map((i) => i.id === id ? { ...i, qty: Math.max(0, qty) } : i),
  }, `Stock ${id} set to ${qty}`));
}

export function addStockItem(item: Omit<StockItem, "id">) {
  update((s) => withAudit({ ...s, inventory: [...s.inventory, { ...item, id: uid("ST") }] }, `Stock item ${item.name} added`));
}

export function updateTemplate(id: string, body: string) {
  update((s) => ({ ...s, templates: s.templates.map((t) => t.id === id ? { ...t, body } : t) }));
}

export function sendSimulated(input: { patientId: string; channel: Message["channel"]; template: string; body: string }): string | null {
  let error: string | null = null;
  update((s) => {
    const p = s.patients.find((x) => x.id === input.patientId);
    if (!p) { error = "Patient not found"; return s; }
    const allowed = input.channel === "Email" ? p.comms.email : input.channel === "SMS" ? p.comms.sms : p.comms.whatsapp;
    if (!allowed) { error = `${p.name} has opted out of ${input.channel}`; return s; }
    error = null;
    return withAudit({
      ...s,
      messages: [{ id: uid("M"), ...input, status: "Simulated", date: today() }, ...s.messages],
    }, `Simulated ${input.channel} to ${p.name}`);
  });
  return error;
}

export function setSettings(patch: Partial<Omit<Settings, "integrations">> & { integrations?: Partial<Settings["integrations"]> }) {
  update((s) => ({
    ...s,
    settings: { ...s.settings, ...patch, integrations: { ...s.settings.integrations, ...patch.integrations } },
  }));
}

export function setAttendance(staffId: string, status: AttendanceMark["status"]) {
  const date = today();
  update((s) => ({ ...s, attendance: [...s.attendance.filter((a) => !(a.staffId === staffId && a.date === date)), { staffId, date, status }] }));
}

export function addFeedback(patientId: string, text: string) {
  update((s) => withAudit({
    ...s,
    messages: [{ id: uid("M"), patientId, channel: "Email", template: "Feedback", body: text, status: "Simulated", date: today() }, ...s.messages],
  }, `Feedback from ${patientId}`));
}

export function mergePatients(keepId: string, dropId: string): string | null {
  if (keepId === dropId) return "Choose two different records";
  let error: string | null = null;
  update((s) => {
    const keep = s.patients.find((p) => p.id === keepId);
    const drop = s.patients.find((p) => p.id === dropId);
    if (!keep || !drop) { error = "Both records must exist"; return s; }
    error = null;
    return withAudit({
      ...s,
      patients: s.patients.filter((p) => p.id !== dropId).map((p) => p.id === keepId ? {
        ...p,
        notes: [...drop.notes, ...p.notes],
        chart: { ...drop.chart, ...p.chart },
        prescriptions: [...drop.prescriptions, ...p.prescriptions],
        documents: [...drop.documents, ...p.documents],
      } : p),
      appointments: s.appointments.map((a) => a.patientId === dropId ? { ...a, patientId: keepId } : a),
      plans: s.plans.map((t) => t.patientId === dropId ? { ...t, patientId: keepId } : t),
      invoices: s.invoices.map((i) => i.patientId === dropId ? { ...i, patientId: keepId } : i),
      messages: s.messages.map((m) => m.patientId === dropId ? { ...m, patientId: keepId } : m),
    }, `Merged patient ${dropId} into ${keepId}`);
  });
  return error;
}

export function registerPatient(input: Omit<Patient, "id" | "registered" | "chart" | "notes" | "prescriptions" | "documents" | "consent" | "comms"> & { consent?: boolean }): { id?: string; error?: string } {
  let id = "";
  let error = "";
  update((s) => {
    if (s.patients.some((p) => p.email.toLowerCase() === input.email.toLowerCase())) {
      error = "A patient with this email already exists";
      return s;
    }
    id = uid("P");
    const patient = normalizePatient({
      ...input, id, registered: today(), consent: input.consent ?? true,
      comms: { email: true, sms: false, whatsapp: true }, chart: {}, notes: [], prescriptions: [], documents: [],
    });
    return withAudit({ ...s, patients: [...s.patients, patient] }, `Registered patient ${input.name}`);
  });
  return error ? { error } : { id };
}

export { today, addDays };
