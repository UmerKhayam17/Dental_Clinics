import { beforeEach, describe, expect, it } from "vitest";
import { bookAppointment, getState, invoiceBalance, mergePatients, resetDemo, slotTaken } from "@/lib/store";

describe("clinic records", () => {
  beforeEach(() => resetDemo());

  it("refuses a second booking in the same dentist slot", () => {
    const input = {
      name: "Test Patient", email: "test.patient@example.demo", phone: "5551234567",
      treatment: "Teeth Cleaning", dentistId: "d1", date: "2026-11-02", time: "09:00", branchId: "bayview",
    };
    expect(bookAppointment(input)).toBeTruthy();
    expect(bookAppointment({ ...input, name: "Other Person", email: "other.person@example.demo" })).toBeNull();
    expect(slotTaken(getState(), "d1", "2026-11-02", "09:00")).toBe(true);
  });

  it("keeps a website booking on the patient, the book, and the lead list", () => {
    bookAppointment({
      name: "Website Guest", email: "guest@example.demo", phone: "5559876543",
      treatment: "General Dentistry", dentistId: "d2", date: "2026-11-03", time: "10:30",
    });
    const s = getState();
    const patient = s.patients.find((p) => p.email === "guest@example.demo");
    expect(patient).toBeTruthy();
    expect(s.appointments.some((a) => a.patientId === patient?.id && a.status === "Requested")).toBe(true);
    expect(s.leads.some((l) => l.email === "guest@example.demo" && l.status === "Booked")).toBe(true);
    expect(s.messages.some((m) => m.patientId === patient?.id)).toBe(true);
  });

  it("moves appointments when two records are merged", () => {
    const before = getState().appointments.filter((a) => a.patientId === "P-102").length;
    expect(mergePatients("P-101", "P-102")).toBeNull();
    const s = getState();
    expect(s.patients.some((p) => p.id === "P-102")).toBe(false);
    expect(s.appointments.filter((a) => a.patientId === "P-101").length).toBeGreaterThan(before);
  });

  it("leaves a part-paid invoice with a balance", () => {
    const inv = getState().invoices.find((i) => i.id === "INV-3002");
    expect(inv).toBeTruthy();
    expect(invoiceBalance(inv!)).toBeGreaterThan(0);
  });
});
