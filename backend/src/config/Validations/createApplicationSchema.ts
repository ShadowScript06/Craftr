import { z } from "zod";

export const createApplicationSchema = z.object({
  body: z.object({
    companyName: z.string().min(1, "Company name is required"),
    role: z.string().min(1, "Role is required"),
    link: z.string().optional(),
    source: z.string().optional(),
    status: z.enum([
      "APPLIED",
      "SHORTLISTED",
      "INTERVIEW",
      "REJECTED",
      "OFFER",
    ]).optional(),
  }),
});