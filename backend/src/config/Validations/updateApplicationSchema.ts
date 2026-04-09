import { z } from "zod";


export const updateApplicationSchema = z.object({
 
  body: z.object({
    company: z.string().min(1).optional(),
    role: z.string().min(1).optional(),
    link: z.string().url().optional(),
    source: z.string().optional(),
    status: z.enum([
      "APPLIED",
      "SHORTLISTED",
      "INTERVIEW",
      "REJECTED",
      "OFFER",
    ]).optional(),
    location:z.string().optional(),
    salary:z.string().optional()
  }),
});