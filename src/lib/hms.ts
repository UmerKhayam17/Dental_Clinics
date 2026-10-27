import { useEffect, useState } from "react";
import { DENTISTS, STAFF } from "@/lib/data";
import { uid } from "@/lib/store";

export type Department = {
  id: string;
  name: string;
  description: string;
  location: string;
  status: "active" | "inactive";
  services: string;
  ward: string;
};

export type OpdVisit = {
  id: string;
  mrn: string;
  name: string;
  phone: string;
  cnic: string;
  gender: string;
  age: string;
  dob: string;
  address: string;
  blood: string;
  marital: string;
  guardianRelation: string;
  guardianName: string;
  guardianPhone: string;
  doctorId: string;
  purpose: string;
  disease: string;
  doctorFee: number;
  discount: number;
  amountPaid: number;
  paymentMethod: string;
  paymentNotes: string;
  verbalConsent: boolean;
  token: string;
  referredBy: string;
  date: string;
  deleted: boolean;
};

export type ClinicProcedure = {
  id: string;
  category: string;
  mrn: string;
  patientName: string;
  contact: string;
  age: string;
  gender: string;
  address: string;
  external: boolean;
  doctorId: string;
  token: string;
  name: string;
  description: string;
  date: string;
  duration: number;
  price: number;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  notes: string;
  amountPaid: number;
  paymentMethod: string;
  deleted: boolean;
};

export type PosVariant = {
  id: string;
  size: string;
  color: string;
  barcode: string;
  stock: number;
  buy: number;
  sell: number;
};

export type PosProduct = {
  id: string;
  name: string;
  category: string;
  brand: string;
  description: string;
  discount: number;
  active: boolean;
  variants: PosVariant[];
};

export type PosLine = {
  productId: string;
  variantId: string;
  name: string;
  size: string;
  color: string;
  barcode: string;
  qty: number;
  price: number;
  discount: number;
};

export type PosBill = {
  id: string;
  lines: PosLine[];
  customerName: string;
  customerContact: string;
  paymentMethod: string;
  status: "paid" | "held";
  date: string;
  total: number;
};

export type OpdRefund = {
  id: string;
  visitId: string;
  mrn: string;
  patientName: string;
  originalAmount: number;
  refundAmount: number;
  reason: string;
  description: string;
  originalMethod: string;
  refundMethod: string;
  status: "pending" | "approved" | "processed" | "rejected" | "cancelled";
  date: string;
};

export type ClinicExpense = {
  id: string;
  kind: "doctor" | "hospital";
  doctor: string;
  welfare: number;
  ot: number;
  other: number;
  description: string;
  date: string;
  deleted: boolean;
};

export type DeskDoctor = {
  id: string;
  name: string;
  department: string;
  type: string;
  specialization: string;
  qualifications: string;
  license: string;
  fee: number;
  doctorPercent: number;
  hospitalPercent: number;
  contractTime: string;
  joiningDate: string;
  deleted: boolean;
};

export type DeskStaff = {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  designation: string;
  department: string;
  qualifications: string;
  joiningDate: string;
  shift: string;
  shiftStart: string;
  shiftEnd: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
  cnic: string;
  password: string;
  address: string;
  accessRole: string;
  active: boolean;
  deleted: boolean;
};

export type ClinicalReport = {
  id: string;
  patientName: string;
  title: string;
  body: string;
  author: string;
  date: string;
};

export type HmsState = {
  departments: Department[];
  visits: OpdVisit[];
  procedures: ClinicProcedure[];
  categories: string[];
  products: PosProduct[];
  bills: PosBill[];
  refunds: OpdRefund[];
  expenses: ClinicExpense[];
  doctors: DeskDoctor[];
  staff: DeskStaff[];
  reports: ClinicalReport[];
};

const KEY = "lumiere-hms-v1";
const day = () => new Date().toISOString().slice(0, 10);
const shift = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export const payState = (paid: number, total: number) => {
  if (paid <= 0) return "pending" as const;
  if (paid + 0.001 >= total) return "paid" as const;
  return "partial" as const;
};

export const visitTotal = (v: OpdVisit) => Math.max(0, Math.round((v.doctorFee - v.discount) * 100) / 100);
export const lineTotal = (l: PosLine) => Math.max(0, Math.round((l.price - l.discount) * l.qty * 100) / 100);
export const billTotal = (lines: PosLine[]) => Math.round(lines.reduce((a, l) => a + lineTotal(l), 0) * 100) / 100;
export const expenseTotal = (e: Pick<ClinicExpense, "welfare" | "ot" | "other">) => Math.round((e.welfare + e.ot + e.other) * 100) / 100;

export function refundedFor(s: HmsState, visitId: string) {
  return s.refunds
    .filter((r) => r.visitId === visitId && r.status !== "rejected" && r.status !== "cancelled")
    .reduce((a, r) => a + r.refundAmount, 0);
}

function seed(): HmsState {
  const doctors: DeskDoctor[] = DENTISTS.map((d) => ({
    id: d.id,
    name: d.name,
    department: d.id === "d3" ? "Orthodontics" : "Dentistry",
    type: d.title,
    specialization: d.specialties[0] ?? "General Dentistry",
    qualifications: d.qualifications,
    license: d.id === "d1" ? "DDS-44120" : d.id === "d2" ? "BDS-22811" : "DMD-90334",
    fee: d.id === "d2" ? 180 : d.id === "d3" ? 150 : 120,
    doctorPercent: 70,
    hospitalPercent: 30,
    contractTime: "Weekdays",
    joiningDate: d.id === "d1" ? "2014-03-01" : d.id === "d2" ? "2018-06-12" : "2020-01-20",
    deleted: false,
  }));
  const staff: DeskStaff[] = STAFF.map((p, i) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    phone: `+1 (555) 014-23${10 + i}`,
    gender: i % 2 ? "Male" : "Female",
    dob: "1992-05-14",
    designation: p.role,
    department: p.role === "Accountant" ? "Accounts" : "Reception",
    qualifications: p.role === "Accountant" ? "Bookkeeping certificate" : "Front-desk training",
    joiningDate: "2022-04-04",
    shift: i === 1 ? "Evening" : "Morning",
    shiftStart: i === 1 ? "13:00" : "08:00",
    shiftEnd: i === 1 ? "20:00" : "16:00",
    emergencyName: "Family contact",
    emergencyRelation: "Sibling",
    emergencyPhone: "+1 (555) 010-1000",
    cnic: "",
    password: "",
    address: "",
    accessRole: p.role,
    active: true,
    deleted: false,
  }));
  return {
    departments: [
      { id: "DEP-1", name: "Dentistry", description: "Examinations, restorative care, and emergencies.", location: "Bayview, first floor", status: "active", services: "Exam, filling, crown, emergency", ward: "Chair 1–4" },
      { id: "DEP-2", name: "Orthodontics", description: "Aligners, braces, and children’s visits.", location: "Riverside", status: "active", services: "Aligners, braces, pediatric exam", ward: "Room 2" },
      { id: "DEP-3", name: "Dermatology", description: "Skin procedures booked beside the dental list.", location: "Bayview, side room", status: "active", services: "Skin review, minor procedure", ward: "Procedure room" },
      { id: "DEP-4", name: "Ophthalmology", description: "Eye procedures kept on the same desk for this demonstration.", location: "Bayview, side room", status: "inactive", services: "Eye review", ward: "Procedure room" },
    ],
    visits: [
      {
        id: "V-1", mrn: "MR-1001", name: "Olivia Bennett", phone: "+1 (555) 210-010", cnic: "4210112345671",
        gender: "female", age: "42", dob: "1984-04-12", address: "12 Example Street", blood: "A+", marital: "married",
        guardianRelation: "Spouse", guardianName: "Evan Bennett", guardianPhone: "+1 (555) 210-090",
        doctorId: "d1", purpose: "Review of tooth 36", disease: "Occlusal caries", doctorFee: 120, discount: 0, amountPaid: 120,
        paymentMethod: "card", paymentNotes: "Paid at the desk", verbalConsent: true, token: "101", referredBy: "Website",
        date: day(), deleted: false,
      },
      {
        id: "V-2", mrn: "MR-1002", name: "Noah Patel", phone: "+1 (555) 210-011", cnic: "4210198765432",
        gender: "male", age: "34", dob: "1991-11-02", address: "13 Example Street", blood: "O+", marital: "single",
        guardianRelation: "", guardianName: "", guardianPhone: "",
        doctorId: "d2", purpose: "Root canal review", disease: "Pulpitis", doctorFee: 180, discount: 20, amountPaid: 80,
        paymentMethod: "cash", paymentNotes: "Balance still open", verbalConsent: true, token: "102", referredBy: "Referral",
        date: day(), deleted: false,
      },
    ],
    procedures: [
      {
        id: "PR-1", category: "Dental", mrn: "MR-1001", patientName: "Olivia Bennett", contact: "+1 (555) 210-010",
        age: "42", gender: "female", address: "12 Example Street", external: false, doctorId: "d1", token: "201",
        name: "Composite filling", description: "Tooth 36, occlusal", date: day(), duration: 45, price: 180,
        status: "scheduled", notes: "Verbal consent recorded on the OPD visit.", amountPaid: 0, paymentMethod: "cash", deleted: false,
      },
      {
        id: "PR-2", category: "Dermatology", mrn: "MR-EXT", patientName: "External visitor", contact: "+1 (555) 300-0101",
        age: "29", gender: "female", address: "Not a registered patient", external: true, doctorId: "d1", token: "202",
        name: "Skin review", description: "Demonstration row for the dermatology list.", date: shift(-1), duration: 20, price: 90,
        status: "completed", notes: "", amountPaid: 90, paymentMethod: "card", deleted: false,
      },
    ],
    categories: ["Dental", "Dermatology", "Ophthalmology"],
    products: [
      {
        id: "POS-1", name: "Soft toothbrush", category: "Home care", brand: "Lumière", description: "Desk sale item.", discount: 0, active: true,
        variants: [{ id: "PV-1", size: "Adult", color: "Ivory", barcode: "8901001", stock: 24, buy: 2, sell: 6 }],
      },
      {
        id: "POS-2", name: "Whitening pen", category: "Home care", brand: "Northline", description: "Take-home pen. Not a treatment.", discount: 1, active: true,
        variants: [{ id: "PV-2", size: "One", color: "White", barcode: "8901002", stock: 8, buy: 9, sell: 22 }],
      },
      {
        id: "POS-3", name: "Floss", category: "Home care", brand: "Harbour", description: "Waxed floss.", discount: 0, active: true,
        variants: [
          { id: "PV-3", size: "50m", color: "Mint", barcode: "8901003", stock: 15, buy: 1.2, sell: 4 },
          { id: "PV-4", size: "50m", color: "Plain", barcode: "8901004", stock: 4, buy: 1.2, sell: 4 },
        ],
      },
    ],
    bills: [
      {
        id: "BILL-1", status: "paid", date: day(), customerName: "Mia Chen", customerContact: "+1 (555) 210-014", paymentMethod: "card",
        lines: [{ productId: "POS-1", variantId: "PV-1", name: "Soft toothbrush", size: "Adult", color: "Ivory", barcode: "8901001", qty: 1, price: 6, discount: 0 }],
        total: 6,
      },
      {
        id: "BILL-2", status: "held", date: day(), customerName: "Walk-up", customerContact: "", paymentMethod: "cash",
        lines: [{ productId: "POS-3", variantId: "PV-3", name: "Floss", size: "50m", color: "Mint", barcode: "8901003", qty: 2, price: 4, discount: 0 }],
        total: 8,
      },
    ],
    refunds: [
      {
        id: "RF-1", visitId: "V-2", mrn: "MR-1002", patientName: "Noah Patel", originalAmount: 80, refundAmount: 20,
        reason: "Visit shortened", description: "Part of the consultation fee returned at the desk.", originalMethod: "cash",
        refundMethod: "cash", status: "processed", date: day(),
      },
    ],
    expenses: [
      { id: "CE-1", kind: "doctor", doctor: "Dr. Melissa Carter", welfare: 40, ot: 0, other: 15, description: "Welfare and a small supply top-up", date: shift(-2), deleted: false },
      { id: "CE-2", kind: "hospital", doctor: "", welfare: 0, ot: 120, other: 60, description: "Procedure-room supplies", date: shift(-1), deleted: false },
    ],
    doctors,
    staff,
    reports: [
      { id: "RPT-1", patientName: "Olivia Bennett", title: "Bitewing review", body: "Occlusal caries on 36 remains asymptomatic. Review before it reaches the dentine.", author: "Dr. Melissa Carter", date: shift(-2) },
    ],
  };
}

let state: HmsState | null = null;
const listeners = new Set<() => void>();

function load(): HmsState {
  if (state) return state;
  try {
    const raw = localStorage.getItem(KEY);
    state = raw ? { ...seed(), ...JSON.parse(raw) } : seed();
  } catch {
    state = seed();
  }
  return state!;
}

function commit(next: HmsState) {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore quota */ }
  listeners.forEach((l) => l());
}

function patch(fn: (s: HmsState) => HmsState) {
  commit(fn(load()));
}

export function resetHms() {
  commit(seed());
}

export function getHms() {
  return load();
}

const EMPTY: HmsState = {
  departments: [], visits: [], procedures: [], categories: [], products: [], bills: [],
  refunds: [], expenses: [], doctors: [], staff: [], reports: [],
};

export function useHms(): [HmsState, boolean] {
  const [s, setS] = useState<HmsState>(EMPTY);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setS(load());
    setReady(true);
    const listen = () => setS(load());
    listeners.add(listen);
    return () => { listeners.delete(listen); };
  }, []);
  return [s, ready];
}

export function activeDoctors(s: HmsState) {
  return s.doctors.filter((d) => !d.deleted);
}

export function doctorName(s: HmsState, id: string) {
  return s.doctors.find((d) => d.id === id)?.name ?? id;
}

export function saveDepartment(row: Omit<Department, "id"> & { id?: string }) {
  patch((s) => {
    if (row.id) return { ...s, departments: s.departments.map((d) => d.id === row.id ? { ...d, ...row, id: row.id } : d) };
    return { ...s, departments: [{ ...row, id: uid("DEP") }, ...s.departments] };
  });
}

export function removeDepartment(id: string) {
  patch((s) => ({ ...s, departments: s.departments.filter((d) => d.id !== id) }));
}

export function saveVisit(row: Omit<OpdVisit, "id" | "mrn" | "token" | "deleted"> & { id?: string }): string | null {
  const total = Math.max(0, row.doctorFee - row.discount);
  if (!row.name.trim()) return "Enter the patient name.";
  if (row.amountPaid < 0 || row.amountPaid > total + 0.001) return "Payment cannot be above the visit fee.";
  let id = row.id ?? "";
  patch((s) => {
    if (row.id) {
      const prev = s.visits.find((v) => v.id === row.id);
      if (!prev) return s;
      return { ...s, visits: s.visits.map((v) => v.id === row.id ? { ...prev, ...row, id: row.id, mrn: prev.mrn, token: prev.token, deleted: prev.deleted } : v) };
    }
    id = uid("V");
    const n = s.visits.length + 1001;
    const visit: OpdVisit = { ...row, id, mrn: `MR-${n}`, token: String(100 + s.visits.length + 1), deleted: false };
    return { ...s, visits: [visit, ...s.visits] };
  });
  return null;
}

export function removeVisit(id: string) {
  patch((s) => ({ ...s, visits: s.visits.map((v) => v.id === id ? { ...v, deleted: true } : v) }));
}

export function addCategory(name: string): string | null {
  const clean = name.trim();
  if (clean.length < 2) return "Name the category.";
  let error: string | null = null;
  patch((s) => {
    if (s.categories.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      error = "That category is already on the list.";
      return s;
    }
    return { ...s, categories: [...s.categories, clean] };
  });
  return error;
}

export function saveProcedure(row: Omit<ClinicProcedure, "id" | "token" | "deleted"> & { id?: string }): string | null {
  if (!row.patientName.trim() || !row.name.trim()) return "Patient and procedure name are required.";
  if (row.amountPaid < 0 || row.amountPaid > row.price + 0.001) return "Payment cannot be above the procedure price.";
  patch((s) => {
    if (row.id) {
      const prev = s.procedures.find((p) => p.id === row.id);
      if (!prev) return s;
      return { ...s, procedures: s.procedures.map((p) => p.id === row.id ? { ...prev, ...row, id: row.id, token: prev.token, deleted: prev.deleted } : p) };
    }
    const created: ClinicProcedure = { ...row, id: uid("PR"), token: String(300 + s.procedures.length + 1), deleted: false };
    return { ...s, procedures: [created, ...s.procedures] };
  });
  return null;
}

export function removeProcedure(id: string) {
  patch((s) => ({ ...s, procedures: s.procedures.map((p) => p.id === id ? { ...p, deleted: true } : p) }));
}

export function saveRefund(row: Omit<OpdRefund, "id" | "mrn" | "patientName" | "date" | "originalAmount"> & { id?: string }): string | null {
  let error: string | null = null;
  patch((s) => {
    const visit = s.visits.find((v) => v.id === row.visitId && !v.deleted);
    if (!visit) { error = "Choose a visit."; return s; }
    if (!row.reason.trim()) { error = "Say why the money is being returned."; return s; }
    if (row.refundAmount <= 0) { error = "Enter a refund amount."; return s; }
    const already = refundedFor(s, visit.id) - (row.id ? (s.refunds.find((r) => r.id === row.id)?.refundAmount ?? 0) : 0);
    const cap = visit.amountPaid - already;
    if (row.refundAmount > cap + 0.001) { error = `Only ${cap.toFixed(2)} can still be refunded on this visit.`; return s; }
    const next: OpdRefund = {
      ...row,
      id: row.id ?? uid("RF"),
      mrn: visit.mrn,
      patientName: visit.name,
      originalAmount: visit.amountPaid,
      date: row.id ? (s.refunds.find((r) => r.id === row.id)?.date ?? day()) : day(),
    };
    return { ...s, refunds: row.id ? s.refunds.map((r) => r.id === row.id ? next : r) : [next, ...s.refunds] };
  });
  return error;
}

export function setRefundStatus(id: string, status: OpdRefund["status"]) {
  patch((s) => ({ ...s, refunds: s.refunds.map((r) => r.id === id ? { ...r, status } : r) }));
}

export function saveExpense(row: Omit<ClinicExpense, "id" | "deleted"> & { id?: string }): string | null {
  if (row.kind === "doctor" && !row.doctor.trim()) return "Choose the doctor this expense belongs to.";
  if (expenseTotal(row) <= 0) return "Enter at least one amount.";
  patch((s) => {
    if (row.id) return { ...s, expenses: s.expenses.map((e) => e.id === row.id ? { ...e, ...row, id: row.id } : e) };
    return { ...s, expenses: [{ ...row, id: uid("CE"), deleted: false }, ...s.expenses] };
  });
  return null;
}

export function removeExpense(id: string) {
  patch((s) => ({ ...s, expenses: s.expenses.map((e) => e.id === id ? { ...e, deleted: true } : e) }));
}

export function saveProduct(row: Omit<PosProduct, "id"> & { id?: string }): string | null {
  if (!row.name.trim()) return "Name the product.";
  if (!row.variants.length || row.variants.some((v) => !v.barcode.trim())) return "Each variant needs a barcode.";
  let error: string | null = null;
  patch((s) => {
    const codes = s.products.flatMap((p) => p.id === row.id ? [] : p.variants.map((v) => v.barcode));
    if (row.variants.some((v) => codes.includes(v.barcode) || row.variants.filter((x) => x.barcode === v.barcode).length > 1)) {
      error = "Barcodes must be unique.";
      return s;
    }
    const product: PosProduct = { ...row, id: row.id ?? uid("POS"), variants: row.variants.map((v) => ({ ...v, id: v.id || uid("PV") })) };
    return { ...s, products: row.id ? s.products.map((p) => p.id === row.id ? product : p) : [product, ...s.products] };
  });
  return error;
}

export function removeProduct(id: string) {
  patch((s) => ({ ...s, products: s.products.map((p) => p.id === id ? { ...p, active: false } : p) }));
}

export function findVariant(s: HmsState, barcode: string) {
  for (const product of s.products) {
    if (!product.active) continue;
    const variant = product.variants.find((v) => v.barcode === barcode.trim());
    if (variant) return { product, variant };
  }
  return null;
}

function applyStock(products: PosProduct[], lines: PosLine[], dir: 1 | -1): { products: PosProduct[]; error?: string } {
  const next = products.map((p) => ({ ...p, variants: p.variants.map((v) => ({ ...v })) }));
  for (const line of lines) {
    const product = next.find((p) => p.id === line.productId);
    const variant = product?.variants.find((v) => v.id === line.variantId);
    if (!variant) return { products, error: "A product on this bill is no longer in stock." };
    if (dir < 0 && variant.stock < line.qty) return { products, error: `${line.name} only has ${variant.stock} left.` };
    variant.stock += dir * line.qty;
  }
  return { products: next };
}

export function saveBill(input: { lines: PosLine[]; customerName: string; customerContact: string; paymentMethod: string; hold: boolean; heldId?: string }): string | null {
  if (!input.lines.length) return "Add at least one item.";
  let error: string | null = null;
  patch((s) => {
    const held = input.heldId ? s.bills.find((b) => b.id === input.heldId) : undefined;
    if (input.hold) {
      const bill: PosBill = {
        id: held?.id ?? uid("BILL"),
        lines: input.lines,
        customerName: input.customerName,
        customerContact: input.customerContact,
        paymentMethod: input.paymentMethod,
        status: "held",
        date: day(),
        total: billTotal(input.lines),
      };
      return { ...s, bills: held ? s.bills.map((b) => b.id === held.id ? bill : b) : [bill, ...s.bills] };
    }
    const stock = applyStock(s.products, input.lines, -1);
    if (stock.error) { error = stock.error; return s; }
    const bill: PosBill = {
      id: held?.id ?? uid("BILL"),
      lines: input.lines,
      customerName: input.customerName,
      customerContact: input.customerContact,
      paymentMethod: input.paymentMethod,
      status: "paid",
      date: day(),
      total: billTotal(input.lines),
    };
    return { ...s, products: stock.products, bills: held ? s.bills.map((b) => b.id === held.id ? bill : b) : [bill, ...s.bills] };
  });
  return error;
}

export function saveDoctor(row: Omit<DeskDoctor, "id" | "deleted"> & { id?: string }): string | null {
  if (!row.name.trim()) return "Enter the doctor’s name.";
  if (row.doctorPercent + row.hospitalPercent !== 100) return "Doctor and studio percentages must add up to 100.";
  patch((s) => {
    if (row.id) return { ...s, doctors: s.doctors.map((d) => d.id === row.id ? { ...d, ...row, id: row.id, deleted: d.deleted } : d) };
    return { ...s, doctors: [{ ...row, id: uid("DR"), deleted: false }, ...s.doctors] };
  });
  return null;
}

export function removeDoctor(id: string) {
  patch((s) => ({ ...s, doctors: s.doctors.map((d) => d.id === id ? { ...d, deleted: true } : d) }));
}

export function saveStaffMember(row: Omit<DeskStaff, "id" | "deleted"> & { id?: string }): string | null {
  if (!row.name.trim() || !row.department.trim()) return "Name and department are required.";
  patch((s) => {
    if (row.id) return { ...s, staff: s.staff.map((p) => p.id === row.id ? { ...p, ...row, id: row.id, deleted: p.deleted } : p) };
    return { ...s, staff: [{ ...row, id: uid("STF"), deleted: false }, ...s.staff] };
  });
  return null;
}

export function removeStaffMember(id: string) {
  patch((s) => ({ ...s, staff: s.staff.map((p) => p.id === id ? { ...p, deleted: true } : p) }));
}

export function saveReport(row: Omit<ClinicalReport, "id" | "date">) {
  if (!row.patientName.trim() || !row.title.trim()) return "Patient and title are required.";
  patch((s) => ({ ...s, reports: [{ ...row, id: uid("RPT"), date: day() }, ...s.reports] }));
  return null;
}

export function printSheet(title: string, body: string) {
  const w = window.open("", "_blank", "noopener,width=820,height=900");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><title>${title}</title><style>
    body{font-family:Georgia,serif;color:#173D3B;padding:32px} h1{font-weight:normal;font-size:28px}
    table{width:100%;border-collapse:collapse;margin-top:16px} td,th{border-bottom:1px solid #ddd;padding:8px;text-align:left;font-size:14px}
    p{line-height:1.5} .kicker{letter-spacing:.2em;font-size:11px;text-transform:uppercase}
  </style></head><body><p class="kicker">Lumière Dental Studio · demonstration slip</p><h1>${title}</h1>${body}</body></html>`);
  w.document.close();
  w.focus();
  w.print();
}
