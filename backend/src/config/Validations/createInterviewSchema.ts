import { z } from "zod";

export const createInterviewSchema = z.object({
  body: z.object({
    title: z.string().min(3),

    domain: z.enum([
      "TECH",
      "MARKETING",
      "LAW",
      "COMMERCE",
      "SOCIAL_SCIENCE",
      "HR",
    ]),

    role: z.string().min(2),

    experience: z.coerce.number().min(0).max(40),

    durationMinutes: z.coerce.number().min(5).max(180),

    interviewType:z.string(),

    
  }),
});