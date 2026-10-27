import { z } from "zod";

const phone = (message: string) =>
  z.string().refine((v) => v.replace(/\D/g, "").length >= 7, message);

export const bookingSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  email: z.string().trim().email("Please enter a valid email"),
  phone: phone("Please enter a valid phone number"),
  time: z.string().min(1, "Please choose a time"),
  notes: z.string(),
});

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  email: z.string().trim().email("Please enter a valid email"),
  message: z.string().trim().min(5, "Please write a short message"),
});

export const patientSchema = z.object({
  name: z.string().trim().min(2, "Full name is required"),
  dob: z.string(),
  gender: z.string(),
  phone: phone("A valid phone number is required"),
  email: z.string().trim().email("A valid email is required"),
  address: z.string(),
  emergency: z.string(),
  allergies: z.string(),
  medicalAlerts: z.string(),
  history: z.string(),
  branchId: z.string().min(1),
  preferredDentist: z.string().min(1),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
