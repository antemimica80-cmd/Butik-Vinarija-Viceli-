import { z } from "zod";

/** Shared between the client form (React Hook Form) and the server action. Messages are i18n keys. */
export const inquirySchema = z
  .object({
    wineryId: z.number().int().positive(),
    experienceId: z.number().int().positive().nullable(),
    preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date").or(z.literal("")),
    preferredTime: z.enum(["any", "morning", "midday", "afternoon", "evening"]),
    flexible: z.boolean(),
    adults: z.number({ message: "adults" }).int().min(1, "adults").max(200, "adults"),
    children: z.number().int().min(0).max(100),
    language: z.string().max(5),
    fullName: z.string().trim().min(2, "name").max(120, "name"),
    email: z.string().trim().max(200).email("email"),
    phone: z.string().trim().max(40).optional().or(z.literal("")),
    country: z.string().trim().max(80).optional().or(z.literal("")),
    message: z.string().max(2000, "message").optional().or(z.literal("")),
    consent: z.boolean().refine((v) => v === true, "privacy"),
    marketing: z.boolean(),
    idempotencyKey: z.string().uuid(),
    formToken: z.string().max(200),
    website: z.string().max(0).optional().or(z.literal("")), // honeypot: must stay empty
  })
  .refine((d) => d.flexible || d.preferredDate !== "", { path: ["preferredDate"], message: "date" });

export type InquiryInput = z.infer<typeof inquirySchema>;

export const reportSchema = z.object({
  wineryId: z.number().int().positive(),
  field: z.enum(["general", "contact", "location", "wines", "awards", "visits"]),
  message: z.string().trim().min(5).max(3000),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  formToken: z.string().max(200),
  website: z.string().max(0).optional().or(z.literal("")),
});

export const claimSchema = z.object({
  wineryId: z.number().int().positive().nullable(),
  proposedName: z.string().trim().max(160).optional().or(z.literal("")),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  position: z.string().trim().max(120).optional().or(z.literal("")),
  evidence: z.string().trim().min(10).max(4000),
  formToken: z.string().max(200),
  website: z.string().max(0).optional().or(z.literal("")),
}).refine((d) => d.wineryId != null || (d.proposedName && d.proposedName.length >= 2), { path: ["proposedName"], message: "required" });

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(5).max(5000),
  formToken: z.string().max(200),
  website: z.string().max(0).optional().or(z.literal("")),
});
